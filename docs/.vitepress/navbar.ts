import type { DefaultTheme } from 'vitepress'

/**
 * 顶栏导航。
 *
 * 与侧边栏相互独立：侧边栏由 config.ts 按目录自动生成，这里只是手工维护的入口。
 * 新增学科时在这里加一行即可（链接用带尾斜杠的目录路由，依赖 config.ts 的 cleanUrls）。
 */
export const navbar: DefaultTheme.NavItem[] = [
  { text: '主页', link: '/' },
  {
    text: '课程',
    activeMatch: '^/course/',
    items: [
      { text: '语文', link: '/course/chinese/' },
      { text: '数学', link: '/course/math/' },
      { text: '英语', link: '/course/english/' },
    ],
  },
  { text: '分享', link: '/share/' },
  { text: '其他', link: '/other/' },
  { text: '公告', link: '/notices/' }
]