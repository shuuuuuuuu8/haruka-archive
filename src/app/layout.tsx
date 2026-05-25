import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haruka-archive.vercel.app'
const siteName = '結 素材バンク'
const siteDescription =
  '日本各地の老舗や職人工房に眠る未活用素材・デッドストック素材をデータ化し、企業や個人デザイナーが目的に合った素材を探せる素材検索プラットフォームです。'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | 日本に眠る素材を、次のつくり手へ`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    '素材バンク',
    '未活用素材',
    'デッドストック素材',
    '反物',
    '帯地',
    '古布',
    '和紙',
    '工芸素材',
    '老舗',
    '職人工房',
    '素材検索',
    'サンプル相談',
    'ロット相談',
  ],
  applicationName: siteName,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: '/',
    siteName,
    title: `${siteName} | 日本に眠る素材を、次のつくり手へ`,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} | 日本に眠る素材を、次のつくり手へ`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: '遙',
        url: 'https://haruka-llc.com',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        inLanguage: 'ja',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
      },
    ],
  }

  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </body>
    </html>
  )
}
