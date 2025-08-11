import { format, parseISO, isValid } from 'date-fns'

// Centralized date utilities for consistent formatting across the app
// Add more helpers as needed

export function formatISODate(input: string | Date) {
  const d = typeof input === 'string' ? parseISO(input) : input
  if (!isValid(d)) return ''
  return format(d, 'yyyy-MM-dd')
}

export function formatDisplay(input: string | Date) {
  const d = typeof input === 'string' ? parseISO(input) : input
  if (!isValid(d)) return ''
  return format(d, 'MMM d, yyyy h:mm a')
}

export function toZohoDate(input: string | Date) {
  const d = typeof input === 'string' ? parseISO(input) : input
  if (!isValid(d)) return ''
  // Zoho commonly expects ISO-like or yyyy-MM-dd
  return format(d, 'yyyy-MM-dd')
}

export function toDueDateMinutesFromNow(minutes: number) {
  const d = new Date(Date.now() + minutes * 60 * 1000)
  return d.toISOString()
}
