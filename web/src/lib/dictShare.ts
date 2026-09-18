/**
 * 词库分享：导出 JSON 文件，或把词库编成一段码放进链接里，对方打开就自动导入。
 * 拼音不进分享内容——导入时会用 pinyin-pro 现场生成，体积小很多。
 */

import type { LearningDict } from './types'
import { RICH_KEYS, type RawEntry } from './customDict'

/** 分享用的词库结构；v 是版本号，以后改结构好兼容 */
export interface SharedDict {
  v: 1
  name: string
  description: string
  category: string
  tags: string[]
  level: number
  words: RawEntry[]
}

/** 链接长度上限：超过就别塞链接了，改用文件导出 */
export const SHARE_URL_LIMIT = 8000

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach(b => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)))
}

/** 词库转成分享结构：只留文字信息 */
export function dictToShared(dict: LearningDict): SharedDict {
  return {
    v: 1,
    name: dict.name,
    description: dict.description,
    category: dict.category,
    tags: dict.tags,
    level: dict.level,
    words: dict.words.map(w => {
      const entry: RawEntry = { word: w.word, trans: w.trans ?? '' }
      for (const key of RICH_KEYS) {
        const value = w[key]
        if (value && value.trim()) entry[key] = value.trim()
      }
      return entry
    }),
  }
}

export function encodeShare(dict: LearningDict): string {
  return toBase64Url(JSON.stringify(dictToShared(dict)))
}

/** 分享链接：带上 origin，别人粘到浏览器就能开 */
export function shareUrl(dict: LearningDict): string {
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  return `${origin}/dicts?share=${encodeShare(dict)}`
}

/** 解析分享码 / 分享链接，认不出就返回 null */
export function decodeShare(input: string): SharedDict | null {
  const raw = input.trim()
  if (!raw) return null
  // 整条链接也能粘进来：把 ?share= 后面的码抠出来
  let code = raw
  const hit = /[?&]share=([^&#]+)/.exec(raw)
  if (hit) code = decodeURIComponent(hit[1])
  try {
    const data = JSON.parse(fromBase64Url(code)) as SharedDict
    if (!data || !Array.isArray(data.words)) return null
    return data
  } catch {
    return null
  }
}

/** 触发一次文件下载 */
export function downloadText(filename: string, text: string, mime = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** 导出成 .json 文件（可被「上传文件」直接读回） */
export function exportDictFile(dict: LearningDict) {
  downloadText(`${dict.name.replace(/[\\/:*?"<>|]/g, '_')}.json`, JSON.stringify(dictToShared(dict), null, 2))
}
