import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '스웨덴세탁소',
  description: 'Sweden Laundry — An indie band experience',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/MonadABXY/mona-font/web/mona.css"
        />
      </head>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
