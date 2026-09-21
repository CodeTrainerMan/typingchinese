import { describe, expect, it } from 'vitest'
import {
  accuracy,
  afterWrongBackspace,
  getFirstWrongIndex,
  getSyllableGroups,
  isCharCorrect,
  isComplete,
  isCorrect,
  normalizeTargetChar,
  speed,
} from './typing'

describe('normalizeTargetChar', () => {
  it('ü 及其四个声调都按 v 判定', () => {
    for (const ch of ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']) {
      expect(normalizeTargetChar(ch)).toBe('v')
    }
  })

  it('大写目标按小写判定', () => {
    expect(normalizeTargetChar('A')).toBe('a')
  })
})

describe('逐字母判定', () => {
  it('键盘上的 v 等于 ü', () => {
    expect(isCharCorrect('v', 'ü')).toBe(true)
    expect(isCharCorrect('V', 'ü')).toBe(true)
    expect(isCharCorrect('u', 'ü')).toBe(false)
  })

  it('目标不存在（多打了字）一律算错', () => {
    expect(isCharCorrect('a', undefined)).toBe(false)
    expect(getFirstWrongIndex('zhonga', 'zhong')).toBe(5)
  })

  it('前几位都对时返回 -1', () => {
    expect(getFirstWrongIndex('zho', 'zhong')).toBe(-1)
    expect(getFirstWrongIndex('zhx', 'zhong')).toBe(2)
  })

  it('长度不够就不算完成', () => {
    expect(isComplete('zhon', 'zhong')).toBe(false)
    expect(isCorrect('zhon', 'zhong')).toBe(false)
    expect(isCorrect('zhong', 'zhong')).toBe(true)
  })
})

describe('afterWrongBackspace', () => {
  it('有错字时一次退到第一个错字处', () => {
    expect(afterWrongBackspace('zhx', 'zhong')).toBe('zh')
    expect(afterWrongBackspace('zhxy', 'zhong')).toBe('zh')
  })

  it('全对时只退最后一个字符', () => {
    expect(afterWrongBackspace('zhong', 'zhong')).toBe('zhon')
  })
})

describe('getSyllableGroups', () => {
  it('按音节切分已输入内容，未输入到的音节是空块', () => {
    const groups = getSyllableGroups('zhon', ['zhong', 'guo'], ['zhōng', 'guó'])
    expect(groups).toHaveLength(2)
    expect(groups[0].plain).toBe('zhong')
    expect(groups[0].display).toBe('zhōng')
    expect(groups[0].offset).toBe(0)
    expect(groups[0].chars.map(c => c.correct)).toEqual([true, true, true, true])
    expect(groups[1].chars).toEqual([])
    expect(groups[1].offset).toBe(5)
  })

  it('不传展示串时用判定串本身', () => {
    expect(getSyllableGroups('lv', ['lv'])[0].display).toBe('lv')
  })
})

describe('accuracy / speed', () => {
  it('总输入为 0 时准确率按 100 算，避免除零', () => {
    expect(accuracy(0, 0)).toBe(100)
    expect(accuracy(9, 10)).toBe(90)
    expect(accuracy(1, 3)).toBe(33.3)
  })

  it('用时为 0 时速度按 0 算', () => {
    expect(speed(120, 20, 60_000)).toEqual({ kpm: 120, cpm: 20 })
    expect(speed(120, 20, 0)).toEqual({ kpm: 0, cpm: 0 })
  })
})
