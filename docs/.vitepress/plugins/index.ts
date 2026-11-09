import type { VitepressPlugin } from 'vitepress-tuck'
import abbr from 'vitepress-plugin-abbr'
import annotation from 'vitepress-plugin-annotation'
import caniuse from 'vitepress-plugin-caniuse'
import codeCollapse from 'vitepress-plugin-code-collapse'
import codeTree from 'vitepress-plugin-code-tree'
import codepen from 'vitepress-plugin-codepen'
import collapse from 'vitepress-plugin-collapse'
import field from 'vitepress-plugin-field'
import fileTree from 'vitepress-plugin-file-tree'
import icons from 'vitepress-plugin-icons'
import jsfiddle from 'vitepress-plugin-jsfiddle'
import mark from 'vitepress-plugin-mark'
import mermaid from 'vitepress-plugin-mermaid-tuck'
import npmTo from 'vitepress-plugin-npm-to'
import obsidian from 'vitepress-plugin-obsidian'
import pdf from 'vitepress-plugin-pdf'
import plantuml from 'vitepress-plugin-plantuml'
import plot from 'vitepress-plugin-plot'
import qrcode from 'vitepress-plugin-qrcode'
import repoCard from 'vitepress-plugin-repo-card'
import stackblitz from 'vitepress-plugin-stackblitz'
import steps from 'vitepress-plugin-steps'
import video from 'vitepress-plugin-video'

import groupIcons from './group-icons.ts'
import llmstxt from './llmstxt.ts'
import ssrNoExternal from './ssr-no-external.ts'

export const plugins: VitepressPlugin[] = [
  // SSR 外置规则（见文件内注释），必须排在最前，供其余插件生效。
  ssrNoExternal(),
  // 与上游文档站一致，通过 tuck 封装外部插件。
  llmstxt(),
  groupIcons(),
  // vitepress-tuck 官方插件（水印在 theme/index.ts 中配置）
  abbr(),
  annotation(),
  stackblitz(),
  steps(),
  plot(),
  fileTree(),
  caniuse(),
  obsidian(),
  pdf(),
  video(),
  npmTo(['pnpm', 'npm', 'bun', 'deno', 'yarn']),
  qrcode(),
  jsfiddle(),
  codepen(),
  mark(),
  mermaid(),
  codeCollapse(),
  field(),
  plantuml(),
  codeTree(),
  repoCard(),
  collapse(),
  icons([
    { provider: 'iconify', autoInstall: false },
    { provider: 'iconfont', assets: '//at.alicdn.com/t/c/font_4920010_cm826bt13ke.css' },
    { provider: 'fontawesome', assets: 'fontawesome' }
  ]),
]
