/**
 * 对关键页面逐个请求编入索引（GSC 网址检查 → REQUEST INDEXING）。
 * 部署文档明确推荐：手动请求能把首次收录从数周缩到数天。
 * 只读 + 请求抓取，不改站点内容。注意 GSC 对单日请求数有限额，别一次塞太多。
 */
import { openBrowser, wait, bringFront } from './browser.mjs'

const RID = 'https://www.typingchinese.club/'
const URLS = (process.env.URLS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const DEFAULT = [
  'https://www.typingchinese.club/',
  'https://www.typingchinese.club/pinyin',
  'https://www.typingchinese.club/hsk/3',
  'https://www.typingchinese.club/write/%E4%BD%A0',
  'https://www.typingchinese.club/region/JP',
]
const list = URLS.length ? URLS : DEFAULT

const { ctx, page } = await openBrowser({ title: 'GSC request indexing' })
await bringFront(page, 'GSC · request indexing')

for (const url of list) {
  console.log(`\n========== ${url} ==========`)
  try {
    await page.goto(`https://search.google.com/search-console/index?resource_id=${encodeURIComponent(RID)}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await wait(5000)
    const input = page.locator('input[aria-label*="Inspect any URL" i]').first()
    if (!(await input.count())) { console.log('  未找到输入框，跳过'); continue }
    await input.click()
    await input.fill(url)
    await page.keyboard.press('Enter')
    await wait(10000)

    // 先看是否已在索引里；不在则请求收录
    let flat = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ')
    if (/URL is on Google/i.test(flat)) {
      console.log('  已在 Google 索引中')
      continue
    }
    const btn = page.getByRole('button', { name: /request indexing/i }).first()
    if (await btn.count()) {
      await btn.click()
      await wait(8000)
      flat = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ')
      if (/Indexing requested|已被请求|requested/i.test(flat)) console.log('  ✓ 已请求编入索引')
      else console.log('  ? 已点击，但未见明确确认文案')
    } else {
      console.log('  未找到 REQUEST INDEXING 按钮（可能已在队列中）')
    }
  } catch (e) {
    console.log('  异常:', e.message.slice(0, 120))
  }
}

await ctx.close()
console.log('\n=== 完成 ===')
