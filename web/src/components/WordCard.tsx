'use client'

import type { CnWord, TypingMode } from '@/lib/types'
import { useI18n } from '@/i18n'

interface Props {
  word: CnWord
  typingMode: TypingMode
  showPinyin: boolean
  showTrans: boolean
  /** 是否展示例句 / 词性这类富化信息；遮罩步骤必须关掉，否则等于把答案摊开 */
  showRich?: boolean
  masked: boolean
  onPlay: () => void
  onToggleKnown: () => void
  known: boolean
  onToggleCollect: () => void
  collected: boolean
}

export default function WordCard({
  word,
  typingMode,
  showPinyin,
  showTrans,
  showRich,
  masked,
  onPlay,
  onToggleKnown,
  known,
  onToggleCollect,
  collected,
}: Props) {
  const { t } = useI18n()
  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
      {/* 窄屏时标题和按钮各占一行，别把按钮挤变形 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* 汉字用宋体系（对标 TypeWords 中文文章字体），视觉上更像字帖 */}
        <div className="font-hanzi text-3xl sm:text-4xl font-semibold tracking-[0.15em]">
          {masked ? '·'.repeat(word.word.length) : word.word}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={onPlay}
            className="h-8 px-2.5 rounded-lg border border-line text-xs whitespace-nowrap hover:bg-hover transition-colors"
            title={t('wordCard.playTitle')}
          >
            {t('wordCard.playBtn')}
          </button>
          <button
            onClick={onToggleKnown}
            className={`h-8 px-2.5 rounded-lg border text-xs whitespace-nowrap transition-colors ${
            known ? 'border-ok text-ok' : 'border-line text-dim hover:bg-hover'
            }`}
            title={t('wordCard.knownTitle')}
          >
            {known ? t('wordCard.known') : t('wordCard.markKnown')}
          </button>
          <button
            onClick={onToggleCollect}
            className={`h-8 px-2.5 rounded-lg border text-xs whitespace-nowrap transition-colors ${
            collected ? 'border-warn text-warn' : 'border-line text-dim hover:bg-hover'
            }`}
            title={t('wordCard.collectTitle')}
          >
            {collected ? t('wordCard.collected') : t('wordCard.collect')}
          </button>
        </div>
      </div>

      {showPinyin && <div className="text-brand text-xl tracking-wide mb-2">{word.pinyin.join(' ')}</div>}
      {showTrans && <div className="text-dim text-sm sm:text-base">{word.trans}</div>}
      {showRich && <RichInfo word={word} />}

      {/* 非跟写模式不给「全拼 / 简拼 / 声调」提示，否则等于把答案摊开 */}
      {!masked && (
        <div className="mt-4 text-xs text-dim/80">
          {typingMode === 'tone' ? (
            <>
              {t('wordCard.toneA')} <code className="font-mono">{word.toneNum}</code> {t('wordCard.toneB')}{' '}
              <code className="font-mono">{word.flatSpaced}</code>
            </>
          ) : (
            <>
              {t('wordCard.spellA')} <code className="font-mono">{word.flatSpaced}</code> {t('wordCard.spellB')}{' '}
              <code className="font-mono">{word.initials}</code>
            </>
          )}
        </div>
      )}
      {word.flat.includes('v') && (
        <div className="mt-2 text-xs text-dim/80">
          {t('wordCard.note')}
          <span className="text-warn">{t('wordCard.uToV')}</span>
        </div>
      )}
    </div>
  )
}

/** 富化信息：词性 / 繁体 / 部首 / 例句 / 同义 / 反义 / 搭配，哪个有就显示哪个 */
export function RichInfo({ word }: { word: CnWord }) {
  const { t } = useI18n()
  const tags = (v?: string) =>
    (v ?? '')
      .split(/[、,，;；/]/)
      .map(s => s.trim())
      .filter(Boolean)
  const syn = tags(word.synonyms)
  const ant = tags(word.antonyms)
  const col = tags(word.collocations)

  if (
    !word.pos &&
    !word.traditional &&
    !word.radical &&
    !word.example &&
    !syn.length &&
    !ant.length &&
    !col.length
  ) {
    return null
  }

  const groups: [string, string[]][] = [
    [t('dictDetail.colSynonyms'), syn],
    [t('dictDetail.colAntonyms'), ant],
    [t('dictDetail.colCollocations'), col],
  ]

  return (
    <div className="mt-4 space-y-2 text-sm">
      {(word.pos || word.traditional || word.radical) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {word.pos && <span className="px-2 py-0.5 rounded-md bg-surface2 text-dim">{word.pos}</span>}
          {word.traditional && (
            <span className="text-dim">
              {t('dictDetail.colTraditional')} {word.traditional}
            </span>
          )}
          {word.radical && (
            <span className="text-dim">
              {t('dictDetail.colRadical')} {word.radical}
            </span>
          )}
        </div>
      )}

      {word.example && (
        <div className="rounded-lg border border-line bg-surface2/60 px-3 py-2">
          <div>{word.example}</div>
          {word.exampleTrans && <div className="text-dim text-xs mt-1">{word.exampleTrans}</div>}
        </div>
      )}

      {groups.map(([label, list]) =>
        list.length ? (
          <div key={label} className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-dim">{label}</span>
            {list.map(x => (
              <span key={x} className="px-1.5 py-0.5 rounded-md border border-line text-dim">
                {x}
              </span>
            ))}
          </div>
        ) : null
      )}
    </div>
  )
}
