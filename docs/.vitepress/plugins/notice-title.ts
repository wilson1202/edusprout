import { definePlugin } from 'vitepress-tuck'

/** CMS 将标题保存在 frontmatter，公告正文没有一级标题时自动补齐。 */
export default definePlugin(() => ({
  name: 'local:notice-title',
  markdown: {
    config(md) {
      md.core.ruler.after('inline', 'notice-title', (state) => {
        const relativePath = String(state.env.relativePath ?? '').replaceAll('\\', '/')
        const title = state.env.frontmatter?.title

        if (!relativePath.startsWith('notices/')
          || /(?:^|\/)index\.md$/.test(relativePath)
          || typeof title !== 'string'
          || !title.trim()
          || state.tokens.some(token => token.type === 'heading_open' && token.tag === 'h1')) {
          return
        }

        const open = new state.Token('heading_open', 'h1', 1)
        // 标题按纯文本显示，不执行其中的 Vue 插值或解析成 Markdown。
        open.attrSet('v-pre', '')
        const inline = new state.Token('inline', '', 0)
        inline.content = title
        const text = new state.Token('text', '', 0)
        text.content = title
        inline.children = [text]
        const close = new state.Token('heading_close', 'h1', -1)

        state.tokens.unshift(open, inline, close)
      })
    },
  },
}))
