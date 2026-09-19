import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import Nav, { MobileNav } from '@/components/Nav'
import ThemeEffect from '@/components/ThemeEffect'
import { I18nProvider } from '@/i18n'

// 默认英文；用户在设置页切换语言后由 I18nProvider 同步 html lang 与 title
export const metadata: Metadata = {
  title: 'TypingChinese · Learn Chinese by Typing',
  description:
    'Type pinyin to learn Chinese: follow-typing and dictation, live per-letter feedback, spaced-repetition reviews, mistake notebook and progress stats.',
  metadataBase: new URL('https://www.typingchinese.club'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'TypingChinese',
    url: 'https://www.typingchinese.club',
    title: 'TypingChinese · Learn Chinese by Typing',
    description:
      'Free, open-source, no-account pinyin typing practice for Chinese learners, with FSRS review for the words you miss.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'TypingChinese practice board' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TypingChinese · Learn Chinese by Typing',
    description:
      'Free, open-source, no-account pinyin typing practice for Chinese learners, with FSRS review for the words you miss.',
    images: ['/og.png'],
  },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <I18nProvider>
          <ThemeEffect />
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
