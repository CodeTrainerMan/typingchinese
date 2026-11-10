'use client'

import { useI18n } from '@/i18n'

/**
 * FSRS 记忆法原理区块（引导页主角内容）。
 *
 * 曲线不是装饰：用项目里实际采用的遗忘曲线公式 R = (1 + t/(9S))⁻¹
 * （见 web/src/lib/fsrs.ts 的 currentRetention）按采样点生成 SVG 路径。
 * 演示「在 R=0.9 复习 → 稳定性 S 变大 → 曲线变平 → 下次间隔变长」。
 * 复习阈值 0.9 与 DEFAULT_FSRS_PARAMS.requestRetention 一致。
 * 图中 S 与天数均为原理示意（schematic），不是真实用户数据。
 * 所有文案走 i18n 的 landing 命名空间。
 */

const BOX = { x0: 58, x1: 694, y0: 26, y1: 248, maxT: 60, rMin: 0.55 }
const RETENTION_TARGET = 0.9
const S_BEFORE = 10
const S_AFTER = 25
const REVIEW_DAY = S_BEFORE // R=0.9 时恰好 t = S
const SECOND_REVIEW_DAY = REVIEW_DAY + S_AFTER // 复习后 S 变大，下次到期更晚

const retention = (t: number, s: number) => 1 / (1 + t / (9 * s))
const px = (t: number) => BOX.x0 + (t / BOX.maxT) * (BOX.x1 - BOX.x0)
// 纵轴只画 55%~100%，否则 R 的变化会被压成顶部一条直线
const py = (r: number) => BOX.y0 + ((1 - r) / (1 - BOX.rMin)) * (BOX.y1 - BOX.y0)

function buildPath(fn: (t: number) => number, from: number, to: number, steps = 60) {
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps
    points.push(`${i === 0 ? 'M' : 'L'}${px(t).toFixed(1)},${py(fn(t)).toFixed(1)}`)
  }
  return points.join(' ')
}

const BEFORE_PATH = buildPath(t => retention(t, S_BEFORE), 0, REVIEW_DAY)
const DECAY_PATH = buildPath(t => retention(t, S_BEFORE), REVIEW_DAY, BOX.maxT)
const AFTER_PATH = buildPath(t => retention(t - REVIEW_DAY, S_AFTER), REVIEW_DAY, SECOND_REVIEW_DAY)
const AFTER_DECAY_PATH = buildPath(t => retention(t - REVIEW_DAY, S_AFTER), SECOND_REVIEW_DAY, BOX.maxT)
const REVIEW_X = px(REVIEW_DAY)
const SECOND_REVIEW_X = px(SECOND_REVIEW_DAY)
const TARGET_Y = py(RETENTION_TARGET)
const GRID_R = [1, 0.9, 0.8, 0.7, 0.6]
const TICKS = [0, REVIEW_DAY, SECOND_REVIEW_DAY, BOX.maxT]

/** 变量卡只存 i18n key，渲染时按当前语言取值 */
const VARIABLES = [
  { symbol: 'S', nameKey: 'landing.varSName', descKey: 'landing.varSDesc' },
  { symbol: 'D', nameKey: 'landing.varDName', descKey: 'landing.varDDesc' },
  { symbol: 'R', nameKey: 'landing.varRName', descKey: 'landing.varRDesc' },
] as const

/** Easy / Good / Hard / Again 是 FSRS 评级术语，各语言保持一致 */
const GRADES = [
  { mistakes: '0', grade: 'Easy', labelKey: 'landing.grade0', tone: 'easy' },
  { mistakes: '1', grade: 'Good', labelKey: 'landing.grade1', tone: 'good' },
  { mistakes: '2', grade: 'Hard', labelKey: 'landing.grade2', tone: 'hard' },
  { mistakes: '3+', grade: 'Again', labelKey: 'landing.grade3', tone: 'again' },
] as const

