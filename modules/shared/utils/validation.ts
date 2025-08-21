/**
 * Shared Validation Utilities
 * Common validation functions used across modules
 */

import { ValidationError } from '../types/CommonTypes'

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationError[] {
    const errors: ValidationError[] = []

    if (password.length < 12) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 12 characters long',
        code: 'MIN_LENGTH'
      })
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter',
        code: 'UPPERCASE_REQUIRED'
      })
    }

    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter',
        code: 'LOWERCASE_REQUIRED'
      })
    }

    if (!/\d/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number',
        code: 'NUMBER_REQUIRED'
      })
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character',
        code: 'SPECIAL_CHAR_REQUIRED'
      })
    }

    return errors
  }

  /**
   * Validate required field
   */
  static validateRequired(value: any, fieldName: string): ValidationError | null {
    if (value === null || value === undefined || value === '') {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        code: 'REQUIRED'
      }
    }
    return null
  }

  /**
   * Validate string length
   */
  static validateLength(
    value: string, 
    fieldName: string, 
    min?: number, 
    max?: number
  ): ValidationError[] {
    const errors: ValidationError[] = []

    if (min && value.length < min) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${min} characters`,
        code: 'MIN_LENGTH'
      })
    }

    if (max && value.length > max) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must not exceed ${max} characters`,
        code: 'MAX_LENGTH'
      })
    }

    return errors
  }

  /**
   * Validate healthcare-specific fields
   */
  static validateHealthcareId(id: string, fieldName: string = 'Healthcare ID'): ValidationError | null {
    // Healthcare IDs should be alphanumeric and specific length
    const healthcareIdRegex = /^[A-Z0-9]{6,12}$/
    
    if (!healthcareIdRegex.test(id)) {
      return {
        field: 'healthcareId',
        message: `${fieldName} must be 6-12 alphanumeric characters`,
        code: 'INVALID_FORMAT'
      }
    }

    return null
  }

  /**
   * Validate date format and range
   */
  static validateDate(
    dateStr: string, 
    fieldName: string,
    minDate?: Date,
    maxDate?: Date
  ): ValidationError[] {
    const errors: ValidationError[] = []
    
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be a valid date`,
        code: 'INVALID_DATE'
      })
      return errors
    }

    if (minDate && date < minDate) {
      errors.push({
        field: fieldName,
        message: `${fieldName} cannot be earlier than ${minDate.toDateString()}`,
        code: 'DATE_TOO_EARLY'
      })
    }

    if (maxDate && date > maxDate) {
      errors.push({
        field: fieldName,
        message: `${fieldName} cannot be later than ${maxDate.toDateString()}`,
        code: 'DATE_TOO_LATE'
      })
    }

    return errors
  }

  /**
   * Sanitize input for XSS prevention
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Check if string contains PHI (Protected Health Information)
   */
  static containsPHI(text: string): boolean {
    // Simple patterns that might indicate PHI
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{9}\b/, // 9-digit ID numbers
      /\b(DOB|Date of Birth|Born)\b/i, // Date of birth references
      /\b(diagnosis|condition|treatment|medication)\b/i, // Medical terms
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/, // Date patterns
    ]

    return phiPatterns.some(pattern => pattern.test(text))
  }

  /**
   * Validate form data against schema
   */
  static validateForm<T extends Record<string, any>>(
    data: T,
    schema: Record<keyof T, (value: any) => ValidationError[]>
  ): ValidationError[] {
    const errors: ValidationError[] = []

    for (const [field, validator] of Object.entries(schema)) {
      const fieldErrors = validator(data[field])
      errors.push(...fieldErrors)
    }

    return errors
  }
}