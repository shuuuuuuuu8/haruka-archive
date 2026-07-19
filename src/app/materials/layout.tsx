import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '素材を探す',
  description:
    '反物・帯地・古布・和紙・工芸素材など、日本各地の老舗や職人工房に眠る未活用素材・デッドストック素材を検索できます。サンプル確認・ロット相談・商品開発の入口です。',
  alternates: {
    canonical: '/materials',
  },
  openGraph: {
    title: '素材を探す | 結',
    description:
      '老舗や職人工房に眠る未活用素材・デッドストック素材を、種類・素材・色柄・数量から探せる素材検索ページです。',
    url: '/materials',
  },
}

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return children
}
