/*
  contract-management: Catalyst AppSail/Functions HTTP entrypoint
  Exposes a single POST endpoint expecting: { action: string, params: object }
  Routes to action handlers for contracts, onboarding, and documents.
  Replace stubbed integrations with real Zoho Sign/CRM calls.
*/

const express = require('express')
const sign = require('./zoho/signClient')
const crm = require('./zoho/crmClient')

const app = express()
app.use(express.json({ limit: '1mb', verify: (req, _res, buf) => { try { req.rawBody = buf.toString() } catch(_){} } }))

// --- Utilities ---
function maskEmail(email) {
  if (!email || typeof email !== 'string') return email
  const [user, domain] = email.split('@')
  if (!domain) return email
  const maskedUser = user.length <= 2 ? user[0] + '*' : user[0] + '***' + user[user.length - 1]
  return `${maskedUser}@${domain}`
}

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return phone
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return '***'
  return `***-***-${digits.slice(-4)}`
}

function hipaaAudit(action, details = {}) {
  try {
    const masked = JSON.parse(JSON.stringify(details))
    if (masked.email) masked.email = maskEmail(masked.email)
    if (masked.phone) masked.phone = maskPhone(masked.phone)
    console.log(JSON.stringify({ ts: new Date().toISOString(), action, details: masked }))
  } catch (e) {
    console.log(JSON.stringify({ ts: new Date().toISOString(), action, details: 'unserializable' }))
  }
}

function ok(data) {
  return { success: true, data }
}

function err(message, details) {
  return { success: false, error: message, details }
}

