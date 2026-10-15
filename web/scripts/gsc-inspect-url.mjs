/**
 * 只读诊断：用 GSC 的「网址检查」对指定 URL 跑实时测试，看 Googlebot 实际看到什么。
 * 用来定位 sitemap 一直 "Couldn't fetch" 的真实原因（抓取被挡 / 重定向 / 服务器错误 / 正常）。
 */
import { openBrowser, wait, bringFront } from './browser.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '..', 'ref', 'gsc-inspect-url.png')

const TARGET = process.env.URL || 'https://www.typingchinese.club/sitemap.xml'
const RID = 'https://www.typingchinese.club/'

const { ctx, page } = await openBrowser({ title: 'GSC inspect url' })
await bringFront(page, 'GSC · URL inspection')

await page.goto(`https://search.google.com/search-console/index?resource_id=${encodeURIComponent(RID)}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
await wait(6000)

// 顶部「检查任意网址」输入框
const input = page.locator('input[aria-label*="Inspect any URL" i]').first()
if (!(await input.count())) {
  console.log('!! 未找到网址检查输入框')
  await ctx.close()
  process.exit(1)
}
await input.click()
await input.fill(TARGET)
await page.keyboard.press('Enter')
console.log('已提交检查:', TARGET)
await wait(9000)

// 结果面板文本
const readPane = async (tag) => {
  const t = await page.locator('body').innerText().catch(() => '')
  const flat = t.replace(/\s+/g, ' ')
  console.log(`\n===== ${tag} =====`)
  const keys = [
    'URL is available to Google', 'URL is not available to Google',
    'Crawl allowed', 'Indexing allowed', 'Crawled', 'Couldn',
    'Live test', 'Redirect', 'Blocked', 'not found', 'server error',
    'Submitted URL', 'User-declared canonical', 'Google-selected canonical',
  ]
  for (const k of keys) {
    const i = flat.indexOf(k)
    if (i >= 0) console.log(`  · ${flat.slice(i, i + 160)}`)
  }
  return flat
}

let flat = await readPane('首次结果')

// 若存在「实时测试」按钮，点它跑一次真实的 Googlebot 抓取
const live = page.getByRole('button', { name: /test live|live test/i }).first()
if (await live.count()) {
  console.log('\n>>> 发现「实时测试」按钮，点击…')
  await live.click().catch(() => {})
  await wait(15000)
  flat = await readPane('实时测试结果')
} else {
  console.log('\n（未发现实时测试按钮，可能已自动跑）')
}

await page.screenshot({ path: OUT, fullPage: true })
console.log('\n截图:', OUT)
await ctx.close()
console.log('=== 完成 ===')
