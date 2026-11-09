import { createHash } from 'node:crypto'
import { link, lstat, mkdir, open, readFile, readdir, realpath, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createMarkdownRenderer } from 'vitepress'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const dayMs = 86_400_000
const shanghaiDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
})

function dateKey(value) {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? shanghaiDate.format(value) : null
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(text + 'T00:00:00Z')
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text ? text : null
  }
  if (/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)) return dateKey(new Date(text))
  return null
}

/** 返回相对于 notices 的目标文件夹；空字符串表示留在根目录。 */
export function classifyDate(value, today) {
  const date = dateKey(value)
  const current = dateKey(today)
  if (!date || !current) throw new Error('日期必须有效，例如 2026-11-09')
  // 当天和未来公告留在根目录；只归档已经过去的日期。
  if (date >= current) return ''
  if (date.slice(0, 4) !== current.slice(0, 4)) return date.slice(0, 4)
  const currentDay = new Date(current + 'T00:00:00Z')
  const monday = currentDay.getTime() - ((currentDay.getUTCDay() + 6) % 7) * dayMs
  if (new Date(date + 'T00:00:00Z').getTime() >= monday) return '本周'
  if (date.slice(0, 7) === current.slice(0, 7)) return '本月'
  return '本年'
}

function within(root, target) {
  const relative = path.relative(root, target)
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative)
}

async function exists(file) {
  try { await lstat(file); return true } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

async function collectFiles(root, directory = root) {
  const files = []
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, item.name)
    // 不跟随符号链接，不移动索引、数据加载器或资源。
    if (item.isSymbolicLink()) continue
    if (item.isDirectory()) files.push(...await collectFiles(root, fullPath))
    else if (item.isFile() && /\.md$/i.test(item.name) && item.name.toLowerCase() !== 'index.md') files.push(fullPath)
  }
  return files.sort()
}

/** 只计算计划，不创建目录或更改文件。日期字段优先，缺省时才用文件名前缀。 */
export async function planNotices({ root = path.join(projectRoot, 'docs/notices'), today = dateKey(new Date()) } = {}) {
  if (!dateKey(today)) throw new Error('--today 必须是有效的 YYYY-MM-DD')
  const resolvedRoot = await realpath(root)
  const md = await createMarkdownRenderer(resolvedRoot)
  const moves = []
  const skipped = []
  const destinations = new Map()
  for (const source of await collectFiles(resolvedRoot)) {
    const content = await readFile(source)
    const text = content.toString('utf8')
    const env = {}
    md.parse(text, env)
    const rawDate = env.frontmatter?.date
    // YAML 会把某些不存在的日期折算成下一月，先核对文件中的原始日历日期。
    const header = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1]
    const originalDay = header?.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})(?=['"\sT#]|$)/m)?.[1]
    const date = originalDay && !dateKey(originalDay) ? null : rawDate == null || rawDate === ''
      ? dateKey(path.basename(source).match(/^\d{4}-\d{2}-\d{2}/)?.[0])
      : dateKey(rawDate)
    if (!date) {
      skipped.push({ source, reason: '日期缺失或无效，保持原位置' })
      continue
    }
    const destination = path.join(resolvedRoot, classifyDate(date, today), path.basename(source))
    if (!within(resolvedRoot, destination)) throw new Error('目标路径超出 notices')
    const parent = path.dirname(destination)
    if (await exists(parent) && !within(resolvedRoot, await realpath(parent))) {
      throw new Error('目标文件夹链接到 notices 之外，未移动任何文件')
    }
    const previous = destinations.get(destination)
    if (previous && previous !== source) throw new Error(`同名冲突，未移动任何文件：${previous} / ${source}`)
    destinations.set(destination, source)
    if (source === destination) continue
    if (await exists(destination)) throw new Error(`目标已存在，未移动任何文件：${destination}`)
    moves.push({ source, destination, date, hash: createHash('sha256').update(content).digest('hex') })
  }
  return { root: resolvedRoot, today, moves, skipped }
}

/** 显式 apply 才实际移动。先完整检查，创建目标时禁止覆盖现有文件。 */
export async function organizeNotices(options = {}) {
  if (!options.apply) return planNotices(options)
  const root = await realpath(options.root ?? path.join(projectRoot, 'docs/notices'))
  const lockPath = path.join(root, '.organize-notices.lock')
  const lock = await open(lockPath, 'wx')
  try {
    const plan = await planNotices({ ...options, root })
    for (const move of plan.moves) {
      if (createHash('sha256').update(await readFile(move.source)).digest('hex') !== move.hash) {
        throw new Error(`文件已变化，停止移动：${move.source}`)
      }
    }
    for (const move of plan.moves) {
      const directory = path.dirname(move.destination)
      await mkdir(directory, { recursive: true })
      if (!within(root, await realpath(directory))) throw new Error('目标目录超出 notices')
      // link 是同文件系统的排他创建，目标已存在时会失败；再删除原目录项。
      // 不改写 Markdown 字节，不覆盖同名文件，不清理任何原有目录。
      await link(move.source, move.destination)
      try { await unlink(move.source) } catch (error) {
        throw new Error(`目标已创建但原文件未删除，请核对两处文件：${move.source}`, { cause: error })
      }
    }
    return plan
  } finally {
    await lock.close()
    await unlink(lockPath)
  }
}

async function main() {
  const options = {}
  const args = process.argv.slice(2)
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--apply') options.apply = true
    else if (arg === '--today' || arg === '--root') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${arg} 缺少参数`)
      options[arg.slice(2)] = args[++index]
    } else if (arg === '--help') {
      console.log('用法：pnpm notices:organize [--apply] [--today YYYY-MM-DD] [--root PATH]\n默认只预览。按北京时间、周一开始计算；当天及未来日期留根目录。')
      return
    } else throw new Error(`未知参数：${arg}`)
  }
  const plan = await organizeNotices(options)
  console.log(`${options.apply ? '已整理' : '预览'}：${plan.today}（Asia/Shanghai，周一开始）`)
  for (const move of plan.moves) console.log(`${path.relative(plan.root, move.source)} -> ${path.relative(plan.root, move.destination)}`)
  for (const item of plan.skipped) console.log(`跳过 ${path.relative(plan.root, item.source)}：${item.reason}`)
  console.log(`${plan.moves.length} 个文件${options.apply ? '已移动' : '待移动'}，${plan.skipped.length} 个跳过。`)
  if (!options.apply) console.log('预览没有更改文件；确认后添加 --apply。移动会改变公告详情页链接。')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1 })
}
