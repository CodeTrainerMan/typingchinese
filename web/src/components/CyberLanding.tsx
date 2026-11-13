'use client'

import { useEffect, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavIcon, { type NavIconName } from '@/components/ui/NavIcon'
import MemoryEngine from '@/components/CyberMemory'
import { useI18n } from '@/i18n'
import {
  DISCORD_URL,
  GITHUB_URL,
  REDDIT_URL,
  X_CHAT_URL,
  X_HANDLE,
  X_URL,
} from '@/components/CommunityLinks'

/** X（原 Twitter）标志：实心 path，不引图标库 */
function XLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

/** store 持久化键；只用来判断访问者是否已有练习数据 */
const STORE_KEY = 'cn-type-base-v1'
const noopSubscribe = () => () => {}
const serverSnapshot = () => false

function hasPracticeData(): boolean {
  try {
    const state = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null')?.state
    return (
      Boolean(state?.statistics?.length) ||
      Boolean(state?.dicts?.some((d: { lastLearnIndex?: number }) => (d.lastLearnIndex ?? 0) > 0))
    )
  } catch {
    // 隐私模式下 localStorage 可能不可用，按新用户处理
    return false
  }
}

/**
 * 引导页（/）：首次访问只做产品介绍、功能说明与社区/作者链接。
 * 练习工作台在 /dashboard，这里不渲染任何仪表盘卡片。
 * 所有文案走 i18n 的 landing 命名空间；外链地址统一来自 CommunityLinks.tsx。
 */
export default function CyberLanding() {
  const { t } = useI18n()

  // SSR 用 false，客户端 hydration 后读真实值；不做自动跳转，保证引导页可分享、可索引
  const returning = useSyncExternalStore(noopSubscribe, hasPracticeData, serverSnapshot)

  useEffect(() => {
    // 赛博朋克皮肤只作用于引导页：覆盖语义令牌让侧栏一起换肤，离开时还原
    document.documentElement.dataset.cyber = 'on'
    return () => {
      delete document.documentElement.dataset.cyber
    }
  }, [])

  const features: {
    no: string
    icon: NavIconName
    title: string
    desc: string
    tag: string
  }[] = [
    {
      no: '01',
      icon: 'keyboard',
      title: t('home.featSpellTitle'),
      desc: t('home.featSpellDesc'),
      tag: t('landing.featTag1'),
    },
    {
      no: '02',
      icon: 'article',
      title: t('home.featDictationTitle'),
      desc: t('home.featDictationDesc'),
      tag: t('landing.featTag2'),
    },
    {
      no: '03',
      icon: 'stats',
      title: t('home.featFsrsTitle'),
      desc: t('home.featFsrsDesc'),
      tag: t('landing.featTag3'),
    },
    {
      no: '04',
      icon: 'pinyin',
      title: t('home.featVTitle'),
      desc: t('home.featVDesc'),
      tag: t('landing.featTag4'),
    },
    {
      no: '05',
      icon: 'pinyin',
      title: t('pinyin.title'),
      desc: t('pinyin.desc'),
      tag: t('landing.featTag5'),
    },
    {
      no: '06',
      icon: 'wrong',
      title: t('home.wrongBook'),
      desc: t('home.wrongHint'),
      tag: t('landing.featTag6'),
    },
  ]

  const socials: { icon: NavIconName | 'text'; mark: string; name: string; desc: string; href: string }[] = [
    {
      icon: 'github',
      mark: '',
      name: 'GitHub',
      desc: t('community.githubDesc'),
      href: GITHUB_URL,
    },
    {
      icon: 'discord',
      mark: '',
      name: 'Discord',
      desc: t('community.discordDesc'),
      href: DISCORD_URL,
    },
    {
      icon: 'text',
      mark: 'r/',
      name: 'r/ChinesePractice',
      desc: t('landing.redditDesc'),
      href: REDDIT_URL,
    },
    {
      icon: 'text',
      mark: '𝕏',
      name: 'X Chat',
      desc: t('landing.xChatDesc'),
      href: X_CHAT_URL,
    },
  ]

  return (
    <div className="cyber">
      <div className="cyber-shell">
        {/* HUD 状态条 */}
        <div className="cyber-hud">
          <div className="cyber-hud-left">
            <span className="cyber-dot" />
            <span className="cy-ok">{t('landing.hudStatus')}</span>
            <span className="cy-dim">/</span>
            <span>{t('landing.hudProduct')}</span>
            <span className="cy-dim">·</span>
            <span>{t('landing.hudSite')}</span>
          </div>
          <div className="cyber-hud-right">
            <span>{t('landing.hudNoAccount')}</span>
            <span className="cy-dim">·</span>
            <span>{t('landing.hudLocal')}</span>
            <span className="cy-dim">·</span>
            <span>{t('landing.hudOpenSource')}</span>
          </div>
          {/* 移动端首屏也能一跳到 X / Discord（大卡被人物图推到下方） */}
          <div className="cyber-hud-social">
            <a href={X_URL} target="_blank" rel="noreferrer" aria-label={t('landing.a11yX')}>
              <XLogo />
            </a>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" aria-label={t('landing.a11yDiscord')}>
              <NavIcon name="discord" />
            </a>
            <a href={X_CHAT_URL} target="_blank" rel="noreferrer" aria-label={t('landing.a11yXChat')}>
              <NavIcon name="chat" />
            </a>
          </div>
        </div>

        {/* Hero：左文案 + 右个人形象 */}
        <section className="cyber-hero">
          <div className="cyber-hero-copy">
            <span className="cyber-eyebrow">{t('landing.eyebrow')}</span>

            <h1 className="cyber-title">
              <span className="cy-line">{t('landing.title1')}</span>
              {/* 标点与词间空格由语言包提供：英文用 ". "，中文不需要空格 */}
              <span className="cy-line">
                {t('landing.title2a')}<span className="cy-accent">{t('landing.title2b')}</span>
              </span>
              <span className="cy-line">
                <span className="cy-glitch" data-text={t('landing.title3')}>
                  {t('landing.title3')}
                </span>
              </span>
            </h1>

            <p className="cyber-subtitle">{t('app.desc')}</p>

            <div className="cyber-cta-row">
              <Link href="/dashboard" className="cyber-btn cyber-btn-primary">
                {returning ? t('landing.ctaResume') : t('landing.ctaStart')} <span aria-hidden="true">↗</span>
              </Link>
              <a href="#memory" className="cyber-btn cyber-btn-ghost">
                {t('landing.ctaHow')} <span aria-hidden="true">↓</span>
              </a>
            </div>

            <div className="cyber-stats">
              <div>
                <span className="cyber-stat-v">06</span>
                <span className="cyber-stat-k">{t('landing.statModules')}</span>
              </div>
              <div>
                <span className="cyber-stat-v">FSRS</span>
                <span className="cyber-stat-k">{t('landing.statFsrs')}</span>
              </div>
              <div>
                <span className="cyber-stat-v">0</span>
                <span className="cyber-stat-k">{t('landing.statAccounts')}</span>
              </div>
            </div>

            {/* 作者 X —— 醒目位之一 */}
            <a href={X_URL} target="_blank" rel="noreferrer" className="cyber-x-card">
              <span className="cyber-x-logo">
                <XLogo />
              </span>
              <span className="cyber-x-body">
                <span className="cyber-x-kicker">{'//'} {t('landing.xKicker')}</span>
                <span className="cyber-x-handle">{X_HANDLE}</span>
                <span className="cyber-x-desc">{t('landing.xDesc')}</span>
              </span>
              <span className="cyber-x-arrow">{t('landing.xFollow')} ↗</span>
            </a>

            {/* 两个社群入口并排，避免三张卡堆叠把首屏撑得过长；完整说明在社区区 */}
            <div className="cyber-hero-socials">
              <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="cyber-discord-card">
                <span className="cyber-discord-icon">
                  <NavIcon name="discord" />
                </span>
                <span className="cyber-discord-body">
                  <span className="cyber-discord-kicker">{'//'} {t('landing.discordKicker')}</span>
                  <span className="cyber-discord-title">{t('landing.discordTitle')}</span>
                  <span className="cyber-discord-desc">{t('landing.discordDesc')}</span>
                </span>
                <span className="cyber-discord-arrow">{t('landing.discordJoin')} ↗</span>
              </a>

              <a href={X_CHAT_URL} target="_blank" rel="noreferrer" className="cyber-xchat-card">
                <span className="cyber-xchat-icon">
                  <XLogo />
                </span>
                <span className="cyber-xchat-body">
                  <span className="cyber-xchat-kicker">{'//'} {t('landing.xChatKicker')}</span>
                  <span className="cyber-xchat-title">{t('landing.xChatTitle')}</span>
                  <span className="cyber-xchat-desc">{t('landing.xChatDesc')}</span>
                </span>
                <span className="cyber-xchat-arrow">{t('landing.xChatJoin')} ↗</span>
              </a>
            </div>
          </div>

          <div className="cyber-figure">
            <div className="cyber-figure-glow" />
            <div className="cyber-figure-ring" />
            <Image
              src="/brand/coder-trainer-cutout.png"
              alt={t('landing.a11yFigure')}
              width={687}
              height={1024}
              priority
              className="cyber-figure-img"
            />
            <div className="cyber-scanlines" />
            <span className="cyber-figure-corner cyber-corner-tl" />
            <span className="cyber-figure-corner cyber-corner-tr" />
            <span className="cyber-figure-corner cyber-corner-bl" />
            <span className="cyber-figure-corner cyber-corner-br" />
            <span className="cyber-figure-tag cyber-tag-a">{t('landing.figureId')}</span>
            <span className="cyber-figure-tag cyber-tag-b">{t('landing.figureStatus')}</span>
            <span className="cyber-figure-tag cyber-tag-c">{t('landing.figureBuild')}</span>
          </div>
        </section>

        {/* FSRS 记忆法原理：引导页的主角内容，紧跟 Hero */}
        <MemoryEngine />

        {/* 产品功能 */}
        <section className="cyber-section" id="features">
          <div className="cyber-section-head">
            <div className="cyber-kicker">{'//'} 02 · {t('landing.featuresKicker')}</div>
            <h2 className="cyber-section-title">{t('landing.featuresTitle')}</h2>
            <p className="cyber-section-desc">{t('home.subtitle')}</p>
          </div>
          <div className="cyber-features">
            {features.map(f => (
              <div className="cyber-feature" key={f.no}>
                <div className="cyber-feature-top">
                  <span className="cyber-feature-icon">
                    <NavIcon name={f.icon} />
                  </span>
                  <span className="cyber-feature-no">[{f.no}]</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="cyber-feature-tag">{f.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 社区 + 作者 X —— 醒目位之二 */}
        <section className="cyber-section" id="community">
          <div className="cyber-section-head">
            <div className="cyber-kicker">{'//'} 03 · {t('landing.communityKicker')}</div>
            <h2 className="cyber-section-title">{t('landing.communityTitle')}</h2>
            <p className="cyber-section-desc">{t('community.desc')}</p>
          </div>
          <div className="cyber-social">
            {socials.map(s => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className={`cyber-social-card${s.href === DISCORD_URL ? ' is-discord' : ''}${s.href === X_CHAT_URL ? ' is-xchat' : ''}`}
              >
                <span className="cyber-social-mark">
                  {s.icon === 'text' ? s.mark : <NavIcon name={s.icon} />}
                </span>
                <span>
                  <span className="cyber-social-name">
                    {s.name}
                    {(s.href === DISCORD_URL || s.href === X_CHAT_URL) && (
                      <span className="cyber-social-badge">{t('landing.badgeJoin')}</span>
                    )}
                  </span>
                  <span className="cyber-social-desc" style={{ display: 'block' }}>
                    {s.desc}
                  </span>
                </span>
                <span className="cyber-social-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}

            <a
              href="/decks/TypingChinese-HSK.apkg"
              download="TypingChinese-HSK.apkg"
              className="cyber-social-card is-anki"
            >
              <span className="cyber-social-mark">⚡</span>
              <span>
                <span className="cyber-social-name">
                  Anki Deck (HSK 1-6)
                  <span className="cyber-social-badge" style={{ background: '#22c55e', color: '#000' }}>
                    Download .apkg
                  </span>
                </span>
                <span className="cyber-social-desc" style={{ display: 'block' }}>
                  5,004 flashcards with pinyin, tones & definitions
                </span>
              </span>
              <span className="cyber-social-arrow" aria-hidden="true">
                ↓
              </span>
            </a>

            <a href={X_URL} target="_blank" rel="noreferrer" className="cyber-x-wide">
              <span className="cyber-x-logo">
                <XLogo />
              </span>
              <span className="cyber-x-body">
                <span className="cyber-x-kicker">{'//'} {t('landing.xWideKicker')}</span>
                <span className="cyber-x-handle">{X_HANDLE}</span>
                <span className="cyber-x-desc">{t('landing.xWideDesc')}</span>
              </span>
              <span className="cyber-x-arrow">{t('landing.xFollow')} ↗</span>
            </a>
          </div>
        </section>

        <div className="cyber-footer">
          <span>{'//'} {t('landing.footerEnd')}</span>
          <span>{t('landing.footerSite')}</span>
          <Link href="/dashboard" className="cyber-footer-link">
            {t('landing.footerDashboard')} ↗
          </Link>
          <span>{t('landing.footerStatus')}</span>
        </div>
      </div>
    </div>
  )
}
