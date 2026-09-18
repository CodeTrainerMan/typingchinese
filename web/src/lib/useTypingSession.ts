'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CnWord, InputMode, NextKey, ReplayKey } from './types'
import { afterWrongBackspace, getSyllableGroups, isCharCorrect, isComplete, isCorrect } from './typing'
import { playCorrectSound, playKeySound, playWrong } from './sounds'
import { cancelSpeak, speak } from './tts'

export interface TypingSessionConfig {
  repeatCount: number
  waitTime: number
  autoNext: boolean
  inputWrongClear: boolean
  keyboardSound: boolean
  effectSound: boolean
  autoSound: boolean
  dictation: boolean
  soundVolume: number
  soundSpeed: number
  voiceURI: string
  /** 是否接受数字键（声调模式需要输入 1-4 调号） */
  allowDigits: boolean
  /** 输入方式：hanzi 模式下接受中文输入法上屏的汉字，而不是拉丁字母 */
  inputMode: InputMode
  /** 重听发音的快捷键 */
  replayKey: ReplayKey
  /** 完成后进入下一词的按键 */
  nextKey: NextKey
}

/** 重听键对应的 KeyboardEvent.key */
export const replayKeyOf = (mode: ReplayKey) => (mode === 'f2' ? 'F2' : 'Tab')

/** 判断按键是否为「进入下一词」 */
export const isNextKey = (key: string, mode: NextKey) =>
  mode === 'both' ? key === 'Enter' || key === ' ' : mode === 'space' ? key === ' ' : key === 'Enter'

export interface TypingSessionHandle {
  word: CnWord | undefined
  target: string
  input: string
  groups: ReturnType<typeof getSyllableGroups>
  wrongTimes: number
  progress: { index: number; total: number }
  repeatLabel: string
  waitingNext: boolean
  finished: boolean
  stats: { keys: number; wrong: number }
  /** 检测到中文输入法激活（按键被 IME 吞掉），需要提示用户切英文键盘 */
  imeDetected: boolean
  /** 从本组开始到现在的真实用时（毫秒），用于统计落盘 */
  elapsed: () => number
  /** 直接喂一个按键（虚拟键盘 / 软键盘输入用） */
  type: (key: string) => void
  skip: () => void
  restart: () => void
  playCurrent: () => void
}

interface Options {
  words: CnWord[]
  getTarget: (word: CnWord) => string
  getSyllables: (word: CnWord) => string[]
  config: TypingSessionConfig
  onWordDone: (word: CnWord, wrongTimes: number) => void
  onFinish: (stats: { spendMs: number; keys: number }) => void
}

interface Snapshot {
  index: number
  input: string
  wrongTimes: number
  repeat: number
  waitingNext: boolean
  finished: boolean
}

const initialSnapshot = (): Snapshot => ({
  index: 0,
  input: '',
  wrongTimes: 0,
  repeat: 0,
  waitingNext: false,
  finished: false,
})

