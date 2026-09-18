# typingchinese · 中文打字练习

> A typing practice web app for Chinese learners — pinyin typing, dictation, FSRS-spaced review, 14 UI languages.

跟着拼音打汉字，错了自动进入复习队列，按遗忘曲线安排下一次复习。纯前端应用，数据存在浏览器本地，不需要账号和后端。

## 功能

- **拼音跟打**：显示汉字与拼音，逐字判定，实时标红错误
- **听写模式**：隐藏汉字与拼音，听发音打字（Web Speech API）
- **文章练习**：整段材料连续输入，统计速度与准确率
- **词库**：日常常用词 / 进阶 / 每日 / 成语，也支持导入自定义词库（CSV）
- **错词本 + 间隔重复**：ts-fsrs 遗忘曲线自动排程复习
- **统计**：练习时长、准确率、速度趋势
- **14 种界面语言**：English、简体中文、繁體中文、Español、Português、Français、Deutsch、Русский、Українська、Bahasa Indonesia、Tiếng Việt、日本語、한국어、ไทย，首次访问跟随浏览器语言

## 技术栈

Next.js 16（App Router）· React 19 · Tailwind CSS 4 · TypeScript · zustand · ts-fsrs · pinyin-pro · Web Speech API

## 快速开始

```bash
cd web
npm install
npm run dev
```

打开 <http://localhost:3000>。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动构建产物 |
| `npm run lint` | ESLint 检查 |
| `npm run gen:dict` | 由 `scripts/seed-words.mjs` 重新生成 `public/dicts/*.json` |

## 目录结构

```
web/                Next.js 应用，唯一的部署单元
  src/app/          路由：practice / article / dicts / wrong / stats / setting
  src/i18n/         语言包（新增语言 = 加包 + 在 index.tsx 登记）
  src/lib/          词库、拼音、TTS、FSRS 排程、本地存储
  public/dicts/     由种子词表生成的词库 JSON
sample-words.csv    自定义词库示例（词语,拼音,释义）
ref/                参考资料，不入库
```

## 部署（Vercel）

Root Directory 填 `web`，Framework 选 Next.js，其余保持默认。
