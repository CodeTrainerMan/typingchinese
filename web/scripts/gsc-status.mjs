/**
 * 只读：查看 GSC 里 sitemap 的抓取状态（不提交、不改任何东西）
 * 关注：Status（是否还卡在 Couldn't fetch）、Last read、Discovered pages
 */
import { openBrowser, wait, bringFront } from './browser.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '..', 'ref', 'gsc-status.png')

const RID = 'https://www.typingchinese.club/'
const { ctx, page } = await openBrowser({ title: 'GSC status' })
await bringFront(page, 'GSC · sitemap status')

await page.goto(`https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(RID)}`, { waitUntil: 'domcontentloaded' })
await wait(5000)

const rows = await page.locator('table tr, [role=row]').allInnerTexts().catch(() => [])
console.log('========== Sitemap 状态 ==========')
if (!rows.length) console.log('（未读到表格行）')
rows.forEach((r, i) => console.log(`[${i}] ${r.replace(/\n/g, ' | ')}`))

// 顺便看「已编入索引」的概览数字（Pages 报告入口）
await page.goto(`https://search.google.com/search-console/index?resource_id=${encodeURIComponent(RID)}`, { waitUntil: 'domcontentloaded' })
await wait(5000)
const idxText = await page.locator('body').innerText().catch(() => '')
const head = idxText.replace(/\s+/g, ' ').slice(0, 400)
console.log('\n========== Pages（索引）概览 ==========')
console.log(head || '(空)')

await page.screenshot({ path: OUT, fullPage: true })
console.log('\n截图:', OUT)
await ctx.close()
console.log('=== 完成 ===')
