import { getAllMaterials } from '@/lib/get-materials'
import MaterialsClient from './MaterialsClient'

// ISR: サプライヤーが登録した素材を定期的に再取得して反映（5分ごと）
// 常に最新を表示（登録直後に「出ない」と混乱しないように。トラフィックが増えたら再検討）
export const revalidate = 0

export default async function MaterialsPage() {
  const materials = await getAllMaterials()
  return <MaterialsClient initialMaterials={materials} />
}
