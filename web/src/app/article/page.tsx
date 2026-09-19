'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBaseStore } from '@/lib/store/base'
import { useExtraStore } from '@/lib/store/extra'
import { useSettingStore } from '@/lib/store/setting'
import { useHydrated } from '@/lib/useHydrated'
import { buildArticleWords, splitSentences, type ArticleResource } from '@/lib/article'
import { groupReadByArticle, type ArticleProgress } from '@/lib/readProgress'
import { isSpeechRecognitionSupported, listenOnce, scoreRead } from '@/lib/speechScore'
import { speak } from '@/lib/tts'
import VoicePicker from '@/components/VoicePicker'
import ReadCurve from '@/components/ReadCurve'
import Page from '@/components/ui/Page'
import PageHeader from '@/components/ui/PageHeader'
import Panel from '@/components/ui/Panel'
import Chip from '@/components/ui/Chip'
import { useI18n } from '@/i18n'

export default function ArticlePage() {
  const hydrated = useHydrated()
  const base = useBaseStore()
  const extra = useExtraStore()
  const setting = useSettingStore()
  const router = useRouter()
  const { t, locale } = useI18n()
  // 每篇文章的跟读进步情况（历史记录按文章聚合，没有跟读过的文章不在表里）
  const progressByArticle = useMemo(() => {
    const map = new Map<string, ArticleProgress>()
    for (const g of groupReadByArticle(extra.readRecords)) map.set(g.key, g)
    return map
  }, [extra.readRecords])
  const [articles, setArticles] = useState<ArticleResource[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  // 自己粘贴的文本：标题可留空，正文是任意中文
  const [customOpen, setCustomOpen] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customText, setCustomText] = useState('')

  // 跟读打分：句子序号 → 得分与识别到的内容
  const [scores, setScores] = useState<Record<number, { score: number; heard: string }>>({})
  const [readingIdx, setReadingIdx] = useState<number | null>(null)
  const [asrSupported, setAsrSupported] = useState(false)

  useEffect(() => {
    fetch('/articles/list.json')
      .then(r => r.json())
      .then((data: ArticleResource[]) => setArticles(data))
      .finally(() => setLoading(false))
    // 语音识别能力只能在挂载后探测；放到下一个 tick，避免首屏（SSR）渲染与客户端不一致
    const id = window.setTimeout(() => setAsrSupported(isSpeechRecognitionSupported()), 0)
    return () => window.clearTimeout(id)
  }, [])

  // 音色按界面语言分别记住，和设置页是同一份配置
  const voice = setting.voiceByLang[setting.lang] ?? ''
  const setVoice = (voiceURI: string) =>
    setting.patch({ voiceByLang: { ...setting.voiceByLang, [setting.lang]: voiceURI } })

  /** 先听示范朗读，再开麦跟读并打分；朗读与识别串着来，免得自己听见自己 */
  const readAloud = async (article: ArticleResource, index: number, sentence: string) => {
    setReadingIdx(index)
    setMsg('')
    try {
      await new Promise<void>(resolve => {
        speak(sentence, {
          rate: setting.soundSpeed,
          volume: setting.soundVolume / 100,
          voiceURI: voice,
          onEnd: resolve,
        })
      })
      const heard = await listenOnce('zh-CN', 8000)
      const score = scoreRead(sentence, heard)
      setScores(s => ({ ...s, [index]: { score, heard } }))
      // 存档：统计页能看到跟读次数与平均分
      extra.addReadRecord({ articleId: article.id, articleTitle: article.title, sentence, score, heard })
    } catch {
      setMsg(t('article.readFailed'))
    } finally {
      setReadingIdx(null)
    }
  }

  if (!hydrated) return <div className="mx-auto max-w-4xl px-4 py-16 text-dim">{t('common.loading')}</div>

  /** 开练一段自定义文本（内置文章与本页粘贴的文本都走这里） */
  const startText = async (title: string, text: string) => {
    setBusy(true)
    setMsg('')
    try {
      const words = await buildArticleWords(text)
      if (!words.length) {
        setMsg(t('errors.noSentences'))
        return
      }
      base.startCustomSession(words, title || t('article.customDefaultTitle'))
      router.push('/practice')
    } catch (e) {
      setMsg(t('errors.genFailed', { msg: e instanceof Error ? e.message : t('errors.unknown') }))
    } finally {
      setBusy(false)
    }
  }

  /** 存下这段文本，下次打开还在「我的文章」里 */
  const saveCustom = () => {
    const text = customText.trim()
    if (!text) {
      setMsg(t('article.customNeedText'))
      return
    }
    const title = customTitle.trim() || t('article.customDefaultTitle')
    extra.addArticle(title, text)
    setMsg(t('article.customSaved', { name: title }))
    setCustomTitle('')
    setCustomText('')
  }

  const start = (article: ArticleResource) => startText(article.title, article.text)

  const startCustom = () => startText(customTitle.trim() || t('article.customDefaultTitle'), customText)

  return (
    <Page>
      <PageHeader
        title={t('article.title')}
        desc={t('article.intro')}
        actions={
          base.session?.kind === 'article' ? (
            <button
              onClick={() => router.push('/practice')}
              className="inline-flex h-9 items-center rounded-lg bg-brand px-3 text-sm text-white"
            >
              {t('article.continuePrev', { title: base.session.title ?? '' })}
            </button>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-dim">{t('setting.voice')}</span>
        <VoicePicker
          value={voice}
          onChange={setVoice}
          rate={setting.soundSpeed}
          volume={setting.soundVolume / 100}
        />
      </div>

      <div className="mb-6">
        <button
          onClick={() => setCustomOpen(v => !v)}
          className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2"
        >
          {customOpen ? t('common.collapse') : t('article.customPanel')}
        </button>
      </div>

      {customOpen && (
        <Panel className="mb-4" title={t('article.customPanel')}>
          <input
            value={customTitle}
            onChange={e => setCustomTitle(e.target.value)}
            placeholder={t('article.customTitlePlaceholder')}
            className="h-10 w-full sm:w-64 px-3 rounded-lg border border-line bg-surface2 text-sm mb-3"
          />
          <textarea
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            rows={6}
            placeholder={t('article.customPlaceholder')}
            className="w-full px-3 py-2 rounded-lg border border-line bg-surface2 text-sm"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => void startCustom()}
              disabled={busy || !customText.trim()}
              className="h-9 px-4 rounded-lg bg-brand text-white text-sm disabled:opacity-50"
            >
              {busy ? t('common.generating') : t('article.customStart')}
            </button>
            <button
              onClick={saveCustom}
              disabled={!customText.trim()}
              className="h-9 px-4 rounded-lg border border-line text-sm hover:bg-surface2 disabled:opacity-50"
            >
              {t('article.customSave')}
            </button>
          </div>
        </Panel>
      )}

      {extra.articles.length > 0 && (
        <div className="mb-8">
          <div className="text-sm text-dim mb-3">{t('article.myArticles')}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {extra.articles.map(a => (
              <Panel key={a.id} title={a.title} desc={a.text.slice(0, 120)}>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => void startText(a.title, a.text)}
                    disabled={busy}
                    className="inline-flex h-8 items-center rounded-lg bg-brand px-3 text-xs text-white disabled:opacity-50"
                  >
                    {t('article.start')}
                  </button>
                  <button
                    onClick={() => extra.removeArticle(a.id)}
                    className="inline-flex h-8 items-center rounded-lg border border-line px-3 text-xs text-err hover:bg-surface2"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-dim">{t('article.loading')}</p>}
      {msg && <p className="text-sm text-err mb-4">{msg}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map(a => {
          const open = openId === a.id
          const sentences = splitSentences(a.text)
          const prog = progressByArticle.get(a.id)
          return (
            <Panel
              key={a.id}
              title={a.title}
              desc={a.desc}
              actions={
                <Chip className="whitespace-nowrap">
                  {t('article.levelSentences', { level: a.level, n: sentences.length })}
                </Chip>
              }
            >
              <div className="text-sm leading-relaxed text-dim">
                {open ? a.text.split('\n').map((line, i) => <p key={i}>{line}</p>) : <p>{sentences[0]}…</p>}
              </div>

              {open && asrSupported && (
                <div className="mt-4 pt-4 border-t border-line space-y-2">
                  <div className="text-xs text-dim">{t('article.readHint')}</div>
                  {sentences.map((sentence, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <button
                        onClick={() => void readAloud(a, i, sentence)}
                        disabled={readingIdx !== null}
                        className="rounded-lg border border-line px-3 py-2 text-xs whitespace-nowrap min-h-11 md:min-h-8 hover:bg-surface2 disabled:opacity-50"
                      >
                        {readingIdx === i ? t('article.reading') : t('article.readAloud')}
                      </button>
                      <div className="flex-1">
                        <div className="text-sm">{sentence}</div>
                        {scores[i] && (
                          <div className="text-xs mt-1">
                            <span className="text-brand font-semibold">
                              {t('article.readScore', { n: scores[i].score })}
                            </span>
                            {scores[i].heard && <span className="text-dim ml-2">{scores[i].heard}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {prog && (
                <div className="mt-4 border-t border-line pt-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Chip>{t('stats.readLatest', { n: prog.latest })}</Chip>
                    <Chip>{prog.count} ×</Chip>
                    {prog.delta !== 0 && (
                      <Chip tone={prog.delta > 0 ? 'brand' : 'plain'}>
                        {prog.delta > 0
                          ? t('stats.readDeltaUp', { n: prog.delta })
                          : t('stats.readDeltaDown', { n: -prog.delta })}
                      </Chip>
                    )}
                  </div>
                  {prog.count > 1 && (
                    <ReadCurve
                      compact
                      points={prog.records.map((r, i) => ({
                        score: r.score,
                        label: `${i + 1}`,
                        tip: `${t('stats.readPointTip', {
                          n: i + 1,
                          score: r.score,
                          date: new Date(r.at).toLocaleDateString(locale),
                        })} · ${r.sentence}`,
                      }))}
                    />
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => void start(a)}
                  disabled={busy}
                  className="inline-flex h-8 items-center rounded-lg bg-brand px-3 text-xs text-white disabled:opacity-50"
                >
                  {busy ? t('common.generating') : t('article.start')}
                </button>
                <button
                  onClick={() => setOpenId(open ? null : a.id)}
                  className="inline-flex h-8 items-center rounded-lg border border-line px-3 text-xs hover:bg-surface2"
                >
                  {open ? t('common.collapse') : t('article.viewFull')}
                </button>
              </div>
            </Panel>
          )
        })}
      </div>

      <p className="mt-8 text-xs text-dim">{t('article.footerNote')}</p>
    </Page>
  )
}
