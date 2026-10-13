/**
 * 单字落地页的数据索引（构建时 / 服务端使用，不进客户端包）
 *
 * /write/<字> 页面需要三样东西：笔顺数据（public/hanzi/<字>.json）、
 * 拼音与释义、例词。后两者散在 9 个词库里（hsk5/hsk6 各有两三千词），
 * 如果每页都重新读一遍，2619 个页面要重复解析约 1MB JSON 两千多次。
 *
 * 所以这里做一次遍历建立「字 → 例词」索引和「词库 → 字」倒排，
 * 之后每个页面都是 O(1) 查询。
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { isHanzi } from './chars'

export const DICT_IDS = ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6', 'daily', 'idiom', 'advanced'] as const

export const DICT_LABEL: Record<string, string> = {
  hsk1: 'HSK 1', hsk2: 'HSK 2', hsk3: 'HSK 3',
  hsk4: 'HSK 4', hsk5: 'HSK 5', hsk6: 'HSK 6',
  daily: 'Daily', idiom: 'Idioms', advanced: 'Advanced',
}

export interface SourceWord {
  dictId: string
  dictLabel: string
  word: string
  pinyin: string
  trans: string
}

interface CharEntry {
  char: string
  /** 首次收录该字的词库（决定它归属哪个 HSK 级别/分类） */
  dictId: string
  sources: SourceWord[]
}

interface RawWord {
  word?: unknown
  pinyin?: unknown
  trans?: unknown
}

/** 词库文件缓存：每个文件只读并解析一次 */
const dictCache = new Map<string, { words: RawWord[] }>()

function loadDict(id: string): { words: RawWord[] } {
  const hit = dictCache.get(id)
  if (hit) return hit
  const file = join(process.cwd(), 'public', 'dicts', `${id}.json`)
  let words: RawWord[] = []
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf-8')) as { words?: RawWord[] }
    words = parsed.words ?? []
  } catch {
    words = []
  }
  const entry = { words }
  dictCache.set(id, entry)
  return entry
}

let index: Map<string, CharEntry> | null = null
let byDict: Map<string, string[]> | null = null

function buildIndex(): void {
  if (index && byDict) return
  const idx = new Map<string, CharEntry>()
  const rev = new Map<string, string[]>()

  for (const id of DICT_IDS) {
    const dict = loadDict(id)
    const charsInDict = rev.get(id) ?? []
    for (const w of dict.words) {
      const word = typeof w.word === 'string' ? w.word : ''
      if (!word) continue
      const pinyin = Array.isArray(w.pinyin) ? (w.pinyin as string[]) : []
      const trans = typeof w.trans === 'string' ? w.trans : ''
      for (const ch of Array.from(word)) {
        if (!isHanzi(ch)) continue
        if (!charsInDict.includes(ch)) charsInDict.push(ch)
        const existing = idx.get(ch)
        if (existing) {
          // 每字最多保留 8 个例词，够页面用了
          if (existing.sources.length < 8) {
            existing.sources.push({
              dictId: id,
              dictLabel: DICT_LABEL[id] ?? id,
              word,
              pinyin: pinyin.join(' '),
              trans,
            })
          }
        } else {
          idx.set(ch, {
            char: ch,
            dictId: id,
            sources: [{ dictId: id, dictLabel: DICT_LABEL[id] ?? id, word, pinyin: pinyin.join(' '), trans }],
          })
        }
      }
    }
    rev.set(id, charsInDict)
  }
  index = idx
  byDict = rev
}

/** 所有能生成落地页的字：有笔顺数据、且在词库里有例词 */
export function listCharPages(): string[] {
  buildIndex()
  const dir = join(process.cwd(), 'public', 'hanzi')
  if (!existsSync(dir)) return []
  const out: string[] = []
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.json') || f === 'index.json') continue
    const ch = f.replace('.json', '')
    if (index!.has(ch)) out.push(ch)
  }
  return out
}

/** 某字的例词（最多 8 个） */
export function getCharSources(char: string): SourceWord[] {
  buildIndex()
  return index!.get(char)?.sources ?? []
}

/** 某字首次归属的词库 id（用于展示 HSK 级别 / 相关字） */
export function getCharDictId(char: string): string | null {
  buildIndex()
  return index!.get(char)?.dictId ?? null
}

/** 相关字：同一词库里的其他字，均匀取样，保证每页内链不重复且不总是前几个 */
export function getRelatedChars(char: string, limit = 8): string[] {
  buildIndex()
  const entry = index!.get(char)
  if (!entry) return []
  const pool = (byDict!.get(entry.dictId) ?? []).filter((c) => c !== char)
  if (!pool.length) return []
  const out: string[] = []
  const step = Math.max(1, Math.floor(pool.length / limit))
  for (let i = 0; i < pool.length && out.length < limit; i += step) out.push(pool[i])
  return out
}
