/**
 * 生成 Product Hunt 封面图（1270×760，PH 官方推荐尺寸）。
 *
 * 用本机 Chrome 渲染一段内联 HTML 再截图，中文字体走系统字体。
 * 用法：node scripts/ph-cover.mjs   →   产出 public/ph-cover.png
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const EXE = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1270px; height: 760px; overflow: hidden;
    background: #17181b;
    font-family: system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
    color: #f5f5f4;
    display: flex; align-items: center;
  }
  .wrap { display: flex; width: 100%; padding: 0 72px; gap: 56px; align-items: center; }
  .left { flex: 1; min-width: 0; }
  .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 38px; }
  .dot { width: 38px; height: 38px; border-radius: 12px; background: #2563eb; }
  .brandname { font-size: 30px; font-weight: 600; letter-spacing: -0.01em; }
  h1 { font-size: 64px; line-height: 1.08; font-weight: 700; letter-spacing: -0.025em; }
  h1 em { color: #93ade3; font-style: normal; }
  .sub { margin-top: 24px; font-size: 24px; line-height: 1.5; color: #a8a29e; max-width: 580px; }
  .badges { margin-top: 38px; display: flex; gap: 12px; flex-wrap: wrap; }
  .badge {
    font-size: 19px; padding: 10px 18px; border-radius: 999px;
    background: #292a2d; color: #d6d3d1; border: 1px solid #35373a;
  }
  .foot { margin-top: 42px; font-size: 22px; color: #8f8f8f; }
  .right { width: 480px; flex: none; }
  .card {
    background: #fff; border-radius: 20px; padding: 38px 40px;
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
  }
  .hz { font-size: 100px; line-height: 1.15; color: #2e2e2e; letter-spacing: 0.06em; }
  .py { margin-top: 18px; font-size: 42px; color: #2563eb; font-weight: 600; }
  .tr { margin-top: 10px; font-size: 25px; color: #818181; }
  .typed { margin-top: 34px; display: flex; gap: 8px; }
  .typed span {
    width: 34px; height: 56px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; background: #eaf0ff; color: #16a34a; font-weight: 700;
    font-family: ui-monospace, Consolas, monospace; font-size: 36px;
  }
  .meta {
    margin-top: 26px; padding-top: 18px; border-top: 1px solid #e6e4e1;
    display: flex; justify-content: space-between; font-size: 19px; color: #818181;
  }
  .meta b { color: #16a34a; font-weight: 600; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="left">
      <div class="brand"><div class="dot"></div><div class="brandname">TypingChinese</div></div>
      <h1>Type the pinyin.<br /><em>Keep the word.</em></h1>
      <p class="sub">
        See the hanzi, type the pinyin, get graded letter by letter. Words you miss
        go into a mistake book and come back on an FSRS schedule.
      </p>
      <div class="badges">
        <span class="badge">HSK 1–6 · 5,154 words</span>
        <span class="badge">No account</span>
        <span class="badge">No ads</span>
        <span class="badge">Open source</span>
        <span class="badge">14 UI languages</span>
      </div>
      <div class="foot">typingchinese.club</div>
    </div>
    <div class="right">
      <div class="card">
        <div class="hz">世界</div>
        <div class="py">shì jiè</div>
        <div class="tr">world</div>
        <div class="typed">
          <span>s</span><span>h</span><span>i</span><span>j</span><span>i</span><span>e</span>
        </div>
        <div class="meta">
          <span>HSK 3 · Step 1/3 · Follow</span>
          <span>Accuracy <b>100%</b></span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`

const browser = await chromium.launch({ executablePath: EXE })
const page = await browser.newPage({ viewport: { width: 1270, height: 760 }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'load' })
await page.waitForTimeout(400)

// 尺寸自检：任何元素超出画布都会让 PH 上的封面被裁掉
const report = await page.evaluate(() => {
  const out = {}
  for (const sel of ['body', '.wrap', '.left', '.right', 'h1', '.sub', '.badges', '.foot', '.card']) {
    const el = document.querySelector(sel)
    const r = el.getBoundingClientRect()
    out[sel] = { w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) }
  }
  out.overflowX = document.documentElement.scrollWidth - 1270
  out.overflowY = document.documentElement.scrollHeight - 760
  return out
})
console.log(JSON.stringify(report, null, 1))

await page.screenshot({ path: 'public/ph-cover.png' })

// PH 还要求一张方形 logo（≥80×80，这里给 240×240），白底 + 浅色模式下的键帽图标
const iconSvg = readFileSync('src/app/icon.svg', 'utf-8')
const iconPage = await browser.newPage({ viewport: { width: 240, height: 240 }, deviceScaleFactor: 1 })
await iconPage.setContent(
  `<!doctype html><html><head><meta charset="utf-8"><style>
     html,body{margin:0;width:240px;height:240px;background:#fff;display:flex;align-items:center;justify-content:center}
     svg{width:186px;height:186px}
   </style></head><body>${iconSvg}</body></html>`,
  { waitUntil: 'load' }
)
await iconPage.waitForTimeout(300)
await iconPage.screenshot({ path: 'public/ph-icon.png' })
await browser.close()
console.log('written public/ph-cover.png, public/ph-icon.png')
