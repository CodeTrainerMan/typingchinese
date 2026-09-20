<h1 align="center">TypingChinese</h1>

<p align="center">
  <a href="/README.md">English</a> |
  <a href="/docs/README.zh-CN.md">简体中文</a> |
  <a href="/docs/README.zh-TW.md">繁體中文</a> |
  <a href="/docs/README.es.md">Español</a> |
  <a href="/docs/README.pt.md">Português</a> |
  <a href="/docs/README.fr.md">Français</a> |
  <a href="/docs/README.de.md">Deutsch</a> |
  <a href="/docs/README.ru.md">Русский</a> |
  <a href="/docs/README.uk.md">Українська</a> |
  <a href="/docs/README.ja.md">日本語</a> |
  <a href="/docs/README.ko.md">한국어</a> |
  <a href="/docs/README.th.md">ไทย</a> |
  <a href="/docs/README.vi.md">Tiếng Việt</a> |
  <a href="/docs/README.id.md">Bahasa Indonesia</a>
</p>

<p align="center">
  <b>Learn Chinese, one keystroke at a time — type the pinyin, hear the tone, keep the word. An open-source tool for practising Chinese words and texts.</b>
</p>

## Online Demo

<https://www.typingchinese.club>

## Community

Ask questions, share your progress, or report a bug:

- Discord — <https://discord.gg/4kZ7nETEEc>
- GitHub — <https://github.com/CodeTrainerMan/typingchinese>

## Features

### Word Practice

- **Four practice modes**: follow-along (see the hanzi, type the pinyin), dictation (listen only), self-test (pinyin shown, produce the word), write-from-meaning (only the translation is shown)
- **Three typing modes**: full pinyin `zhongguo`, initials `zg`, or tones `zhong1 guo2`
- **Two input methods**: type Latin letters on an English keyboard with instant per-letter feedback, or type hanzi with your Chinese IME (Microsoft Pinyin and friends) and get graded per word
- Tone-marked pinyin, Chinese speech synthesis and a translation on every word
- Repeat each word as many times as you like; mistyped words can be cleared and retyped automatically

### Article Practice

- Built-in graded texts from beginner to intermediate (short sentences up to short fables)
- Add your own article: paste the text and start typing it sentence by sentence
- Each sentence is pronounced as you go, so reading, listening and typing reinforce each other

### Mistakes, Reviews, Statistics

- Every word you get wrong is collected into the mistake book for later review
- Reviews are scheduled with **FSRS** (Free Spaced Repetition Scheduler); the daily review ratio is configurable
- Daily goal, words per day, time spent, accuracy and keystrokes are tracked on the statistics page

### Highly Customizable

- Keyboard sound effects and word/keystroke sounds, volume and speech rate
- Custom shortcuts: replay-key (<kbd>Tab</kbd> / <kbd>F2</kbd>) and next-word key (<kbd>Space</kbd> / <kbd>Enter</kbd>)
- Virtual on-screen keyboard, light / dark / follow-system theme
- **14 interface languages** — the UI follows your choice, while the learning content is always Chinese

### Clean and Efficient

- Modern, ad-free interface
- Runs entirely in the browser: no account, no backend, no forced sign-up
- All progress is stored locally in `localStorage`

### Dictionaries

Built in: **Daily Words** (59), **Advanced Vocabulary** (51), **Four-character Idioms** (40).

Bring your own: paste a list or upload `.json` / `.csv` / `.txt`. One entry per line, in any of these shapes — pinyin is generated automatically:

```
中国,国家名称
旅行 lv you
安静=没有声音
```

See `sample-words.csv` for a ready-to-import example.

## Run It Locally

The app is a Next.js project and needs Node.js 18 or newer.

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

Open <http://localhost:3000>.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run gen:dict` | Rebuild `public/dicts/*.json` from `scripts/seed-words.mjs` |

## Project Structure

```
web/                    Next.js application (the only deployable unit)
  src/app/              Routes: / (home) /practice /article /dicts /wrong /stats /setting
  src/i18n/             Language packs (add a language: new pack + one entry in LOCALES)
  src/lib/              Dictionaries, pinyin, TTS, FSRS scheduling, local storage
  public/dicts/         Pre-generated dictionaries
  public/articles/      Built-in practice texts
  scripts/              Seed word list and dictionary generator
sample-words.csv        Example file for importing your own dictionary
```

## Deploy

The repository root has no `package.json`, so the **Root Directory must be set to `web`** when importing the project on Vercel (or any other platform). Everything else uses the Next.js defaults.

## Feedback and Contributions

This project is young and features are still being added. Ideas and bug reports are welcome as `Issues`; if you like the approach, feel free to open a `PR`.

- Adding a language: drop a pack into `src/i18n/messages/` and register it in `src/i18n/index.tsx`
- Adding words: edit `scripts/seed-words.mjs` and run `npm run gen:dict`
