'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/i18n'

const HREFS = ['/', '/practice', '/dicts', '/article', '/wrong', '/stats', '/setting'] as const
const KEYS = ['home', 'practice', 'dicts', 'article', 'wrong', 'stats', 'setting'] as const

export default function Nav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
      <nav className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-1">
        <Link href="/" className="mr-4 font-semibold tracking-tight">
          <span className="text-brand">{t('nav.brandA')}</span>
          {t('nav.brandB')}
        </Link>
        {HREFS.slice(1).map((href, i) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 h-8 inline-flex items-center rounded-lg text-sm transition-colors ${
                active ? 'bg-brand-soft text-brand font-medium' : 'text-dim hover:bg-surface2'
              }`}
            >
              {t(`nav.${KEYS[i + 1]}`)}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
