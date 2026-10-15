/**
 * 只读：用会话内 JSON 接口搜索"打字/输入法/拼音键盘"类真实提问
 * （DOM 抓不到搜索结果页，JSON 更可靠；走浏览器会话，不会被数据中心 IP 403）
 * 目的：找到能真诚回答的问题（答题优先，回答里不贴链接）
 */
import { openBrowser, wait } from './browser.mjs'

const SUBS = ['Chinese', 'ChineseLanguage', 'LearnMandarin', 'languagelearning']
const QUERIES = (process.env.Q ? process.env.Q.split(',') : ['typing', 'input method', 'pinyin keyboard', 'type chinese'])

const { ctx, page } = await openBrowser()
await page.goto('https://www.reddit.com/', { waitUntil: 'domcontentloaded' })
await wait(2500)

const results = await page.evaluate(async ({ subs, queries }) => {
  const j = async (p) => {
    try {
      const r = await fetch(p, { headers: { accept: 'application/json' } })
      return await r.json()
    } catch { return null }
  }
  const out = []
  for (const sub of subs) {
    for (const q of queries) {
      const data = await j(`/r/${sub}/search.json?q=${encodeURIComponent(q)}&restrict_sr=1&sort=new&limit=6`)
      const kids = data?.data?.children || []
      for (const c of kids) {
        const d = c.data
        out.push({
          sub, q, id: d.id, title: (d.title || '').slice(0, 110),
          score: d.score, comments: d.num_comments,
          created: d.created_utc, permalink: d.permalink,
          selftext: (d.selftext || '').replace(/\s+/g, ' ').slice(0, 200),
        })
      }
      await new Promise((r) => setTimeout(r, 1200))
    }
  }
  return out
}, { subs: SUBS, queries: QUERIES })

// 去重 + 按时间排序
const seen = new Set()
const uniq = results.filter((r) => !seen.has(r.id) && seen.add(r.id)).sort((a, b) => b.created - a.created)

const daysAgo = (ts) => Math.floor((Date.now() / 1000 - ts) / 86400)

console.log(`========== 找到 ${uniq.length} 条相关帖 ==========`)
for (const r of uniq) {
  console.log(`\n[r/${r.sub}] ${daysAgo(r.created)} 天前 · score=${r.score} · ${r.comments} 评论`)
  console.log(`  ${r.title}`)
  console.log(`  https://www.reddit.com${r.permalink}`)
  if (r.selftext) console.log(`  正文: ${r.selftext}`)
}

await ctx.close()
console.log('\n=== 搜索结束 ===')
