import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * HSK 等级词表落地页（服务端渲染的静态页）
 *
 * 应用内 /dicts/[id] 是纯客户端渲染，爬虫拿不到内容；这个页面在构建时就渲染出
 * 词表与释义，用来承接 "HSK 3 word list" "pinyin typing practice" 这类搜索流量。
 */

const LEVELS = [1, 2, 3, 4, 5, 6]
const PREVIEW = 60 // 页面里直接展示的词数，其余提示到应用内练习

interface DictWord {
  word: string
  pinyin: string[]
  trans: string
}
interface DictFile {
  id: string
  name: string
  length: number
  words: DictWord[]
}

function loadDict(level: string): DictFile | null {
  try {
    const file = join(process.cwd(), 'public', 'dicts', `hsk${level}.json`)
    return JSON.parse(readFileSync(file, 'utf-8')) as DictFile
  } catch {
    return null
  }
}

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level: String(level) }))
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params
  const dict = loadDict(level)
  if (!dict) return {}

  const title = `HSK ${level} Word List — Type & Practise ${dict.length} Words`
  const description =
    `The full HSK ${level} vocabulary (${dict.length} words) with pinyin and English meanings. ` +
    `Type the pinyin, hear the tone, and let spaced repetition bring back the words you miss. ` +
    `Free, open source, no account.`
  return {
    title,
    description,
    alternates: { canonical: `/hsk/${level}` },
    openGraph: { title, description, url: `/hsk/${level}`, type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function HskLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params
  const dict = loadDict(level)
  if (!dict) notFound()

  const preview = dict.words.slice(0, PREVIEW)
  const rest = dict.length - preview.length

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold sm:text-3xl">
        HSK {level} vocabulary — {dict.length} words you can type
      </h1>

      <p className="mt-4 text-sm leading-6 text-dim sm:text-base">
        This is the complete HSK {level} word list with pinyin and English meanings. You can read it
        here, or turn it into typing practice: look at the hanzi, type the pinyin on a normal
        keyboard, and every word you miss comes back later for review.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={`/dicts/hsk${level}`}
          className="inline-flex h-11 items-center rounded-lg bg-fg px-5 text-sm font-medium text-bg hover:opacity-90"
        >
          Practise HSK {level} now
        </Link>
        <span className="text-xs text-dim">Free · no account · no ads · runs in your browser</span>
      </div>

      <h2 className="mt-10 text-lg font-semibold">
        HSK {level} word list {preview.length ? `(first ${preview.length} of ${dict.length})` : ''}
      </h2>

      <div className="mt-3 overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface2 text-xs uppercase text-dim">
            <tr>
              <th className="px-3 py-2 font-medium">Word</th>
              <th className="px-3 py-2 font-medium">Pinyin</th>
              <th className="px-3 py-2 font-medium">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((w) => (
              <tr key={w.word} className="border-t border-line">
                <td className="whitespace-nowrap px-3 py-2 text-base">{w.word}</td>
                <td className="whitespace-nowrap px-3 py-2 text-dim">{(w.pinyin ?? []).join(' ')}</td>
                <td className="px-3 py-2 text-dim">{w.trans}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rest > 0 && (
        <p className="mt-3 text-sm text-dim">
          {rest} more words — open the full list in the app and start typing.
        </p>
      )}

      <h2 className="mt-10 text-lg font-semibold">How the practice works</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-dim">
        <li>See the hanzi, type the pinyin — full pinyin, initials, or tone-marked.</li>
        <li>Every word is pronounced and graded letter by letter.</li>
        <li>Missed words go into a mistake book and return on a spaced-repetition schedule (FSRS).</li>
        <li>Progress stays in your browser: no account, no backend, no ads.</li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold">Other HSK levels</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <Link
            key={l}
            href={`/hsk/${l}`}
            className={`inline-flex h-9 items-center rounded-lg border px-3 text-xs ${
              l === Number(level) ? 'border-fg text-fg' : 'border-line text-dim hover:bg-surface2'
            }`}
          >
            HSK {l}
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
