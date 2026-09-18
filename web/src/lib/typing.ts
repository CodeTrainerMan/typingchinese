/**
 * 拼音打字判定（路线 A）
 *
 * 目标串是纯 ASCII 拉丁串（如 zhongguo / lvyou），所以判定逻辑与英文打字完全一致，
 * 这里移植自 TypeWords 的 visible-word-typing.ts，并额外处理中文特有的 ü / v 等价。
 */

export interface InputCharState {
  char: string
  target: string | undefined
  correct: boolean
}

/** ü 在键盘上打 v，因此把目标串里的 ü 统一视作 v */
export function normalizeTargetChar(char: string): string {
  if (char === 'ü' || char === 'ǖ' || char === 'ǘ' || char === 'ǚ' || char === 'ǜ') return 'v'
  return char.toLowerCase()
}

export function normalizeInputChar(char: string): string {
  return char.toLowerCase()
}

export function isCharCorrect(input: string, target: string | undefined): boolean {
  if (target === undefined) return false
  return normalizeInputChar(input) === normalizeTargetChar(target)
}

export function getInputCharStates(input: string, target: string): InputCharState[] {
  return [...input].map((char, index) => ({
    char,
    target: target[index],
    correct: isCharCorrect(char, target[index]),
  }))
}

export function getFirstWrongIndex(input: string, target: string): number {
  return getInputCharStates(input, target).findIndex(item => !item.correct)
}

export function isComplete(input: string, target: string): boolean {
  return input.length === target.length
}

export function isCorrect(input: string, target: string): boolean {
  return isComplete(input, target) && getFirstWrongIndex(input, target) === -1
}

/** 打错后一次退到第一个错字处（TypeWords 同款策略） */
export function afterWrongBackspace(input: string, target: string): string {
  const firstWrong = getFirstWrongIndex(input, target)
  return firstWrong === -1 ? input.slice(0, -1) : input.slice(0, firstWrong)
}

export interface SyllableGroup {
  /** 音节在完整串中的起始下标 */
  offset: number
  display: string // 展示用（带声调，如 lǚ）
  plain: string // 判定用（如 lv）
  chars: InputCharState[]
}

/**
 * 把已输入内容按音节分组，便于 UI 上「一个汉字对应一块拼音」地染色。
 * 例如 target=zhongguo, syllables=[zhong,guo], input=zhon
 * → [{plain:'zhong', chars:[z,h,o,n]}, {plain:'guo', chars:[]}]
 */
export function getSyllableGroups(
  input: string,
  syllables: string[],
  displaySyllables: string[] = syllables
): SyllableGroup[] {
  const groups: SyllableGroup[] = []
  let offset = 0
  syllables.forEach((plain, index) => {
    const slice = input.slice(offset, offset + plain.length)
    groups.push({
      offset,
      plain,
      display: displaySyllables[index] ?? plain,
      chars: getInputCharStates(slice, plain),
    })
    offset += plain.length
  })
  return groups
}

/** 准确率：正确字符数 / 总输入字符数 */
export function accuracy(correctChars: number, totalChars: number): number {
  if (!totalChars) return 100
  return Math.round((correctChars / totalChars) * 1000) / 10
}

/** 速度：每分钟击键数（KPM）与每分钟字数（CPM） */
export function speed(keystrokes: number, words: number, spendMs: number) {
  const minutes = spendMs / 60000
  if (minutes <= 0) return { kpm: 0, cpm: 0 }
  return {
    kpm: Math.round(keystrokes / minutes),
    cpm: Math.round(words / minutes),
  }
}
