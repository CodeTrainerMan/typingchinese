import { describe, expect, it } from 'vitest'
import { PINYIN_AUDIO_DIR, pinyinAudioFile } from './pinyinAudio'

describe('pinyinAudioFile', () => {
  it('声母 / 韵母 / 整体认读都用本体的录音', () => {
    expect(pinyinAudioFile('b', 'b')).toBe('b.mp3')
    expect(pinyinAudioFile('ui', 'ui')).toBe('ui.mp3')
    expect(pinyinAudioFile('zhi', 'zhī')).toBe('zhi.mp3')
  })

  it('ü 系列按 v 取文件（文件系统不放 ü）', () => {
    expect(pinyinAudioFile('ü', 'ǖ')).toBe('v.mp3')
    expect(pinyinAudioFile('üe', 'yuè')).toBe('ve.mp3')
    expect(pinyinAudioFile('yu', 'yū')).toBe('v.mp3')
  })

  it('y / w 与 i / u 是同一份录音', () => {
    expect(pinyinAudioFile('y', 'y')).toBe('i.mp3')
    expect(pinyinAudioFile('w', 'w')).toBe('u.mp3')
    expect(pinyinAudioFile('yi', 'yī')).toBe('i.mp3')
    expect(pinyinAudioFile('wu', 'wū')).toBe('u.mp3')
  })

  it('非本体格（四声示范）回退到「音节 + 声调数字」', () => {
    expect(pinyinAudioFile('mā', 'mā')).toBe('ma1.mp3')
    expect(pinyinAudioFile('mǎ', 'mǎ')).toBe('ma3.mp3')
    expect(pinyinAudioFile('ér', 'ér')).toBe('er2.mp3')
  })

  it('读不出声调就返回 null，由调用方退回浏览器 TTS', () => {
    expect(pinyinAudioFile('?', 'zhong')).toBeNull()
  })

  it('录音目录是 public/audio/pinyin', () => {
    expect(PINYIN_AUDIO_DIR).toBe('/audio/pinyin')
  })
})
