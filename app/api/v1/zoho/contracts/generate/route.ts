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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await logAuditEvent({ action: 'CONTRACT_GENERATE_REQUEST', details: { clientId: body?.clientId, serviceType: body?.serviceType }, hipaa: true })
    const result = await callCatalyst('contract_generateDocument', body)
    await logAuditEvent({ action: 'CONTRACT_GENERATE_SUCCESS', details: { contractId: result?.contractId }, hipaa: true })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    await logAuditEvent({ action: 'CONTRACT_GENERATE_ERROR', details: { error: msg }, hipaa: true })
    return NextResponse.json({ success: false, error: 'Contract generation failed', details: process.env.NODE_ENV==='development'?msg:undefined }, { status: 500 })
  }
}
