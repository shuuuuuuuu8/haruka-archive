'use client'

import { useEffect, useRef } from 'react'
import { logProvenanceView } from './view-action'

// マウント時に1回だけ閲覧を記録する（StrictModeの二重実行を ref でガード）。
export default function ViewTracker({ materialUuid, displayId }: { materialUuid: string; displayId: string }) {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    void logProvenanceView(materialUuid, displayId)
  }, [materialUuid, displayId])
  return null
}
