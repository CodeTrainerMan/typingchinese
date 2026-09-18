/** 中文发音：Web Speech API（zh-CN） */

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** 中文音色列表；voices 是异步就绪的，需要监听 voiceschanged */
export function listZhVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    if (!isTtsSupported()) return resolve([])
    const load = () =>
      resolve(
        window.speechSynthesis
          .getVoices()
          .filter(v => v.lang.toLowerCase().startsWith('zh'))
          .sort((a, b) => Number(b.localService) - Number(a.localService))
      )
    const voices = window.speechSynthesis.getVoices()
    if (voices.length) return load()
    window.speechSynthesis.onvoiceschanged = load
  })
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

export function speak(text: string, options: SpeakOptions = {}) {
  if (!text || !isTtsSupported()) {
    options.onEnd?.()
    return
  }
  cancelSpeak()
  const msg = new SpeechSynthesisUtterance(text)
  msg.lang = 'zh-CN'
  msg.rate = options.rate ?? 1
  msg.volume = options.volume ?? 1
  msg.pitch = options.pitch ?? 1

  const apply = () => {
    if (options.voiceURI) {
      const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === options.voiceURI)
      if (voice) msg.voice = voice
    }
    msg.onend = () => options.onEnd?.()
    msg.onerror = () => options.onEnd?.()
    window.speechSynthesis.speak(msg)
  }

  if (window.speechSynthesis.getVoices().length) apply()
  else window.speechSynthesis.onvoiceschanged = apply
}
