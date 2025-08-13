'use client'

import React, { useState } from 'react'
import UnifiedActionButton from '@/components/UnifiedActionButton'
import { runQuickAction } from '@/lib/actions'

interface Props {
  clientId: string
}

type Busy = {
  note?: boolean
  appointment?: boolean
  availability?: boolean
}

export default function ClientQuickActionsUnified({ clientId }: Props) {
  const [busy, setBusy] = useState<Busy>({})

  async function createNote() {
    setBusy((b) => ({ ...b, note: true }))
    try {
      const content = prompt('Enter a quick note') || ''
      if (!content) return
      const res = await runQuickAction<any>({
        action: 'create-note',
        params: { clientId, content },
      })
      if (!res.ok) throw new Error((res.json as any)?.error?.message || `HTTP ${res.status}`)
      alert('Note created')
    } catch (e: any) {
      console.error(e)
      alert(`Failed to create note: ${e?.message || e}`)
    } finally {
      setBusy((b) => ({ ...b, note: false }))
    }
  }

  async function scheduleAppointment() {
    setBusy((b) => ({ ...b, appointment: true }))
    try {
      const res = await runQuickAction<any>({
        action: 'create-appointment',
        params: { clientId, type: 'consultation' },
      })
      if (!res.ok) throw new Error((res.json as any)?.error?.message || `HTTP ${res.status}`)
      const data: any = (res.json as any)?.data
      const url = data?.bookingUrl || data?.appointmentUrl
      if (url) {
        try { window.open(url, '_blank', 'noopener,noreferrer') } catch {}
      }
      alert('Appointment requested')
    } catch (e: any) {
      console.error(e)
      alert(`Failed to schedule: ${e?.message || e}`)
    } finally {
      setBusy((b) => ({ ...b, appointment: false }))
    }
  }

  async function updateAvailability() {
    setBusy((b) => ({ ...b, availability: true }))
    try {
      const status = confirm('Set status to Available?') ? 'Available' : 'Unavailable'
      const res = await runQuickAction<any>({
        action: 'update-availability',
        params: { status },
      })
      if (!res.ok) throw new Error((res.json as any)?.error?.message || `HTTP ${res.status}`)
      alert(`Status updated to ${status}`)
    } catch (e: any) {
      console.error(e)
      alert(`Failed to update availability: ${e?.message || e}`)
    } finally {
      setBusy((b) => ({ ...b, availability: false }))
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
      <UnifiedActionButton
        title={busy.note ? 'Creating…' : 'Create Quick Note'}
        onClick={createNote}
        loading={!!busy.note}
      />
      <UnifiedActionButton
        title={busy.appointment ? 'Scheduling…' : 'Schedule Appointment'}
        onClick={scheduleAppointment}
        loading={!!busy.appointment}
      />
      <UnifiedActionButton
        title={busy.availability ? 'Updating…' : 'Update Availability'}
        onClick={updateAvailability}
        loading={!!busy.availability}
        variant="secondary"
      />
    </div>
  )
}
