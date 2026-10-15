/**
 * 指南内容层数据（SEO 内容层：承接"怎么在某某设备上打中文"这类真实搜索需求）
 *
 * 写死的静态内容而不是从词库生成 —— 指南要的是可照做的准确步骤，
 * 每篇结尾内链到练习入口，把指南流量导进产品。
 * 需求依据见 ref/growth/guide-content-plan.md（Google 自动补全实测）。
 */

export interface GuideSection {
  h2: string
  body: string[]
  list?: string[]
}

export interface Guide {
  slug: string
  /** 面向搜索的标题（英文，匹配查询词） */
  title: string
  description: string
  /** 主关键词（供参考/维护） */
  keyword: string
  intro: string
  sections: GuideSection[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'type-chinese-windows-11',
    title: 'How to Type Chinese on Windows 11 (Pinyin Input Method Setup)',
    description:
      'Add the Microsoft Pinyin input method on Windows 11 or 10, switch keyboards with Win+Space, and type ü with v. Includes the one setting that breaks pinyin typing practice.',
    keyword: 'how to type chinese in windows 11',
    intro:
      'Typing Chinese on Windows comes down to one thing: adding a Chinese input method to the system. Once Microsoft Pinyin is installed, you can switch to it in any app — Word, Chrome, WeChat, anything.',
    sections: [
      {
        h2: 'Install the Microsoft Pinyin input method',
        body: [
          'Open Settings → Time & language → Language & region, then choose Add a language.',
          'Search for “Chinese (Simplified)”, tick “Install language pack”, and confirm. Windows downloads the basic typing support, which takes a minute.',
          'Click the “…” next to the language you just added → Language options. Under Keyboards, choose Add a keyboard and pick Microsoft Pinyin.',
        ],
      },
      {
        h2: 'Switch between English and Chinese',
        body: [
          'Win + Space cycles through every input method you have installed. Hold it and release to move one step, or keep tapping to loop around.',
          'Win + . opens the emoji and symbol panel, which is the fastest way to drop in punctuation like 。or 、.',
          'The taskbar shows which input method is active — check it first when typing suddenly produces the wrong script.',
        ],
      },
      {
        h2: 'Typing ü (the v rule)',
        body: [
          'There is no ü key on a normal keyboard. Every real pinyin input method — including the one this site grades against — uses v instead.',
          'So 女 is typed nv, 绿 is lv, and 略 is lve. This is not a workaround; it is the actual convention.',
        ],
        list: ['女 → nv', '绿 → lv', '略 → lve'],
      },
      {
        h2: 'The one thing that breaks pinyin practice',
        body: [
          'If you practise typing on TypingChinese with a Chinese input method still active, the letters never reach the page: the IME composes them into characters first, and per-letter grading stops working.',
          'Switch back to the English (Latin) keyboard before a practice session. On Windows that is Win + Space until the bar shows ENG.',
        ],
      },
    ],
  },
  {
    slug: 'type-chinese-mac',
    title: 'How to Type Chinese on Mac and MacBook (Pinyin + Handwriting)',
    description:
      'Add Chinese input sources on macOS, switch with Control+Space or Caps Lock, use trackpad handwriting, and type ü with v. Plus the setting to change before practising pinyin.',
    keyword: 'how to type chinese on mac',
    intro:
      'On macOS, Chinese typing is an input source. Add it once in System Settings and you can switch to it anywhere — including on a MacBook trackpad, which also supports handwriting recognition.',
    sections: [
      {
        h2: 'Add a Chinese input source',
        body: [
          'Open System Settings → Keyboard → Input Sources, then click the + button.',
          'Choose Chinese, Simplified and add Pinyin (Simplified). Add Handwriting as well if you want to write characters with your finger.',
          'The input menu in the menu bar shows the current source; tick “Show Input menu in menu bar” if you do not see it.',
        ],
      },
      {
        h2: 'Switching keyboards',
        body: [
          'Control + Space cycles to the next input source. On newer Macs the Globe key does the same thing, and Caps Lock can be assigned to switching in the Input Sources settings.',
          'To type pinyin letters, switch to ABC. macOS composes pinyin into characters inside the input method, so a Latin keyboard is what you want for practice.',
        ],
      },
      {
        h2: 'Trackpad handwriting',
        body: [
          'With the Handwriting input source active, write a character on the trackpad with your finger and macOS proposes candidates.',
          'It is slower than pinyin but useful when you can recognise a character and cannot recall its reading.',
        ],
      },
      {
        h2: 'Typing ü and practising',
        body: [
          'macOS follows the same convention as every other pinyin IME: type v for ü (女 → nv).',
          'Before a TypingChinese session, switch to ABC so each letter reaches the page and gets graded individually.',
        ],
        list: ['女 → nv', 'Switch to ABC before practising'],
      },
    ],
  },
  {
    slug: 'type-chinese-iphone',
    title: 'How to Type Chinese on iPhone and iPad (Pinyin + Handwriting)',
    description:
      'Add the Chinese Pinyin and Handwriting keyboards on iOS, switch with the globe key, and learn why pinyin practice needs the English keyboard.',
    keyword: 'how to write chinese characters on iphone',
    intro:
      'iOS ships with a full Chinese keyboard — you only have to enable it. Once added, Pinyin and Handwriting are available in every app that accepts text.',
    sections: [
      {
        h2: 'Enable the Chinese keyboard',
        body: [
          'Open Settings → General → Keyboard → Keyboards → Add New Keyboard, then choose Chinese (Simplified).',
          'Pick Pinyin for typing and Handwriting for drawing characters with your finger. You can add both.',
        ],
      },
      {
        h2: 'Switching keyboards',
        body: [
          'The globe key at the bottom left cycles through your keyboards. Long-press it to jump straight to a specific one.',
          'On iPad, the same key sits next to the space bar and behaves identically.',
        ],
      },
      {
        h2: 'Handwriting mode',
        body: [
          'In the handwriting keyboard, draw the character with your finger; candidates appear along the top. Writing characters on top of each other is supported when “Overlap” is enabled in keyboard settings.',
        ],
      },
      {
        h2: 'Practising pinyin on iOS',
        body: [
          'An iOS pinyin keyboard composes characters before the page sees your letters, so switch to the English keyboard when practising on TypingChinese.',
          'Typing ü works the same way here too: press v.',
        ],
      },
    ],
  },
  {
    slug: 'type-chinese-android',
    title: 'How to Type Chinese on Android (Gboard and Samsung Keyboard)',
    description:
      'Add the Chinese Pinyin keyboard on Gboard or Samsung Keyboard, switch languages by sliding the space bar, and type ü with v.',
    keyword: 'how to type chinese on samsung phone',
    intro:
      'Android phones type Chinese through the keyboard app rather than the OS. Gboard and Samsung Keyboard both ship with a Chinese (Simplified) Pinyin layout — you just need to turn it on.',
    sections: [
      {
        h2: 'Gboard',
        body: [
          'Open Settings → System → Languages & input → On-screen keyboard → Gboard → Languages.',
          'Choose Add keyboard, find Chinese (Simplified), and enable Pinyin. Long-press the comma key afterward to open Gboard settings directly.',
          'Switch languages by sliding the space bar left or right, or by tapping the globe key.',
        ],
      },
      {
        h2: 'Samsung Keyboard',
        body: [
          'Open Settings → General management → Samsung Keyboard settings → Languages and types → Manage input languages.',
          'Enable Chinese (Simplified), then pick Pinyin as the input type.',
        ],
      },
      {
        h2: 'Typing ü and practising',
        body: [
          'Android pinyin keyboards use v for ü as well: 女 is nv.',
          'For per-letter pinyin practice on TypingChinese, switch the keyboard back to English so letters reach the page unmodified.',
        ],
        list: ['女 → nv', 'Use the English layout for practice'],
      },
    ],
  },
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}
