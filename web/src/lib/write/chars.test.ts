import { describe, expect, it } from 'vitest'
import type { CnWord } from '../types'
import { buildCharQueue, charSourceMap, charsOf, isHanzi } from './chars'

function word(w: string): CnWord {
  return {
    id: w,
    word: w,
    pinyin: [],
    flat: '',
    flatSpaced: '',
    toneNum: '',
    initials: '',
    syllables: [],
    trans: '',
    length: w.length,
  }
}

describe('isHanzi', () => {
  it('认汉字，不认拉丁字母、数字和标点', () => {
    expect(isHanzi('中')).toBe(true)
    expect(isHanzi('a')).toBe(false)
    expect(isHanzi('1')).toBe(false)
    expect(isHanzi('，')).toBe(false)
  })

  it('多字符不算单字', () => {
    expect(isHanzi('中国')).toBe(false)
    expect(isHanzi('')).toBe(false)
  })
})

describe('charsOf', () => {
  it('按词库顺序拆字并去重', () => {
    expect(charsOf(['中国', '美国人'])).toEqual(['中', '国', '美', '人'])
  })

  it('跳过非汉字字符', () => {
    expect(charsOf(['a中1国'])).toEqual(['中', '国'])
  })
})

describe('charSourceMap', () => {
  it('字映射到首次出现它的词条', () => {
    const map = charSourceMap([word('中国'), word('美国')])
    expect(map.get('中')?.word).toBe('中国')
    expect(map.get('国')?.word).toBe('中国')
    expect(map.get('美')?.word).toBe('美国')
  })
})

describe('buildCharQueue', () => {
  it('只保留有笔顺数据的字', () => {
    const queue = buildCharQueue([word('中国'), word('美国')], new Set(['中', '美']))
    expect(queue).toEqual(['中', '美'])
  })

  it('一个字都没有数据时返回空队列', () => {
    expect(buildCharQueue([word('中国')], new Set())).toEqual([])
  })
})
