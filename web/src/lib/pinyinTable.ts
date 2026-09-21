import type { MessageKey } from '@/i18n'

/**
 * 拼音速查表（对标英语音标表）：23 声母 + 24 韵母 + 16 整体认读音节 + 四声。
 *
 * 一格要表达三件事：
 * - symbol：这个音「本身」长什么样（声母 b、韵母 ao、整体认读 zhi），格子里只显示它；
 * - py：示范音（带声调），只在点击后和 hover 时露出来，不占格子版面；
 * - hanzi：示范汉字，说明这个音对应什么字。
 *
 * 点击播放的是标准发音录音 mp3（见 public/audio/pinyin），录音按「声母/韵母/整体认读
 * 本体」命名（b.mp3、ui.mp3、zhi.mp3），听到的就是这个音本身，不是借来的某个字；
 * 录音缺失或加载失败时退回浏览器 TTS 念 hanzi。
 *
 * 声母一律用教材的「呼读音」（b 念作 bo「玻」，不是 bā「八」），
 * 呼读音里带的韵母只是辅助发音，不代表声母本身等于那个音节。
 *
 * 除四声示范外，所有示范音统一取第一声：一声最平稳清晰，用来认音最准，
 * 二/三/四声会把注意力带到声调上。四个例外写在各自分组的注释里。
 */
export interface PinyinItem {
  /** 拼音元素本体：声母 'b'、韵母 'ao'、整体认读音节 'zhi' */
  symbol: string
  /** 示例音节（带声调） */
  py: string
  /** 示例汉字，发音时念它 */
  hanzi: string
}

/**
 * 声母 23 个：b p m f d t n l g k h j q x zh ch sh r z c s y w
 * 示范音用教材的呼读音，且一律第一声：b→bō「玻」、d→dē「得」、zh→zhī「知」……
 * 配套的 o / e / i 只是帮声母发出声来，声母本身仍写作 b / d / zh。
 *
 * fō、dē、tē、nē、lē、rī 这六个呼读音在普通话里没有对应的第一声汉字，
 * 汉字沿用教材配字（佛/得/特/讷/勒/日），念的时候按呼读音的一声念。
 */
export const INITIALS: PinyinItem[] = [
  { symbol: 'b', py: 'bō', hanzi: '玻' },
  { symbol: 'p', py: 'pō', hanzi: '坡' },
  { symbol: 'm', py: 'mō', hanzi: '摸' },
  { symbol: 'f', py: 'fō', hanzi: '佛' },
  { symbol: 'd', py: 'dē', hanzi: '得' },
  { symbol: 't', py: 'tē', hanzi: '特' },
  { symbol: 'n', py: 'nē', hanzi: '讷' },
  { symbol: 'l', py: 'lē', hanzi: '勒' },
  { symbol: 'g', py: 'gē', hanzi: '哥' },
  { symbol: 'k', py: 'kē', hanzi: '科' },
  { symbol: 'h', py: 'hē', hanzi: '喝' },
  { symbol: 'j', py: 'jī', hanzi: '鸡' },
  { symbol: 'q', py: 'qī', hanzi: '七' },
  { symbol: 'x', py: 'xī', hanzi: '西' },
  { symbol: 'zh', py: 'zhī', hanzi: '知' },
  { symbol: 'ch', py: 'chī', hanzi: '吃' },
  { symbol: 'sh', py: 'shī', hanzi: '诗' },
  { symbol: 'r', py: 'rī', hanzi: '日' },
  { symbol: 'z', py: 'zī', hanzi: '姿' },
  { symbol: 'c', py: 'cī', hanzi: '疵' },
  { symbol: 's', py: 'sī', hanzi: '丝' },
  { symbol: 'y', py: 'yī', hanzi: '衣' },
  { symbol: 'w', py: 'wū', hanzi: '乌' },
]

/**
 * 韵母 24 个，按教材分五组：单韵母 6 / 复韵母 8 / 特殊韵母 1 / 前鼻韵母 5 / 后鼻韵母 4。
 * 复韵母里的 ui、iu、un、ün 都是省写形式（uei、iou、uen、üen），表上仍按教材写省写式。
 *
 * 示范音一律念「韵母本身的音」：能独立成音节的就直接念它（ai→āi 哀、ao→āo 凹、ou→ōu 欧），
 * 不能独立成音节的用它的零声母写法（i→yi、u→wu、ü→yu、ui→wei、iu→you、in→yin、
 * ing→ying、ün→yun、üe→yue）——这些写法的首字母只是改写符号，读出来仍是纯韵母，
 * 借带声母的字（ei→fēi 飞、ao→hǎo 好）会念成整个音节，听的人学不到韵母本身的音。
 * eng 没有零声母写法，念本音 ēng（鞥）；ong 的零声母写法是 weng（ueng），念 wēng「翁」。
 */
