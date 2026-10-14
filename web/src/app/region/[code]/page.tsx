import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { REGION_PAGES, getRegionPage } from '@/lib/geo-pages'
import { t, htmlLangOf } from '@/i18n/server'

/**
 * Geo 落地页（服务端渲染的静态页）
 *
 * 承接 "learn Chinese typing in [Country] / pinyin practice for [语言] speakers"
 * 这类本地化搜索。每个地区用 geo.ts 映射的界面语言渲染：
 * hero 取语言包文案，learnTip / FAQ 用当地语言书写（内容独特，规避 doorway）。
 *
 * 接 sitemap 后由 GSC 抓取；内链到 /write、/hsk、/practice 形成权重网。
 */

export function generateStaticParams() {
  return REGION_PAGES.map((p) => ({ code: p.code }))
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const page = getRegionPage(code)
  if (!page) return { title: 'Not found' }
  const title = `Learn Chinese Typing in ${page.countryEn} — Pinyin Practice for ${page.officialLang} Speakers`
  const description = `Free pinyin typing practice for learners in ${page.countryEn}. Type to learn Chinese, hear tones, and let spaced repetition fix the words you miss. No account, open source.`
  return {
    title,
    description,
    alternates: { canonical: `/region/${page.code}` },
    openGraph: {
      title,
      description,
      url: `/region/${page.code}`,
      type: 'website',
      locale: htmlLangOf(page.locale),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function RegionPageView({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const page = getRegionPage(code)
  if (!page) notFound()

  const heroTitle = t(page.locale, 'app.title')
  const heroDesc = t(page.locale, 'app.desc')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
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
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <span>{page.countryEn}</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{heroTitle}</h1>
      <p className="mt-2 text-sm text-dim">
        Learn Chinese typing in {page.countryEn} — free pinyin practice for {page.officialLang} speakers
      </p>
      <p className="mt-3 text-sm leading-6 text-dim sm:text-base">{heroDesc}</p>

      {/* 地区专属学习提示：独特内容，规避 doorway page 风险 */}
      <section className="mt-8 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">Why this page for {page.countryEn}</h2>
        <p className="mt-2 text-sm leading-6 text-dim">{page.learnTip}</p>
        <p className="mt-3 text-xs text-dim">Primary language: {page.officialLang}</p>
      </section>

      {/* 练习入口（与语言无关的产品功能） */}
      <section className="mt-8 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">Start practising</h2>
        <p className="mt-1 text-xs text-dim">
          Type pinyin, hear tones, mistakes go to a review queue. No account, open source.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/practice"
            className="inline-flex h-11 items-center rounded-lg bg-fg px-5 text-sm font-medium text-bg hover:opacity-90"
          >
            Open practice
          </Link>
          <Link
            href="/write"
            className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm text-ink2 hover:bg-surface2"
          >
            Handwriting
          </Link>
          <Link
            href="/hsk/1"
            className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm text-ink2 hover:bg-surface2"
          >
            HSK 1 list
          </Link>
        </div>
      </section>

      {/* FAQ：内容针对该国，当地语言书写 */}
      <h2 className="mt-10 text-lg font-semibold">FAQ for learners in {page.countryEn}</h2>
      <div className="mt-3 space-y-4">
        {page.faqs.map((f, i) => (
          <div key={i} className="rounded-lg border border-line p-4">
            <h3 className="text-sm font-semibold text-ink2">{f.q}</h3>
            <p className="mt-1 text-sm leading-6 text-dim">{f.a}</p>
          </div>
        ))}
      </div>

      {/* 内链：分级聚合页，形成权重网 */}
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
