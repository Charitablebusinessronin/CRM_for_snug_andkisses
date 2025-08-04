/**
 * Forgot Password Page
 * HIPAA-compliant password reset interface
 */
import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Reset Password - Snugs & Kisses CRM',
  description: 'Secure password reset for Snugs & Kisses CRM - HIPAA compliant healthcare management system',
  robots: 'noindex, nofollow', // Don't index password reset pages for security
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}