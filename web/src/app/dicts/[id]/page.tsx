'use client'

import { Fragment, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useBaseStore } from '@/lib/store/base'
import { useSettingStore } from '@/lib/store/setting'
import { useHydrated } from '@/lib/useHydrated'
import Page from '@/components/ui/Page'
import PageHeader from '@/components/ui/PageHeader'
import Panel from '@/components/ui/Panel'
import {
  buildWords,
  csvCell,
  parseDictFile,
  parseEntries,
  RICH_KEYS,
  type RawEntry,
} from '@/lib/customDict'
import { resolveVoiceURI, speak } from '@/lib/tts'
import { currentRetention, isDue, reviveCard } from '@/lib/fsrs'
import { useI18n, type MessageKey } from '@/i18n'
import type { CnWord, RichField } from '@/lib/types'

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
  /** 展开富化信息编辑面板的词条 id */
  const [openId, setOpenId] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // 切换词库时用该词库的元数据重置表单：在渲染期同步更新，避免 effect 里的级联渲染
  const [formOwner, setFormOwner] = useState('')
  if (dict && formOwner !== dict.id) {
    setFormOwner(dict.id)
    setName(dict.name)
    setDesc(dict.description)
  }

  if (!hydrated)
    return (
      <Page>
        <p className="py-16 text-dim">{t('common.loading')}</p>
      </Page>
    )

  if (!dict) {
    return (
      <Page>
        <div className="py-16 text-center">
          <p className="text-dim">{t('dictDetail.notFound')}</p>
          <Link
            href="/dicts"
            className="mt-6 inline-flex h-11 md:h-10 items-center rounded-lg bg-brand px-5 text-white"
          >
            {t('dictDetail.backToDicts')}
          </Link>
        </div>
      </Page>
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

  /** 富化字段（例句 / 词性 …）就地编辑 */
  const updateRich = (wordId: string, field: RichField, value: string) => {
    base.updateDict(dict.id, {
      words: dict.words.map(w => (w.id === wordId ? { ...w, [field]: value } : w)),
    })
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
    // 富化列一并导出：导出的表头能被 parseDictFile 认回来（中英文列名都支持）
    const header = [
      t('common.wordCol'),
      t('common.pinyinCol'),
      t('common.meaningCol'),
      ...RICH_KEYS.map(k => t(RICH_LABEL[k])),
    ]
    const rows = dict.words.map(w =>
      [w.word, w.flatSpaced, w.trans, ...RICH_KEYS.map(k => w[k] ?? '')].map(csvCell).join(',')
    )
    download(
      [header.map(csvCell).join(','), ...rows].join('\n'),
      `${dict.name}.csv`,
      'text/csv;charset=utf-8'
    )
  }

  const play = (word: string) =>
    speak(word, {
      rate: setting.soundSpeed,
      volume: setting.soundVolume / 100,
      voiceURI: resolveVoiceURI(setting.voiceURI, setting.voiceByLang, setting.lang),
    })

  const current = base.currentDictId === dict.id

  // 词库概览：总词数 / 已建卡片 / 今天到期 / 平均记忆保持率
  const cards = dict.words.map(w => base.fsrsData[w.word]).filter(Boolean)
  const dueNow = dict.words.filter(w => {
    const raw = base.fsrsData[w.word]
    // 没有卡片的词是「还没学过」，不算到期
    return raw ? isDue(reviveCard(raw)) : false
  }).length
  const retention = cards.length
    ? Math.round((cards.reduce((sum, raw) => sum + currentRetention(reviveCard(raw)), 0) / cards.length) * 100)
    : 0

  return (
    <Page>
      <Link href="/dicts" className="mb-4 inline-block text-sm text-dim hover:text-ink">
        {t('dictDetail.back')}
      </Link>
      <PageHeader
        title={dict.name}
        desc={t('dictDetail.totalProgress', { n: dict.length, m: dict.lastLearnIndex })}
        actions={
          <>
            <button
              onClick={() => base.setCurrentDict(dict.id)}
              disabled={current}
              className="inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm hover:bg-surface2 disabled:opacity-50"
            >
              {current ? t('common.inUse') : t('common.setCurrent')}
            </button>
            <Link
              href="/practice"
              onClick={() => base.startDictSession(dict.id)}
              className="inline-flex h-9 items-center rounded-lg bg-brand px-3 text-sm text-white"
            >
              {t('common.goPractice')}
            </Link>
          </>
        }
      />

      <Panel className="mb-6">
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
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={saveMeta}
            className="inline-flex h-9 items-center rounded-lg bg-brand px-3 text-sm text-white"
          >
            {t('dictDetail.saveMeta')}
          </button>
          {msg && <span className="text-xs text-dim">{msg}</span>}
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <StatCard label={t('dictDetail.statWords')} value={`${dict.length}`} />
        <StatCard label={t('dictDetail.statCards')} value={`${cards.length}`} />
        <StatCard label={t('dictDetail.statDue')} value={`${dueNow}`} />
        <StatCard label={t('dictDetail.statRetention')} value={`${retention}%`} />
      </div>

      <div className="rounded-xl border border-line bg-surface p-5 mb-6">
        <div className="font-semibold mb-1">{t('dictDetail.addWords')}</div>
        <p className="text-xs text-dim mb-3">{t('dictDetail.addWordsDesc')}</p>
        <textarea
          value={adding}
          onChange={e => setAdding(e.target.value)}
          onKeyDown={e => {
            // Cmd / Ctrl + Enter 直接提交，不必去点按钮
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              void onAdd()
            }
          }}
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

      <div className="rounded-xl border border-line bg-surface overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-surface2 text-dim">
            <tr className="border-b border-line">
              <th className="text-left px-4 py-3 text-xs font-semibold w-28">{t('common.wordCol')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold w-40">
                {t('common.pinyinCol')}
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold">
                {t('dictDetail.meaningEditable')}
              </th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((w: CnWord) => (
              <Fragment key={w.id}>
                <tr className="border-t border-line">
                  <td className="px-4 py-2 text-base tracking-widest whitespace-nowrap">{w.word}</td>
                  <td className="px-4 py-2 font-mono text-dim whitespace-nowrap">{w.flatSpaced}</td>
                  <td className="px-4 py-2">
                    <input
                      value={w.trans}
                      onChange={e => updateTrans(w.id, e.target.value)}
                      placeholder={t('dictDetail.meaningPlaceholder')}
                      className="w-full h-11 md:h-8 px-2 rounded-sm border border-line bg-surface2 text-sm"
                    />
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => setOpenId(openId === w.id ? '' : w.id)}
                      className="rounded-lg border border-line px-3 py-2 text-xs min-h-11 md:min-h-8 hover:bg-surface2"
                    >
                      {t('dictDetail.detailBtn')}
                    </button>
                    <button
                      onClick={() => play(w.word)}
                      className="ml-2 rounded-lg border border-line px-3 py-2 text-xs min-h-11 md:min-h-8 hover:bg-surface2"
                    >
                      {t('common.play')}
                    </button>
                    <button
                      onClick={() => removeWord(w.id)}
                      className="ml-2 rounded-lg border border-line px-3 py-2 text-xs text-err min-h-11 md:min-h-8 hover:bg-surface2"
                    >
                      {t('common.delete')}
                    </button>
                  </td>
                </tr>
                {openId === w.id && (
                  <tr className="border-t border-line bg-surface2/40">
                    <td colSpan={4} className="px-4 py-3">
                      <div className="text-xs font-semibold mb-2">{t('dictDetail.richTitle')}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {RICH_KEYS.map(field => (
                          <label key={field} className="block">
                            <span className="text-xs text-faint">{t(RICH_LABEL[field])}</span>
                            <input
                              value={w[field] ?? ''}
                              onChange={e => updateRich(w.id, field, e.target.value)}
                              placeholder={t(RICH_LABEL[field])}
                              className="mt-1 w-full h-11 md:h-8 px-2 rounded-sm border border-line bg-surface2 text-sm"
                            />
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-faint mt-2">{t('dictDetail.richHint')}</p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="px-4 py-8 text-center text-dim">{t('common.noMatch')}</p>}
      </div>
    </Page>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="text-xs text-dim">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  )
}

/** 富化字段 → 文案 key：详情页表单、CSV 表头、练习卡片共用一套翻译 */
const RICH_LABEL: Record<RichField, MessageKey> = {
  pos: 'dictDetail.colPos',
  traditional: 'dictDetail.colTraditional',
  radical: 'dictDetail.colRadical',
  example: 'dictDetail.colExample',
  exampleTrans: 'dictDetail.colExampleTrans',
  synonyms: 'dictDetail.colSynonyms',
  antonyms: 'dictDetail.colAntonyms',
  collocations: 'dictDetail.colCollocations',
}
