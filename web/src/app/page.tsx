'use client'

import Link from 'next/link'
import { useBaseStore } from '@/lib/store/base'
import { useSettingStore } from '@/lib/store/setting'
import { useHydrated } from '@/lib/useHydrated'
import { useI18n } from '@/i18n'

export default function HomePage() {
  const hydrated = useHydrated()
  const base = useBaseStore()
  const setting = useSettingStore()
  const { t } = useI18n()

  const dict = base.dicts.find(d => d.id === base.currentDictId)
  const today = new Date().toISOString().slice(0, 10)
  const stat = base.statistics.find(s => s.date === today)
  const wrongCount = Object.keys(base.wrongWords).length
  const remaining = base.session && !base.session.done ? base.session.wordIds.length - base.session.index : 0
  const doneToday = stat?.total ?? 0
  const goal = Math.max(1, setting.dailyGoal)
  const goalPct = Math.min(100, Math.round((doneToday / goal) * 100))

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
          {t('home.heroA')}
          <span className="text-brand">{t('home.heroBrand')}</span>
          {t('home.heroC')}
        </h1>
        <p className="text-dim">{t('home.subtitle')}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 mb-10">
        <StatCard
          label={t('home.doneToday')}
          value={t('common.words', { n: doneToday })}
          hint={t('home.goalHint', { n: goal })}
        />
        <StatCard
          label={t('home.timeToday')}
          value={t('common.minutes', { n: Math.round((stat?.spend ?? 0) / 60000) })}
          hint={t('home.timeHint')}
        />
        <StatCard
          label={t('home.wrongBook')}
          value={t('common.words', { n: wrongCount })}
          hint={t('home.wrongHint')}
        />
      </section>

      <section className="rounded-2xl border border-line bg-surface px-5 py-4 mb-10">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-dim">{t('home.todayGoal')}</span>
          <span>
            <span className="font-medium">{doneToday}</span>
            <span className="text-dim"> / {goal}</span>
            {doneToday >= goal && <span className="ml-2 text-ok">{t('home.goalReached')}</span>}
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface2 overflow-hidden">
          <div
            className={`h-full transition-all ${doneToday >= goal ? 'bg-ok' : 'bg-brand'}`}
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <div className="text-xs text-dim mt-2">{t('home.goalNote')}</div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
        {!hydrated ? (
          <p className="text-dim">{t('common.loading')}</p>
        ) : dict ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-dim">{t('home.currentDict')}</div>
              <div className="text-xl font-medium mt-1">
                {dict.name}
                <span className="ml-2 text-sm text-dim">
                  {t('common.progress', { a: dict.lastLearnIndex, b: dict.length })}
                </span>
              </div>
              {remaining > 0 && (
                <div className="text-sm text-brand mt-1">{t('home.remaining', { n: remaining })}</div>
              )}
            </div>
            <Link
              href="/practice"
              className="h-11 px-6 inline-flex items-center rounded-xl bg-brand text-white font-medium"
            >
              {remaining > 0 ? t('home.continuePractice') : t('home.startPractice')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-medium">{t('home.noDictTitle')}</div>
              <div className="text-sm text-dim mt-1">{t('home.noDictDesc')}</div>
            </div>
            <Link href="/dicts" className="h-11 px-6 inline-flex items-center rounded-xl bg-brand text-white font-medium">
              {t('home.chooseDict')}
            </Link>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 mt-10">
        <Feature title={t('home.featSpellTitle')} desc={t('home.featSpellDesc')} />
        <Feature title={t('home.featDictationTitle')} desc={t('home.featDictationDesc')} />
        <Feature title={t('home.featFsrsTitle')} desc={t('home.featFsrsDesc')} />
        <Feature title={t('home.featVTitle')} desc={t('home.featVDesc')} />
      </section>
    </div>
  )
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="text-xs text-dim">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-dim mt-1">{hint}</div>
    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="font-medium mb-1">{title}</div>
      <div className="text-sm text-dim">{desc}</div>
    </div>
  )
}