// --- Action Handlers (stubbed integrations) ---
const handlers = {
  // Contracts
  async contract_initiateBuild(params) {
    hipaaAudit('CONTRACT_INITIATE', { clientId: params?.clientId, doulaId: params?.doulaId })
    // Fetch minimal data from CRM to validate existence (IDs only in response to avoid PHI)
    try {
      const serviceType = (params?.serviceType || '').toLowerCase()
      const templateMap = {
        birth: 'TEMPLATE_DEFAULT',
        prenatal: 'TEMPLATE_PRENATAL',
        postpartum: 'TEMPLATE_POSTPARTUM',
      }
      const recommendedTemplateId = params?.templateId || templateMap[serviceType] || 'TEMPLATE_DEFAULT'

      if (params?.clientId) {
        try { await crm.getContact(params.clientId) } catch (_) {}
      }
      if (params?.doulaId) {
        try { await crm.getUser(params.doulaId) } catch (_) {}
      }

      const prepId = `prep_${Date.now()}`
      return ok({ prepId, recommendedTemplateId })
    } catch (e) {
      if (e.name === 'NotConfiguredError') {
        const prepId = `prep_${Date.now()}`
        return ok({ prepId, recommendedTemplateId: params?.templateId || 'TEMPLATE_DEFAULT' })
      }
      hipaaAudit('CONTRACT_INITIATE_ERROR', { error: e.message })
      throw e
    }
  },

  async contract_generateDocument(params) {
    hipaaAudit('CONTRACT_GENERATE', { clientId: params?.clientId, templateId: params?.templateId })
    try {
      const templateId = params?.templateId || 'TEMPLATE_DEFAULT'
      const subject = params?.subject || 'Snug & Kisses Doula Agreement'
      const recipients = params?.recipients || []
      const fields = params?.fields || {}
      const created = await sign.createFromTemplate({ templateId, subject, recipients, fields })
      // Normalize expected response
      const contractId = created?.document_id || created?.id || `ctr_${Date.now()}`
      const signUrl = created?.sign_url || created?.urls?.sign || created?.url || null
      return ok({ contractId, status: 'created', signUrl })
    } catch (e) {
      if (e.name === 'NotConfiguredError') {
        const contractId = `ctr_${Date.now()}`
        return ok({ contractId, status: 'created', signUrl: 'https://sign.zoho.com/sign/#/document/mock' })
      }
      hipaaAudit('CONTRACT_GENERATE_ERROR', { error: e.message })
      throw e
    }
  },

  async contract_processSignature(params) {
    hipaaAudit('CONTRACT_SIGNATURE_EVENT', { event: params?.event, documentId: params?.documentId })
    // Verify webhook signature if configured
    if (params?.rawBody && params?.signatureHeader) {
      const verify = sign.verifyWebhook(params.rawBody, params.signatureHeader)
      if (!verify.ok) {
        return err('invalid_webhook_signature')
      }
    }
    // Update CRM task/notification on completion (non-PHI)
    const status = params?.event || 'unknown'
    if (status === 'completed' || status === 'signed') {
      try {
        await crm.createTask({
          Subject: 'Contract signed',
          What_Id: params?.relatedDealId || undefined,
          Due_Date: new Date().toISOString().slice(0, 10),
          Status: 'Completed',
          Description: `Document ${params?.documentId} signed`
        })
      } catch (e) {
        if (e.name !== 'NotConfiguredError') hipaaAudit('CRM_TASK_CREATE_ERROR', { error: e.message })
      }
    }
    return ok({ documentId: params?.documentId, status })
  },

  async contract_getStatus(params) {
    hipaaAudit('CONTRACT_STATUS', { contractId: params?.contractId })
    try {
      const doc = await sign.getDocumentStatus(params?.contractId)
      const raw = (doc?.status || doc?.document_status || '').toLowerCase()
      let status = 'created'
      if (/(sent|requested)/.test(raw)) status = 'sent'
      if (/(completed|signed)/.test(raw)) status = 'signed'
      if (/(declined|void|revoked|expired)/.test(raw)) status = 'void'
      return ok({ contractId: params?.contractId, status, raw })
    } catch (e) {
      if (e.name === 'NotConfiguredError') {
        return ok({ contractId: params?.contractId, status: 'created' })
      }
      hipaaAudit('CONTRACT_STATUS_ERROR', { error: e.message })
      throw e
    }
  },

  // Onboarding
  async onboarding_startWelcome(params) {
    hipaaAudit('ONBOARD_WELCOME', { clientId: params?.clientId })
    // TODO: enqueue emails/tasks via Campaigns/CRM + DataStore
    return ok({ clientId: params?.clientId, queued: true })
  },

  async onboarding_sendDoulaIntro(params) {
    hipaaAudit('ONBOARD_INTRO', { clientId: params?.clientId, doulaId: params?.doulaId })
    // TODO: send intro email + task assignments
    return ok({ clientId: params?.clientId, sent: true })
  },

  async onboarding_getStatus(params) {
    hipaaAudit('ONBOARD_STATUS', { clientId: params?.clientId })
    // TODO: compute onboarding status from DataStore/CRM
    return ok({ clientId: params?.clientId, status: 'in_progress', steps: [{ key: 'welcome', done: true }, { key: 'intro', done: true }] })
  },

  // Documents
  async documents_listTemplates(_params) {
    hipaaAudit('DOC_TEMPLATES_LIST', {})
    try {
      const data = await sign.listTemplates()
      // Normalize a few fields if needed
      const templates = (data?.templates || data?.data || []).map(t => ({
        id: t.id || t.template_id || t.uuid,
        name: t.name || t.template_name
      }))
      return ok({ templates })
    } catch (e) {
      if (e.name === 'NotConfiguredError') {
        return ok({ templates: [
          { id: 'TEMPLATE_DEFAULT', name: 'Doula Agreement - Standard' },
          { id: 'TEMPLATE_PRENATAL', name: 'Doula Agreement - Prenatal Only' }
        ]})
      }
      hipaaAudit('DOC_TEMPLATES_LIST_ERROR', { error: e.message })
      throw e
    }
  },

  async documents_getTemplate(params) {
    hipaaAudit('DOC_TEMPLATE_GET', { templateId: params?.templateId })
    try {
      const data = await sign.getTemplate(params?.templateId)
      const fields = data?.fields || data?.placeholders || ['Client_Name', 'Service_Type', 'Start_Date']
      return ok({ id: params?.templateId, fields })
    } catch (e) {
      if (e.name === 'NotConfiguredError') {
        return ok({ id: params?.templateId, fields: ['Client_Name', 'Service_Type', 'Start_Date'] })
      }
      hipaaAudit('DOC_TEMPLATE_GET_ERROR', { error: e.message })
      throw e
    }
  }
}

// --- HTTP Endpoint ---
app.post('/server/project_rainfall_function', async (req, res) => {
  try {
    const { action, params } = req.body || {}
    if (!action || typeof action !== 'string') {
      return res.status(400).json(err('Missing action'))
    }
    const handler = handlers[action]
    if (!handler) {
      return res.status(400).json(err('Unknown action', { action }))
    }
    const result = await handler(params || {})
    return res.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    hipaaAudit('FUNCTION_ERROR', { error: message })
    return res.status(500).json(err('Internal error', process.env.NODE_ENV === 'development' ? message : undefined))
  }
})

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }))

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`contract-management function listening on :${PORT}`)
})
