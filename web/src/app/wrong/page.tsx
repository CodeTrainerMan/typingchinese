'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBaseStore } from '@/lib/store/base'
import { useSettingStore } from '@/lib/store/setting'
import { useHydrated } from '@/lib/useHydrated'
import { useI18n } from '@/i18n'
import { speak } from '@/lib/tts'
import type { CnWord } from '@/lib/types'

export default function WrongPage() {
  const hydrated = useHydrated()
  const base = useBaseStore()
  const setting = useSettingStore()
  const router = useRouter()
  const { t } = useI18n()
  const [tab, setTab] = useState<'wrong' | 'collect'>('wrong')

  if (!hydrated) return <div className="mx-auto max-w-4xl px-4 py-16 text-dim">{t('common.loading')}</div>

  const records = Object.values(base.wrongWords).sort((a, b) => b.count - a.count || b.lastWrongAt - a.lastWrongAt)
  const collectWords = base.collect

  const findWord = (word: string): CnWord | undefined => {
    for (const dict of base.dicts) {
      const hit = dict.words.find(w => w.word === word)
      if (hit) return hit
    }
    return undefined
  }

  const play = (word: string) =>
    speak(word, { rate: setting.soundSpeed, volume: setting.soundVolume / 100, voiceURI: setting.voiceURI })

  const exportWrong = () => {
    const lines = records.map(r => {
      const word = findWord(r.word)
      return `${r.word}\t${word?.flatSpaced ?? ''}\t${word?.trans ?? ''}\t${r.count}`
    })
    // 表头跟随界面语言；导入时中文（词语/释义）与英文（word/meaning）列名都能识别
    const body = [
      `# ${t('common.wordCol')}\t${t('common.pinyinCol')}\t${t('common.meaningCol')}\t${t('wrong.wrongCount')}`,
      ...lines,
    ].join('\n')
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wrong-words-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabCls = (active: boolean) => `h-9 px-4 text-sm ${active ? 'bg-brand text-white' : 'hover:bg-surface2'}`
  const btnCls = 'h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2'

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="inline-flex rounded-lg border border-line overflow-hidden">
          <button onClick={() => setTab('wrong')} className={tabCls(tab === 'wrong')}>
            {t('wrong.tabWrong', { n: records.length })}
          </button>
          <button onClick={() => setTab('collect')} className={tabCls(tab === 'collect')}>
            {t('wrong.tabCollect', { n: collectWords.length })}
          </button>
        </div>

        {tab === 'wrong' && records.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (base.startWrongSession(20)) router.push('/practice')
              }}
              className="h-9 px-4 rounded-lg bg-brand text-white text-sm"
            >
              {t('wrong.practiceWrong')}
            </button>
            <button onClick={exportWrong} className={btnCls}>
              {t('common.export')}
            </button>
            <button onClick={() => base.resetWrong()} className={btnCls}>
              {t('wrong.clear')}
            </button>
          </div>
        )}

        {tab === 'collect' && collectWords.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (base.startCollectSession(30, t('wrong.collectBook'))) router.push('/practice')
              }}
              className="h-9 px-4 rounded-lg bg-brand text-white text-sm"
            >
              {t('wrong.practiceCollect')}
            </button>
            <button onClick={() => base.clearCollect()} className={btnCls}>
              {t('wrong.clearCollect')}
            </button>
          </div>
        )}
      </div>

      {tab === 'wrong' ? (
        records.length === 0 ? (
          <p className="text-dim">{t('wrong.emptyWrong')}</p>
        ) : (
          <div className="rounded-2xl border border-line bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface2 text-dim">
                <tr>
                  <th className="text-left px-4 py-3 font-normal">{t('common.wordCol')}</th>
                  <th className="text-left px-4 py-3 font-normal">{t('common.pinyinCol')}</th>
                  <th className="text-left px-4 py-3 font-normal">{t('common.meaningCol')}</th>
                  <th className="text-right px-4 py-3 font-normal">{t('wrong.wrongCount')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const word = findWord(r.word)
                  return (
                    <tr key={r.word} className="border-t border-line">
                      <td className="px-4 py-3 text-base tracking-widest">{r.word}</td>
                      <td className="px-4 py-3 font-mono text-dim">{word?.flatSpaced ?? '-'}</td>
                      <td className="px-4 py-3 text-dim">{word?.trans ?? '-'}</td>
                      <td className="px-4 py-3 text-right text-err">{r.count}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => play(r.word)} className="px-2 py-1 rounded-md border border-line text-xs hover:bg-surface2">
                          {t('common.play')}
                        </button>
                        <button
                          onClick={() => base.removeWrong(r.word)}
                          className="ml-2 px-2 py-1 rounded-md border border-line text-xs hover:bg-surface2"
                        >
                          {t('common.remove')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : collectWords.length === 0 ? (
        <p className="text-dim">{t('wrong.emptyCollect')}</p>
      ) : (
        <div className="rounded-2xl border border-line bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface2 text-dim">
              <tr>
                <th className="text-left px-4 py-3 font-normal">{t('common.wordCol')}</th>
                <th className="text-left px-4 py-3 font-normal">{t('common.pinyinCol')}</th>
                <th className="text-left px-4 py-3 font-normal">{t('common.meaningCol')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {collectWords.map(w => {
                const word = findWord(w)
                return (
                  <tr key={w} className="border-t border-line">
                    <td className="px-4 py-3 text-base tracking-widest">{w}</td>
                    <td className="px-4 py-3 font-mono text-dim">{word?.flatSpaced ?? '-'}</td>
                    <td className="px-4 py-3 text-dim">{word?.trans ?? '-'}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => play(w)} className="px-2 py-1 rounded-md border border-line text-xs hover:bg-surface2">
                        {t('common.play')}
                      </button>
                      <button
                        onClick={() => base.toggleCollect(w)}
                        className="ml-2 px-2 py-1 rounded-md border border-line text-xs hover:bg-surface2"
                      >
                        {t('wrong.uncollect')}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
