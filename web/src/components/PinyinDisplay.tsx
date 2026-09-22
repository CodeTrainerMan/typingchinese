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
  /**
   * 默写 / 听写：连未输入的拼音字母也换成占位符。
   * 只遮汉字不遮拼音的话，照着摊开的字母敲一遍就行，步骤本身就没意义了。
   */
  maskPinyin?: boolean
}

/**
 * 逐字母染色的拼音输入区：一个汉字对应一块拼音（音节）。
 * 与英文打字体验一致：对的绿色、错的红色、未输入的灰色、当前光标高亮。
 */
export default function PinyinDisplay({
  hanzi,
  groups,
  cursor,
  shakeKey,
  masked = false,
  maskPinyin = false,
}: Props) {
  return (
    <div className={`flex flex-wrap justify-center gap-3 no-select sm:gap-4 ${shakeKey ? 'shake' : ''}`} key={shakeKey}>
      {groups.map((group, gi) => {
        const chars = [...group.plain]
        return (
          <div key={gi} className="flex flex-col items-center min-w-10 sm:min-w-12">
            <div className="font-hanzi text-3xl sm:text-5xl font-normal tracking-[0.2em] mb-2">
              {masked ? '·' : ([...hanzi][gi] ?? '')}
            </div>
            <div className="flex">
              {chars.map((targetChar, ci) => {
                const globalIndex = group.offset + ci
                const typed = group.chars[ci]
                const isCursor = globalIndex === cursor
                // 打对的字稍微放大一点，给一个「命中」的即时反馈
                const cls = typed
                  ? typed.correct
                    ? 'text-ok scale-110 font-semibold'
                    : 'text-err'
                  : isCursor
                    ? 'text-brand bg-brand-soft'
                    : 'text-dim/60'
                return (
                  <span
                    key={ci}
                    className={`inline-flex h-8 w-3.5 items-center justify-center rounded font-mono text-lg transition-transform duration-150 sm:w-4 sm:text-xl ${
                      cls
                    } ${isCursor ? 'ring-1 ring-brand' : ''}`}
                  >
                    {typed ? typed.char : maskPinyin ? '·' : prettyFlat(targetChar)}
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
