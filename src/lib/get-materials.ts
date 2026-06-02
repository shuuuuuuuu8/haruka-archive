import { fetchMusubiMaterials } from './musubi-materials'
import type { Material } from '@/types/material'

// 「素材を探す」一覧は、素材バンク（MUSUBI）に登録された素材のみを表示する。
export async function getAllMaterials(): Promise<Material[]> {
  return fetchMusubiMaterials()
}
