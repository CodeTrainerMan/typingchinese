/**
 * 中文课程内容层：教大家学中文的系列教程。
 *
 * 与 guides.ts 一样是写死的静态内容——教程要的是准确、可照抄的例句，
 * 不是从词库随机生成。词条、拼音、例句属于「学习内容」，按 en.ts 的约定
 * 不进语言包；只有界面文案走 i18n 的 course 命名空间。
 *
 * 讲解类字段用 Localized（en / zh），页面按当前界面语言选，其它语言回退英文。
 * 每个词配 3 个常用例句。
 */

export interface Localized {
  en: string
  zh: string
}

export interface CourseQuote {
  /** 引用原文，照抄不改 */
  text: string
  author: string
  url: string
  context: Localized
}

export interface CourseSentence {
  text: string
  pinyin: string
  meaning: Localized
}

export interface CourseWord {
  word: string
  pinyin: string
  meaning: Localized
  /** 3 个常用例句，由浅入深 / 不同语境 */
  sentences: CourseSentence[]
  /** 用法/语域提示：口语、正式场合能不能用、文化背景 */
  note: Localized
  quote?: CourseQuote
}

export interface Course {
  slug: string
  /** 发布日（ISO），用于「今日课程」展示 */
  date: string
  level: 'beginner' | 'intermediate' | 'advanced'
  title: Localized
  description: Localized
  goal: Localized
  words: CourseWord[]
}

