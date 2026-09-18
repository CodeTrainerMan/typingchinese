/** 文章练习：把短文切成句子，再生成与词库同构的词条交给打字引擎 */

import type { CnWord } from './types'
import { buildWords } from './customDict'

export interface ArticleResource {
  id: string
  title: string
  desc: string
  level: string
  /** 正文，句末用中文标点即可，切句时会去掉标点 */
  text: string
}

/**
 * 切句：按中文标点和换行断开，只保留含汉字的片段。
 * 标点不参与打字判定，否则打不出来会卡住。
 */
export function splitSentences(text: string): string[] {
  return text
    .split(/[^\p{Script=Han}a-zA-Z0-9]+/u)
    .map(s => s.trim())
    .filter(s => s && /\p{Script=Han}/u.test(s))
}

/** 切口控制在 4~20 字，太长的句子再按长度二次切分 */
export function toPracticeUnits(sentences: string[], min = 4, max = 20): string[] {
  const out: string[] = []
  for (const s of sentences) {
    if ([...s].length <= max) {
      if ([...s].length >= 1) out.push(s)
      continue
    }
    let buf = ''
    for (const ch of s) {
      buf += ch
      if ([...buf].length >= max) {
        out.push(buf)
        buf = ''
      }
    }
    if (buf) out.push(buf)
  }
  // 过短的片段并入上一段，避免出现「1 个字」的练习单元
  const merged: string[] = []
  for (const unit of out) {
    if ([...unit].length < min && merged.length) merged[merged.length - 1] += unit
    else merged.push(unit)
  }
  return merged
}

/** 生成练习词条：一个片段一个「词」，拼音由 pinyin-pro 现场生成 */
export async function buildArticleWords(text: string): Promise<CnWord[]> {
  const units = toPracticeUnits(splitSentences(text))
  return buildWords(
    units.map(u => ({ word: u, trans: '' })),
    'article'
  )
}
