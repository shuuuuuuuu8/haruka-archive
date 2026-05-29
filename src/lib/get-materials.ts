import { MATERIALS } from './data'
import { fetchMusubiMaterials } from './musubi-materials'
import type { Material } from '@/types/material'

export async function getAllMaterials(): Promise<Material[]> {
  const musubiMaterials = await fetchMusubiMaterials()
  // Supabase素材を先頭に、既存静的データを後ろに結合
  // 重複除去（同一名がある場合はSupabase優先）
  const existingFiltered = MATERIALS.filter(
    (m) => !musubiMaterials.some((ms) => ms.name === m.name),
  )
  return [...musubiMaterials, ...existingFiltered]
}
