'use client'

import Link from 'next/link'
import { useBaseStore } from '@/lib/store/base'
import { useHydrated } from '@/lib/useHydrated'
import { useI18n } from '@/i18n'
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
  const { t, locale } = useI18n()
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{t('stats.title')}</h1>
        <Link href="/practice" className="h-9 px-4 inline-flex items-center rounded-lg bg-brand text-white text-sm">
          {t('common.goPractice')}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <Card label={t('stats.streak')} value={t('stats.daysValue', { n: keep })} />
        <Card label={t('stats.activeDays')} value={t('stats.daysValue', { n: activeDays })} />
        <Card label={t('stats.totalWords')} value={t('common.words', { n: sum.total })} />
        <Card label={t('stats.avgAcc')} value={`${acc}%`} />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 mb-8">
        <div className="text-sm font-medium mb-1">{t('stats.recentDone', { n: DAYS })}</div>
        <div className="text-xs text-dim mb-5">{t('stats.recentDoneDesc', { n: maxTotal })}</div>
        <div className="flex items-end gap-1.5 h-40">
          {days.map(d => {
            const total = d.stat?.total ?? 0
            const h = total ? Math.max(6, Math.round((total / maxTotal) * 100)) : 2
            return (
              <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="text-[10px] text-dim mb-1">{total || ''}</div>
                <div
                  title={t('stats.tooltip', { date: d.full, n: total })}
                  className={`w-full rounded-t ${total ? 'bg-brand' : 'bg-surface2'}`}
                  style={{ height: `${h}%` }}
                />
                <div className="text-[10px] text-dim mt-1">{d.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 mb-8">
        <div className="text-sm font-medium mb-1">{t('stats.speedAcc', { n: DAYS })}</div>
        <div className="flex items-center gap-4 text-xs text-dim mb-3">
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-0.5 bg-brand inline-block" />
            {t('stats.speedLegend')}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-4 h-0.5 bg-ok inline-block" />
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
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 mb-8">
        <div className="text-sm font-medium mb-1">{t('stats.heat', { n: WEEKS })}</div>
        <div className="text-xs text-dim mb-4">{t('stats.heatDesc')}</div>
        <div className="grid grid-flow-col grid-rows-7 gap-1 w-fit">
          {heat.map(d => (
            <div
              key={d.key}
              title={t('stats.tooltip', { date: d.full, n: d.total })}
              className={`w-3.5 h-3.5 rounded-sm ${
                d.total === 0 ? 'bg-surface2' : d.total < 10 ? 'bg-brand/35' : d.total < 20 ? 'bg-brand/65' : 'bg-brand'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-5 mb-8">
        <Card label={t('stats.newWords')} value={t('common.words', { n: sum.newCount })} />
        <Card label={t('stats.reviewWords')} value={t('common.words', { n: sum.reviewCount })} />
        <Card label={t('stats.totalTime')} value={t('common.minutes', { n: Math.round(sum.spend / 60000) })} />
        <Card label={t('stats.totalKeys')} value={`${sum.keystrokes}`} />
        <Card label={t('stats.totalWrong')} value={`${sum.wrong}`} />
      </div>

      {activeDays === 0 ? (
        <p className="text-dim">{t('stats.empty')}</p>
      ) : (
        <div className="rounded-2xl border border-line bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface2 text-dim">
              <tr>
                <th className="text-left px-4 py-3 font-normal">{t('stats.thDate')}</th>
                <th className="text-right px-4 py-3 font-normal">{t('stats.thWords')}</th>
                <th className="text-right px-4 py-3 font-normal">{t('stats.thAcc')}</th>
                <th className="text-right px-4 py-3 font-normal">{t('stats.thTime')}</th>
                <th className="text-right px-4 py-3 font-normal">{t('stats.thKeys')}</th>
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

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="text-xs text-dim">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  )
}
