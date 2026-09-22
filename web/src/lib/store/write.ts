/**
 * 手写练习数据：错字本 + 每日统计。
 *
 * 仿 extra.ts 单独持久化，不并入 base：
 * - 不用动 base 的 partialize / migrate / exportData / importData，也不用把 version 升到 2；
 * - 打字的学习进度、导入导出、备份都不受写字模块影响，删掉也不心疼。
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS, guardedJSONStorage } from '../storage'
import {
  accumulateDaily,
  applyCharResult,
  today,
  type WriteDaily,
  type WrongChar,
} from '../write/stats'

export interface WriteState {
  /** 写错过的字：char → 记录 */
  wrongChars: Record<string, WrongChar>
  /** 每日统计 */
  daily: WriteDaily[]
  /** 记一个字的书写结果：mistakes 是写错的笔数（0 表示一笔没错） */
  commitChar: (char: string, mistakes: number) => void
  /** 累加练习时长（毫秒） */
  addSpend: (ms: number) => void
  removeWrongChar: (char: string) => void
  clearWrongChars: () => void
}

export const useWriteStore = create<WriteState>()(
  persist(
    set => ({
      wrongChars: {},
      daily: [],

      commitChar(char, mistakes) {
        set(state => ({
          wrongChars: applyCharResult(state.wrongChars, char, mistakes),
          daily: accumulateDaily(state.daily, today(), { chars: 1, mistakes }),
        }))
      },

      addSpend(ms) {
        set(state => ({ daily: accumulateDaily(state.daily, today(), { spend: ms }) }))
      },

      removeWrongChar(char) {
        set(state => {
          const next = { ...state.wrongChars }
          delete next[char]
          return { wrongChars: next }
        })
      },

      clearWrongChars() {
        set({ wrongChars: {} })
      },
    }),
    {
      name: STORAGE_KEYS.write,
      storage: guardedJSONStorage<Partial<WriteState>>(),
      version: 1,
    }
  )
)
