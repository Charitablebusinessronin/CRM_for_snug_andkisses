import type { Metadata } from 'next'
import './globals.css'
import ZiaChatMount from '@/components/ZiaChatMount'
import { Toaster } from '@/components/ui/toaster'

// Define metadata for the application
export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

/**
 * Root layout for the application.
 * This component wraps all pages and provides a consistent layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const enableZiaWidget = process.env.NEXT_PUBLIC_ENABLE_ZIA_WIDGET === 'true'
  return (
    <html lang="en">
      <body>
        {children}
        {enableZiaWidget ? <ZiaChatMount /> : null}
        <Toaster />
      </body>
    </html>
  )
}
