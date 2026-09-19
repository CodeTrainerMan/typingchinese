/**
 * 跟读记录按文章聚合：把一条条流水折成「某篇文章练得怎么样」的进步情况。
 * 只做纯计算，方便统计页与文章页共用。
 */

import type { ReadRecord } from '@/lib/store/extra'

/** 一篇文章的跟读进步情况 */
export interface ArticleProgress {
  /** 文章 id；老记录没有 id 时退回标题 */
  key: string
  title: string
  /** 按时间升序的每次跟读，画曲线就按这个顺序 */
  records: ReadRecord[]
  count: number
  first: number
  latest: number
  best: number
  avg: number
  /** 后段均值 − 前段均值，正数就是进步了 */
  delta: number
  lastAt: number
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

/**
 * 按文章分组，最近练过的排最前。
 * 进步幅度取「后 1/3 的均值 − 前 1/3 的均值」，比单看首尾更稳：
 * 只练 2 次时窗口退化为 1，就是最后一次减第一次。
 */
export function groupReadByArticle(records: ReadRecord[]): ArticleProgress[] {
  const groups = new Map<string, ReadRecord[]>()
  for (const r of records) {
    const key = r.articleId || r.articleTitle || 'unknown'
    const list = groups.get(key)
    if (list) list.push(r)
    else groups.set(key, [r])
  }

  return [...groups.entries()]
    .map(([key, list]) => {
      const sorted = [...list].sort((a, b) => a.at - b.at)
      const scores = sorted.map(r => r.score)
      const win = Math.max(1, Math.round(scores.length / 3))
      const head = mean(scores.slice(0, win))
      const tail = mean(scores.slice(-win))
      return {
        key,
        title: sorted[sorted.length - 1].articleTitle || key,
        records: sorted,
        count: sorted.length,
        first: scores[0],
        latest: scores[scores.length - 1],
        best: Math.max(...scores),
        avg: Math.round(mean(scores)),
        delta: Math.round(tail - head),
        lastAt: sorted[sorted.length - 1].at,
      }
    })
    .sort((a, b) => b.lastAt - a.lastAt)
}
