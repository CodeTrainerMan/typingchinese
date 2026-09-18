'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useBaseStore } from '@/lib/store/base'
import { useHydrated } from '@/lib/useHydrated'
import { buildCustomDict, buildCustomDictFromEntries, parseDictFile, parseEntries } from '@/lib/customDict'
import { useI18n } from '@/i18n'
import type { DictResource } from '@/lib/types'

export default function DictsPage() {
  const hydrated = useHydrated()
  const base = useBaseStore()
  const { t } = useI18n()
  const [resources, setResources] = useState<DictResource[]>([])
  const [loading, setLoading] = useState(true)

  const [openImport, setOpenImport] = useState(false)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [importing, setImporting] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/dicts/list.json')
      .then(r => r.json())
      .then((data: DictResource[]) => setResources(data))
      .finally(() => setLoading(false))
  }, [])

  if (!hydrated) return <div className="mx-auto max-w-4xl px-4 py-16 text-dim">{t('common.loading')}</div>

  const customDicts = base.dicts.filter(d => !resources.some(r => r.id === d.id))
  const parsed = parseEntries(text).length
  // 自定义词库的默认名 / 描述 / 分类按当前界面语言生成后落盘
  const dictMeta = {
    fallbackName: t('dicts.defaultName'),
    description: (count: number) => t('dicts.defaultDesc', { n: count }),
    category: t('dicts.defaultCategory'),
  }

  const onImport = async () => {
    setImporting(true)
    setMsg('')
    try {
      const dict = await buildCustomDict(name || t('dicts.defaultName'), text, dictMeta)
      if (!dict.words.length) {
        setMsg(t('errors.noValidWords'))
        return
      }
      base.addCustomDict(dict)
      setMsg(t('errors.imported', { name: dict.name, n: dict.words.length }))
      setName('')
      setText('')
    } catch (e) {
      setMsg(t('errors.importFailed', { msg: e instanceof Error ? e.message : t('errors.unknown') }))
    } finally {
      setImporting(false)
    }
  }

  /** 上传 .json / .csv / .txt 直接建库；名称没填就用文件名 */
  const onFile = async (file: File) => {
    setImporting(true)
    setMsg('')
    try {
      const entries = parseDictFile(await file.text(), file.name)
      if (!entries.length) {
        setMsg(t('errors.noEntries'))
        return
      }
      const dict = await buildCustomDictFromEntries(
        name || file.name.replace(/\.(json|csv|txt)$/i, ''),
        entries,
        dictMeta
      )
      base.addCustomDict(dict)
      setMsg(t('errors.imported', { name: dict.name, n: dict.words.length }))
      setName('')
      setText('')
    } catch {
      setMsg(t('errors.parseFailed'))
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{t('dicts.title')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setOpenImport(v => !v)}
            className="h-9 px-4 inline-flex items-center rounded-lg border border-line text-sm hover:bg-surface2"
          >
            {openImport ? t('common.collapse') : t('dicts.importPanel')}
          </button>
          {base.dicts.length > 0 && (
            <Link href="/practice" className="h-9 px-4 inline-flex items-center rounded-lg bg-brand text-white text-sm">
              {t('common.goPractice')}
            </Link>
          )}
        </div>
      </div>

      {openImport && (
        <div className="rounded-2xl border border-line bg-surface p-5 mb-8">
          <div className="font-medium mb-1">{t('dicts.importPanel')}</div>
          <p className="text-xs text-dim mb-4">{t('dicts.importDesc')}</p>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('dicts.namePlaceholder')}
            className="h-10 w-full sm:w-64 px-3 rounded-lg border border-line bg-surface2 text-sm mb-3"
          />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              // Cmd / Ctrl + Enter 直接导入
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                void onImport()
              }
            }}
            rows={6}
            placeholder={'中国,国家名称\n旅行 lv you\n安静=没有声音'}
            className="w-full px-3 py-2 rounded-lg border border-line bg-surface2 text-sm font-mono"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onImport}
              disabled={importing || !text.trim()}
              className="h-9 px-4 rounded-lg bg-brand text-white text-sm disabled:opacity-50"
            >
              {importing ? t('common.generating') : t('common.import')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.csv,.txt,application/json,text/csv,text/plain"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) void onFile(file)
                e.target.value = ''
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="h-9 px-4 rounded-lg border border-line text-sm disabled:opacity-50 hover:bg-surface2"
            >
              {t('dicts.upload')}
            </button>
            {parsed > 0 && <span className="text-xs text-dim">{t('dicts.parsed', { n: parsed })}</span>}
            {msg && <span className="text-xs text-dim">{msg}</span>}
          </div>
        </div>
      )}

      {customDicts.length > 0 && (
        <div className="mb-8">
          <div className="text-sm text-dim mb-3">{t('dicts.myCustom')}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {customDicts.map(dict => {
              const current = base.currentDictId === dict.id
              return (
                <div key={dict.id} className="rounded-2xl border border-line bg-surface p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">
                        {dict.name}
                        {current && <span className="ml-2 text-xs text-brand">{t('common.current')}</span>}
                      </div>
                      <div className="text-sm text-dim mt-1">{dict.description}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md bg-surface2 text-dim">
                      {t('common.words', { n: dict.length })}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-5">
                    <button
                      onClick={() => base.setCurrentDict(dict.id)}
                      disabled={current}
                      className="h-9 px-4 rounded-lg border border-line text-sm disabled:opacity-50 hover:bg-surface2"
                    >
                      {current ? t('common.inUse') : t('common.setCurrent')}
                    </button>
                    <Link
                      href={`/dicts/${dict.id}`}
                      className="h-9 px-4 inline-flex items-center rounded-lg border border-line text-sm hover:bg-surface2"
                    >
                      {t('common.edit')}
                    </Link>
                    <button
                      onClick={() => base.removeDict(dict.id)}
                      className="h-9 px-4 rounded-lg border border-line text-sm text-err hover:bg-surface2"
                    >
                      {t('common.remove')}
                    </button>
                    <span className="text-xs text-dim self-center">
                      {t('common.progress', { a: dict.lastLearnIndex, b: dict.length })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading && <p className="text-dim">{t('dicts.loadingList')}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {resources.map(res => {
          const added = base.dicts.find(d => d.id === res.id)
          const current = base.currentDictId === res.id
          return (
            <div key={res.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {res.name}
                    {current && <span className="ml-2 text-xs text-brand">{t('common.current')}</span>}
                  </div>
                  <div className="text-sm text-dim mt-1">{res.description}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-surface2 text-dim">
                  {t('common.words', { n: res.length })}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {res.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md border border-line text-dim">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2 mt-5">
                {added ? (
                  <>
                    <button
                      onClick={() => base.setCurrentDict(res.id)}
                      disabled={current}
                      className="h-9 px-4 rounded-lg border border-line text-sm disabled:opacity-50 hover:bg-surface2"
                    >
                      {current ? t('common.inUse') : t('common.setCurrent')}
                    </button>
                    <Link
                      href={`/dicts/${res.id}`}
                      className="h-9 px-4 inline-flex items-center rounded-lg border border-line text-sm hover:bg-surface2"
                    >
                      {t('common.edit')}
                    </Link>
                    <button
                      onClick={() => base.removeDict(res.id)}
                      className="h-9 px-4 rounded-lg border border-line text-sm text-err hover:bg-surface2"
                    >
                      {t('common.remove')}
                    </button>
                    <span className="text-xs text-dim self-center">
                      {t('common.progress', { a: added.lastLearnIndex, b: added.length })}
                    </span>
                  </>
                ) : (
                  <button
                    onClick={() => base.addDict(res)}
                    className="h-9 px-4 rounded-lg bg-brand text-white text-sm"
                  >
                    {t('dicts.addLearning')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-8 text-xs text-dim">{t('dicts.footerNote')}</p>
    </div>
  )
}
