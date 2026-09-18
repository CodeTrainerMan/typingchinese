'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { CnWord, LearningDict } from '@/lib/types'
import type { SettingState } from '@/lib/store/setting'
import { useTypingSession } from '@/lib/useTypingSession'
import { getTarget, getTargetSyllables } from '@/lib/pinyin'
import { accuracy, speed } from '@/lib/typing'
import { useI18n } from '@/i18n'
import PinyinDisplay from './PinyinDisplay'
import HanziInput from './HanziInput'
import VirtualKeyboard from './VirtualKeyboard'
import WordCard from './WordCard'

interface Props {
  /** 文章练习等临时会话没有所属词库 */
  dict?: LearningDict
  /** 覆盖标题（错词本 / 收藏本 / 文章用） */
  title?: string
  words: CnWord[]
  setting: SettingState
  knownWords: string[]
  onCommit: (word: CnWord, wrongTimes: number) => void
  onFinish: (spendMs: number, keys: number) => void
  /** 中途离开 / 切后台时把已产生的用时与击键数落盘（可重复调用，内部按增量累加） */
  onFlush: (spendMs: number, keys: number, startedAt: number) => void
  /** 本组会话标识，用于落盘时校验会话未变 */
  sessionStartedAt: number
  onToggleKnown: (word: string) => void
  onToggleCollect: (word: string) => void
  collect: string[]
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
  knownWords,
  onCommit,
  onFinish,
  onFlush,
  sessionStartedAt,
  onToggleKnown,
  onToggleCollect,
  collect,
  onRestartSession,
  onResetSession,
}: Props) {
  const { t } = useI18n()
  const boardTitle = title ?? dict?.name ?? t('board.defaultTitle')
  const [spend, setSpend] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const lastWrongRef = useRef(0)

  // 触屏设备（手机 / 平板）默认给出屏幕键盘
  const [coarsePointer, setCoarsePointer] = useState(false)
  useEffect(() => {
    setCoarsePointer(window.matchMedia('(pointer: coarse)').matches)
  }, [])
  // 汉字模式由真实输入框承接 IME，屏幕键盘没有意义
  const showKeyboard = (setting.virtualKeyboard || coarsePointer) && setting.inputMode === 'pinyin'

  // 承接手机软键盘输入：靠一个隐藏 input 拿到字符与退格
  const softInputRef = useRef<HTMLInputElement>(null)
  const softLenRef = useRef(0)
  const composingRef = useRef(false)

  const hanziMode = setting.inputMode === 'hanzi'
  // 非跟写模式一律遮住「答案」：卡片上的汉字、输入区上方的汉字、底部拼音提示
  const masked = setting.practiceMode !== 'spell'
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
      dictation: setting.practiceMode === 'dictation',
      soundVolume: setting.soundVolume,
      soundSpeed: setting.soundSpeed,
      voiceURI: setting.voiceURI,
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
    onWordDone: onCommit,
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

  if (session.finished) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center">
          <div className="text-2xl font-semibold mb-2">{t('board.groupDone')}</div>
          <p className="text-dim mb-8">{t('board.groupSummary', { title: boardTitle, n: words.length })}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Stat label={t('board.accuracy')} value={`${acc}%`} />
            <Stat
              label={t('board.speed')}
              value={`${sp.kpm} ${hanziMode ? t('board.charsPerMin') : t('board.keysPerMin')}`}
            />
            <Stat label={t('board.time')} value={`${Math.round(spend / 1000)}s`} />
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSpend(0)
                onRestartSession()
                session.restart()
              }}
              className="h-10 px-5 rounded-xl bg-brand text-white"
            >
              {t('board.again')}
            </button>
            <Link href="/" className="h-10 px-5 inline-flex items-center rounded-xl border border-line">
              {t('common.backHome')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between text-sm text-dim mb-4">
        <div>
          {boardTitle} · {session.progress.index + 1}/{session.progress.total}
          {session.repeatLabel && <span className="ml-2">{t('board.repeat', { n: session.repeatLabel })}</span>}
        </div>
        <div className="flex gap-4">
          <span>{t('board.accValue', { n: acc })}</span>
          <span>
            {sp.kpm} {hanziMode ? t('board.charsPerMin') : t('board.keysPerMin')}
          </span>
          <span>{Math.round(spend / 1000)}s</span>
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-surface2 overflow-hidden mb-6">
        <div
          className="h-full bg-brand transition-all"
          style={{ width: `${(session.progress.index / session.progress.total) * 100}%` }}
        />
      </div>

      {session.word && (
        <WordCard
          word={session.word}
          typingMode={setting.typingMode}
          showPinyin={setting.showPinyin && (setting.practiceMode === 'spell' || setting.practiceMode === 'test')}
          showTrans={setting.showTrans}
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
            showTarget={setting.practiceMode === 'spell'}
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
        <div className="mt-6 text-center text-sm text-dim">
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

      <div className="mt-10 flex flex-wrap justify-center items-center gap-2 text-xs text-dim">
        <Key>{setting.replayKey === 'f2' ? t('board.keyReplayF2') : t('board.keyReplayTab')}</Key>
        <Key>{t('board.keySkip')}</Key>
        <Key>{hanziMode ? t('board.keyBackspaceHanzi') : t('board.keyBackspacePinyin')}</Key>
        <button onClick={session.skip} className="px-3 py-1.5 rounded-lg border border-line hover:bg-surface2">
          {t('board.skip')}
        </button>
        <button
          onClick={() => {
            // 先把本组已产生的用时落盘，再重开（否则会被新会话覆盖）
            onFlush(session.elapsed(), session.stats.keys, sessionStartedAt)
            onResetSession()
            setSpend(0)
            session.restart()
          }}
          className="px-3 py-1.5 rounded-lg border border-line hover:bg-surface2"
        >
          {t('board.restart')}
        </button>
      </div>

      {session.imeDetected && !hanziMode && (
        <div className="mt-4 rounded-xl border border-warn/50 bg-warn/10 px-4 py-3 text-sm text-warn">
          {t('board.imeWarning')}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <div className="text-xs text-dim mb-1">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-1 rounded-md border border-line">{children}</span>
}
