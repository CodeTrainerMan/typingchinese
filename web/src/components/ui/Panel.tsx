import type { ReactNode } from 'react'

/**
 * 区块容器（对标 TypeWords 的 card：rounded-xl p-4 shadow-lg）。
 * 间距由 Page 统一给（space-y-8），这里只管卡片自身的皮。
 */
export default function Panel({
  title,
  desc,
  actions,
  children,
  flush = false,
  className = '',
}: {
  title?: string
  desc?: string
  actions?: ReactNode
  children: ReactNode
  /** 内容自己贴边（表格之类的），只给标题行留内边距 */
  flush?: boolean
  className?: string
}) {
  const hasHead = Boolean(title || actions)
  return (
    <section
      className={`rounded-xl border border-line bg-surface2 shadow-[var(--shadow-card)] ${
        flush ? 'overflow-hidden' : 'p-5'
      } ${className}`}
    >
      {hasHead && (
        <div className={`flex items-start justify-between gap-4 ${flush ? 'px-6 pt-5' : ''}`}>
          <div className="min-w-0">
            {title && <h2 className="text-lg font-medium tracking-tight text-ink">{title}</h2>}
            {desc && <p className="mt-0.5 text-xs text-dim">{desc}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={hasHead ? 'mt-4' : ''}>{children}</div>
    </section>
  )
}
