'use client'

import type { CnWord, TypingMode } from '@/lib/types'
import { useI18n } from '@/i18n'

interface Props {
  word: CnWord
  typingMode: TypingMode
  showPinyin: boolean
  showTrans: boolean
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
  masked,
  onPlay,
  onToggleKnown,
  known,
  onToggleCollect,
  collected,
}: Props) {
  const { t } = useI18n()
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-3xl sm:text-4xl font-semibold tracking-[0.15em]">
          {masked ? '·'.repeat(word.word.length) : word.word}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPlay}
            className="h-9 px-3 rounded-lg border border-line text-sm hover:bg-surface2 transition-colors"
            title={t('wordCard.playTitle')}
          >
            {t('wordCard.playBtn')}
          </button>
          <button
            onClick={onToggleKnown}
            className={`h-9 px-3 rounded-lg border text-sm transition-colors ${
              known ? 'border-ok text-ok' : 'border-line text-dim hover:bg-surface2'
            }`}
            title={t('wordCard.knownTitle')}
          >
            {known ? t('wordCard.known') : t('wordCard.markKnown')}
          </button>
          <button
            onClick={onToggleCollect}
            className={`h-9 px-3 rounded-lg border text-sm transition-colors ${
              collected ? 'border-warn text-warn' : 'border-line text-dim hover:bg-surface2'
            }`}
            title={t('wordCard.collectTitle')}
          >
            {collected ? t('wordCard.collected') : t('wordCard.collect')}
          </button>
        </div>
      </div>

      {showPinyin && <div className="text-brand text-lg tracking-wide mb-2">{word.pinyin.join(' ')}</div>}
      {showTrans && <div className="text-dim text-sm sm:text-base">{word.trans}</div>}

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
