import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: '結 素材バンク | 日本に眠る素材を、次のつくり手へ',
  description:
    '日本各地の老舗や職人工房に眠る未活用素材・デッドストック素材をデータ化し、企業や個人デザイナーが目的に合った素材を探せる素材検索プラットフォームです。',
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
