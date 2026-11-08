# AstroPaper 博客定制说明书

> 项目：`shining-motion`（基于 [satnaing/astro-paper](https://github.com/satnaing/astro-paper)）
> 环境：Windows 10.0.0.30 → WSL2 Debian（HOME-XSC），路径 `/home/debian/shining-motion/`
> 定制日期：2026-08-12

---

## 一、连接与运行环境

| 项目 | 值 |
|:-----|:---|
| SSH 入口 | `10.0.0.30:2222`（Windows portproxy → WSL `172.24.144.46:22`） |
| 账号 | `debian` / `123456` |
| 项目路径 | `/home/debian/shining-motion/` |
| Node/pnpm | nvm 安装，SSH 非交互 shell 需手动加载：`export PATH=/home/debian/.nvm/versions/node/v24.19.0/bin:$PATH` |
| 访问地址 | WSL 内 `pnpm dev` 后，Windows 浏览器打开 `http://localhost:4321` |

**SSH 连接示例：**

```bash
SSH_ASKPASS=/opt/data/scripts/ssh_askpass.sh DISPLAY=none SSHPASS="123456" \
  setsid ssh -o StrictHostKeyChecking=no -p 2222 debian@10.0.0.30 '命令'
```

## 二、已完成的定制

### 1. 站点信息中文化（`astro-paper.config.ts`）

- `lang: zh-CN`，`timezone: Asia/Shanghai`，`dir: ltr`
- 标题「Shining Motion」、中文描述
- 社交链接改为 GitHub（nrjycyd）
- 禁用模板自带的 editPost 链接
- 分享按钮保留 x / telegram / mail

> ⚠️ `src/i18n/lang/zh-CN.ts` 为新增中文 UI 文件（导航/分页/归档/搜索等全量文案）。
> ⚠️ `astro.config.ts` 的 `i18n.locales` 同步改为 `["zh-CN"]`，否则 build 报 `MissingLocaleError`。

### 2. 配色（`src/styles/theme.css`）

| 模式 | 背景 | 文字 | 强调色 |
|:-----|:-----|:-----|:-------|
| 亮色 | `#fafaf9` 暖白 | `#1c1917` | `#0d9488` 青瓷绿 |
| 暗色 | `#111827` 深蓝灰 | `#e5e7eb` | `#f59e0b` 暖金 |

### 3. 分类功能（原生只有 tags，无 category）

| 文件 | 作用 |
|:-----|:-----|
| `src/content.config.ts` | posts schema 新增 `category` 字段（默认「未分类」） |
| `src/pages/categories/index.astro` | 分类总览页 `/categories/` |
| `src/pages/categories/[category]/[...page].astro` | 单分类文章列表页（分页） |
| `src/components/Category.astro` | 分类链接组件（虚线边框，风格同 Tag） |
| `src/utils/getUniqueCategories.ts` | 分类提取/去重/排序 |
| `src/components/Header.astro` | 导航新增「分类」入口 |
| `src/i18n/`（types / en / zh-CN） | 分类相关文案 |

### 4. 示例文章已分配真实分类（18 篇）

| 分类 | 文章 |
|:-----|:-----|
| 博客搭建 | 8 篇（配置/加文章/OG图/Giscus/色板/LaTeX/更新依赖） |
| 前端开发 | 3 篇（portfolio/tailwind/terminal） |
| 开发工具 | 2 篇（Git hooks、draft 示例） |
| 版本发布 | 5 篇（AstroPaper v2–v6 release notes） |

## 三、写文章规范

文件放 `src/content/posts/`，可建子目录（子目录名会成为 URL 路径）：

```markdown
---
title: 文章标题
pubDatetime: 2026-08-12T00:00:00.000Z
category: 网络          # 分类名，中文直接写
tags:
  - tcp
description: 一句话描述
---
正文……
```

- `category` 必须写，否则自动归入「未分类」
- 中文分类名直接支持，URL 为 `/categories/网络/`
- 文章 URL：`/posts/<文件名或slug>/`，子目录形式 `/posts/网络/xxx/`

## 四、常用命令

```bash
# 加载 pnpm（SSH 会话）
export PATH=/home/debian/.nvm/versions/node/v24.19.0/bin:$PATH
cd ~/shining-motion

pnpm dev       # 本地开发（热更新），浏览器 localhost:4321
pnpm build     # 构建到 dist/（含 astro check 类型检查 + pagefind 搜索索引）
pnpm preview   # 预览构建产物
```

**构建失败排错：**
- `MissingLocaleError` → `astro.config.ts` 的 `i18n.locales` 需包含当前 lang
- `editPost.url` 类型报错 → `enabled: false` 时不能带 `url` 字段
- pnpm 找不到 → 先执行上面的 export

## 五、备份与回滚

定制前原文件均备份在项目内（`.bak-20260812` 后缀）：

```bash
ls ~/shining-motion/*.bak-20260812 ~/shining-motion/src/styles/*.bak-20260812
```

回滚示例：`cp ~/shining-motion/astro-paper.config.ts.bak-20260812 ~/shining-motion/astro-paper.config.ts`

## 六、待自行完成

- [ ] `astro-paper.config.ts` 的 `url`：替换为真实部署域名（当前为占位 `shining-motion.pages.dev`）
- [ ] `author` / `profile`：替换为真实作者名与主页
- [ ] 删除模板示例文章，写自己的内容
- [ ] 部署（Cloudflare Pages / Vercel / GitHub Pages 均可，构建命令 `pnpm build`，产物 `dist/`）

## 七、本机副本

本次定制相关脚本与文件副本（本机 Hermes 工作区）：

- `workspace/output/temp/shining-motion/`（config/theme/zh-CN.ts 修改版）
- `workspace/output/temp/shining-motion/categories/`（分类功能脚本）
