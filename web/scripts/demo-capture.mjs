/**
 * 录制演示动图素材：首页 → 选 HSK 1 → 跟打 5 个词。
 *
 * 产出 webm 到 scripts/.tmp-video/，再用 ffmpeg 转 GIF（见 demo-gif.sh）。
 * 用本机 Chrome，不下载 Playwright 自带浏览器。
 *
 * 用法：node scripts/demo-capture.mjs
 */
import { chromium } from 'playwright'
import { readFileSync, readdirSync, rmSync, mkdirSync } from 'node:fs'

const EXE = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
const BASE = process.env.DEMO_BASE ?? 'https://www.typingchinese.club'
const W = 1100
const H = 700
const VIDEO_DIR = 'scripts/.tmp-video'
const WORDS = Number(process.env.DEMO_WORDS ?? 5)

rmSync(VIDEO_DIR, { recursive: true, force: true })
mkdirSync(VIDEO_DIR, { recursive: true })

// 汉字 → 去声调拼音，作为"标准答案"输入（页面显示的字母带声调，不能直接敲）
const flatByWord = new Map()
for (const id of ['daily', 'advanced', 'idiom', 'hsk1', 'hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6']) {
  const d = JSON.parse(readFileSync(`public/dicts/${id}.json`, 'utf-8'))
  for (const w of d.words) flatByWord.set(w.word, w.flat)
}

const browser = await chromium.launch({ executablePath: EXE })
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  locale: 'en-US',
  recordVideo: { dir: VIDEO_DIR, size: { width: W, height: H } },
})
const page = await ctx.newPage()
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))

const log = (...a) => console.log(...a)
const wait = (ms) => page.waitForTimeout(ms)

await page.goto(BASE, { waitUntil: 'domcontentloaded' })
await wait(2000)
log('STEP home')

// 词库页：优先点导航，失败就直跳
try {
  await page.getByRole('link', { name: /word lists/i }).first().click()
  await wait(1600)
} catch {
  await page.goto(`${BASE}/dicts`, { waitUntil: 'domcontentloaded' })
  await wait(1600)
}
log('STEP dicts url=', page.url())

// 新环境没有任何词库，先在 /dicts 把 HSK 三级加进学习列表
// 卡片顺序：日常、进阶、成语、HSK 一~六级 → HSK 三级是第 6 张卡（Add 按钮下标 5）
await page.getByText('HSK 三级').first().waitFor({ timeout: 8000 })
const addButtons = page.getByRole('button', { name: /^Add$/ })
const hsk3Add = addButtons.nth(5)
await hsk3Add.scrollIntoViewIfNeeded()
await hsk3Add.click()
await wait(1500)
log('STEP added hsk3')
// 进练习页
try {
  await page.getByRole('link', { name: /^Practice$/ }).first().click()
} catch {
  await page.goto(`${BASE}/practice`, { waitUntil: 'domcontentloaded' })
}
await wait(3000)
log('STEP practice url=', page.url())
log('  body=', JSON.stringify((await page.locator('body').innerText()).slice(0, 300)))

for (let i = 0; i < WORDS; i++) {
  const hanzi = (await page.locator('.font-hanzi').first().innerText().catch(() => '')) || ''
  const key = hanzi.replace(/\s+/g, '')
  const flat = flatByWord.get(key)
  log(`WORD ${i}: hanzi=${key} flat=${flat}`)
  if (!flat) {
    await wait(1200)
    continue
  }
  for (const ch of flat) {
    await page.keyboard.press(ch)
    await wait(120)
  }
  await wait(350)
  await page.keyboard.press('Enter')
  await wait(1100)
}

await wait(2000)
log('STEP done')
await ctx.close()
await browser.close()
log('VIDEO FILES:', JSON.stringify(readdirSync(VIDEO_DIR)))
