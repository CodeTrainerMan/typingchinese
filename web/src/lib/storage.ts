/**
 * localStorage 守卫：写入失败要能被看见，多标签页要能感知彼此的改动。
 *
 * 背景：全部学习数据都在 localStorage（无后端、无账号）。一旦写满配额，
 * zustand 的 persist 会静默失败——用户以为练完了，刷新后进度没了。
 * 这里把写入包一层：失败时记进一个内存 store，由设置页显示成告警。
 */

import { create } from 'zustand'
import { createJSONStorage, type StateStorage } from 'zustand/middleware'

/** 三个 persist key（改这里就够了，别在别处硬写字符串） */
export const STORAGE_KEYS = {
  base: 'cn-type-base-v1',
  setting: 'cn-type-setting-v1',
  extra: 'cn-type-extra-v1',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/** 写入失败的原因：quota = 配额已满；unknown = 隐私模式 / 禁用存储等 */
export type WriteError = 'quota' | 'unknown' | null

interface StorageState {
  writeError: WriteError
  /** 最近一次由其它标签页改动触发同步的时间戳；0 = 尚未发生 */
  syncedAt: number
  setWriteError: (error: WriteError) => void
  markSynced: () => void
}

/** 不持久化：这是运行期的告警状态 */
export const useStorageStore = create<StorageState>()(set => ({
  writeError: null,
  syncedAt: 0,
  setWriteError: writeError => set({ writeError }),
  markSynced: () => set({ syncedAt: Date.now() }),
}))

function isQuotaError(error: unknown): boolean {
  if (error instanceof DOMException) {
    // Chrome / Firefox 用 QuotaExceededError，旧版 Firefox 还有一个 1014 的变体
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    )
  }
  return false
}

/** 每个方法都自己吞掉异常：读不到就当没有，写不进就只是告警，不能让页面崩 */
export const guardedStorage: StateStorage = {
  getItem: name => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch (error) {
      // 不抛出：persist 在 setState 同步路径上，抛出去会打断整个练习流程
      useStorageStore.getState().setWriteError(isQuotaError(error) ? 'quota' : 'unknown')
    }
  },
  removeItem: name => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* 删不掉就算了 */
    }
  },
}

/** 给 persist 用：createJSONStorage(() => guardedStorage) */
export function guardedJSONStorage<T>() {
  return createJSONStorage<T>(() => guardedStorage)
}

/**
 * 本应用占用的 localStorage 字节数（UTF-16，一个字符约 2 字节）。
 * 只统计自己的 key，不把同域下别的站点数据算进来。
 */
export function storageBytes(): number {
  let total = 0
  for (const key of Object.values(STORAGE_KEYS)) {
    try {
      const value = localStorage.getItem(key)
      // key 与 value 都要算，且按 UTF-16 计
      if (value !== null) total += (key.length + value.length) * 2
    } catch {
      /* 读不到就按 0 计 */
    }
  }
  return total
}

/** 常见浏览器配额是 5MB，超过 80% 就提示，别等到真写不进去 */
export const STORAGE_SOFT_LIMIT = 5 * 1024 * 1024
export const STORAGE_WARN_RATIO = 0.8

export function storageWarnLevel(): 'ok' | 'warn' | 'full' {
  if (useStorageStore.getState().writeError === 'quota') return 'full'
  return storageBytes() > STORAGE_SOFT_LIMIT * STORAGE_WARN_RATIO ? 'warn' : 'ok'
}

/** 把字节数显示成 KB / MB，界面上只做展示用 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
