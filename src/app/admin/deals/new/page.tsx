import { requireAdmin } from '@/lib/admin/guard'
import NewDealForm, { type MaterialOpt, type BuyerOpt } from './NewDealForm'

export const metadata = { title: '成約を記録 — 管理' }

export default async function NewDealPage() {
  const { supabase } = await requireAdmin('/admin/deals/new')

  const [{ data: materials }, { data: buyers }] = await Promise.all([
    supabase
      .from('materials')
      .select('id, name, price, supplier_id, supplier_profiles(display_name)')
      .eq('is_available', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('buyer_profiles')
      .select('id, display_name, company_name')
      .order('created_at', { ascending: false }),
  ])

  return (
    <NewDealForm
      materials={(materials ?? []) as unknown as MaterialOpt[]}
      buyers={(buyers ?? []) as unknown as BuyerOpt[]}
    />
  )
}
