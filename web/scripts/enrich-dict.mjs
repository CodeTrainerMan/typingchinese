// 把某本词典的「英文释义 + 3 条例句（中文 + 英文翻译）」合并进 public/dicts/<dict>.json。
// 仅补充 trans / examples / example / exampleTrans 字段，不改动原有拼音等字段；缺映射的词跳过。
// 运行：node scripts/enrich-dict.mjs <dict>   （在 web/ 目录下，dict 为 hsk2 / daily / advanced / idiom）
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { argv } from 'node:process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dict = argv[2]
if (!dict) {
  console.error('usage: node scripts/enrich-dict.mjs <dict>')
  process.exit(1)
}
const dictPath = join(__dirname, '..', 'public', 'dicts', `${dict}.json`)
const dataPath = join(__dirname, 'enrich-data', `${dict}.mjs`)
const DATA = (await import('file://' + dataPath)).default

const raw = JSON.parse(readFileSync(dictPath, 'utf-8'))
let filled = 0
let missing = 0
for (const w of raw.words) {
  const d = DATA[w.word]
  if (!d) {
    missing++
    console.warn('[skip] no data for:', w.word)
    continue
  }
  w.trans = d.trans
  w.examples = d.ex.map(([zh, en]) => ({ zh, en }))
  w.example = d.ex[0][0]
  w.exampleTrans = d.ex[0][1]
  filled++
}
writeFileSync(dictPath, JSON.stringify(raw), 'utf-8')
console.log(`done ${dict}: filled=${filled} missing=${missing} total=${raw.words.length}`)
