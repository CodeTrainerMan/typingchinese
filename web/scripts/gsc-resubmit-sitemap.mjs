/**
 * 修复卡住的 sitemap：删除旧条目 → 重新提交 → 读回状态。
 * 背景：sitemap.xml 实时测试 "URL is available" 可正常抓取，但 sitemap 报告仍停在
 * Oct 2 的 "Couldn't fetch"（Google 未重新读取）。删除重加是官方推荐的强制重读方式，
 * 只影响 sitemap 条目本身，不影响任何已收录页面。
 */
import { openBrowser, wait, bringFront } from './browser.mjs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '..', 'ref', 'gsc-resubmit.png')

const RID = 'https://www.typingchinese.club/'
const SITEMAP_PATH = 'sitemap.xml'

const { ctx, page } = await openBrowser({ title: 'GSC resubmit' })
await bringFront(page, 'GSC · resubmit sitemap')

const readRows = async (tag) => {
  const rows = await page.locator('table tr, [role=row]').allInnerTexts().catch(() => [])
  console.log(`\n===== ${tag} =====`)
  rows.forEach((r, i) => console.log(`[${i}] ${r.replace(/\n/g, ' | ')}`))
  return rows
}

await page.goto(`https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(RID)}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
await wait(6000)
await readRows('操作前')

// 1) 删除旧条目：定位 /sitemap.xml 所在行，点行内菜单，选 Remove/Delete
let removed = false
try {
  const row = page.locator('tr', { hasText: SITEMAP_PATH }).first()
  if (await row.count()) {
    const btns = row.locator('button')
    const n = await btns.count()
    console.log(`\n行内按钮数: ${n}`)
    for (let i = n - 1; i >= 0; i--) {
      const b = btns.nth(i)
      const label = (await b.getAttribute('aria-label').catch(() => '')) || ''
      const txt = (await b.innerText().catch(() => '')).trim()
      if (/more|option|menu|remove|delete/i.test(label + ' ' + txt)) {
        console.log(`点击行内按钮[${i}] label="${label}" text="${txt}"`)
        await b.click()
        await wait(1500)
        const item = page.getByRole('menuitem', { name: /remove|delete/i }).first()
        if (await item.count()) {
          await item.click()
          console.log('已点击 Remove/Delete 菜单项')
        } else {
          const anyItem = page.locator('[role=menuitem], li').filter({ hasText: /remove|delete/i }).first()
          if (await anyItem.count()) { await anyItem.click(); console.log('已点击(兜底) Remove/Delete') }
        }
        await wait(4000)
        removed = true
        break
      }
    }
  } else {
    console.log('\n未找到 sitemap 行（可能已被删除）')
  }
} catch (e) {
  console.log('\n删除步骤异常:', e.message)
}
console.log('删除结果:', removed ? '已触发' : '未能自动删除')

await readRows('删除后')

// 2) 重新提交
const input = page.locator('input[aria-label*="sitemap" i]').first()
if (await input.count()) {
  await input.click()
  await input.fill(SITEMAP_PATH)
  await wait(500)
  const submit = page.getByRole('button', { name: /^submit$/i }).first()
  if (await submit.count()) {
    await submit.click()
    console.log('\n已重新提交:', SITEMAP_PATH)
    await wait(12000)
  } else {
    console.log('\n未找到 SUBMIT 按钮')
  }
} else {
  console.log('\n未找到 sitemap 输入框')
}

await readRows('重新提交后')
await page.screenshot({ path: OUT, fullPage: true })
console.log('\n截图:', OUT)
await ctx.close()
console.log('=== 完成 ===')
