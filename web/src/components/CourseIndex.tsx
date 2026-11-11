'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n'
import { COURSES, isLatestCourse, localized } from '@/lib/courses'
import type { MessageKey } from '@/i18n'

/** 课程中心：列出全部课程，今天的课排第一并标注「今日课程」 */
export default function CourseIndex() {
  const { t, locale } = useI18n()

  // 最新一课排最前；课号按发布日期升序固定，不随展示顺序变化
  const lessons = [...COURSES].reverse()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <nav className="course-crumb">
        <Link href="/">{t('nav.home')}</Link>
        <span>/</span>
        <span>{t('course.navAll')}</span>
      </nav>

      <header className="course-header">
        <span className="course-kicker">{'//'} {t('course.title')}</span>
        <h1>{t('course.title')}</h1>
        <p>{t('course.intro')}</p>
      </header>

      <div className="course-list">
        {lessons.map((c, i) => {
          const n = COURSES.length - i
          const levelKey: MessageKey =
            c.level === 'beginner'
              ? 'course.levelBeginner'
              : c.level === 'intermediate'
                ? 'course.levelIntermediate'
                : 'course.levelAdvanced'
          return (
            <Link key={c.slug} href={`/course/${c.slug}`} className="course-list-card">
              <div className="course-list-top">
                <span className="course-lesson-no">{t('course.lesson', { n })}</span>
                {isLatestCourse(c.slug) && <span className="course-today-badge">{t('course.today')}</span>}
              </div>
              <h2>{localized(c.title, locale)}</h2>
              <p>{localized(c.description, locale)}</p>
              <div className="course-meta">
                <span>{t('course.words', { n: c.words.length })}</span>
                <span>·</span>
                <span>{t(levelKey)}</span>
                <span>·</span>
                <span>{t('course.published', { date: c.date })}</span>
              </div>
              <span className="course-cta">{t('course.startLesson')} ↗</span>
            </Link>
          )
        })}
      </div>

      <div className="course-bottom-links">
        <Link href="/practice" className="course-primary-link">
          {t('course.practiceCta')} ↗
        </Link>
        <Link href="/pinyin" className="course-ghost-link">
          {t('course.pinyinCta')} ↗
        </Link>
      </div>
    </div>
  )
}
