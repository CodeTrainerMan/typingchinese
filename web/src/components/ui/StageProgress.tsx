/**
 * 分段进度条：对标 TypeWords 的 StageProgress。
 * 一条轨道里铺 N 段，每段按 ratio 占宽、按 percentage 填充；
 * 当前段用语义绿，未开始段用品牌蓝 —— 一眼看出「走到第几步、这步走了多少」。
 *
 * 参考实现：ref/TypeWords/app/components/StageProgress.vue
 * 分段算法：ref/TypeWords/app/core/composables/practice-words/practice-flow-display.ts
 */
export interface Stage {
  /** 无障碍用的段名（不显示） */
  name?: string
  /** 本段占总宽的百分比 */
  ratio: number
  /** 本段内部填充百分比，0~100 */
  percentage: number
  /** 是否当前段 */
  active?: boolean
}

interface Props {
  stages: Stage[]
  className?: string
}

export default function StageProgress({ stages, className = '' }: Props) {
  if (!stages.length) return null
  return (
    <div className={`flex w-full gap-1 ${className}`} role="group" aria-label="progress">
      {stages.map((stage, i) => {
        const pct = Math.max(0, Math.min(100, stage.percentage))
        return (
          <div
            key={stage.name ?? i}
            className="h-2 overflow-hidden rounded-full bg-track"
            style={{ width: `${Math.max(0, stage.ratio)}%` }}
            role="progressbar"
            aria-label={stage.name}
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                stage.active ? 'bg-ok' : 'bg-brand'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}
