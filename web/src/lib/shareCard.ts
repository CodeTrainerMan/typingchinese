/**
 * 结算页分享卡：用 canvas 画一张成绩图并下载 PNG。
 * 纯本地生成，不引第三方库、也不走服务端；只在用户点击时调用，SSR 安全。
 */

export interface ShareData {
  /** 词库名（或错词本 / 收藏本标题） */
  title: string
  accuracy: number
  /** 已带单位的速度文案，如 "42 keys/min" */
  speed: string
  seconds: number
  words: number
  /** YYYY-MM-DD，同时用作文件名 */
  date: string
}

const BRAND = '#2563eb'
const INK = '#1f2328'
const DIM = '#6b7280'
const FONT = 'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'

/** 手写圆角矩形：roundRect 在旧 Safari 上没有 */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export async function downloadShareCard(data: ShareData): Promise<boolean> {
  const w = 720
  const h = 420
  const dpr = Math.min(2, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)
  const canvas = document.createElement('canvas')
  canvas.width = w * dpr
  canvas.height = h * dpr
  const ctx = canvas.getContext('2d')
  if (!ctx) return false
  ctx.scale(dpr, dpr)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = BRAND
  roundRect(ctx, 0, 0, w, 6, 3)
  ctx.fill()

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = BRAND
  ctx.font = `600 20px ${FONT}`
  ctx.fillText('TypingChinese', 40, 52)

  ctx.fillStyle = DIM
  ctx.font = `16px ${FONT}`
  // 标题过长时截断，免得顶到右侧
  ctx.fillText(data.title.length > 22 ? `${data.title.slice(0, 22)}…` : data.title, 40, 82)

  // 主指标：正确率
  ctx.fillStyle = INK
  ctx.font = `700 72px ${FONT}`
  ctx.fillText(`${data.accuracy}%`, 40, 200)
  ctx.fillStyle = DIM
  ctx.font = `15px ${FONT}`
  ctx.fillText('Accuracy', 42, 228)

  // 三个副指标
  const cols: [string, string][] = [
    ['Speed', data.speed],
    ['Time', `${Math.round(data.seconds)}s`],
    ['Words', `${data.words}`],
  ]
  cols.forEach(([label, value], i) => {
    const x = 40 + i * 180
    ctx.fillStyle = DIM
    ctx.font = `13px ${FONT}`
    ctx.fillText(label, x, 300)
    ctx.fillStyle = INK
    ctx.font = `600 22px ${FONT}`
    ctx.fillText(value, x, 330)
  })

  ctx.fillStyle = DIM
  ctx.font = `13px ${FONT}`
  ctx.fillText(`www.typingchinese.club · ${data.date}`, 40, 386)

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (!blob) {
        resolve(false)
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `typingchinese-${data.date}.png`
      a.click()
      URL.revokeObjectURL(url)
      resolve(true)
    }, 'image/png')
  })
}
