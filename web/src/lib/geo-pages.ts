import type { Locale } from './types'

/**
 * Geo 落地页数据（Preply「[语言] tutor in [城市]」模式的本土化移植）。
 *
 * 每个条目对应 geo.ts 里 COUNTRY_TO_LOCALE 的一个国家/地区，用该地区的
 * 界面语言（locale）渲染：hero 用界面语言包文案，learnTip / faqs 直接用
 * 当地语言书写 —— 每页内容都针对该国独特，规避 doorway page 风险。
 *
 * 这是 pSEO 资产：把「在[地区]学中文打字」这种本地化搜索词变成可索引页，
 * 接 sitemap 后让 GSC 抓取。后续可继续丰富每国的本地资源/社区外链。
 */
export interface RegionPage {
  /** ISO 国家/地区码，用作 URL 段 /region/[code] */
  code: string
  /** 该地区的界面语言（来自 geo.ts 的映射） */
  locale: Locale
  /** 本地语言中的国家/地区名 */
  country: string
  /** 英文名（用于 URL 关键词锚定） */
  countryEn: string
  /** 该地区主要/官方语言（用于本地化提示） */
  officialLang: string
  /** 针对该地区的中文学习提示（当地语言，独特内容） */
  learnTip: string
  /** 该地区常见问题（当地语言，内容独特） */
  faqs: { q: string; a: string }[]
}

