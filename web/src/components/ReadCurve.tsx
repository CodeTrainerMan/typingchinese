/**
 * 跟读得分曲线：横轴是第几次跟读（按时间先后），纵轴固定 0~100 分。
 * 分数域写死 0~100，跨文章、跨时间看曲线才不会互相误导。
 */

export interface ReadCurvePoint {
  score: number
  /** 横轴文字，一般就是序号 */
  label: string
  /** 悬停提示，由调用方按界面语言拼好 */
  tip: string
}

interface Props {
  points: ReadCurvePoint[]
  /** 本篇平均分：画成一条虚线当基准 */
  avg?: number
  avgLabel?: string
  /** 文章卡片里的小图：不要坐标轴与序号 */
  compact?: boolean
}

export default function ReadCurve({ points, avg, avgLabel, compact = false }: Props) {
  const w = 640
  const h = compact ? 80 : 180
  const pad = compact ? 8 : 26
  const n = Math.max(1, points.length - 1)
  const x = (i: number) => pad + (i * (w - pad * 2)) / n
  const y = (v: number) => {
    const clamped = Math.max(0, Math.min(100, v))
    return h - pad - (clamped / 100) * (h - pad * 2)
  }
  // 点太密就隔几个标一次序号，免得糊成一片
  const step = Math.ceil(points.length / (compact ? 4 : 14))
  const dot = compact ? 2 : 2.5

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={compact ? 'w-full h-20' : 'w-full h-44'}>
      {[0, 0.5, 1].map(r => (
        <line
          key={r}
          x1={pad}
          x2={w - pad}
          y1={pad + r * (h - pad * 2)}
          y2={pad + r * (h - pad * 2)}
          className="stroke-line"
          strokeWidth={1}
        />
      ))}

      {avg !== undefined && (
        <line
          x1={pad}
          x2={w - pad}
          y1={y(avg)}
          y2={y(avg)}
          className="stroke-ok"
          strokeWidth={1}
          strokeDasharray="5 4"
        />
      )}

      <polyline
        points={points.map((p, i) => `${x(i)},${y(p.score)}`).join(' ')}
        fill="none"
        className="stroke-brand"
        strokeWidth={compact ? 1.5 : 2}
      />

      {points.map((p, i) => {
        const last = i === points.length - 1
        return (
          <circle key={i} cx={x(i)} cy={y(p.score)} r={last ? dot + 1.5 : dot} className={last ? 'fill-ok' : 'fill-brand'}>
            <title>{p.tip}</title>
          </circle>
        )
      })}

      {!compact && (
        <>
          {points.map((p, i) =>
            i % step === 0 || i === points.length - 1 ? (
              <text key={i} x={x(i)} y={h - 8} textAnchor="middle" className="fill-dim" fontSize={10}>
                {p.label}
              </text>
            ) : null
          )}
          <text x={2} y={pad + 4} className="fill-dim" fontSize={10}>
            100
          </text>
          <text x={2} y={h - pad + 4} className="fill-dim" fontSize={10}>
            0
          </text>
          {avgLabel && (
            <text x={w - pad} y={y(avg ?? 0) - 5} textAnchor="end" className="fill-ok" fontSize={10}>
              {avgLabel}
            </text>
          )}
        </>
      )}
    </svg>
  )
}
