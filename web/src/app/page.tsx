'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useBaseStore } from '@/lib/store/base'
import { useSettingStore } from '@/lib/store/setting'
import { useHydrated } from '@/lib/useHydrated'
import NavIcon from '@/components/ui/NavIcon'
import CommunityLinks from '@/components/CommunityLinks'
import Page from '@/components/ui/Page'
import Panel from '@/components/ui/Panel'
import ProgressBar from '@/components/ui/ProgressBar'
import StatCard from '@/components/ui/StatCard'
import DictBook, { DictBookAdd } from '@/components/ui/DictBook'
import { useI18n } from '@/i18n'

/**
 * 首页（对标 TypeWords 的 /words）：不给落地页式的英雄区，
 * 直接把「当前词库 + 今日任务」摆在最上面，统计与书架按顺序往下排。
 */
export default function HomePage() {
  const hydrated = useHydrated()
  const base = useBaseStore()
  const setting = useSettingStore()
  const { t } = useI18n()

  const dict = base.dicts.find(d => d.id === base.currentDictId)
  const today = new Date().toISOString().slice(0, 10)
  const stat = base.statistics.find(s => s.date === today)
  const wrongCount = Object.keys(base.wrongWords).length
  // 多步骤流程里当前步骤的词表才是剩余量（错词补练时是子集）
  const sessionIds = base.session?.stepWords ?? base.session?.wordIds ?? []
  const remaining = base.session && !base.session.done ? sessionIds.length - base.session.index : 0

  const doneToday = stat?.total ?? 0
  const goal = Math.max(1, setting.dailyGoal)
  const goalPct = Math.min(100, Math.round((doneToday / goal) * 100))
  const learnedPct = dict && dict.length ? Math.min(100, (dict.lastLearnIndex / dict.length) * 100) : 0

  // 近 7 天打卡：当天有完成量或用时即算练过
  const week = useMemo(() => {
    const days: { date: string; active: boolean; n: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = d.toISOString().slice(0, 10)
      const s = base.statistics.find(x => x.date === date)
      days.push({ date, active: Boolean(s && (s.total > 0 || s.spend > 0)), n: s?.total ?? 0 })
    }
    return days
  }, [base.statistics])

  const activeDays = base.statistics.filter(s => s.total > 0 || s.spend > 0).length
  const totalWords = base.statistics.reduce((sum, s) => sum + (s.total ?? 0), 0)

  return (
    <Page>
      {/* 第一张卡：左边「在学什么 + 学到哪」，右边「今天要练多少 + 开始」 */}
      <Panel>
        <div className="flex flex-col gap-6 md:flex-row">
          {/* 左：当前词库 */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-solid">
                <NavIcon name="book" className="h-5 w-5 text-brand" />
              </div>
              <Link href="/dicts" className="truncate text-2xl font-semibold text-ink hover:text-brand">
                {dict?.name ?? t('home.noDictTitle')}
              </Link>
            </div>

            {!hydrated ? (
              <p className="text-sm text-dim">{t('common.loading')}</p>
            ) : dict ? (
              <div className="space-y-2">
                <ProgressBar size="lg" value={learnedPct} />
                <div className="flex items-center justify-between text-sm text-dim">
                  <span>{t('common.progress', { a: dict.lastLearnIndex, b: dict.length })}</span>
                  <span className="tabular-nums">{Math.round(learnedPct)}%</span>
                </div>
                {remaining > 0 && <div className="text-sm text-brand">{t('home.remaining', { n: remaining })}</div>}
              </div>
            ) : (
              <p className="text-sm text-dim">{t('home.noDictDesc')}</p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dicts"
                className="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-sm font-medium text-white hover:opacity-90"
              >
                {t('home.chooseDict')}
              </Link>
              {dict && (
                <Link
                  href={`/dicts/${dict.id}`}
                  className="inline-flex h-9 items-center rounded-lg border border-line bg-solid px-3 text-sm hover:bg-hover"
                >
                  {t('common.edit')}
                </Link>
              )}
            </div>
          </div>

          {/* 右：今日任务 */}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-solid">
                  <NavIcon name="star" className="h-5 w-5 text-warn" />
                </div>
                <span className="text-xl font-semibold text-ink">{t('home.todayGoal')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-dim">
                {t('home.goalHint', { n: goal })}
                <span className="flex h-10 items-center rounded-sm bg-purple px-3 text-2xl font-bold text-white">
                  {goal}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                size="lg"
                label={t('home.doneToday')}
                value={String(doneToday)}
                suffix="words"
                tone={doneToday >= goal ? 'ok' : 'brand'}
              />
              <StatCard
                size="lg"
                label={t('home.wrongBook')}
                value={String(wrongCount)}
                suffix="words"
                tone={wrongCount ? 'err' : 'brand'}
              />
            </div>

            <ProgressBar size="lg" value={goalPct} tone={doneToday >= goal ? 'ok' : 'brand'} />

            <Link
              href="/practice"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-brand px-6 font-medium text-white sm:w-auto"
            >
              {remaining > 0 ? t('home.continuePractice') : t('home.startPractice')}
            </Link>
          </div>
        </div>
      </Panel>

      {/* 第二张卡：统计 + 近 7 天打卡 */}
      <Panel title={t('stats.title')}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t('home.timeToday')}
            value={String(Math.round((stat?.spend ?? 0) / 60000))}
            suffix="min"
          />
          <StatCard label={t('stats.activeDays')} value={String(activeDays)} suffix="days" />
          <StatCard label={t('stats.totalWords')} value={String(totalWords)} suffix="words" />
        </div>

        <div className="mt-6">
          <div className="mb-2 text-xs text-dim">{t('board.week')}</div>
          <div className="flex items-center gap-2">
            {week.map(d => (
              <span
                key={d.date}
                title={`${d.date} · ${d.n}`}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs tabular-nums ${
                  d.active ? 'border-brand bg-brand text-white' : 'border-line text-dim'
                }`}
              >
                {new Date(d.date).getDate()}
              </span>
            ))}
          </div>
        </div>
      </Panel>

      {/* 第三张卡：词库书架 */}
      <Panel
        title={t('home.currentDict')}
        actions={
          <Link href="/dicts" className="text-sm text-brand hover:opacity-80">
            {t('home.chooseDict')}
          </Link>
        }
      >
        {!hydrated ? (
          <p className="text-sm text-dim">{t('common.loading')}</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {base.dicts.map(d => (
              <DictBook
                key={d.id}
                name={d.name}
                count={d.length}
                learned={d.lastLearnIndex}
                current={d.id === base.currentDictId}
                onClick={() => base.setCurrentDict(d.id)}
              />
            ))}
            <DictBookAdd />
          </div>
        )}
      </Panel>

      {/* 第四张卡：四个玩法说明 */}
      <Panel title={t('home.featFsrsTitle')}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Feat title={t('home.featSpellTitle')} desc={t('home.featSpellDesc')} />
          <Feat title={t('home.featDictationTitle')} desc={t('home.featDictationDesc')} />
          <Feat title={t('home.featFsrsTitle')} desc={t('home.featFsrsDesc')} />
          <Feat title={t('home.featVTitle')} desc={t('home.featVDesc')} />
        </div>
      </Panel>

      {/* 第五张卡：仓库与社群入口 */}
      <Panel title={t('community.title')} desc={t('community.desc')}>
        <CommunityLinks />
      </Panel>
    </Page>
  )
}

function Feat({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <div className="font-semibold text-ink">{title}</div>
      <p className="mt-1 text-sm text-dim">{desc}</p>
    </div>
  )
}
