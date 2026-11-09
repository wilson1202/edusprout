import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { classifyDate, organizeNotices } from './organize-notices.mjs'

test('按北京时间和周一划分，今天/未来在根，过去按互斥范围归档', () => {
  for (const [date, target] of [
    ['2026-11-11', ''], ['2026-11-12', ''], ['2027-01-01', ''],
    ['2026-11-10', '本周'], ['2026-11-09', '本周'],
    ['2026-11-08', '本月'], ['2026-10-31', '本年'], ['2025-12-31', '2025'],
  ]) assert.equal(classifyDate(date, '2026-11-11'), target)
  assert.equal(classifyDate('2026-11-30', '2026-12-02'), '本周')
  assert.equal(classifyDate('2026-12-31', '2027-01-01'), '2026')
  assert.equal(classifyDate('2026-11-10T16:30:00Z', '2026-11-11'), '')
  assert.throws(() => classifyDate('2026-02-30', '2026-11-11'))
})

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'edusprout-notices-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const add = async (file, content) => {
    const target = path.join(root, file)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, content)
  }
  return { root, add }
}

test('预览不改文件；实际移动保留字节；再次运行滚动归类', async t => {
  const { root, add } = await fixture(t)
  const source = '---\ndate: 2026-11-11\n---\n# 今日作业\n\n正文\n'
  await add('2026/notice.md', source)
  await add('index.md', '# 公告列表')
  await add('index.data.ts', 'export default {}')
  await add('invalid.md', '---\ndate: 2026-02-30\n---\n# 无效日期')
  const preview = await organizeNotices({ root, today: '2026-11-11' })
  assert.equal(preview.moves.length, 1)
  assert.equal(preview.skipped.length, 1)
  assert.equal(await readFile(path.join(root, '2026/notice.md'), 'utf8'), source)
  await organizeNotices({ root, today: '2026-11-11', apply: true })
  const hash = text => createHash('sha256').update(text).digest('hex')
  assert.equal(hash(await readFile(path.join(root, 'notice.md'))), hash(source))
  assert.equal((await organizeNotices({ root, today: '2026-11-11' })).moves.length, 0)
  await organizeNotices({ root, today: '2026-11-12', apply: true })
  assert.equal(await readFile(path.join(root, '本周/notice.md'), 'utf8'), source)
  await organizeNotices({ root, today: '2026-11-16', apply: true })
  assert.equal(await readFile(path.join(root, '本月/notice.md'), 'utf8'), source)
  await organizeNotices({ root, today: '2026-12-01', apply: true })
  assert.equal(await readFile(path.join(root, '本年/notice.md'), 'utf8'), source)
  await organizeNotices({ root, today: '2027-01-01', apply: true })
  assert.equal(await readFile(path.join(root, '2026/notice.md'), 'utf8'), source)
  assert.equal(await readFile(path.join(root, 'index.md'), 'utf8'), '# 公告列表')
  assert.ok(!(await readdir(root)).includes('.organize-notices.lock'))
})

test('文件名日期只在日期字段缺省时使用；同名冲突不移动任何文件', async t => {
  const { root, add } = await fixture(t)
  await add('2020-01-01-fallback.md', '# 旧公告')
  await add('a/same.md', '---\ndate: 2026-11-09\n---\n# A')
  await add('b/same.md', '---\ndate: 2026-11-10\n---\n# B')
  await assert.rejects(organizeNotices({ root, today: '2026-11-11', apply: true }), /同名冲突/)
  assert.equal(await readFile(path.join(root, '2020-01-01-fallback.md'), 'utf8'), '# 旧公告')
  assert.equal(await readFile(path.join(root, 'a/same.md'), 'utf8'), '---\ndate: 2026-11-09\n---\n# A')
  assert.ok(!(await readdir(root)).includes('.organize-notices.lock'))
})

test('日期字段优先于文件名，无效字段不回退到文件名', async t => {
  const { root, add } = await fixture(t)
  await add('2020-01-01-current.md', '---\ndate: 2026-11-11\n---\n# 今天')
  await add('2020-01-01-fallback.md', '# 旧公告')
  await add('2020-01-01-invalid.md', '---\ndate: 2026-02-30\n---\n# 无效日期')
  const plan = await organizeNotices({ root, today: '2026-11-11' })
  assert.equal(plan.moves.length, 1)
  assert.equal(plan.moves[0].destination, path.join(root, '2020/2020-01-01-fallback.md'))
  assert.equal(plan.skipped.length, 1)
})

test('不跟随符号链接，目标目录越界时不移动文件', async t => {
  const { root, add } = await fixture(t)
  const { root: external, add: addExternal } = await fixture(t)
  await add('notice.md', '---\ndate: 2026-11-10\n---\n# 公告')
  await addExternal('external.md', '---\ndate: 2026-11-10\n---\n# 外部')
  await symlink(external, path.join(root, 'outside'), 'dir')
  assert.equal((await organizeNotices({ root, today: '2026-11-11' })).moves.length, 1)
  await symlink(external, path.join(root, '本周'), 'dir')
  await assert.rejects(organizeNotices({ root, today: '2026-11-11', apply: true }), /notices 之外/)
  assert.ok((await readFile(path.join(root, 'notice.md'), 'utf8')).includes('# 公告'))
  assert.deepEqual(await readdir(external), ['external.md'])
})
