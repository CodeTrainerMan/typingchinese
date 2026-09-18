import { createEmptyCard, FSRS, type Card, type FSRSParameters, type Grade, Rating, type State } from 'ts-fsrs'

const fsrs = new FSRS({})

export interface FsrsLimits {
  easy: number // 错误次数 <= easy → Easy
  good: number
  hard: number
}

/** 可在设置页调整的算法参数，省掉权重数组这种调参项 */
export interface FsrsParams {
  /** 期望的最小回忆概率，0.9 = 90% 还记得时才复习 */
  requestRetention: number
  /** 最大间隔天数，防止掌握得很牢的词被排到几十年后 */
  maximumInterval: number
  /** 为下次复习时间引入随机，避免大量词挤在同一天 */
  enableFuzz: boolean
}

/** 与 ts-fsrs 默认值保持一致 */
export const DEFAULT_FSRS_PARAMS: FsrsParams = {
  requestRetention: 0.9,
  maximumInterval: 36500,
  enableFuzz: false,
}

export const DEFAULT_FSRS_LIMITS: FsrsLimits = { easy: 0, good: 1, hard: 2 }

/** 按本次练习的错误次数映射 FSRS 评级（移植自 TypeWords hooks/fsrs.ts） */
export function gradeByWrongTimes(wrongTimes: number, limits: FsrsLimits = DEFAULT_FSRS_LIMITS): Grade {
  if (wrongTimes <= limits.easy) return Rating.Easy
  if (wrongTimes <= limits.good) return Rating.Good
  if (wrongTimes <= limits.hard) return Rating.Hard
  return Rating.Again
}

/** 从持久化数据还原 Card（Date 字段在 JSON 里会变成字符串） */
export function reviveCard(raw?: {
  due: string
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: number
  learningSteps?: number
  lastReview?: string
}): Card {
  const empty = createEmptyCard()
  if (!raw) return empty
  return {
    ...empty,
    due: new Date(raw.due),
    stability: raw.stability,
    difficulty: raw.difficulty,
    elapsed_days: raw.elapsedDays,
    scheduled_days: raw.scheduledDays,
    reps: raw.reps,
    lapses: raw.lapses,
    state: raw.state as State,
    learning_steps: raw.learningSteps ?? 0,
    last_review: raw.lastReview ? new Date(raw.lastReview) : undefined,
  }
}

export function serializeCard(card: Card) {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    learningSteps: card.learning_steps,
    lastReview: card.last_review?.toISOString(),
  }
}

/** 复习一次，返回新的 Card；传了 params 就用用户调过的算法参数 */
export function reviewCard(card: Card, grade: Grade, params?: FsrsParams): Card {
  const engine = params
    ? new FSRS({
        request_retention: params.requestRetention,
        maximum_interval: params.maximumInterval,
        enable_fuzz: params.enableFuzz,
      } as Partial<FSRSParameters>)
    : fsrs
  return engine.next(card, new Date(), grade).card
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/**
 * 是否到期：按自然日比较（对齐参考项目 dict.ts:195）。
 * 今天之内到期的词今天就能复习，而不是精确到毫秒等到那一刻。
 */
export function isDue(card: Card | undefined): boolean {
  if (!card) return true
  return startOfDay(card.due) <= startOfDay(new Date())
}
