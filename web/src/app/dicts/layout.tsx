import type { Metadata } from 'next'
import { ogImages, twitterImages } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Chinese Vocabulary Lists & HSK 1–6 Dictionaries | TypingChinese',
  description:
    'Browse Chinese vocabulary lists: complete HSK 1 to 6 word sets, daily conversations, common idioms, or import your own custom word lists to practice typing.',
  alternates: { canonical: '/dicts' },
  openGraph: {
    title: 'Chinese Vocabulary Lists & HSK 1–6 Dictionaries',
    description:
      'Browse Chinese vocabulary lists: HSK 1-6 words, daily conversations, idioms, and custom list import.',
    url: '/dicts',
    type: 'website',
    images: ogImages,
  },
  twitter: { card: 'summary_large_image', images: twitterImages },
}

export default function DictsLayout({ children }: { children: React.ReactNode }) {
  return children
}
