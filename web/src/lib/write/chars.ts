/**
 * 手写练习的字表：从词库词条拆出单字。
 *
 * 学什么词就练什么字——字的顺序跟着词库走（词库顺序 → 词内顺序），
 * 而不是按笔画或拼音排序，这样练到的字正好是刚学过的词里的字。
 */

import type { CnWord } from '../types'

/** CJK 基本区 + 扩展 A + 兼容表意文字（与 scripts/gen-hanzi.mjs 保持同一套判定） */
const HANZI = /[㐀-䶿一-鿿豈-﫿]/

export function isHanzi(ch: string): boolean {
  return ch.length === 1 && HANZI.test(ch)
}

/** 逐字拆开再去重，保持首次出现的顺序 */
export function charsOf(words: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const word of words) {
    for (const ch of word) {
      if (isHanzi(ch) && !seen.has(ch)) {
        seen.add(ch)
        out.push(ch)
      }
    }
  }
  return out
}

/** 字 → 首次出现它的词条（字卡上要显示拼音和释义，得知道这个字来自哪个词） */
export function charSourceMap(words: CnWord[]): Map<string, CnWord> {
  const map = new Map<string, CnWord>()
  for (const w of words) {
    for (const ch of w.word) {
      if (isHanzi(ch) && !map.has(ch)) map.set(ch, w)
    }
  }
  return map
}

/** 可练队列：只保留有笔顺数据的字，没有数据的字直接跳过，避免运行时 404 */
export function buildCharQueue(words: CnWord[], available: Set<string>): string[] {
  return charsOf(words.map(w => w.word)).filter(ch => available.has(ch))
}
