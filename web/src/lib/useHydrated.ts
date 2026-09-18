'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/** 客户端挂载完成后返回 true，用于避免持久化 store 的 SSR 水合不一致 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true, // 客户端
    () => false // 服务端
  )
}
