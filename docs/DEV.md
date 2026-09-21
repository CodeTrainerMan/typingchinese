# 开发说明

面向维护者的工程约定、已知风险与测试说明。功能层面的介绍见 [README.zh-CN.md](./README.zh-CN.md)。

## 部署

**GitHub → Vercel 自动部署：推送到 `main` 即触发生产部署，不需要手动跑部署命令。**
Vercel 项目里 Root Directory 设为 `web`（仓库根目录没有 package.json）。日常流程只有 `git commit` + `git push`，部署状态去 Vercel 面板看。

## 已知风险（记录在此，暂不处理）

### P0：拼音示范音的版权许可

- **现状**：`web/public/audio/pinyin/` 下 67 个 mp3 来自 <http://www.hanyupinyin.cn/>（音频基址 `http://du.hanyupinyin.cn/du/pinyin/`），**该站点未声明开放许可**。项目已公开上线，因此存在版权风险，且未随代码一起拿到任何授权凭证。
- **为什么先放着**：先确认音质与教学适用性，再决定投入。这件事的成本主要在沟通/录制，不在代码。
- **处理时三选一**：
  1. **书面授权**：向站方发邮件取得授权，把回复存档到本目录；
  2. **换开放许可音源**：例如 hugolpz/audio-cmn（CC BY-SA，Chen Wang 录音、Hugo Lopez 整理），需逐个做音质与一致性校验；
  3. **自己录**：63 个单音 + 4 个四声，一小时左右可录完，完全自主、无许可问题。
- **备份**：替换前的 67 个文件留在 `_audio_backup/pinyin_20260922/`（该目录已加入 `.gitignore`，只在本地保留）。其中 `ma1~ma4` 原先就是 CC BY-SA 音源，若要局部回退可直接取这 4 个。
- 音频目录自身的说明见 [`web/public/audio/pinyin/README.md`](../web/public/audio/pinyin/README.md)。

> 同类检查：键盘音效等其它音频素材若后续引入，也要先确认许可再入库。

## 数据存储（全部在 localStorage，无后端）

三个 persist key 集中在 `src/lib/storage.ts` 的 `STORAGE_KEYS`：`cn-type-base-v1`、`cn-type-setting-v1`、`cn-type-extra-v1`。不要在别处硬写这些字符串。

- **写入守卫**：`guardedStorage` 包住 `setItem`，配额写满时把原因记进 `useStorageStore.writeError`，由设置页显示告警。**不允许出现"写失败但用户以为存了"的情况**。
- **跨标签同步**：`components/PersistSync.tsx` 监听 `storage` 事件，命中自己的 key 就对三个 store 做 `rehydrate()`（以磁盘为准），并在设置页提示一句。
- **字段演进**：base store 用 `version: 1` + `migrate()`。新增字段一律在 `migrate` 里补默认值，**不要**在业务代码里散写"旧数据没有 xx 就按 yy 处理"。
- **导入导出**：设置页可导出 JSON 备份；导入有**覆盖**与**合并**两种模式。合并语义：
  - 词库按 id 合并（同 id 合并词条，不去重掉任一边）
  - 错词次数 / 最近错误时间取较大值
  - 同一天的统计取各字段较大值而不是相加（避免同一份备份导入两次把数据翻番）
  - 可选字段（collect / ignoreWords / fsrsData）类型不对时保留现有值，不报错也不清空

## 测试

vitest 3，配置在 `web/vitest.config.ts`，默认 node 环境；需要 localStorage 的用例在文件头加 `// @vitest-environment jsdom`。

```bash
cd web
npm test          # 跑一遍
npm run test:watch
```

覆盖范围：

| 文件 | 覆盖内容 |
| --- | --- |
| `src/lib/typing.test.ts` | 逐字母判定、v/ü、退格回退、音节切分、准确率与速度 |
| `src/lib/practice/flow.test.ts` | 步骤编排（智能/单模式）、无音色降级 |
| `src/lib/fsrs.test.ts` | 评分映射、卡片序列化往返、到期判定、保持率 |
| `src/lib/pinyinAudio.test.ts` | 拼音 → 音频文件名（含 ü→v、四声回退） |
| `src/lib/store/base.test.ts` | `nextStep` / `advanceSession` 分支、导入校验、replace/merge、persist migrate |
| `src/lib/storage.test.ts` | 配额异常记录、读写守卫、容量统计 |
| `src/i18n/messages.test.ts` | 14 个语言包的 key 一致、无漏翻、占位符一致 |

语言包用运行时检查而不是只靠类型：`Messages = typeof en` 能挡住缺 key，挡不住"占位符写错"和"翻译是空串"。

## CI

`.github/workflows/ci.yml`：push / PR 触发 → `npm ci` → `npm test` → `npm run lint` → `npm run build`（Next 的 build 会做类型检查）。

## 词库

- 种子词表在 `scripts/seed-words.mjs`，改动后跑 `npm run gen:dict` 重新生成 `public/dicts/`。
- 拼音由 pinyin-pro 生成，种子里只写词形与中文释义。
- HSK 一、二级各 150 词已收录（依据公开的 HSK 词汇大纲整理）。**HSK 三~六级（约 2500 词）尚未收录**，继续补时沿用同样的 `[词, 释义]` 格式。

## 发音

- 单音（声母 / 韵母 / 整体认读 / 四声示范）走 `public/audio/pinyin/` 下的 mp3。
- 整词、句子走浏览器 Web Speech API。**没有中文音色时听写步骤自动退回跟写**（`withoutAudioStep`），设置页同时给出提示——听写的题目就是发音，发不出声不能让用户对着空气猜。
