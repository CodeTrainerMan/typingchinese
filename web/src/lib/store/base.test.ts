// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { advanceSession, nextStep, useBaseStore, type StudySession } from './base'
import type { CardRecord, CnWord, LearningDict, Statistics, WrongRecord } from '../types'

const word = (w: string): CnWord => ({
  id: w,
  word: w,
  pinyin: [`${w}1`],
  flat: w,
  flatSpaced: w,
  toneNum: `${w}1`,
  initials: w.slice(0, 1),
  syllables: [w],
  trans: '释义',
  length: w.length,
})

const dict = (id: string, words: string[]): LearningDict => ({
  id,
  name: id,
  description: '',
  category: '',
  tags: [],
  level: 1,
  length: words.length,
  url: '',
  words: words.map(word),
  lastLearnIndex: 0,
  perDayStudyNumber: 20,
  addedAt: 0,
})

const session = (over: Partial<StudySession> = {}): StudySession => ({
  dictId: 'd1',
  wordIds: ['a', 'b', 'c'],
  index: 0,
  wrongTimes: {},
  keystrokes: 0,
  startedAt: 0,
  flushedMs: 0,
  flushedKeys: 0,
  steps: ['spell', 'dictation'],
  stepIndex: 0,
  stepWords: ['a', 'b', 'c'],
  stepWrong: [],
  ...over,
})

const RESET = {
  dicts: [] as LearningDict[],
  currentDictId: null as string | null,
  wrongWords: {} as Record<string, WrongRecord>,
  knownWords: [] as string[],
  collect: [] as string[],
  ignoreWords: [] as string[],
  fsrsData: {} as Record<string, CardRecord>,
  statistics: [] as Statistics[],
  session: null as StudySession | null,
}

beforeEach(() => {
  localStorage.clear()
  useBaseStore.setState({ ...RESET })
})

describe('nextStep', () => {
  it('本步有错词且开了补练 → 留在当前步骤补一轮', () => {
    expect(nextStep(session(), ['b'], true)).toEqual({ stepIndex: 0, patch: true, stepWords: ['b'] })
  })

  it('没开补练就直接进下一步', () => {
    expect(nextStep(session(), ['b'], false)).toEqual({ stepIndex: 1, patch: false, stepWords: ['a', 'b', 'c'] })
  })

  it('没有错词时不会空转补练', () => {
    expect(nextStep(session(), [], true)).toEqual({ stepIndex: 1, patch: false, stepWords: ['a', 'b', 'c'] })
  })

  it('已经是最后一步但还有错词 → 先补练，不直接结束', () => {
    expect(nextStep(session({ stepIndex: 1 }), ['b'], true)).toEqual({ stepIndex: 1, patch: true, stepWords: ['b'] })
  })

  it('最后一步且没有错词 → 返回 null（整组结束）', () => {
    expect(nextStep(session({ stepIndex: 1 }), [], true)).toBeNull()
    expect(nextStep(session({ stepIndex: 1 }), ['b'], false)).toBeNull()
  })
})

describe('advanceSession', () => {
  it('同一步骤内前进一个词', () => {
    const next = advanceSession(session(), 'a', 0, [], true)
    expect(next.index).toBe(1)
    expect(next.done).toBeUndefined()
    expect(next.wrongTimes).toEqual({ a: 0 })
  })

  it('本步最后一词且有错词 → 补练这批错词', () => {
    const next = advanceSession(session({ index: 2 }), 'c', 2, ['b', 'c'], true)
    expect(next.index).toBe(0)
    expect(next.stepIndex).toBe(0)
    expect(next.patch).toBe(true)
    expect(next.stepWords).toEqual(['b', 'c'])
    expect(next.stepWrong).toEqual([])
  })

  it('本步最后一词且全对 → 进下一步，重新跑整组', () => {
    const next = advanceSession(session({ index: 2 }), 'c', 0, [], true)
    expect(next.index).toBe(0)
    expect(next.stepIndex).toBe(1)
    expect(next.patch).toBe(false)
    expect(next.stepWords).toEqual(['a', 'b', 'c'])
  })

  it('补练只做一次：补练轮再有错也进下一步', () => {
    const patching = session({ index: 1, stepIndex: 0, patch: true, stepWords: ['b', 'c'] })
    const next = advanceSession(patching, 'c', 3, ['c'], true)
    expect(next.patch).toBe(false)
    expect(next.stepIndex).toBe(1)
  })

  it('最后一步跑完标记整组结束', () => {
    const next = advanceSession(session({ index: 2, stepIndex: 1 }), 'c', 0, [], true)
    expect(next.done).toBe(true)
    expect(next.index).toBe(3)
  })
})

