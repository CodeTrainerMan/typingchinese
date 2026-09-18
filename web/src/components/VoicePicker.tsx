'use client'

import { useEffect, useState } from 'react'
import { listZhVoices, speak } from '@/lib/tts'
import { useI18n } from '@/i18n'

/**
 * 中文音色选择（设置页 / 文章页共用）。
 * 只列中文音色，试听内容固定为中文，否则听不出区别。
 */
export default function VoicePicker({
  value,
  onChange,
  rate = 1,
  volume = 1,
}: {
  value: string
  onChange: (voiceURI: string) => void
  rate?: number
  volume?: number
}) {
  const { t } = useI18n()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    listZhVoices().then(setVoices)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-9 rounded-lg border border-line bg-surface px-2 text-sm max-w-56"
      >
        <option value="">{t('setting.voiceDefault')}</option>
        {voices.map(v => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.name}
            {v.localService ? t('setting.voiceLocal') : t('setting.voiceRemote')}
          </option>
        ))}
      </select>
      <button
        onClick={() =>
          speak(t('setting.testText'), {
            rate,
            volume,
            voiceURI: value,
          })
        }
        className="h-9 px-3 rounded-lg border border-line text-sm hover:bg-surface2"
      >
        {t('setting.test')}
      </button>
    </div>
  )
}
