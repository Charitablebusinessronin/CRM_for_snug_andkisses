const axios = require('axios')

class NotConfiguredError extends Error { constructor(msg){ super(msg); this.name='NotConfiguredError' } }

function getConfig(){
  const baseUrl = process.env.ZOHO_CRM_BASE_URL || 'https://www.zohoapis.com/crm/v3'
  const token = process.env.ZOHO_OAUTH_TOKEN
  if (!token) throw new NotConfiguredError('ZOHO_OAUTH_TOKEN not set')
  return { baseUrl, token }
}

async function getContact(contactId){
  const { baseUrl, token } = getConfig()
  const url = `${baseUrl}/Contacts/${encodeURIComponent(contactId)}`
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }})
  return data
}

async function getUser(userId){
  const { baseUrl, token } = getConfig()
  const url = `${baseUrl}/users/${encodeURIComponent(userId)}`
  const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }})
  return data
}

async function createTask(payload){
  const { baseUrl, token } = getConfig()
  const url = `${baseUrl}/Tasks`
  const { data } = await axios.post(url, { data: [payload] }, { headers: { Authorization: `Bearer ${token}` }})
  return data
}

module.exports = { NotConfiguredError, getContact, getUser, createTask }
