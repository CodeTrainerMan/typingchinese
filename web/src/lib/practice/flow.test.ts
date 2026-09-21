import { describe, expect, it } from 'vitest'
import type { PracticeMode, StepType } from '../types'
import {
  isAudioStep,
  isMaskedStep,
  showsPinyinStep,
  stepsOf,
  withoutAudioStep,
} from './flow'

describe('stepsOf', () => {
  it('智能模式三步：跟写 → 听写 → 默写', () => {
    expect(stepsOf('smart')).toEqual<StepType[]>(['spell', 'dictation', 'write'])
  })

  it('错词本这种大量词的会话只跑跟写 + 默写', () => {
    expect(stepsOf('smart', true)).toEqual<StepType[]>(['spell', 'write'])
  })

  it('单模式只有一个步骤', () => {
    expect(stepsOf('dictation')).toEqual<StepType[]>(['dictation'])
    expect(stepsOf('write')).toEqual<StepType[]>(['write'])
    expect(stepsOf('test', true)).toEqual<StepType[]>(['test'])
  })

  it('未知模式退回跟写，不会解出 undefined', () => {
    expect(stepsOf('nope' as PracticeMode)).toEqual<StepType[]>(['spell'])
  })
})

describe('步骤属性', () => {
  it('只有跟写露出答案', () => {
    expect(isMaskedStep('spell')).toBe(false)
    expect(isMaskedStep('test')).toBe(true)
    expect(isMaskedStep('write')).toBe(true)
  })

  it('只有听写需要发音', () => {
    expect(isAudioStep('dictation')).toBe(true)
    expect(isAudioStep('spell')).toBe(false)
  })

  it('跟写与自测给拼音提示', () => {
    expect(showsPinyinStep('spell')).toBe(true)
    expect(showsPinyinStep('test')).toBe(true)
    expect(showsPinyinStep('write')).toBe(false)
  })
})

describe('withoutAudioStep（没装中文音色时的降级）', () => {
  const steps: StepType[] = ['spell', 'dictation', 'write']

  it('有音色时原样返回', () => {
    expect(withoutAudioStep(steps, true)).toEqual(steps)
  })

  it('没音色时听写退回跟写，其余步骤不动', () => {
    expect(withoutAudioStep(steps, false)).toEqual<StepType[]>(['spell', 'spell', 'write'])
  })

  it('不修改入参数组', () => {
    const input: StepType[] = ['dictation']
    withoutAudioStep(input, false)
    expect(input).toEqual<StepType[]>(['dictation'])
  })
})
