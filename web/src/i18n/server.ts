/**
 * 服务端取文案（SSR 用，爬虫可读）。
 *
 * i18n/index.tsx 是 'use client' 的 provider，服务端组件不能 import 它。
 * 这里独立导出纯数据的取值函数，供 geo 等需要「按 locale 服务端渲染」的页面使用。
 */
import type { Locale } from '@/lib/types'
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

const PACKS: Record<string, Messages> = {
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

function lookup(pack: Messages, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>(
    (acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined),
    pack,
  )
  return typeof value === 'string' ? value : undefined
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (_m, name: string) => (name in params ? String(params[name]) : `{${name}}`))
}

/** 服务端取文案：缺失 key 回退英文。 */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const text = lookup(PACKS[locale] ?? en, key) ?? lookup(en, key) ?? key
  return interpolate(text, params)
}

const HTML_LANG: Record<string, string> = {
  en: 'en',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  de: 'de',
  ru: 'ru',
  uk: 'uk',
  id: 'id',
  vi: 'vi',
  ja: 'ja',
  ko: 'ko',
  th: 'th',
}

export function htmlLangOf(locale: Locale): string {
  return HTML_LANG[locale] ?? 'en'
}
