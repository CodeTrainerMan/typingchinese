/**
 * 数值块（对标 TypeWords 的 .stat / .stat2）：
 * 白底 + 1px 灰边的方块，数字是主角（lg 36px / md 24px 蓝色粗体），标签弱化在下面。
 */
export default function StatCard({
  label,
  value,
  suffix,
  hint,
  tone = 'brand',
  size = 'md',
  className = '',
}: {
  label: string
  value: string
  /** 跟在数字后面的灰色单位（如 min / words），与数字区分开 */
  suffix?: string
  hint?: string
  tone?: 'brand' | 'ok' | 'err'
  /** lg 用在今日目标这类重点数字上 */
  size?: 'md' | 'lg'
  className?: string
}) {
  const valueCls = tone === 'brand' ? 'text-brand' : tone === 'ok' ? 'text-ok' : 'text-err'
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-line bg-solid px-4 py-5 text-center ${className}`}
    >
      <div className={`font-bold tabular-nums ${size === 'lg' ? 'text-4xl' : 'text-2xl'} ${valueCls}`}>
        {value}
        {suffix && <span className="ml-1 text-base font-normal text-dim">{suffix}</span>}
      </div>
      <div className="mt-1 text-xs text-dim">{label}</div>
      {hint && <div className="mt-1 text-xs text-faint">{hint}</div>}
    </div>
  )
}
