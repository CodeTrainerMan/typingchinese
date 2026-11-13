import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import './cyber.css'
import Nav, { MobileNav } from '@/components/Nav'
import ThemeEffect from '@/components/ThemeEffect'
import PersistSync from '@/components/PersistSync'
import { I18nProvider } from '@/i18n'
import AttributionCapture from '@/components/AttributionCapture'

// 默认英文；用户在设置页切换语言后由 I18nProvider 同步 html lang 与 title
export const metadata: Metadata = {
  title: 'TypingChinese · Learn Chinese by Typing',
  description:
    'Type pinyin to learn Chinese: follow-typing and dictation, live per-letter feedback, spaced-repetition reviews, mistake notebook and progress stats.',
  metadataBase: new URL('https://www.typingchinese.club'),
  keywords: [
    'learn Chinese',
    'pinyin typing',
    'Chinese typing practice',
    'HSK vocabulary',
    'HSK 1-6 word lists',
    'type pinyin',
    'Chinese stroke order',
    'pinyin keyboard',
    'spaced repetition Chinese',
    'learn mandarin',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'e54c6dbf0aa71f12',
  },
  // canonical 不在这里写：layout 的 alternates 会被所有子页面继承，
  // 导致 /pinyin、/dicts 等页面错误地把规范地址指向首页。改由各页面自己声明。
  openGraph: {
    type: 'website',
    siteName: 'TypingChinese',
    url: 'https://www.typingchinese.club',
    title: 'TypingChinese · Learn Chinese by Typing',
    description:
      'Free, open-source, no-account pinyin typing practice for Chinese learners, with FSRS review for the words you miss.',
    images: [{ url: '/og.png', width: 2400, height: 1260, alt: 'TypingChinese practice board' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TypingChinese · Learn Chinese by Typing',
    description:
      'Free, open-source, no-account pinyin typing practice for Chinese learners, with FSRS review for the words you miss.',
    images: ['/og.png'],
  },
}

const rootJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://www.typingchinese.club/#webapp',
      name: 'TypingChinese',
      url: 'https://www.typingchinese.club',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      description:
        'Free, open-source online Chinese pinyin typing practice for learners. Complete HSK 1-6 vocabulary, stroke order guides, and FSRS spaced repetition review.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      inLanguage: [
        'en',
        'zh-CN',
        'zh-TW',
        'es',
        'pt',
        'fr',
        'de',
        'ru',
        'uk',
        'ja',
        'ko',
        'th',
        'vi',
        'id',
      ],
      featureList: [
        'Pinyin typing practice with audio tones',
        'Complete HSK 1 to 6 vocabulary word lists',
        'Spaced repetition system (FSRS) for missed words',
        'Interactive Chinese character stroke order practice',
        'Multi-language UI support across 14 languages',
        'No sign-up or installation required',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.typingchinese.club/#website',
      url: 'https://www.typingchinese.club',
      name: 'TypingChinese',
      description: 'Learn Chinese by typing: interactive pinyin practice and HSK vocabulary.',
      inLanguage: 'en',
    },
  ],
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      {/* 浏览器扩展（如 ColorZilla）会在 hydrate 前往 body 注入 cz-shortcut-listen 等属性，
          导致 SSR HTML 与客户端属性不匹配的告警。只抑制 body 自身属性差异，子组件仍正常校验。 */}
      <body className="min-h-full" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }}
        />
        <I18nProvider>
          <ThemeEffect />
          <AttributionCapture />
          <PersistSync />
          <MobileNav />
          {/* 侧栏（fixed）+ 占位 + 内容区，桌面端横排；移动端侧栏不渲染，内容独占一行 */}
          <div className="flex">
            <Nav />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
