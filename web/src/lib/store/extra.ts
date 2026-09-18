/**
 * 跟读记录与自己粘贴的文章：不进主学习数据（base），单独持久化，删掉也不影响学习进度。
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 一次跟读打分 */
export interface ReadRecord {
  id: string
  articleId: string
  articleTitle: string
  sentence: string
  score: number
  heard: string
  at: number
}

/** 自己粘贴的练习文章 */
export interface CustomArticle {
  id: string
  title: string
  text: string
  at: number
}

/** 跟读记录最多留 200 条，够看趋势又不占地方 */
const MAX_RECORDS = 200
const MAX_ARTICLES = 50

interface ExtraState {
  readRecords: ReadRecord[]
  articles: CustomArticle[]
  /** 记一次跟读；最新的排在最前 */
  addReadRecord: (record: Omit<ReadRecord, 'id' | 'at'>) => void
  clearReadRecords: () => void
  addArticle: (title: string, text: string) => void
  removeArticle: (id: string) => void
}

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

export const useExtraStore = create<ExtraState>()(
  persist(
    set => ({
      readRecords: [],
      articles: [],

      addReadRecord(record) {
        set(state => ({
          readRecords: [{ ...record, id: uid(), at: Date.now() }, ...state.readRecords].slice(0, MAX_RECORDS),
        }))
      },

      clearReadRecords() {
        set({ readRecords: [] })
      },

      addArticle(title, text) {
        set(state => ({
          articles: [{ id: uid(), title, text, at: Date.now() }, ...state.articles].slice(0, MAX_ARTICLES),
        }))
      },

      removeArticle(id) {
        set(state => ({ articles: state.articles.filter(a => a.id !== id) }))
      },
    }),
    { name: 'cn-type-extra-v1', version: 1 }
  )
)
