/** 小标签：实时指标、键位提示、状态标记都用它，避免各处自己拼边框和字号。 */
export default function Chip({
  children,
  tone = 'soft',
  className = '',
}: {
  children: React.ReactNode
  tone?: 'soft' | 'brand' | 'plain'
  className?: string
}) {
  const toneCls =
    tone === 'brand'
      ? 'border-brand bg-brand-soft text-brand'
      : tone === 'plain'
        ? 'border-line text-dim'
        : 'border-line bg-surface2 text-dim'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs tabular-nums ${toneCls} ${className}`}
    >
      {children}
    </span>
  )
}
