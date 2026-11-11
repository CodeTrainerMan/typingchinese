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
