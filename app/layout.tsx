import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '스웨덴세탁소에 놀러와요',
  description: '스웨덴세탁소 공식 웹사이트 미니게임',
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
