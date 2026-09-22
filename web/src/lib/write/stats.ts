/**
 * 手写练习的统计与错字本（纯函数，便于单测；store 只负责调用它们）。
 *
 * 与打字的错词本是两套：错词是「拼音打错」，错字是「笔画写错」，混在一起没有意义。
 */

/** 错字记录：写错一笔就记一次，写对一次递减，归零即移除（与错词本同一套手感） */
export interface WrongChar {
  char: string
  count: number
  lastWrongAt: number
}

/** 每日写字统计：spend 毫秒 / chars 完成字数 / mistakes 写错笔数 */
export interface WriteDaily {
  date: string
  spend: number
  chars: number
  mistakes: number
}

/** 只留最近这么多天的统计，够看趋势又不占 localStorage */
export const MAX_DAILY = 400

/** 按 UTC 切日，与 base store 的统计保持一致，避免同一天出现两条记录 */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function applyCharResult(
  wrong: Record<string, WrongChar>,
  char: string,
  mistakes: number
): Record<string, WrongChar> {
  const next = { ...wrong }
  const prev = next[char]
  if (mistakes > 0) {
    next[char] = { char, count: (prev?.count ?? 0) + 1, lastWrongAt: Date.now() }
  } else if (prev) {
    const count = Math.max(0, prev.count - 1)
    if (count === 0) delete next[char]
    else next[char] = { ...prev, count }
  }
  return next
}

/** 把一次增量累加进当日统计；当天还没有条目就新建一条 */
export function accumulateDaily(
  daily: WriteDaily[],
  date: string,
  patch: Partial<Omit<WriteDaily, 'date'>>
): WriteDaily[] {
  const idx = daily.findIndex(d => d.date === date)
  if (idx === -1) {
    const created: WriteDaily = { date, spend: 0, chars: 0, mistakes: 0, ...patch }
    return [...daily, created].slice(-MAX_DAILY)
  }
  const next = daily.slice()
  const cur = next[idx]
  next[idx] = {
    date,
    spend: cur.spend + (patch.spend ?? 0),
    chars: cur.chars + (patch.chars ?? 0),
    mistakes: cur.mistakes + (patch.mistakes ?? 0),
  }
  return next
}

/** 今日统计（没有就返回空条目，页面不用判空） */
export function todayStat(daily: WriteDaily[], date = today()): WriteDaily {
  return daily.find(d => d.date === date) ?? { date, spend: 0, chars: 0, mistakes: 0 }
}

/** 错字按「写错次数降序 → 最近写错时间降序」排，最该练的排前面 */
export function sortedWrongChars(wrong: Record<string, WrongChar>): WrongChar[] {
  return Object.values(wrong).sort((a, b) => b.count - a.count || b.lastWrongAt - a.lastWrongAt)
}
