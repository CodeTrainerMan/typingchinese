import type { Metadata } from 'next'
import CyberLanding from '@/components/CyberLanding'
import { ogImages, twitterImages } from '@/lib/seo'

/** 首页元数据：精准匹配 "learn chinese by typing", "pinyin typing practice" 核心词 */
export const metadata: Metadata = {
  title: 'TypingChinese — Learn Chinese & Pinyin by Typing | Free & Open Source',
  description:
    'Master Chinese pinyin and characters through interactive typing practice. Features HSK 1–6 vocabulary lists, tone training, spaced-repetition (FSRS) review, and stroke order animations. 100% free, runs in your browser.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'TypingChinese — Learn Chinese & Pinyin by Typing',
    description:
      'Master Chinese pinyin and characters through interactive typing practice. Features HSK 1–6 vocabulary lists and spaced-repetition review.',
    url: 'https://www.typingchinese.club',
    type: 'website',
    images: ogImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TypingChinese — Learn Chinese & Pinyin by Typing',
    description:
      'Master Chinese pinyin and characters through interactive typing practice. Free & open source.',
    images: twitterImages,
  },
}

/**
 * 引导页（首次访问入口）：只做产品介绍、功能说明与社区/作者链接。
 * 练习工作台已迁到 /dashboard，这里不再渲染任何仪表盘卡片。
 */
export default function HomePage() {
  return <CyberLanding />
}
