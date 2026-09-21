'use client'

import { useEffect } from 'react'
import { useBaseStore } from '@/lib/store/base'
import { useSettingStore } from '@/lib/store/setting'
import { useExtraStore } from '@/lib/store/extra'
import { STORAGE_KEYS, useStorageStore } from '@/lib/storage'

/**
 * 多标签页同步：storage 事件只在「其它标签页」写入时触发，本页写入不触发。
 *
 * 不合并状态、只做 rehydrate（以磁盘为准）：两个标签同时练的场景下，
 * 后写入的一方本来就是最新数据，重新读一次比自己想办法合并更不容易出错。
 * 同步后由设置页提示一句，避免用户以为进度自己跳了。
 */
const PERSISTED = [
  { key: STORAGE_KEYS.base, rehydrate: () => useBaseStore.persist.rehydrate() },
  { key: STORAGE_KEYS.setting, rehydrate: () => useSettingStore.persist.rehydrate() },
  { key: STORAGE_KEYS.extra, rehydrate: () => useExtraStore.persist.rehydrate() },
]

export default function PersistSync() {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return
      const hit = PERSISTED.find(item => item.key === e.key)
      if (!hit) return
      void Promise.resolve(hit.rehydrate()).then(() => useStorageStore.getState().markSynced())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return null
}
