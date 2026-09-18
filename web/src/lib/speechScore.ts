/**
 * 跟读打分：用浏览器语音识别听一遍，再和目标句比对相似度。
 * 只有 Chromium 系（Chrome / Edge）支持 SpeechRecognition，其它浏览器界面会自动隐藏入口。
 */

interface SRAlternative {
  transcript: string
}
interface SRResultLike {
  0: SRAlternative
  isFinal: boolean
  length: number
}
interface SRResultListLike {
  length: number
  [index: number]: SRResultLike
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: { results: SRResultListLike }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognitionLike }
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike }
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition)
}

/** 听一次：拿到最终识别文本；没听清 / 超时 / 不支持都会 reject */
export function listenOnce(lang = 'zh-CN', timeoutMs = 8000): Promise<string> {
  return new Promise((resolve, reject) => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Ctor) {
      reject(new Error('speech recognition unsupported'))
      return
    }
    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = false
    rec.maxAlternatives = 1

    let settled = false
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn()
    }
    const timer = setTimeout(() => finish(() => {
      rec.stop()
      reject(new Error('timeout'))
    }), timeoutMs)

    rec.onresult = event => {
      const text = Array.from({ length: event.results.length }, (_, i) => event.results[i][0].transcript).join('')
      finish(() => resolve(text))
    }
    rec.onerror = () => finish(() => reject(new Error('recognize failed')))
    rec.onend = () => finish(() => reject(new Error('no speech')))
    rec.start()
  })
}

/** 归一化：只留文字和数字，标点空格不影响打分 */
function normalize(text: string): string {
  return text.replace(/[^\p{L}\p{N}]/gu, '')
}

/** 编辑距离（Levenshtein） */
function editDistance(a: string, b: string): number {
  if (a === b) return 0
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
    prev = cur
  }
  return prev[b.length]
}

/** 与目标文本的相似度 0~1 */
export function textSimilarity(target: string, heard: string): number {
  const a = normalize(target)
  const b = normalize(heard)
  if (!a.length || !b.length) return 0
  return Math.max(0, 1 - editDistance(a, b) / Math.max(a.length, b.length))
}

/** 跟读得分 0~100 */
export function scoreRead(target: string, heard: string): number {
  return Math.round(textSimilarity(target, heard) * 100)
}
