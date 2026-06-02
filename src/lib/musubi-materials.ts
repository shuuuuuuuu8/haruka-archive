import type {
  Material,
  MaterialCategory,
  Era,
  ColorGroup,
  PatternType,
  QuantitySize,
  PriceRange,
} from '@/types/material'
import { musubiSupabase, getMusubiImageUrl } from './musubi-supabase'

// カテゴリマッピング（musubi登録カテゴリ → 表示カテゴリー）
// 登録時に選んだ種類をそのままカテゴリーとして使う。
const ITEM_CATEGORY_MAP: Record<string, MaterialCategory> = {
  kimono: '着物',
  obi: '帯',
  tanmono: '反物',
  haori: '羽織',
  hakama: '袴',
  accessories: '小物',
  other: 'その他',
}

const categoryLabels: Record<string, string> = {
  kimono: '着物',
  obi: '帯',
  tanmono: '反物',
  haori: '羽織',
  hakama: '袴',
  accessories: '小物',
  other: 'その他',
}

const fabricLabels: Record<string, string> = {
  silk: '正絹',
  cotton: '綿',
  linen: '麻',
  wool: 'ウール',
  synthetic: '化繊',
  mixed: '混紡',
  unknown: '不明',
}

// 年代マッピング
function mapEra(eraText: string | null | undefined): Era {
  if (!eraText) return '不明'
  if (eraText.includes('明治')) return '明治'
  if (eraText.includes('大正')) return '大正'
  if (eraText.includes('昭和')) return '昭和'
  if (eraText.includes('平成')) return '平成'
  if (eraText.includes('現代') || eraText.includes('令和')) return '現代'
  return '不明'
}

// 価格帯マッピング
function mapPriceRange(price: number | null, isNegotiable: boolean): PriceRange {
  if (isNegotiable || price === null) return 'consult'
  if (price < 5000) return 'low'
  if (price < 30000) return 'mid'
  if (price < 100000) return 'high'
  return 'premium'
}

// 数量サイズマッピング
function mapQuantitySize(qty: number): QuantitySize {
  if (qty === 0) return 'sample'
  if (qty === 1) return 'single'
  if (qty <= 5) return 'small'
  if (qty <= 20) return 'medium'
  return 'large'
}

interface MusubiImage {
  storage_path: string
  is_primary: boolean
  order_index: number
}

interface MusubiMaterialRow {
  id: string
  name: string
  category: string
  fabric_type: string
  condition: string
  color: string | null
  quantity: number
  price: number | null
  is_negotiable: boolean
  story: string | null
  cultural_significance: string | null
  era: string | null
  region: string | null
  created_at: string
  material_images: MusubiImage[] | null
}

export async function fetchMusubiMaterials(): Promise<Material[]> {
  try {
    const { data, error } = await musubiSupabase
      .from('materials')
      .select(
        `
        id, name, category, fabric_type, condition, color,
        quantity, price, is_negotiable, story,
        cultural_significance, era, region, created_at,
        material_images(storage_path, is_primary, order_index)
      `,
      )
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return (data as unknown as MusubiMaterialRow[]).map((m) => {
      const images = (m.material_images ?? [])
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
      const imageUrls =
        images.length > 0
          ? images.map((img) => getMusubiImageUrl(img.storage_path))
          : ['/placeholder-material.jpg']

      // カテゴリ: 登録時に選んだ種類（着物・帯・反物 等）を使う
      const category = ITEM_CATEGORY_MAP[m.category] ?? 'その他'

      const COLOR_GROUP_VALUES: ColorGroup[] = ['白系', '黒系', '藍系', '赤系', '金系', '茶系', '緑系', '多色', 'その他']
      const colorGroup: ColorGroup = (COLOR_GROUP_VALUES.includes(m.color as ColorGroup) ? m.color : 'その他') as ColorGroup

      const material: Material = {
        id: `MSB-${m.id.slice(0, 8).toUpperCase()}`,
        name: m.name,
        category,
        materialType: fabricLabels[m.fabric_type] ?? '不明',
        color: colorGroup,
        pattern: 'その他' as PatternType,
        origin: m.region ?? '日本',
        era: mapEra(m.era),
        supplier: 'MUSUBI素材',
        quantity: m.quantity,
        quantityUnit: '点',
        quantitySize: mapQuantitySize(m.quantity),
        priceRange: mapPriceRange(m.price, m.is_negotiable),
        status: 'public',
        recommendedUses: ['アップサイクル', 'アート'],
        story: m.story ?? '',
        characteristics: m.cultural_significance ?? '',
        images: imageUrls,
        tags: [
          categoryLabels[m.category] ?? 'その他',
          fabricLabels[m.fabric_type] ?? '不明',
          'MUSUBI素材',
          ...(m.region ? [m.region] : []),
        ],
        sampleAvailable: false,
        isFeatured: false,
        verifiedFields: ['category', 'materialType'],
        pendingFields: [],
        estimatedFields: [],
        createdAt: m.created_at,
        updatedAt: m.created_at,
      }

      return material
    })
  } catch {
    return []
  }
}
