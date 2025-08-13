import ZohoAuth from './auth'

export type ServiceHours = {
  total: number
  used: number
  remaining: number
}

// Aggregates purchased/allocated hours (Zoho Books invoices/items) and used hours (CRM or Books time entries)
export class ZohoBooksHours {
  private auth = new ZohoAuth()
  private booksBaseUrl = process.env.ZOHO_BOOKS_API_URL || 'https://books.zoho.com/api/v3'
  private organizationId = process.env.ZOHO_BOOKS_ORG_ID || process.env.ZOHO_ORG_ID || ''

  async getClientServiceHours(zohoContactId: string): Promise<ServiceHours> {
    try {
      const [purchased, used] = await Promise.all([
        this.getPurchasedHours(zohoContactId),
        this.getUsedHours(zohoContactId),
      ])

      const total = purchased
      const remaining = Math.max(0, total - used)
      return { total, used, remaining }
    } catch (err) {
      // Safe fallback to zeroed hours on upstream errors
      return { total: 0, used: 0, remaining: 0 }
    }
  }

  private async getPurchasedHours(zohoContactId: string): Promise<number> {
    const token = await this.auth.getAccessToken()
    const url = new URL(`${this.booksBaseUrl}/invoices`)
    url.searchParams.set('organization_id', this.organizationId)
    url.searchParams.set('contact_id', zohoContactId)
    url.searchParams.set('status', 'paid')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return 0
    const data = await res.json()
    // Sum line items where item name includes "hours" or custom field indicates hours
    let hours = 0
    for (const inv of data.invoices ?? []) {
      for (const line of inv.line_items ?? []) {
        const name: string = (line.name || line.item_name || '').toLowerCase()
        if (name.includes('hour')) {
          const qty = Number(line.quantity || 0)
          hours += isNaN(qty) ? 0 : qty
        }
      }
    }
    return hours
  }

  private async getUsedHours(zohoContactId: string): Promise<number> {
    // If Books Timesheets are used, query them; otherwise fallback to CRM custom field
    const token = await this.auth.getAccessToken()
    // Try Books timesheets first
    const timesheetUrl = new URL(`${this.booksBaseUrl}/timesheets`)
    timesheetUrl.searchParams.set('organization_id', this.organizationId)
    timesheetUrl.searchParams.set('contact_id', zohoContactId)

    const tsRes = await fetch(timesheetUrl.toString(), {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      cache: 'no-store',
    })
    if (tsRes.ok) {
      const data = await tsRes.json()
      let used = 0
      for (const entry of data.timesheets ?? []) {
        const hours = Number(entry.total_hours || entry.hours || 0)
        used += isNaN(hours) ? 0 : hours
      }
      return used
    }

    // Fallback: CRM field "Hours_Used" on Contact
    const crmBase = process.env.ZOHO_CRM_API_URL || 'https://www.zohoapis.com/crm/v2'
    const crmRes = await fetch(`${crmBase}/Contacts/${zohoContactId}`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      cache: 'no-store',
    })
    if (!crmRes.ok) return 0
    const crm = await crmRes.json()
    const record = crm.data?.[0]
    const used = Number(record?.Hours_Used || 0)
    return isNaN(used) ? 0 : used
  }
}

export const booksHours = new ZohoBooksHours()


