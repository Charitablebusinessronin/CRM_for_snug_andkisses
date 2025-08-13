// Unified Zoho OAuth helper used across CRM, Books, Campaigns, and Bookings integrations

type ZohoTokenResponse = {
  access_token: string
  expires_in: number
  api_domain?: string
  token_type?: string
}

export class ZohoAuth {
  private cachedAccessToken: string | null = null
  private tokenExpiryEpochMs = 0

  private get accountsBaseUrl(): string {
    // Allow region override if needed (e.g., accounts.zoho.eu)
    return process.env.ZOHO_ACCOUNTS_BASE_URL || 'https://accounts.zoho.com'
  }

  async getAccessToken(): Promise<string> {
    const now = Date.now()
    if (this.cachedAccessToken && now < this.tokenExpiryEpochMs) {
      return this.cachedAccessToken
    }

    const refreshToken = process.env.ZOHO_REFRESH_TOKEN
    const clientId = process.env.ZOHO_CLIENT_ID
    const clientSecret = process.env.ZOHO_CLIENT_SECRET

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Missing Zoho OAuth env vars: ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET')
    }

    const url = `${this.accountsBaseUrl}/oauth/v2/token`
    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    })

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Zoho token refresh failed: ${res.status} ${res.statusText} ${text}`)
    }

    const data = (await res.json()) as ZohoTokenResponse
    this.cachedAccessToken = data.access_token
    // Subtract 60s as a buffer
    this.tokenExpiryEpochMs = Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000
    return this.cachedAccessToken
  }
}

export default ZohoAuth


