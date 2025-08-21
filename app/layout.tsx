import type { Metadata } from 'next'
import './globals.css'

// Define metadata for the application
export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

/**
 * Root layout for the application.
 * This component wraps all pages and provides a consistent layout.
 * @param {Readonly<{ children: React.ReactNode }>} props - The props for the component.
 * @returns {JSX.Element} - The root layout of the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
