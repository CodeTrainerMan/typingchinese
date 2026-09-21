'use client'

import { useCallback, useEffect, useState } from 'react'
import { listZhVoices, resolveVoiceURI, speak } from './tts'
import { useSettingStore } from './store/setting'
import { PINYIN_AUDIO_DIR, pinyinAudioFile } from './pinyinAudio'

/**
 * 念一段中文（语速 / 音量 / 音色跟随设置页的选择，与练习页发音一致）。
 * 速查表和小测都用这个，避免两处各写一遍参数。
 */
export function useSpeak(): (text: string) => void {
  const soundSpeed = useSettingStore(s => s.soundSpeed)
  const soundVolume = useSettingStore(s => s.soundVolume)
  const voiceURI = useSettingStore(s => s.voiceURI)
  const voiceByLang = useSettingStore(s => s.voiceByLang)
  const lang = useSettingStore(s => s.lang)

  return useCallback(
    (text: string) => {
      speak(text, {
        rate: soundSpeed,
        volume: soundVolume / 100,
        voiceURI: resolveVoiceURI(voiceURI, voiceByLang, lang),
      })
    },
    [soundSpeed, soundVolume, voiceURI, voiceByLang, lang]
  )
}

/**
 * 浏览器里有没有可用的中文音色：null = 还没探测出来（音色列表是异步就绪的）。
 * 没有音色时听写步骤必须降级（见 practice/flow 的 withoutAudioStep）。
 */
export function useZhVoiceAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    listZhVoices().then(voices => {
      if (alive) setAvailable(voices.length > 0)
    })
    return () => {
      alive = false
    }
  }, [])

  return available
}

/**
 * 念一个拼音示范音：优先播放真人录音 mp3，没有录音或播放失败时退回浏览器 TTS。
 * 速查表和小测都走这个，TTS 只当兜底。
 */
export function usePinyinSound(): (item: { symbol: string; py: string; hanzi: string }) => void {
  const tts = useSpeak()
  const soundVolume = useSettingStore(s => s.soundVolume)

  return useCallback(
    (item: { symbol: string; py: string; hanzi: string }) => {
      const file = pinyinAudioFile(item.symbol, item.py)
      if (!file) {
        tts(item.hanzi)
        return
      }
      const audio = new Audio(`${PINYIN_AUDIO_DIR}/${file}`)
      audio.volume = soundVolume / 100
      audio.play().catch(() => tts(item.hanzi))
    },
    [tts, soundVolume]
  )
}
