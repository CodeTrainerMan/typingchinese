'use client'

import type { ReactNode } from 'react'
import { useI18n } from '@/i18n'

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

interface Props {
  onKey: (key: string) => void
  onBackspace: () => void
  onSkip: () => void
  onPlay: () => void
  /** 声调模式需要数字调号 */
  withDigits?: boolean
}

export default function VirtualKeyboard({ onKey, onBackspace, onSkip, onPlay, withDigits }: Props) {
  const { t } = useI18n()
  return (
    <div className="mt-6 select-none" onMouseDown={e => e.preventDefault()}>
      {ROWS.map((row, i) => (
        <div key={row} className="flex justify-center gap-1 mb-1" style={{ paddingLeft: `${i * 12}px` }}>
          {[...row].map(ch => (
            <Kbd key={ch} onClick={() => onKey(ch)}>
              {ch}
            </Kbd>
          ))}
          {i === 2 && (
            <Kbd className="px-3" onClick={onBackspace}>
              ⌫
            </Kbd>
          )}
        </div>
      ))}

      <div className="flex justify-center gap-1 mt-1">
        {withDigits &&
          // 轻声打 0（如 hai2 zi0），没有第五声
          ['0', '1', '2', '3', '4'].map(n => (
            <Kbd key={n} onClick={() => onKey(n)}>
              {n}
            </Kbd>
          ))}
        <Kbd className="px-3" onClick={onPlay}>
          {t('virtualKeyboard.replay')}
        </Kbd>
        <Kbd className="px-3" onClick={onSkip}>
          {t('virtualKeyboard.skip')}
        </Kbd>
      </div>
    </div>
  )
}

function Kbd({ children, onClick, className = '' }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 min-w-7 rounded-lg border border-line bg-surface2 px-2 text-sm active:bg-brand active:text-white sm:h-10 sm:min-w-8 sm:px-2 ${className}`}
    >
      {children}
    </button>
  )
}
