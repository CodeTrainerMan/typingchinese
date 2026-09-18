'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBaseStore } from '@/lib/store/base'
import { useHydrated } from '@/lib/useHydrated'
import { buildArticleWords, splitSentences, type ArticleResource } from '@/lib/article'
import { useI18n } from '@/i18n'

export default function ArticlePage() {
  const hydrated = useHydrated()
  const base = useBaseStore()
  const router = useRouter()
  const { t } = useI18n()
  const [articles, setArticles] = useState<ArticleResource[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('/articles/list.json')
      .then(r => r.json())
      .then((data: ArticleResource[]) => setArticles(data))
      .finally(() => setLoading(false))
  }, [])

  if (!hydrated) return <div className="mx-auto max-w-4xl px-4 py-16 text-dim">{t('common.loading')}</div>

  const start = async (article: ArticleResource) => {
    setBusy(true)
    setMsg('')
    try {
      const words = await buildArticleWords(article.text)
      if (!words.length) {
        setMsg(t('errors.noSentences'))
        return
      }
      base.startCustomSession(words, article.title)
      router.push('/practice')
    } catch (e) {
      setMsg(t('errors.genFailed', { msg: e instanceof Error ? e.message : t('errors.unknown') }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{t('article.title')}</h1>
        {base.session?.kind === 'article' && (
          <button
            onClick={() => router.push('/practice')}
            className="h-9 px-4 rounded-lg bg-brand text-white text-sm"
          >
            {t('article.continuePrev', { title: base.session.title ?? '' })}
          </button>
        )}
      </div>

      <p className="text-sm text-dim mb-6">{t('article.intro')}</p>

      {loading && <p className="text-dim">{t('article.loading')}</p>}
      {msg && <p className="text-sm text-err mb-4">{msg}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map(a => {
          const open = openId === a.id
          const sentences = splitSentences(a.text)
          return (
            <div key={a.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-sm text-dim mt-1">{a.desc}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-surface2 text-dim whitespace-nowrap">
                  {t('article.levelSentences', { level: a.level, n: sentences.length })}
                </span>
              </div>

              <div className="mt-4 text-sm text-dim leading-relaxed">
                {open ? a.text.split('\n').map((line, i) => <p key={i}>{line}</p>) : <p>{sentences[0]}…</p>}
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => void start(a)}
                  disabled={busy}
                  className="h-9 px-4 rounded-lg bg-brand text-white text-sm disabled:opacity-50"
                >
                  {busy ? t('common.generating') : t('article.start')}
                </button>
                <button
                  onClick={() => setOpenId(open ? null : a.id)}
                  className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2"
                >
                  {open ? t('common.collapse') : t('article.viewFull')}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-8 text-xs text-dim">{t('article.footerNote')}</p>
    </div>
  )
}
