/**
 * 全站唯一的进度条。
 * 之前三处各写各的（h-1.5 / h-2、有的没圆角、有的没有过渡），
 * 现在统一：轨道一色、填充带圆角与过渡、宽度按百分比裁到 0~100。
 */

interface Props {
  /** 0~100，超出会自动裁剪 */
  value: number
  tone?: 'brand' | 'ok' | 'err'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const TONE = {
  brand: 'bg-brand',
  ok: 'bg-ok',
  err: 'bg-err',
} as const

/** lg 对齐 TypeWords 的 Progress size="large"（strokeWidth 6 × 2.5 = 15px），练习区的进度条要压得住手 */
const SIZE = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-[15px]',
} as const

export default function ProgressBar({
  value,
  tone = 'brand',
  size = 'md',
  showValue = false,
  className = '',
}: Props) {
  const pct = Math.max(0, Math.min(100, value))
  const track = (
    <div
      className={`w-full overflow-hidden rounded-full bg-track ${SIZE[size]} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-[600ms] ease-out ${TONE[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )

  if (!showValue) return track

  return (
    <div className="flex items-center gap-2">
      {track}
      <span className="w-12 shrink-0 text-right text-sm tabular-nums text-dim">{Math.round(pct)}%</span>
    </div>
  )
}
