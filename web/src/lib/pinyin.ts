import type { CnWord, TypingMode } from './types'

/** 取当前判定模式下的目标串 */
export function getTarget(word: CnWord, mode: TypingMode): string {
  if (mode === 'initials') return word.initials
  if (mode === 'tone') return word.toneNum.replace(/\s+/g, '')
  return word.flat
}

/** 取当前判定模式下的目标音节数组 */
export function getTargetSyllables(word: CnWord, mode: TypingMode): string[] {
  if (mode === 'initials') return [...word.word].map((_, i) => word.initials[i] ?? '')
  if (mode === 'tone') return word.toneNum.split(/\s+/).filter(Boolean)
  return word.syllables
}

/** 把判定串里的 v 还原成 ü 用于展示 */
export function prettyFlat(flat: string): string {
  return flat.replace(/v/g, 'ü')
}
