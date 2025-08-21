/**
 * This file contains the configuration for the Zoho API, including the client ID, client secret, and API endpoints.
 * It also defines interfaces for Zoho objects such as contacts and deals.
 */
export const ZOHO_CONFIG = {
  clientId: process.env.ZOHO_ONE_CLIENT_ID,
  clientSecret: process.env.ZOHO_ONE_CLIENT_SECRET,
  redirectUri: process.env.ZOHO_ONE_REDIRECT_URI,
  accountsUrl: process.env.ZOHO_ACCOUNTS_URL,
  crmApiUrl: process.env.ZOHO_CRM_API_URL,
  booksApiUrl: process.env.ZOHO_BOOKS_API_URL,
  campaignsApiUrl: process.env.ZOHO_CAMPAIGNS_API_URL,
}

export const API_ENDPOINTS = {
  crm: {
    contacts: `${ZOHO_CONFIG.crmApiUrl}/Contacts`,
    deals: `${ZOHO_CONFIG.crmApiUrl}/Deals`,
    accounts: `${ZOHO_CONFIG.crmApiUrl}/Accounts`,
    leads: `${ZOHO_CONFIG.crmApiUrl}/Leads`,
  },
  books: {
    customers: `${ZOHO_CONFIG.booksApiUrl}/contacts`,
    invoices: `${ZOHO_CONFIG.booksApiUrl}/invoices`,
    estimates: `${ZOHO_CONFIG.booksApiUrl}/estimates`,
  },
}

export interface ZohoContact {
  id: string
  First_Name: string
  Last_Name: string
  Email: string
  Phone: string
  Account_Name?: string
  Lead_Source?: string
  Created_Time: string
  Modified_Time: string
}

export interface ZohoDeal {
  id: string
  Deal_Name: string
  Account_Name: string
  Contact_Name: string
  Stage: string
  Amount: number
  Closing_Date: string
  Created_Time: string
}
