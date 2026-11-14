# TypingChinese SEO 实施记录与后续核验手册

> **记录时间**：2026-11-13  
> **目标网站**：https://www.typingchinese.club  
> **GSC 管理账号**：nmgsykj@gmail.com  
> **基线收录量**：18 个已编入索引网页  

---

## 一、本次实施的 SEO 代码改造与提交

| 序号 | 优化模块 | 涉及文件 | 提交哈希 (Commit) | 核心效果 |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **全局 JSON-LD 结构化数据** | `web/src/app/layout.tsx` | `bc7b6c2` | 注入 `WebApplication` 与 `WebSite` Schema，支持 14 种语言声明，标记教育类工具；补全 GoogleBot 大图预览及站点验证 Meta |
| **2** | **HSK 落地页富媒体结果** | `web/src/app/hsk/[level]/page.tsx` | `bc7b6c2` | 注入 `LearningResource`、`BreadcrumbList`、前 30 核心词 `ItemList` 及 `FAQPage` 下拉问答卡片 |
| **3** | **首页专属 TDK 与分享卡片** | `web/src/app/page.tsx` | `bc7b6c2` | 精准覆盖 `Learn Chinese & Pinyin by Typing` 核心搜索意图，配置 OpenGraph/Twitter 图文卡片 |
| **4** | **站点地图全量覆盖** | `web/src/app/sitemap.ts` | `90b7b2c` | 将原先遗漏的核心流量入口 `/pinyin` 和 `/write` 补入 Sitemap，权重设置为 `0.8` |
| **5** | **客户端大页专属 Layout** | `web/src/app/pinyin/layout.tsx`<br>`web/src/app/dicts/layout.tsx`<br>`web/src/app/write/layout.tsx` | `90b7b2c` | 解决 `'use client'` 页面无法输出 metadata 导致的标题降级问题，锁定高频词（如 `Pinyin Chart with Audio`） |
| **7** | **单字笔顺页规模化放量** | `web/src/lib/write/pilot-chars.ts` | `e602295` | 从 10 个试点字扩充为 **HSK 1 全量 172 个核心汉字**，全站静态页面数从 61 跃升至 **223 个**，全量进入 Sitemap 捕获长尾搜索 |
| **8** | **HSK 进阶通关与前后级内链** | `web/src/app/hsk/[level]/page.tsx` | `e602295` | 表格下方增设“即刻开启通关练习”大卡片及“上一级 / 下一级”链接，降低跳出率并增强权重传递 |
| **9** | **拼音规则问答与 Schema FAQ** | `web/src/app/pinyin/page.tsx`<br>`web/src/app/pinyin/layout.tsx` | `e602295` | 补充四声调、ü 规则（v 键）、拼音拼读高频问答，并注入 `FAQPage` + `BreadcrumbList` 结构化数据，争夺 Google 折叠问答卡片 |
| **10** | **移动端 LCP 与无障碍优化** | `web/src/components/CyberLanding.tsx`<br>`web/src/components/Nav.tsx`<br>`web/src/app/cyber.css` | `ed477fc` | 配置 LCP 图片响应式 sizes、补齐移动 Logo aria-label、调亮暗部小字对比度，使 Google PageSpeed Insights 达到 SEO 100 满分、桌面性能 100 满分 |

---

## 二、Google Search Console (GSC) 当前状态与操作记录

### 1. 资源所有权 (Ownership)
- **状态**：经过验证的所有者 (Verified Owner)
- **验证方式**：HTML 文件验证（`googlee54c6dbf0aa71f12.html`，代码与线上均正常响应）

### 2. 站点地图 (Sitemaps)
- **提交地址**：`https://www.typingchinese.club/sitemap.xml`
- **提交确认**：已由内置浏览器成功提交，GSC 弹出确认提示并刷新“上次读取时间”。
- **待观察项**：GSC 初次异步抓取通常需要排队数小时至 1~2 天，后续核验其状态由“无法抓取/处理中”转为“成功”。

### 3. 核心网址“检查与编入索引请求”台账
内置浏览器通过 URL Inspection 工具依次对 4 个核心网址进行了实时测试（Test Live URL）并提交了主动索引请求：

