import { describe, expect, it, vi } from 'vitest'

/**
 * Web Speech API 的最小替身。真实浏览器里 utterance.voice 有 WebIDL 类型检查，
 * 这里用普通类代替，正好可以验证「只赋真实 voice、绝不赋 null」这条关键约束。
 */
function installTts(voices: { voiceURI: string; name: string; lang: string }[]) {
  const spoken: {
    text: string
    lang: string
    rate: number
    volume: number
    voice: unknown
  }[] = []
  const listeners = new Set<() => void>()
  const synth = {
    getVoices: () => voices,
    speak: (u: { text: string; lang: string; rate: number; volume: number; voice: unknown }) =>
      spoken.push(u),
    cancel: vi.fn(),
    addEventListener: (type: string, fn: () => void) => {
      if (type === 'voiceschanged') listeners.add(fn)
    },
    removeEventListener: (_type: string, fn: () => void) => listeners.delete(fn),
    speaking: false,
    pending: false,
    onvoiceschanged: null as unknown,
  }
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { speechSynthesis: synth },
  })
  Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: class {
      text: string
      lang = ''
      rate = 1
      volume = 1
      pitch = 1
      voice: unknown = undefined
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(text: string) {
        this.text = text
      }
    },
  })
  return { spoken, synth, listeners }
}

async function load(voices: { voiceURI: string; name: string; lang: string }[] = []) {
  vi.resetModules()
  const env = installTts(voices)
  const tts = await import('./tts')
  return { ...env, tts }
}

const ZH = { voiceURI: 'zh-CN-local', name: 'Chinese', lang: 'zh-CN' }
const EN = { voiceURI: 'en-US-local', name: 'English', lang: 'en-US' }

describe('speak（移动端发音修复）', () => {
  it('音色未就绪也同步发音，不挂 onvoiceschanged、不赋 null', async () => {
    const { tts, spoken, synth, listeners } = await load([])
    tts.speak('城市')
    expect(spoken).toHaveLength(1)
    expect(spoken[0]).toMatchObject({ text: '城市', lang: 'zh-CN' })
    expect(spoken[0].voice).toBeUndefined()
    expect(synth.onvoiceschanged).toBeNull()
    expect(listeners.size).toBe(0)
  })

  it('有中文音色时自动选中，不用系统默认的英文音色', async () => {
    const { tts, spoken } = await load([EN, ZH])
    tts.speak('城市')
    expect(spoken[0].voice).toBe(ZH)
  })

  it('设置里手动指定的音色优先', async () => {
    const { tts, spoken } = await load([ZH, EN])
    tts.speak('城市', { voiceURI: EN.voiceURI })
    expect(spoken[0].voice).toBe(EN)
  })

  it('语速音量按设置传入', async () => {
    const { tts, spoken } = await load([ZH])
    tts.speak('城市', { rate: 0.8, volume: 0.5 })
    expect(spoken[0]).toMatchObject({ rate: 0.8, volume: 0.5 })
  })

  it('120ms 内同一句不叠播，换词或间隔够了照常播', async () => {
    const { tts, spoken } = await load([ZH])
    tts.speak('城市')
    tts.speak('城市')
    expect(spoken).toHaveLength(1)
    tts.speak('工作')
    expect(spoken).toHaveLength(2)
  })

  it('不支持 TTS 时不抛错，并回调 onEnd', async () => {
    const { tts } = await load([])
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} })
    const onEnd = vi.fn()
    expect(() => tts.speak('城市', { onEnd })).not.toThrow()
    expect(onEnd).toHaveBeenCalled()
  })
})

describe('listZhVoices', () => {
  it('音色已就绪时直接返回中文音色', async () => {
    const { tts } = await load([EN, ZH])
    await expect(tts.listZhVoices()).resolves.toEqual([ZH])
  })

  it('未就绪时用 addEventListener 等待，不覆盖 onvoiceschanged', async () => {
    const { tts, synth, listeners } = await load([])
    const pending = tts.listZhVoices()
    expect(listeners.size).toBe(1)
    expect(synth.onvoiceschanged).toBeNull()
    // 另一个调用方也要能同时等待，两者互不覆盖
    const pending2 = tts.listZhVoices()
    expect(listeners.size).toBe(2)
    listeners.forEach(fn => fn())
    await expect(pending).resolves.toEqual([])
    await expect(pending2).resolves.toEqual([])
  })
})

describe('unlockSpeech', () => {
  it('只在首次手势预热一次，且是静音空文本', async () => {
    const { tts, spoken } = await load([])
    tts.unlockSpeech()
    tts.unlockSpeech()
    expect(spoken).toHaveLength(1)
    expect(spoken[0]).toMatchObject({ text: '', volume: 0 })
  })
})
