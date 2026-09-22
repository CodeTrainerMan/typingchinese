'use client'

/**
 * 书写画布：一个米字格，三种用法。
 *
 * - trace 描红：显示淡色字形当底样，上面盖一层 canvas，鼠标/手指自由摹写，不判定对错
 * - animate 演示：hanzi-writer 逐笔播放笔顺动画
 * - quiz 测验：hanzi-writer 按笔顺逐笔判定，写错抖动提示，写完回调错笔数
 *
 * 笔顺数据走自己的 /hanzi/<字>.json（由 scripts/gen-hanzi.mjs 生成子集），
 * 不从 CDN 拉：离线可用，也没有首字加载延迟。
 */

import { useEffect, useRef, useState } from 'react'
import type HanziWriterType from 'hanzi-writer'
import type { CharacterJson } from 'hanzi-writer'

export type WriteMode = 'trace' | 'animate' | 'quiz'

/** 描红底样的灰色：比正文淡，摹写时能看清自己写的笔画盖在哪 */
const TRACE_COLOR = '#a8adb8'
/** 演示时的笔画色 */
const STROKE_COLOR = '#2e2e2e'

/** 字数据缓存：同一个字在一次会话里只 fetch 一次 */
const cache = new Map<string, CharacterJson>()

function loadCharData(char: string, onLoad: (data: CharacterJson) => void, onError?: (err?: unknown) => void) {
  const hit = cache.get(char)
  if (hit) {
    onLoad(hit)
    return
  }
  fetch(`/hanzi/${encodeURIComponent(char)}.json`)
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then(data => {
      cache.set(char, data)
      onLoad(data)
    })
    .catch(err => onError?.(err))
}

/** 米字格：田字格两条虚线 + 两条对角线，写字时用来对位置和比例 */
function GridBackdrop({ size }: { size: number }) {
  const mid = size / 2
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none absolute inset-0 h-full w-full text-line"
      aria-hidden="true"
    >
      <rect
        x="0.5"
        y="0.5"
        width={size - 1}
        height={size - 1}
        rx="8"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
      />
      <path
        d={`M${mid} 0 V${size} M0 ${mid} H${size}`}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="6 6"
      />
      <path
        d={`M0 0 L${size} ${size} M${size} 0 L0 ${size}`}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="4 8"
        opacity={0.6}
      />
    </svg>
  )
}

export default function WriteBoard({
  char,
  mode,
  size = 320,
  runKey = 0,
  resetKey = 0,
  onQuizComplete,
  errorText = 'No stroke data',
}: {
  char: string
  mode: WriteMode
  /** 递增即重跑当前模式（再放一次动画 / 重考一次） */
  runKey?: number
  /** 递增即清空描红层 */
  resetKey?: number
  size?: number
  onQuizComplete?: (mistakes: number) => void
  errorText?: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const writerRef = useRef<HanziWriterType | null>(null)
  const completeRef = useRef(onQuizComplete)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  completeRef.current = onQuizComplete

  // 建实例：只依赖字和尺寸，切模式不重建（否则描红笔迹会闪掉）
  useEffect(() => {
    let disposed = false
    setFailed(false)
    setReady(false)
    void (async () => {
      const { default: HanziWriter } = await import('hanzi-writer')
      if (disposed || !hostRef.current) return
      hostRef.current.innerHTML = ''
      writerRef.current = HanziWriter.create(hostRef.current, char, {
        width: size,
        height: size,
        padding: 20,
        showOutline: true,
        showCharacter: true,
        strokeColor: STROKE_COLOR,
        outlineColor: '#dcdde1',
        charDataLoader: loadCharData,
        onLoadCharDataSuccess: () => !disposed && setReady(true),
        onLoadCharDataError: () => !disposed && setFailed(true),
      })
    })()
    return () => {
      disposed = true
      writerRef.current?.cancelQuiz()
      writerRef.current = null
      if (hostRef.current) hostRef.current.innerHTML = ''
    }
  }, [char, size])

  // 按模式驱动：描红显示字形、演示播动画、测验开判定
  useEffect(() => {
    const writer = writerRef.current
    if (!writer || !ready) return
    writer.cancelQuiz()
    if (mode === 'trace') {
      void writer.updateColor('strokeColor', TRACE_COLOR, { duration: 0 })
      void writer.showCharacter({ duration: 0 })
      return
    }
    if (mode === 'animate') {
      void writer.updateColor('strokeColor', STROKE_COLOR, { duration: 0 })
      void writer.showCharacter({ duration: 0 })
      void writer.animateCharacter()
      return
    }
    // quiz：只留轮廓，按笔顺写
    void writer.hideCharacter({ duration: 0 })
    void writer.quiz({
      leniency: 1,
      showHintAfterMisses: 1,
      highlightOnComplete: true,
      onComplete: ({ totalMistakes }) => completeRef.current?.(totalMistakes),
    })
  }, [mode, ready, runKey, char, size])

  // 画布按设备像素比放大，否则高分屏上的笔画是糊的
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, [size])

  const clearTrace = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, size, size)
    drawing.current = false
    last.current = null
  }

  // 换字或点「清空」时擦掉描红层
  useEffect(() => {
    clearTrace()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, char, size])

  const pointOf = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'trace') return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pointOf(e)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'trace' || !drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    const start = last.current
    if (!ctx || !start) return
    const p = pointOf(e)
    // 跟着主题走：深色模式下 brand 是浅蓝，浅色模式下是深蓝
    const brand = getComputedStyle(e.currentTarget).getPropertyValue('--brand').trim()
    ctx.strokeStyle = brand || '#2563eb'
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
  }

  const endStroke = () => {
    drawing.current = false
    last.current = null
  }

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>
      <GridBackdrop size={size} />
      {/* hanzi-writer 自己往这里塞 svg；描红模式下只当底样，不接事件 */}
      <div ref={hostRef} className="absolute inset-0" />
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className={`absolute inset-0 touch-none ${
          mode === 'trace' ? 'cursor-crosshair' : 'pointer-events-none'
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
      />
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 text-sm text-dim">
          {errorText}
        </div>
      )}
    </div>
  )
}