describe('importData 校验', () => {
  it('不是 JSON / 不是对象 / 没有任何字段都给出错误码', () => {
    expect(useBaseStore.getState().importData('not json')).toEqual({ ok: false, code: 'notJson' })
    expect(useBaseStore.getState().importData('null')).toEqual({ ok: false, code: 'notObject' })
    expect(useBaseStore.getState().importData('{}')).toEqual({ ok: false, code: 'noFields' })
  })

  it('核心字段类型不对直接拒绝', () => {
    expect(useBaseStore.getState().importData(JSON.stringify({ dicts: 'x' }))).toEqual({ ok: false, code: 'badDicts' })
    expect(useBaseStore.getState().importData(JSON.stringify({ knownWords: 1 }))).toEqual({ ok: false, code: 'badKnown' })
    expect(useBaseStore.getState().importData(JSON.stringify({ statistics: 1 }))).toEqual({ ok: false, code: 'badStats' })
    expect(useBaseStore.getState().importData(JSON.stringify({ wrongWords: [] }))).toEqual({ ok: false, code: 'badWrong' })
  })

  it('可选字段类型不对时保留现有值，而不是把状态清空', () => {
    useBaseStore.setState({ collect: ['a'], ignoreWords: ['b'] })
    const result = useBaseStore.getState().importData(
      JSON.stringify({ knownWords: ['c'], collect: 'oops', ignoreWords: 42 })
    )
    expect(result.ok).toBe(true)
    expect(useBaseStore.getState().collect).toEqual(['a'])
    expect(useBaseStore.getState().ignoreWords).toEqual(['b'])
    expect(useBaseStore.getState().knownWords).toEqual(['c'])
  })

  it('坏词条被剔除，缺 id 的整本丢掉', () => {
    const result = useBaseStore.getState().importData(
      JSON.stringify({
        dicts: [
          { id: 'd1', words: [{ word: 'a' }, { nope: 1 }, 'x'] },
          { id: '', words: [] },
          { words: [] },
        ],
      })
    )
    expect(result.ok).toBe(true)
    const dicts = useBaseStore.getState().dicts
    expect(dicts).toHaveLength(1)
    expect(dicts[0].words.map(w => w.word)).toEqual(['a'])
    expect(dicts[0].length).toBe(1)
  })
})

describe('importData replace / merge', () => {
  const backup = (over: Record<string, unknown> = {}) =>
    JSON.stringify({
      version: 1,
      dicts: [dict('d2', ['b', 'c'])],
      knownWords: ['b'],
      collect: ['b'],
      wrongWords: { b: { word: 'b', dictId: 'd2', count: 5, lastWrongAt: 200 } },
      statistics: [{ date: '2026-09-22', spend: 100, total: 3, correct: 2, wrong: 1, keystrokes: 30 }],
      ...over,
    })

  beforeEach(() => {
    useBaseStore.setState({
      dicts: [dict('d1', ['a'])],
      knownWords: ['a'],
      collect: ['a'],
      wrongWords: { a: { word: 'a', dictId: 'd1', count: 2, lastWrongAt: 100 } },
      statistics: [{ date: '2026-09-22', spend: 50, total: 1, correct: 1, wrong: 0, keystrokes: 10 }],
      session: session(),
    })
  })

  it('replace：备份覆盖现有数据，并清掉进行中的会话', () => {
    const result = useBaseStore.getState().importData(backup())
    expect(result).toEqual({ ok: true, code: 'importOk' })
    const s = useBaseStore.getState()
    expect(s.dicts.map(d => d.id)).toEqual(['d2'])
    expect(s.knownWords).toEqual(['b'])
    expect(s.wrongWords.a).toBeUndefined()
    expect(s.session).toBeNull()
  })

  it('merge：两边的数据都在，不会被覆盖', () => {
    const result = useBaseStore.getState().importData(backup(), 'merge')
    expect(result).toEqual({ ok: true, code: 'importOkMerge' })
    const s = useBaseStore.getState()
    expect(s.dicts.map(d => d.id).sort()).toEqual(['d1', 'd2'])
    expect(s.knownWords.sort()).toEqual(['a', 'b'])
    expect(s.collect.sort()).toEqual(['a', 'b'])
    expect(Object.keys(s.wrongWords).sort()).toEqual(['a', 'b'])
  })

  it('merge：同 id 词库合并词条而不是二选一', () => {
    useBaseStore.setState({ dicts: [dict('d1', ['a'])] })
    useBaseStore.getState().importData(JSON.stringify({ dicts: [dict('d1', ['a', 'b'])] }), 'merge')
    const d1 = useBaseStore.getState().dicts[0]
    expect(d1.words.map(w => w.word)).toEqual(['a', 'b'])
    expect(d1.length).toBe(2)
  })

  it('merge：错词次数取较大值，不会因为重复导入被翻番', () => {
    useBaseStore.getState().importData(backup(), 'merge')
    useBaseStore.getState().importData(backup(), 'merge')
    expect(useBaseStore.getState().wrongWords.b.count).toBe(5)
  })

  it('merge：同一天的统计取较大值而不是相加', () => {
    useBaseStore.getState().importData(backup(), 'merge')
    const today = useBaseStore.getState().statistics.find(s => s.date === '2026-09-22')
    expect(today?.total).toBe(3)
    expect(today?.spend).toBe(100)
  })
})

describe('persist migrate', () => {
  it('v0 存档补出后加的字段（ignoreWords / 流程编排字段）', async () => {
    localStorage.setItem(
      'cn-type-base-v1',
      JSON.stringify({
        version: 0,
        state: {
          dicts: [dict('d1', ['a', 'b'])],
          knownWords: ['a'],
          wrongWords: {},
          fsrsData: {},
          statistics: [],
          session: {
            dictId: 'd1',
            wordIds: ['a', 'b'],
            index: 1,
            wrongTimes: {},
            keystrokes: 0,
            startedAt: 0,
            flushedMs: 0,
            flushedKeys: 0,
          },
        },
      })
    )

    await useBaseStore.persist.rehydrate()

    const s = useBaseStore.getState()
    expect(s.ignoreWords).toEqual([])
    expect(s.session?.steps).toEqual(['spell'])
    expect(s.session?.stepIndex).toBe(0)
    expect(s.session?.stepWords).toEqual(['a', 'b'])
    expect(s.session?.stepWrong).toEqual([])
    expect(s.knownWords).toEqual(['a'])
  })
})
