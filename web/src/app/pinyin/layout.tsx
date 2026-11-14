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

const pinyinJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.typingchinese.club/' },
        { '@type': 'ListItem', position: 2, name: 'Pinyin Chart', item: 'https://www.typingchinese.club/pinyin' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What are the 4 tones in Mandarin Chinese?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Mandarin Chinese has four main tones plus a neutral tone: 1st tone (flat/high, ā), 2nd tone (rising, á), 3rd tone (dipping/falling-rising, ǎ), and 4th tone (falling/sharp, à). Tone changes completely alter the meaning of a word.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do you type ü on an English keyboard?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On standard QWERTY keyboards with Chinese Pinyin IME, ü is typed using the letter "v" (e.g. type "nv" to get 女, or "lv" to get 绿).',
          },
        },
        {
          '@type': 'Question',
          name: 'How many initials and finals are in standard Chinese Pinyin?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Standard Mandarin Pinyin has 23 initials (consonants like b, p, m, f), 24 basic and compound finals (vowels like a, o, e, ai, ei), and 16 whole syllables that are read as a single sound.',
          },
        },
      ],
    },
  ],
}

export default function PinyinLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pinyinJsonLd) }}
      />
      {children}
    </>
  )
}
