'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useBaseStore } from '@/lib/store/base'
import { useSettingStore } from '@/lib/store/setting'
import { useHydrated } from '@/lib/useHydrated'
import { buildWords, parseDictFile, parseEntries, type RawEntry } from '@/lib/customDict'
import { speak } from '@/lib/tts'
import { useI18n } from '@/i18n'
import type { CnWord } from '@/lib/types'

export default function DictDetailPage() {
  const hydrated = useHydrated()
  const base = useBaseStore()
  const setting = useSettingStore()
  const router = useRouter()
  const { t } = useI18n()
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === 'string' ? params.id : ''
  const dict = base.dicts.find(d => d.id === id)

  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [adding, setAdding] = useState('')
  const [query, setQuery] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!dict) return
    setName(dict.name)
    setDesc(dict.description)
  }, [dict?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated) return <div className="mx-auto max-w-4xl px-4 py-16 text-dim">{t('common.loading')}</div>

  if (!dict) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-dim mb-6">{t('dictDetail.notFound')}</p>
        <Link href="/dicts" className="inline-flex h-10 px-5 items-center rounded-xl bg-brand text-white">
          {t('dictDetail.backToDicts')}
        </Link>
      </div>
    )
  }

  // 这里不用 useMemo：本页有提前 return，hooks 数量必须保持一致
  const keyword = query.trim()
  const visible = keyword
    ? dict.words.filter(
        w => w.word.includes(keyword) || w.flat.includes(keyword.toLowerCase()) || w.trans.includes(keyword)
      )
    : dict.words

  const saveMeta = () => {
    base.updateDict(dict.id, { name: name.trim() || dict.name, description: desc.trim() })
    setMsg(t('dictDetail.saved'))
  }

  const updateTrans = (wordId: string, trans: string) => {
    base.updateDict(dict.id, { words: dict.words.map(w => (w.id === wordId ? { ...w, trans } : w)) })
  }

  const removeWord = (wordId: string) => {
    const words = dict.words.filter(w => w.id !== wordId)
    base.updateDict(dict.id, { words, length: words.length })
  }

  const appendEntries = async (entries: RawEntry[]) => {
    const exist = new Set(dict.words.map(w => w.word))
    const fresh = entries.filter(e => !exist.has(e.word))
    if (!fresh.length) {
      setMsg(t('dictDetail.allExist'))
      return
    }
    setBusy(true)
    try {
      const words = await buildWords(fresh, 'edit')
      const next = [...dict.words, ...words]
      base.updateDict(dict.id, { words: next, length: next.length })
      setMsg(t('dictDetail.added', { n: words.length, m: next.length }))
      setAdding('')
    } catch (e) {
      setMsg(t('errors.genFailed', { msg: e instanceof Error ? e.message : t('errors.unknown') }))
    } finally {
      setBusy(false)
    }
  }

  const onAdd = async () => {
    const entries = parseEntries(adding)
    if (!entries.length) {
      setMsg(t('errors.noValidWords'))
      return
    }
    await appendEntries(entries)
  }

  const onFile = async (file: File) => {
    let entries: RawEntry[] = []
    try {
      entries = parseDictFile(await file.text(), file.name)
    } catch {
      setMsg(t('errors.parseFailed'))
      return
    }
    if (!entries.length) {
      setMsg(t('errors.noEntries'))
      return
    }
    await appendEntries(entries)
  }

  const download = (body: string, filename: string, type: string) => {
    const blob = new Blob([body], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJson = () => {
    download(JSON.stringify(dict, null, 2), `${dict.name}.json`, 'application/json;charset=utf-8')
  }

  const exportCsv = () => {
    const rows = dict.words.map(w => `${w.word},${w.flatSpaced},${w.trans.replace(/,/g, '，')}`)
    download(
      [`${t('common.wordCol')},${t('common.pinyinCol')},${t('common.meaningCol')}`, ...rows].join('\n'),
      `${dict.name}.csv`,
      'text/csv;charset=utf-8'
    )
  }

  const play = (word: string) =>
    speak(word, { rate: setting.soundSpeed, volume: setting.soundVolume / 100, voiceURI: setting.voiceURI })

  const current = base.currentDictId === dict.id

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <Link href="/dicts" className="text-sm text-dim hover:text-ink">
          {t('dictDetail.back')}
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => base.setCurrentDict(dict.id)}
            disabled={current}
            className="h-9 px-4 rounded-lg border border-line text-sm disabled:opacity-50 hover:bg-surface2"
          >
            {current ? t('common.inUse') : t('common.setCurrent')}
          </button>
          <Link href="/practice" className="h-9 px-4 inline-flex items-center rounded-lg bg-brand text-white text-sm">
            {t('common.goPractice')}
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 mb-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('dictDetail.namePlaceholder')}
            className="h-10 px-3 rounded-lg border border-line bg-surface2 text-sm"
          />
          <input
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder={t('dictDetail.descPlaceholder')}
            className="h-10 px-3 rounded-lg border border-line bg-surface2 text-sm"
          />
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button onClick={saveMeta} className="h-9 px-4 rounded-lg bg-brand text-white text-sm">
            {t('dictDetail.saveMeta')}
          </button>
          <span className="text-xs text-dim">
            {t('dictDetail.totalProgress', { n: dict.length, m: dict.lastLearnIndex })}
          </span>
          {msg && <span className="text-xs text-dim">{msg}</span>}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 mb-6">
        <div className="font-medium mb-1">{t('dictDetail.addWords')}</div>
        <p className="text-xs text-dim mb-3">{t('dictDetail.addWordsDesc')}</p>
        <textarea
          value={adding}
          onChange={e => setAdding(e.target.value)}
          rows={4}
          placeholder={'苹果,一种水果\n安静=没有声音'}
          className="w-full px-3 py-2 rounded-lg border border-line bg-surface2 text-sm font-mono"
        />
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <button
            onClick={onAdd}
            disabled={busy || !adding.trim()}
            className="h-9 px-4 rounded-lg bg-brand text-white text-sm disabled:opacity-50"
          >
            {busy ? t('common.generating') : t('dictDetail.add')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv,.txt,application/json,text/csv,text/plain"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) void onFile(file)
              if (fileRef.current) fileRef.current.value = ''
            }}
          />
          <button onClick={() => fileRef.current?.click()} className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2">
            {t('dicts.upload')}
          </button>
          <button onClick={exportJson} className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2">
            {t('dictDetail.exportJson')}
          </button>
          <button onClick={exportCsv} className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2">
            {t('dictDetail.exportCsv')}
          </button>
          <button
            onClick={() => {
              base.removeDict(dict.id)
              router.push('/dicts')
            }}
            className="h-9 px-4 rounded-lg border border-line text-sm text-err hover:bg-surface2"
          >
            {t('dictDetail.deleteDict')}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="text-sm text-dim">{t('dictDetail.entries', { n: visible.length })}</div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('common.searchPlaceholder')}
          className="h-9 w-full sm:w-56 px-3 rounded-lg border border-line bg-surface2 text-sm"
        />
      </div>

      <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-surface2 text-dim">
            <tr>
              <th className="text-left px-4 py-3 font-normal w-28">{t('common.wordCol')}</th>
              <th className="text-left px-4 py-3 font-normal w-40">{t('common.pinyinCol')}</th>
              <th className="text-left px-4 py-3 font-normal">{t('dictDetail.meaningEditable')}</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((w: CnWord) => (
              <tr key={w.id} className="border-t border-line">
                <td className="px-4 py-2 text-base tracking-widest whitespace-nowrap">{w.word}</td>
                <td className="px-4 py-2 font-mono text-dim whitespace-nowrap">{w.flatSpaced}</td>
                <td className="px-4 py-2">
                  <input
                    value={w.trans}
                    onChange={e => updateTrans(w.id, e.target.value)}
                    placeholder={t('dictDetail.meaningPlaceholder')}
                    className="w-full h-8 px-2 rounded-md border border-line bg-surface2 text-sm"
                  />
                </td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <button onClick={() => play(w.word)} className="px-2 py-1 rounded-md border border-line text-xs hover:bg-surface2">
                    {t('common.play')}
                  </button>
                  <button
                    onClick={() => removeWord(w.id)}
                    className="ml-2 px-2 py-1 rounded-md border border-line text-xs text-err hover:bg-surface2"
                  >
                    {t('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="px-4 py-8 text-dim text-center">{t('common.noMatch')}</p>}
      </div>
    </div>
  )
}
