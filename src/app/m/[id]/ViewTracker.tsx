'use client'

import { useEffect, useRef } from 'react'
import { logProvenanceView } from './view-action'

// 端末ごとの匿名訪問者ID（localStorageで安定発行）。個人名ではなく「同一人物判定」用。
function getVisitorId(): string {
  try {
    let id = localStorage.getItem('mv_visitor')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('mv_visitor', id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

// マウント時に1回だけ閲覧を記録する（StrictModeの二重実行を ref でガード）。
export default function ViewTracker({ materialUuid, displayId }: { materialUuid: string; displayId: string }) {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    void logProvenanceView(materialUuid, displayId, getVisitorId())
  }, [materialUuid, displayId])
  return null
}
