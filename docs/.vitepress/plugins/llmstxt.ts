import process from 'node:process'
import llmstxt, { copyOrDownloadAsMarkdownButtons } from 'vitepress-plugin-llms'
import { definePlugin } from 'vitepress-tuck'

const isProd = process.env.NODE_ENV === 'production' || !!process.env.CI

export default definePlugin(() => ({
  name: 'vitepress-plugin-llms',
  markdown: {
    config(md) {
      isProd && md.use(copyOrDownloadAsMarkdownButtons)
    },
  },
  vite: {
    plugins: [
      // 原写法（会刷出大量「No matching file found for sidebar link」警告）：
      // isProd && llmstxt(),
      //
      // 现写法：侧栏由 scanStartPath 生成、是相对链接，插件按 docs 根去拼会匹配不到，
      // 传空侧栏（{}）让它跳过侧栏解析、改用文件树生成 llms.txt 目录。
      // 注意不能传 undefined/null，插件会用 ?? 回退到站点侧栏。
      isProd && llmstxt({ sidebar: {} }),
    ],
    ssr: {
      noExternal: [
        'vitepress-plugin-llms',
      ],
    },
  },
}))