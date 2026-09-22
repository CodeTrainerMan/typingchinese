import { describe, expect, it } from 'vitest'
import {
  MAX_DAILY,
  accumulateDaily,
  applyCharResult,
  sortedWrongChars,
  todayStat,
  type WriteDaily,
  type WrongChar,
} from './stats'

const at = 1_700_000_000_000

describe('applyCharResult', () => {
  it('写错就记进错字本并累加次数', () => {
    const first = applyCharResult({}, '中', 2)
    expect(first['中'].count).toBe(1)
    const second = applyCharResult(first, '中', 1)
    expect(second['中'].count).toBe(2)
  })

  it('写对一次递减，归零后移除', () => {
    const wrong: Record<string, WrongChar> = { 中: { char: '中', count: 1, lastWrongAt: at } }
    const zero = applyCharResult(wrong, '中', 0)
    expect(zero['中']).toBeUndefined()
  })

  it('没写错也不在错字本里时不做任何事', () => {
    expect(applyCharResult({}, '中', 0)).toEqual({})
  })
})

describe('accumulateDaily', () => {
  it('当天没有条目就新建', () => {
    const daily = accumulateDaily([], '2026-09-23', { chars: 1, mistakes: 3 })
    expect(daily).toEqual([{ date: '2026-09-23', spend: 0, chars: 1, mistakes: 3 }])
  })

  it('同一天累加，不新建条目', () => {
    const one = accumulateDaily([], '2026-09-23', { chars: 1, mistakes: 1 })
    const two = accumulateDaily(one, '2026-09-23', { chars: 1, mistakes: 2, spend: 500 })
    expect(two).toEqual([{ date: '2026-09-23', spend: 500, chars: 2, mistakes: 3 }])
  })

  it('不同日期各自一条', () => {
    const one = accumulateDaily([], '2026-09-23', { chars: 1 })
    const two = accumulateDaily(one, '2026-09-24', { chars: 2 })
    expect(two.map(d => d.date)).toEqual(['2026-09-23', '2026-09-24'])
  })

  it('超过上限只保留最近的天数', () => {
    let daily: WriteDaily[] = []
    for (let i = 0; i < MAX_DAILY + 10; i++) {
      daily = accumulateDaily(daily, `d-${i}`, { chars: 1 })
    }
    expect(daily.length).toBe(MAX_DAILY)
    expect(daily[daily.length - 1].date).toBe(`d-${MAX_DAILY + 9}`)
  })
})

describe('todayStat', () => {
  it('没有当日记录时返回空条目', () => {
    expect(todayStat([], '2026-09-23')).toEqual({ date: '2026-09-23', spend: 0, chars: 0, mistakes: 0 })
  })
})

describe('sortedWrongChars', () => {
  it('按写错次数降序，次数相同按最近时间降序', () => {
    const wrong: Record<string, WrongChar> = {
      中: { char: '中', count: 1, lastWrongAt: at },
      国: { char: '国', count: 3, lastWrongAt: at },
      人: { char: '人', count: 1, lastWrongAt: at + 1000 },
    }
    expect(sortedWrongChars(wrong).map(w => w.char)).toEqual(['国', '人', '中'])
  })
})
