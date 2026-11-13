import type { Metadata } from 'next'
import { ogImages, twitterImages } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Chinese Stroke Order & Handwriting Practice | TypingChinese',
  description:
    'Learn how to write Chinese characters with animated stroke order, stroke-by-stroke handwriting practice, and stroke count guides. 100% free and interactive.',
  alternates: { canonical: '/write' },
  openGraph: {
    title: 'Chinese Stroke Order & Handwriting Practice',
    description:
      'Learn how to write Chinese characters with animated stroke order, stroke-by-stroke handwriting practice, and stroke count guides.',
    url: '/write',
    type: 'website',
    images: ogImages,
  },
  twitter: { card: 'summary_large_image', images: twitterImages },
}

export default function WriteLayout({ children }: { children: React.ReactNode }) {
  return children
}
