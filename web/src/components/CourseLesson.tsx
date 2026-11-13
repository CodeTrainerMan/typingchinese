'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n'
import { useSpeak } from '@/lib/useSpeak'
import { isLatestCourse, localized, type Course, type CourseWord, type Localized } from '@/lib/courses'
import type { MessageKey } from '@/i18n'

function XMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

interface WordCardProps {
  item: CourseWord
  index: number
  total: number
  onSpeak: (text: string) => void
  text: (v: Localized) => string
  t: (key: MessageKey, params?: Record<string, string | number>) => string
}

function WordCard({ item, index, total, onSpeak, text, t }: WordCardProps) {
  return (
    <article className="course-word-card">
      <div className="course-word-head">
        <span className="course-word-no">{t('course.wordCount', { a: index + 1, b: total })}</span>
        <div className="course-word-main">
          <div className="course-hanzi-row">
            <span className="course-hanzi">{item.word}</span>
            <button
              type="button"
              className="course-speak"
              onClick={() => onSpeak(item.word)}
              aria-label={t('course.listenWord')}
              title={t('course.listenWord')}
            >
              🔊
            </button>
          </div>
          <span className="course-pinyin">{item.pinyin}</span>
        </div>
      </div>

      <div className="course-meaning">
        <span className="course-label">{t('course.meaning')}</span>
        <span>{text(item.meaning)}</span>
      </div>

      <div className="course-examples">
        {item.sentences.map((s, i) => (
          <div className="course-example" key={s.text}>
            <div className="course-example-head">
              <span className="course-label">{t('course.example')} {i + 1}</span>
              <button
                type="button"
                className="course-speak"
                onClick={() => onSpeak(s.text)}
                aria-label={t('course.listenExample')}
                title={t('course.listenExample')}
              >
                🔊
              </button>
            </div>
            <p className="course-example-hanzi">{s.text}</p>
            <p className="course-example-pinyin">{s.pinyin}</p>
            <p className="course-example-meaning">{text(s.meaning)}</p>
          </div>
        ))}
      </div>

      <div className="course-usage">
        <span className="course-label">{t('course.usage')}</span>
        <p>{text(item.note)}</p>
      </div>

      {item.quote && (
        <div className="course-quote">
          <div className="course-quote-head">
            <span className="course-quote-mark"><XMark /></span>
            <span className="course-label">{t('course.realExample')}</span>
            <span className="course-quote-author">{item.quote.author}</span>
          </div>
          <blockquote>{item.quote.text}</blockquote>
          <p className="course-quote-context">{text(item.quote.context)}</p>
          <a href={item.quote.url} target="_blank" rel="noreferrer" className="course-quote-link">
            {t('course.openPost')} ↗
          </a>
        </div>
      )}
    </article>
  )
}

/** 单课详情：10 个词卡 + 发音 + 真实用例引用 */
export default function CourseLesson({ course, index }: { course: Course; index: number }) {
  const { t, locale } = useI18n()
  const speak = useSpeak()
  const text = (v: Localized) => localized(v, locale)

  // X 会按分享的 URL 缓存卡片抓取结果，旧链接若曾被抓成「无图」就一直复用。
  // 固定 ?v=2 让分享走一个新 URL，强制重抓；用带 www 的完整域名避开 apex 的 308 跳转。
  const shareUrl = `https://www.typingchinese.club/course/${course.slug}?v=2`
  const shareIntent =
    `https://x.com/intent/post?text=${encodeURIComponent(`${text(course.title)} · TypingChinese.club`)}` +
    `&url=${encodeURIComponent(shareUrl)}`

  const levelKey: MessageKey =
    course.level === 'beginner'
      ? 'course.levelBeginner'
      : course.level === 'intermediate'
        ? 'course.levelIntermediate'
        : 'course.levelAdvanced'

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <nav className="course-crumb">
        <Link href="/">{t('nav.home')}</Link>
        <span>/</span>
        <Link href="/course">{t('course.navAll')}</Link>
        <span>/</span>
        <span>{t('course.lesson', { n: index + 1 })}</span>
      </nav>

      <header className="course-header">
        <div className="course-header-badges">
          {isLatestCourse(course.slug) && <span className="course-today-badge">{t('course.today')}</span>}
          <span className="course-lesson-no">{t('course.lesson', { n: index + 1 })}</span>
        </div>
        <h1>{text(course.title)}</h1>
        <p>{text(course.description)}</p>
        <div className="course-goal">
          <span className="course-label">{t('course.goal')}</span>
          <p>{text(course.goal)}</p>
        </div>
        <div className="course-meta">
          <span>{t('course.words', { n: course.words.length })}</span>
          <span>·</span>
          <span>{t(levelKey)}</span>
          <span>·</span>
          <span>{t('course.published', { date: course.date })}</span>
        </div>
      </header>

      <div className="course-words">
        {course.words.map((w, i) => (
          <WordCard
            key={w.word}
            item={w}
            index={i}
            total={course.words.length}
            onSpeak={speak}
            text={text}
            t={t}
          />
        ))}
      </div>

      <div className="course-bottom-links">
        <a href={shareIntent} target="_blank" rel="noreferrer" className="course-share-x">
          <span className="course-share-x-mark"><XMark /></span>
          {t('course.shareOnX')} ↗
        </a>
        <Link href="/practice" className="course-primary-link">
          {t('course.practiceCta')} ↗
        </Link>
        <Link href="/pinyin" className="course-ghost-link">
          {t('course.pinyinCta')} ↗
        </Link>
        <Link href="/course" className="course-ghost-link">
          ← {t('course.backToCourse')}
        </Link>
      </div>
    </div>
  )
}
