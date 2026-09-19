import type { ReactNode } from 'react'

/**
 * 页面容器：统一最大宽度与卡片间距（对标 TypeWords 的 card mb-8）。
 * md = 内容页（首页 / 统计 / 错词 / 词库 / 设置），sm = 练习页（窄一点更专注）。
 * 宽度跟着视口走：大屏用 vw 档，小屏退到固定上限。
 */
export default function Page({
  children,
  width = 'md',
  className = '',
}: {
  children: ReactNode
  width?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div
      className={`mx-auto w-full space-y-8 px-4 py-8 ${
        width === 'sm' ? 'max-w-3xl' : 'max-w-5xl lg:max-w-[75vw] 2xl:max-w-[60vw]'
      } ${className}`}
    >
      {children}
    </div>
  )
}
