/**
 * 社交分享图（og:image / twitter:image）统一出口。
 *
 * 关键背景：Next.js 的 metadata 是顶层整体替换——子页面一旦自定义了
 * openGraph / twitter，layout 里的默认 images 就会被整个丢弃。
 * 「课程页分享到 X 没有配图」就是这个原因。因此每个自定义 metadata
 * 的页面都必须显式带上 images，不能依赖 layout 继承。
 *
 * X 对同一 URL 的抓取结果有缓存：更新图片后重新分享时，
 * 在链接后加 ?v=2 之类的参数可强制重新抓取。
 */
export const OG_IMAGE = {
  url: '/og.png',
  width: 1200,
  height: 630,
  alt: 'TypingChinese · Learn Chinese by Typing',
} as const

/** 全站默认分享图（openGraph.images 用） */
export const ogImages = [OG_IMAGE]

/** 全站默认分享图（twitter.images 只要 url 字符串） */
export const twitterImages = [OG_IMAGE.url]

/** 页面专属分享卡（如课程卡 /og/course-<slug>.png） */
export function ogImageFor(path: string) {
  return [{ ...OG_IMAGE, url: path, alt: 'TypingChinese lesson card' }]
}

export function twitterImageFor(path: string) {
  return [path]
}
