import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Supabaseプロジェクトの移行（ムンバイ→東京等）でrefが変わっても
        // 画像が壊れないようワイルドカードで許可。パスはpublicストレージ限定。
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
