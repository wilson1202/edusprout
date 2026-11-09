import path from 'node:path'
import { createContentLoader, createMarkdownRenderer } from 'vitepress'

export interface Notice {
  url: string
  title: string
  date: string
  timestamp: number
  level: 'info' | 'warning' | 'danger'
  levelLabel: string
  pinned: boolean
}

declare const data: Notice[]
export { data }

const levelLabels = { info: '普通', warning: '警告', danger: '紧急' } as const

export default createContentLoader('notices/**/*.md', {
  includeSrc: true,
  async transform(pages): Promise<Notice[]> {
    const md = await createMarkdownRenderer(path.resolve('docs'))
    const notices = await Promise.all(pages
      .filter(page => !page.url.endsWith('/') && !/\/index(?:\.html)?$/.test(page.url))
      .map(async (page): Promise<Notice> => {
        const meta = page.frontmatter
        const relativePath = decodeURIComponent(page.url.replace(/^\//, '').replace(/\.html$/, '')) + '.md'
        const env: { title?: string; relativePath: string; path: string } = {
          relativePath,
          path: path.resolve('docs', relativePath),
        }
        await md.renderAsync(page.src ?? '', env)
        // 用 VitePress 自身的 Markdown 解析取 H1，避免误取代码块里的“#”。
        const title = env.title?.trim()
          || (typeof meta.title === 'string' ? meta.title : '')
          || decodeURIComponent(page.url.split('/').pop() ?? '').replace(/\.html$/, '')
        const timestamp = new Date(meta.date).getTime()
        const level: Notice['level'] = meta.level === 'warning' || meta.level === 'danger'
          ? meta.level
          : 'info'

        return {
          url: page.url,
          title,
          date: Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : '',
          timestamp: Number.isFinite(timestamp) ? timestamp : 0,
          level,
          levelLabel: levelLabels[level],
          pinned: meta.pinned === true,
        }
      }))

    return notices.sort((a, b) => Number(b.pinned) - Number(a.pinned)
        || b.timestamp - a.timestamp
        || a.url.localeCompare(b.url))
  },
})
