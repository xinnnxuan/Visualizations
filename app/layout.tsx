import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rent Burden Visualization',
  description: 'Interactive visualization showing how rent has risen faster than wages',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
