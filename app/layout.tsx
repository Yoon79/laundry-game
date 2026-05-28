import type { Metadata } from 'next'
import { Playfair_Display, Space_Mono } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '스웨덴세탁소',
  description: 'Sweden Laundry — An indie band experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${playfair.variable} ${spaceMono.variable} h-full`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
