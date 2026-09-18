# web

typingchinese 的 Next.js 应用，项目整体说明见[仓库根目录的 README](../README.md)。

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 生产构建
npm run gen:dict # 由 scripts/seed-words.mjs 重新生成 public/dicts/*.json
```

部署到 Vercel 时把 Root Directory 设为 `web`。
