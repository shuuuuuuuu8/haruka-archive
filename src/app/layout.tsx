import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.musubi-sozaibank.com'
const siteName = '結'
const siteDescription =
  '結（むすび）は、日本各地の老舗や職人工房に眠る未活用素材・デッドストック素材を探せる素材検索プラットフォームです。着物・反物・帯地・古布・工芸素材のサンプル相談・ロット相談を遙が仲介します。'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName}（むすび）| 日本に眠る素材を、次のつくり手へ`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    '結',
    'むすび',
    'MUSUBI',
    // 旧名称（検索流入の継続用に残す）
    '結び素材バンク',
    '結素材バンク',
    'MUSUBI素材バンク',
    'musubi sozai bank',
    '素材バンク',
    '未活用素材',
    'デッドストック素材',
    '着物素材',
    '反物',
    '帯地',
    '古布',
    '和紙',
    '工芸素材',
    '絹',
    '正絹',
    '老舗',
    '職人工房',
    '伝統工芸',
    '素材検索',
    'アップサイクル',
    'サンプル相談',
    'ロット相談',
    '遙',
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
        alternateName: ['むすび', 'MUSUBI', '結 素材バンク', '結び素材バンク', 'MUSUBI素材バンク', 'musubi sozai bank'],
        url: siteUrl,
        description: siteDescription,
        inLanguage: 'ja',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/materials?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
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
