# 知芽 EduSprout

使用 [VitePress](https://vitepress.dev/zh/) 和 [vitepress-tuck](https://github.com/pengzhanbo/vitepress-tuck) 构建的小学课程资源库，按语文、数学、英语组织课程资料，并提供分享与文档示例。

## 环境要求

- 当前已验证的构建环境：WSL `Ubuntu1`，Node.js `v24.21.0`，由 nvm 管理。
- 包管理器：pnpm `12.18.0`，以 `package.json` 的 `packageManager` 字段为准。
- 当前 VitePress 版本：`2.0.0-alpha.21`。

以下命令均在项目根目录执行。使用 nvm 时，先加载 nvm 并切换到已验证的 Node.js 版本：

```sh
source "$HOME/.nvm/nvm.sh"
nvm use 24.21.0
```

Node.js 版本为本项目已验证的环境版本，不代表已验证其他版本的兼容性。

## 安装依赖

```sh
pnpm install --frozen-lockfile
```

统一使用 pnpm 管理依赖，保留 `pnpm-lock.yaml`，避免使用 npm 生成 `package-lock.json`。冻结安装使用现有锁文件；锁文件与 `package.json` 不一致时会报错。

主动调整依赖声明后，执行 `pnpm install` 更新锁文件，并验证构建。

## 依赖管理

```sh
# 添加依赖
pnpm add <包名>

# 添加开发依赖
pnpm add -D <包名>

# 移除依赖
pnpm remove <包名>
```

依赖变更应同时保留更新后的 `package.json` 和 `pnpm-lock.yaml`，不要手工修改锁文件中的包记录。

本项目使用 VitePress 预发布版本。更新框架或插件前，先核对版本兼容性；更新后执行生产构建和类型检查。插件或依赖调整后，还需启动开发服务，访问首页和插件示例页验证。

## 使用

```sh
# 启动开发服务
pnpm docs:dev

# 构建生产站点
pnpm docs:build

# 类型检查
pnpm docs:check

# 本地预览生产构建（需先构建）
pnpm docs:preview
```

构建产物目录：`docs/.vitepress/dist`。

全新依赖环境首次运行 `pnpm docs:check` 前，先执行 `pnpm docs:build` 或启动开发服务，生成自动导入组件所需的类型声明。

## 文档

涉及站点配置、插件、组件或语法时，直接查阅官方源码和官网，并核对项目实际安装的版本。

- [VitePress 中文文档](https://vitepress.dev/zh/)
- [VitePress 官方源码](https://github.com/vuejs/vitepress)
- [vitepress-tuck 官方源码与使用说明](https://github.com/pengzhanbo/vitepress-tuck)
- [vitepress-sidebar 官方源码与配置说明](https://github.com/jooy2/vitepress-sidebar)
- [vitepress-plugin-llms 官方源码与使用说明](https://github.com/okineadev/vitepress-plugin-llms)
