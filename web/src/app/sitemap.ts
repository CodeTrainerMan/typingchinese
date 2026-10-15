import type { MetadataRoute } from 'next'
import { PILOT_CHARS } from '@/lib/write/pilot-chars'
import { REGION_PAGES } from '@/lib/geo-pages'
import { GUIDES } from '@/lib/guides'

const BASE = 'https://www.typingchinese.club'

/**
 * 只列对爬虫有内容的页面：HSK 落地页与单字页都是服务端渲染的静态页，
 * /dicts/[id] 之类纯客户端页面不进 sitemap（爬到也是空壳）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const levels = [1, 2, 3, 4, 5, 6].map((level) => ({
    url: `${BASE}/hsk/${level}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  // 单字落地页：长尾 "X 笔顺 / X 怎么写"——先发试点批次，验证收录后再放开全量
  const charPages = PILOT_CHARS.map((ch) => ({
    url: `${BASE}/write/${encodeURIComponent(ch)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Geo 落地页：按地区/语言承接本地化搜索词
  const regionPages = REGION_PAGES.map((p) => ({
    url: `${BASE}/region/${p.code}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // 指南内容层：承接 "how to type chinese on <device>" 类需求
  const guidePages = GUIDES.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/dicts`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/region`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ...levels,
    ...charPages,
    ...regionPages,
    ...guidePages,
  ]
}
