import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CourseLesson from '@/components/CourseLesson'
import { COURSES, getCourse } from '@/lib/courses'
import { ogImageFor, twitterImageFor } from '@/lib/seo'

/** 课程落地页：静态生成，带 Article / BreadcrumbList / ItemList 结构化数据 */
export function generateStaticParams() {
  return COURSES.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const c = getCourse(slug)
  if (!c) return { title: 'Not found' }
  return {
    title: `${c.title.en} | TypingChinese`,
    description: c.description.en,
    alternates: { canonical: `/course/${c.slug}` },
    openGraph: {
      title: c.title.en,
      description: c.description.en,
      url: `/course/${c.slug}`,
      type: 'article',
      images: ogImageFor(`/og/course-${c.slug}.png`),
    },
    twitter: {
      card: 'summary_large_image',
      title: c.title.en,
      description: c.description.en,
      images: twitterImageFor(`/og/course-${c.slug}.png`),
    },
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = getCourse(slug)
  if (!course) notFound()
  const index = COURSES.findIndex(c => c.slug === slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: course.title.en,
        description: course.description.en,
        datePublished: course.date,
        inLanguage: ['en', 'zh-CN'],
        url: `https://www.typingchinese.club/course/${course.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.typingchinese.club/' },
          { '@type': 'ListItem', position: 2, name: 'Course', item: 'https://www.typingchinese.club/course' },
          { '@type': 'ListItem', position: 3, name: course.title.en },
        ],
      },
      {
        '@type': 'ItemList',
        numberOfItems: course.words.length,
        itemListElement: course.words.map((w, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: w.word,
          description: `${w.pinyin} — ${w.meaning.en}`,
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseLesson course={course} index={index} />
    </>
  )
}
