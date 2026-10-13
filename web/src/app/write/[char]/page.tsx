import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import WriteBoard from '@/components/WriteBoard'
import { PILOT_CHARS } from '@/lib/write/pilot-chars'

/**
 * 单字落地页（服务端渲染的静态页）
 *
 * 承接 "X 笔顺 / X 怎么写 / X stroke order / how to write X" 这类长尾搜索。
 * 与笔顺词典类竞品的差异：它们只能"看"动画，这里直接内嵌可交互的
 * 描红 / 笔顺演示 / 按笔顺测验（WriteBoard），把内容页变成练习入口。
 *
 * 数据来源：
 * - 笔顺：public/hanzi/<字>.json（hanzi-writer 格式，本地数据，离线可用）
 * - 拼音 / 释义 / 例词：public/dicts/*.json
 */

const DICT_IDS = ['hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6', 'daily', 'idiom', 'advanced']
const DICT_LABEL: Record<string, string> = {
  hsk1: 'HSK 1', hsk2: 'HSK 2', hsk3: 'HSK 3',
  hsk4: 'HSK 4', hsk5: 'HSK 5', hsk6: 'HSK 6',
  daily: 'Daily', idiom: 'Idioms', advanced: 'Advanced',
}

interface SourceWord {
  dictId: string
  dictLabel: string
  word: string
  pinyin: string
  trans: string
}
interface CharData {
  char: string
  strokeCount: number
  pinyin: string
  meaning: string
  hskLevel: string | null
  sourceWords: SourceWord[]
}

function loadCharData(char: string): CharData | null {
  // Next 16 传入的 params 可能是 URL 编码的（如 %E4%BD%A0），先解码再拼文件路径
  let key = char
  try {
    key = decodeURIComponent(char)
  } catch {
    /* 保持原值 */
  }
  // 1) 笔顺数据必须存在，否则不建页（与 write 页"无数据的字不出现"同一逻辑）
  const hanziFile = join(process.cwd(), 'public', 'hanzi', `${key}.json`)
  if (!existsSync(hanziFile)) return null
  let strokeCount = 0
  try {
    const data = JSON.parse(readFileSync(hanziFile, 'utf-8')) as { strokes?: unknown[] }
    strokeCount = data.strokes?.length ?? 0
  } catch {
    return null
  }

  // 2) 从词库收集：拼音、释义、例词、HSK 归属
  let pinyin = ''
  let meaning = ''
  let hskLevel: string | null = null
  const sourceWords: SourceWord[] = []

  for (const id of DICT_IDS) {
    const file = join(process.cwd(), 'public', 'dicts', `${id}.json`)
    if (!existsSync(file)) continue
    let dict: { name?: string; words?: Array<Record<string, unknown>> }
    try {
      dict = JSON.parse(readFileSync(file, 'utf-8'))
    } catch {
      continue
    }
    for (const w of dict.words ?? []) {
      const word = String(w.word ?? '')
      if (!word || !word.includes(key)) continue
      const idx = Array.from(word).indexOf(key)
      const py = Array.isArray(w.pinyin) ? String(w.pinyin[idx] ?? '') : ''
      const trans = String(w.trans ?? '')
      if (!pinyin && py) pinyin = py
      if (!meaning && trans) meaning = trans
      if (!hskLevel && /^hsk[1-6]$/.test(id)) hskLevel = DICT_LABEL[id]
      sourceWords.push({
        dictId: id,
        dictLabel: DICT_LABEL[id] ?? id,
        word,
        pinyin: Array.isArray(w.pinyin) ? (w.pinyin as string[]).join(' ') : '',
        trans,
      })
      if (sourceWords.length >= 8) break
    }
    if (sourceWords.length >= 8) break
  }
  if (!sourceWords.length) return null
  return { char: key, strokeCount, pinyin, meaning, hskLevel, sourceWords }
}

export function generateStaticParams() {
  return PILOT_CHARS.map((char) => ({ char }))
}

