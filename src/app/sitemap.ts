import type { MetadataRoute } from 'next'
import { MATERIALS } from '@/lib/data'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haruka-archive.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/materials`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/partners`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...MATERIALS.map((material) => ({
      url: `${siteUrl}/materials/${material.id}`,
      lastModified: new Date(material.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
