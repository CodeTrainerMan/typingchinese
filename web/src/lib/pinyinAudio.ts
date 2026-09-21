/**
 * 拼音「示范音」→ 录音文件名的换算。
 *
 * 录音按「拼音元素本体」命名（声母 b → b.mp3、韵母 ui → ui.mp3、整体认读 zhi → zhi.mp3），
 * 所以点击格子听到的就是这个音本身，不是借来的某个字。
 *
 * 少量格子没有独立录音，退回「不带声调的音节 + 声调数字」命名（ma1.mp3、er2.mp3）。
 */

/** 录音放在 public/audio/pinyin/ 下 */
export const PINYIN_AUDIO_DIR = '/audio/pinyin'

/**
 * 只有这几格的录音文件不叫本体名：y / w 与 yi / wu 名称音就是 i / u，
 * 共用 i.mp3 / u.mp3；yu 复用 ü 的 v.mp3。其余格子都用「本体名.mp3」，
 * 同音格（ye 与 ie、yue 与 üe、yin 与 in…）是各自存了一份相同录音。
 */
const ALIAS: Record<string, string> = {
  y: 'i', w: 'u', yi: 'i', wu: 'u', yu: 'v',
}

/** 这几格没有标准录音，退回「音节 + 声调」的命名 */
const NO_RECORDING = new Set(['er'])

/** 带调字母 → [基字母, 声调] */
const TONED: Record<string, [string, number]> = {
  'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
  'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
  'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
  'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
  'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
  'ǖ': ['ü', 1], 'ǘ': ['ü', 2], 'ǚ': ['ü', 3], 'ǜ': ['ü', 4],
}

/** 'mā' → 'ma1.mp3'；读不出声调（不是带调拼音）返回 null，由调用方退回 TTS */
function toneFile(py: string): string | null {
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

/**
 * 取一个拼音格的录音文件名。
 * symbol 是格子里的本体（'b'、'ui'、'zhi'），四声那几格传的是带调音节（'mā'），
 * 后者走 toneFile 回退。
 */
export function pinyinAudioFile(symbol: string, py: string): string | null {
  const isPlain = /^[a-zü]+$/.test(symbol)
  if (isPlain && !NO_RECORDING.has(symbol)) {
    return `${ALIAS[symbol] ?? symbol.replace(/ü/g, 'v')}.mp3`
  }
  return toneFile(py)
}
