/**
 * 生成汉字笔顺数据子集：把词库里出现过的汉字，从 hanzi-writer-data 复制到 public/hanzi/。
 *
 * 为什么不直接用 CDN、也不全量打包：
 * - CDN 按需拉取要联网，首个字有加载延迟，离线不可用；
 * - 全量 9000+ 字约 20MB，而本项目词库实际用到的字只有几百个；
 * 所以只复制用到的字（每字 1~4KB），运行时按需 fetch，离线可用、加载快。
 *
 * 运行时通过 charDataLoader 从 /hanzi/<字>.json 取数据；
 * index.json 是可练字的清单，页面用它判断某个字有没有笔顺数据，避免 404。
 *
 * 运行：npm run gen:hanzi（词库有增删后需要重新生成）
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dictDir = join(root, 'public', 'dicts')
const dataDir = join(root, 'node_modules', 'hanzi-writer-data')
const outDir = join(root, 'public', 'hanzi')

/** CJK 基本区 + 扩展 A + 兼容表意文字（繁体字也覆盖） */
const HANZI = /[㐀-䶿一-鿿豈-﫿]/

/** 收集所有词库里出现过的汉字 */
const chars = new Set()
const files = readdirSync(dictDir).filter(f => f.endsWith('.json'))
for (const file of files) {
  const raw = JSON.parse(readFileSync(join(dictDir, file), 'utf-8'))
  const words = Array.isArray(raw) ? raw : (raw.words ?? [])
  for (const w of words) {
    const text = typeof w === 'string' ? w : (w?.word ?? '')
    for (const ch of text) if (HANZI.test(ch)) chars.add(ch)
  }
}

mkdirSync(outDir, { recursive: true })
const missing = new Set()
let copied = 0
const available = []
for (const ch of chars) {
  const src = join(dataDir, `${ch}.json`)
  if (!existsSync(src)) {
    missing.add(ch)
    continue
  }
  copyFileSync(src, join(outDir, `${ch}.json`))
  available.push(ch)
  copied++
}

available.sort()
writeFileSync(join(outDir, 'index.json'), JSON.stringify({ chars: available }))

console.log(`hanzi: dicts=${files.length} total=${chars.size} copied=${copied} missing=${missing.size}`)
if (missing.size) console.warn('无笔顺数据的字（页面会跳过）：', [...missing].join(''))
