import type { ReactNode } from 'react'

/** 页面标题行：左标题（+ 一句说明），右动作。所有二级页都用它，标题层级就对齐了。 */
export default function PageHeader({
  title,
  desc,
  actions,
}: {
  title: string
  desc?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {desc && <p className="mt-1 text-sm text-dim">{desc}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
