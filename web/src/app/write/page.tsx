'use client'

/**
 * 写字练习：从已加入的词库拆出单字，一个字一张卡——描红 / 看笔顺 / 按笔顺考自己。
 *
 * 与打字练习的关系：打字练「认读 + 拼音」，这里练「书写 + 笔顺」，
 * 两者共用词库，但进度各记各的（写字数据落在 useWriteStore，不进 base 的学习进度）。
 */

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import WriteBoard, { type WriteMode } from '@/components/WriteBoard'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import NavIcon from '@/components/ui/NavIcon'
import Page from '@/components/ui/Page'
import PageHeader from '@/components/ui/PageHeader'
import Panel from '@/components/ui/Panel'
import { useI18n } from '@/i18n'
import { useBaseStore } from '@/lib/store/base'
import { useWriteStore } from '@/lib/store/write'
import type { CnWord } from '@/lib/types'
import { useHydrated } from '@/lib/useHydrated'
import { useSpeak } from '@/lib/useSpeak'
import { buildCharQueue, charSourceMap } from '@/lib/write/chars'
import { sortedWrongChars, todayStat } from '@/lib/write/stats'

const MODES: WriteMode[] = ['trace', 'animate', 'quiz']

const BTN = 'rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink2 transition-colors hover:bg-hover disabled:opacity-40'
const BTN_ON = 'rounded-lg border border-brand bg-brand-soft px-3 py-1.5 text-sm text-brand'
/** 发音按钮：只有图标，靠 title 说明念的是字还是词 */
const BTN_SOUND = 'inline-flex items-center rounded-lg border border-line bg-surface p-1 text-dim transition-colors hover:bg-hover hover:text-ink'

