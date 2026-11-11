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
/** 全站默认图 public/og.png 实际为 2400×1260（2 倍图），声明需与文件一致 */
export const OG_IMAGE = {
  url: '/og.png',
  width: 2400,
  height: 1260,
  alt: 'TypingChinese · Learn Chinese by Typing',
} as const

/** 全站默认分享图（openGraph.images 用） */
export const ogImages = [OG_IMAGE]

/** 全站默认分享图（twitter.images 只要 url 字符串） */
export const twitterImages = [OG_IMAGE.url]

/**
 * 页面专属分享卡（课程卡 /og/course-<slug>.png，由 scripts/generate-course-og.py 生成）。
 * 新增课程后必须重跑该脚本，否则这里会指向 404 —— 该脚本会校验 slug 一致性。
 * 课程卡固定 1200×630，与默认图的 2400×1260 不同，所以不复用 OG_IMAGE 的尺寸。
 */
export function ogImageFor(path: string) {
  return [{ url: path, width: 1200, height: 630, alt: 'TypingChinese lesson card' }]
}

export function twitterImageFor(path: string) {
  return [path]
}
