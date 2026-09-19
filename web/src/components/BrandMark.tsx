/**
 * 品牌标记：键帽方块托着 ü 的两点。
 * 方块跟着前景色走（深色模式自动反白），两点固定品牌蓝。
 */

export default function BrandMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="14 12 72 72" className={className} role="img" aria-hidden="true">
      <rect x="30" y="38" width="40" height="40" rx="8" fill="currentColor" />
      <circle cx="42" cy="24" r="5.5" className="fill-brand" />
      <circle cx="58" cy="24" r="5.5" className="fill-brand" />
    </svg>
  )
}
