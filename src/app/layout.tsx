import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: '結 素材バンク | 老舗の素材を、次のものづくりへ',
  description:
    '日本の老舗や職人工房に眠る絹、綿、麻、反物、帯地、和紙、古布、工芸素材を検索・相談できるBtoB向け素材プラットフォームです。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
