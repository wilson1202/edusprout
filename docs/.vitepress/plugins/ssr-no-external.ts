import { definePlugin } from 'vitepress-tuck'

/**
 * 把插件包的 SSR 外置规则声明成一个 tuck 插件。
 *
 * 这批插件包的 `client/ssr` 入口会 `import 'vitepress/client'`，而
 * `vitepress/client` 内部直接 `import siteData from '@siteData'`。
 * 一旦某个包被 Vite 判定为外部依赖，SSR 阶段就会交给 Node 去加载真实文件，
 * 于是虚拟模块 `@siteData` 和 alpha 版已移除的 `onContentUpdated` 都会报错。
 *
 * 按 vitepress-tuck 的插件约定（README「Wrapping Existing Plugins」），
 * 这类 vite 配置应该由插件声明，而不是写在站点配置的 `vite` 段里。
 */
export default definePlugin(() => ({
  name: 'local:ssr-no-external',
  vite: {
    ssr: {
      noExternal: [
        'vitepress-plugin-abbr',
        'vitepress-plugin-annotation',
        'vitepress-plugin-caniuse',
        'vitepress-plugin-code-collapse',
        'vitepress-plugin-code-tree',
        'vitepress-plugin-codepen',
        'vitepress-plugin-collapse',
        'vitepress-plugin-field',
        'vitepress-plugin-file-tree',
        'vitepress-plugin-group-icons',
        'vitepress-plugin-icons',
        'vitepress-plugin-jsfiddle',
        'vitepress-plugin-llms',
        'vitepress-plugin-mark',
        'vitepress-plugin-mermaid-tuck',
        'vitepress-plugin-npm-to',
        'vitepress-plugin-obsidian',
        'vitepress-plugin-pdf',
        'vitepress-plugin-plantuml',
        'vitepress-plugin-plot',
        'vitepress-plugin-qrcode',
        'vitepress-plugin-repo-card',
        'vitepress-plugin-stackblitz',
        'vitepress-plugin-steps',
        'vitepress-plugin-video',
        'vitepress-plugin-watermark',
      ],
    },
  },
}))