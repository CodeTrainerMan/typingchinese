/**
 * 渠道归因：记住用户是从哪个渠道第一次进来的。
 *
 * UTM 只在落地页 URL 上，点进 /practice 之后就丢了，所以首次访问时把它存下来，
 * 之后上报「完成第一组练习」时带上，才能判断哪个渠道真的带来了练习量而不是点击量。
 */

const STORAGE_KEY = 'tc_attribution'

export interface Attribution {
  source: string
  medium: string
  campaign: string
  /** 首次进入的落地页路径 */
  path: string
  at: string
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 隐私模式下写不进去就算了，不影响练习
  }
}

/** 首次访问时调用：只要 URL 带过 utm_*，就以第一次为准，后续直接访问不覆盖 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return
  if (safeGet(STORAGE_KEY)) return

  const q = new URLSearchParams(window.location.search)
  const source = q.get('utm_source') || ''
  if (!source) return // 自然流量不记，避免把 direct 当成渠道

  safeSet(
    STORAGE_KEY,
    JSON.stringify({
      source,
      medium: q.get('utm_medium') || '',
      campaign: q.get('utm_campaign') || '',
      path: window.location.pathname,
      at: new Date().toISOString().slice(0, 10),
    } satisfies Attribution)
  )
}

/** 上报时读取；没有归因数据时返回 source='direct' */
export function getAttribution(): Attribution {
  const raw = safeGet(STORAGE_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as Attribution
    } catch {
      // 数据坏了就当没有
    }
  }
  return { source: 'direct', medium: '', campaign: '', path: '', at: '' }
}
