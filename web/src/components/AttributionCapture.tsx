'use client'

import { useEffect } from 'react'
import { captureAttribution } from '@/lib/attribution'

/** 挂在 RootLayout 里：任何页面首次加载时记一次来源 */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution()
  }, [])

  return null
}
