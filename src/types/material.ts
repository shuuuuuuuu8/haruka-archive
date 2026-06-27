export type MaterialCategory =
  // 登録時のカテゴリー（素材バンク・MUSUBI登録）
  | '着物'
  | '帯'
  | '反物'
  | '羽織'
  | '袴'
  | '小物'
  // 旧・素材分類（静的データ用に互換維持）
  | '絹'
  | '綿'
  | '麻'
  | '薄手シルク'
  | '厚手シルク'
  | '和紙'
  | '古布'
  | '工芸素材'
  | 'その他'

export type MaterialStatus = 'public' | 'negotiating' | 'checking' | 'low_stock' | 'private'
export type PriceRange = 'undecided' | 'consult' | 'low' | 'mid' | 'high' | 'premium'
export type Era = '明治' | '大正' | '昭和' | '平成' | '現代' | '不明'
export type ColorGroup = '白系' | '黒系' | '藍系' | '赤系' | '金系' | '茶系' | '緑系' | '多色' | 'その他'
export type PatternType = '無地' | '縞' | '花柄' | '幾何学' | '伝統文様' | '格子' | 'その他'
export type QuantitySize = 'sample' | 'single' | 'small' | 'medium' | 'large'
export type RecommendedUse =
  | 'アパレル'
  | 'バッグ'
  | 'インテリア'
  | 'アート'
  | 'ノベルティ'
  | 'アップサイクル'
  | '海外向け商品'
  | 'クラウドファンディング'
  | 'スカーフ'
  | 'ジャケット裏地'
  | 'アクセサリー'

export interface Material {
  id: string
  /** 素材バンク(MUSUBI)の本物のUUID。会話・取引の作成に使う（静的データは無し）。 */
  sourceId?: string
  name: string
  nameEn?: string
  category: MaterialCategory
  materialType: string
  color: ColorGroup
  pattern: PatternType
  origin: string
  era: Era
  /** 提供元が入力した生の年代文字列（例: 「昭和30年代」）。丸めない。来歴ページ用。 */
  eraText?: string
  /** 提供元が入力した生の産地。空なら未設定（「日本」補完しない）。来歴ページ用。 */
  regionText?: string
  supplier: string
  /** 実際の提供元名（提供元プロフィールの表示名。DPP/来歴ページで使用）。 */
  supplierName?: string
  /** 来歴/DPPの追加属性（柄・組成・技法・職人・この素材から生まれた製品など）。 */
  attributes?: {
    pattern?: string
    composition?: string
    technique?: string
    maker?: string
    derived_products?: { name: string; count?: number; note?: string }[]
    [key: string]: unknown
  }
  quantity: number
  quantityUnit: 'm' | '点' | '反'
  quantitySize: QuantitySize
  priceRange: PriceRange
  status: MaterialStatus
  recommendedUses: RecommendedUse[]
  story: string
  characteristics: string
  images: string[]
  tags: string[]
  sampleAvailable: boolean
  isFeatured: boolean
  verifiedFields: string[]
  pendingFields: string[]
  estimatedFields: string[]
  createdAt: string
  updatedAt: string
}

export interface Partner {
  id: string
  name: string
  founded: string
  location: string
  speciality: string
  story: string
  materialCount: number
  image?: string
  websiteUrl?: string
}

export interface MaterialFilters {
  category?: MaterialCategory[]
  materialType?: string[]
  color?: ColorGroup[]
  pattern?: PatternType[]
  origin?: string[]
  era?: Era[]
  quantitySize?: QuantitySize[]
  priceRange?: PriceRange[]
  recommendedUses?: RecommendedUse[]
  status?: MaterialStatus[]
  sampleAvailable?: boolean
  query?: string
}

export const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  undecided: '未定',
  consult: '相談',
  low: '低',
  mid: '中',
  high: '高',
  premium: '希少',
}

export const STATUS_LABELS: Record<MaterialStatus, string> = {
  public: '公開中',
  negotiating: '商談中',
  checking: '確認中',
  low_stock: '残りわずか',
  private: '非公開',
}

export const QUANTITY_SIZE_LABELS: Record<QuantitySize, string> = {
  sample: 'サンプル程度',
  single: '1反・1点のみ',
  small: '小ロット',
  medium: '中ロット',
  large: '大ロット',
}
