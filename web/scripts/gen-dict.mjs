// 由种子词表生成带拼音的词库 JSON：node scripts/gen-dict.mjs
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pinyin } from 'pinyin-pro'
import { SEED } from './seed-words.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = resolve(__dirname, '../public/dicts')

// HSK 3-6 词表（4704 词）：由 hsk-words 的 CC-CEDICT 数据导出，见 scripts/hsk-source.json
const HSK_SRC = resolve(__dirname, 'hsk-source.json')
const HSK_META = {
  3: { name: 'HSK 三级', description: 'HSK 三级词汇：日常交际扩展，有基础后系统提速' },
  4: { name: 'HSK 四级', description: 'HSK 四级词汇：话题更广，含常见抽象词与书面表达' },
  5: { name: 'HSK 五级', description: 'HSK 五级词汇：新闻与正式场合高频词，适合进阶' },
  6: { name: 'HSK 六级', description: 'HSK 六级词汇：高阶书面语与成语，难度最高' },
}

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

/** 读 hsk-source.json，按等级组装成与 SEED 同构的词库条目 */
function loadHsk() {
  if (!existsSync(HSK_SRC)) return []
  const raw = JSON.parse(readFileSync(HSK_SRC, 'utf-8'))
  const byLevel = new Map()
  for (const item of raw) {
    if (!byLevel.has(item.level)) byLevel.set(item.level, [])
    byLevel.get(item.level).push([item.word, item.trans])
  }
  return [...byLevel.keys()].sort().flatMap((level) => {
    const meta = HSK_META[level]
    if (!meta) return []
    const words = byLevel.get(level)
    return [{
      id: `hsk${level}`,
      name: meta.name,
      description: `${meta.description}（${words.length} 词）`,
      category: 'HSK',
      tags: ['HSK', `HSK${level}`],
      level,
      words,
    }]
  })
}

mkdirSync(OUT_DIR, { recursive: true })

const list = []
for (const entry of [...Object.values(SEED), ...loadHsk()]) {
  const dict = build(entry)
  writeFileSync(resolve(OUT_DIR, `${dict.id}.json`), JSON.stringify(dict), 'utf-8')
  list.push({ id: dict.id, name: dict.name, description: dict.description, category: dict.category, tags: dict.tags, level: dict.level, length: dict.length, url: `${dict.id}.json` })
  console.log(`✓ ${dict.name.padEnd(8)} ${dict.length} 词  e.g. ${dict.words[0].word} → ${dict.words[0].flat}`)
}

writeFileSync(resolve(OUT_DIR, 'list.json'), JSON.stringify(list, null, 2), 'utf-8')
console.log(`\n共生成 ${list.length} 个词库 → public/dicts/`)
// 词库是重建的，enrich 脚本补的例句会被冲掉：改完种子表请用 `npm run gen:dict:full`
console.log('注意：例句数据在 enrich 脚本里，重跑后需执行 npm run gen:dict:full 补回')
