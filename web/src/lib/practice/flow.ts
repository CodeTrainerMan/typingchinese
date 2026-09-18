import type { PracticeMode, StepType } from '../types'

/**
 * 练习流程编排（对齐参考项目 TypeWords 的 practice-flow-config）：
 * 一次会话 = 若干个步骤(step)，一个步骤 = 用同一种方式把一批词跑一遍。
 *
 * - smart：跟写 → 听写 → 默写，逐步加大难度；每个步骤打错的词会自动补练一轮（见 base store 的 nextStep）
 * - 其余模式：只跑一个步骤
 */
export const STEPS_OF: Record<PracticeMode, StepType[]> = {
  smart: ['spell', 'dictation', 'write'],
  spell: ['spell'],
  dictation: ['dictation'],
  test: ['test'],
  write: ['write'],
}

/** 错词本 / 收藏本这类「补练型」会话量本来就大，smart 只跑跟写 + 默写两步 */
export const SHORT_STEPS_OF: Record<PracticeMode, StepType[]> = {
  smart: ['spell', 'write'],
  spell: ['spell'],
  dictation: ['dictation'],
  test: ['test'],
  write: ['write'],
}

export const stepsOf = (mode: PracticeMode, short = false): StepType[] =>
  (short ? SHORT_STEPS_OF : STEPS_OF)[mode] ?? ['spell']

/** 非跟写步骤一律遮住答案（卡片上的汉字、输入区上方的汉字、拼音提示） */
export const isMaskedStep = (step: StepType) => step !== 'spell'

/** 听写步骤必须发音，否则没有题目 */
export const isAudioStep = (step: StepType) => step === 'dictation'

/** 只有跟写与自测给出拼音提示 */
export const showsPinyinStep = (step: StepType) => step === 'spell' || step === 'test'
