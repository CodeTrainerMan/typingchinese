'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ALL_SYLLABLES, type PinyinItem } from '@/lib/pinyinTable'
import { usePinyinSound } from '@/lib/useSpeak'
import { useI18n } from '@/i18n'
import NavIcon from '@/components/ui/NavIcon'
import Page from '@/components/ui/Page'
import PageHeader from '@/components/ui/PageHeader'
import Panel from '@/components/ui/Panel'

const QUIZ_LEN = 10
const OPTION_COUNT = 4
/** 选完停一拍再进下一题，让对错反馈看得见 */
const NEXT_DELAY = 900

/** listen：听音选拼音；read：看拼音选汉字 */
type Question = { type: 'listen' | 'read'; answer: PinyinItem; options: PinyinItem[] }

function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 干扰项的拼音和汉字都不能跟答案撞，否则单选题会出现两个正确答案 */
function makeQuestion(answer: PinyinItem, type: 'listen' | 'read'): Question {
  const rest = ALL_SYLLABLES.filter(x => x.py !== answer.py && x.hanzi !== answer.hanzi)
  const options = shuffle([answer, ...shuffle(rest).slice(0, OPTION_COUNT - 1)])
  return { type, answer, options }
}

export default function PinyinQuizPage() {
  const { t } = useI18n()
  const play = usePinyinSound()

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<PinyinItem | null>(null)
  const [score, setScore] = useState(0)

  const start = useCallback(() => {
    const pool = shuffle(ALL_SYLLABLES).slice(0, QUIZ_LEN)
    setQuestions(pool.map((item, i) => makeQuestion(item, i % 2 === 0 ? 'listen' : 'read')))
    setIndex(0)
    setScore(0)
    setPicked(null)
  }, [])

  const q = questions[index]
  const done = questions.length > 0 && index >= questions.length

  // 听音题进场自动放一遍（此时已有用户点击「开始」，不会被浏览器拦）
  useEffect(() => {
    if (!q || picked) return
    if (q.type === 'listen') play(q.answer)
  }, [q, picked, play])

  useEffect(() => {
    if (!picked) return
    const timer = setTimeout(() => {
      setPicked(null)
      setIndex(i => i + 1)
    }, NEXT_DELAY)
    return () => clearTimeout(timer)
  }, [picked])

  const pick = (item: PinyinItem) => {
    if (picked || !q) return
    setPicked(item)
    if (item.py === q.answer.py) setScore(s => s + 1)
  }

  return (
    <Page width="sm">
      <PageHeader
        title={t('pinyin.quizTitle')}
        desc={t('pinyin.quizDesc')}
        actions={
          <Link
            href="/pinyin"
            className="inline-flex h-9 items-center rounded-lg border border-line px-4 text-sm text-dim transition-colors hover:bg-hover"
          >
            {t('pinyin.backChart')}
          </Link>
        }
      />

      {questions.length === 0 && (
        <Panel>
          <div className="flex flex-col items-center gap-4 py-6">
            <button
              onClick={start}
              className="inline-flex h-10 items-center rounded-lg bg-brand px-5 text-sm text-white transition-opacity hover:opacity-90"
            >
              {t('pinyin.qStart')}
            </button>
          </div>
        </Panel>
      )}

      {done && (
        <Panel>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="text-2xl font-semibold text-ink">
              {t('pinyin.qScore', { n: score, m: questions.length })}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={start}
                className="inline-flex h-9 items-center rounded-lg border border-brand px-4 text-sm text-brand transition-colors hover:bg-brand-soft"
              >
                {t('pinyin.qAgain')}
              </button>
              <Link
                href="/pinyin"
                className="inline-flex h-9 items-center rounded-lg border border-line px-4 text-sm text-dim transition-colors hover:bg-hover"
              >
                {t('pinyin.backChart')}
              </Link>
            </div>
          </div>
        </Panel>
      )}

      {q && !done && (
        <Panel>
          <div className="flex items-center justify-between text-xs text-dim">
            <span>{t('pinyin.qProgress', { i: index + 1, n: questions.length })}</span>
            <span>{t('pinyin.qScoreShort', { n: score })}</span>
          </div>

          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="text-sm text-dim">
              {q.type === 'listen' ? t('pinyin.qListen') : t('pinyin.qRead')}
            </div>
            {q.type === 'listen' ? (
              <button
                onClick={() => play(q.answer)}
                title={t('pinyin.qReplay')}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-brand text-brand transition-colors hover:bg-brand-soft"
              >
                <NavIcon name="sound" className="h-7 w-7" />
              </button>
            ) : (
              <div className="font-mono text-3xl text-ink">{q.answer.py}</div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {q.options.map(o => {
              const isAnswer = o.py === q.answer.py
              const isWrongPick = picked?.py === o.py && !isAnswer
              const cls = picked
                ? isAnswer
                  ? 'border-ok text-ok'
                  : isWrongPick
                    ? 'border-err text-err'
                    : 'border-line text-dim'
                : 'border-line text-ink hover:bg-hover'
              return (
                <button
                  key={o.py}
                  disabled={Boolean(picked)}
                  onClick={() => pick(o)}
                  className={`h-12 rounded-lg border transition-colors ${
                    q.type === 'listen' ? 'font-mono text-lg' : 'font-hanzi text-xl'
                  } ${cls}`}
                >
                  {q.type === 'listen' ? o.py : o.hanzi}
                </button>
              )
            })}
          </div>

          <div className="mt-4 h-5 text-center text-sm">
            {picked &&
              (picked.py === q.answer.py ? (
                <span className="text-ok">{t('pinyin.qRight')}</span>
              ) : (
                <span className="text-err">
                  {t('pinyin.qWrong', { x: q.type === 'listen' ? q.answer.py : q.answer.hanzi })}
                </span>
              ))}
          </div>
        </Panel>
      )}
    </Page>
  )
}
