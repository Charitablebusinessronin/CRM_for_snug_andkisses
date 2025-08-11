const axios = require('axios')
const crypto = require('crypto')

class NotConfiguredError extends Error { constructor(msg){ super(msg); this.name='NotConfiguredError' } }

function getConfig(){
  const baseUrl = process.env.ZOHO_SIGN_BASE_URL || 'https://sign.zoho.com/api/v1'
  const token = process.env.ZOHO_OAUTH_TOKEN // Bearer access token (refresh via your OAuth flow)
  if (!token) throw new NotConfiguredError('ZOHO_OAUTH_TOKEN not set')
  return { baseUrl, token }
}

async function createFromTemplate({ templateId, subject, recipients = [], fields = {} }){
  const { baseUrl, token } = getConfig()
  // Minimal example payload; adapt to real Zoho Sign template API schema
  const url = `${baseUrl}/templates/${encodeURIComponent(templateId)}/create`
  const payload = { subject, recipients, fields }
  const { data } = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` }})
  return data
}

async function getDocumentStatus(documentId){
  const { baseUrl, token } = getConfig()
  const url = `${baseUrl}/documents/${encodeURIComponent(documentId)}`
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }})
  return data
}

async function listTemplates(){
  const { baseUrl, token } = getConfig()
  const url = `${baseUrl}/templates`
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }})
  return data
}

async function getTemplate(templateId){
  const { baseUrl, token } = getConfig()
  const url = `${baseUrl}/templates/${encodeURIComponent(templateId)}`
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }})
  return data
}

function verifyWebhook(rawBody, signature){
  const secret = process.env.ZOHO_SIGN_WEBHOOK_SECRET
  if (!secret) return { ok: false, reason: 'no_secret_configured' }
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const ok = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature || '', 'utf8'))
  return { ok }
}

module.exports = { NotConfiguredError, createFromTemplate, getDocumentStatus, listTemplates, getTemplate, verifyWebhook }
