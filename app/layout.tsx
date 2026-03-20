import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '早稲田AI研究会 研修アプリ',
  description: '機械学習・深層学習・LLMの理論を学べる研修Webアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
