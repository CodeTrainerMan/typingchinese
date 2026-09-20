'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BrandMark from '@/components/BrandMark'
import CommunityLinks from '@/components/CommunityLinks'
import NavIcon from '@/components/ui/NavIcon'
import { useI18n } from '@/i18n'

/** 侧栏顺序：学习主流程在上，设置沉底（对齐 TypeWords 的 aside 编排） */
const ITEMS = [
  { href: '/', key: 'home', icon: 'home' },
  { href: '/practice', key: 'practice', icon: 'keyboard' },
  { href: '/dicts', key: 'dicts', icon: 'book' },
  { href: '/article', key: 'article', icon: 'article' },
  { href: '/pinyin', key: 'pinyin', icon: 'pinyin' },
  { href: '/wrong', key: 'wrong', icon: 'wrong' },
  { href: '/stats', key: 'stats', icon: 'stats' },
] as const

const FOOTER = { href: '/setting', key: 'setting', icon: 'setting' } as const

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')
}

/**
 * 桌面端：左侧固定侧栏（对标 TypeWords 的 aside）。
 * 常态 4.5rem 只露图标，鼠标移入展开到 14rem 露出文字——不占版面，又不用记图标。
 */
export default function Nav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <>
      <aside className="group fixed left-0 top-0 z-30 hidden h-screen w-[4.5rem] flex-col justify-between overflow-hidden border-r border-line bg-surface2 shadow-[var(--shadow-sm)] transition-[width] duration-300 hover:w-56 md:flex">
        <div className="flex flex-col p-2">
          <div className="flex items-center gap-3 p-2">
            <BrandMark className="h-7 w-7 shrink-0 text-ink" />
            <span className="whitespace-nowrap text-sm font-semibold text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {t('nav.brandA')}
              {t('nav.brandB')}
            </span>
          </div>
          {ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              title={t(`nav.${item.key}`)}
              className={`relative my-1 flex shrink-0 items-center gap-3 rounded-lg p-2 text-ink transition-colors duration-300 hover:bg-hover ${
                isActive(pathname, item.href)
                  ? 'bg-hover text-brand after:absolute after:left-0 after:top-1/2 after:h-5 after:w-[3px] after:-translate-y-1/2 after:rounded-full after:bg-brand after:content-[""]'
                  : ''
              }`}
            >
              <NavIcon name={item.icon} className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {t(`nav.${item.key}`)}
              </span>
            </Link>
          ))}
        </div>
        <div className="border-t border-line p-2">
          <Link
            href={FOOTER.href}
            title={t('nav.setting')}
            className={`flex shrink-0 items-center gap-3 rounded-lg p-2 text-ink transition-colors duration-300 hover:bg-hover ${
              isActive(pathname, FOOTER.href)
                ? 'bg-hover text-brand after:absolute after:left-0 after:top-1/2 after:h-5 after:w-[3px] after:-translate-y-1/2 after:rounded-full after:bg-brand after:content-[""]'
                : ''
            }`}
          >
            <NavIcon name={FOOTER.icon} className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {t('nav.setting')}
            </span>
          </Link>
          {/* 仓库与社群：常驻在侧栏底部，任何页面都能一跳出去 */}
          <CommunityLinks variant="nav" />
        </div>
      </aside>
      {/* 占位：把内容顶到侧栏右侧（侧栏是 fixed，不占位会压住内容） */}
      <div className="hidden w-[4.5rem] shrink-0 md:block" />
    </>
  )
}

/** 移动端：侧栏换成顶部横条 */
export function MobileNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-1 overflow-x-auto border-b border-line bg-surface px-2 md:hidden">
      <Link href="/" className="mr-1 inline-flex shrink-0 items-center px-2">
        <BrandMark className="h-6 w-6 text-ink" />
      </Link>
      {[...ITEMS.slice(1), FOOTER].map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`relative inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm transition-colors ${
            isActive(pathname, item.href)
              ? 'bg-hover text-brand after:absolute after:bottom-1 after:left-1/2 after:h-[3px] after:w-5 after:-translate-x-1/2 after:rounded-full after:bg-brand after:content-[""]'
              : 'text-dim'
          }`}
        >
          <NavIcon name={item.icon} className="h-4 w-4" />
          {t(`nav.${item.key}`)}
        </Link>
      ))}
    </header>
  )
}
