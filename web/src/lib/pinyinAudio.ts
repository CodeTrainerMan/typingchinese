/**
 * 拼音「示范音」→ 真人录音文件名的换算。
 *
 * 音频库按「不带声调的音节 + 声调数字」命名（bō → bo1.mp3），
 * 表里存的是带声调的 py，这里换算一次即可，不必再维护一张映射表。
 */

/** 带调字母 → [基字母, 声调] */
const TONED: Record<string, [string, number]> = {
  'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
  'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
  'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
  'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
  'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
  'ǖ': ['ü', 1], 'ǘ': ['ü', 2], 'ǚ': ['ü', 3], 'ǜ': ['ü', 4],
}

/** 录音放在 public/audio/pinyin/ 下 */
export const PINYIN_AUDIO_DIR = '/audio/pinyin'

/** 'bō' → 'bo1.mp3'；读不出声调（说明不是带调拼音）就返回 null */
export function pinyinAudioFile(py: string): string | null {
  let base = ''
  let tone = 0
  for (const ch of py) {
    const hit = TONED[ch]
    if (hit) {
      base += hit[0]
      tone = hit[1]
    } else {
      base += ch
    }
  }
  return tone ? `${base}${tone}.mp3` : null
}
