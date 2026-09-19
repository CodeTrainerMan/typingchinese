'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { CardRecord, CnWord, LearningDict, ShortcutAction, Statistics, StepType } from '@/lib/types'
import type { SettingState } from '@/lib/store/setting'
import { useTypingSession } from '@/lib/useTypingSession'
import { isAudioStep, isMaskedStep, showsPinyinStep } from '@/lib/practice/flow'
import { currentRetention, reviveCard } from '@/lib/fsrs'
import { resolveVoiceURI } from '@/lib/tts'
import { downloadShareCard } from '@/lib/shareCard'
import { getTarget, getTargetSyllables } from '@/lib/pinyin'
import { accuracy, speed } from '@/lib/typing'
import { useI18n, type MessageKey } from '@/i18n'
import Page from './ui/Page'
import Panel from './ui/Panel'
import ProgressBar from './ui/ProgressBar'
import StatCard from './ui/StatCard'
import Chip from './ui/Chip'
import PinyinDisplay from './PinyinDisplay'
import HanziInput from './HanziInput'
import VirtualKeyboard from './VirtualKeyboard'
import WordCard, { RichInfo } from './WordCard'

interface Props {
  /** 文章练习等临时会话没有所属词库 */
  dict?: LearningDict
  /** 覆盖标题（错词本 / 收藏本 / 文章用） */
  title?: string
  words: CnWord[]
  setting: SettingState
  /** 当前步骤（流程编排）：决定遮罩、发音与提示显示 */
  step: { index: number; total: number; mode: StepType; patch: boolean }
  knownWords: string[]
  onCommit: (word: CnWord, wrongTimes: number) => void
  /** 整组结束时返回 true；多步骤流程里还有步骤时返回 false */
  onFinish: (spendMs: number, keys: number) => boolean
  /** 中途离开 / 切后台时把已产生的用时与击键数落盘（可重复调用，内部按增量累加） */
  onFlush: (spendMs: number, keys: number, startedAt: number) => void
  /** 本组会话标识，用于落盘时校验会话未变 */
  sessionStartedAt: number
  onToggleKnown: (word: string) => void
  onToggleCollect: (word: string) => void
  collect: string[]
  /** 记忆卡片（详情弹窗里的复习安排） */
  fsrsData?: Record<string, CardRecord>
  /** 被忽略的词：详情弹窗里可切换，之后不再进入练习 */
  ignoreWords?: string[]
  onToggleIgnore: (word: string) => void
  /** 当日统计（结算页的本周打卡用） */
  statistics: Statistics[]
  /** 本组首轮的新学 / 复习词数（结算页展示用） */
  counts?: { newCount: number; reviewCount: number }
  /** 再来一组：重新选题 */
  onRestartSession: () => void
  /** 重新开始：回到本组第 1 词 */
  onResetSession: () => void
}

