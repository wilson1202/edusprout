import { createContentLoader } from 'vitepress'

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
  transform(pages): Notice[] {
    return pages
      .filter(page => !page.url.endsWith('/') && !/\/index(?:\.html)?$/.test(page.url))
      .filter(page => typeof page.frontmatter.title === 'string')
      .map((page): Notice => {
        const meta = page.frontmatter
        const timestamp = new Date(meta.date).getTime()
        const level: Notice['level'] = meta.level === 'warning' || meta.level === 'danger'
          ? meta.level
          : 'info'

        return {
          url: page.url,
          title: meta.title,
          date: Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : '',
          timestamp: Number.isFinite(timestamp) ? timestamp : 0,
          level,
          levelLabel: levelLabels[level],
          pinned: meta.pinned === true,
        }
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned)
        || b.timestamp - a.timestamp
        || a.url.localeCompare(b.url))
  },
})
