/**
 * Zoho Authentication Service
 * Handles authentication with Zoho CRM and user validation
 */

import { LoginCredentials, AuthResponse, User, UserRole, UserStatus } from '../types/AuthTypes'

export class ZohoAuthService {
  private readonly clientId = '1000.YWW9X2SXPRD5O0EEYXPSCGD95OVDOH'
  private readonly clientSecret = '9a60ae55c93dcc6a633a3cb6ec594b4f83b293ce41'
  private readonly apiBase = 'https://www.zohoapis.com'

  /**
   * Authenticate user with Zoho CRM
   */
  async authenticate(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Check if user exists in CRM
      const crmUser = await this.findUserInCRM(credentials.email)
      if (!crmUser) {
        return {
          success: false,
          message: 'User not found in healthcare system'
        }
      }

      // Validate user credentials (simplified for demo)
      const isValid = await this.validateUserCredentials(credentials, crmUser)
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid credentials'
        }
      }

      // Create user object from CRM data
      const user = this.mapCRMUserToUser(crmUser)

      return {
        success: true,
        user,
        message: 'Authentication successful'
      }

    } catch (error) {
      console.error('Zoho authentication error:', error)
      return {
        success: false,
        message: 'Authentication service temporarily unavailable'
      }
    }
  }

  /**
   * Find user in Zoho CRM
   */
  private async findUserInCRM(email: string): Promise<any> {
    try {
      // Get access token for CRM API
      const accessToken = await this.getCRMAccessToken()
      if (!accessToken) {
        throw new Error('Failed to get CRM access token')
      }

      // Search for contact by email
      const response = await fetch(
        `${this.apiBase}/crm/v8/Contacts/search?criteria=(Email:equals:${encodeURIComponent(email)})`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        console.error('CRM search failed:', response.status, await response.text())
        return null
      }

      const data = await response.json()
      
      if (data.data && data.data.length > 0) {
        return data.data[0] // Return first matching contact
      }

      return null

    } catch (error) {
      console.error('CRM user search error:', error)
      return null
    }
  }

  /**
   * Get CRM access token using client credentials
   */
  private async getCRMAccessToken(): Promise<string | null> {
    try {
      // In a real implementation, you would:
      // 1. Use stored refresh token
      // 2. Or implement OAuth flow
      // 3. Or use server-to-server authentication
      
      // For now, return a placeholder
      // This should be replaced with actual Zoho OAuth implementation
      console.log('🔑 Using Zoho Client ID:', this.clientId)
      
      // Placeholder token - replace with actual OAuth implementation
      return 'demo_access_token'

    } catch (error) {
      console.error('Failed to get CRM access token:', error)
      return null
    }
  }

  /**
   * Validate user credentials
   */
  private async validateUserCredentials(
    credentials: LoginCredentials, 
    crmUser: any
  ): Promise<boolean> {
    // In a real implementation, you would:
    // 1. Hash the password and compare with stored hash
    // 2. Use Zoho's authentication APIs
    // 3. Implement proper password validation
    
    // For demo purposes, accept any password for existing CRM users
    return true
  }

  /**
   * Map CRM user data to User object
   */
  private mapCRMUserToUser(crmUser: any): User {
    // Map CRM fields to User object
    const roleMapping: Record<string, UserRole> = {
      'Administrator': UserRole.ADMIN,
      'Healthcare Admin': UserRole.HEALTHCARE_ADMIN,
      'Provider': UserRole.HEALTHCARE_PROVIDER,
      'Caregiver': UserRole.CAREGIVER,
      'Client': UserRole.CLIENT,
      'Family': UserRole.FAMILY_MEMBER
    }

    const statusMapping: Record<string, UserStatus> = {
      'Active': UserStatus.ACTIVE,
      'Pending': UserStatus.PENDING_VERIFICATION,
      'Inactive': UserStatus.INACTIVE
    }

    return {
      id: crmUser.id || `crm_${Date.now()}`,
      email: crmUser.Email || '',
      firstName: crmUser.First_Name || '',
      lastName: crmUser.Last_Name || '',
      role: roleMapping[crmUser.User_Role] || UserRole.CLIENT,
      status: statusMapping[crmUser.Status] || UserStatus.PENDING_APPROVAL,
      orgId: crmUser.Account?.id || 'default_org',
      createdAt: crmUser.Created_Time || new Date().toISOString(),
      lastLoginAt: crmUser.Last_Login_Time,
      mfaEnabled: crmUser.MFA_Enabled === 'true' || false,
      hipaaCompliant: true // All users in healthcare CRM are HIPAA compliant
    }
  }

  /**
   * Create new user in CRM
   */
  async createUserInCRM(userData: Partial<User>): Promise<boolean> {
    try {
      const accessToken = await this.getCRMAccessToken()
      if (!accessToken) {
        return false
      }

      const crmData = {
        Email: userData.email,
        First_Name: userData.firstName,
        Last_Name: userData.lastName,
        User_Role: userData.role,
        Status: userData.status,
        MFA_Enabled: userData.mfaEnabled ? 'true' : 'false',
        Created_Time: new Date().toISOString()
      }

      const response = await fetch(`${this.apiBase}/crm/v8/Contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [crmData] })
      })

      return response.ok

    } catch (error) {
      console.error('Failed to create user in CRM:', error)
      return false
    }
  }

  /**
   * Update user in CRM
   */
  async updateUserInCRM(userId: string, userData: Partial<User>): Promise<boolean> {
    try {
      const accessToken = await this.getCRMAccessToken()
      if (!accessToken) {
        return false
      }

      const crmData = {
        id: userId,
        Email: userData.email,
        First_Name: userData.firstName,
        Last_Name: userData.lastName,
        User_Role: userData.role,
        Status: userData.status,
        Last_Login_Time: userData.lastLoginAt,
        MFA_Enabled: userData.mfaEnabled ? 'true' : 'false'
      }

      const response = await fetch(`${this.apiBase}/crm/v8/Contacts`, {
        method: 'PUT',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [crmData] })
      })

      return response.ok

    } catch (error) {
      console.error('Failed to update user in CRM:', error)
      return false
    }
  }
}