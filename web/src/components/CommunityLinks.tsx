'use client'

import NavIcon from '@/components/ui/NavIcon'
import { useI18n } from '@/i18n'

/** 官方入口：仓库与 Discord 社群。外链地址只在这里定义，改地址只改一处 */
export const GITHUB_URL = 'https://github.com/CodeTrainerMan/typingchinese'
export const DISCORD_URL = 'https://discord.gg/4kZ7nETEEc'

/**
 * 社区入口的三种形态：
 * - panel：首页整块卡片（图标 + 名称 + 一句话说明）
 * - rows：设置页的行式列表
 * - nav：侧栏底部，常态只露图标，跟随 aside 的 group-hover 展开文字
 */
export default function CommunityLinks({ variant = 'panel' }: { variant?: 'panel' | 'rows' | 'nav' }) {
  const { t } = useI18n()

  const items = [
    { href: GITHUB_URL, icon: 'github' as const, label: 'GitHub', desc: t('community.githubDesc') },
    { href: DISCORD_URL, icon: 'discord' as const, label: 'Discord', desc: t('community.discordDesc') },
  ]

  if (variant === 'nav')
    return (
      <div className="mt-1 flex flex-col">
        {items.map(i => (
          <a
            key={i.href}
            href={i.href}
            target="_blank"
            rel="noreferrer"
            title={i.label}
            className="flex shrink-0 items-center gap-3 rounded-lg p-2 text-ink transition-colors duration-300 hover:bg-hover"
          >
            <NavIcon name={i.icon} className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {i.label}
            </span>
          </a>
        ))}
      </div>
    )

  if (variant === 'rows')
    return (
      <div className="flex flex-col gap-3">
        {items.map(i => (
          <a
            key={i.href}
            href={i.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-4 rounded-lg border border-line p-3 hover:bg-hover"
          >
            <div className="flex min-w-0 items-center gap-3">
              <NavIcon name={i.icon} className="h-5 w-5 shrink-0 text-brand" />
              <div className="min-w-0">
                <div className="text-sm">{i.label}</div>
                <div className="mt-1 text-xs text-dim">{i.desc}</div>
              </div>
            </div>
            <NavIcon name="external" className="h-4 w-4 shrink-0 text-dim" />
          </a>
        ))}
      </div>
    )

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(i => (
        <a
          key={i.href}
          href={i.href}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-3 rounded-lg border border-line bg-solid p-4 hover:bg-hover"
        >
          <NavIcon name={i.icon} className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div className="min-w-0">
            <div className="flex items-center gap-1 font-semibold text-ink">
              {i.label}
              <NavIcon name="external" className="h-3.5 w-3.5 text-dim" />
            </div>
            <p className="mt-1 text-sm text-dim">{i.desc}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