export function useTypingSession({
  words,
  getTarget,
  getSyllables,
  config,
  onWordDone,
  onFinish,
}: Options): TypingSessionHandle {
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot)
  const [stats, setStats] = useState({ keys: 0, wrong: 0 })
  const [imeDetected, setImeDetected] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapshotRef = useRef<Snapshot>(snapshot)
  const startedAtRef = useRef(0)

  useEffect(() => {
    startedAtRef.current = Date.now()
  }, [])

  // 渲染后同步快照引用，供键盘事件回调读取最新状态
  useEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      clearTimer()
      cancelSpeak()
    }
  }, [clearTimer])

  const word = words[snapshot.index]
  const target = useMemo(() => (word ? getTarget(word) : ''), [word, getTarget])
  const syllables = useMemo(() => (word ? getSyllables(word) : []), [word, getSyllables])

  const playCurrent = useCallback(() => {
    if (!word) return
    speak(word.word, {
      rate: config.soundSpeed,
      volume: config.soundVolume / 100,
      voiceURI: config.voiceURI,
    })
  }, [word, config.soundSpeed, config.soundVolume, config.voiceURI])

  // 换词时自动发音（听写模式必发音）
  useEffect(() => {
    if (!word) return
    if (config.autoSound || config.dictation) playCurrent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.word, config.dictation])

  const gotoNext = useCallback(() => {
    clearTimer()
    const cur = words[snapshotRef.current.index]
    if (cur) onWordDone(cur, snapshotRef.current.wrongTimes)

    if (snapshotRef.current.index + 1 >= words.length) {
      const next: Snapshot = { ...snapshotRef.current, finished: true }
      snapshotRef.current = next
      setSnapshot(next)
      onFinish({ spendMs: Date.now() - startedAtRef.current, keys: stats.keys })
      return
    }

    const next: Snapshot = {
      ...initialSnapshot(),
      index: snapshotRef.current.index + 1,
    }
    snapshotRef.current = next
    setSnapshot(next)
  }, [words, onWordDone, onFinish, clearTimer, stats.keys])

  const skip = useCallback(() => {
    if (snapshotRef.current.finished) return
    gotoNext()
  }, [gotoNext])

  const elapsed = useCallback(() => Date.now() - startedAtRef.current, [])

  const handleKey = useCallback(
    (key: string) => {
      const s = snapshotRef.current
      if (s.finished || !word || !target) return

      // 重听发音 / Esc 跳过当前词
      if (key === replayKeyOf(config.replayKey)) {
        playCurrent()
        return
      }
      if (key === 'Escape') {
        skip()
        return
      }

      // 等待进入下一词时，按设置的继续键前进
      if (s.waitingNext) {
        if (isNextKey(key, config.nextKey)) gotoNext()
        return
      }

      if (key === 'Backspace') {
        const nextInput = afterWrongBackspace(s.input, target)
        const next: Snapshot = { ...s, input: nextInput }
        snapshotRef.current = next
        setSnapshot(next)
        return
      }

      if (key.length !== 1) return
      const isLetter = /[a-zA-Z]/.test(key)
      const isDigit = /[0-9]/.test(key)
      const isHan = /[一-龥]/.test(key)
      if (config.inputMode === 'hanzi') {
        // 汉字模式：只认中文输入法上屏的汉字
        if (!isHan) return
      } else if (!isLetter && !(isDigit && config.allowDigits)) return

      // 能收到拉丁字母，说明键盘已切回英文
      setImeDetected(false)
      const lower = key.toLowerCase()
      const ok = isCharCorrect(lower, target[s.input.length])
      if (config.keyboardSound) playKeySound()
      if (!ok && config.effectSound) playWrong()

      const nextInput = s.input + lower
      setStats(prev => ({ keys: prev.keys + 1, wrong: prev.wrong + (ok ? 0 : 1) }))

      if (!isComplete(nextInput, target)) {
        const next: Snapshot = {
          ...s,
          input: nextInput,
          wrongTimes: s.wrongTimes + (ok ? 0 : 1),
        }
        snapshotRef.current = next
        setSnapshot(next)
        return
      }

      if (isCorrect(nextInput, target)) {
        if (config.effectSound) playCorrectSound()
        const nextRepeat = s.repeat + 1
        if (nextRepeat < config.repeatCount) {
          const next: Snapshot = { ...s, input: '', repeat: nextRepeat, wrongTimes: s.wrongTimes }
          snapshotRef.current = next
          setSnapshot(next)
          clearTimer()
          timerRef.current = setTimeout(() => {
            const cleared: Snapshot = { ...snapshotRef.current, input: '' }
            snapshotRef.current = cleared
            setSnapshot(cleared)
          }, Math.max(150, config.waitTime))
        } else if (config.autoNext) {
          const next: Snapshot = { ...s, input: nextInput, waitingNext: true }
          snapshotRef.current = next
          setSnapshot(next)
          clearTimer()
          timerRef.current = setTimeout(gotoNext, Math.max(200, config.waitTime))
        } else {
          const next: Snapshot = { ...s, input: nextInput, waitingNext: true }
          snapshotRef.current = next
          setSnapshot(next)
        }
        return
      }

      // 整词打错：按设置清空或保留供退格
      const next: Snapshot = {
        ...s,
        input: config.inputWrongClear ? '' : nextInput,
        wrongTimes: s.wrongTimes + 1,
      }
      snapshotRef.current = next
      setSnapshot(next)
    },
    [word, target, config, gotoNext, clearTimer, skip, playCurrent]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 汉字模式：按键都交给中文输入框，这里只管重听与跳过
      if (config.inputMode === 'hanzi') {
        if (e.isComposing || e.keyCode === 229) return
        const replay = replayKeyOf(config.replayKey)
        if (e.key === replay || e.key === 'Tab') {
          e.preventDefault()
          playCurrent()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          skip()
        }
        return
      }
      // 输入法组合中（中文 IME）不处理：路线 A 只认拉丁字母
      if (e.isComposing || e.keyCode === 229 || e.key === 'Process') {
        setImeDetected(true)
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      // 本组结束后不再拦截，把 Tab / 空格还给浏览器与键盘导航
      if (snapshotRef.current.finished) return
      if (e.key === replayKeyOf(config.replayKey) || e.key === 'Tab') {
        e.preventDefault()
        if (e.key !== 'Tab' || config.replayKey === 'tab') playCurrent()
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        skip()
        return
      }
      if (e.key === 'Backspace' || isNextKey(e.key, config.nextKey)) e.preventDefault()
      handleKey(e.key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleKey, skip, playCurrent])

  const restart = useCallback(() => {
    clearTimer()
    const next = initialSnapshot()
    snapshotRef.current = next
    startedAtRef.current = Date.now()
    setSnapshot(next)
    setStats({ keys: 0, wrong: 0 })
  }, [clearTimer])

  return {
    word,
    target,
    input: snapshot.input,
    groups: getSyllableGroups(snapshot.input, syllables, word?.pinyin ?? syllables),
    wrongTimes: snapshot.wrongTimes,
    progress: { index: snapshot.index, total: words.length },
    repeatLabel:
      config.repeatCount > 1 ? `${Math.min(snapshot.repeat + 1, config.repeatCount)}/${config.repeatCount}` : '',
    waitingNext: snapshot.waitingNext,
    finished: snapshot.finished,
    stats,
    imeDetected,
    elapsed,
    type: handleKey,
    skip,
    restart,
    playCurrent,
  }
}
