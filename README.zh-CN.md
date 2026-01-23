# qb-web

[English](README.md) | [简体中文](README.zh-CN.md)

[![GitHub release](https://img.shields.io/github/v/release/jianxcao/qb-web)](https://github.com/jianxcao/qb-web/releases)
[![GitHub stars](https://img.shields.io/github/stars/jianxcao/qb-web?style=social)](https://github.com/jianxcao/qb-web/stargazers)
[![License](https://img.shields.io/github/license/jianxcao/qb-web)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](package.json)

一个现代化、功能丰富的 qBittorrent 客户端 Web 管理界面，采用 Vue 3、TypeScript 和 Naive UI 构建。专为桌面和移动设备设计，具有响应式布局、虚拟滚动高性能渲染和智能种子过滤功能。

> 💡 **如果这个项目对你有帮助，请考虑在 GitHub 上给个 ⭐ Star！** 这能帮助更多人发现这个项目，也会激励我持续改进。谢谢！🙏

## ✨ 特性

- 🚀 **现代技术栈** - 基于 Vue 3 (Composition API)、TypeScript 和 Vite 构建，开发体验极速
- 📱 **响应式设计** - 移动端优先的 UI 设计，完美适配桌面、平板和手机
- ⚡ **高性能** - 虚拟滚动技术，流畅处理大量种子列表
- 🎨 **精美界面** - 使用 Naive UI 打造简洁现代的界面
- 🌍 **国际化** - 多语言支持（English、简体中文）
- 🔒 **安全认证** - 登录保护和会话管理
- 📊 **实时统计** - 种子状态、速度和进度实时更新
- 🎯 **智能过滤** - 按状态、分类和标签进行高级种子过滤
- 📁 **文件管理** - 轻松浏览和管理种子内容
- 🔄 **拖放支持** - 直观的种子文件和磁力链接处理
- ⚙️ **全面设置** - 完整控制 qBittorrent 客户端设置
- 🐳 **Docker 支持** - 使用 Docker 和 Docker Compose 轻松部署

## 界面预览

![面板](./docs/imgs/dashborad.png)
![移动端卡片](./docs/imgs/mobileCard.png)
![移动端面板](./docs/imgs/mobileDashborad.png)
![移动端菜单](./docs/imgs/mobileSiderbar.png)
![添加种子](./docs/imgs/add.png)

## 🐳 Docker 部署（推荐）

最简单的部署方式是使用 Docker Hub 上预构建的镜像。

### 使用 Docker Compose（推荐）

创建 `docker-compose.yml` 文件：

```yaml
services:
  qb-web:
    image: jianxcao/qbittorrent-web
    container_name: qb-web
    environment:
      - BACKEND_URL=http://127.0.0.1:9091
    ports:
      - '7633:7633'
    restart: unless-stopped
```

然后运行：

```bash
docker-compose up -d
```

### 使用 Docker 命令行

```bash
docker run -d \
  --name qb-web \
  -p 7633:7633 \
  -e BACKEND_URL=http://127.0.0.1:9091 \
  --restart unless-stopped \
  jianxcao/qbittorrent-web
```

### 从源码构建（可选）

如果您想自己构建镜像：

```bash
# 克隆仓库
git clone https://github.com/jianxcao/qb-web.git
cd qb-web

# 构建镜像
docker build -t qb-web .

# 运行容器
docker run -d \
  --name qb-web \
  -p 7633:7633 \
  -e BACKEND_URL=http://your-qbittorrent:8080 \
  --restart unless-stopped \
  qb-web
```

### 环境变量

| 变量          | 描述                       | 默认值                  | 是否必需 |
| ------------- | -------------------------- | ----------------------- | -------- |
| `BACKEND_URL` | qBittorrent WebUI API 地址 | `http://localhost:9091` | 是       |
| `PORT`        | Web 界面运行端口           | `7633`                  | 否       |
| `PUID`        | 文件权限用户 ID            | `0`                     | 否       |
| `PGID`        | 文件权限组 ID              | `0`                     | 否       |
| `UMASK`       | 文件创建掩码               | `000`                   | 否       |

> **注意**：请务必将 `BACKEND_URL` 替换为您实际的 qBittorrent WebUI 地址。如果 qBittorrent 在另一个容器中运行，请使用容器名称或服务名称（例如 `http://qbittorrent:8080`）。

## 📦 本地开发安装

### 前置要求

- **Node.js** >= 20.0.0
- **pnpm** >= 10.0.0
- **qBittorrent** 并启用 WebUI API

### 克隆和安装

```bash
git clone https://github.com/jianxcao/qb-web.git
cd qb-web
pnpm install
```

### 环境配置

在项目根目录创建 `.env.local` 文件：

```env
VITE_BASE_URL=/api/v2
```

## 🚀 使用

### 开发

启动开发服务器，支持热模块替换：

```bash
pnpm dev
```

应用将在 `http://localhost:5173` 可用

### 生产构建

构建优化后的生产版本：

```bash
pnpm build
```

构建输出将在 `dist/` 目录中。

### 预览生产构建

本地预览生产构建：

```bash
pnpm preview
```

### 类型检查

运行 TypeScript 类型检查：

```bash
pnpm check
```

### 代码检查

运行 ESLint 检查和修复代码风格：

```bash
pnpm lint
```

## 🛠️ 开发

### 项目结构

```
src/
├── api/              # API 层，集成 qBittorrent WebUI
│   ├── modules/      # API 模块（种子、认证、RSS 等）
│   ├── http.ts       # HTTP 客户端配置
│   ├── types.ts      # TypeScript 类型定义
│   └── index.ts      # API 导出
├── components/       # Vue 组件
│   ├── CanvasList/   # 高性能虚拟列表组件
│   ├── dialog/       # 对话框组件（设置、添加种子等）
│   └── Settings/     # 设置面板
├── composables/      # 可复用的组合式函数
│   ├── useColumns.ts # 表格列管理
│   ├── useI18n.ts    # 国际化辅助
│   └── useSelection.ts # 选择状态管理
├── store/            # Pinia 状态管理
│   ├── torrent.ts    # 种子状态管理
│   ├── setting.ts    # 应用设置
│   └── session.ts    # 会话和认证
├── views/            # 页面级组件
│   ├── DashboardView.vue # 主种子仪表盘
│   ├── LoginView.vue     # 登录页面
│   └── SettingsView.vue  # 设置页面
├── router/           # Vue Router 配置
├── i18n/             # 国际化文件
│   └── locales/      # 语言文件（en-US、zh-CN）
├── utils/            # 工具函数
└── styles/           # 全局样式
```

### 技术栈

| 类别            | 技术                             |
| --------------- | -------------------------------- |
| **框架**        | Vue 3.5.27 (Composition API)     |
| **语言**        | TypeScript 5.8.3                 |
| **构建工具**    | Vite 7.0.0 (with rolldown)       |
| **UI 库**       | Naive UI 2.43.2                  |
| **状态管理**    | Pinia 3.0.4                      |
| **路由**        | Vue Router 4.6.4                 |
| **HTTP 客户端** | Axios 1.13.2                     |
| **样式**        | UnoCSS 66.6.0 + Less 4.5.1       |
| **国际化**      | Vue I18n 9.14.5                  |
| **工具库**      | VueUse 13.9.0, Lodash-es 4.17.23 |

### 可用脚本

| 命令                 | 描述                         |
| -------------------- | ---------------------------- |
| `pnpm dev`           | 在 5173 端口启动开发服务器   |
| `pnpm build`         | 类型检查并构建生产版本       |
| `pnpm build:prod`    | 带环境配置的生产构建         |
| `pnpm check`         | 仅 TypeScript 类型检查       |
| `pnpm preview`       | 本地预览生产构建             |
| `pnpm lint`          | ESLint 自动修复              |
| `pnpm lint:fix`      | 与 lint 相同（启用自动修复） |
| `pnpm release`       | GitHub Actions 发布          |
| `pnpm release:check` | 环境验证                     |

### 代码风格

本项目遵循以下约定：

- **无分号** (由 ESLint 强制执行)
- **单引号** 用于字符串
- **2 空格** 缩进
- **120 字符** 最大行宽
- **Composition API** 用于所有 Vue 组件
- **TypeScript 严格模式** 启用

更多详情请参阅 [AGENTS.md](AGENTS.md)。

## 🌐 API 集成

本项目集成了 qBittorrent WebUI API (v4.1+)。API 文档请参阅：

- [qBittorrent WebUI API 文档](<https://github.com/qbittorrent/qBittorrent/wiki/WebUI-API-(qBittorrent-4.1)>)

### 支持的 API 端点

- **认证** - 登录、登出、会话管理
- **种子** - 列表、添加、删除、暂停、恢复、设置属性
- **传输** - 全局速度限制、连接设置
- **应用** - 首选项、默认保存路径
- **RSS** - 订阅源管理和规则
- **日志** - 主日志和对等日志
- **搜索** - 插件管理和搜索操作
- **同步** - 主数据同步

## 🤝 贡献

欢迎贡献！以下是您可以提供帮助的方式：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'feat: 添加某个很棒的特性'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

请确保您的代码：

- 通过 TypeScript 类型检查 (`pnpm check`)
- 遵循代码风格指南 (`pnpm lint`)
- 包含适当的文档

## 📝 发布流程

本项目通过 GitHub Actions 使用自动化发布：

1. 验证您的环境：`pnpm release:check`
2. 触发发布工作流：`pnpm release`
3. 语义化版本控制和变更日志生成是自动化的

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

Copyright (c) 2024-2026 Jianxiong Cao

## 🙏 致谢

使用以下优秀的开源项目构建：

- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Naive UI](https://www.naiveui.com/) - Vue 3 组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [qBittorrent](https://www.qbittorrent.org/) - 免费的 BitTorrent 客户端
- [TypeScript](https://www.typescriptlang.org/) - 带类型的 JavaScript
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理
- [UnoCSS](https://unocss.dev/) - 即时按需原子化 CSS 引擎

## ⭐ Star 历史

如果你喜欢这个项目，请给它一个 star！⭐

[![Star History Chart](https://api.star-history.com/svg?repos=jianxcao/qb-web&type=Date)](https://star-history.com/#jianxcao/qb-web&Date)

## 📞 支持

- **问题反馈**：[GitHub Issues](https://github.com/jianxcao/qb-web/issues)
- **讨论交流**：[GitHub Discussions](https://github.com/jianxcao/qb-web/discussions)

---

用 ❤️ 由 [Jianxiong Cao](https://github.com/jianxcao) 制作
