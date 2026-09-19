import type { ReactNode } from 'react'
import NavIcon, { type NavIconName } from './NavIcon'

/**
 * 空状态（对标 Notion 的 ex-empty-state-card）：
 * 居中 + 浅底图标块 + 一句说明 + 可选行动按钮，让「空」也是一张有骨架的卡片。
 * - 页面级用 card（虚线 hairline 框）
 * - 已经在 Panel 里时用 plain，避免卡片套卡片
 */
export default function EmptyState({
  icon = 'book',
  title,
  desc,
  action,
  variant = 'card',
}: {
  icon?: NavIconName
  title: string
  desc?: string
  action?: ReactNode
  variant?: 'card' | 'plain'
}) {
  const body = (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface2 text-dim">
        <NavIcon name={icon} className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm text-ink2">{title}</p>
      {desc && <p className="mt-1 text-xs text-faint">{desc}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </>
  )

  if (variant === 'plain') {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">{body}</div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      {body}
    </div>
  )
}
