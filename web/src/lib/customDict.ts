/** 自定义词库：把用户粘贴的文本解析成词条，并用 pinyin-pro 现场生成拼音 */

import type { CnWord, LearningDict } from './types'

export interface RawEntry {
  word: string
  trans: string
}

/** pinyin-pro 部分版本把 v:true 输出成 ü，统一兜底 */
const toV = (s: string) => s.replace(/ü/g, 'v')

/**
 * 逐行解析，支持「词语 释义」「词语,释义」「词语=释义」「词语<Tab>释义」，只留含汉字的词并去重。
 * `#` 开头的行当注释跳过。
 */
export function parseEntries(text: string): RawEntry[] {
  const seen = new Set<string>()
  const out: RawEntry[] = []
  // Excel 导出的 CSV 常带 UTF-8 BOM，不去掉会把「词语」表头当成第一个词
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [first, ...rest] = trimmed.split(/[,，、\t=:：]+/)
    const word = (first ?? '').trim()
    if (!word || !/[一-龥]/.test(word)) continue
    if (seen.has(word)) continue
    seen.add(word)
    out.push({ word, trans: rest.join(' ').trim() })
  }
  return out
}

/** 用 pinyin-pro 生成与预置词库完全同构的词条 */
export async function buildWords(entries: RawEntry[], idPrefix = 'custom'): Promise<CnWord[]> {
  const { pinyin } = await import('pinyin-pro')
  const stamp = Date.now().toString(36)

  return entries.map((entry, index) => {
    const word = entry.word
    const toneArr = pinyin(word, { type: 'array', toneType: 'symbol' })
    const flatArr = pinyin(word, { type: 'array', toneType: 'none', v: true }).map(toV)
    const toneNumArr = pinyin(word, { type: 'array', toneType: 'num', v: true }).map(toV)
    const firstArr = pinyin(word, { type: 'array', pattern: 'first', toneType: 'none', v: true }).map(toV)
    return {
      id: `${idPrefix}-${stamp}-${index}`,
      word,
      pinyin: toneArr,
      flat: flatArr.join(''),
      flatSpaced: flatArr.join(' '),
      toneNum: toneNumArr.join(' '),
      initials: firstArr.join(''),
      syllables: flatArr,
      trans: entry.trans,
      length: word.length,
    }
  })
}

/**
 * 用已解析好的词条建库（上传文件走这条，避免拼音列混进释义）
 *
 * 默认名 / 描述 / 分类由调用方按当前语言传入（本模块是纯函数，不引 i18n）；
 * 没传时退回中文，保证类型与旧数据一致。
 */
export async function buildCustomDictFromEntries(
  name: string,
  entries: RawEntry[],
  meta?: { fallbackName?: string; description?: (count: number) => string; category?: string }
): Promise<LearningDict> {
  const words = await buildWords(entries)
  const id = `custom-${Date.now().toString(36)}`
  const category = meta?.category ?? '自定义'
  return {
    id,
    name: name.trim() || (meta?.fallbackName ?? '我的词库'),
    description: meta?.description?.(words.length) ?? `自定义导入，共 ${words.length} 词`,
    category,
    tags: [category],
    level: 1,
    length: words.length,
    url: '',
    words,
    lastLearnIndex: 0,
    perDayStudyNumber: 20,
    addedAt: Date.now(),
  }
}

export async function buildCustomDict(
  name: string,
  text: string,
  meta?: Parameters<typeof buildCustomDictFromEntries>[2]
): Promise<LearningDict> {
  return buildCustomDictFromEntries(name, parseEntries(text), meta)
}

/**
 * 解析上传的词库文件：
 * - .json：词条数组 `[{word, trans}]` 或完整词库 `{ words: [...] }`
 * - .csv / .txt：首行是表头时按列名取「词语 / 释义」（拼音列忽略），否则逐行「词语,释义」
 * 解析失败会抛错，由调用方提示用户。
 */
export function parseDictFile(text: string, filename: string): RawEntry[] {
  if (filename.toLowerCase().endsWith('.json')) {
    const data = JSON.parse(text) as unknown
    const holder = data as { words?: unknown } | null
    const list: unknown[] = Array.isArray(data) ? data : Array.isArray(holder?.words) ? (holder!.words as unknown[]) : []
    const out: RawEntry[] = []
    for (const item of list) {
      const rec = (item ?? {}) as Record<string, unknown>
      const word = typeof rec.word === 'string' ? rec.word.trim() : ''
      if (!word || !/[一-龥]/.test(word)) continue
      out.push({ word, trans: typeof rec.trans === 'string' ? rec.trans : '' })
    }
    return out
  }
  // CSV / TXT：有表头就按列取值，拼音列不影响释义
  const clean = text.replace(/^\uFEFF/, '')
  const lines = clean.split(/\r?\n/)
  const header = (lines[0] ?? '').split(/[,\t]+/).map(s => s.trim())
  const wordIdx = header.findIndex(h => h === '词语' || h === '汉字' || h.toLowerCase() === 'word')
  if (wordIdx >= 0) {
    // 中英文列名都认：导出文件的表头会跟随界面语言
    const isTrans = (h: string) =>
      ['释义', '翻译', '意思', '解释', 'trans', 'translation', 'meaning'].includes(h.toLowerCase())
    const transIdx = header.findIndex(isTrans)
    const out: RawEntry[] = []
    for (const line of lines.slice(1)) {
      if (!line.trim()) continue
      const cols = line.split(/[,\t]+/).map(s => s.trim())
      const word = cols[wordIdx] ?? ''
      if (!word || !/[一-龥]/.test(word)) continue
      // 释义可能在最后几列，剩下的合并，避免英文逗号把句子切碎
      out.push({ word, trans: transIdx >= 0 ? cols.slice(transIdx).join(' ').trim() : '' })
    }
    return out
  }
  return parseEntries(clean).filter(e => e.word !== '词语')
}