export default function WritePage() {
  const { t } = useI18n()
  const hydrated = useHydrated()
  const speakText = useSpeak()
  const dicts = useBaseStore(s => s.dicts)
  const currentDictId = useBaseStore(s => s.currentDictId)
  const wrongChars = useWriteStore(s => s.wrongChars)
  const daily = useWriteStore(s => s.daily)
  const commitChar = useWriteStore(s => s.commitChar)
  const addSpend = useWriteStore(s => s.addSpend)
  const removeWrongChar = useWriteStore(s => s.removeWrongChar)
  const clearWrongChars = useWriteStore(s => s.clearWrongChars)

  const [dictId, setDictId] = useState('')
  const [available, setAvailable] = useState<Set<string> | null>(null)
  const [index, setIndex] = useState(0)
  /** 从错字本直接跳过来的字：可能不在当前词库的队列里 */
  const [override, setOverride] = useState<string | null>(null)
  const [mode, setMode] = useState<WriteMode>('trace')
  const [runKey, setRunKey] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const [mistakes, setMistakes] = useState<number | null>(null)
  const startedAt = useRef(Date.now())

  // 可练字清单：只练生成过笔顺数据的字，没有数据的字直接不出现
  useEffect(() => {
    let cancelled = false
    fetch('/hanzi/index.json')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { chars?: string[] }) => {
        if (!cancelled) setAvailable(new Set(data.chars ?? []))
      })
      .catch(() => {
        if (!cancelled) setAvailable(new Set())
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeId = dictId || currentDictId || ''
  const dict = dicts.find(d => d.id === activeId)
  const queue = useMemo(() => (dict && available ? buildCharQueue(dict.words, available) : []), [dict, available])
  const sourceMap = useMemo<Map<string, CnWord>>(
    () => (dict ? charSourceMap(dict.words) : new Map()),
    [dict]
  )
  const wrongList = useMemo(() => sortedWrongChars(wrongChars), [wrongChars])
  const stat = useMemo(() => todayStat(daily), [daily])

  const char = override ?? queue[index] ?? ''
  const done = !override && queue.length > 0 && index >= queue.length
  const src = sourceMap.get(char)
  const pinyin = src ? src.pinyin[Array.from(src.word).indexOf(char)] ?? src.pinyin.join(' ') : ''

  const spendText = (ms: number) => {
    const min = Math.round(ms / 60000)
    return min >= 1 ? t('write.min', { n: min }) : t('write.sec', { n: Math.round(ms / 1000) })
  }

  const reset = (next: number) => {
    setOverride(null)
    setMistakes(null)
    setIndex(next)
    setResetKey(k => k + 1)
    startedAt.current = Date.now()
  }

  const goto = (next: number) => reset(Math.max(0, Math.min(next, queue.length)))

  const switchDict = (id: string) => {
    setDictId(id)
    reset(0)
  }

  /** 记完本字（时长 + 错笔）再进入下一个；错笔只在测验模式下有值 */
  const finish = () => {
    if (!char) return
    addSpend(Date.now() - startedAt.current)
    commitChar(char, mistakes ?? 0)
    if (index + 1 < queue.length) goto(index + 1)
    else {
      setOverride(null)
      setMistakes(null)
      setIndex(queue.length)
    }
  }

  /** 错字本点一个字：在队列里就跳过去，不在就直接练它 */
  const practiceChar = (target: string) => {
    const at = queue.indexOf(target)
    if (at >= 0) {
      goto(at)
      return
    }
    setOverride(target)
    setMistakes(null)
    setResetKey(k => k + 1)
    startedAt.current = Date.now()
  }

  const switchMode = (next: WriteMode) => {
    setMode(next)
    setMistakes(null)
    setRunKey(k => k + 1)
  }

  const modeLabel = (m: WriteMode) =>
    m === 'trace' ? t('write.trace') : m === 'animate' ? t('write.animate') : t('write.quiz')
  const hint =
    mode === 'trace' ? t('write.hintTrace') : mode === 'animate' ? t('write.hintAnimate') : t('write.hintQuiz')

  if (!hydrated) {
    return (
      <Page>
        <p className="text-sm text-dim">{t('common.loading')}</p>
      </Page>
    )
  }

  if (dicts.length === 0) {
    return (
      <Page>
        <PageHeader title={t('write.title')} desc={t('write.desc')} />
        <EmptyState
          icon="book"
          title={t('write.noDict')}
          desc={t('write.noDictDesc')}
          action={
            <Link href="/dicts" className={BTN_ON}>
              {t('nav.dicts')}
            </Link>
          }
        />
      </Page>
    )
  }

  return (
    <Page width="md">
      <PageHeader
        title={t('write.title')}
        desc={t('write.desc')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Chip>
              {t('write.statTime')} {spendText(stat.spend)}
            </Chip>
            <Chip>
              {t('write.statChars')} {stat.chars}
            </Chip>
            <Chip>
              {t('write.statMistakes')} {stat.mistakes}
            </Chip>
          </div>
        }
      />

      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeId}
            onChange={e => switchDict(e.target.value)}
            className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink"
          >
            {dicts.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-dim tabular-nums">
            {t('write.progress', { i: Math.min(index + 1, queue.length), n: queue.length })}
          </span>
        </div>

        {queue.length === 0 ? (
          <EmptyState variant="plain" icon="book" title={t('write.emptyChars')} />
        ) : done ? (
          <div className="flex flex-col items-center gap-4 py-10">
            <p className="text-sm text-ink2">{t('write.done')}</p>
            <button type="button" onClick={() => goto(0)} className={BTN_ON}>
              {t('write.again')}
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-6 md:flex-row">
            <div className="flex justify-center">
              <WriteBoard
                char={char}
                mode={mode}
                runKey={runKey}
                resetKey={resetKey}
                onQuizComplete={m => setMistakes(m)}
                errorText={t('write.noData')}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-hanzi text-4xl">{char}</span>
                  <button
                    type="button"
                    onClick={() => speakText(char)}
                    className={BTN_SOUND}
                    title={t('common.play')}
                    aria-label={t('common.play')}
                  >
                    <NavIcon name="sound" className="h-4 w-4" />
                  </button>
                </div>
                {pinyin && <div className="mt-1 text-sm text-brand">{pinyin}</div>}
                {src?.trans && <div className="mt-1 text-sm text-ink2">{src.trans}</div>}
                {src && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-dim">
                    <span>{t('write.from', { word: src.word })}</span>
                    <button
                      type="button"
                      onClick={() => speakText(src.word)}
                      className={BTN_SOUND}
                      title={t('common.play')}
                      aria-label={t('common.play')}
                    >
                      <NavIcon name="sound" className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {MODES.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={m === mode ? BTN_ON : BTN}
                  >
                    {modeLabel(m)}
                  </button>
                ))}
              </div>

              <p className="text-xs text-dim">{hint}</p>

              {mistakes !== null && (
                <p className={`text-sm ${mistakes === 0 ? 'text-ok' : 'text-err'}`}>
                  {mistakes === 0 ? t('write.perfect') : t('write.resultMistakes', { n: mistakes })}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => goto(index - 1)} disabled={index === 0} className={BTN}>
                  {t('write.prev')}
                </button>
                {mode === 'trace' && (
                  <button type="button" onClick={() => setResetKey(k => k + 1)} className={BTN}>
                    {t('write.clear')}
                  </button>
                )}
                {mode === 'animate' && (
                  <button type="button" onClick={() => setRunKey(k => k + 1)} className={BTN}>
                    {t('write.replay')}
                  </button>
                )}
                <button type="button" onClick={finish} className={BTN_ON}>
                  {t('write.next')}
                </button>
              </div>
            </div>
          </div>
        )}
      </Panel>

      <Panel
        title={t('write.wrongTitle')}
        actions={
          wrongList.length > 0 ? (
            <button type="button" onClick={clearWrongChars} className={BTN}>
              {t('write.wrongClear')}
            </button>
          ) : undefined
        }
      >
        {wrongList.length === 0 ? (
          <EmptyState variant="plain" icon="star" title={t('write.wrongEmpty')} />
        ) : (
          <div className="flex flex-wrap gap-2">
            {wrongList.map(w => (
              <span key={w.char} className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface2">
                <button
                  type="button"
                  onClick={() => practiceChar(w.char)}
                  className="px-3 py-2 font-hanzi text-2xl text-ink"
                  title={t('write.practice')}
                >
                  {w.char}
                </button>
                <span className="pr-1 text-xs tabular-nums text-dim">{w.count}</span>
                <button
                  type="button"
                  onClick={() => removeWrongChar(w.char)}
                  className="px-2 text-xs text-dim hover:text-ink"
                  title={t('common.remove')}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Panel>
    </Page>
  )
}
