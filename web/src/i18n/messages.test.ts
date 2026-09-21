import { describe, expect, it } from 'vitest'
import { de } from './messages/de'
import { en } from './messages/en'
import { es } from './messages/es'
import { fr } from './messages/fr'
import { id } from './messages/id'
import { ja } from './messages/ja'
import { ko } from './messages/ko'
import { pt } from './messages/pt'
import { ru } from './messages/ru'
import { th } from './messages/th'
import { uk } from './messages/uk'
import { vi } from './messages/vi'
import { zhCN } from './messages/zh-CN'
import { zhTW } from './messages/zh-TW'

/**
 * 语言包是手工维护的，漏一个 key 用户看到的就是裸 key 名。
 * TypeScript（Messages = typeof en）能挡住缺 key，但挡不住「占位符写错」
 * 这类编译期看不出的问题，这里补上运行时校验。
 */
const PACKS: Record<string, unknown> = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  es,
  pt,
  fr,
  de,
  ru,
  uk,
  id,
  vi,
  ja,
  ko,
  th,
}

/** 展开成 'setting.theme' → 文案，便于逐条比对 */
function flatten(value: unknown, prefix = '', out = new Map<string, string>()): Map<string, string> {
  if (typeof value === 'string') {
    out.set(prefix, value)
    return out
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      flatten(item, prefix ? `${prefix}.${key}` : key, out)
    }
  }
  return out
}

const BASE = flatten(en)
const PLACEHOLDERS = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort()

describe('语言包完整性', () => {
  it('一共 14 个语言包', () => {
    expect(Object.keys(PACKS)).toHaveLength(14)
  })

  it('英文基准包本身不是空的', () => {
    expect(BASE.size).toBeGreaterThan(100)
  })

  it.each(Object.keys(PACKS))('%s 的 key 与英文包完全一致', locale => {
    const keys = flatten(PACKS[locale])
    const missing = [...BASE.keys()].filter(key => !keys.has(key))
    const extra = [...keys.keys()].filter(key => !BASE.has(key))
    expect({ missing, extra }).toEqual({ missing: [], extra: [] })
  })

  it.each(Object.keys(PACKS))('%s 没有空文案', locale => {
    const empty = [...flatten(PACKS[locale]).entries()].filter(([, text]) => text.trim() === '')
    expect(empty.map(([key]) => key)).toEqual([])
  })

  it.each(Object.keys(PACKS))('%s 的占位符与英文包一致', locale => {
    const keys = flatten(PACKS[locale])
    const mismatched = [...BASE.entries()]
      .filter(([key, text]) => {
        const other = keys.get(key)
        return other !== undefined && PLACEHOLDERS(other).join(',') !== PLACEHOLDERS(text).join(',')
      })
      .map(([key]) => key)
    expect(mismatched).toEqual([])
  })
})
