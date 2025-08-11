import { NextRequest, NextResponse } from 'next/server'
import { logAuditEvent } from '@/lib/hipaa-audit-edge'

const CATALYST_FN_URL = process.env.CONTRACT_FN_URL || process.env.CATALYST_FUNCTION_URL || 'https://project-rainfall-891140386.development.catalystserverless.com/server/project_rainfall_function'

async function callCatalyst(action: string, params: any) {
  const res = await fetch(CATALYST_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'Snug-Kisses-CRM/2.0' },
    body: JSON.stringify({ action, params })
  })
  if (!res.ok) throw new Error(`Catalyst error ${res.status}`)
  const data = await res.json()
  return data?.data ?? data
}

// List available document templates (from Zoho Sign or Notion cache)
export async function GET(_request: NextRequest) {
  try {
    await logAuditEvent({ action: 'DOC_TEMPLATES_LIST_REQUEST', details: {}, hipaa: true })
    const result = await callCatalyst('documents_listTemplates', {})
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    await logAuditEvent({ action: 'DOC_TEMPLATES_LIST_ERROR', details: { error: msg }, hipaa: true })
    return NextResponse.json({ success: false, error: 'Template listing failed', details: process.env.NODE_ENV==='development'?msg:undefined }, { status: 500 })
  }
}
