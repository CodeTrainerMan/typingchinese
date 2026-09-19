'use client'

import { useEffect, useRef, useState } from 'react'
import type { CnWord } from '@/lib/types'
import { useI18n } from '@/i18n'

interface Props {
  word: CnWord
  /** 已上屏并判定过的汉字 */
  input: string
  shakeKey: number
  /** 跟写模式显示目标汉字；听写模式只显示拼音，避免直接看到答案 */
  showTarget: boolean
  onType: (ch: string) => void
  onBackspace: () => void
}

/**
 * 中文输入法（IME）输入区：
 * 用一个真实 input 承接微软拼音等输入法，组合过程中的按键不参与判定，
 * 只有上屏后的汉字才逐字喂给判定逻辑，实现「打汉字 → 自动判定对错」。
 */
export default function HanziInput({ word, input, shakeKey, showTarget, onType, onBackspace }: Props) {
  const { t } = useI18n()
  const ref = useRef<HTMLInputElement>(null)
  const composingRef = useRef(false)
  const [composing, setComposing] = useState('')

  // 保持输入框聚焦，输入法候选框才不会乱跑
  useEffect(() => {
    ref.current?.focus()
    const refocus = () => ref.current?.focus()
    window.addEventListener('click', refocus)
    return () => window.removeEventListener('click', refocus)
  }, [])

  const commitValue = (value: string) => {
    for (const ch of value) onType(ch)
  }

  return (
    <div className="mt-8">
      <div
        className={`flex flex-wrap justify-center gap-2 sm:gap-3 no-select ${shakeKey ? 'shake' : ''}`}
        key={shakeKey}
      >
        {[...word.word].map((ch, i) => {
          const typed = input[i]
          const isCursor = i === input.length
          let content = showTarget ? ch : word.pinyin[i] ?? ''
          let cls = isCursor ? 'text-brand border-brand' : 'text-dim/50 border-line'
          if (typed !== undefined) {
            content = typed
            cls = typed === ch ? 'text-ok border-ok' : 'text-err border-err'
          }
          return (
            <div
              key={i}
              className={`w-12 h-16 sm:w-14 sm:h-20 inline-flex items-center justify-center border-b-2 ${
                showTarget || typed !== undefined ? 'font-hanzi text-3xl sm:text-4xl' : 'text-lg'
              } ${cls} ${isCursor && typed === undefined ? 'bg-brand-soft/40' : ''}`}
            >
              {content}
            </div>
          )
        })}
      </div>

      <input
        ref={ref}
        className="mx-auto mt-6 block w-64 max-w-full h-12 px-3 text-center text-base rounded-xl border border-line bg-surface2 outline-none focus:border-brand"
        placeholder={t('hanziInput.placeholder')}
        aria-label={t('hanziInput.aria')}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        onCompositionStart={() => {
          composingRef.current = true
          setComposing('')
        }}
        onCompositionUpdate={e => setComposing(e.data)}
        onCompositionEnd={e => {
          composingRef.current = false
          setComposing('')
          const value = e.currentTarget.value
          e.currentTarget.value = ''
          commitValue(value)
        }}
        onChange={e => {
          const el = e.currentTarget
          if (composingRef.current) {
            setComposing(el.value)
            return
          }
          const value = el.value
          el.value = ''
          setComposing('')
          commitValue(value)
        }}
        onKeyDown={e => {
          // 输入框已空且不在组合中时，退格删掉上一个已上屏的字
          if (e.key === 'Backspace' && !composingRef.current && e.currentTarget.value === '') {
            e.preventDefault()
            onBackspace()
          }
        }}
      />

      <div className="mt-2 text-center text-xs text-dim h-4">
        {composing || t('hanziInput.hint')}
      </div>
    </div>
  )
}
