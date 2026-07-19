import { getAllMaterials } from '@/lib/get-materials'
import HomeLanding, { type FeaturedMaterial, type ShowcaseItem } from './HomeLanding'

// ISR: 提供元が登録した素材を定期的に再取得して反映（5分ごと）
export const revalidate = 60

function pickFeatured(
  materials: Awaited<ReturnType<typeof getAllMaterials>>,
): FeaturedMaterial | null {
  // 物語のある素材を優先（来歴＝この市場の堀）。年代が分かるものをさらに優先。
  const withStory = materials.filter((m) => m.story && m.story.trim().length > 0)
  const pool = withStory.length > 0 ? withStory : materials
  if (pool.length === 0) return null
  const dated = pool.filter((m) => m.era && m.era !== '不明')
  const m = (dated.length > 0 ? dated : pool)[0]
  return {
    id: m.id,
    name: m.name,
    category: m.category,
    era: m.era,
    origin: m.origin,
    story: (m.story ?? '').trim(),
    image: m.images?.[0] ?? null,
  }
}

export default async function Home() {
  const materials = await getAllMaterials()
  const featured = pickFeatured(materials)

  // スクロールで迫り上がる実在庫ショーケース（最大6点）
  const showcase: ShowcaseItem[] = materials
    .filter((m) => m.images?.[0])
    .slice(0, 6)
    .map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      era: m.era && m.era !== '不明' ? m.era : '',
      image: m.images[0],
    }))

  return (
    <HomeLanding
      count={materials.length}
      featured={featured}
      showcase={showcase}
    />
  )
}
