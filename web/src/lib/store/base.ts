import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CardRecord, CnWord, DictResource, LearningDict, Statistics, WrongRecord } from '../types'
import { DEFAULT_SETTING, useSettingStore } from './setting'
import { gradeByWrongTimes, isDue, reviveCard, reviewCard, serializeCard } from '../fsrs'

/**
 * 备份导入结果：ok 表示已写入，code 是语言包里 errors.* 的 key 后缀。
 * 只回错误码不回文案，界面层用 t('errors.' + code) 翻译，store 就不必感知语言。
 */
export interface ImportResult {
  ok: boolean
  code: string
}

/** 断点续练会话 */
export interface StudySession {
  dictId: string
  /** dict = 按词库选题；wrong = 错词本专项练习；collect = 收藏本练习；article = 文章练习 */
  kind?: 'dict' | 'wrong' | 'collect' | 'article'
  wordIds: string[]
  index: number
  wrongTimes: Record<string, number>
  keystrokes: number
  startedAt: number
  /** 已并入当日统计的累计用时（毫秒），用于增量落盘避免重复累加 */
  flushedMs: number
  /** 已并入当日统计的累计击键数 */
  flushedKeys: number
  /** 整组已完成 */
  done?: boolean
  /** 会话显示名（收藏本 / 文章标题等） */
  title?: string
  /** 临时词条：文章练习等不来自词库的会话，直接携带词条内容 */
  words?: CnWord[]
}

interface BaseState {
  dicts: LearningDict[]
  currentDictId: string | null
  wrongWords: Record<string, WrongRecord>
  knownWords: string[]
  collect: string[]
  fsrsData: Record<string, CardRecord>
  statistics: Statistics[]
  session: StudySession | null

  addDict: (resource: DictResource) => Promise<void>
  /** 加入自定义导入的词库（内容已在本地生成，无需网络拉取） */
  addCustomDict: (dict: LearningDict) => void
  removeDict: (id: string) => void
  setCurrentDict: (id: string) => void
  updateDict: (id: string, patch: Partial<LearningDict>) => void

  startSession: (dictId: string, perDayStudyNumber?: number) => void
  /** 错词本专项练习：取错误次数最多的若干词组成一组，返回是否成功开组 */
  startWrongSession: (limit?: number) => boolean
  /** 收藏本专项练习：取收藏的词组成一组，返回是否成功开组 */
  /** title 由调用方按当前语言传入，避免把中文标题写进持久化数据 */
  startCollectSession: (limit?: number, title?: string) => boolean
  /** 临时会话（文章练习等），直接给定词条，不走词库选题 */
  startCustomSession: (words: CnWord[], title: string) => void
  clearSession: () => void
  /** 回到本组第 1 词重练 */
  restartSession: () => void
  getSessionWords: () => CnWord[]
  /**
   * 会话结束/离开时把用时与击键数并入当日统计（内部按增量累加，可重复调用）。
   * 传 startedAt 时只在该会话仍是当前会话才写入，避免旧会话卸载时串写进新会话。
   */
  addSessionStat: (spendMs: number, keystrokes: number, startedAt?: number) => void
  /** 整组完成：落盘剩余统计并标记 session 结束 */
  finishSession: (spendMs: number, keystrokes: number) => void

  /** 提交一个词的结果：更新记忆曲线 / 错词本 / 统计 / 进度 */
  commitWord: (word: CnWord, wrongTimes: number) => void

  toggleKnown: (word: string) => void
  clearKnown: () => void
  toggleCollect: (word: string) => void
  clearCollect: () => void
  removeWrong: (word: string) => void
  resetWrong: () => void
  exportData: () => string
  importData: (json: string) => ImportResult
}

const today = () => new Date().toISOString().slice(0, 10)

