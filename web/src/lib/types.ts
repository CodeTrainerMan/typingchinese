/** 词条（由 scripts/gen-dict.mjs 预生成，运行时不依赖拼音库） */
export interface CnWord {
  id: string
  word: string // 中国
  pinyin: string[] // ['zhōng','guó'] 带声调，用于展示
  flat: string // 'zhongguo' 判定串（ü 已转 v）
  flatSpaced: string // 'zhong guo'
  toneNum: string // 'zhong1 guo2'
  initials: string // 'zg' 简拼判定串
  syllables: string[] // ['zhong','guo']
  trans: string // 释义
  length: number

  // —— 以下为可选富化信息：由导入文件提供，为空时界面不显示对应区块 ——
  /** 词性，如 名词 / noun */
  pos?: string
  /** 繁体写法 */
  traditional?: string
  /** 部首 */
  radical?: string
  /** 例句（含该词） */
  example?: string
  /** 例句的翻译 / 解释 */
  exampleTrans?: string
  /** 多条例句，每条含中文与英文翻译（enrich 脚本生成，优先于 example / exampleTrans 渲染） */
  examples?: { zh: string; en: string }[]
  /** 同义词，按 、/,/;/ 分隔 */
  synonyms?: string
  /** 反义词，同上 */
  antonyms?: string
  /** 常见搭配，同上 */
  collocations?: string
}

/** 富化字段的键（导入、导出、表单都按这个顺序处理） */
export const RICH_FIELDS = [
  'pos',
  'traditional',
  'radical',
  'example',
  'exampleTrans',
  'synonyms',
  'antonyms',
  'collocations',
] as const

export type RichField = (typeof RICH_FIELDS)[number]

export interface DictResource {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  level: number
  length: number
  url: string
}

/** 用户已加入学习的词库（含学习进度） */
export interface LearningDict extends DictResource {
  words: CnWord[]
  lastLearnIndex: number
  perDayStudyNumber: number
  addedAt: number
}

/** 打字判定模式：全拼 / 简拼 / 声调（带数字调号） */
export type TypingMode = 'full' | 'initials' | 'tone'

/**
 * 输入方式：
 * - pinyin：直接用英文键盘敲拉丁字母，逐字母实时纠错（需要英文输入状态）
 * - hanzi：用中文输入法（微软拼音等）打出汉字，上屏后按整词判定（无法逐字母纠错）
 */
export type InputMode = 'pinyin' | 'hanzi'

/**
 * 学习模式（对齐参考项目 TypeWords 的流程编排）：
 * - smart 智能：跟写 → 听写 → 默写 三步，每步打错的词自动补练一轮
 * - spell 跟写：看汉字打拼音
 * - dictation 听写：只听发音，不显示汉字与拼音
 * - test 自测：只给拼音，写出对应的汉字或拼音
 * - write 默写：只给释义，写出词语
 */
export type PracticeMode = 'smart' | 'spell' | 'dictation' | 'test' | 'write'

/** 流程中的一个步骤类型（smart 模式由多个步骤编排而成） */
export type StepType = Exclude<PracticeMode, 'smart'>

/** 主题：跟随系统 / 浅色 / 深色 */
export type ThemeMode = 'system' | 'light' | 'dark'

/** 重听发音的快捷键 */
export type ReplayKey = 'tab' | 'f2'

/** 完成后进入下一词的按键 */
export type NextKey = 'both' | 'space' | 'enter'

/**
 * 可自定义的功能键动作（对齐参考项目的全自定义快捷键，先上最高频的 5 个）
 * 重听键单独由 replayKey 控制，不在这里，避免两处配置互相打架
 */
export type ShortcutAction = 'skip' | 'pinyin' | 'trans' | 'known' | 'collect' | 'detail'

/** 动作 → 按键；值为 KeyboardEvent.key，空字符串表示该动作未绑定 */
export type ShortcutMap = Record<ShortcutAction, string>

/**
 * 界面语言（只影响 UI 文案，与学习内容无关：词条、拼音、文章永远是中文）
 * 加一种语言 = 在 src/i18n/messages/ 下加一个语言包并登记进 LOCALES
 *
 * 与对标项目（TypeWords）一致，覆盖 es / fr / pt / de / ru / uk / ja / ko / th / vi / id
 */
export type Locale =
  | 'en'
  | 'zh-CN'
  | 'zh-TW'
  | 'es'
  | 'pt'
  | 'fr'
  | 'de'
  | 'ru'
  | 'uk'
  | 'id'
  | 'vi'
  | 'ja'
  | 'ko'
  | 'th'

export interface Statistics {
  date: string // YYYY-MM-DD
  spend: number // 毫秒
  total: number // 完成的词条数
  correct: number
  wrong: number
  keystrokes: number
  /** 当日新学的词条数（首轮首次见到即算新学）；旧存档没有该字段，读取时按 0 处理 */
  newCount?: number
  /** 当日复习的词条数（FSRS 里已有卡片） */
  reviewCount?: number
}

export interface WrongRecord {
  word: string
  dictId: string
  count: number
  lastWrongAt: number
}

export interface CardRecord {
  due: string
  stability: number
  difficulty: number
  elapsedDays: number
  scheduledDays: number
  reps: number
  lapses: number
  state: number
  /** FSRS 学习步进度：不落盘会让 Good 评级永远停在 10 分钟，无法毕业到长期间隔 */
  learningSteps?: number
  lastReview?: string
}
