/** 中文发音：Web Speech API（zh-CN） */

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/**
 * 中文音色列表；voices 是异步就绪的。
 * 用 addEventListener 而不是赋值 onvoiceschanged：后者会被其它调用方覆盖
 * （speak 与 listZhVoices 同时用时，先挂的回调永远不执行），移动端表现是
 * 「音色探测 Promise 不 resolve → 听写步骤降级判断失效」。
 * 另外部分移动浏览器永不触发 voiceschanged，加超时兜底。
 */
export function listZhVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    if (!isTtsSupported()) return resolve([])
    const zh = () =>
      window.speechSynthesis
        .getVoices()
        .filter(v => v.lang.toLowerCase().startsWith('zh'))
        .sort((a, b) => Number(b.localService) - Number(a.localService))
    if (window.speechSynthesis.getVoices().length) return resolve(zh())
    const done = () => resolve(zh())
    window.speechSynthesis.addEventListener('voiceschanged', done, { once: true })
    setTimeout(done, 1500)
  })
}

/**
 * 取实际要用的音色：界面语言单独记住的优先，其次是全局音色。
 * 这样英文界面和中文界面可以各选一个音色（浏览器提供的中文音色质量差别很大）。
 */
export function resolveVoiceURI(
  voiceURI: string,
  voiceByLang: Record<string, string> | undefined,
  lang: string
): string {
  return voiceByLang?.[lang] || voiceURI || ''
}

export interface SpeakOptions {
  rate?: number
  volume?: number
  pitch?: number
  voiceURI?: string
  onEnd?: () => void
}

export function cancelSpeak() {
  if (!isTtsSupported()) return
  window.speechSynthesis.cancel()
}

/**
 * 首次用户手势时预热语音引擎。
 * iOS / 很多 Android WebView 要求 speechSynthesis.speak 在用户手势里被「解锁」过，
 * 否则后续由 effect（自动发音）发起的调用会静默失败。放一段空文本、音量 0。
 */
let unlocked = false
export function unlockSpeech() {
  if (!isTtsSupported() || unlocked) return
  unlocked = true
  try {
    const warm = new SpeechSynthesisUtterance('')
    warm.volume = 0
    window.speechSynthesis.speak(warm)
  } catch {
    // 预热失败不影响后续真正发音
  }
}

let lastSpeak = { text: '', at: 0 }

export function speak(text: string, options: SpeakOptions = {}) {
  if (!text || !isTtsSupported()) {
    options.onEnd?.()
    return
  }

  // React dev StrictMode 会双跑 effect，快速连点也会重复触发。
  // 同一句在 120ms 内只念一次，否则移动端会听到两声重叠的回声。
  const now = Date.now()
  if (lastSpeak.text === text && now - lastSpeak.at < 120) {
    options.onEnd?.()
    return
  }
  lastSpeak = { text, at: now }

  const synth = window.speechSynthesis
  // 只在确实有播放任务时 cancel：iOS 上「先 cancel 再立刻 speak」偶发吞掉下一句
  if (synth.speaking || synth.pending) synth.cancel()

  const msg = new SpeechSynthesisUtterance(text)
  msg.lang = 'zh-CN'
  msg.rate = options.rate ?? 1
  msg.volume = options.volume ?? 1
  msg.pitch = options.pitch ?? 1

  const voices = synth.getVoices()
  const picked = options.voiceURI
    ? voices.find(v => v.voiceURI === options.voiceURI)
    : undefined
  // 没手动选音色时显式挑中文音色。移动端默认音色常常是英文，
  // 不指定就会用英文腔读汉字，甚至直接不发声。
  const voice = picked ?? voices.find(v => v.lang.toLowerCase().startsWith('zh'))
  // 只在拿到真实 voice 时赋值：utterance.voice 不接受 null/undefined，
  // 强行赋值会抛 TypeError 并让这一句彻底不发声。
  if (voice) msg.voice = voice

  msg.onend = () => options.onEnd?.()
  msg.onerror = () => options.onEnd?.()

  // 必须在当前调用栈里 speak：不能等 voiceschanged 异步回调，
  // 那样会脱离用户手势被移动端浏览器拒绝。音色尚未就绪时先用默认音色播这一句，
  // 就绪后的下一次调用自然会带上中文音色。
  synth.speak(msg)
}
