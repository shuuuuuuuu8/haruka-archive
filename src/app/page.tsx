import type { Metadata } from 'next'
import MaterialsPage from './materials/page'

export const metadata: Metadata = {
  title: '未活用素材・デッドストック素材を探す',
  description:
    '反物、帯地、古布、和紙、工芸素材など、日本各地の老舗や職人工房に眠る未活用素材を検索し、サンプル確認・ロット相談・商品開発について遙へ相談できます。',
  alternates: {
    canonical: '/',
  },
}

export default function Home() {
  return <MaterialsPage />
}
