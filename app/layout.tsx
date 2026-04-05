import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Capital Studio',
  description: 'AI-powered content creation for LH Capital & The SIMRP',
  icons: {
    icon:    '/logos/capital-studio-icon-sidebar.png?v=2',
    shortcut:'/logos/capital-studio-icon-sidebar.png?v=2',
    apple:   '/logos/capital-studio-icon-sidebar.png?v=2',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
