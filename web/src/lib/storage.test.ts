import { beforeEach, describe, expect, it } from 'vitest'
import {
  STORAGE_KEYS,
  formatBytes,
  guardedStorage,
  storageBytes,
  useStorageStore,
} from './storage'

/** node 环境没有 localStorage，用一个可抛异常的最小实现替上去 */
function installLocalStorage(impl: {
  getItem?: (key: string) => string | null
  setItem?: (key: string, value: string) => void
}) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: impl.getItem ?? (() => null),
      setItem: impl.setItem ?? (() => undefined),
      removeItem: () => undefined,
    },
  })
}

describe('formatBytes', () => {
  it('按 B / KB / MB 分档', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})

describe('guardedStorage', () => {
  beforeEach(() => {
    useStorageStore.setState({ writeError: null })
  })

  it('写入抛配额异常时记进 store，而不是让页面崩', () => {
    installLocalStorage({
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError')
      },
    })
    expect(() => guardedStorage.setItem(STORAGE_KEYS.base, '{}')).not.toThrow()
    expect(useStorageStore.getState().writeError).toBe('quota')
  })

  it('非配额异常记为 unknown（隐私模式等）', () => {
    installLocalStorage({
      setItem: () => {
        throw new Error('denied')
      },
    })
    guardedStorage.setItem(STORAGE_KEYS.base, '{}')
    expect(useStorageStore.getState().writeError).toBe('unknown')
  })

  it('读不到就当没有，不抛异常', () => {
    installLocalStorage({
      getItem: () => {
        throw new Error('denied')
      },
    })
    expect(guardedStorage.getItem(STORAGE_KEYS.base)).toBeNull()
  })

  it('正常读写透传', () => {
    const bag = new Map<string, string>()
    installLocalStorage({
      getItem: key => bag.get(key) ?? null,
      setItem: (key, value) => void bag.set(key, value),
    })
    guardedStorage.setItem(STORAGE_KEYS.base, '{"a":1}')
    expect(guardedStorage.getItem(STORAGE_KEYS.base)).toBe('{"a":1}')
    expect(useStorageStore.getState().writeError).toBeNull()
  })
})

describe('storageBytes', () => {
  it('只统计本应用的三个 key，按 UTF-16 计', () => {
    const value = 'x'.repeat(10)
    installLocalStorage({ getItem: () => value })
    const expected = Object.values(STORAGE_KEYS).reduce((sum, key) => sum + (key.length + value.length) * 2, 0)
    expect(storageBytes()).toBe(expected)
  })

  it('读不到时按 0 计，不影响界面', () => {
    installLocalStorage({
      getItem: () => {
        throw new Error('denied')
      },
    })
    expect(storageBytes()).toBe(0)
  })
})
