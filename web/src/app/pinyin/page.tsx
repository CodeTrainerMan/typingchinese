'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FINAL_GROUPS, INITIALS, TONES, WHOLE, type PinyinItem } from '@/lib/pinyinTable'
import { usePinyinSound } from '@/lib/useSpeak'
import { useI18n } from '@/i18n'
import Page from '@/components/ui/Page'
import PageHeader from '@/components/ui/PageHeader'
import Panel from '@/components/ui/Panel'

/** 四声各用一个既有语义色，不新造颜色：一声 brand、二声 ok、三声 warn、四声 err */
const TONE_CLS = ['text-brand', 'text-ok', 'text-warn', 'text-err']

const GRID = 'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6'

/** 一格只写这个音本身（b / ao / zhi），示范音与例字点开后在上方的提示条里显示 */
function Cell({ item, onPlay }: { item: PinyinItem; onPlay: (item: PinyinItem) => void }) {
  return (
    <button
      onClick={() => onPlay(item)}
      title={`${item.py} ${item.hanzi}`}
      className="flex h-11 items-center justify-center rounded-lg border border-line bg-solid font-mono text-base text-ink transition-colors hover:bg-hover"
    >
      {item.symbol}
    </button>
  )
}

export default function PinyinPage() {
  const { t } = useI18n()
  const sound = usePinyinSound()
  const [current, setCurrent] = useState<PinyinItem | null>(null)

  /** 点一格：播放这个音的示范录音，并在上方提示条里显示它念的是什么 */
  const play = (item: PinyinItem) => {
    setCurrent(item)
    sound(item)
  }

  return (
    <Page>
      <PageHeader
        title={t('pinyin.title')}
        desc={t('pinyin.desc')}
        actions={
          <Link
            href="/pinyin/quiz"
            className="inline-flex h-9 items-center rounded-lg border border-brand px-4 text-sm text-brand transition-colors hover:bg-brand-soft"
          >
            {t('pinyin.quiz')}
          </Link>
        }
      />

      <div className="flex h-11 items-center gap-3 rounded-lg border border-line bg-solid px-4">
        {current ? (
          <>
            <span className="font-mono text-xl text-ink">{current.symbol}</span>
            <span className="font-mono text-sm text-dim">{current.py}</span>
            <span className="font-hanzi text-sm text-dim">{current.hanzi}</span>
          </>
        ) : (
          <span className="text-sm text-faint">{t('pinyin.tapHint')}</span>
        )}
      </div>

      <Panel title={t('pinyin.initials')} desc={t('pinyin.tapHint')}>
        <div className={GRID}>
          {INITIALS.map(i => (
            <Cell key={i.py} item={i} onPlay={play} />
          ))}
        </div>
      </Panel>

      <Panel title={t('pinyin.finals')} desc={t('pinyin.tapHint')}>
        <div className="space-y-4">
          {FINAL_GROUPS.map(g => (
            <div key={g.key}>
              <div className="mb-2 text-xs text-dim">{t(g.key)}</div>
              <div className={GRID}>
                {g.items.map(i => (
                  <Cell key={i.py} item={i} onPlay={play} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={t('pinyin.whole')} desc={t('pinyin.tapHint')}>
        <div className={GRID}>
          {WHOLE.map(i => (
            <Cell key={i.py} item={i} onPlay={play} />
          ))}
        </div>
      </Panel>

      <Panel title={t('pinyin.tones')} desc={t('pinyin.toneDesc')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TONES.map(x => (
            <button
              key={x.tone}
              onClick={() => play({ symbol: x.py, py: x.py, hanzi: x.hanzi })}
              className="flex flex-col items-center rounded-lg border border-line bg-solid py-4 transition-colors hover:bg-hover"
            >
              <span className="text-xs text-dim">{t('pinyin.toneN', { n: x.tone })}</span>
              <span className={`mt-1 font-mono text-2xl ${TONE_CLS[x.tone - 1]}`}>{x.py}</span>
              <span className="mt-1 font-hanzi text-xl text-ink">{x.hanzi}</span>
            </button>
          ))}
        </div>
      </Panel>

      {/* CC BY-SA 要求在使用处署名，所以这行不翻译、不删 */}
      <p className="text-center text-[11px] text-faint">
        Audio{' '}
        <a
          href="https://github.com/hugolpz/audio-cmn"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-dim"
        >
          hugolpz/audio-cmn
        </a>{' '}
        · CC BY-SA · voice: Chen Wang
      </p>
    </Page>
  )
}
