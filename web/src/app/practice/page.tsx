'use client'

import { track } from '@vercel/analytics'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBaseStore } from '@/lib/store/base'
import { useSettingStore } from '@/lib/store/setting'
import { useHydrated } from '@/lib/useHydrated'
import PracticeBoard from '@/components/PracticeBoard'
import Page from '@/components/ui/Page'
import EmptyState from '@/components/ui/EmptyState'
import { useI18n } from '@/i18n'
import type { CnWord, StepType } from '@/lib/types'

export default function PracticePage() {
  const hydrated = useHydrated()
  const { t } = useI18n()
  const base = useBaseStore()
  const setting = useSettingStore()
  const router = useRouter()

  const session = base.session
  const isWrongSession = session?.kind === 'wrong'
  const isCollectSession = session?.kind === 'collect'
  // 文章会话自带词条，不属于任何词库
  const isArticleSession = session?.kind === 'article'
  const standalone = isWrongSession || isCollectSession || isArticleSession
  const sessionTitle = isWrongSession ? t('wrong.wrongBook') : session?.title

  // 错词练习会话的 dictId 是词的归属词库，不一定是当前词库
  const dict = base.dicts.find(d => d.id === (session?.dictId ?? base.currentDictId))

  // 没有会话、或会话属于别的词库时才自动开组（错词 / 收藏 / 文章会话保留）
  const needNewSession =
    hydrated && Boolean(base.currentDictId) && (!session || (!standalone && session.dictId !== base.currentDictId))

  useEffect(() => {
    if (!needNewSession || !base.currentDictId) return
    base.startSession(base.currentDictId, setting.perDayStudyNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needNewSession, base.currentDictId])

  const words = useMemo<CnWord[]>(() => (session ? base.getSessionWords() : []), [session, base.dicts]) // eslint-disable-line react-hooks/exhaustive-deps

  // 当前步骤（流程编排）：旧存档没有 steps 时按单步处理
  const steps = session?.steps ?? ['spell']
  const stepIndex = session?.stepIndex ?? 0
  const step = {
    index: stepIndex,
    // 错词补练一律用最基础的跟写（看见答案再打一遍），符合参考项目的 wrongWordClear
    mode: (session?.patch ? 'spell' : (steps[stepIndex] ?? 'spell')) as StepType,
    total: steps.length,
    patch: Boolean(session?.patch),
  }

  const commit = useCallback((word: CnWord, wrongTimes: number) => base.commitWord(word, wrongTimes), [base])
  // 流程编排：一批词跑完后由 store 判断是否还有后续步骤，返回 false 表示继续下一批
  const finish = useCallback((spendMs: number, keys: number) => {
    base.finishSession(spendMs, keys)
    const done = Boolean(useBaseStore.getState().session?.done)
    // 整组（含多步骤流程）真正跑完才上报一次，用于渠道转化归因
    if (done) track('practice_finished')
    return done
  }, [base])
  const flush = useCallback(
    (spendMs: number, keys: number, startedAt: number) => base.addSessionStat(spendMs, keys, startedAt),
    [base]
  )
  const toggleKnown = useCallback((word: string) => base.toggleKnown(word), [base])
  const toggleCollect = useCallback((word: string) => base.toggleCollect(word), [base])
  const toggleIgnore = useCallback((word: string) => base.toggleIgnore(word), [base])
  const restartSession = useCallback(() => {
    base.clearSession()
    if (isWrongSession) {
      if (!base.startWrongSession(20) && dict) base.startSession(dict.id, setting.perDayStudyNumber)
      return
    }
    if (isCollectSession) {
      if (!base.startCollectSession(30, t('wrong.collectBook')) && dict) base.startSession(dict.id, setting.perDayStudyNumber)
      return
    }
    if (isArticleSession) {
      router.push('/article')
      return
    }
    if (!dict) return
    base.startSession(dict.id, setting.perDayStudyNumber)
  }, [base, dict, setting.perDayStudyNumber, isWrongSession, isCollectSession, isArticleSession, router])
  const resetSession = useCallback(() => base.restartSession(), [base])

  // 全部词都标记为已掌握时没有可练内容
  const allKnown = Boolean(dict && dict.words.length && dict.words.every(w => base.knownWords.includes(w.word)))

  // 仅在进入页面时处理一次：上一组已完成（刷新后残留 done）就开新一组
  const checkedRef = useRef(false)
  useEffect(() => {
    if (!hydrated || checkedRef.current || !base.currentDictId) return
    checkedRef.current = true
    if (base.session?.done) {
      base.clearSession()
      base.startSession(base.currentDictId, setting.perDayStudyNumber)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, base.currentDictId, base.session])

  if (!hydrated) {
    return (
      <Page width="sm">
        <p className="py-16 text-dim">{t('common.loading')}</p>
      </Page>
    )
  }

  if (!dict && !isArticleSession) {
    return (
      <Page width="sm">
        <EmptyState
          icon="book"
          title={t('practice.noDictMsg')}
          action={
            <Link
              href="/dicts"
              className="inline-flex h-11 md:h-10 items-center rounded-lg bg-brand px-5 text-white"
            >
              {t('practice.chooseDict')}
            </Link>
          }
        />
      </Page>
    )
  }

  if (!session || !words.length) {
    return (
      <Page width="sm">
        <EmptyState
          icon={isWrongSession ? 'wrong' : 'keyboard'}
          title={
            isWrongSession
              ? t('practice.emptyWrong')
              : allKnown
                ? t('practice.allKnown')
                : t('practice.emptyGeneric')
          }
          desc={isWrongSession ? t('practice.emptyWrongHint') : t('practice.allKnownHint')}
          action={
            <>
              {!isWrongSession && dict && (
                <button
                  onClick={() => {
                    base.clearKnown()
                    base.clearSession()
                    base.startSession(dict.id, setting.perDayStudyNumber)
                  }}
                  className="inline-flex h-11 md:h-10 items-center rounded-lg bg-brand px-5 text-white"
                >
                  {t('practice.clearKnownRestart')}
                </button>
              )}
              <Link
                href={isWrongSession ? '/' : '/dicts'}
                className="inline-flex h-11 md:h-10 items-center rounded-lg border border-line px-5"
              >
                {isWrongSession ? t('common.backHome') : t('practice.switchDict')}
              </Link>
            </>
          }
        />
      </Page>
    )
  }

  return (
    <PracticeBoard
      key={session.startedAt}
      dict={dict}
      title={sessionTitle}
      words={words}
      setting={setting}
      step={step}
      knownWords={base.knownWords}
      collect={base.collect}
      fsrsData={base.fsrsData}
      ignoreWords={base.ignoreWords}
      onToggleIgnore={toggleIgnore}
      statistics={base.statistics}
      counts={{ newCount: session.newCount ?? 0, reviewCount: session.reviewCount ?? 0 }}
      onCommit={commit}
      onFinish={finish}
      onFlush={flush}
      sessionStartedAt={session.startedAt}
      onToggleKnown={toggleKnown}
      onToggleCollect={toggleCollect}
      onRestartSession={restartSession}
      onResetSession={resetSession}
    />
  )
}
