import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import ThemeEffect from '@/components/ThemeEffect'
import { I18nProvider } from '@/i18n'

// 默认英文；用户在设置页切换语言后由 I18nProvider 同步 html lang 与 title
export const metadata: Metadata = {
  title: 'Pinyin Type · Learn Chinese by Typing',
  description:
    'Type pinyin to learn Chinese: follow-typing and dictation, live per-letter feedback, spaced-repetition reviews, mistake notebook and progress stats.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <ThemeEffect />
          <Nav />
          <main className="flex-1 w-full">{children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
