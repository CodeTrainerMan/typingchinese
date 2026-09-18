'use client'

import { useEffect } from 'react'
import { useSettingStore } from '@/lib/store/setting'

/** 把主题设置写到 <html data-theme>，与 globals.css 里的浅/深色变量对应 */
export default function ThemeEffect() {
  const theme = useSettingStore(s => s.theme)

  useEffect(() => {
    const el = document.documentElement
    if (theme === 'system') el.removeAttribute('data-theme')
    else el.dataset.theme = theme
  }, [theme])

  return null
}
