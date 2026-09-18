// 由种子词表生成带拼音的词库 JSON：node scripts/gen-dict.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pinyin } from 'pinyin-pro'
import { SEED } from './seed-words.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../public/dicts')

/** pinyin-pro 在部分版本把 v:true 输出成 ü，这里统一兜底 */
const toV = s => s.replace(/ü/g, 'v')

function build(entry) {
  const words = entry.words.map(([word, trans], index) => {
    const toneArr = pinyin(word, { type: 'array', toneType: 'symbol' })
    const flatArr = pinyin(word, { type: 'array', toneType: 'none', v: true }).map(toV)
    const toneNumArr = pinyin(word, { type: 'array', toneType: 'num', v: true }).map(toV)
    const firstArr = pinyin(word, { type: 'array', pattern: 'first', toneType: 'none', v: true }).map(toV)
    return {
      id: `${entry.id}-${index}`,
      word,
      pinyin: toneArr, // 带声调符号，用于展示：zhōng guó
      flat: flatArr.join(''), // 判定串：zhongguo（ü 已转 v）
      flatSpaced: flatArr.join(' '),
      toneNum: toneNumArr.join(' '), // zhong1 guo2
      initials: firstArr.join(''), // zg，简拼模式
      syllables: flatArr,
      trans,
      length: word.length,
    }
  })

  return {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    category: entry.category,
    tags: entry.tags,
    level: entry.level,
    length: words.length,
    words,
  }
}

mkdirSync(OUT_DIR, { recursive: true })

const list = []
for (const key of Object.keys(SEED)) {
  const dict = build(SEED[key])
  writeFileSync(resolve(OUT_DIR, `${dict.id}.json`), JSON.stringify(dict), 'utf-8')
  list.push({ id: dict.id, name: dict.name, description: dict.description, category: dict.category, tags: dict.tags, level: dict.level, length: dict.length, url: `${dict.id}.json` })
  console.log(`✓ ${dict.name.padEnd(8)} ${dict.length} 词  e.g. ${dict.words[0].word} → ${dict.words[0].flat}`)
}

writeFileSync(resolve(OUT_DIR, 'list.json'), JSON.stringify(list, null, 2), 'utf-8')
console.log(`\n共生成 ${list.length} 个词库 → public/dicts/`)
