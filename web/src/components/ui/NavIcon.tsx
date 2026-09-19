import type { ReactNode } from 'react'

/**
 * 侧栏图标：仿 TypeWords 用的 Fluent 线性图标（24 格、1.6 描边、圆角端点）。
 * 不引图标库，7 个图标手写即可，包体积为零。
 */
const PATHS: Record<string, ReactNode> = {
  home: (
    <>
      <path d="M4 10.6 12 4.2l8 6.4V19a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19z" />
      <path d="M9.6 20.4v-6.2h4.8v6.2" />
    </>
  ),
  keyboard: (
    <>
      <rect x="2.6" y="6.4" width="18.8" height="11.2" rx="2.2" />
      <path d="M7 10.6h.01M10.4 10.6h.01M13.8 10.6h.01M17 10.6h.01M7 13.8h.01M10.4 13.8h.01M13.8 13.8h.01M17 13.8h.01" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.6C10.4 5.1 7.9 4.6 4 4.6v12.8c3.9 0 6.4.5 8 2 1.6-1.5 4.1-2 8-2V4.6c-3.9 0-6.4.5-8 2z" />
      <path d="M12 6.6v12.8" />
    </>
  ),
  article: (
    <>
      <path d="M6 3.2h6.6L18 8.6V19a1.8 1.8 0 0 1-1.8 1.8H6A1.8 1.8 0 0 1 4.2 19V5A1.8 1.8 0 0 1 6 3.2z" />
      <path d="M12.4 3.4V9h5.4" />
      <path d="M8.2 13.6h7.6M8.2 16.8h7.6" />
    </>
  ),
  wrong: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M9.4 9.4l5.2 5.2M14.6 9.4l-5.2 5.2" />
    </>
  ),
  stats: (
    <>
      <path d="M4.6 20h14.8" />
      <path d="M7.4 20v-6.4M12 20V5.6M16.6 20v-9.2" />
    </>
  ),
  star: (
    <path d="M12 4.6l2.35 4.85 5.35.72-3.9 3.72.97 5.31L12 16.55l-4.77 2.65.97-5.31-3.9-3.72 5.35-.72z" />
  ),
  setting: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 4.4v3.5M12 16.1v3.5M4.4 12h3.5M16.1 12h3.5M6.6 6.6l2.5 2.5M14.9 14.9l2.5 2.5M17.4 6.6l-2.5 2.5M9.1 14.9l-2.5 2.5" />
    </>
  ),
}

export type NavIconName = keyof typeof PATHS

export default function NavIcon({
  name,
  className = 'h-5 w-5',
}: {
  name: NavIconName
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
