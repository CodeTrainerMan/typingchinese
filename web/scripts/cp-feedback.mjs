/**
 * 只读：账号表现与外界反馈体检
 * - 账号 karma / 注册天数
 * - 我们发过的评论：子版、score、内容
 * - 这些评论所在帖里，有没有人回复我们（真正的外部反馈）
 */
import { openBrowser, wait } from './browser.mjs'

const USER = 'Salt_Necessary_1287'
const { ctx, page } = await openBrowser()
await page.goto('https://www.reddit.com/', { waitUntil: 'domcontentloaded' })
await wait(2500)

const data = await page.evaluate(async (user) => {
  const j = async (p) => {
    try {
      const r = await fetch(p, { headers: { accept: 'application/json' } })
      return await r.json()
    } catch { return null }
  }

  const about = await j(`/user/${user}/about.json`)
  const comments = await j(`/user/${user}/comments.json?limit=10`)
  const kids = comments?.data?.children || []

  const mine = kids.map((c) => {
    const d = c.data
    return {
      id: d.id, sub: d.subreddit, score: d.score, created: d.created_utc,
      linkTitle: d.link_title, linkId: d.link_id,
      body: (d.body || '').replace(/\s+/g, ' ').slice(0, 180),
    }
  })

  // 拉每条评论所在帖的评论树，找出「回复我们」的评论
  const myIds = new Set(mine.map((m) => m.id))
  const feedback = []
  for (const m of mine) {
    const postId = (m.linkId || '').replace('t3_', '')
    if (!postId) continue
    const tree = await j(`/r/${m.sub}/comments/${postId}.json?limit=200&sort=top`)
    const walk = (list) => {
      for (const c of list || []) {
        if (!c?.data) continue
        const pid = (c.data.parent_id || '').replace('t1_', '')
        if (myIds.has(pid)) {
          feedback.push({
            replyTo: pid, sub: m.sub, author: c.data.author, score: c.data.score,
            body: (c.data.body || '').replace(/\s+/g, ' ').slice(0, 300),
          })
        }
        if (c.data.replies?.data?.children) walk(c.data.replies.data.children)
      }
    }
    walk(tree?.[1]?.data?.children || [])
    // 顺带记录该帖总评论数（判断我们处在多大的池子里）
    m.threadComments = (tree?.[1]?.data?.children || []).length
  }

  return { about: about?.data || null, mine, feedback }
}, USER)

const ageDays = data.about?.created_utc
  ? Math.floor((Date.now() / 1000 - data.about.created_utc) / 86400)
  : null

console.log('========== 账号 ==========')
console.log('u/' + USER, '| karma:', data.about?.total_karma ?? '-',
  '| post karma:', data.about?.link_karma ?? '-',
  '| comment karma:', data.about?.comment_karma ?? '-',
  '| 账号天数:', ageDays ?? '-')

console.log('\n========== 我们发过的评论 ==========')
if (!data.mine.length) console.log('（无）')
data.mine.forEach((m, i) => {
  const d = Math.floor((Date.now() / 1000 - m.created) / 86400)
  console.log(`\n[${i + 1}] r/${m.sub} · ${d} 天前 · score=${m.score} · 帖内可见评论≈${m.threadComments ?? '?'}`)
  console.log(`    所在帖: ${m.linkTitle}`)
  console.log(`    ${m.body}`)
})

console.log('\n========== 外部反馈（回复我们的评论） ==========')
if (!data.feedback.length) console.log('（暂无任何人回复）')
data.feedback.forEach((f, i) => {
  console.log(`\n[${i + 1}] r/${f.sub} 来自 u/${f.author} · score=${f.score}`)
  console.log(`    ${f.body}`)
})

await ctx.close()
console.log('\n=== 反馈体检完成 ===')