export const REGION_PAGES: RegionPage[] = [
  {
    code: 'CN', locale: 'zh-CN', country: '中国', countryEn: 'China', officialLang: 'Mandarin Chinese',
    learnTip: '作为母语者，真正的差距是把“能认读”练成“盲打”的肌肉记忆。每天跟打 10 分钟，TypingChinese 会把你打错的词自动排进间隔复习。',
    faqs: [
      { q: '在中国怎么练好中文打字？', a: '用拼音输入法每天跟打，把易混词（如“时候/事实”）交给间隔重复来巩固，比单纯背词表更有效。' },
      { q: 'TypingChinese 需要账号吗？', a: '不需要。所有进度存在浏览器本地，数据不出设备，适合课堂和自习。' },
    ],
  },
  {
    code: 'HK', locale: 'zh-TW', country: '香港', countryEn: 'Hong Kong', officialLang: 'Cantonese & English',
    learnTip: '你每天都读繁体字——补上拼音输入练习，就能在内地环境也流畅打字，不再卡在候选词里。',
    faqs: [
      { q: '香港学习者适合用 TypingChinese 吗？', a: '适合。它练的是拼音输入与声调听辨，和繁体阅读互补；进度本地保存，无需账号。' },
      { q: '没有普通话基础能练吗？', a: '可以。从跟打开始，系统按你错的词安排复习，逐步建立拼音肌肉记忆。' },
    ],
  },
  {
    code: 'TW', locale: 'zh-TW', country: '台湾', countryEn: 'Taiwan', officialLang: 'Mandarin Chinese (Traditional)',
    learnTip: '繁体中文加注音/拼音输入——两者都练，让你的打字速度跟得上阅读速度。',
    faqs: [
      { q: '台湾学习者怎么用 TypingChinese？', a: '用拼音或注音模式跟打，错词自动进复习队列；无需账号，进度存本地。' },
      { q: '繁体字有笔顺练习吗？', a: '有。手写页提供繁体字的笔顺动画与描红测验。' },
    ],
  },
  {
    code: 'MO', locale: 'zh-TW', country: '澳门', countryEn: 'Macau', officialLang: 'Cantonese & Portuguese',
    learnTip: '简繁双语环境——把繁体书写和拼音输入一起练，阅读写作打字都不偏科。',
    faqs: [
      { q: '澳门中英葡三语者怎么学中文打字？', a: '用拼音跟打最通用；TypingChinese 的错词复习帮你固化拼音输入。' },
      { q: '需要联网或账号吗？', a: '不需要账号，全部在浏览器本地运行。' },
    ],
  },
  {
    code: 'JP', locale: 'ja', country: '日本', countryEn: 'Japan', officialLang: 'Japanese',
    learnTip: 'あなたの漢字の基礎は天生的な強みです。難点はピンインの声調。音読み（on-yomi）をピンインにマッピングすれば、入門が大幅に速くなります。',
    faqs: [
      { q: '日本人が中国語タイピングを始めるには？', a: 'ピンインのタイピング練習から始め、漢字の基礎を活かし、四声の聞き分けと入力に集中します。' },
      { q: 'TypingChinese は日本語対応ですか？', a: 'はい、日本語インターフェースを提供しています。進捗はブラウザに保存され、アカウント不要です。' },
    ],
  },
  {
    code: 'KR', locale: 'ko', country: '한국', countryEn: 'South Korea', officialLang: 'Korean',
    learnTip: '한자(Hanja)는 중국어와 어根을 같이합니다 — 부수 색인으로 어휘를 넓히고, 핀인 입력에 집중하세요.',
    faqs: [
      { q: '한국 학습자가 중국어 타자를 효율적으로 연습하는 법?', a: '한자 어根을 활용해 어휘를 넓히고, 타자로 핀인 입력을 굳힙니다. 틀린 단어는 자동 복습됩니다.' },
      { q: '한국어 인터페이스가 있나요?', a: '네, 한국어 인터페이스를 지원하며 계정이 필요 없습니다.' },
    ],
  },
  {
    code: 'RU', locale: 'ru', country: 'Россия', countryEn: 'Russia', officialLang: 'Russian',
    learnTip: 'Носители кириллицы могут сопоставить звуки с пиньинем; тоновая система — это новый слой, который нужно ежедневно усваивать.',
    faqs: [
      { q: 'С чего начать русскому ученику?', a: 'Начните с печати пиньиня, сделав акцент на четырёх тонах; неверные слова уходят на повторение.' },
      { q: 'Есть ли русский интерфейс?', a: 'Да, интерфейс на русском; прогресс сохраняется локально, аккаунт не нужен.' },
    ],
  },
  {
    code: 'UA', locale: 'uk', country: 'Україна', countryEn: 'Ukraine', officialLang: 'Ukrainian',
    learnTip: 'Українці дуже швидко вчать піньїнь; чотири тони — це головна нова деталь для щоденної практики.',
    faqs: [
      { q: 'З чого почати українському учню?', a: 'Почніть із друку піньїнь, зосередьтесь на тонах; невірні слова потрапляють у повторення.' },
      { q: 'Чи потрібен акаунт?', a: 'Ні, усе працює локально у браузері.' },
    ],
  },
  {
    code: 'FR', locale: 'fr', country: 'France', countryEn: 'France', officialLang: 'French',
    learnTip: 'Les francophones ont tendance à trop appuyer les tons — de courtes dictées quotidiennes entraînent vite l’oreille.',
    faqs: [
      { q: 'Les tons chinois sont-ils difficiles pour un francophone?', a: 'C’est la difficulté nouvelle; de courtes dictées quotidiennes font vite acquérir la perception des tons.' },
      { q: 'TypingChinese a-t-il une interface française?', a: 'Oui, l’interface est en français; la progression est sauvegardée localement, sans compte.' },
    ],
  },
  {
    code: 'DE', locale: 'de', country: 'Deutschland', countryEn: 'Germany', officialLang: 'German',
    learnTip: 'Deutsche Lernende profitieren vom Tonpaar-Training; 10 Minuten Tippen täglich automatisiert die Pinyin-Eingabe.',
    faqs: [
      { q: 'Wie übt ein deutscher Lernender das Chinesisch-Tippen?', a: 'Tippen Sie täglich 10 Minuten, fokus auf Tonpaare; falsche Wörter werden automatisch wiederholt.' },
      { q: 'Gibt es eine deutsche Oberfläche?', a: 'Ja, die Oberfläche ist auf Deutsch; Fortschritt wird lokal gespeichert, kein Konto nötig.' },
    ],
  },
  {
    code: 'ES', locale: 'es', country: 'España', countryEn: 'Spain', officialLang: 'Spanish',
    learnTip: 'En español y en chino los tonos transmiten significado — usa esa analogía para practicar la entrada de pinyin.',
    faqs: [
      { q: '¿Tienen ventaja los hispanohablantes con los tonos chinos?', a: 'Sí, la analogía del tono con significado ayuda; el tipeo diario fija la entrada.' },
      { q: '¿TypingChinese tiene interfaz en español?', a: 'Sí, soporta español; no requiere cuenta.' },
    ],
  },
  {
    code: 'PT', locale: 'pt', country: 'Portugal', countryEn: 'Portugal', officialLang: 'Portuguese',
    learnTip: 'Os lusófonos aprendem pinyin rápido; o tipeo diário fixa os pares de tons mais difíceis.',
    faqs: [
      { q: 'Como um lusofalante pratica datilografia chinesa?', a: 'Tipeie diariamente 10 minutos, foque nos pares de tons; palavras erradas entram em revisão.' },
      { q: 'Tem interface em português?', a: 'Sim, suporta português; sem conta.' },
    ],
  },
  {
    code: 'TH', locale: 'th', country: 'ประเทศไทย', countryEn: 'Thailand', officialLang: 'Thai',
    learnTip: 'ภาษาไทยเป็นภาษา tone เช่นกัน แนวคิดจึงโอนย้ายได้โดยตรง — จับคู่วรรณยุกต์ไทยเข้ากับสี่เสียงของจีนกลาง',
    faqs: [
      { q: 'ผู้ใช้ชาวไทยเรียนวรรณยุกต์จีนยากไหม?', a: 'ไม่ยาก เพราะคุ้นเคยกับแนวคิดวรรณยุกต์แล้ว จับคู่วรรณยุกต์ไทยเข้ากับสี่เสียงได้เลย' },
      { q: 'TypingChinese มีภาษาไทยไหม?', a: 'มี รองรับภาษาไทย ไม่ต้องสมัครบัญชี' },
    ],
  },
  {
    code: 'VN', locale: 'vi', country: 'Việt Nam', countryEn: 'Vietnam', officialLang: 'Vietnamese',
    learnTip: 'Tiếng Việt có thanh điệu và dùng chữ Latinh, nên pinyin rất quen thuộc — hãy tập trung vào dấu thanh.',
    faqs: [
      { q: 'Người Việt học pinyin có dễ không?', a: 'Dễ, vì quen với chữ Latinh và thanh điệu; tập trung vào dấu thanh bốn tiếng.' },
      { q: 'TypingChinese có giao diện tiếng Việt không?', a: 'Có, hỗ trợ tiếng Việt; không cần tài khoản.' },
    ],
  },
  {
    code: 'ID', locale: 'id', country: 'Indonesia', countryEn: 'Indonesia', officialLang: 'Indonesian',
    learnTip: 'Bahasa Indonesia tidak memiliki nada, jadi empat nada Mandarin adalah hal baru yang perlu dilatih setiap hari.',
    faqs: [
      { q: 'Bagaimana penyuka Indonesia melatih nada Mandarin?', a: 'Tulis ikut setiap hari singkat, fokus pada empat nada; kata salah masuk ke ulangan.' },
      { q: 'Apakah TypingChinese ada antarmuka Indonesia?', a: 'Ya, mendukung bahasa Indonesia; tanpa akun.' },
    ],
  },
]

export function getRegionPage(code: string): RegionPage | undefined {
  return REGION_PAGES.find((p) => p.code.toUpperCase() === code.toUpperCase())
}