export default function PracticeBoard({
  dict,
  title,
  words,
  setting,
  step,
  knownWords,
  onCommit,
  onFinish,
  onFlush,
  sessionStartedAt,
  onToggleKnown,
  onToggleCollect,
  collect,
  fsrsData,
  ignoreWords,
  onToggleIgnore,
  statistics,
  counts,
  onRestartSession,
  onResetSession,
}: Props) {
  const { t } = useI18n()
  const boardTitle = title ?? dict?.name ?? t('board.defaultTitle')
  const [spend, setSpend] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  /** 词条详情弹窗（词性 / 例句 / 复习安排 / 忽略） */
  const [detailOpen, setDetailOpen] = useState(false)
  /** 分享卡导出结果的提示 */
  const [shareMsg, setShareMsg] = useState('')
  const lastWrongRef = useRef(0)
  /** 连对计数：整词一次打对才累加，中间出错就清零（纯视觉激励，不参与判定） */
  const [combo, setCombo] = useState(0)

  // 触屏设备（手机 / 平板）默认给出屏幕键盘
  const [coarsePointer, setCoarsePointer] = useState(false)
  useEffect(() => {
    // 只能在挂载后探测（服务端没有 window），否则会与 SSR 结果不一致
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoarsePointer(window.matchMedia('(pointer: coarse)').matches)
  }, [])
  // 汉字模式由真实输入框承接 IME，屏幕键盘没有意义
  const showKeyboard = (setting.virtualKeyboard || coarsePointer) && setting.inputMode === 'pinyin'

  // 承接手机软键盘输入：靠一个隐藏 input 拿到字符与退格
  const softInputRef = useRef<HTMLInputElement>(null)
  const softLenRef = useRef(0)
  const composingRef = useRef(false)

  const hanziMode = setting.inputMode === 'hanzi'
  // 当前步骤决定遮罩：只有跟写步骤给出「答案」（汉字与拼音提示）
  const mode = step.mode
  const masked = isMaskedStep(mode)
  // 汉字模式下目标串就是汉字本身，一个汉字算一个「音节」
  const getTargetFn = useCallback(
    (w: CnWord) => (hanziMode ? w.word : getTarget(w, setting.typingMode)),
    [setting.typingMode, hanziMode]
  )
  const getSyllablesFn = useCallback(
    (w: CnWord) => (hanziMode ? [...w.word] : getTargetSyllables(w, setting.typingMode)),
    [setting.typingMode, hanziMode]
  )

  const config = useMemo(
    () => ({
      repeatCount: setting.repeatCount,
      waitTime: setting.waitTime,
      // 汉字模式下空格/回车都被输入法占用，完成后只能自动进入下一个
      autoNext: setting.autoNext || hanziMode,
      inputWrongClear: setting.inputWrongClear,
      keyboardSound: setting.keyboardSound,
      effectSound: setting.effectSound,
      autoSound: setting.autoSound,
      dictation: isAudioStep(mode),
      soundVolume: setting.soundVolume,
      soundSpeed: setting.soundSpeed,
      voiceURI: resolveVoiceURI(setting.voiceURI, setting.voiceByLang, setting.lang),
      allowDigits: setting.typingMode === 'tone',
      inputMode: setting.inputMode,
      replayKey: setting.replayKey,
      nextKey: setting.nextKey,
    }),
    [setting]
  )

  const session = useTypingSession({
    words,
    getTarget: getTargetFn,
    getSyllables: getSyllablesFn,
    config,
    resetKey: `${step.index}-${step.patch}`,
    onWordDone: (word, wrongTimes) => {
      setCombo(c => (wrongTimes === 0 ? c + 1 : 0))
      onCommit(word, wrongTimes)
    },
    onFinish: ({ spendMs, keys }) => onFinish(spendMs, keys),
  })

  // 计时（每秒推进，仅用于界面展示；统计落盘用 session.elapsed() 的真实时间）
  useEffect(() => {
    if (session.finished) return
    const timer = setInterval(() => setSpend(session.elapsed()), 1000)
    return () => clearInterval(timer)
  }, [session.finished, session.elapsed])

  // 中途离开 / 切后台：把已产生的用时与击键数写进当日统计，避免白练
  const flushRef = useRef(onFlush)
  useEffect(() => {
    flushRef.current = onFlush
  }, [onFlush])

  const statsRef = useRef(session.stats)
  useEffect(() => {
    statsRef.current = session.stats
  }, [session.stats])

  useEffect(() => {
    const flush = () => flushRef.current(session.elapsed(), statsRef.current.keys, sessionStartedAt)
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onHidden)
      flush()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 打错时抖动
  useEffect(() => {
    if (session.wrongTimes > lastWrongRef.current) setShakeKey(k => k + 1)
    lastWrongRef.current = session.wrongTimes
  }, [session.wrongTimes])

  // 功能键快捷键：键位可在设置页自定义；同一键被多个动作占用时只认第一个
  useEffect(() => {
    if (session.finished || !session.word) return
    const map = new Map<string, ShortcutAction>()
    for (const action of SHORTCUT_ACTIONS) {
      const key = setting.shortcuts?.[action]
      // 空串 = 未绑定；重复绑定时先出现的动作优先
      if (key && !map.has(key)) map.set(key, action)
    }
    if (!map.size) return
    const current = session.word
    const onKey = (e: KeyboardEvent) => {
      const action = map.get(e.key)
      if (!action) return
      e.preventDefault()
      if (action === 'pinyin') setting.patch({ showPinyin: !setting.showPinyin })
      else if (action === 'trans') setting.patch({ showTrans: !setting.showTrans })
      else if (action === 'known') onToggleKnown(current.word)
      else if (action === 'collect') onToggleCollect(current.word)
      else if (action === 'detail') setDetailOpen(true)
      else session.skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [session.finished, session.word, session.skip, setting, onToggleKnown, onToggleCollect])

  // 移动端：保持隐藏输入框聚焦，软键盘才不会收起
  useEffect(() => {
    if (!showKeyboard || session.finished) return
    softInputRef.current?.focus()
    const refocus = () => softInputRef.current?.focus()
    window.addEventListener('click', refocus)
    return () => window.removeEventListener('click', refocus)
  }, [showKeyboard, session.finished])

  const handleSoftInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (composingRef.current) return
    const el = e.currentTarget
    let value = el.value
    const prev = softLenRef.current
    if (value.length > prev) {
      for (const ch of value.slice(prev)) session.type(ch)
    } else if (value.length < prev) {
      for (let i = 0; i < prev - value.length; i++) session.type('Backspace')
    }
    // 别让内容无限增长，只留尾部若干字符用于比对
    if (value.length > 12) {
      value = value.slice(-6)
      el.value = value
    }
    softLenRef.current = value.length
  }

  const acc = accuracy(session.stats.keys - session.stats.wrong, session.stats.keys)
  const sp = speed(session.stats.keys, session.progress.index, spend)

  // 最近 7 天的打卡情况：当天有完成记录或练习时长即算打卡
  const week = useMemo(() => {
    const days: { date: string; active: boolean }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = d.toISOString().slice(0, 10)
      days.push({ date, active: statistics.some(s => s.date === date && (s.total > 0 || s.spend > 0)) })
    }
    return days
  }, [statistics])

  if (session.finished) {
    return (
      <Page width="sm">
        <Panel>
          <div className="text-center">
            <div className="text-2xl font-semibold">{t('board.groupDone')}</div>
            <p className="mt-1 text-sm text-dim">
              {t('board.groupSummary', { title: boardTitle, n: words.length })}
            </p>

            <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
              <StatCard label={t('board.accuracy')} value={`${acc}%`} />
              <StatCard
                label={t('board.speed')}
                value={`${sp.kpm} ${hanziMode ? t('board.charsPerMin') : t('board.keysPerMin')}`}
              />
              <StatCard label={t('board.time')} value={mmss(spend)} />
            </div>
            {counts && counts.newCount + counts.reviewCount > 0 && (
              <p className="mt-3 text-xs text-dim">
                {t('board.newReview', { n: counts.newCount, m: counts.reviewCount })}
              </p>
            )}

            <div className="mt-8">
              <div className="mb-2 text-xs text-dim">{t('board.week')}</div>
              <div className="flex items-center justify-center gap-1.5">
                {week.map(d => (
                  <span
                    key={d.date}
                    title={d.date}
                    className={`flex h-7 w-7 items-center justify-center rounded-md border text-[11px] tabular-nums ${
                      d.active ? 'border-brand bg-brand text-white' : 'border-line text-dim'
                    }`}
                  >
                    {new Date(d.date).getDate()}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-8 text-sm text-dim">{acc >= 90 ? t('board.cheerHigh') : t('board.cheerLow')}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setSpend(0)
                  setCombo(0)
                  onRestartSession()
                  session.restart()
                }}
                className="h-10 rounded-xl bg-brand px-5 text-white"
              >
                {t('board.again')}
              </button>
              <button
                onClick={async () => {
                  const ok = await downloadShareCard({
                    title: boardTitle,
                    accuracy: acc,
                    speed: `${sp.kpm} ${hanziMode ? t('board.charsPerMin') : t('board.keysPerMin')}`,
                    seconds: spend / 1000,
                    words: words.length,
                    date: new Date().toISOString().slice(0, 10),
                  })
                  setShareMsg(ok ? t('board.shareOk') : t('board.shareFail'))
                }}
                className="h-10 rounded-xl border border-line px-5"
              >
                {t('board.share')}
              </button>
              <Link href="/" className="inline-flex h-10 items-center rounded-xl border border-line px-5">
                {t('common.backHome')}
              </Link>
            </div>
            {shareMsg && <p className="mt-3 text-xs text-dim">{shareMsg}</p>}
          </div>
        </Panel>
      </Page>
    )
  }

  // 打完当前词、等下一个的时候就算完成一格，进度条要跟手
  const doneCount = session.progress.index + (session.waitingNext ? 1 : 0)
  const progressPct = session.progress.total ? (doneCount / session.progress.total) * 100 : 0

  return (
    <Page width="sm">
      {/* 进度区：与词卡同一层皮（白卡片），上面「在练什么 + 实时数据」，中间粗进度条，下面两端对齐说明 */}
      <div className="mb-6 rounded-xl border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {/* 词典名：对标 TypeWords 的 text-2xl font-bold */}
            <div className="truncate text-xl font-bold sm:text-2xl">{boardTitle}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {step.total > 1 && (
                <Chip>
                  {t('board.step', { i: step.index + 1, n: step.total })} · {t(MODE_LABEL[mode])}
                </Chip>
              )}
              {step.patch && <Chip>{t('board.wrongPractice')}</Chip>}
              {session.repeatLabel && <Chip>{t('board.repeat', { n: session.repeatLabel })}</Chip>}
              {/* 当前词已掌握 / 已收藏：不用点开按钮也能看到状态 */}
              {session.word && knownWords.includes(session.word.word) && (
                <Chip tone="plain">{t('wordCard.known')}</Chip>
              )}
              {session.word && collect.includes(session.word.word) && (
                <Chip tone="plain">{t('wordCard.collected')}</Chip>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {/* 连对 3 个以上才亮出来，避免每词都闪 */}
            {combo >= 3 && (
              <Chip key={combo} tone="brand" className="pop font-semibold">
                ×{combo}
              </Chip>
            )}
            <Chip>{t('board.accValue', { n: acc })}</Chip>
            <Chip>
              {sp.kpm} {hanziMode ? t('board.charsPerMin') : t('board.keysPerMin')}
            </Chip>
            <Chip>{mmss(spend)}</Chip>
          </div>
        </div>

        <ProgressBar className="mt-3" size="lg" value={progressPct} />

        <div className="mt-1.5 flex items-center justify-between text-xs text-dim">
          <span>
            {t('common.progress', { a: doneCount, b: session.progress.total })}
          </span>
          <span className="tabular-nums">{Math.round(progressPct)}%</span>
        </div>
      </div>

      {session.word && (
        <WordCard
          word={session.word}
          typingMode={setting.typingMode}
          showPinyin={setting.showPinyin && showsPinyinStep(mode)}
          showTrans={setting.showTrans}
          // 例句里带着这个词本身，遮罩步骤（听写 / 默写）展示就等于给答案
          showRich={setting.showTrans && !masked}
          masked={masked}
          onPlay={session.playCurrent}
          onToggleKnown={() => onToggleKnown(session.word!.word)}
          known={knownWords.includes(session.word.word)}
          onToggleCollect={() => onToggleCollect(session.word!.word)}
          collected={collect.includes(session.word.word)}
        />
      )}

      <div className="mt-8">
        {hanziMode && session.word ? (
          <HanziInput
            word={session.word}
            input={session.input}
            shakeKey={shakeKey}
            showTarget={!isMaskedStep(mode)}
            onType={ch => session.type(ch)}
            onBackspace={() => session.type('Backspace')}
          />
        ) : (
          <PinyinDisplay
            hanzi={session.word?.word ?? ''}
            groups={session.groups}
            cursor={session.input.length}
            shakeKey={shakeKey}
            masked={masked}
          />
        )}
      </div>

      {session.waitingNext && (
        <div className="pop mt-6 text-center text-sm text-dim">
          {setting.autoNext || hanziMode
            ? t('board.nextSoon')
            : t('board.pressNext', {
                key:
                  setting.nextKey === 'enter'
                    ? t('board.nextKeyEnter')
                    : setting.nextKey === 'space'
                      ? t('board.nextKeySpace')
                      : t('board.nextKeyBoth'),
              })}
        </div>
      )}

      {showKeyboard && (
        <>
          <input
            ref={softInputRef}
            className="fixed bottom-2 left-2 h-6 w-6 opacity-0"
            inputMode="text"
            enterKeyHint="go"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-label={t('board.ariaPinyinInput')}
            onInput={handleSoftInput}
            onCompositionStart={() => {
              composingRef.current = true
            }}
            onCompositionEnd={e => {
              composingRef.current = false
              e.currentTarget.value = ''
              softLenRef.current = 0
            }}
          />
          <VirtualKeyboard
            onKey={key => session.type(key)}
            onBackspace={() => session.type('Backspace')}
            onSkip={session.skip}
            onPlay={session.playCurrent}
            withDigits={setting.typingMode === 'tone'}
          />
        </>
      )}

      {/* 操作 + 键位提示：收进一张卡片，别散在页面底部 */}
      <div className="mt-8 rounded-xl border border-line bg-surface p-3 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={session.prev}
            disabled={session.progress.index === 0}
            className="h-9 rounded-lg border border-line px-3 text-sm hover:bg-hover disabled:opacity-40"
          >
            {t('board.prev')}
          </button>
          <button
            onClick={() => setDetailOpen(true)}
            disabled={!session.word}
            className="h-9 rounded-lg border border-line px-3 text-sm hover:bg-hover disabled:opacity-40"
          >
            {t('board.detail')}
          </button>
          <button onClick={session.skip} className="h-9 rounded-lg border border-line px-3 text-sm hover:bg-hover">
            {t('board.skip')}
          </button>
          <button
            onClick={() => {
              // 先把本组已产生的用时落盘，再重开（否则会被新会话覆盖）
              onFlush(session.elapsed(), session.stats.keys, sessionStartedAt)
              onResetSession()
              setSpend(0)
              setCombo(0)
              session.restart()
            }}
            className="h-9 rounded-lg border border-line px-3 text-sm hover:bg-hover"
          >
            {t('board.restart')}
          </button>
        </div>

        {/* 键位提示：触屏按不到功能键，小屏直接不显示；末尾给出改键入口 */}
        <div className="mt-3 hidden flex-wrap items-center justify-center gap-1.5 sm:flex">
          <Key>{setting.replayKey === 'f2' ? t('board.keyReplayF2') : t('board.keyReplayTab')}</Key>
          {SHORTCUT_ACTIONS.map(action => {
            const key = setting.shortcuts?.[action]
            if (!key) return null
            return (
              <Key key={action}>
                {key === 'Escape' ? 'Esc' : key} · {t(ACTION_LABEL[action])}
              </Key>
            )
          })}
          <Key>{hanziMode ? t('board.keyBackspaceHanzi') : t('board.keyBackspacePinyin')}</Key>
          <Link href="/setting" className="text-[11px] text-dim underline decoration-dotted hover:text-brand">
            {t('nav.setting')}
          </Link>
        </div>
      </div>

      {session.imeDetected && !hanziMode && (
        <div className="mt-4 rounded-xl border border-warn/50 bg-warn/10 px-4 py-3 text-sm text-warn">
          {t('board.imeWarning')}
        </div>
      )}

      {detailOpen && session.word && (
        <WordDetail
          word={session.word}
          card={fsrsData?.[session.word.word]}
          known={knownWords.includes(session.word.word)}
          collected={collect.includes(session.word.word)}
          ignored={(ignoreWords ?? []).includes(session.word.word)}
          onPlay={session.playCurrent}
          onToggleKnown={() => onToggleKnown(session.word!.word)}
          onToggleCollect={() => onToggleCollect(session.word!.word)}
          onToggleIgnore={() => onToggleIgnore(session.word!.word)}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </Page>
  )
}

/** 词条详情弹窗：完整释义 + 富化信息 + 记忆安排，顺便能标记掌握 / 收藏 / 忽略 */
function WordDetail({
  word,
  card,
  known,
  collected,
  ignored,
  onPlay,
  onToggleKnown,
  onToggleCollect,
  onToggleIgnore,
  onClose,
}: {
  word: CnWord
  card?: CardRecord
  known: boolean
  collected: boolean
  ignored: boolean
  onPlay: () => void
  onToggleKnown: () => void
  onToggleCollect: () => void
  onToggleIgnore: () => void
  onClose: () => void
}) {
  const { t } = useI18n()
  const revived = card ? reviveCard(card) : undefined
  const nextReview = revived?.due ? new Date(revived.due).toLocaleDateString() : t('board.detailNoCard')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-2xl tracking-widest">{word.word}</div>
            <div className="text-brand text-sm mt-1">{word.pinyin.join(' ')}</div>
          </div>
          <button onClick={onClose} className="px-2 py-1 rounded-md border border-line text-xs">
            {t('common.cancel')}
          </button>
        </div>

        <div className="text-sm text-dim">{word.trans || t('dictDetail.meaningPlaceholder')}</div>
        <RichInfo word={word} />

        <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
          <MiniStat label={t('board.detailNext')} value={nextReview} />
          <MiniStat
            label={t('board.detailStability')}
            value={revived ? `${revived.stability.toFixed(1)}d` : '—'}
          />
          <MiniStat
            label={t('board.detailRetention')}
            value={revived ? `${Math.round(currentRetention(revived) * 100)}%` : '—'}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-5 text-xs">
          <button onClick={onPlay} className="px-3 py-1.5 rounded-lg border border-line hover:bg-surface2">
            {t('common.play')}
          </button>
          <button onClick={onToggleKnown} className="px-3 py-1.5 rounded-lg border border-line hover:bg-surface2">
            {known ? t('wordCard.known') : t('wordCard.markKnown')}
          </button>
          <button onClick={onToggleCollect} className="px-3 py-1.5 rounded-lg border border-line hover:bg-surface2">
            {collected ? t('wordCard.collected') : t('wordCard.collect')}
          </button>
          <button
            onClick={onToggleIgnore}
            className="px-3 py-1.5 rounded-lg border border-line hover:bg-surface2"
          >
            {ignored ? t('board.ignored') : t('board.ignore')}
          </button>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line px-2 py-2">
      <div className="text-dim truncate">{label}</div>
      <div className="font-medium mt-0.5 truncate">{value}</div>
    </div>
  )
}

/** 功能键顺序（与设置页一致）；同一键被多个动作占用时靠前的动作生效 */
const SHORTCUT_ACTIONS: ShortcutAction[] = ['skip', 'pinyin', 'trans', 'known', 'collect', 'detail']

/** 底部提示只写动作名，键名由设置动态拼上，改键后提示不会说谎 */
const ACTION_LABEL: Record<ShortcutAction, MessageKey> = {
  skip: 'board.actSkip',
  pinyin: 'board.actPinyin',
  trans: 'board.actTrans',
  known: 'board.actKnown',
  collect: 'board.actCollect',
  detail: 'board.actDetail',
}

/** 步骤名直接复用设置页的模式文案，避免多一套翻译 */
const MODE_LABEL: Record<StepType, MessageKey> = {
  spell: 'setting.modeSpell',
  dictation: 'setting.modeDictation',
  test: 'setting.modeTest',
  write: 'setting.modeWrite',
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-line bg-surface2 px-1.5 py-0.5 text-[11px] text-dim">
      {children}
    </span>
  )
}

/** 用时统一排成 mm:ss，比秒数少一位跳动，也不至于宽度乱变 */
function mmss(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
