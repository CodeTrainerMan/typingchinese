import type { MetadataRoute } from 'next'
import { PILOT_CHARS } from '@/lib/write/pilot-chars'

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

  return [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/dicts`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ...levels,
    ...charPages,
  ]
}