export async function generateMetadata({ params }: { params: Promise<{ char: string }> }): Promise<Metadata> {
  const { char } = await params
  const data = loadCharData(char)
  if (!data) return { title: 'Not found' }
  const title = `How to Write ${char}${data.pinyin ? ` (${data.pinyin})` : ''} — Stroke Order & Handwriting Practice`
  const description =
    `Learn to write ${data.char}${data.pinyin ? ` (${data.pinyin})` : ''}: ` +
    `${data.strokeCount} strokes${data.meaning ? `, meaning “${data.meaning}”` : ''}. ` +
    `Watch the stroke-order animation, trace it in the mi-grid, then test yourself stroke by stroke. Free, no account.`
  return {
    title,
    description,
    alternates: { canonical: `/write/${encodeURIComponent(data.char)}` },
    openGraph: { title, description, url: `/write/${encodeURIComponent(data.char)}`, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function CharPage({ params }: { params: Promise<{ char: string }> }) {
  const { char } = await params
  const data = loadCharData(char)
  if (!data) notFound()

  const others = PILOT_CHARS.filter((c) => c !== data.char).slice(0, 8)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        name: data.char,
        description: `${data.char}${data.pinyin ? ` (${data.pinyin})` : ''} — ${data.meaning || 'Chinese character'}. ${data.strokeCount} strokes.`,
        inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Chinese Characters' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `How many strokes does ${data.char} have?`,
            acceptedAnswer: { '@type': 'Answer', text: `${data.char} has ${data.strokeCount} strokes.` },
          },
          ...(data.meaning
            ? [{
                '@type': 'Question',
                name: `What does ${data.char} mean?`,
                acceptedAnswer: { '@type': 'Answer', text: `${data.char} (${data.pinyin || 'pinyin unknown'}) means “${data.meaning}”.` },
              }]
            : []),
          {
            '@type': 'Question',
            name: `How can I practise writing ${data.char}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Use the mi-grid above: trace the grey character, watch the stroke-order animation, or switch to quiz mode and write it stroke by stroke. Your mistakes are collected in a wrong-character book for review.`,
            },
          },
        ],
      },
    ],
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-dim">
        <Link href="/write" className="hover:underline">Handwriting</Link>
        <span className="mx-1">/</span>
        <span>{data.char}</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
        How to write {data.char}
        {data.pinyin ? <span className="text-brand"> ({data.pinyin})</span> : null}
      </h1>

      <p className="mt-4 text-sm leading-6 text-dim sm:text-base">
        {data.char} has <strong className="text-ink2">{data.strokeCount} strokes</strong>
        {data.meaning ? <> and means <strong className="text-ink2">“{data.meaning}”</strong></> : null}
        {data.hskLevel ? <> — it first appears in <strong className="text-ink2">{data.hskLevel}</strong></> : null}.
        Watch the stroke order below, trace it in the mi-grid, then test yourself stroke by stroke.
      </p>

      {/* 交互练习区：内容页直接变练习入口（笔顺词典竞品没有这一环） */}
      <section className="mt-8 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">Practise writing {data.char}</h2>
        <p className="mt-1 text-xs text-dim">
          Trace mode: follow the grey character with your mouse or finger. Switch to stroke-order
          animation or quiz mode in the app.
        </p>
        <div className="mt-5 flex justify-center">
          <WriteBoard char={data.char} mode="trace" />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/write"
            className="inline-flex h-11 items-center rounded-lg bg-fg px-5 text-sm font-medium text-bg hover:opacity-90"
          >
            Open full practice (stroke order &amp; quiz)
          </Link>
          <Link
            href="/practice"
            className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm text-ink2 hover:bg-surface2"
          >
            Type the pinyin instead
          </Link>
        </div>
      </section>

      {/* 例词：从词库来，带内链 */}
      <h2 className="mt-10 text-lg font-semibold">Words that contain {data.char}</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface2 text-xs uppercase text-dim">
            <tr>
              <th className="px-3 py-2 font-medium">Word</th>
              <th className="px-3 py-2 font-medium">Pinyin</th>
              <th className="px-3 py-2 font-medium">Meaning</th>
              <th className="px-3 py-2 font-medium">List</th>
            </tr>
          </thead>
          <tbody>
            {data.sourceWords.map((w, i) => (
              <tr key={`${w.dictId}-${w.word}-${i}`} className="border-t border-line">
                <td className="whitespace-nowrap px-3 py-2 text-base">{w.word}</td>
                <td className="whitespace-nowrap px-3 py-2 text-dim">{w.pinyin}</td>
                <td className="px-3 py-2 text-dim">{w.trans}</td>
                <td className="whitespace-nowrap px-3 py-2 text-dim">{w.dictLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 笔画步骤：给爬虫的文字版笔顺说明 */}
      <h2 className="mt-10 text-lg font-semibold">Stroke order for {data.char}</h2>
      <p className="mt-2 text-sm leading-6 text-dim">
        Write {data.char} in {data.strokeCount} strokes. The animation in the practice box above shows
        the correct order; in quiz mode you must draw each stroke in that order, and a wrong start
        shakes and reveals a hint.
      </p>
      <ol className="mt-3 grid list-decimal grid-cols-2 gap-2 pl-6 text-sm text-dim sm:grid-cols-3">
        {Array.from({ length: data.strokeCount }, (_, i) => (
          <li key={i}>Stroke {i + 1}</li>
        ))}
      </ol>

      {/* 内链：同批试点字 + HSK 页 */}
      <h2 className="mt-10 text-lg font-semibold">Other common characters</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {others.map((c) => (
          <Link
            key={c}
            href={`/write/${encodeURIComponent(c)}`}
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-lg border border-line px-3 text-lg hover:bg-surface2"
          >
            {c}
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Practise by HSK level</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((l) => (
          <Link
            key={l}
            href={`/hsk/${l}`}
            className="inline-flex h-9 items-center rounded-lg border border-line px-3 text-xs text-dim hover:bg-surface2"
          >
            HSK {l} word list
          </Link>
        ))}
      </div>

      <p className="mt-10 text-xs text-dim">
        TypingChinese is open source —{' '}
        <a
          className="underline"
          href="https://github.com/CodeTrainerMan/typingchinese"
          rel="noopener"
          target="_blank"
        >
          view the code on GitHub
        </a>
        .
      </p>
    </main>
  )
}