export const FINAL_GROUPS: { key: MessageKey; items: PinyinItem[] }[] = [
  {
    key: 'pinyin.finalSingle',
    items: [
      { symbol: 'a', py: 'ā', hanzi: '啊' },
      { symbol: 'o', py: 'ō', hanzi: '喔' },
      { symbol: 'e', py: 'ē', hanzi: '婀' },
      { symbol: 'i', py: 'yī', hanzi: '衣' },
      { symbol: 'u', py: 'wū', hanzi: '乌' },
      { symbol: 'ü', py: 'yū', hanzi: '迂' },
    ],
  },
  {
    key: 'pinyin.finalCompound',
    items: [
      { symbol: 'ai', py: 'āi', hanzi: '哀' },
      { symbol: 'ei', py: 'ēi', hanzi: '诶' },
      { symbol: 'ui', py: 'wēi', hanzi: '威' },
      { symbol: 'ao', py: 'āo', hanzi: '凹' },
      { symbol: 'ou', py: 'ōu', hanzi: '欧' },
      { symbol: 'iu', py: 'yōu', hanzi: '优' },
      { symbol: 'ie', py: 'yē', hanzi: '椰' },
      { symbol: 'üe', py: 'yuē', hanzi: '约' },
    ],
  },
  {
    // er 是特殊韵母，不与声母相拼、只能单独成音节；示范音统一取第一声「er er er」
    key: 'pinyin.finalSpecial',
    items: [{ symbol: 'er', py: 'ēr', hanzi: '儿' }],
  },
  {
    key: 'pinyin.finalFront',
    items: [
      { symbol: 'an', py: 'ān', hanzi: '安' },
      { symbol: 'en', py: 'ēn', hanzi: '恩' },
      { symbol: 'in', py: 'yīn', hanzi: '音' },
      { symbol: 'un', py: 'wēn', hanzi: '温' },
      { symbol: 'ün', py: 'yūn', hanzi: '晕' },
    ],
  },
  {
    // ang 的第一声只有「肮」(āng) 一字，故用之；eng 用本音 ēng「鞥」
    key: 'pinyin.finalBack',
    items: [
      { symbol: 'ang', py: 'āng', hanzi: '肮' },
      { symbol: 'eng', py: 'ēng', hanzi: '鞥' },
      { symbol: 'ing', py: 'yīng', hanzi: '英' },
      { symbol: 'ong', py: 'wēng', hanzi: '翁' },
    ],
  },
]

/** 整体认读音节 16 个：zhi chi shi ri zi ci si yi wu yu ye yue yuan yin yun ying */
export const WHOLE: PinyinItem[] = [
  { symbol: 'zhi', py: 'zhī', hanzi: '知' },
  { symbol: 'chi', py: 'chī', hanzi: '吃' },
  { symbol: 'shi', py: 'shī', hanzi: '诗' },
  { symbol: 'ri', py: 'rī', hanzi: '日' },
  { symbol: 'zi', py: 'zī', hanzi: '姿' },
  { symbol: 'ci', py: 'cī', hanzi: '疵' },
  { symbol: 'si', py: 'sī', hanzi: '丝' },
  { symbol: 'yi', py: 'yī', hanzi: '衣' },
  { symbol: 'wu', py: 'wū', hanzi: '乌' },
  { symbol: 'yu', py: 'yū', hanzi: '迂' },
  { symbol: 'ye', py: 'yē', hanzi: '椰' },
  { symbol: 'yue', py: 'yuē', hanzi: '约' },
  { symbol: 'yuan', py: 'yuān', hanzi: '冤' },
  { symbol: 'yin', py: 'yīn', hanzi: '音' },
  { symbol: 'yun', py: 'yūn', hanzi: '晕' },
  { symbol: 'ying', py: 'yīng', hanzi: '英' },
]

/** 四声示范：同一音节 ma 的四个声调（妈麻马骂），听一遍就懂声调是什么 */
export const TONES: { tone: number; py: string; hanzi: string }[] = [
  { tone: 1, py: 'mā', hanzi: '妈' },
  { tone: 2, py: 'má', hanzi: '麻' },
  { tone: 3, py: 'mǎ', hanzi: '马' },
  { tone: 4, py: 'mà', hanzi: '骂' },
]

/** 小测题库：三张表合并，按示例音节去重（yī 会同时出现在韵母和整体认读里） */
export const ALL_SYLLABLES: PinyinItem[] = (() => {
  const seen = new Set<string>()
  const out: PinyinItem[] = []
  for (const item of [...INITIALS, ...FINAL_GROUPS.flatMap(g => g.items), ...WHOLE]) {
    if (seen.has(item.py)) continue
    seen.add(item.py)
    out.push(item)
  }
  return out
})()
