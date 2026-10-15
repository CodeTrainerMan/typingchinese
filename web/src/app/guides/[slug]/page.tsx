import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { GUIDES, getGuide } from '@/lib/guides'

/**
 * 指南落地页（服务端渲染的静态页）
 *
 * 承接 "how to type chinese on <device>" 这类真实搜索需求 —— 这是目前最大的内容缺口
 * （见 ref/growth/guide-content-plan.md）。指南解决具体问题，结尾内链到练习入口，
 * 把搜索流量导进产品。
 */

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const g = getGuide(slug)
  if (!g) return { title: 'Not found' }
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { title: g.title, description: g.description, url: `/guides/${g.slug}`, type: 'article' },
    twitter: { card: 'summary_large_image', title: g.title, description: g.description },
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const g = getGuide(slug)
  if (!g) notFound()

  const others = GUIDES.filter((x) => x.slug !== g.slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: g.title,
        description: g.description,
        url: `https://www.typingchinese.club/guides/${g.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.typingchinese.club/' },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://www.typingchinese.club/guides' },
          { '@type': 'ListItem', position: 3, name: g.title },
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
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-1">/</span>
        <Link href="/guides" className="hover:underline">Guides</Link>
        <span className="mx-1">/</span>
        <span>{g.title}</span>
      </nav>

      <h1 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{g.title}</h1>
      <p className="mt-4 text-sm leading-6 text-dim sm:text-base">{g.intro}</p>

      {g.sections.map((s, i) => (
        <section key={i} className="mt-8">
          <h2 className="text-lg font-semibold">{s.h2}</h2>
          {s.body.map((p, j) => (
            <p key={j} className="mt-2 text-sm leading-6 text-dim sm:text-base">{p}</p>
          ))}
          {s.list ? (
            <ul className="mt-3 space-y-1 pl-5 text-sm text-dim">
              {s.list.map((li, k) => (
                <li key={k} className="list-disc">{li}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      {/* 练习入口：指南流量 → 产品 */}
      <section className="mt-10 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">Now practise it</h2>
        <p className="mt-1 text-xs text-dim">
          Your keyboard is set up. Type pinyin, get graded letter by letter, and let spaced repetition
          bring back the words you miss. No account.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
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
            href="/hsk/1"
            className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm text-ink2 hover:bg-surface2"
          >
            HSK 1 word list
          </Link>
        </div>
      </section>

      {/* 指南互链 */}
      <h2 className="mt-10 text-lg font-semibold">Other guides</h2>
      <div className="mt-3 space-y-2">
        {others.map((o) => (
          <Link
            key={o.slug}
            href={`/guides/${o.slug}`}
            className="block rounded-lg border border-line p-4 hover:bg-surface2"
          >
            <span className="text-sm font-semibold text-ink2">{o.title}</span>
            <span className="mt-1 block text-xs text-dim">{o.description}</span>
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
