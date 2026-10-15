import type { Metadata } from 'next'
import Link from 'next/link'
import { REGION_PAGES } from '@/lib/geo-pages'

/**
 * Geo 落地页索引：15 个 /region/[code] 之前只存在于 sitemap，站内没有任何入口
 * （等于孤岛，既没内链也传不到权重）。这一页把它们串起来。
 */
export const metadata: Metadata = {
  title: 'Learn Chinese Typing by Region — Pinyin Practice for Speakers of 14 Languages',
  description:
    'Pinyin typing practice for learners around the world: Chinese, Japanese, Korean, Russian, French, German, Spanish, Portuguese, Thai, Vietnamese, Indonesian and English.',
  alternates: { canonical: '/region' },
  openGraph: {
    title: 'Learn Chinese Typing by Region',
    description: 'Free pinyin typing practice, localised for learners in 15 countries and regions.',
    url: '/region',
    type: 'website',
  },
}

export default function RegionIndexPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <nav className="text-xs text-dim">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <span>Regions</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">Learn Chinese typing by region</h1>
      <p className="mt-4 text-sm leading-6 text-dim sm:text-base">
        The pinyin chart, the four tones and the typing quiz — with explanations in the language you
        actually think in. Pick your country or region:
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {REGION_PAGES.map((p) => (
          <Link
            key={p.code}
            href={`/region/${p.code}`}
            className="rounded-xl border border-line bg-card p-4 hover:bg-surface2"
          >
            <span className="block text-sm font-semibold text-ink2">
              {p.country} · {p.countryEn}
            </span>
            <span className="mt-1 block text-xs text-dim">{p.officialLang}</span>
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
        <Link
          href="/guides"
          className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm text-ink2 hover:bg-surface2"
        >
          Typing guides
        </Link>
      </div>
    </main>
  )
}