/** Fisher–Yates 打散，用于混合新词与复习词 */
function shuffle<T>(list: T[]): T[] {
  const arr = list.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** 从学习指针往后取新词，跳过已标记为掌握的词 */
function pickNewWords(dict: LearningDict, count: number, known: Set<string>): CnWord[] {
  const len = dict.words.length
  if (!len || count <= 0) return []
  const start = ((dict.lastLearnIndex % len) + len) % len
  const out: CnWord[] = []
  for (let i = 0; i < len && out.length < count; i++) {
    const w = dict.words[(start + i) % len]
    if (known.has(w.word)) continue
    out.push(w)
  }
  return out
}

/** 取到期需要复习的词：越早到期越优先，且只取前 count 个 */
function pickReviewWords(
  dict: LearningDict,
  fsrsData: Record<string, CardRecord>,
  count: number,
  known: Set<string>
): CnWord[] {
  if (count <= 0) return []
  return dict.words
    .filter(w => {
      if (known.has(w.word)) return false
      const card = fsrsData[w.word]
      return card ? isDue(reviveCard(card)) : false
    })
    .sort((a, b) => (fsrsData[a.word]?.due ?? '').localeCompare(fsrsData[b.word]?.due ?? ''))
    .slice(0, count)
}

/** 在所有词库里找词条 */
function findWordInDicts(dicts: LearningDict[], word: string): CnWord | undefined {
  for (const d of dicts) {
    const hit = d.words.find(w => w.word === word)
    if (hit) return hit
  }
  return undefined
}

/** 组装一个新会话 */
function makeSession(
  wordIds: string[],
  kind: NonNullable<StudySession['kind']>,
  dictId: string,
  extra?: Partial<StudySession>
): StudySession {
  return {
    dictId,
    kind,
    wordIds,
    index: 0,
    wrongTimes: {},
    keystrokes: 0,
    startedAt: Date.now(),
    flushedMs: 0,
    flushedKeys: 0,
    ...extra,
  }
}

export const useBaseStore = create<BaseState>()(
  persist(
    (set, get) => ({
      dicts: [],
      currentDictId: null,
      wrongWords: {},
      knownWords: [],
      collect: [],
      fsrsData: {},
      statistics: [],
      session: null,

      async addDict(resource) {
        const exist = get().dicts.find(d => d.id === resource.id)
        if (exist) {
          set({ currentDictId: resource.id })
          return
        }
        const res = await fetch(`/dicts/${resource.url}`)
        const data = (await res.json()) as Omit<LearningDict, 'lastLearnIndex' | 'perDayStudyNumber' | 'addedAt'>
        const dict: LearningDict = {
          ...data,
          lastLearnIndex: 0,
          perDayStudyNumber: DEFAULT_SETTING.perDayStudyNumber,
          addedAt: Date.now(),
        }
        set(state => ({
          dicts: [...state.dicts, dict],
          currentDictId: dict.id,
        }))
      },

      /** 加入自定义导入的词库（无需网络拉取），并切换为当前词库 */
      addCustomDict(dict) {
        set(state => ({
          dicts: [...state.dicts.filter(d => d.id !== dict.id), dict],
          currentDictId: dict.id,
          session: null,
        }))
      },

      removeDict(id) {
        set(state => ({
          dicts: state.dicts.filter(d => d.id !== id),
          currentDictId: state.currentDictId === id ? (state.dicts[0]?.id ?? null) : state.currentDictId,
          session: state.session?.dictId === id ? null : state.session,
        }))
      },

      setCurrentDict(id) {
        set({ currentDictId: id, session: get().session?.dictId === id ? get().session : null })
      },

      updateDict(id, patch) {
        set(state => ({ dicts: state.dicts.map(d => (d.id === id ? { ...d, ...patch } : d)) }))
      },

      startSession(dictId, perDayStudyNumber = DEFAULT_SETTING.perDayStudyNumber) {
        const dict = get().dicts.find(d => d.id === dictId)
        if (!dict || !dict.words.length) return
        const { fsrsData, session, knownWords } = get()
        if (session && session.dictId === dictId && !session.done && session.index < session.wordIds.length) return

        const known = new Set(knownWords)

        // 已掌握的词不再排程，顺手删掉卡片，避免 fsrsData 越积越多（对齐参考项目 dict.ts:203）
        let cards = fsrsData
        const stale = Object.keys(cards).filter(w => known.has(w))
        if (stale.length) {
          cards = { ...cards }
          stale.forEach(w => delete cards[w])
        }

        const { reviewRatio } = useSettingStore.getState()
        // 整本学完后不再出新词，只安排复习；此时复习比最小按 1 算（对齐参考项目 dict.ts:157,161,178）
        const isEnd = dict.words.length !== 1 && dict.lastLearnIndex >= dict.words.length - 1
        const reviewCount = Math.floor(perDayStudyNumber * (isEnd ? Math.max(1, reviewRatio) : reviewRatio))

        let newWords: CnWord[] = isEnd ? [] : pickNewWords(dict, perDayStudyNumber, known)
        let review = reviewCount
          ? pickReviewWords(dict, cards, reviewCount, known).filter(w => !newWords.some(n => n.word === w.word))
          : []
        // 兜底：既没复习词又没新词时（比如复习比 0 且刚学完），至少给一批新词，免得空白会话
        if (!newWords.length && !review.length) newWords = pickNewWords(dict, perDayStudyNumber, known)

        // 打散顺序，避免永远「先新词后复习」
        const list = shuffle([...newWords, ...review])
        set({
          fsrsData: cards,
          session: {
            dictId,
            kind: 'dict',
            wordIds: list.map(w => w.word),
            index: 0,
            wrongTimes: {},
            keystrokes: 0,
            startedAt: Date.now(),
            flushedMs: 0,
            flushedKeys: 0,
          },
        })
      },

      startWrongSession(limit = 20) {
        const { wrongWords, dicts, knownWords } = get()
        const known = new Set(knownWords)
        const ids = Object.values(wrongWords)
          .filter(r => !known.has(r.word))
          .sort((a, b) => b.count - a.count || b.lastWrongAt - a.lastWrongAt)
          .map(r => r.word)
          .filter(w => findWordInDicts(dicts, w))
          .slice(0, Math.max(1, limit))
        if (!ids.length) return false

        const owner = dicts.find(d => d.words.some(w => w.word === ids[0])) ?? dicts[0]
        set({ session: makeSession(ids, 'wrong', owner?.id ?? '') })
        return true
      },

      startCollectSession(limit = 20, title?: string) {
        const { collect, dicts, knownWords } = get()
        const known = new Set(knownWords)
        const ids = collect.filter(w => !known.has(w) && findWordInDicts(dicts, w)).slice(0, Math.max(1, limit))
        if (!ids.length) return false

        const owner = dicts.find(d => d.words.some(w => w.word === ids[0])) ?? dicts[0]
        set({ session: { ...makeSession(ids, 'collect', owner?.id ?? ''), title } })
        return true
      },

      startCustomSession(words, title) {
        const list = words.filter(w => w.word)
        if (!list.length) return
        set({
          session: {
            ...makeSession(list.map(w => w.word), 'article', ''),
            title,
            words: list,
          },
        })
      },

      clearSession() {
        set({ session: null })
      },

      /** 回到本组第 1 词重练，并清零已落盘的统计基准 */
      restartSession() {
        const s = get().session
        if (!s) return
        set({
          session: {
            ...s,
            index: 0,
            wrongTimes: {},
            keystrokes: 0,
            startedAt: Date.now(),
            flushedMs: 0,
            flushedKeys: 0,
            done: false,
          },
        })
      },

      getSessionWords() {
        const { session, dicts } = get()
        if (!session) return []
        // 文章练习等临时会话自带词条
        if (session.words?.length) {
          const byWord = new Map(session.words.map(w => [w.word, w]))
          return session.wordIds.map(id => byWord.get(id)).filter((w): w is CnWord => Boolean(w))
        }
        const owner = dicts.find(d => d.id === session.dictId)
        // 错词练习可能跨词库，先在本库找，找不到再全库找
        const find = (word: string) => {
          const hit = owner?.words.find(w => w.word === word)
          if (hit) return hit
          for (const d of dicts) {
            const h = d.words.find(w => w.word === word)
            if (h) return h
          }
          return undefined
        }
        return session.wordIds.map(find).filter((w): w is CnWord => Boolean(w))
      },

      addSessionStat(spendMs, keystrokes, startedAt) {
        const state = get()
        const session = state.session
        if (session?.done) return
        if (startedAt !== undefined && session && session.startedAt !== startedAt) return
        const dMs = spendMs - (session?.flushedMs ?? 0)
        const dKeys = keystrokes - (session?.flushedKeys ?? 0)
        if (dMs <= 0 && dKeys <= 0) return

        const statistics = state.statistics.slice()
        const date = today()
        const idx = statistics.findIndex(s => s.date === date)
        const entry: Statistics = statistics[idx] ?? {
          date,
          spend: 0,
          total: 0,
          correct: 0,
          wrong: 0,
          keystrokes: 0,
        }
        entry.spend += Math.max(0, dMs)
        entry.keystrokes += Math.max(0, dKeys)
        if (idx >= 0) statistics[idx] = entry
        else statistics.push(entry)

        set({
          statistics,
          session: session
            ? { ...session, flushedMs: spendMs, flushedKeys: keystrokes }
            : null,
        })
      },

      finishSession(spendMs, keystrokes) {
        get().addSessionStat(spendMs, keystrokes)
        const session = get().session
        if (session) set({ session: { ...session, done: true } })
      },

      commitWord(word, wrongTimes) {
        const state = get()
        const session = state.session

        // 当日统计：所有会话都要记
        const date = today()
        const statistics = state.statistics.slice()
        const idx = statistics.findIndex(s => s.date === date)
        const entry: Statistics = statistics[idx] ?? {
          date,
          spend: 0,
          total: 0,
          correct: 0,
          wrong: 0,
          keystrokes: 0,
        }
        entry.total += 1
        entry.wrong += wrongTimes
        entry.correct += wrongTimes === 0 ? 1 : 0
        if (idx >= 0) statistics[idx] = entry
        else statistics.push(entry)

        /** 落盘并把会话推进到下一个词 */
        const advance = (extra: Partial<BaseState>) =>
          set({
            ...extra,
            statistics,
            session: session
              ? {
                  ...session,
                  index: session.index + 1,
                  wrongTimes: { ...session.wrongTimes, [word.word]: wrongTimes },
                  keystrokes: 0,
                }
              : null,
          })

        const dict = state.dicts.find(d => d.id === (session?.dictId ?? state.currentDictId))
        // 文章练习只统计，不进记忆曲线与错词本；找不到归属词库时至少别卡住进度
        if (!dict || session?.kind === 'article') {
          advance({})
          return
        }

        const isNew = !state.fsrsData[word.word]
        const { fsrsLimits, fsrsParams } = useSettingStore.getState()
        const grade = gradeByWrongTimes(wrongTimes, fsrsLimits)
        const nextCard = reviewCard(reviveCard(state.fsrsData[word.word]), grade, fsrsParams)

        const fsrsData = { ...state.fsrsData, [word.word]: serializeCard(nextCard) }
        const wrongWords = { ...state.wrongWords }
        if (wrongTimes > 0) {
          const prev = wrongWords[word.word]
          wrongWords[word.word] = {
            word: word.word,
            dictId: dict.id,
            count: (prev?.count ?? 0) + 1,
            lastWrongAt: Date.now(),
          }
        } else if (wrongWords[word.word]) {
          wrongWords[word.word] = { ...wrongWords[word.word], count: Math.max(0, wrongWords[word.word].count - 1) }
          if (wrongWords[word.word].count === 0) delete wrongWords[word.word]
        }

        // 新词推进学习指针
        const dicts = state.dicts.map(d =>
          d.id === dict.id ? { ...d, lastLearnIndex: isNew ? d.lastLearnIndex + 1 : d.lastLearnIndex } : d
        )

        advance({ fsrsData, wrongWords, dicts })
      },

      toggleKnown(word) {
        const known = get().knownWords
        set({ knownWords: known.includes(word) ? known.filter(w => w !== word) : [...known, word] })
      },

      clearKnown() {
        set({ knownWords: [] })
      },

      toggleCollect(word) {
        set(state => ({
          collect: state.collect.includes(word) ? state.collect.filter(w => w !== word) : [...state.collect, word],
        }))
      },

      clearCollect() {
        set({ collect: [] })
      },

      removeWrong(word) {
        const wrongWords = { ...get().wrongWords }
        delete wrongWords[word]
        set({ wrongWords })
      },

      resetWrong() {
        set({ wrongWords: {} })
      },

      exportData() {
        const s = get()
        return JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            dicts: s.dicts,
            wrongWords: s.wrongWords,
            knownWords: s.knownWords,
            collect: s.collect,
            fsrsData: s.fsrsData,
            statistics: s.statistics,
          },
          null,
          2
        )
      },

      importData(json) {
        let raw: unknown
        try {
          raw = JSON.parse(json)
        } catch {
          return { ok: false, code: 'notJson' }
        }
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
          return { ok: false, code: 'notObject' }
        }
        const data = raw as Record<string, unknown>
        const keys = ['dicts', 'wrongWords', 'knownWords', 'collect', 'fsrsData', 'statistics'] as const
        if (!keys.some(k => k in data)) {
          return { ok: false, code: 'noFields' }
        }
        if ('dicts' in data && !Array.isArray(data.dicts)) return { ok: false, code: 'badDicts' }
        if ('knownWords' in data && !Array.isArray(data.knownWords)) return { ok: false, code: 'badKnown' }
        if ('statistics' in data && !Array.isArray(data.statistics)) return { ok: false, code: 'badStats' }
        if ('wrongWords' in data && (typeof data.wrongWords !== 'object' || data.wrongWords === null)) {
          return { ok: false, code: 'badWrong' }
        }
        const s = get()
        set({
          dicts: Array.isArray(data.dicts) ? (data.dicts as LearningDict[]) : s.dicts,
          wrongWords: (data.wrongWords as Record<string, WrongRecord>) ?? s.wrongWords,
          knownWords: (data.knownWords as string[]) ?? s.knownWords,
          collect: (data.collect as string[]) ?? s.collect,
          fsrsData: (data.fsrsData as Record<string, CardRecord>) ?? s.fsrsData,
          statistics: (data.statistics as Statistics[]) ?? s.statistics,
          currentDictId: s.dicts.some(d => d.id === s.currentDictId) ? s.currentDictId : (s.dicts[0]?.id ?? null),
          session: null,
        })
        return { ok: true, code: 'importOk' }
      },
    }),
    {
      name: 'cn-type-base-v1',
      partialize: state => ({
        dicts: state.dicts,
        currentDictId: state.currentDictId,
        wrongWords: state.wrongWords,
        knownWords: state.knownWords,
        collect: state.collect,
        fsrsData: state.fsrsData,
        statistics: state.statistics,
        session: state.session,
      }),
    }
  )
)