| 序号 | 目标网址 (URL) | 初始状态 | 实时测试 | 请求索引时间 | 目标预期 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `https://www.typingchinese.club/` | 已收录 | 通过 (200 OK) | 2026-11-13 | 抓取全新 `WebApplication` 结构化数据与最新 TDK |
| **2** | `https://www.typingchinese.club/pinyin` | 已收录 | 通过 (200 OK) | 2026-11-13 | 替换为全新标题 `Chinese Pinyin Chart with Audio` |
| **3** | `https://www.typingchinese.club/write` | **未收录** | 通过 (200 OK) | 2026-11-13 | **首次进入索引**，捕获汉字书写与笔顺总览流量 |
| **4** | `https://www.typingchinese.club/hsk/1` | 已收录 | 通过 (200 OK) | 2026-11-13 | 抓取 `LearningResource`、词表与 FAQ 问答卡片 |

---

## 三、AnkiWeb 全球共享牌组发布台账

| 属性 | 内容 |
| :--- | :--- |
| **发布时间** | 2026-11-14 00:04 |
| **牌组名称** | `TypingChinese — HSK 1-6 中文词汇卡（看汉字练拼音）` |
| **永久直链** | https://ankiweb.net/shared/info/1737561094 |
| **牌组 ID** | `1737561094` |
| **卡片总数** | 5,004 张（HSK 1-6 汉字、拼音、释义、例句） |
| **导流设置** | 作者链接指向 `https://www.typingchinese.club`，卡片内含打字回访链接 |
| **审核状态** | 24 小时版权缓冲期（预计于 **2026-11-15 00:05** 进入公共搜索市场） |

---

## 四、海外权威软件收录平台（AlternativeTo）发布台账

| 属性 | 内容 |
| :--- | :--- |
| **提交时间** | 2026-11-14 12:30 |
| **软件主页** | https://alternativeto.net/software/typingchinese/about/ |
| **平台类别** | Web / Online (Browser) · Free & Open Source (MIT) |
| **对标竞品 (Alternatives)** | **Anki**、**Duolingo**、**Memrise**、**HelloChinese**、**HSKStory** |
| **审核状态** | 已进入官方人工编辑审核队列（1 app waiting for review） |

---

## 五、后续核验时间节点与复盘检查项

### 阶段 1：明天核心核验（2026-11-15）
- [ ] **AnkiWeb 公开搜索生效检查**：
  - 访问 AnkiWeb 共享牌组搜索（https://ankiweb.net/shared/decks/chinese），搜索关键词 `HSK` 或 `TypingChinese`；
  - 确认 `TypingChinese — HSK 1-6` 已出现在公共搜索列表中，直达链接 https://ankiweb.net/shared/info/1737561094 正常展示。
- [ ] **GSC Sitemap 抓取状态**：
  - 进入 GSC 的“站点地图”，确认 `sitemap.xml` 的状态转为绿色的 **“成功 (Success)”**。
- [ ] **`/write` 汉字笔顺枢纽收录确认**：
  - 在 GSC 顶部检查 `https://www.typingchinese.club/write`，确认已编入索引。

### 阶段 2：7 天后核验（约 2026-11-20）
- [ ] **标题与快照更新**：在 Google 搜索 `site:typingchinese.club/pinyin`，确认结果标题已更新为 `Chinese Pinyin Chart with Audio — Initials, Finals & 4 Tones | TypingChinese`。
- [ ] **结构化数据（丰富网页摘要）识别**：查看 GSC 左侧侧边栏是否激活了 **“增强功能 (Enhancements)”** 面板（包含“面包屑导航 Breadcrumbs”、“FAQ”等项目，且无严重错误）。
- [ ] **收录总数增长**：查看 GSC “编制索引 -> 网页”，确认收录网页从 18 个向上攀升。

### 阶段 3：14~30 天长期监控与进一步扩容
- [ ] **搜索词（Queries）监控**：在 GSC “效果 (Performance)” 报告中，查看海外用户正在通过哪些关键词（如 `pinyin practice`, `hsk 1 word list`）进入网站。
- [ ] **单字库放量**：试点 10 个单字（`PILOT_CHARS`）稳定收录后，将 `PILOT_CHARS` 放开至完整的 **HSK 1（150字）**，让 `/write/[char]` 规模化产出 150 个长尾单字笔顺落地页。
