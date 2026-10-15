import type { Metadata } from 'next'
import Link from 'next/link'
import { GUIDES } from '@/lib/guides'

/** 指南索引页：内链枢纽，让每篇指南都能被爬虫与用户走到 */
export const metadata: Metadata = {
  title: 'Chinese Typing Guides — Set Up Your Keyboard, Then Practise',
  description:
    'Step-by-step guides for typing Chinese on Windows, Mac, iPhone and Android: install the pinyin input method, switch keyboards, and type ü with v.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'Chinese Typing Guides',
    description: 'Set up Chinese typing on any device, then practise pinyin with live feedback.',
    url: '/guides',
    type: 'website',
  },
}

export default function GuidesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <nav className="text-xs text-dim">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <span>Guides</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Chinese typing guides</h1>
      <p className="mt-4 text-sm leading-6 text-dim sm:text-base">
        How to type Chinese on each device — installing the pinyin input method, switching keyboards,
        and the small conventions (like typing ü as v) that every real input method follows.
      </p>

      <div className="mt-8 space-y-3">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="block rounded-2xl border border-line bg-card p-5 hover:bg-surface2"
          >
            <h2 className="text-base font-semibold text-ink2">{g.title}</h2>
            <p className="mt-1 text-sm leading-6 text-dim">{g.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/practice"
          className="inline-flex h-11 items-center rounded-lg bg-fg px-5 text-sm font-medium text-bg hover:opacity-90"
        >
          Start typing practice
        </Link>
        <Link
          href="/pinyin"
          className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm text-ink2 hover:bg-surface2"
        >
          Pinyin chart
        </Link>
      </div>
    </main>
  )
}
