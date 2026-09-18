/** 按键音 / 错误提示音 / 正确提示音：WebAudio 生成，无需音频资源 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, duration: number, volume: number, type: OscillatorType = 'sine') {
  const audio = getCtx()
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration)
  osc.connect(gain).connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + duration)
}

export function playKeySound() {
  tone(1400 + Math.random() * 200, 0.03, 0.05, 'square')
}

export function playWrong() {
  tone(180, 0.18, 0.12, 'sawtooth')
}

export function playCorrectSound() {
  tone(880, 0.08, 0.08, 'sine')
  setTimeout(() => tone(1320, 0.1, 0.08, 'sine'), 80)
}