export const COURSES: Course[] = [
  {
    slug: '10-everyday-chinese-words',
    date: '2026-11-10',
    level: 'beginner',
    title: {
      en: '10 Everyday Chinese Words (With Real Sentences)',
      zh: '10 个常用中文词（附真实例句）',
    },
    description: {
      en: 'Ten high-frequency spoken Chinese words, each with pinyin, three sentences people actually say, and the context you need to use it without sounding odd.',
      zh: '十个高频中文口语词，每个都配拼音、三句真正会用到的例句，以及避免用错场景的语域说明。',
    },
    goal: {
      en: "Today's goal: learn 10 everyday words, each with three sentences you can use right away.",
      zh: '今日目标：学会 10 个常用词，每个都配三句能直接拿去用的句子。',
    },
    words: [
      {
        word: '牛逼',
        pinyin: 'niú bī',
        meaning: { en: 'awesome, badass, insanely good', zh: '太强了、厉害（口语）' },
        sentences: [
          {
            text: '这也太牛逼了！',
            pinyin: 'Zhè yě tài niú bī le!',
            meaning: { en: "That's insanely impressive!", zh: '夸人或事物特别厉害，语气很兴奋。' },
          },
          {
            text: '他一个人把项目做完了，太牛逼了。',
            pinyin: 'Tā yí ge rén bǎ xiàngmù zuò wán le, tài niú bī le.',
            meaning: { en: 'He finished the whole project by himself — legendary.', zh: '夸别人独自做成了一件难事。' },
          },
          {
            text: '这操作，牛逼啊！',
            pinyin: 'Zhè cāozuò, niú bī a!',
            meaning: { en: 'That move was insane!', zh: '网络、游戏里夸操作，句尾「啊」很常见。' },
          },
        ],
        note: {
          en: 'Slang, mildly vulgar in its literal wording, but used purely as high praise. Perfect with friends, never in formal writing, with elders, at school or at work. The safe alternative is 厉害.',
          zh: '网络和口语俚语，字面较粗，实际只表示「太强了」。朋友之间随便用；正式场合、对长辈、职场、书面语都别用。想安全一点就说「厉害」。',
        },
        quote: {
          text: 'Chinese 𝕏 is 牛逼',
          author: '@elonmusk',
          url: 'https://x.com/elonmusk/status/2119629310969467053?a=ELXxT5FR5GdIrYB6UCo&s=20',
          context: {
            en: 'Elon Musk posted this on X on 9 Nov 2026 — a fresh, real example of the word being used as pure praise.',
            zh: '马斯克 2026 年 11 月 9 日在 X 上发了这句——一个非常新鲜的真实用例，正是「夸得很用力」的用法。',
          },
        },
      },
      {
        word: '厉害',
        pinyin: 'lì hai',
        meaning: { en: 'impressive, highly skilled', zh: '厉害、有本事' },
        sentences: [
          {
            text: '你中文说得真厉害！',
            pinyin: 'Nǐ Zhōngwén shuō de zhēn lìhai!',
            meaning: { en: 'Your Chinese is really impressive!', zh: '夸别人能力强，最常用、最安全的一句。' },
          },
          {
            text: '这道菜做得太厉害了。',
            pinyin: 'Zhè dào cài zuò de tài lìhai le.',
            meaning: { en: 'This dish is incredibly well made.', zh: '也能夸东西做得好，不只夸人。' },
          },
          {
            text: '厉害了，这么快就学会了！',
            pinyin: 'Lìhai le, zhème kuài jiù xuéhuì le!',
            meaning: { en: 'Wow, you picked that up so fast!', zh: '「厉害了」是网络上常见的感叹开头。' },
          },
        ],
        note: {
          en: 'Neutral register: safe with anyone, in speech or writing. Use it instead of 牛逼 when the setting is not casual.',
          zh: '中性词，对谁都能说，书面口语都行。场合不够随便时，用它替代「牛逼」。',
        },
      },
      {
        word: '加油',
        pinyin: 'jiā yóu',
        meaning: { en: 'keep going, you got this (literally "add oil")', zh: '加油、打气' },
        sentences: [
          {
            text: '明天考试，加油！',
            pinyin: 'Míngtiān kǎoshì, jiāyóu!',
            meaning: { en: 'You have an exam tomorrow — go for it!', zh: '考试、比赛、朋友低谷时都能用来鼓励。' },
          },
          {
            text: '别放弃，加油！',
            pinyin: 'Bié fàngqì, jiāyóu!',
            meaning: { en: "Don't give up, keep going!", zh: '对方想放弃时打气。' },
          },
          {
            text: '大家加油，快到终点了！',
            pinyin: 'Dàjiā jiāyóu, kuài dào zhōngdiǎn le!',
            meaning: { en: 'Come on everyone, the finish line is close!', zh: '对一群人喊，比赛、团建时常用。' },
          },
        ],
        note: {
          en: 'Literally "add fuel". The calque "add oil" was added to the Oxford English Dictionary in 2018, so you may have seen it before.',
          zh: '字面是「加满油」。英文直译 add oil 在 2018 年被牛津词典收录，你可能已经见过。',
        },
      },
      {
        word: '随便',
        pinyin: 'suí biàn',
        meaning: { en: 'whatever, up to you, no preference', zh: '随便、都行' },
        sentences: [
          {
            text: '吃什么？随便，你定。',
            pinyin: 'Chī shénme? Suíbiàn, nǐ dìng.',
            meaning: { en: 'What shall we eat? Anything, you decide.', zh: '表示不挑、把决定权交给对方。' },
          },
          {
            text: '随便坐，别客气。',
            pinyin: 'Suíbiàn zuò, bié kèqi.',
            meaning: { en: 'Sit wherever you like, make yourself at home.', zh: '招待客人时表示别拘束。' },
          },
          {
            text: '别随便点链接。',
            pinyin: 'Bié suíbiàn diǎn liànjiē.',
            meaning: { en: "Don't click links carelessly.", zh: '「随便」+ 动词＝随意、不经考虑，带提醒语气。' },
          },
        ],
        note: {
          en: 'Casual and friendly among peers. To an elder, a client or your boss it can sound dismissive — say 您决定 ("you decide") instead.',
          zh: '同辈之间很自然；对长辈、客户、上级说可能显得敷衍，换成「您决定」更礼貌。',
        },
      },
      {
        word: '没关系',
        pinyin: 'méi guān xi',
        meaning: { en: "no problem, it's fine, don't worry", zh: '没关系、没事' },
        sentences: [
          {
            text: '对不起，我来晚了。——没关系。',
            pinyin: 'Duìbùqǐ, wǒ lái wǎn le. — Méi guānxi.',
            meaning: { en: "Sorry I'm late. — No worries.", zh: '回应道歉最常用的一句。' },
          },
          {
            text: '迟到了也没关系。',
            pinyin: 'Chídào le yě méi guānxi.',
            meaning: { en: "It's fine if you're late.", zh: '表示某件事不要紧。' },
          },
          {
            text: '没带钱？没关系，我请。',
            pinyin: 'Méi dài qián? Méi guānxi, wǒ qǐng.',
            meaning: { en: "No money? No worries, it's on me.", zh: '先安慰，再给出解决办法。' },
          },
        ],
        note: {
          en: 'The standard response to an apology. 没事儿 means the same thing and sounds even more casual.',
          zh: '回应道歉的标准说法。「没事儿」意思一样，更随意。',
        },
      },
      {
        word: '不好意思',
        pinyin: 'bù hǎo yì si',
        meaning: { en: 'excuse me, sorry, a bit embarrassed', zh: '不好意思、抱歉' },
        sentences: [
          {
            text: '不好意思，问一下地铁站在哪儿？',
            pinyin: 'Bù hǎoyìsi, wèn yíxià dìtiězhàn zài nǎr?',
            meaning: { en: 'Excuse me, where is the subway station?', zh: '向陌生人搭话时的开场白。' },
          },
          {
            text: '不好意思，我迟到了。',
            pinyin: 'Bù hǎoyìsi, wǒ chídào le.',
            meaning: { en: "Sorry I'm late.", zh: '轻微道歉，比「对不起」随意。' },
          },
          {
            text: '让您久等，真不好意思。',
            pinyin: 'Ràng nín jiǔ děng, zhēn bù hǎoyìsi.',
            meaning: { en: 'Sorry to have kept you waiting.', zh: '加「您」「真」更客气，适合服务场景或长辈。' },
          },
        ],
        note: {
          en: 'Lighter than 对不起. Covers "excuse me", a small apology, and feeling embarrassed. Very high frequency in daily speech.',
          zh: '比「对不起」轻，既能搭话、轻微道歉，也能表示难为情。日常使用频率极高。',
        },
      },
      {
        word: '靠谱',
        pinyin: 'kào pǔ',
        meaning: { en: 'reliable, dependable, solid', zh: '靠谱、可靠' },
        sentences: [
          {
            text: '他很靠谱，交给他吧。',
            pinyin: 'Tā hěn kàopǔ, jiāo gěi tā ba.',
            meaning: { en: "He's dependable — leave it to him.", zh: '形容一个人或一个方案值得信任。' },
          },
          {
            text: '这个方案不太靠谱。',
            pinyin: 'Zhège fāng’àn bú tài kàopǔ.',
            meaning: { en: "This plan doesn't seem very solid.", zh: '否定式常用来委婉质疑。' },
          },
          {
            text: '找个靠谱的修车店。',
            pinyin: 'Zhǎo ge kàopǔ de xiūchē diàn.',
            meaning: { en: 'Find a trustworthy repair shop.', zh: '也能形容店、产品、信息。' },
          },
        ],
        note: {
          en: 'Originally colloquial, now completely mainstream. Its opposite 不靠谱 (unreliable / sketchy) is just as common.',
          zh: '原本偏口语，现在已是通用词。反义「不靠谱」同样高频。',
        },
      },
      {
        word: '忽悠',
        pinyin: 'hū you',
        meaning: { en: 'to bluff, to pull someone’s leg, to talk someone into something', zh: '忽悠、糊弄' },
        sentences: [
          {
            text: '别忽悠我，真的假的？',
            pinyin: 'Bié hūyou wǒ, zhēn de jiǎ de?',
            meaning: { en: "Don't pull my leg — is that for real?", zh: '觉得对方在夸大、随口一说时，带调侃地反问。' },
          },
          {
            text: '他就被销售忽悠了。',
            pinyin: 'Tā jiù bèi xiāoshòu hūyou le.',
            meaning: { en: 'He got talked into it by the salesperson.', zh: '「被…忽悠了」＝被说动、被套路。' },
          },
          {
            text: '你这数据别是忽悠人的吧？',
            pinyin: 'Nǐ zhè shùjù bié shì hūyou rén de ba?',
            meaning: { en: 'Are these numbers for real, or are you bluffing?', zh: '带怀疑、调侃的反问。' },
          },
        ],
        note: {
          en: 'A northeastern dialect word that went national. Playful, not a formal accusation of fraud — for that you would use 骗.',
          zh: '从东北方言进入普通话，语气带调侃，不是正式指控。真要说「诈骗」得用「骗」。',
        },
      },
      {
        word: '折腾',
        pinyin: 'zhē teng',
        meaning: { en: 'to fuss over, to go through a lot of trouble', zh: '折腾、反复弄' },
        sentences: [
          {
            text: '折腾了一晚上才弄好。',
            pinyin: 'Zhēteng le yì wǎnshang cái nòng hǎo.',
            meaning: { en: 'I fussed with it all night before finally getting it done.', zh: '形容费了很大劲、绕了弯路才做成。' },
          },
          {
            text: '别折腾了，明天再说吧。',
            pinyin: 'Bié zhēteng le, míngtiān zài shuō ba.',
            meaning: { en: 'Stop fussing with it, leave it till tomorrow.', zh: '劝人别再费劲。' },
          },
          {
            text: '搬了三次家，真折腾。',
            pinyin: 'Bān le sān cì jiā, zhēn zhēteng.',
            meaning: { en: 'Moving three times was such a hassle.', zh: '形容过程反复、累人。' },
          },
        ],
        note: {
          en: 'Implies effort that was partly wasted. 别折腾了 means "stop bothering / give it a rest".',
          zh: '暗含「费了冤枉劲」。「别折腾了」＝别再费劲了。',
        },
      },
      {
        word: '淡定',
        pinyin: 'dàn dìng',
        meaning: { en: 'calm, unfazed, chill', zh: '淡定、别慌' },
        sentences: [
          {
            text: '别急，淡定一点。',
            pinyin: 'Bié jí, dàndìng yìdiǎn.',
            meaning: { en: "Don't panic, stay calm.", zh: '劝人冷静、别激动。' },
          },
          {
            text: '他都迟到半小时了还这么淡定。',
            pinyin: 'Tā dōu chídào bàn xiǎoshí le hái zhème dàndìng.',
            meaning: { en: "He's half an hour late and still totally chill.", zh: '常带一点调侃意味。' },
          },
          {
            text: '淡定，问题不大。',
            pinyin: 'Dàndìng, wèntí bú dà.',
            meaning: { en: "Relax, it's no big deal.", zh: '安抚别人的短句。' },
          },
        ],
        note: {
          en: 'An internet-era favourite with a light, slightly teasing tone. 冷静 is the neutral, formal equivalent.',
          zh: '网络时代的高频词，常带轻松调侃。正式中性的说法是「冷静」。',
        },
      },
    ],
  },
  {
    slug: '10-most-common-chinese-words',
    date: '2026-11-11',
    level: 'beginner',
    title: {
      en: '10 Most Common Chinese Words in Daily Conversation',
      zh: '日常对话里最高频的 10 个中文词',
    },
    description: {
      en: 'Ten expressions native speakers use dozens of times a day: greetings, thanks, apologies, replies and question openers. Each with pinyin, three real sentences, and the register notes textbooks skip. No overlap with Lesson 1.',
      zh: '母语者每天要说几十遍的十个表达：打招呼、道谢、道歉、应答、开口提问。每个都配拼音、三句真实例句，以及教材很少讲的语域区别。与第 1 课不重复。',
    },
    goal: {
      en: "Today's goal: master 10 high-frequency everyday words, with three sentences each you can use right away.",
      zh: '今日目标：掌握 10 个日常最高频的词，每个配三句能直接拿去用的句子。',
    },
    words: [
      {
        word: '你好',
        pinyin: 'nǐ hǎo',
        meaning: { en: 'hello, hi', zh: '你好、打招呼' },
        sentences: [
          {
            text: '你好，我是小李。',
            pinyin: 'Nǐ hǎo, wǒ shì Xiǎo Lǐ.',
            meaning: { en: "Hi, I'm Xiao Li.", zh: '见面自我介绍，最标准的开场。' },
          },
          {
            text: '你好，请问地铁站在哪儿？',
            pinyin: 'Nǐ hǎo, qǐngwèn dìtiězhàn zài nǎr?',
            meaning: { en: "Hello, where's the subway station?", zh: '向陌生人问路，先打招呼再提问更礼貌。' },
          },
          {
            text: '老师，您好！',
            pinyin: 'Lǎoshī, nín hǎo!',
            meaning: { en: 'Hello, teacher!', zh: '「您」是「你」的敬称，对长辈、老师、客户用。' },
          },
        ],
        note: {
          en: 'Literally "you good". Slightly formal: best for first meetings, strangers and shop staff. With friends, people prefer 嗨, 早啊 or just calling your name — saying 你好 to a close friend sounds oddly distant.',
          zh: '字面是「你 + 好」。偏正式，适合第一次见面、陌生人和店员；朋友之间更常说「嗨」「早啊」或直接叫名字，对很熟的人说「你好」反而显得见外。',
        },
      },
      {
        word: '谢谢',
        pinyin: 'xiè xie',
        meaning: { en: 'thank you, thanks', zh: '谢谢、感谢' },
        sentences: [
          {
            text: '谢谢你！',
            pinyin: 'Xièxie nǐ!',
            meaning: { en: 'Thank you!', zh: '最通用的道谢，加「你」点明对象。' },
          },
          {
            text: '太谢谢了，帮大忙了。',
            pinyin: 'Tài xièxie le, bāng dà máng le.',
            meaning: { en: 'Thanks so much, that was a huge help.', zh: '加「太…了」加强语气，对方帮了大忙时说。' },
          },
          {
            text: '谢谢，不用了。',
            pinyin: 'Xièxie, búyòng le.',
            meaning: { en: 'Thanks, but no thanks.', zh: '婉拒时先说谢谢，语气不生硬。' },
          },
        ],
        note: {
          en: "The second 谢 is neutral tone. More formal: 非常感谢. Casual: 谢啦. Unlike English, Chinese doesn't thank people for every small routine favour — over-thanking close friends can make you sound like a stranger.",
          zh: '第二个「谢」读轻声。更正式说「非常感谢」，随口道谢说「谢啦」。中文不像英文那样每件事都道谢，对很熟的人频繁说反而显得生分。',
        },
      },
      {
        word: '不客气',
        pinyin: 'bú kè qi',
        meaning: { en: "you're welcome, no problem", zh: '不客气、别客气' },
        sentences: [
          {
            text: '谢谢！——不客气。',
            pinyin: 'Xièxie! — Bú kèqi.',
            meaning: { en: "Thanks! — You're welcome.", zh: '回应感谢最常用的一句。' },
          },
          {
            text: '不客气，举手之劳。',
            pinyin: 'Bú kèqi, jǔ shǒu zhī láo.',
            meaning: { en: 'No problem, it was nothing.', zh: '「举手之劳」＝小事一桩，很地道的客气话。' },
          },
          {
            text: '不客气，有事再找我。',
            pinyin: 'Bú kèqi, yǒu shì zài zhǎo wǒ.',
            meaning: { en: 'Anytime, just come to me if you need anything.', zh: '帮完忙留个口子，显得热心。' },
          },
        ],
        note: {
          en: 'Literally "don\'t be polite". Safe with anyone, from a shop assistant to your boss. Casual alternatives: 没事儿, 客气啥. Note the tone change on 不 (bú) before a fourth-tone syllable.',
          zh: '字面是「别客气」，对谁都能用，店员、老板、朋友都合适。更随意说「没事儿」「客气啥」。注意「不」在去声前变调读 bú。',
        },
      },
      {
        word: '对不起',
        pinyin: 'duì bù qǐ',
        meaning: { en: "sorry, I'm sorry", zh: '对不起、道歉' },
        sentences: [
          {
            text: '对不起，我迟到了。',
            pinyin: 'Duìbùqǐ, wǒ chídào le.',
            meaning: { en: "Sorry I'm late.", zh: '正式、明确的道歉。' },
          },
          {
            text: '对不起，能再说一遍吗？',
            pinyin: 'Duìbùqǐ, néng zài shuō yí biàn ma?',
            meaning: { en: 'Sorry, could you say that again?', zh: '打断别人、请对方重复时的开场。' },
          },
          {
            text: '真对不起，把你的杯子打碎了。',
            pinyin: 'Zhēn duìbùqǐ, bǎ nǐ de bēizi dǎ suì le.',
            meaning: { en: "I'm really sorry, I broke your cup.", zh: '加「真」表示郑重，适合造成实际损失时。' },
          },
        ],
        note: {
          en: 'Heavier than 不好意思 from Lesson 1: use it when you actually did something wrong or caused trouble. For small bumps and interruptions, 不好意思 fits better. The standard reply is 没关系 (also Lesson 1).',
          zh: '比第 1 课的「不好意思」重：真做错事、给别人添了麻烦才用；轻微磕碰、打断别人用「不好意思」更合适。回应道歉用「没关系」（也在第 1 课）。',
        },
      },
      {
        word: '好的',
        pinyin: 'hǎo de',
        meaning: { en: 'okay, sure, got it', zh: '好的、收到' },
        sentences: [
          {
            text: '帮我发一下文件。——好的。',
            pinyin: 'Bāng wǒ fā yíxià wénjiàn. — Hǎo de.',
            meaning: { en: 'Send me the file. — Sure.', zh: '工作里最常见的应答，等于「收到」。' },
          },
          {
            text: '好的，我马上到。',
            pinyin: 'Hǎo de, wǒ mǎshàng dào.',
            meaning: { en: "Okay, I'll be right there.", zh: '答应后补一句具体行动，显得靠谱。' },
          },
          {
            text: '好的好的，知道了。',
            pinyin: 'Hǎo de hǎo de, zhīdào le.',
            meaning: { en: 'Okay okay, got it.', zh: '重复表示连声答应，常带安抚语气。' },
          },
        ],
        note: {
          en: '好 plus the softening particle 的 — politer and warmer than a bare 好. Ubiquitous in WeChat and at work. A bare 好 sounds more like a superior acknowledging a subordinate, or two close friends.',
          zh: '「好」加语气词「的」，比单说「好」更客气、更软，微信和职场里几乎天天用。单说「好」更像上级对下级，或是很熟的朋友之间。',
        },
      },
      {
        word: '请问',
        pinyin: 'qǐng wèn',
        meaning: { en: 'excuse me, may I ask', zh: '请问、礼貌提问的开场' },
        sentences: [
          {
            text: '请问，洗手间在哪儿？',
            pinyin: 'Qǐngwèn, xǐshǒujiān zài nǎr?',
            meaning: { en: "Excuse me, where's the restroom?", zh: '问路、问事的标准开场。' },
          },
          {
            text: '请问您贵姓？',
            pinyin: 'Qǐngwèn nín guì xìng?',
            meaning: { en: 'May I ask your name?', zh: '「贵姓」是问姓名的礼貌说法，配「您」更正式。' },
          },
          {
            text: '请问这个多少钱？',
            pinyin: 'Qǐngwèn zhège duōshao qián?',
            meaning: { en: 'Excuse me, how much is this?', zh: '买东西问价，礼貌又自然。' },
          },
        ],
        note: {
          en: 'Literally "please allow me to ask". Only used before a question — it is not a general "excuse me" for squeezing past someone. Often dropped entirely with people you know.',
          zh: '字面是「请允许我问」，只放在提问前；想挤过去让别人让路，不能只说「请问」，要说「借过」「麻烦一下」。熟人之间通常直接问，省略也不失礼。',
        },
      },
      {
        word: '可以',
        pinyin: 'kě yǐ',
        meaning: { en: 'can, may, okay', zh: '可以、能、行' },
        sentences: [
          {
            text: '可以帮我一下吗？',
            pinyin: 'Kěyǐ bāng wǒ yíxià ma?',
            meaning: { en: 'Could you give me a hand?', zh: '「可以…吗」是请人帮忙最礼貌的句式之一。' },
          },
          {
            text: '这儿可以拍照吗？',
            pinyin: 'Zhèr kěyǐ pāizhào ma?',
            meaning: { en: 'Can I take photos here?', zh: '问规则、问允许不允许。' },
          },
          {
            text: '可以，没问题。',
            pinyin: 'Kěyǐ, méi wèntí.',
            meaning: { en: 'Sure, no problem.', zh: '单独回答表示许可，比「行」稍正式。' },
          },
        ],
        note: {
          en: 'Works both as a question (可以…吗) and as the answer (可以). 行 / 成 are more casual; 能 leans toward ability or physical possibility, 可以 toward permission — though in casual speech natives mix them freely.',
          zh: '既能提问（「可以…吗」）也能当回答（「可以」）。「行」「成」更随意；「能」偏能力或客观条件，「可以」偏许可，日常混用大多也没人计较。',
        },
      },
      {
        word: '不知道',
        pinyin: 'bù zhī dào',
        meaning: { en: "I don't know, no idea", zh: '不知道、不清楚' },
        sentences: [
          {
            text: '我不知道。',
            pinyin: 'Wǒ bù zhīdào.',
            meaning: { en: "I don't know.", zh: '最直接的回答。' },
          },
          {
            text: '这个我也不太清楚。',
            pinyin: 'Zhège wǒ yě bú tài qīngchu.',
            meaning: { en: "I'm not too sure about that either.", zh: '想说得委婉，用「不太清楚」代替。' },
          },
          {
            text: '不知道他今天来不来。',
            pinyin: 'Bù zhīdào tā jīntiān lái bu lái.',
            meaning: { en: "I wonder if he's coming today.", zh: '放句首也可表示「不晓得、说不定」，不一定在回答别人。' },
          },
        ],
        note: {
          en: 'Refers to missing information, not to failing to understand — for that, use 听不懂 / 不懂. In fast speech the middle syllable is often swallowed, sounding close to "bù dao".',
          zh: '指「没有这个信息」，不是「没听懂」；没听懂要说「听不懂」「不懂」。口语快读时中间常吞音，听起来像「不道」。',
        },
      },
      {
        word: '真的',
        pinyin: 'zhēn de',
        meaning: { en: 'really, for real', zh: '真的、确实' },
        sentences: [
          {
            text: '真的吗？',
            pinyin: 'Zhēn de ma?',
            meaning: { en: 'Really?', zh: '表示惊讶或求证，超高频的一句。' },
          },
          {
            text: '这家店真的很好吃。',
            pinyin: 'Zhè jiā diàn zhēn de hěn hǎochī.',
            meaning: { en: 'This place is really good.', zh: '放在形容词前加强语气。' },
          },
          {
            text: '我真的是第一次来。',
            pinyin: 'Wǒ zhēn de shì dì-yī cì lái.',
            meaning: { en: "It's honestly my first time here.", zh: '强调真实性，替自己解释时常用。' },
          },
        ],
        note: {
          en: 'Both a question on its own (真的吗？) and an adverb before a verb or adjective (真的很好). For playful disbelief, 真的假的？ is very common (you saw it in Lesson 1). More written equivalents: 确实, 的确.',
          zh: '既能单独成问句（「真的吗？」），也能作副词（「真的很好」）。带点调侃地表示怀疑说「真的假的？」（第 1 课出现过）。书面一点的对应词是「确实」「的确」。',
        },
      },
      {
        word: '怎么样',
        pinyin: 'zěn me yàng',
        meaning: { en: 'how is it, how about', zh: '怎么样、如何' },
        sentences: [
          {
            text: '最近怎么样？',
            pinyin: 'Zuìjìn zěnmeyàng?',
            meaning: { en: 'How have you been lately?', zh: '见面寒暄，等于「最近好吗」。' },
          },
          {
            text: '这家店怎么样？',
            pinyin: 'Zhè jiā diàn zěnmeyàng?',
            meaning: { en: "How's this place?", zh: '问对方的评价。' },
          },
          {
            text: '周末去看电影怎么样？',
            pinyin: 'Zhōumò qù kàn diànyǐng zěnmeyàng?',
            meaning: { en: 'How about a movie this weekend?', zh: '放句尾表示提建议，「…怎么样？」' },
          },
        ],
        note: {
          en: 'One phrase, three jobs: asking how someone is, asking for an opinion, and making a suggestion. In northern China you will also hear the colloquial 咋样. Unlike 好不好, it asks for an open opinion rather than a yes/no.',
          zh: '一个词三种用途：问近况、问评价、提建议。北方口语也说「咋样」。与「好不好」不同，它要的是开放评价，不是点头或摇头。',
        },
      },
    ],
  },
  {
    slug: '10-chinese-words-for-daily-life',
    date: '2026-11-13',
    level: 'beginner',
    title: {
      en: '10 Chinese Words for Daily Life',
      zh: '日常生活的 10 个中文词',
    },
    description: {
      en: 'Ten words that carry you through an ordinary day: telling time, making plans, inviting someone to eat, saying how you feel, and letting a small thing go. Pinyin, three real sentences each, and the cultural notes textbooks leave out.',
      zh: '撑起一整天的十个词：说时间、约人、邀饭、讲状态、放小事一马。每个都配拼音、三句真实例句，以及教材很少讲的文化用法。',
    },
    goal: {
      en: "Today's goal: learn 10 everyday life words, with three sentences each you can use the moment you need them.",
      zh: '今日目标：学会 10 个日常生活用词，每个配三句当场就能用的句子。',
    },
    words: [
      {
        word: '现在',
        pinyin: 'xiàn zài',
        meaning: { en: 'now, right now, these days', zh: '现在、如今' },
        sentences: [
          {
            text: '现在几点？',
            pinyin: 'Xiànzài jǐ diǎn?',
            meaning: { en: 'What time is it now?', zh: '问时间最常用的一句。' },
          },
          {
            text: '我现在有点忙，晚点回你。',
            pinyin: 'Wǒ xiànzài yǒudiǎn máng, wǎn diǎn huí nǐ.',
            meaning: { en: "I'm a bit busy right now, I'll get back to you later.", zh: '微信里拖一拖回复时的常用说法。' },
          },
          {
            text: '现在开始吧。',
            pinyin: 'Xiànzài kāishǐ ba.',
            meaning: { en: "Let's start now.", zh: '提议立刻行动，句尾「吧」让语气更商量。' },
          },
        ],
        note: {
          en: 'Literally "present + at". Besides "this moment" it also means "these days / as of now" — 现在住北京 means "I live in Beijing now", not "at this second". If you really mean immediately, add 马上.',
          zh: '除了「此刻」，还能表示「如今／这段时间」——「现在住北京」是「目前住在北京」，不是「这一秒」。真要强调立刻，得说「马上」。',
        },
      },
      {
        word: '马上',
        pinyin: 'mǎ shàng',
        meaning: { en: 'right away, in a sec', zh: '马上、立刻' },
        sentences: [
          {
            text: '我马上到。',
            pinyin: 'Wǒ mǎshàng dào.',
            meaning: { en: "I'll be there in a sec.", zh: '回消息、赴约时最常用的一句。' },
          },
          {
            text: '马上就好，等一下。',
            pinyin: 'Mǎshàng jiù hǎo, děng yíxià.',
            meaning: { en: "Almost done, one sec.", zh: '「马上就好」是固定搭配，等于「快好了」。' },
          },
          {
            text: '他马上就回来了。',
            pinyin: 'Tā mǎshàng jiù huílai le.',
            meaning: { en: "He'll be back any minute.", zh: '加「就」强调很快。' },
          },
        ],
        note: {
          en: "Literally 'on horseback' — once the fastest way to get somewhere. In practice 马上 means 'very soon' rather than 'instantly'; natives even joke that 马上 can take a while. For real urgency use 立刻.",
          zh: '字面是「马背上」，古代最快的交通方式。实际指「很快」，不一定一秒就到，中国人自己也会调侃「马上」可能要等一会儿。真着急用「立刻」。',
        },
      },
      {
        word: '一会儿',
        pinyin: 'yí huìr',
        meaning: { en: 'in a little while, a moment', zh: '一会儿、片刻' },
        sentences: [
          {
            text: '一会儿见！',
            pinyin: 'Yíhuìr jiàn!',
            meaning: { en: 'See you in a bit!', zh: '短时间分别时的道别。' },
          },
          {
            text: '等一会儿，我马上好。',
            pinyin: 'Děng yíhuìr, wǒ mǎshàng hǎo.',
            meaning: { en: 'Give me a moment, I am almost done.', zh: '「等一会儿」＝稍等，比「等一下」稍长一点。' },
          },
          {
            text: '我一会儿再给你打电话。',
            pinyin: 'Wǒ yíhuìr zài gěi nǐ dǎ diànhuà.',
            meaning: { en: "I'll call you again in a little while.", zh: '也能指稍后的将来，不只是在「等待」。' },
          },
        ],
        note: {
          en: "A deliberately vague short stretch — anywhere from two minutes to half an hour. The -r is 儿化 (erhua): northern speakers say yíhuìr, many southern speakers just say yíhuì. For something even shorter, use 一下.",
          zh: '一段故意模糊的短时间，几分钟到半小时都可能。带儿化音：北方说 yíhuìr，南方常直接说 yíhuì。更短一点用「一下」。',
        },
      },
      {
        word: '一起',
        pinyin: 'yì qǐ',
        meaning: { en: 'together, in the same place', zh: '一起、一块儿' },
        sentences: [
          {
            text: '一起吃饭吧。',
            pinyin: 'Yìqǐ chīfàn ba.',
            meaning: { en: "Let's grab a meal together.", zh: '邀约最自然的句式。' },
          },
          {
            text: '我们一起去，好不好？',
            pinyin: 'Wǒmen yìqǐ qù, hǎo bu hǎo?',
            meaning: { en: "Let's go together, okay?", zh: '句尾「好不好」带商量语气。' },
          },
          {
            text: '这两个不要放在一起。',
            pinyin: 'Zhè liǎng ge búyào fàng zài yìqǐ.',
            meaning: { en: "Don't put these two together.", zh: '也能表示「放在同一个地方」，不只用于人。' },
          },
        ],
        note: {
          en: "Not only 'with someone' — 放在一起 means putting objects in the same place. For people, 一块儿 is a more casual, northern-flavoured alternative. Note 一起 goes before the verb, unlike English 'together with'.",
          zh: '不只是「和人一起」，「放在一起」指把东西搁一处。说人时口语也说「一块儿」，更随意、偏北方。注意它放在动词前：「一起去」，不是「去一起」。',
        },
      },
      {
        word: '有没有',
        pinyin: 'yǒu méi yǒu',
        meaning: { en: 'is there / do you have', zh: '有没有、是否存在' },
        sentences: [
          {
            text: '你有没有时间？',
            pinyin: 'Nǐ yǒu méiyǒu shíjiān?',
            meaning: { en: 'Do you have time?', zh: '正反疑问句，比「有时间吗」更口语。' },
          },
          {
            text: '这儿有没有 WiFi？',
            pinyin: 'Zhèr yǒu méiyǒu WiFi?',
            meaning: { en: 'Is there WiFi here?', zh: '问某处有没有某样东西。' },
          },
          {
            text: '有没有便宜一点的？',
            pinyin: 'Yǒu méiyǒu piányi yìdiǎn de?',
            meaning: { en: 'Do you have a cheaper one?', zh: '买东西比价、挑选项时常用。' },
          },
        ],
        note: {
          en: "The 有-没-有 pattern is the standard yes/no question for possession or existence. In fast speech it slurs toward 'yǒuméi'. You can also ask with 吗 instead: 你有时间吗？ — slightly more neutral.",
          zh: '「有没有」是问「是否有」的标准正反疑问形式，快读常连成「有没」。也可以换成「…吗」：「你有时间吗？」语气稍中性一点。',
        },
      },
      {
        word: '觉得',
        pinyin: 'jué de',
        meaning: { en: 'to think, to feel', zh: '觉得、认为、感觉' },
        sentences: [
          {
            text: '我觉得挺好吃的。',
            pinyin: 'Wǒ juéde tǐng hǎochī de.',
            meaning: { en: 'I think it is pretty good.', zh: '表达看法最常用，比「认为」随意得多。' },
          },
          {
            text: '你觉得怎么样？',
            pinyin: 'Nǐ juéde zěnmeyàng?',
            meaning: { en: 'What do you think?', zh: '和第 2 课的「怎么样」搭在一起用。' },
          },
          {
            text: '今天觉得有点累。',
            pinyin: 'Jīntiān juéde yǒudiǎn lèi.',
            meaning: { en: 'I am feeling a bit tired today.', zh: '也能引出身体或心理上的感受。' },
          },
        ],
        note: {
          en: "Covers both 'I think' (opinion) and 'I feel' (physical or emotional). Formal writing uses 认为. It takes a whole clause, not a bare noun: say 我觉得这个好, not 我觉得这个. The 得 is neutral tone.",
          zh: '既能表示「我认为」，也能表示「我感觉」；正式书面用「认为」。后面一般接完整判断（「我觉得这个好」），不直接光接一个名词。「得」读轻声。',
        },
      },
      {
        word: '忙',
        pinyin: 'máng',
        meaning: { en: 'busy', zh: '忙、没空' },
        sentences: [
          {
            text: '最近忙吗？',
            pinyin: 'Zuìjìn máng ma?',
            meaning: { en: 'Been busy lately?', zh: '寒暄高频句，和第 2 课「最近怎么样？」是近亲。' },
          },
          {
            text: '我这周有点忙。',
            pinyin: 'Wǒ zhè zhōu yǒudiǎn máng.',
            meaning: { en: 'I am a bit busy this week.', zh: '「有点忙」是委婉说法，也常用来婉拒。' },
          },
          {
            text: '忙什么呢？',
            pinyin: 'Máng shénme ne?',
            meaning: { en: 'What are you busy with?', zh: '熟人之间随意打招呼，不必认真回答。' },
          },
        ],
        note: {
          en: "A classic small-talk opener and a polite way to decline an invitation. 忙死了 / 忙不过来 are everyday exaggerations. It is a stative verb — no 是: 我很忙, never 我是忙.",
          zh: '既是寒暄，也是委婉拒绝的理由。「忙死了」「忙不过来」都是日常夸张说法。它是状态动词，不加「是」：说「我很忙」，不说「我是忙」。',
        },
      },
      {
        word: '累',
        pinyin: 'lèi',
        meaning: { en: 'tired, worn out', zh: '累、疲倦' },
        sentences: [
          {
            text: '今天太累了。',
            pinyin: 'Jīntiān tài lèi le.',
            meaning: { en: 'I am so tired today.', zh: '下班回家最常说的一句。' },
          },
          {
            text: '累不累？休息一下吧。',
            pinyin: 'Lèi bu lèi? Xiūxi yíxià ba.',
            meaning: { en: 'Tired? Take a break.', zh: '正反疑问 + 建议，很自然的关心方式。' },
          },
          {
            text: '跑了两公里就累了。',
            pinyin: 'Pǎo le liǎng gōnglǐ jiù lèi le.',
            meaning: { en: 'I got tired after just two kilometres.', zh: '指身体上的疲劳，「就」强调来得快。' },
          },
        ],
        note: {
          en: 'Covers both physical and mental exhaustion — 心累 ("emotionally drained") is an internet-era favourite. Do not confuse it with 困, which means sleepy: 我困了 is "I want to sleep", not "I am tired".',
          zh: '身体累、心累都算，「心累」是网络时代的高频说法。别和「困」搞混：「我困了」是想睡觉，不是「累」。',
        },
      },
      {
        word: '吃饭',
        pinyin: 'chī fàn',
        meaning: { en: 'to eat, to have a meal', zh: '吃饭、用餐' },
        sentences: [
          {
            text: '吃饭了吗？',
            pinyin: 'Chīfàn le ma?',
            meaning: { en: 'Have you eaten?', zh: '中国人式的寒暄，很多时候并不真在问饭。' },
          },
          {
            text: '一起吃饭吧。',
            pinyin: 'Yìqǐ chīfàn ba.',
            meaning: { en: "Let's grab a meal together.", zh: '最万能的邀约句，同事、朋友都能用。' },
          },
          {
            text: '我还没吃饭呢。',
            pinyin: 'Wǒ hái méi chīfàn ne.',
            meaning: { en: "I haven't eaten yet.", zh: '「还没…呢」表示到现在还没做。' },
          },
        ],
        note: {
          en: 'Literally "eat + meal"; 饭 means a cooked meal in general, not just rice. 吃饭了吗？ functions like "how are you doing" — a simple 吃了 or 还没呢 is a perfectly complete answer, no menu report needed.',
          zh: '「饭」泛指一餐，不只是米饭。「吃饭了吗？」功能上接近「最近好吗」，回一句「吃了」或「还没呢」就够了，不用汇报吃了什么。',
        },
      },
      {
        word: '算了',
        pinyin: 'suàn le',
        meaning: { en: 'forget it, never mind, let it go', zh: '算了、作罢' },
        sentences: [
          {
            text: '算了，不买了。',
            pinyin: 'Suàn le, bù mǎi le.',
            meaning: { en: 'Never mind, I will not buy it.', zh: '临时改主意、放弃一个打算。' },
          },
          {
            text: '算了，别提了。',
            pinyin: 'Suàn le, bié tí le.',
            meaning: { en: 'Forget it, let us not talk about it.', zh: '不想继续某个话题时的收尾。' },
          },
          {
            text: '太麻烦了，算了算了。',
            pinyin: 'Tài máfan le, suàn le suàn le.',
            meaning: { en: 'Too much hassle, forget it.', zh: '重复一次表示干脆放弃，常带点无奈。' },
          },
        ],
        note: {
          en: 'Literally "let it be settled". Drops a plan, closes a topic, or waives a small annoyance. Tone does the work: said lightly it means "no big deal"; said sharply it can sound dismissive — avoid it while apologising to someone.',
          zh: '字面是「就此作罢」。放弃计划、结束话题、不计较小事都能用。全靠语气：轻轻说是「没事儿」，硬邦邦说会显得敷衍；正在跟人道歉时别用。',
        },
      },
    ],
  },
]

export function getCourse(slug: string): Course | undefined {
  return COURSES.find(c => c.slug === slug)
}

/** 课程按发布日期升序维护，最后一门即「今日课程」 */
export function isLatestCourse(slug: string): boolean {
  return COURSES.length > 0 && COURSES[COURSES.length - 1].slug === slug
}

/** 按界面语言取本地化字段；中文界面用中文，其余回退英文 */
export function localized(value: Localized, locale: string): string {
  return locale.startsWith('zh') ? value.zh : value.en
}
