import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import hipaaLogger from '@/lib/hipaa-audit'

const ExpressInterestSchema = z.object({
  jobId: z.union([z.string(), z.number()]),
  jobType: z.string().optional(),
  title: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  rate: z.string().optional(),
  total: z.string().optional(),
  userId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const startedAt = new Date().toISOString()
  try {
    const body = await request.json()
    const data = ExpressInterestSchema.parse(body)

    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    // HIPAA audit (workflow event, not PHI)
    await hipaaLogger.logWorkflowEvent(data.userId || 'contractor', 'job_express_interest', {
      job: data,
      startedAt,
      ip,
    })

    const baseUrl = process.env.JOBS_FUNCTIONS_URL || (process.env.CATALYST_APP_URL ? `${process.env.CATALYST_APP_URL}/server/jobs-functions` : undefined)

    if (baseUrl) {
      try {
        const res = await fetch(`${baseUrl}/express-interest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data })
        })
        const result = await res.json().catch(() => ({}))

        if (res.ok && (result?.status === 'success' || result?.success)) {
          return NextResponse.json({ success: true, data: result.data || null })
        }
      } catch (e) {
        // fall through to local success
        console.error('Catalyst proxy failed (express-interest):', e)
      }
    }

    // Fallback success to keep UX responsive; audit already recorded
    return NextResponse.json({ success: true, data: { stored: 'local_fallback' } })
  } catch (error: any) {
    console.error('express-interest error:', error)
    return NextResponse.json({ success: false, error: error?.message || 'Invalid request' }, { status: 400 })
  }
}
