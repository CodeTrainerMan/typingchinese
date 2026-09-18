/** 自定义词库：把用户粘贴的文本解析成词条，并用 pinyin-pro 现场生成拼音 */

import type { CnWord, LearningDict, RichField } from './types'

/** 一条待生成词条的记录；富化字段全部可选，没有就不显示对应区块 */
export interface RawEntry {
  word: string
  trans: string
  pos?: string
  traditional?: string
  radical?: string
  example?: string
  exampleTrans?: string
  synonyms?: string
  antonyms?: string
  collocations?: string
}

/** 富化字段的顺序：导入解析、CSV 导出、详情页表单都按它排列 */
export const RICH_KEYS: RichField[] = [
  'pos',
  'traditional',
  'radical',
  'example',
  'exampleTrans',
  'synonyms',
  'antonyms',
  'collocations',
]

/**
 * 表头列名 → 字段：中英文都认（导出的 CSV 表头跟随界面语言，用户手写的表头也可能是中文）
 * norm() 会把空格、下划线、括号一起去掉，所以 Example sentence / example_sentence 都能命中。
 */
const COL_ALIASES: Record<keyof RawEntry, string[]> = {
  word: ['词语', '汉字', '词', 'word', 'character', 'hanzi'],
  trans: ['释义', '翻译', '意思', '解释', 'trans', 'translation', 'meaning', 'definition'],
  pos: ['词性', 'pos', 'partofspeech'],
  traditional: ['繁体', '繁體', 'traditional', 'traditionalchinese'],
  radical: ['部首', 'radical'],
  example: ['例句', '例子', 'example', 'sentence'],
  exampleTrans: ['例句翻译', '例句释义', '例句解释', 'exampletrans', 'exampletranslation', 'sentencetranslation'],
  synonyms: ['同义', '同义词', 'synonyms', 'synonym'],
  antonyms: ['反义', '反义词', 'antonyms', 'antonym'],
  collocations: ['搭配', '词组', 'collocations', 'collocation'],
}

const norm = (s: string) => s.trim().toLowerCase().replace(/[\s_()（）-]/g, '')

function colIndex(header: string[], field: keyof RawEntry): number {
  return header.findIndex(h => COL_ALIASES[field].includes(norm(h)))
}

/** 按 , 或 Tab 切列；支持双引号包裹，否则例句里的逗号会把句子切碎 */
export function splitRow(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else quoted = false
      } else cur += ch
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',' || ch === '\t') {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

/** CSV 单元转义：含逗号 / 引号 / 换行时用双引号包裹 */
export function csvCell(value: string): string {
  return /[",\n\r\t]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
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

/** 用 pinyin-pro 生成与预置词库完全同构的词条；富化字段原样透传（空值不落盘） */
export async function buildWords(entries: RawEntry[], idPrefix = 'custom'): Promise<CnWord[]> {
  const { pinyin } = await import('pinyin-pro')
  const stamp = Date.now().toString(36)

  return entries.map((entry, index) => {
    const word = entry.word
    const toneArr = pinyin(word, { type: 'array', toneType: 'symbol' })
    const flatArr = pinyin(word, { type: 'array', toneType: 'none', v: true }).map(toV)
    const toneNumArr = pinyin(word, { type: 'array', toneType: 'num', v: true }).map(toV)
    const firstArr = pinyin(word, { type: 'array', pattern: 'first', toneType: 'none', v: true }).map(toV)
    const rich: Partial<Pick<CnWord, RichField>> = {}
    for (const key of RICH_KEYS) {
      const value = entry[key]
      if (value && value.trim()) rich[key] = value.trim()
    }
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
      ...rich,
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

/** JSON 里取值：字段本身、中文别名、数组都认 */
function readField(rec: Record<string, unknown>, field: keyof RawEntry): string {
  const keys = [field, ...COL_ALIASES[field]]
  for (const key of keys) {
    const value = rec[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (Array.isArray(value) && value.length) return value.map(String).join('、')
  }
  // 兼容 example_trans 这类下划线写法
  const snake = field.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`)
  if (snake !== field) {
    const value = rec[snake]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (Array.isArray(value) && value.length) return value.map(String).join('、')
  }
  return ''
}

/**
 * 解析上传的词库文件：
 * - .json：词条数组 `[{word, trans, example …}]` 或完整词库 `{ words: [...] }`
 * - .csv / .txt：首行是表头时按列名取「词语 / 释义 / 例句 / 词性 …」（拼音列忽略），否则逐行「词语,释义」
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
      const entry: RawEntry = { word, trans: readField(rec, 'trans') }
      for (const key of RICH_KEYS) {
        const value = readField(rec, key)
        if (value) entry[key] = value
      }
      out.push(entry)
    }
    return out
  }
  // CSV / TXT：有表头就按列取值，拼音列不影响释义
  const clean = text.replace(/^\uFEFF/, '')
  const lines = clean.split(/\r?\n/)
  const header = splitRow(lines[0] ?? '')
  const wordIdx = colIndex(header, 'word')
  if (wordIdx >= 0) {
    const transIdx = colIndex(header, 'trans')
    const richIdx = {} as Record<RichField, number>
    for (const key of RICH_KEYS) richIdx[key] = colIndex(header, key)
    // 出现富化列后释义只取自己那一列；否则沿用「从释义列起后面全合并」的兼容写法
    const hasRich = RICH_KEYS.some(key => richIdx[key] >= 0)
    const out: RawEntry[] = []
    for (const line of lines.slice(1)) {
      if (!line.trim()) continue
      const cols = splitRow(line)
      const word = cols[wordIdx] ?? ''
      if (!word || !/[一-龥]/.test(word)) continue
      const trans = transIdx >= 0 ? (hasRich ? (cols[transIdx] ?? '') : cols.slice(transIdx).join(' ').trim()) : ''
      const entry: RawEntry = { word, trans }
      for (const key of RICH_KEYS) {
        const value = richIdx[key] >= 0 ? (cols[richIdx[key]] ?? '') : ''
        if (value) entry[key] = value
      }
      out.push(entry)
    }
    return out
  }
  return parseEntries(clean).filter(e => e.word !== '词语')
}
