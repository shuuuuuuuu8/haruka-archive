import type { MetadataRoute } from 'next'
import { getAllMaterials } from '@/lib/get-materials'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.musubi-sozaibank.com'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const materials = await getAllMaterials()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/materials`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/inquiry`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/partners`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const materialRoutes: MetadataRoute.Sitemap = materials.map((m) => ({
    url: `${siteUrl}/materials/${m.id}`,
    lastModified: new Date(m.updatedAt ?? m.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...materialRoutes]
}
