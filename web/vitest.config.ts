import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// 单测只跑纯逻辑与 store，不碰 Next 的编译链；默认 node 环境，
// 需要 localStorage 的用例在文件头写 // @vitest-environment jsdom
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
