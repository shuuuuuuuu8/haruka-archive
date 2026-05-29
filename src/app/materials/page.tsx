import { getAllMaterials } from '@/lib/get-materials'
import MaterialsClient from './MaterialsClient'

// ISR: サプライヤーが登録した素材を定期的に再取得して反映（5分ごと）
export const revalidate = 300

export default async function MaterialsPage() {
  const materials = await getAllMaterials()
  return <MaterialsClient initialMaterials={materials} />
}
