'use client'

import type { SyllableGroup } from '@/lib/typing'
import { prettyFlat } from '@/lib/pinyin'

interface Props {
  hanzi: string
  groups: SyllableGroup[]
  cursor: number
  shakeKey: number
  /** 非跟写模式：汉字用占位符代替，避免把答案直接摊开 */
  masked?: boolean
}

/**
 * 逐字母染色的拼音输入区：一个汉字对应一块拼音（音节）。
 * 与英文打字体验一致：对的绿色、错的红色、未输入的灰色、当前光标高亮。
 */
export default function PinyinDisplay({ hanzi, groups, cursor, shakeKey, masked = false }: Props) {
  return (
    <div className={`flex flex-wrap justify-center gap-4 no-select ${shakeKey ? 'shake' : ''}`} key={shakeKey}>
      {groups.map((group, gi) => {
        const chars = [...group.plain]
        return (
          <div key={gi} className="flex flex-col items-center min-w-12">
            <div className="text-4xl sm:text-5xl font-medium tracking-[0.2em] mb-2">
              {masked ? '·' : ([...hanzi][gi] ?? '')}
            </div>
            <div className="flex">
              {chars.map((targetChar, ci) => {
                const globalIndex = group.offset + ci
                const typed = group.chars[ci]
                const isCursor = globalIndex === cursor
                const cls = typed
                  ? typed.correct
                    ? 'text-ok'
                    : 'text-err'
                  : isCursor
                    ? 'text-brand bg-brand-soft'
                    : 'text-dim/60'
                return (
                  <span
                    key={ci}
                    className={`w-4 h-8 inline-flex items-center justify-center text-lg sm:text-xl font-mono rounded ${
                      cls
                    } ${isCursor ? 'ring-1 ring-brand' : ''}`}
                  >
                    {typed ? typed.char : prettyFlat(targetChar)}
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
