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
  <b>學中文，一次敲擊，一點進步 —— 敲下拼音，聽清聲調，記住這個詞。開源的中文詞語與文章練習工具。</b>
</p>

## 線上存取

<https://www.typingchinese.club>

## 功能列表

### 詞語練習

- **四種練習模式**：跟寫（看漢字打拼音）、聽寫（只聽發音）、自測（給拼音寫詞）、默寫（只給釋義寫詞）
- **三種判定模式**：全拼 `zhongguo`、簡拼 `zg`、聲調 `zhong1 guo2`
- **兩種輸入方式**：用英文鍵盤敲拉丁字母、逐字母即時糾錯；或用中文輸入法（微軟拼音等）打漢字、按整詞判定
- 每個詞都帶聲調拼音、中文發音與釋義
- 可設定每個詞的重複次數，打錯可自動清空重來

### 文章練習

- 內存入門到中級的分級短文，從短句到寓言故事
- 也可以貼上自己的文章，逐句輸入練習
- 每句自動發音，邊聽邊打，讀、聽、寫互相強化

### 錯詞、複習、統計

- 打錯的詞自動進入錯詞本，方便之後集中複習
- 複習由 **FSRS**（自由間隔重複排程演算法）安排，每日複習比例可自行設定
- 統計頁記錄每日目標、每日學習量、練習時長、準確率與擊鍵數

### 高度自由

- 鍵盤音效、打字音效，音量與語速可調
- 快捷鍵可自訂：重聽鍵（<kbd>Tab</kbd> / <kbd>F2</kbd>）、下一詞鍵（<kbd>Space</kbd> / <kbd>Enter</kbd>）
- 螢幕虛擬鍵盤，淺色 / 深色 / 跟隨系統主題
- **14 種介面語言**：介面跟著你的選擇走，學習內容始終是中文

### 簡潔高效

- 現代化介面，無廣告
- 完全在瀏覽器中執行：不需要帳號、不依賴後端、不強制關注任何平台
- 所有進度保存在本機 `localStorage`

### 詞庫

內建：**日常常用詞**（59）、**進階詞彙**（51）、**四字成語**（40）。

也支援自建：貼上詞條或上傳 `.json` / `.csv` / `.txt`，一行一條，拼音自動產生，以下寫法都支援：

```
中国,国家名称
旅行 lv you
安静=没有声音
```

可參考 `sample-words.csv`。

## 本機執行

專案基於 Next.js，需要 Node.js 18 以上。

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

然後開啟 <http://localhost:3000>。

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 生產建置 |
| `npm run start` | 啟動建置產物 |
| `npm run lint` | ESLint 檢查 |
| `npm run gen:dict` | 由 `scripts/seed-words.mjs` 重新產生 `public/dicts/*.json` |

## 目錄結構

```
web/                    Next.js 應用（唯一的部署單元）
  src/app/              路由：/（首頁） /practice /article /dicts /wrong /stats /setting
  src/i18n/             語言包（新增語言：加包 + 在 index.tsx 登記）
  src/lib/              詞庫、拼音、TTS、FSRS 排程、本機儲存
  public/dicts/         預先產生的詞庫
  public/articles/      內建練習文章
  scripts/              種子詞表與詞庫產生腳本
sample-words.csv        自訂詞庫範例
```

## 部署

儲存庫根目錄沒有 `package.json`，在 Vercel（或其他平台）匯入專案時，**Root Directory 必須填 `web`**，其餘保持 Next.js 預設設定。

## 功能與建議

專案仍在持續完善中，歡迎在 `Issues` 提出想法與問題；如果你認同這個方向，也歡迎提交 `PR`。

- 加語言：在 `src/i18n/messages/` 加一個語言包，並在 `src/i18n/index.tsx` 登記
- 加詞條：修改 `scripts/seed-words.mjs` 後執行 `npm run gen:dict`
