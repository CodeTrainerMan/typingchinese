<h1 align="center">Pinyin Type</h1>

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
  <b>一文ずつ、キーで覚える中国語。ピンインを打ち、声調を聞き、単語を定着させる — 中国語の単語と文章を練習するオープンソースツール。</b>
</p>

## オンラインデモ

<https://www.typingchinese.club>

## 機能

### 単語練習

- **4つの練習モード**：なぞり書き（漢字を見てピンインを入力）、聞き取り（音声のみ）、自習（ピンインから単語を書く）、意味からの書き取り（訳のみ表示）
- **3つの入力モード**：全拼 `zhongguo`、頭文字 `zg`、声調付き `zhong1 guo2`
- **2つの入力方法**：英字キーボードでラテン文字を1文字ずつリアルタイム添削、または中国語 IME（マイクロソフトピンインなど）で漢字を入力して単語単位で判定
- 全ての単語に声調記号付きピンイン、中国語音声、訳が付属
- 繰り返し回数は自由に設定でき、間違えた単語は自動でクリアして再入力できる

### 文章練習

- 初級から中級まで段階付きの内蔵テキスト（短い文から短い寓話まで）
- 自分で文章を追加：テキストを貼り付けて、文ごとに入力
- 入力に合わせて各文が読み上げられ、読む・聞く・書くが相互に補強される

### 誤字・復習・統計

- 間違えた単語は自動的に誤字ノートへ
- 復習は **FSRS**（Free Spaced Repetition Scheduler）でスケジュール、1日の復習比率も設定可能
- 統計ページでは1日の目標、1日あたりの単語数、学習時間、正答率、キー入力数を記録

### 高いカスタマイズ性

- キーボード効果音とタイピング音、音量と読み上げ速度を調整可能
- ショートカットも変更可能：読み直しキー（<kbd>Tab</kbd> / <kbd>F2</kbd>）、次の単語キー（<kbd>Space</kbd> / <kbd>Enter</kbd>）
- 画面上の仮想キーボード、ライト / ダーク / システム追従テーマ
- **14言語のインターフェース**：UI は選択に従い、学習内容は常に中国語

### シンプルで効率的

- 広告のないモダンな UI
- ブラウザだけで完結：アカウント不要、バックエンド不要、登録も不要
- 進捗はすべてローカルの `localStorage` に保存

### 辞書

内蔵：**日常よく使う語** (59)、**上級語彙** (51)、**四字熟語** (40)。

自作も可能：リストを貼り付けるか、`.json` / `.csv` / `.txt` をアップロード。1行に1語、ピンインは自動生成されます。

```
中国,国家名称
旅行 lv you
安静=没有声音
```

`sample-words.csv` がそのまま使える見本です。

## ローカルで動かす

Next.js で作られており、Node.js 18 以上が必要です。

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

<http://localhost:3000> を開いてください。

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | ビルド結果を起動 |
| `npm run lint` | ESLint |
| `npm run gen:dict` | `scripts/seed-words.mjs` から `public/dicts/*.json` を再生成 |

## プロジェクト構成

```
web/                    Next.js アプリ（デプロイ対象はここだけ）
  src/app/              ルート: / (ホーム) /practice /article /dicts /wrong /stats /setting
  src/i18n/             言語パック（言語追加：パック作成 + LOCALES に1行）
  src/lib/              辞書、ピンイン、TTS、FSRS スケジュール、ローカル保存
  public/dicts/         生成済みの辞書
  public/articles/      内蔵の練習用文章
  scripts/              種となる単語リストと辞書生成スクリプト
sample-words.csv        自作辞書のインポート例
```

## デプロイ

リポジトリのルートには `package.json` がないため、Vercel（または他のサービス）で取り込む際は **Root Directory を `web` に** 設定してください。他は Next.js の既定値のままです。

## ご意見と貢献

まだ立ち上がったばかりのプロジェクトで、機能は継続的に追加しています。アイデアやバグ報告は `Issues` へ。方向性に賛同いただけるなら `PR` も歓迎します。

- 言語を追加：`src/i18n/messages/` にパックを置き、`src/i18n/index.tsx` に登録
- 単語を追加：`scripts/seed-words.mjs` を編集して `npm run gen:dict`
