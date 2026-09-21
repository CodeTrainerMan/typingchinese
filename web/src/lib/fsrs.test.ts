import { createEmptyCard, Rating, type Card, type Grade } from 'ts-fsrs'
import { describe, expect, it } from 'vitest'
import {
  currentRetention,
  gradeByWrongTimes,
  isDue,
  reviveCard,
  reviewCard,
  serializeCard,
} from './fsrs'

describe('gradeByWrongTimes', () => {
  it('默认阈值：0 错 Easy / 1 错 Good / 2 错 Hard / 更多 Again', () => {
    expect(gradeByWrongTimes(0)).toBe<Grade>(Rating.Easy)
    expect(gradeByWrongTimes(1)).toBe<Grade>(Rating.Good)
    expect(gradeByWrongTimes(2)).toBe<Grade>(Rating.Hard)
    expect(gradeByWrongTimes(3)).toBe<Grade>(Rating.Again)
    expect(gradeByWrongTimes(99)).toBe<Grade>(Rating.Again)
  })

  it('阈值可在设置页调整后生效', () => {
    const limits = { easy: 1, good: 3, hard: 5 }
    expect(gradeByWrongTimes(1, limits)).toBe<Grade>(Rating.Easy)
    expect(gradeByWrongTimes(3, limits)).toBe<Grade>(Rating.Good)
    expect(gradeByWrongTimes(5, limits)).toBe<Grade>(Rating.Hard)
    expect(gradeByWrongTimes(6, limits)).toBe<Grade>(Rating.Again)
  })
})

describe('卡片序列化（JSON 里 Date 会变字符串）', () => {
  it('没有记录时还原成空卡片', () => {
    const card = reviveCard(undefined)
    expect(card.due).toBeInstanceOf(Date)
    expect(card.reps).toBe(0)
  })

  it('serialize → revive 往返后字段与日期类型都保持', () => {
    const reviewed = reviewCard(createEmptyCard(), Rating.Good)
    const raw = serializeCard(reviewed)
    const back = reviveCard({ ...raw, lastReview: raw.lastReview ?? undefined })

    expect(back.due.toISOString()).toBe(reviewed.due.toISOString())
    expect(back.stability).toBe(reviewed.stability)
    expect(back.difficulty).toBe(reviewed.difficulty)
    expect(back.reps).toBe(reviewed.reps)
    expect(back.state).toBe(reviewed.state)
    expect(back.learning_steps).toBe(reviewed.learning_steps)
    expect(back.last_review).toBeInstanceOf(Date)
  })

  it('lastReview 缺失时是 undefined，不是 Invalid Date', () => {
    const card = reviveCard({
      due: new Date().toISOString(),
      stability: 1,
      difficulty: 5,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 1,
      lapses: 0,
      state: 2,
    })
    expect(card.last_review).toBeUndefined()
  })
})

describe('isDue（按自然日比较）', () => {
  const at = (offsetDays: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    return d.toISOString()
  }

  it('没有卡片时算到期（还没学过）', () => {
    expect(isDue(undefined)).toBe(true)
  })

  it('昨天到期、今天到期都算到期', () => {
    expect(isDue(reviveCard({ due: at(-1), stability: 1, difficulty: 5, elapsedDays: 1, scheduledDays: 1, reps: 1, lapses: 0, state: 2 }))).toBe(true)
    expect(isDue(reviveCard({ due: at(0), stability: 1, difficulty: 5, elapsedDays: 1, scheduledDays: 1, reps: 1, lapses: 0, state: 2 }))).toBe(true)
  })

  it('明天才到期的不算', () => {
    expect(isDue(reviveCard({ due: at(1), stability: 1, difficulty: 5, elapsedDays: 1, scheduledDays: 1, reps: 1, lapses: 0, state: 2 }))).toBe(false)
  })
})

describe('currentRetention', () => {
  it('没复习过按 0', () => {
    expect(currentRetention(undefined)).toBe(0)
    expect(currentRetention(createEmptyCard())).toBe(0)
  })

  /** 造一个「daysAgo 天前复习过、稳定性为 stability」的卡片 */
  const reviewed = (stability: number, daysAgo: number): Card =>
    reviveCard({
      due: new Date().toISOString(),
      stability,
      difficulty: 5,
      elapsedDays: daysAgo,
      scheduledDays: 1,
      reps: 1,
      lapses: 0,
      state: 2,
      lastReview: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
    })

  it('刚复习完接近 1', () => {
    expect(currentRetention(reviewed(5, 0))).toBeGreaterThan(0.99)
  })

  it('稳定性越高，同样的时间过后保持率越高', () => {
    expect(currentRetention(reviewed(30, 10))).toBeGreaterThan(currentRetention(reviewed(1, 10)))
  })
})
