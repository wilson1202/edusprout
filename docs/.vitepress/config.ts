import path from 'node:path'
import { defineConfig } from 'vitepress-tuck'
import type { UserConfig } from 'vitepress'
import { withSidebar } from 'vitepress-sidebar'

import { collections } from './collections.ts'
import { navbar } from './navbar.ts'
import { plugins } from './plugins/index.ts'

const vitePressOptions: UserConfig = {
  lang: 'zh-CN',
  title: '知芽',
  description: '知芽（EduSprout）小学课程资源库，提供语文、数学、英语同步学习资料：课文、教学课件、教案、练习题与复习资源，按年级学期整理，开放共享。',
  cleanUrls: true,
  lastUpdated: true,

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
    headers: { level: [2, 3] },
    codeTransformers: [{ postprocess: code => code.replace(/\[!!code/g, '[!code') }],
  },

  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }],
    ['meta', { name: 'apple-mobile-web-app-title', content: '知芽' }],
  ],

  themeConfig: {
    nav: navbar,
    logo: { src: '/favicon-96x96.png', alt: '知芽 EduSprout', width: 24, height: 24 },
    // 社交链接
    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/pengzhanbo/vitepress-tuck' },
    // ],
    // ── 界面文案（默认主题默认英文，这里统一改成中文）──
    docFooter: { prev: '上一页', next: '下一页' },
    outline: { level: [2, 3], label: '本页目录' },
    lastUpdated: { text: '最后更新于' },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    langMenuLabel: '切换语言',
    navMenuLabel: '主导航',
    mobileMenuLabel: '菜单',
    extraMenuLabel: '更多选项',
    skipToContentLabel: '跳到正文',

    // 站内搜索：VitePress 内置本地搜索，无需外部服务
    search: {
      provider: 'local',
      // 本地搜索 UI 默认是英文，VitePress 2 alpha 没有内置中文；
      // 这里按组件的 defaultTranslations 键结构覆盖为中文。
      options: {
        translations: {
          button: { buttonText: '搜索' },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '重置搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到结果：',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '回车',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '上箭头',
              navigateDownKeyAriaLabel: '下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'Esc',
            },
          },
        },
      },
    },
  },
}

export default defineConfig({
  plugins,
  components: {
    dirs: [path.resolve(import.meta.dirname, 'theme/components')],
  },
  ...withSidebar(vitePressOptions, collections),
})
