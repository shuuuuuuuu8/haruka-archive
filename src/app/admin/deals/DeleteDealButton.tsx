'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteDeal } from './actions'

export default function DeleteDealButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('この成約を削除しますか？（元に戻せません）')) return
        startTransition(() => deleteDeal(id))
      }}
      aria-label="この成約を削除"
      className="inline-flex size-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--accent-pale)] disabled:opacity-50"
      style={{ color: 'var(--text-muted)' }}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  )
}