export default function MemoryEngine() {
  const { t } = useI18n()

  return (
    <section className="cyber-section cyber-memory" id="memory">
      <div className="cyber-section-head">
        <div className="cyber-kicker">{'//'} 01 · {t('landing.memoryKicker')}</div>
        <h2 className="cyber-section-title">{t('landing.memoryTitle')}</h2>
        <p className="cyber-section-desc">{t('landing.memoryDesc')}</p>
        <p className="cyber-section-desc cy-zh">{t('landing.memoryDescSub')}</p>
      </div>

      <div className="cy-memory-grid">
        {/* 左：真实公式生成的遗忘曲线 */}
        <div className="cy-memory-chart">
          <div className="cy-memory-chart-head">
            <span className="cy-memory-chart-title">{t('landing.memoryChartTitle')}</span>
            <span className="cy-memory-formula">
              R = (1 + t / 9S)⁻¹ <em>{t('landing.memorySchematic')}</em>
            </span>
          </div>

          <svg viewBox="0 0 720 292" className="cy-memory-svg" role="img" aria-label={t('landing.a11yCurve')}>
            {GRID_R.map(r => (
              <line key={r} x1={BOX.x0} x2={BOX.x1} y1={py(r)} y2={py(r)} className="cy-svg-grid" />
            ))}
            {TICKS.map(tick => (
              <line key={tick} x1={px(tick)} x2={px(tick)} y1={BOX.y0} y2={BOX.y1} className="cy-svg-grid cy-svg-grid-v" />
            ))}

            {/* 目标保持率 0.9：降到这条线就安排复习 */}
            <line x1={BOX.x0} x2={BOX.x1} y1={TARGET_Y} y2={TARGET_Y} className="cy-svg-threshold" />
            <text x={BOX.x1 - 4} y={TARGET_Y - 9} textAnchor="end" className="cy-svg-label cy-svg-label-cyan">
              {t('landing.memoryTarget')}
            </text>

            {/* 不复习：一路掉到 60% */}
            <path d={DECAY_PATH} className="cy-svg-decay" />
            {/* 初次学习后的衰减 */}
            <path d={BEFORE_PATH} className="cy-svg-before" />
            {/* 复习后 S 上升：重新从 100% 开始，且更平缓 */}
            <path d={AFTER_PATH} className="cy-svg-after" />
            <path d={AFTER_DECAY_PATH} className="cy-svg-after-decay" />

            {/* 两次复习点：间隔 10 天 -> 25 天 */}
            <line x1={REVIEW_X} x2={REVIEW_X} y1={TARGET_Y} y2={BOX.y1} className="cy-svg-review-line" />
            <line x1={SECOND_REVIEW_X} x2={SECOND_REVIEW_X} y1={TARGET_Y} y2={BOX.y1} className="cy-svg-review-line" />
            <circle cx={REVIEW_X} cy={TARGET_Y} r={6} className="cy-svg-review-dot" />
            <circle cx={SECOND_REVIEW_X} cy={TARGET_Y} r={6} className="cy-svg-review-dot" />
            <text x={REVIEW_X + 9} y={TARGET_Y - 15} className="cy-svg-label cy-svg-label-magenta">
              {t('landing.memoryDay', { n: REVIEW_DAY })}
            </text>
            <text x={SECOND_REVIEW_X + 9} y={TARGET_Y - 15} className="cy-svg-label cy-svg-label-magenta">
              {t('landing.memoryDay', { n: SECOND_REVIEW_DAY })}
            </text>

            <text x={px(23)} y={py(0.94) - 9} className="cy-svg-label cy-svg-label-cyan">
              {t('landing.memoryFlatter')}
            </text>
            <text x={px(46)} y={py(retention(46, S_BEFORE)) + 19} textAnchor="middle" className="cy-svg-label cy-svg-label-dim">
              {t('landing.memoryWithout')}
            </text>

            {/* 坐标轴：百分比为通用符号，天数走 i18n */}
            {[1, 0.9, 0.7, 0.6].map(r => (
              <text key={r} x={BOX.x0 - 10} y={py(r) + 4} textAnchor="end" className="cy-svg-tick">
                {Math.round(r * 100)}%
              </text>
            ))}
            {TICKS.map(tick => (
              <text key={tick} x={px(tick)} y={BOX.y1 + 20} textAnchor="middle" className="cy-svg-tick">
                {tick === BOX.maxT ? t('landing.memoryDays', { n: BOX.maxT }) : String(tick)}
              </text>
            ))}
          </svg>

          <div className="cy-memory-legend">
            <span><i className="cy-legend cy-legend-before" /> {t('landing.memoryLegendBefore')}</span>
            <span><i className="cy-legend cy-legend-after" /> {t('landing.memoryLegendAfter')}</span>
            <span><i className="cy-legend cy-legend-decay" /> {t('landing.memoryLegendNoReview')}</span>
            <span><i className="cy-legend cy-legend-after-decay" /> {t('landing.memoryLegendAfterDay')}</span>
          </div>

          {/* 小屏下 SVG 细节标签隐藏，用文字补上复习点信息 */}
          <p className="cy-memory-mobile-note">
            {t('landing.memoryMobileNote')}
            <span>{t('landing.memoryMobileNoteSub')}</span>
          </p>

          <p className="cy-memory-foot">{t('landing.memoryFoot')}</p>
          <p className="cy-memory-foot cy-zh">{t('landing.memoryFootSub')}</p>
        </div>

        {/* 右：三个变量 */}
        <div className="cy-memory-vars">
          {VARIABLES.map(v => (
            <div className="cy-memory-var" key={v.symbol}>
              <div className="cy-memory-var-head">
                <span className="cy-memory-var-symbol">{v.symbol}</span>
                <span>
                  <span className="cy-memory-var-name">{t(v.nameKey)}</span>
                </span>
              </div>
              <p className="cy-memory-var-en">{t(v.descKey)}</p>
            </div>
          ))}
          <div className="cy-memory-var cy-memory-engine-tag">
            <span className="cy-memory-engine-label">{'//'} {t('landing.engineKicker')}</span>
            <span className="cy-memory-engine-value">FSRS · ts-fsrs</span>
            <span className="cy-memory-engine-note">{t('landing.engineNote')}</span>
          </div>
        </div>
      </div>

      {/* 错词次数 -> FSRS 评级：不用手动打分 */}
      <div className="cy-memory-grading">
        <div className="cy-memory-grading-head">
          <h3>{t('landing.gradingTitle')}</h3>
          <p>{t('landing.gradingDesc')}</p>
        </div>
        <div className="cy-memory-grade-rows">
          {GRADES.map(g => (
            <div className={`cy-memory-grade cy-memory-grade-${g.tone}`} key={g.grade}>
              <span className="cy-memory-grade-mistakes">{g.mistakes}</span>
              <span className="cy-memory-grade-name">{g.grade}</span>
              <span className="cy-memory-grade-cn">{t(g.labelKey)}</span>
            </div>
          ))}
        </div>
        <p className="cy-memory-grading-note">{t('landing.gradingNote')}</p>
      </div>

      <div className="cy-memory-summary">
        <p>
          <strong>{t('landing.summaryStrong')}</strong> {t('landing.summaryRest')}
        </p>
        <a href="#features" className="cy-memory-next">
          {t('landing.summaryLink')} ↓
        </a>
      </div>
    </section>
  )
}
