'use client'

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import type { Locale } from '@/lib/types'
import { useSettingStore } from '@/lib/store/setting'
import { en, type Messages } from './messages/en'
import { zhCN } from './messages/zh-CN'
import { zhTW } from './messages/zh-TW'
import { es } from './messages/es'
import { pt } from './messages/pt'
import { fr } from './messages/fr'
import { de } from './messages/de'
import { ru } from './messages/ru'
import { uk } from './messages/uk'
import { id as idMsgs } from './messages/id'
import { vi } from './messages/vi'
import { ja } from './messages/ja'
import { ko } from './messages/ko'
import { th } from './messages/th'

/**
 * 已支持的语言；加语言 = 加语言包 + 在这里登记一行。
 * label 用语言自己的名字，用户不懂当前界面语言时也能认出。
 */
export const LOCALES: { code: Locale; label: string; htmlLang: string }[] = [
  { code: 'en', label: 'English', htmlLang: 'en' },
  { code: 'zh-CN', label: '简体中文', htmlLang: 'zh-CN' },
  { code: 'zh-TW', label: '繁體中文', htmlLang: 'zh-TW' },
  { code: 'es', label: 'Español', htmlLang: 'es' },
  { code: 'pt', label: 'Português', htmlLang: 'pt' },
  { code: 'fr', label: 'Français', htmlLang: 'fr' },
  { code: 'de', label: 'Deutsch', htmlLang: 'de' },
  { code: 'ru', label: 'Русский', htmlLang: 'ru' },
  { code: 'uk', label: 'Українська', htmlLang: 'uk' },
  { code: 'id', label: 'Bahasa Indonesia', htmlLang: 'id' },
  { code: 'vi', label: 'Tiếng Việt', htmlLang: 'vi' },
  { code: 'ja', label: '日本語', htmlLang: 'ja' },
  { code: 'ko', label: '한국어', htmlLang: 'ko' },
  { code: 'th', label: 'ไทย', htmlLang: 'th' },
]

const PACKS: Record<Locale, Messages> = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  es,
  pt,
  fr,
  de,
  ru,
  uk,
  id: idMsgs,
  vi,
  ja,
  ko,
  th,
}

/** 由语言包结构推导出「a.b.c」形式的 key 联合类型，写错 key 直接编译报错 */
type Join<K extends string, P extends string> = `${K}.${P}`
type Leaves<T> = {
  [K in keyof T & string]-?: T[K] extends string ? K : Join<K, Leaves<T[K]>>
}[keyof T & string]

export type MessageKey = Leaves<Messages>
export type TFn = (key: MessageKey, params?: Record<string, string | number>) => string

interface I18nValue {
  locale: Locale
  t: TFn
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nValue>({
  locale: 'en',
  t: key => key,
  setLocale: () => {},
})

function lookup(pack: Messages, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>(
    (acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined),
    pack
  )
  return typeof value === 'string' ? value : undefined
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (_m, name: string) => (name in params ? String(params[name]) : `{${name}}`))
}

function htmlLangOf(locale: Locale): string {
  return LOCALES.find(l => l.code === locale)?.htmlLang ?? 'en'
}

/** 按浏览器语言挑一个已支持的语言；只用于首次访问 */
function detectLocale(language: string): Locale | undefined {
  const lower = language.toLowerCase()
  const exact = LOCALES.find(l => l.code.toLowerCase() === lower)
  if (exact) return exact.code
  const main = lower.split('-')[0]
  return LOCALES.find(l => l.code.toLowerCase().split('-')[0] === main)?.code
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSettingStore(s => s.lang)
  const detected = useSettingStore(s => s.langDetected)
  const patch = useSettingStore(s => s.patch)

  // 首次访问跟着浏览器语言走一次，之后以用户在设置页的选择为准
  useEffect(() => {
    if (detected) return
    const hit = typeof navigator === 'undefined' ? undefined : detectLocale(navigator.language)
    patch({ lang: hit ?? locale, langDetected: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detected])

  // html lang 跟随界面语言（TTS 的发音语言是显式指定的 zh-CN，不受影响）
  useEffect(() => {
    document.documentElement.lang = htmlLangOf(locale)
    document.title = lookup(PACKS[locale] ?? en, 'app.title') ?? document.title
  }, [locale])

  const value = useMemo<I18nValue>(() => {
    const pack = PACKS[locale] ?? en
    return {
      locale,
      t: ((key: MessageKey, params?: Record<string, string | number>) => {
        const text = lookup(pack, key) ?? lookup(en, key) ?? key
        return interpolate(text, params)
      }) as TFn,
      setLocale: next => patch({ lang: next, langDetected: true }),
    }
  }, [locale, patch])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  return useContext(I18nContext)
}
