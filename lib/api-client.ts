import { UnifiedAPIResponse } from '@/types/api/unified'

export async function apiPost<TReq, TRes>(path: string, body: TReq, init?: RequestInit) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: JSON.stringify(body),
    cache: 'no-store',
    ...init,
  })

  const text = await res.text()
  try {
    const json = JSON.parse(text) as UnifiedAPIResponse<TRes>
    return { ok: res.ok, status: res.status, json }
  } catch {
    return { ok: false, status: res.status, json: { success: false, error: { code: 'API_001', message: 'Non-JSON response', details: text }, timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } as UnifiedAPIResponse<TRes> }
  }
}

export async function apiGet<TRes>(path: string, init?: RequestInit) {
  const res = await fetch(path, { method: 'GET', cache: 'no-store', ...init })
  const text = await res.text()
  try {
    const json = JSON.parse(text) as UnifiedAPIResponse<TRes>
    return { ok: res.ok, status: res.status, json }
  } catch {
    return { ok: false, status: res.status, json: { success: false, error: { code: 'API_001', message: 'Non-JSON response', details: text }, timestamp: new Date().toISOString(), requestId: crypto.randomUUID() } as UnifiedAPIResponse<TRes> }
  }
}
