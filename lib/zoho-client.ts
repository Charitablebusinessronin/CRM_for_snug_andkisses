import { ZOHO_CONFIG } from "./zoho-config"

export interface ZohoTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

export interface ZohoContact {
  id?: string
  First_Name: string
  Last_Name: string
  Email: string
  Phone?: string
  Mailing_Street?: string
  Mailing_City?: string
  Mailing_State?: string
  Mailing_Code?: string
  Description?: string
}

export interface ZohoDeal {
  id?: string
  Deal_Name: string
  Stage: string
  Amount: number
  Contact_Name: string
  Closing_Date: string
  Description?: string
}

export class ZohoClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private expiresAt: number | null = null

  constructor() {
    this.loadTokensFromStorage()
  }

  private loadTokensFromStorage() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem(ZOHO_CONFIG.ACCESS_TOKEN_KEY)
      this.refreshToken = localStorage.getItem(ZOHO_CONFIG.REFRESH_TOKEN_KEY)
      const expiresAt = localStorage.getItem(ZOHO_CONFIG.EXPIRES_AT_KEY)
      this.expiresAt = expiresAt ? Number.parseInt(expiresAt) : null
    }
  }

  private saveTokensToStorage(tokens: ZohoTokens) {
    if (typeof window !== "undefined") {
      this.accessToken = tokens.access_token
      this.refreshToken = tokens.refresh_token
      this.expiresAt = Date.now() + tokens.expires_in * 1000

      localStorage.setItem(ZOHO_CONFIG.ACCESS_TOKEN_KEY, tokens.access_token)
      localStorage.setItem(ZOHO_CONFIG.REFRESH_TOKEN_KEY, tokens.refresh_token)
      localStorage.setItem(ZOHO_CONFIG.EXPIRES_AT_KEY, this.expiresAt.toString())
    }
  }

  async exchangeCodeForTokens(code: string): Promise<ZohoTokens> {
    const response = await fetch(`${ZOHO_CONFIG.ACCOUNTS_URL}/oauth/v2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: ZOHO_CONFIG.CLIENT_ID,
        client_secret: ZOHO_CONFIG.CLIENT_SECRET,
        redirect_uri: ZOHO_CONFIG.REDIRECT_URI,
        code: code,
      }),
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    const tokens: ZohoTokens = await response.json()
    this.saveTokensToStorage(tokens)
    return tokens
  }

  async refreshAccessToken(): Promise<ZohoTokens> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch(`${ZOHO_CONFIG.ACCOUNTS_URL}/oauth/v2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: ZOHO_CONFIG.CLIENT_ID,
        client_secret: ZOHO_CONFIG.CLIENT_SECRET,
        refresh_token: this.refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`)
    }

    const tokens: ZohoTokens = await response.json()
    this.saveTokensToStorage(tokens)
    return tokens
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.accessToken || !this.expiresAt) {
      throw new Error("No access token available. Please authenticate first.")
    }

    // Check if token is expired (with 5 minute buffer)
    if (Date.now() >= this.expiresAt - 300000) {
      await this.refreshAccessToken()
    }

    return this.accessToken!
  }

  private async makeApiRequest(url: string, options: RequestInit = {}): Promise<any> {
    const token = await this.ensureValidToken()

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // CRM Methods
  async createContact(contact: ZohoContact): Promise<string> {
    const response = await this.makeApiRequest(`${ZOHO_CONFIG.CRM_API_URL}/Contacts`, {
      method: "POST",
      body: JSON.stringify({ data: [contact] }),
    })

    return response.data[0].details.id
  }

  async updateContact(contactId: string, contact: Partial<ZohoContact>): Promise<void> {
    await this.makeApiRequest(`${ZOHO_CONFIG.CRM_API_URL}/Contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify({ data: [contact] }),
    })
  }

  async createDeal(deal: ZohoDeal): Promise<string> {
    const response = await this.makeApiRequest(`${ZOHO_CONFIG.CRM_API_URL}/Deals`, {
      method: "POST",
      body: JSON.stringify({ data: [deal] }),
    })

    return response.data[0].details.id
  }

  // Books Methods
  async createInvoice(invoiceData: any): Promise<string> {
    const response = await this.makeApiRequest(`${ZOHO_CONFIG.BOOKS_API_URL}/invoices`, {
      method: "POST",
      body: JSON.stringify(invoiceData),
    })

    return response.invoice.invoice_id
  }

  // Campaigns Methods
  async addContactToCampaign(email: string, listKey: string): Promise<void> {
    await this.makeApiRequest(`${ZOHO_CONFIG.CAMPAIGNS_API_URL}/json/listsubscribe`, {
      method: "POST",
      body: JSON.stringify({
        listkey: listKey,
        contactinfo: JSON.stringify({ Contact_Email: email }),
      }),
    })
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.refreshToken && this.expiresAt && Date.now() < this.expiresAt)
  }

  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.expiresAt = null

    if (typeof window !== "undefined") {
      localStorage.removeItem(ZOHO_CONFIG.ACCESS_TOKEN_KEY)
      localStorage.removeItem(ZOHO_CONFIG.REFRESH_TOKEN_KEY)
      localStorage.removeItem(ZOHO_CONFIG.EXPIRES_AT_KEY)
    }
  }
}

export const zohoClient = new ZohoClient()
