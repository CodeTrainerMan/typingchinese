import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://www.typingchinese.club/sitemap.xml',
    host: 'https://www.typingchinese.club',
  }
}
