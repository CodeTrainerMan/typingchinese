import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InputMode, Locale, NextKey, PracticeMode, ReplayKey, ThemeMode, TypingMode } from '../types'
import { DEFAULT_FSRS_LIMITS, DEFAULT_FSRS_PARAMS, type FsrsLimits, type FsrsParams } from '../fsrs'

export interface SettingState {
  /** 练习模式：跟写 / 听写 */
  practiceMode: PracticeMode
  /** 判定模式：全拼 / 简拼 */
  typingMode: TypingMode
  /** 输入方式：英文键盘敲拼音 / 中文输入法打汉字 */
  inputMode: InputMode
  /** 跟写模式是否显示拼音提示 */
  showPinyin: boolean
  showTrans: boolean
  /** 每个词重复练习次数 */
  repeatCount: number
  /** 完成后停留多久自动进入下一个（ms） */
  waitTime: number
  autoNext: boolean
  /** 整词打错后自动清空重来 */
  inputWrongClear: boolean
  /** 每日学习量 */
  perDayStudyNumber: number
  /** 每日目标（完成词条数） */
  dailyGoal: number
  /** 自动发音 */
  autoSound: boolean
  soundVolume: number
  soundSpeed: number
  voiceURI: string
  keyboardSound: boolean
  effectSound: boolean
  /** 显示屏幕虚拟键盘（手机/触屏可用，触屏设备会自动开启） */
  virtualKeyboard: boolean
  /** 主题：跟随系统 / 浅色 / 深色 */
  theme: ThemeMode
  /** 重听发音的快捷键 */
  replayKey: ReplayKey
  /** 完成后进入下一词的按键 */
  nextKey: NextKey
  fsrsLimits: FsrsLimits
  /** 复习比：复习词数量 = 每日学习量 × 该值；0 = 不安排复习 */
  reviewRatio: number
  fsrsParams: FsrsParams
  /** 界面语言（默认英文：产品面向英语母语者学中文） */
  lang: Locale
  /** 是否已按浏览器语言做过首次推断，避免覆盖用户的手动选择 */
  langDetected: boolean
  patch: (patch: Partial<SettingState>) => void
  reset: () => void
}

export const DEFAULT_SETTING = {
  practiceMode: 'spell' as PracticeMode,
  typingMode: 'full' as TypingMode,
  inputMode: 'pinyin' as InputMode,
  showPinyin: true,
  showTrans: true,
  repeatCount: 1,
  waitTime: 300,
  autoNext: true,
  inputWrongClear: true,
  perDayStudyNumber: 20,
  dailyGoal: 20,
  autoSound: true,
  soundVolume: 100,
  soundSpeed: 1,
  voiceURI: '',
  keyboardSound: false,
  effectSound: true,
  virtualKeyboard: false,
  theme: 'system' as ThemeMode,
  replayKey: 'tab' as ReplayKey,
  nextKey: 'both' as NextKey,
  fsrsLimits: DEFAULT_FSRS_LIMITS,
  reviewRatio: 3,
  fsrsParams: DEFAULT_FSRS_PARAMS,
  lang: 'en' as Locale,
  langDetected: false,
}

export const useSettingStore = create<SettingState>()(
  persist(
    set => ({
      ...DEFAULT_SETTING,
      patch: patch => set(patch),
      reset: () => set({ ...DEFAULT_SETTING }),
    }),
    { name: 'cn-type-setting-v1' }
  )
)
