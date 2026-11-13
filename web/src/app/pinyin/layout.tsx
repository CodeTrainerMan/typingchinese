import type { Metadata } from 'next'
import { ogImages, twitterImages } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Chinese Pinyin Chart with Audio — Initials, Finals & 4 Tones | TypingChinese',
  description:
    'Complete interactive Mandarin Chinese pinyin chart with native audio pronunciation. Listen to initials, finals, overall syllables, and practice 4 tones. Free learning tool.',
  alternates: { canonical: '/pinyin' },
  openGraph: {
    title: 'Chinese Pinyin Chart with Audio — Initials, Finals & Tones',
    description:
      'Complete interactive Mandarin Chinese pinyin chart with native audio pronunciation for initials, finals, and tones.',
    url: '/pinyin',
    type: 'website',
    images: ogImages,
  },
  twitter: { card: 'summary_large_image', images: twitterImages },
}

export default function PinyinLayout({ children }: { children: React.ReactNode }) {
  return children
}
