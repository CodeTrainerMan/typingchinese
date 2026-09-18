'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBaseStore } from '@/lib/store/base'
import { useSettingStore } from '@/lib/store/setting'
import { useHydrated } from '@/lib/useHydrated'
import { useI18n } from '@/i18n'
import { resolveVoiceURI, speak } from '@/lib/tts'
import type { CnWord, WrongRecord } from '@/lib/types'

/** 错词本的分组方式 */
type GroupMode = 'none' | 'count' | 'time' | 'due' | 'dict'

export default function WrongPage() {
  const hydrated = useHydrated()
  const base = useBaseStore()
  const setting = useSettingStore()
  const router = useRouter()
  const { t } = useI18n()
  const [tab, setTab] = useState<'wrong' | 'collect'>('wrong')
  // 默认按错误次数分组：一眼看出哪些词最该先练
  const [group, setGroup] = useState<GroupMode>('count')
  // 时间分组需要“现在”；渲染期间不能调 Date.now()，挂载后再取
  const [now, setNow] = useState(0)
  useEffect(() => {
    const id = window.setTimeout(() => setNow(Date.now()), 0)
    return () => window.clearTimeout(id)
  }, [])

  if (!hydrated) return <div className="mx-auto max-w-4xl px-4 py-16 text-dim">{t('common.loading')}</div>

  const records = Object.values(base.wrongWords).sort((a, b) => b.count - a.count || b.lastWrongAt - a.lastWrongAt)
  const collectWords = base.collect
  // 记忆卡片到期的错词：这些词现在练最划算，单独给个入口
  const dueRows = now
    ? records.filter(r => {
        const card = base.fsrsData[r.word]
        return !!card && Date.parse(card.due) <= now
      })
    : []

  const findWord = (word: string): CnWord | undefined => {
    for (const dict of base.dicts) {
      const hit = dict.words.find(w => w.word === word)
      if (hit) return hit
    }
    return undefined
  }

  const play = (word: string) =>
    speak(word, {
      rate: setting.soundSpeed,
      volume: setting.soundVolume / 100,
      voiceURI: resolveVoiceURI(setting.voiceURI, setting.voiceByLang, setting.lang),
    })

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

  /** 词条属于哪个词库；找不到的归到「其它」（比如词库已删） */
  const dictNameOf = (word: string) =>
    base.dicts.find(d => d.words.some(w => w.word === word))?.name ?? t('wrong.groupOther')

  const makeGroups = (): { label: string; rows: WrongRecord[] }[] => {
    if (group === 'none') return [{ label: '', rows: records }]
    if (group === 'count')
      return [
        { label: t('wrong.groupHard'), rows: records.filter(r => r.count >= 4) },
        { label: t('wrong.groupMedium'), rows: records.filter(r => r.count >= 2 && r.count < 4) },
        { label: t('wrong.groupLight'), rows: records.filter(r => r.count < 2) },
      ].filter(g => g.rows.length)

    const day = 86_400_000
    // now 还是 0 说明挂载后的取值还没到，先不分组
    if ((group === 'time' || group === 'due') && !now) return [{ label: '', rows: records }]

    // 按记忆卡片的下次到期时间：该复习的排在最前
    if (group === 'due') {
      const dueAt = (word: string) => {
        const card = base.fsrsData[word]
        return card ? Date.parse(card.due) : NaN
      }
      const isScheduled = (r: WrongRecord) => Number.isFinite(dueAt(r.word))
      return [
        {
          label: t('wrong.groupDueNow'),
          rows: records.filter(r => isScheduled(r) && dueAt(r.word) <= now),
        },
        {
          label: t('wrong.groupDueSoon'),
          rows: records.filter(r => isScheduled(r) && dueAt(r.word) > now && dueAt(r.word) - now <= day),
        },
        { label: t('wrong.groupDueLater'), rows: records.filter(r => isScheduled(r) && dueAt(r.word) - now > day) },
        { label: t('wrong.groupNoCard'), rows: records.filter(r => !isScheduled(r)) },
      ].filter(g => g.rows.length)
    }

    if (group === 'time')
      return [
        { label: t('wrong.groupToday'), rows: records.filter(r => now - r.lastWrongAt < day) },
        {
          label: t('wrong.groupWeek'),
          rows: records.filter(r => now - r.lastWrongAt >= day && now - r.lastWrongAt < 7 * day),
        },
        { label: t('wrong.groupEarlier'), rows: records.filter(r => now - r.lastWrongAt >= 7 * day) },
      ].filter(g => g.rows.length)

    const byDict = new Map<string, WrongRecord[]>()
    for (const r of records) {
      const key = dictNameOf(r.word)
      byDict.set(key, [...(byDict.get(key) ?? []), r])
    }
    return [...byDict.entries()]
      .map(([label, rows]) => ({ label, rows }))
      .sort((a, b) => b.rows.length - a.rows.length)
  }
  const groups = makeGroups()

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
          <select
            value={group}
            onChange={e => setGroup(e.target.value as GroupMode)}
            className="h-9 rounded-lg border border-line bg-surface px-2 text-sm"
          >
            <option value="none">{t('wrong.groupNone')}</option>
            <option value="count">{t('wrong.groupByCount')}</option>
            <option value="time">{t('wrong.groupByTime')}</option>
            <option value="due">{t('wrong.groupByDue')}</option>
            <option value="dict">{t('wrong.groupByDict')}</option>
          </select>
        )}

        {tab === 'wrong' && records.length > 0 && (
          <div className="flex gap-2">
            {dueRows.length > 0 && (
              <button
                onClick={() => {
                  if (base.startWordsSession(dueRows.map(r => r.word), t('wrong.dueBook'))) router.push('/practice')
                }}
                className="h-9 px-4 rounded-lg bg-brand text-white text-sm"
              >
                {t('wrong.practiceDue', { n: dueRows.length })}
              </button>
            )}
            <button
              onClick={() => {
                if (base.startWrongSession(20)) router.push('/practice')
              }}
              className={btnCls}
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
          <div className="space-y-6">
            {groups.map(g => (
              <div key={g.label || 'all'}>
                {g.label && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{g.label}</span>
                    <span className="text-xs text-dim">{t('common.words', { n: g.rows.length })}</span>
                    <button
                      onClick={() => {
                        if (base.startWordsSession(g.rows.map(r => r.word), g.label)) router.push('/practice')
                      }}
                      className="ml-auto px-2 py-1 rounded-md border border-line text-xs hover:bg-surface2"
                    >
                      {t('wrong.practiceGroup')}
                    </button>
                  </div>
                )}
                <WrongTable rows={g.rows} findWord={findWord} onPlay={play} onRemove={base.removeWrong} />
              </div>
            ))}
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

/** 错词表格：分组后每组各渲染一张 */
function WrongTable({
  rows,
  findWord,
  onPlay,
  onRemove,
}: {
  rows: WrongRecord[]
  findWord: (word: string) => CnWord | undefined
  onPlay: (word: string) => void
  onRemove: (word: string) => void
}) {
  const { t } = useI18n()
  return (
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
          {rows.map(r => {
            const word = findWord(r.word)
            return (
              <tr key={r.word} className="border-t border-line">
                <td className="px-4 py-3 text-base tracking-widest">{r.word}</td>
                <td className="px-4 py-3 font-mono text-dim">{word?.flatSpaced ?? '-'}</td>
                <td className="px-4 py-3 text-dim">{word?.trans ?? '-'}</td>
                <td className="px-4 py-3 text-right text-err">{r.count}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => onPlay(r.word)}
                    className="px-2 py-1 rounded-md border border-line text-xs hover:bg-surface2"
                  >
                    {t('common.play')}
                  </button>
                  <button
                    onClick={() => onRemove(r.word)}
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
}
