'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useBaseStore } from '@/lib/store/base'
import { useSettingStore } from '@/lib/store/setting'
import { useHydrated } from '@/lib/useHydrated'
import PracticeBoard from '@/components/PracticeBoard'
import { useI18n } from '@/i18n'
import type { CnWord } from '@/lib/types'

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

  const commit = useCallback((word: CnWord, wrongTimes: number) => base.commitWord(word, wrongTimes), [base])
  const finish = useCallback((spendMs: number, keys: number) => base.finishSession(spendMs, keys), [base])
  const flush = useCallback(
    (spendMs: number, keys: number, startedAt: number) => base.addSessionStat(spendMs, keys, startedAt),
    [base]
  )
  const toggleKnown = useCallback((word: string) => base.toggleKnown(word), [base])
  const toggleCollect = useCallback((word: string) => base.toggleCollect(word), [base])
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
    return <div className="mx-auto max-w-3xl px-4 py-16 text-dim">{t('common.loading')}</div>
  }

  if (!dict && !isArticleSession) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-dim mb-6">{t('practice.noDictMsg')}</p>
        <Link href="/dicts" className="inline-flex h-10 px-5 items-center rounded-xl bg-brand text-white">
          {t('practice.chooseDict')}
        </Link>
      </div>
    )
  }

  if (!session || !words.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-dim mb-2">
          {isWrongSession
            ? t('practice.emptyWrong')
            : allKnown
              ? t('practice.allKnown')
              : t('practice.emptyGeneric')}
        </p>
        <p className="text-xs text-dim mb-6">
          {isWrongSession ? t('practice.emptyWrongHint') : t('practice.allKnownHint')}
        </p>
        <div className="flex justify-center gap-3">
          {!isWrongSession && dict && (
            <button
              onClick={() => {
                base.clearKnown()
                base.clearSession()
                base.startSession(dict.id, setting.perDayStudyNumber)
              }}
              className="inline-flex h-10 px-5 items-center rounded-xl bg-brand text-white"
            >
              {t('practice.clearKnownRestart')}
            </button>
          )}
          <Link href={isWrongSession ? '/' : '/dicts'} className="inline-flex h-10 px-5 items-center rounded-xl border border-line">
            {isWrongSession ? t('common.backHome') : t('practice.switchDict')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PracticeBoard
      key={session.startedAt}
      dict={dict}
      title={sessionTitle}
      words={words}
      setting={setting}
      knownWords={base.knownWords}
      collect={base.collect}
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
