/**
 * HIPAA-Compliant PHI Encryption Library
 * Marcus Reed - Emergency Security Implementation
 * Provides AES-256-GCM encryption for Protected Health Information
 */

import { webcrypto } from 'crypto';

interface PHIData {
  due_date?: string;
  birth_preferences?: string;
  insurance_provider?: string;
  medical_conditions?: string;
  emergency_contacts?: string;
  [key: string]: any;
}

interface EncryptedPHI {
  data: string;
  iv: string;
  tag: string;
  timestamp: string;
  phi_fields: string[];
}

class PHIEncryption {
  private static readonly PHI_FIELDS = [
    'due_date',
    'birth_preferences', 
    'insurance_provider',
    'medical_conditions',
    'emergency_contacts',
    'health_conditions',
    'medications',
    'allergies',
    'medical_history'
  ];

  /**
   * Generate encryption key from environment secret
   */
  private static async getEncryptionKey(): Promise<CryptoKey> {
    const secret = process.env.PHI_ENCRYPTION_KEY || 'emergency-dev-key-change-in-production-32chars';
    const encoder = new TextEncoder();
    const keyMaterial = await webcrypto.subtle.importKey(
      'raw',
      encoder.encode(secret.padEnd(32, '0').slice(0, 32)),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await webcrypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('snug-kisses-phi-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Identify PHI fields in data object
   */
  private static identifyPHIFields(data: any): string[] {
    const phiFound: string[] = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'string' && value.trim().length > 0) {
        if (this.PHI_FIELDS.includes(key.toLowerCase()) || 
            key.toLowerCase().includes('medical') ||
            key.toLowerCase().includes('health') ||
            key.toLowerCase().includes('due') ||
            key.toLowerCase().includes('birth')) {
          phiFound.push(key);
        }
      }
    }
    
    return phiFound;
  }

  /**
   * Encrypt PHI data with AES-256-GCM
   */
  static async encryptPHI(data: PHIData): Promise<EncryptedPHI> {
    try {
      const phiFields = this.identifyPHIFields(data);
      
      if (phiFields.length === 0) {
        throw new Error('No PHI fields identified for encryption');
      }

      const key = await this.getEncryptionKey();
      const iv = webcrypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      
      const encrypted = await webcrypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(JSON.stringify(data))
      );

      const encryptedArray = new Uint8Array(encrypted);
      const tag = encryptedArray.slice(-16);
      const ciphertext = encryptedArray.slice(0, -16);

      return {
        data: Buffer.from(ciphertext).toString('base64'),
        iv: Buffer.from(iv).toString('base64'),
        tag: Buffer.from(tag).toString('base64'),
        timestamp: new Date().toISOString(),
        phi_fields: phiFields
      };
    } catch (error) {
      console.error('PHI encryption failed:', error);
      throw new Error('Failed to encrypt PHI data');
    }
  }

  /**
   * Decrypt PHI data
   */
  static async decryptPHI(encryptedData: EncryptedPHI): Promise<PHIData> {
    try {
      const key = await this.getEncryptionKey();
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const tag = Buffer.from(encryptedData.tag, 'base64');
      const ciphertext = Buffer.from(encryptedData.data, 'base64');
      
      const encrypted = new Uint8Array([...ciphertext, ...tag]);
      
      const decrypted = await webcrypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (error) {
      console.error('PHI decryption failed:', error);
      throw new Error('Failed to decrypt PHI data');
    }
  }

  /**
   * Mask PHI for display purposes
   */
  static maskPHI(value: string, type: 'date' | 'text' | 'insurance'): string {
    if (!value || value.trim().length === 0) return '[Not provided]';
    
    switch (type) {
      case 'date':
        // Show only month/year for due dates
        const date = new Date(value);
        if (isNaN(date.getTime())) return '[Date provided]';
        return `${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        
      case 'insurance':
        // Show only first few characters
        return value.length > 3 ? `${value.substring(0, 3)}***` : '[Insurance provided]';
        
      case 'text':
      default:
        // Generic masking for birth preferences etc
        return value.length > 10 ? '[Preferences provided]' : '[Information provided]';
    }
  }

  /**
   * Sanitize data for email templates (remove all PHI)
   */
  static sanitizeForEmail(data: any): any {
    const sanitized = { ...data };
    const phiFields = this.identifyPHIFields(data);
    
    for (const field of phiFields) {
      if (sanitized[field]) {
        // Replace with masked version
        if (field.toLowerCase().includes('due')) {
          sanitized[field] = this.maskPHI(sanitized[field], 'date');
        } else if (field.toLowerCase().includes('insurance')) {
          sanitized[field] = this.maskPHI(sanitized[field], 'insurance');
        } else {
          sanitized[field] = this.maskPHI(sanitized[field], 'text');
        }
      }
    }
    
    return sanitized;
  }

  /**
   * Verify PHI consent before processing
   */
  static verifyPHIConsent(clientData: any, purpose: string): boolean {
    // Check for explicit PHI consent
    if (!clientData.phi_consent_verified) {
      console.warn(`PHI access attempted without consent for purpose: ${purpose}`);
      return false;
    }
    
    // Check consent timestamp (must be within last 12 months for ongoing care)
    if (clientData.phi_consent_date) {
      const consentDate = new Date(clientData.phi_consent_date);
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
      
      if (consentDate < twelveMonthsAgo) {
        console.warn(`PHI consent expired for purpose: ${purpose}`);
        return false;
      }
    }
    
    return true;
  }
}

export default PHIEncryption;

// Export individual functions for easier imports
export const {
  encryptPHI,
  decryptPHI,
  maskPHI,
  sanitizeForEmail,
  verifyPHIConsent
} = PHIEncryption;