import type { VitePressSidebarOptions } from 'vitepress-sidebar/types'

/** 每个扫描段共用的侧边栏选项 */
const sidebarBase: VitePressSidebarOptions = {
  documentRootPath: '/docs',
  splitSidebarByFolder: false,
  collapsed: false,
  useTitleFromFileHeading: true,
  useFolderTitleFromIndexFile: true,
  useFolderLinkFromIndexFile: true,
  manualSortFileNameByPriority: ['index.md'],
}

/**
 * 侧边栏分段。
 *
 * 数组里每一项对应一个扫描段，`resolvePath` 是它作用的路由前缀：
 * 访问 `/course/chinese/...` 时只会用 `course/chinese` 那一段生成的侧边栏。
 * 新增一个学科时，在这里复制一段并改三条路径即可。
 */
export const collections: VitePressSidebarOptions[] = [
  // 语文：整棵树，层级不限
  {
    ...sidebarBase,
    scanStartPath: 'course/chinese',
    resolvePath: '/course/chinese/',
    basePath: '/course/chinese/',
  },
  // 数学：整棵树，层级不限
  {
    ...sidebarBase,
    scanStartPath: 'course/math',
    resolvePath: '/course/math/',
    basePath: '/course/math/',
  },
  // 英语：整棵树，层级不限
  {
    ...sidebarBase,
    scanStartPath: 'course/english',
    resolvePath: '/course/english/',
    basePath: '/course/english/',
  },
  // 分享：整棵树，层级不限
  {
    ...sidebarBase,
    scanStartPath: 'share',
    resolvePath: '/share/',
    basePath: '/share/',
  },
  // 其他：整棵树，层级不限
  {
    ...sidebarBase,
    scanStartPath: 'other',
    resolvePath: '/other/',
    basePath: '/other/',
  },
  // 通知：整棵树，层级不限
  {
    ...sidebarBase,
    scanStartPath: 'notices',
    resolvePath: '/notices/',
    basePath: '/notices/',
    useTitleFromFrontmatter: false,
  },
]
