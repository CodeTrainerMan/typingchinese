'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useBaseStore } from '@/lib/store/base'
import { useHydrated } from '@/lib/useHydrated'
import Page from '@/components/ui/Page'
import PageHeader from '@/components/ui/PageHeader'
import Panel from '@/components/ui/Panel'
import ProgressBar from '@/components/ui/ProgressBar'
import Chip from '@/components/ui/Chip'
import { buildCustomDict, buildCustomDictFromEntries, parseDictFile, parseEntries } from '@/lib/customDict'
import { SHARE_URL_LIMIT, decodeShare, exportDictFile, shareUrl } from '@/lib/dictShare'
import { useI18n } from '@/i18n'
import type { DictResource, LearningDict } from '@/lib/types'

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
  const [shareInput, setShareInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // 自定义词库的默认名 / 描述 / 分类按当前界面语言生成后落盘
  const dictMeta = {
    fallbackName: t('dicts.defaultName'),
    description: (count: number) => t('dicts.defaultDesc', { n: count }),
    category: t('dicts.defaultCategory'),
  }

  /** 从分享码 / 分享链接导入；成功后清掉地址栏里的 share 参数，免得刷新又导一遍 */
  const importShare = async (raw: string) => {
    setMsg('')
    const shared = decodeShare(raw)
    if (!shared || !shared.words.length) {
      setMsg(t('dicts.shareBad'))
      return
    }
    setImporting(true)
    try {
      const dict = await buildCustomDictFromEntries(shared.name, shared.words, dictMeta)
      base.addCustomDict(dict)
      setMsg(t('dicts.importedShared', { name: dict.name }))
      setShareInput('')
      window.history.replaceState(null, '', '/dicts')
    } catch {
      setMsg(t('dicts.shareBad'))
    } finally {
      setImporting(false)
    }
  }

  useEffect(() => {
    fetch('/dicts/list.json')
      .then(r => r.json())
      .then((data: DictResource[]) => setResources(data))
      .finally(() => setLoading(false))
    // 别人分享的链接形如 /dicts?share=xxx，打开时直接把词库接下来；
    // 放到下一个 tick，避免首屏渲染里同步改状态
    const id = window.setTimeout(() => {
      const code = new URLSearchParams(window.location.search).get('share')
      if (code) void importShare(code)
    }, 0)
    return () => window.clearTimeout(id)
    // 只在挂载时跑一次：依赖是 store 与文案函数，稳定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!hydrated)
    return (
      <Page>
        <p className="py-16 text-dim">{t('common.loading')}</p>
      </Page>
    )

  const customDicts = base.dicts.filter(d => !resources.some(r => r.id === d.id))
  const parsed = parseEntries(text).length

  /** 导出成 .json 文件 */
  const exportJson = (dict: LearningDict) => exportDictFile(dict)

  /** 生成分享链接并复制；太大的词库放不进链接，提示改用文件 */
  const copyShare = async (dict: LearningDict) => {
    const url = shareUrl(dict)
    if (url.length > SHARE_URL_LIMIT) {
      setMsg(t('dicts.shareTooBig'))
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setMsg(t('dicts.shareCopied'))
    } catch {
      // 浏览器不给剪贴板权限时退回手动复制
      window.prompt(t('dicts.copyFailed'), url)
    }
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

  /**
   * 上传 .json / .csv / .txt 直接建库，一次可以选多个文件（每个文件一个词库）。
   * 名称只在「单选且填了名字」时生效，多选一律用文件名，免得几个词库撞名。
   */
  const onFiles = async (files: File[]) => {
    if (!files.length) return
    setImporting(true)
    setMsg('')
    let count = 0
    let words = 0
    let lastName = ''
    let failed = 0
    try {
      for (const file of files) {
        try {
          const entries = parseDictFile(await file.text(), file.name)
          if (!entries.length) {
            failed++
            continue
          }
          const dictName =
            files.length === 1 && name.trim()
              ? name.trim()
              : file.name.replace(/\.(json|csv|txt)$/i, '')
          const dict = await buildCustomDictFromEntries(dictName, entries, dictMeta)
          base.addCustomDict(dict)
          count++
          words += dict.words.length
          lastName = dict.name
        } catch {
          // 单个文件坏了不拖累其它文件
          failed++
        }
      }
      if (!count) setMsg(t('errors.noEntries'))
      else if (count > 1)
        setMsg(
          t('dicts.importedMany', { n: count, m: words }) +
            (failed ? ` ${t('dicts.importSkipped', { n: failed })}` : '')
        )
      else setMsg(t('errors.imported', { name: lastName, n: words }))
      setName('')
      setText('')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Page>
      <PageHeader
        title={t('dicts.title')}
        actions={
          <>
            <button
              onClick={() => setOpenImport(v => !v)}
              className="inline-flex h-11 items-center rounded-lg md:h-9 border border-line px-3 text-sm hover:bg-surface2"
            >
              {openImport ? t('common.collapse') : t('dicts.importPanel')}
            </button>
            {base.dicts.length > 0 && (
              <Link
                href="/practice"
                className="inline-flex h-11 items-center rounded-lg md:h-9 bg-brand px-3 text-sm text-white"
              >
                {t('common.goPractice')}
              </Link>
            )}
          </>
        }
      />

      {openImport && (
        <Panel className="mb-6" title={t('dicts.importPanel')} desc={t('dicts.importDesc')}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('dicts.namePlaceholder')}
            className="h-11 md:h-10 w-full sm:w-64 px-3 rounded-sm border border-line bg-surface2 text-sm mb-3"
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
            className="w-full px-3 py-2 rounded-sm border border-line bg-surface2 text-sm font-mono"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onImport}
              disabled={importing || !text.trim()}
              className="h-11 md:h-9 px-4 rounded-lg bg-brand text-white text-sm disabled:opacity-50"
            >
              {importing ? t('common.generating') : t('common.import')}
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".json,.csv,.txt,application/json,text/csv,text/plain"
              className="hidden"
              onChange={e => {
                const files = Array.from(e.target.files ?? [])
                if (files.length) void onFiles(files)
                e.target.value = ''
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="h-11 md:h-9 px-4 rounded-lg border border-line text-sm disabled:opacity-50 hover:bg-surface2"
            >
              {t('dicts.upload')}
            </button>
            <span className="text-xs text-dim">{t('dicts.uploadMany')}</span>
            {parsed > 0 && <span className="text-xs text-dim">{t('dicts.parsed', { n: parsed })}</span>}
            {msg && <span className="text-xs text-dim">{msg}</span>}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <input
              value={shareInput}
              onChange={e => setShareInput(e.target.value)}
              placeholder={t('dicts.sharePlaceholder')}
              className="h-11 md:h-9 flex-1 px-3 rounded-sm border border-line bg-surface2 text-sm"
            />
            <button
              onClick={() => void importShare(shareInput)}
              disabled={importing || !shareInput.trim()}
              className="h-11 md:h-9 px-4 rounded-lg border border-line text-sm disabled:opacity-50 hover:bg-surface2"
            >
              {t('dicts.shareImport')}
            </button>
          </div>
          <p className="mt-3 text-xs text-dim">{t('dicts.shareHint')}</p>
        </Panel>
      )}

      {customDicts.length > 0 && (
        <Panel title={t('dicts.myCustom')}>
          <div className="space-y-3">
            {customDicts.map(dict => {
              const current = base.currentDictId === dict.id
              const pct = dict.length ? (dict.lastLearnIndex / dict.length) * 100 : 0
              return (
                <div
                  key={dict.id}
                  className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border border-line bg-solid p-3 transition-colors duration-300 hover:bg-hover ${
                    current ? 'bg-active' : ''
                  }`}
                >
                  <div className="min-w-[12rem] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{dict.name}</span>
                      {current && <Chip tone="brand">{t('common.current')}</Chip>}
                      <Chip>{t('common.words', { n: dict.length })}</Chip>
                    </div>
                    {dict.description && (
                      <p className="mt-1 truncate text-xs text-dim">{dict.description}</p>
                    )}
                    <div className="mt-2 max-w-xs">
                      <div className="mb-1 flex items-center justify-between text-xs text-dim">
                        <span>{t('common.progress', { a: dict.lastLearnIndex, b: dict.length })}</span>
                        <span className="tabular-nums">{Math.round(pct)}%</span>
                      </div>
                      <ProgressBar size="sm" value={pct} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => base.setCurrentDict(dict.id)}
                      disabled={current}
                      className={`inline-flex h-11 items-center rounded-lg md:h-8 px-3 text-xs disabled:opacity-50 ${
                        current ? 'border border-line hover:bg-surface2' : 'bg-brand text-white'
                      }`}
                    >
                      {current ? t('common.inUse') : t('common.setCurrent')}
                    </button>
                    <Link
                      href={`/dicts/${dict.id}`}
                      className="inline-flex h-11 items-center rounded-lg md:h-8 border border-line px-3 text-xs hover:bg-surface2"
                    >
                      {t('common.edit')}
                    </Link>
                    <button
                      onClick={() => exportJson(dict)}
                      className="inline-flex h-11 items-center rounded-lg md:h-8 border border-line px-3 text-xs hover:bg-surface2"
                    >
                      {t('dicts.export')}
                    </button>
                    <button
                      onClick={() => void copyShare(dict)}
                      className="inline-flex h-11 items-center rounded-lg md:h-8 border border-line px-3 text-xs hover:bg-surface2"
                    >
                      {t('dicts.share')}
                    </button>
                    <button
                      onClick={() => base.removeDict(dict.id)}
                      className="inline-flex h-11 items-center rounded-lg md:h-8 border border-line px-3 text-xs text-err hover:bg-surface2"
                    >
                      {t('common.remove')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      )}

      {loading && <p className="text-dim">{t('dicts.loadingList')}</p>}

      <Panel title={t('home.chooseDict')}>
        <div className="space-y-3">
          {resources.map(res => {
            const added = base.dicts.find(d => d.id === res.id)
            const current = base.currentDictId === res.id
            return (
              <div
                key={res.id}
                className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border border-line bg-solid p-3 transition-colors duration-300 hover:bg-hover ${
                  current ? 'bg-active' : ''
                }`}
              >
                <div className="min-w-[12rem] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink">{res.name}</span>
                    {current && <Chip tone="brand">{t('common.current')}</Chip>}
                    <Chip>{t('common.words', { n: res.length })}</Chip>
                  </div>
                  {res.description && <p className="mt-1 truncate text-xs text-dim">{res.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {res.tags.map(tag => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>

                  {added && (
                    <div className="mt-2 max-w-xs">
                      <div className="mb-1 flex items-center justify-between text-xs text-dim">
                        <span>{t('common.progress', { a: added.lastLearnIndex, b: added.length })}</span>
                        <span className="tabular-nums">
                          {Math.round(added.length ? (added.lastLearnIndex / added.length) * 100 : 0)}%
                        </span>
                      </div>
                      <ProgressBar
                        size="sm"
                        value={added.length ? (added.lastLearnIndex / added.length) * 100 : 0}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {added ? (
                    <>
                      <button
                        onClick={() => base.setCurrentDict(res.id)}
                        disabled={current}
                        className={`inline-flex h-11 items-center rounded-lg md:h-8 px-3 text-xs disabled:opacity-50 ${
                          current ? 'border border-line hover:bg-surface2' : 'bg-brand text-white'
                        }`}
                      >
                        {current ? t('common.inUse') : t('common.setCurrent')}
                      </button>
                      <Link
                        href={`/dicts/${res.id}`}
                        className="inline-flex h-11 items-center rounded-lg md:h-8 border border-line px-3 text-xs hover:bg-surface2"
                      >
                        {t('common.edit')}
                      </Link>
                      <button
                        onClick={() => exportJson(added)}
                        className="inline-flex h-11 items-center rounded-lg md:h-8 border border-line px-3 text-xs hover:bg-surface2"
                      >
                        {t('dicts.export')}
                      </button>
                      <button
                        onClick={() => void copyShare(added)}
                        className="inline-flex h-11 items-center rounded-lg md:h-8 border border-line px-3 text-xs hover:bg-surface2"
                      >
                        {t('dicts.share')}
                      </button>
                      <button
                        onClick={() => base.removeDict(res.id)}
                        className="inline-flex h-11 items-center rounded-lg md:h-8 border border-line px-3 text-xs text-err hover:bg-surface2"
                      >
                        {t('common.remove')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => base.addDict(res)}
                      className="inline-flex h-11 items-center rounded-lg md:h-8 bg-brand px-3 text-xs text-white"
                    >
                      {t('dicts.addLearning')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      <p className="mt-8 text-xs text-dim">{t('dicts.footerNote')}</p>
    </Page>
  )
}
