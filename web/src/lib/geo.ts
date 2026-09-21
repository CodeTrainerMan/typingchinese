import type { Locale } from './types'

/**
 * 访客地区 → 推荐界面语言。
 *
 * 用两层探测，谁先拿到用谁：
 *  1. IP 定位（ipapi.co，免费、支持 CORS），能拿到真实国家码，最准；
 *  2. 浏览器时区回退（Intl，零网络、零延迟），IP 请求失败/超时也能用。
 *
 * 拿到国家码后映射到界面语言：中文地区给中文，主要学习中文的语种国家给母语界面，
 * 其余（包括所有非中文英语国家）统一回退英文——产品面向中文学习者，英语是通用语。
 */

const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  CN: 'zh-CN', HK: 'zh-TW', TW: 'zh-TW', MO: 'zh-TW',
  JP: 'ja', KR: 'ko', RU: 'ru', UA: 'uk',
  FR: 'fr', DE: 'de', ES: 'es', PT: 'pt',
  TH: 'th', VN: 'vi', ID: 'id',
}

/** 用 IANA 时区粗估国家（一个大国有多时区，但足够区分中/非中） */
function localeFromTimeZone(tz: string | undefined): Locale | null {
  if (!tz) return null
  if (tz.startsWith('Asia/Shanghai') || tz.startsWith('Asia/Chongqing')) return 'zh-CN'
  if (tz.startsWith('Asia/Taipei') || tz.startsWith('Asia/Hong_Kong')) return 'zh-TW'
  if (tz.startsWith('Asia/Tokyo')) return 'ja'
  if (tz.startsWith('Asia/Seoul')) return 'ko'
  if (tz.startsWith('Europe/Moscow')) return 'ru'
  if (tz.startsWith('Europe/Kyiv') || tz.startsWith('Europe/Kiev')) return 'uk'
  if (tz.startsWith('Europe/Paris')) return 'fr'
  if (tz.startsWith('Europe/Berlin') || tz.startsWith('Europe/Zurich')) return 'de'
  if (tz.startsWith('Europe/Madrid')) return 'es'
  if (tz.startsWith('Europe/Lisbon')) return 'pt'
  if (tz.startsWith('Asia/Bangkok')) return 'th'
  if (tz.startsWith('Asia/Ho_Chi_Minh')) return 'vi'
  if (tz.startsWith('Asia/Jakarta')) return 'id'
  // 其余（北美、拉美、大洋洲、非洲等）一律英文
  return 'en'
}

/** 探测访客国家码，失败返回 null */
async function detectCountry(): Promise<string | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 3000)
    const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    const data = (await res.json()) as { country_code?: string }
    return data.country_code ?? null
  } catch {
    return null
  }
}

/**
 * 推荐给当前访客的界面语言；拿不到任何地区信号时返回 null（交给调用方保持默认）。
 */
export async function recommendLocale(): Promise<Locale | null> {
  const cc = await detectCountry()
  if (cc && COUNTRY_TO_LOCALE[cc]) return COUNTRY_TO_LOCALE[cc]
  // IP 拿不到或不在表里，用时区兜底
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const fromTz = localeFromTimeZone(tz)
  return fromTz ?? null
}
