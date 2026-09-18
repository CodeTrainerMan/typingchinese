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
  <b>学中文，一次敲击，一点进步 —— 敲下拼音，听清声调，记住这个词。开源的中文词语与文章练习工具。</b>
</p>

## 在线访问

<https://www.typingchinese.club>

## 功能列表

### 词语练习

- **四种练习模式**：跟写（看汉字打拼音）、听写（只听发音）、自测（给拼音写词）、默写（只给释义写词）
- **三种判定模式**：全拼 `zhongguo`、简拼 `zg`、声调 `zhong1 guo2`
- **两种输入方式**：用英文键盘敲拉丁字母、逐字母实时纠错；或用中文输入法（微软拼音等）打汉字、按整词判定
- 每个词都带声调拼音、中文发音与释义
- 可设置每个词的重复次数，打错可自动清空重来

### 文章练习

- 内置入门到中级的分级短文，从短句到寓言故事
- 也可以粘贴自己的文章，逐句输入练习
- 每句自动发音，边听边打，读、听、写互相强化

### 错词、复习、统计

- 打错的词自动进入错词本，方便之后集中复习
- 复习由 **FSRS**（自由间隔重复调度算法）排程，每日复习比例可自行设置
- 统计页记录每日目标、每日学习量、练习时长、准确率与击键数

### 高度自由

- 键盘音效、打字音效，音量与语速可调
- 快捷键可自定义：重听键（<kbd>Tab</kbd> / <kbd>F2</kbd>）、下一词键（<kbd>Space</kbd> / <kbd>Enter</kbd>）
- 屏幕虚拟键盘，浅色 / 深色 / 跟随系统主题
- **14 种界面语言**：界面跟着你的选择走，学习内容始终是中文

### 简洁高效

- 现代化界面，无广告
- 完全在浏览器里运行：不需要账号、不依赖后端、不强制关注任何平台
- 所有进度保存在本地 `localStorage`

### 词库

内置：**日常常用词**（59）、**进阶词汇**（51）、**四字成语**（40）。

也支持自建：粘贴词条或上传 `.json` / `.csv` / `.txt`，一行一条，拼音自动生成，下面几种写法都认：

```
中国,国家名称
旅行 lv you
安静=没有声音
```

可参考 `sample-words.csv`。

## 本地运行

项目基于 Next.js，需要 Node.js 18 及以上。

```bash
git clone https://github.com/CodeTrainerMan/typingchinese.git
cd typingchinese/web
npm install
npm run dev
```

然后打开 <http://localhost:3000>。

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动构建产物 |
| `npm run lint` | ESLint 检查 |
| `npm run gen:dict` | 由 `scripts/seed-words.mjs` 重新生成 `public/dicts/*.json` |

## 目录结构

```
web/                    Next.js 应用（唯一的部署单元）
  src/app/              路由：/（首页） /practice /article /dicts /wrong /stats /setting
  src/i18n/             语言包（新增语言：加包 + 在 index.tsx 登记）
  src/lib/              词库、拼音、TTS、FSRS 排程、本地存储
  public/dicts/         预生成的词库
  public/articles/      内置练习文章
  scripts/              种子词表与词库生成脚本
sample-words.csv        自定义词库示例
```

## 部署

仓库根目录没有 `package.json`，在 Vercel（或其他平台）导入项目时，**Root Directory 必须填 `web`**，其余保持 Next.js 默认配置。

## 功能与建议

项目仍在持续完善中，欢迎在 `Issues` 里提想法与问题；如果你认同这个思路，也欢迎提交 `PR`。

- 加语言：在 `src/i18n/messages/` 加一个语言包，并在 `src/i18n/index.tsx` 登记
- 加词条：改 `scripts/seed-words.mjs` 后运行 `npm run gen:dict`
