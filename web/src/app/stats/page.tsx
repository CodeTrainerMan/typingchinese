'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useBaseStore } from '@/lib/store/base'
import { useExtraStore, type ReadRecord } from '@/lib/store/extra'
import { useHydrated } from '@/lib/useHydrated'
import { groupReadByArticle } from '@/lib/readProgress'
import { useI18n } from '@/i18n'
import ReadCurve from '@/components/ReadCurve'
import Page from '@/components/ui/Page'
import PageHeader from '@/components/ui/PageHeader'
import Panel from '@/components/ui/Panel'
import StatCard from '@/components/ui/StatCard'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import type { Statistics } from '@/lib/types'

const DAYS = 14
const WEEKS = 12

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 连续打卡天数：今天有练就从今天算，否则从昨天往前算 */
function streak(stats: Statistics[]): number {
  const set = new Set(stats.filter(s => s.total > 0).map(s => s.date))
  const cursor = new Date()
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let n = 0
  while (set.has(dayKey(cursor))) {
    n++
    cursor.setDate(cursor.getDate() - 1)
  }
  return n
}

export default function StatsPage() {
  const hydrated = useHydrated()
  const base = useBaseStore()
  const extra = useExtraStore()
  const { t, locale } = useI18n()
  // 跟读进步曲线看哪一篇；null = 跟到最近练过的那篇
  const [pickArticle, setPickArticle] = useState<string | null>(null)
  // 日期按界面语言排版（美式 9/18、德语 18.9. 等），不再手拼
  const fmtDay = new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric' })
  const fmtFull = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' })

  if (!hydrated) return <div className="mx-auto max-w-4xl px-4 py-16 text-dim">{t('common.loading')}</div>

  const stats = base.statistics
  const byDate = new Map(stats.map(s => [s.date, s]))

  const days: { key: string; label: string; full: string; stat?: Statistics }[] = []
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = dayKey(d)
    days.push({ key, label: fmtDay.format(d), full: fmtFull.format(d), stat: byDate.get(key) })
  }

  const maxTotal = Math.max(1, ...days.map(d => d.stat?.total ?? 0))

  // 未来 14 天的复习量预测：按记忆卡片的下次到期日分桶
  const forecast: { key: string; label: string; full: string; count: number }[] = []
  {
    const buckets = new Map<string, number>()
    const todayKey = dayKey(new Date())
    for (const raw of Object.values(base.fsrsData)) {
      const due = raw.due?.slice(0, 10)
      if (!due) continue
      // 早就该复习但还没练的，都算今天的活儿
      const key = due < todayKey ? todayKey : due
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }
    for (let i = 0; i < DAYS; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const key = dayKey(d)
      forecast.push({ key, label: fmtDay.format(d), full: fmtFull.format(d), count: buckets.get(key) ?? 0 })
    }
  }
  const maxDue = Math.max(1, ...forecast.map(f => f.count))

  // 打卡热力图：从本周往前推 WEEKS 周，按周一为每周第一天
  const heat: { key: string; full: string; total: number }[] = []
  {
    const start = new Date()
    const dow = (start.getDay() + 6) % 7 // 周一 = 0
    start.setDate(start.getDate() - dow - (WEEKS - 1) * 7)
    for (let i = 0; i < WEEKS * 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = dayKey(d)
      heat.push({ key, full: fmtFull.format(d), total: byDate.get(key)?.total ?? 0 })
    }
  }
  const sum = stats.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      spend: acc.spend + s.spend,
      correct: acc.correct + s.correct,
      wrong: acc.wrong + s.wrong,
      keystrokes: acc.keystrokes + s.keystrokes,
      // 新学 / 复习是后加的字段，旧存档没有，按 0 处理
      newCount: acc.newCount + (s.newCount ?? 0),
      reviewCount: acc.reviewCount + (s.reviewCount ?? 0),
    }),
    { total: 0, spend: 0, correct: 0, wrong: 0, keystrokes: 0, newCount: 0, reviewCount: 0 }
  )
  const acc = sum.total ? Math.round((sum.correct / sum.total) * 1000) / 10 : 0
  const activeDays = stats.filter(s => s.total > 0).length
  const keep = streak(stats)

  // 跟读记录：文章页朗读打分留下来的，最新的排在最前
  const reads = extra.readRecords
  const readAvg = reads.length ? Math.round(reads.reduce((a, r) => a + r.score, 0) / reads.length) : 0
  const readBest = reads.reduce((a, r) => Math.max(a, r.score), 0)

  // 按文章聚合出进步曲线：默认看最近练过的那篇，可点标题切换
  const groups = groupReadByArticle(reads)
  const current = groups.find(g => g.key === pickArticle) ?? groups[0]
  const tip = (i: number, r: ReadRecord) =>
    `${t('stats.readPointTip', { n: i + 1, score: r.score, date: fmtFull.format(new Date(r.at)) })} · ${r.sentence}`

  return (
    <Page>
      <PageHeader
        title={t('stats.title')}
        actions={
          <Link
            href="/practice"
            onClick={() => base.startDictSession()}
            className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm text-white"
          >
            {t('common.goPractice')}
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label={t('stats.streak')} value={t('stats.daysValue', { n: keep })} />
          <StatCard label={t('stats.activeDays')} value={t('stats.daysValue', { n: activeDays })} />
          <StatCard label={t('stats.totalWords')} value={t('common.words', { n: sum.total })} />
          <StatCard label={t('stats.avgAcc')} value={`${acc}%`} />
        </div>

        <Panel title={t('stats.recentDone', { n: DAYS })} desc={t('stats.recentDoneDesc', { n: maxTotal })}>
          <div className="flex items-center gap-4 text-xs text-dim">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm bg-brand" />
              {t('stats.legendNew')}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm bg-brand/40" />
              {t('stats.legendReview')}
            </span>
          </div>
          <div className="flex h-40 items-end gap-1">
            {days.map((d, i) => {
              const total = d.stat?.total ?? 0
              const fresh = d.stat?.newCount ?? 0
              const review = d.stat?.reviewCount ?? 0
              const h = total ? Math.max(6, Math.round((total / maxTotal) * 100)) : 2
              // 旧存档只有 total：整根按新学算，避免柱子凭空矮一截
              const freshShare = total ? ((fresh || total) / total) * 100 : 100
              const reviewShare = total && review ? (review / total) * 100 : 0
              return (
                <div
                  key={d.key}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                >
                  <div className="mb-1 text-xs text-dim">{total || ''}</div>
                  <div
                    title={t('stats.tooltip', { date: d.full, n: total })}
                    className="flex w-full flex-col justify-end overflow-hidden rounded-t"
                    style={{ height: `${h}%` }}
                  >
                    {reviewShare > 0 && (
                      <div className="bg-brand/40" style={{ height: `${reviewShare}%` }} />
                    )}
                    <div
                      className={total ? 'bg-brand' : 'bg-surface2'}
                      style={{ height: `${freshShare}%` }}
                    />
                  </div>
                  {/* 14 天全标会把窄屏撑出横向滚动，隔一根标一次日期，完整日期走 title */}
                  <div className="mt-1 whitespace-nowrap text-xs text-dim">
                    {i % 2 === 0 ? d.label : '\u00a0'}
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel title={t('stats.forecastTitle', { n: DAYS })} desc={t('stats.forecastDesc')}>
          <div className="flex h-32 items-end gap-1">
            {forecast.map((f, i) => (
              <div key={f.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <div className="mb-1 text-xs text-dim">{f.count || ''}</div>
                <div
                  title={t('stats.tooltip', { date: f.full, n: f.count })}
                  className={`w-full rounded-t ${f.count ? 'bg-ok/70' : 'bg-surface2'}`}
                  style={{
                    height: f.count ? `${Math.max(6, Math.round((f.count / maxDue) * 100))}%` : '2%',
                  }}
                />
                <div className="mt-1 whitespace-nowrap text-xs text-dim">
                  {i % 2 === 0 ? f.label : '\u00a0'}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={t('stats.speedAcc', { n: DAYS })}>
          <div className="mb-3 flex items-center gap-4 text-xs text-dim">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 bg-brand" />
              {t('stats.speedLegend')}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 bg-ok" />
              {t('stats.accLegend')}
            </span>
          </div>
          <TrendChart
            points={days.map(d => ({
              label: d.label,
              kpm: d.stat?.spend ? Math.round(d.stat.keystrokes / (d.stat.spend / 60000)) : 0,
              acc: d.stat?.total ? (d.stat.correct / d.stat.total) * 100 : 0,
            }))}
          />
        </Panel>

        <Panel title={t('stats.heat', { n: WEEKS })} desc={t('stats.heatDesc')}>
          <div className="grid w-fit grid-flow-col grid-rows-7 gap-1">
            {heat.map(d => (
              <div
                key={d.key}
                title={t('stats.tooltip', { date: d.full, n: d.total })}
                className={`h-3.5 w-3.5 rounded-sm ${
                  d.total === 0
                    ? 'bg-surface2'
                    : d.total < 10
                      ? 'bg-brand/35'
                      : d.total < 20
                        ? 'bg-brand/65'
                        : 'bg-brand'
                }`}
              />
            ))}
          </div>
        </Panel>

      <div className="grid gap-4 sm:grid-cols-5">
        <StatCard label={t('stats.newWords')} value={t('common.words', { n: sum.newCount })} />
        <StatCard label={t('stats.reviewWords')} value={t('common.words', { n: sum.reviewCount })} />
        <StatCard
          label={t('stats.totalTime')}
          value={t('common.minutes', { n: Math.round(sum.spend / 60000) })}
        />
        <StatCard label={t('stats.totalKeys')} value={`${sum.keystrokes}`} />
        <StatCard label={t('stats.totalWrong')} value={`${sum.wrong}`} />
      </div>

        <Panel
          title={t('stats.readTitle')}
          actions={
            reads.length > 0 ? (
              <button
                onClick={extra.clearReadRecords}
                className="h-11 md:h-8 rounded-lg border border-line px-3 text-xs text-err hover:bg-surface2"
              >
                {t('stats.readClear')}
              </button>
            ) : undefined
          }
        >
          {reads.length === 0 ? (
            <EmptyState variant="plain" icon="article" title={t('stats.readEmpty')} />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label={t('stats.readCount')} value={`${reads.length}`} />
                <StatCard label={t('stats.readAvg')} value={`${readAvg}`} />
                <StatCard label={t('stats.readBest')} value={`${readBest}`} />
              </div>

              <div>
                <div className="mb-2 text-xs text-dim">{t('stats.readRecent')}</div>
                <div className="space-y-2">
                  {reads.slice(0, 8).map(r => (
                    <div key={r.id} className="flex items-center gap-3 text-sm">
                      <span className="w-14 shrink-0 font-semibold tabular-nums text-brand">
                        {t('article.readScore', { n: r.score })}
                      </span>
                      <span className="flex-1 truncate">{r.sentence}</span>
                      <span className="whitespace-nowrap text-xs text-dim">
                        {fmtFull.format(new Date(r.at))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Panel>

        {/* 按文章聚合：一篇一条曲线 */}
        {current && (
          <Panel title={t('stats.readByArticle')} desc={current.title}>
            <div className="flex flex-wrap gap-2">
              {groups.map(g => (
                <button
                  key={g.key}
                  onClick={() => setPickArticle(g.key)}
                  title={g.title}
                  className={`inline-flex h-11 md:h-8 max-w-[14rem] items-center gap-2 rounded-lg border px-3 text-xs ${
                    g.key === current.key
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-line text-dim hover:bg-surface2'
                  }`}
                >
                  <span className="truncate">{g.title}</span>
                  <span className="tabular-nums opacity-70">{g.count}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Chip>{t('stats.readFirst', { n: current.first })}</Chip>
              <Chip>{t('stats.readLatest', { n: current.latest })}</Chip>
              <Chip tone={current.delta > 0 ? 'brand' : 'plain'}>
                {current.delta >= 0
                  ? t('stats.readDeltaUp', { n: current.delta })
                  : t('stats.readDeltaDown', { n: -current.delta })}
              </Chip>
            </div>

            {current.count < 2 ? (
              <p className="mt-3 text-xs text-dim">{t('stats.readNeedMore')}</p>
            ) : (
              <div className="mt-3">
                <ReadCurve
                  points={current.records.map((r, i) => ({
                    score: r.score,
                    label: `${i + 1}`,
                    tip: tip(i, r),
                  }))}
                  avg={current.avg}
                  avgLabel={t('stats.readAvgLine')}
                />
              </div>
            )}
          </Panel>
        )}

      {activeDays === 0 ? (
        <EmptyState icon="stats" title={t('stats.empty')} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-surface2 text-dim">
              <tr className="border-b border-line">
                <th className="text-left px-4 py-3 text-xs font-semibold">{t('stats.thDate')}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold">{t('stats.thWords')}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold">{t('stats.thAcc')}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold">{t('stats.thTime')}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold">{t('stats.thKeys')}</th>
              </tr>
            </thead>
            <tbody>
              {[...stats]
                .sort((a, b) => (a.date < b.date ? 1 : -1))
                .slice(0, 14)
                .map(s => (
                  <tr key={s.date} className="border-t border-line">
                    <td className="px-4 py-3 whitespace-nowrap">{fmtFull.format(new Date(s.date))}</td>
                    <td className="px-4 py-3 text-right">{s.total}</td>
                    <td className="px-4 py-3 text-right">
                      {s.total ? Math.round((s.correct / s.total) * 1000) / 10 : 0}%
                    </td>
                    <td className="px-4 py-3 text-right">{t('common.minutes', { n: Math.round(s.spend / 60000) })}</td>
                    <td className="px-4 py-3 text-right">{s.keystrokes}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </Page>
  )
}

function TrendChart({ points }: { points: { label: string; kpm: number; acc: number }[] }) {
  const w = 640
  const h = 180
  const pad = 28
  const maxKpm = Math.max(60, ...points.map(p => p.kpm))
  const x = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1)
  const yKpm = (v: number) => h - pad - (v / maxKpm) * (h - pad * 2)
  const yAcc = (v: number) => h - pad - (v / 100) * (h - pad * 2)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44 overflow-visible">
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
      <polyline points={points.map((p, i) => `${x(i)},${yKpm(p.kpm)}`).join(' ')} fill="none" className="stroke-brand" strokeWidth={2} />
      <polyline
        points={points.map((p, i) => `${x(i)},${yAcc(p.acc)}`).join(' ')}
        fill="none"
        className="stroke-ok"
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={yKpm(p.kpm)} r={2.5} className="fill-brand" />
          <text x={x(i)} y={h - 8} textAnchor="middle" className="fill-dim" fontSize={10}>
            {p.label}
          </text>
        </g>
      ))}
      <text x={6} y={pad + 4} className="fill-dim" fontSize={10}>
        {maxKpm}
      </text>
      <text x={6} y={h - pad + 4} className="fill-dim" fontSize={10}>
        0
      </text>
    </svg>
  )
}


