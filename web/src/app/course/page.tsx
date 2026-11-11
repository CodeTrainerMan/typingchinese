import type { Metadata } from 'next'
import CourseIndex from '@/components/CourseIndex'
import { ogImages, twitterImages } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Chinese Course — Learn Real Spoken Chinese | TypingChinese',
  description:
    'Short, practical Chinese lessons: everyday words with pinyin, real example sentences and usage notes, then practise typing them with live feedback.',
  alternates: { canonical: '/course' },
  openGraph: {
    title: 'Chinese Course — Learn Real Spoken Chinese',
    description: 'Everyday Chinese words with pinyin, real sentences and usage notes.',
    url: '/course',
    type: 'website',
    images: ogImages,
  },
  twitter: { card: 'summary_large_image', images: twitterImages },
}

/** 课程中心：服务端出 metadata，界面文案由客户端组件按语言渲染 */
export default function CoursePage() {
  return <CourseIndex />
}
