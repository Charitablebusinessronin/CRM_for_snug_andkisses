/*
 * UnifiedApiClient
 * Single API client with HIPAA audit logging + retry/backoff
 * Server-safe; can be adapted for edge if needed.
 */
import { logAuditEvent } from '@/lib/hipaa-audit-edge'

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string // absolute or relative to baseURL
  headers?: Record<string, string>
  body?: any
  timeoutMs?: number
  retries?: number
  requiresAuth?: boolean
  auditContext?: {
    userId?: string
    action: string
    resource: string
    ip?: string
    userAgent?: string
  }
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  headers: Record<string, string>
  success: boolean
  timestamp: string
}

export type TokenProvider = () => Promise<string | null> | string | null

export class UnifiedApiClient {
  private readonly baseURL: string
  private readonly tokenProvider?: TokenProvider

  constructor(baseURL: string, tokenProvider?: TokenProvider) {
    this.baseURL = baseURL.replace(/\/$/, '')
    this.tokenProvider = tokenProvider
  }

  async request<T = any>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
    const start = Date.now()
    const requestId = this.generateRequestId()

    // Pre-request audit (best-effort; do not throw)
    if (options.auditContext) {
      void logAuditEvent({
        action: 'API_REQUEST',
        resource: options.auditContext.resource,
        method: options.method,
        user_id: options.auditContext.userId,
        timestamp: new Date().toISOString(),
        request_id: requestId,
        origin: 'internal',
        ip_address: options.auditContext.ip || 'server',
        user_agent: options.auditContext.userAgent || 'server'
      })
    }

    // Compose URL
    const url = this.composeUrl(options.url)

    // Compose headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...options.headers,
    }

    // Attach auth
    if (options.requiresAuth && this.tokenProvider) {
      const token = await this.tokenProvider()
      if (token) headers.Authorization = `Bearer ${token}`
    }

    const response = await this.executeWithRetry({
      url,
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      timeoutMs: options.timeoutMs ?? 30000,
    }, options.retries ?? 3)

    const apiResponse: ApiResponse<T> = {
      data: response.data as T,
      status: response.status,
      headers: response.headers,
      success: response.status >= 200 && response.status < 300,
      timestamp: new Date().toISOString(),
    }

    // Post-response audit
    if (options.auditContext) {
      void logAuditEvent({
        action: apiResponse.success ? 'API_RESPONSE' : 'API_ERROR',
        resource: options.auditContext.resource,
        method: options.method,
        result: apiResponse.success ? 'success' : 'failure',
        timestamp: new Date().toISOString(),
        request_id: requestId,
        origin: 'internal',
        ip_address: options.auditContext.ip || 'server',
        user_agent: options.auditContext.userAgent || 'server',
        data: { status: apiResponse.status, durationMs: Date.now() - start }
      })
    }

    return apiResponse
  }

  async zohoRequest<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'url'>): Promise<ApiResponse<T>> {
    const prefix = process.env.ZOHO_PROXY_PREFIX || '/zoho'
    return this.request<T>({ ...options, url: `${prefix}${endpoint}`, requiresAuth: true })
  }

  async catalystRequest<T = any>(functionName: string, data: any, options: Partial<ApiRequestOptions> = {}): Promise<ApiResponse<T>> {
    const prefix = process.env.CATALYST_PROXY_PREFIX || '/catalyst/functions'
    return this.request<T>({
      method: 'POST',
      url: `${prefix}/${functionName}`,
      body: data,
      requiresAuth: true,
      ...options,
    })
  }

  // ===== Internals =====
  private composeUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url
    return `${this.baseURL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  private async executeWithRetry(req: { url: string; method: string; headers: Record<string, string>; body?: string; timeoutMs: number }, maxRetries: number) {
    let lastError: Error | undefined
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), req.timeoutMs)
        const res = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body, signal: controller.signal })
        clearTimeout(timeout)

        const headers: Record<string, string> = {}
        res.headers.forEach((v, k) => { headers[k] = v })

        const text = await res.text()
        let data: any
        try { data = text ? JSON.parse(text) : null } catch { data = text }

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

        return { data, status: res.status, headers }
      } catch (err) {
        lastError = err as Error
        if (attempt < maxRetries) {
          const delay = Math.min(16000, 1000 * 2 ** attempt)
          await new Promise(r => setTimeout(r, delay))
          continue
        }
        throw lastError
      }
    }
    // Should not reach here
    throw lastError ?? new Error('Unknown request failure')
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  }
}
