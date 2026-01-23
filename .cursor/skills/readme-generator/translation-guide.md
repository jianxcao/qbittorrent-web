# Translation Guidelines

Detailed guidelines for translating README files from English to Chinese.

## Core Translation Principles

### 1. Technical Accuracy Over Literal Translation

Prioritize conveying the correct technical meaning rather than word-for-word translation.

**Good:**
- "responsive design" → "响应式设计" (established term)
- "virtual scrolling" → "虚拟滚动" (clear technical meaning)

**Avoid:**
- "responsive design" → "反应灵敏的设计" (literal but wrong)

### 2. Keep Code and Technical Identifiers Unchanged

Never translate:
- Variable names
- Function names
- Package names
- Command names
- File paths
- URLs
- Code in code blocks

**Good:**
```markdown
运行 `pnpm dev` 启动开发服务器
```

**Bad:**
```markdown
运行 `pnpm 开发` 启动开发服务器
```

### 3. Use Parenthetical English for Ambiguous Terms

For terms that might be unclear in Chinese, include English in parentheses:

```markdown
- 使用 Pinia 进行状态管理 (State Management)
- 支持服务端渲染 (Server-Side Rendering, SSR)
- 实现了虚拟滚动 (Virtual Scrolling) 优化性能
```

## Common Technical Terms

### Framework & Library Terms

| English | Chinese | Notes |
|---------|---------|-------|
| Framework | 框架 | - |
| Library | 库 / 类库 | Both acceptable |
| Component | 组件 | - |
| Plugin | 插件 | - |
| Module | 模块 | - |
| Package | 包 / 依赖包 | Context-dependent |
| Dependency | 依赖 / 依赖项 | - |

### Development Terms

| English | Chinese | Notes |
|---------|---------|-------|
| Build | 构建 | Not 建造 |
| Development | 开发 | - |
| Production | 生产环境 | Add 环境 for clarity |
| Debug | 调试 | - |
| Deploy | 部署 | - |
| Release | 发布 | - |
| Install | 安装 | - |
| Setup | 设置 / 配置 | Context-dependent |
| Configuration | 配置 | - |
| Environment | 环境 | - |

### Architecture Terms

| English | Chinese | Notes |
|---------|---------|-------|
| Architecture | 架构 | - |
| Frontend | 前端 | - |
| Backend | 后端 | - |
| Full-stack | 全栈 | - |
| API | API / 接口 | API preferred |
| Endpoint | 端点 / 接口 | Context-dependent |
| Route | 路由 | - |
| Router | 路由器 | - |
| State Management | 状态管理 | - |
| Store | Store / 状态存储 | Context-dependent |

### UI/UX Terms

| English | Chinese | Notes |
|---------|---------|-------|
| User Interface (UI) | 用户界面 | Often keep as UI |
| User Experience (UX) | 用户体验 | Often keep as UX |
| Responsive Design | 响应式设计 | - |
| Mobile-first | 移动优先 | - |
| Layout | 布局 | - |
| Theme | 主题 | - |
| Style | 样式 | - |
| Animation | 动画 | - |

### Feature Terms

| English | Chinese | Notes |
|---------|---------|-------|
| Feature | 特性 / 功能 | 特性 for major features |
| Functionality | 功能 | - |
| Support | 支持 | - |
| Performance | 性能 | - |
| Optimization | 优化 | - |
| Virtual Scrolling | 虚拟滚动 | - |
| Lazy Loading | 懒加载 / 延迟加载 | Both acceptable |
| Hot Module Replacement | 热模块替换 | Often keep as HMR |
| Code Splitting | 代码分割 | - |
| Tree Shaking | Tree Shaking / 树摇 | Keep English |

### Documentation Terms

| English | Chinese | Notes |
|---------|---------|-------|
| Documentation | 文档 | - |
| Guide | 指南 | - |
| Tutorial | 教程 | - |
| Example | 示例 | - |
| Usage | 使用方法 / 用法 | Context-dependent |
| API Reference | API 参考 | - |
| Quick Start | 快速开始 | - |
| Getting Started | 开始使用 | - |
| Prerequisites | 前置要求 / 先决条件 | - |

### Git & Version Control

| English | Chinese | Notes |
|---------|---------|-------|
| Repository | 仓库 | - |
| Commit | 提交 | - |
| Branch | 分支 | - |
| Pull Request | Pull Request / 拉取请求 | Keep PR |
| Merge | 合并 | - |
| Fork | Fork / 派生 | Keep Fork |
| Clone | 克隆 | - |
| Push | 推送 | - |
| Pull | 拉取 | - |

## Section-Specific Translation

### Title and Description

**English:**
```markdown
# qb-web

🚀 A modern qBittorrent web interface built with Vue 3 + TypeScript, featuring responsive design, virtual scrolling, and smart filtering.
```

**Chinese:**
```markdown
# qb-web

🚀 现代化的 qBittorrent Web 界面,基于 Vue 3 + TypeScript 构建,支持响应式设计、虚拟滚动和智能过滤功能。
```

### Features Section

**English:**
```markdown
## ✨ Features

- 🚀 **Modern Stack** - Vue 3 + TypeScript + Vite
- 📱 **Responsive Design** - Mobile-first UI with adaptive layout
- ⚡ **Performance** - Virtual scrolling for smooth handling of large torrent lists
```

**Chinese:**
```markdown
## ✨ 特性

- 🚀 **现代化技术栈** - Vue 3 + TypeScript + Vite
- 📱 **响应式设计** - 移动优先的自适应布局
- ⚡ **高性能** - 虚拟滚动技术流畅处理大型种子列表
```

### Installation Section

**English:**
```markdown
## 📦 Installation

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Clone and Install

\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
pnpm install
\`\`\`
```

**Chinese:**
```markdown
## 📦 安装

### 前置要求

- Node.js >= 20.0.0
- pnpm >= 10.0.0

### 克隆并安装

\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
pnpm install
\`\`\`
```

### Commands and Scripts

Keep commands unchanged, translate only descriptions:

**English:**
```markdown
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
```

**Chinese:**
```markdown
| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
```

### Development Section

**English:**
```markdown
## 🛠️ Development

### Project Structure

\`\`\`
src/
├── api/          # API layer
├── components/   # Vue components
├── store/        # Pinia stores
\`\`\`

### Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
```

**Chinese:**
```markdown
## 🛠️ 开发

### 项目结构

\`\`\`
src/
├── api/          # API 层
├── components/   # Vue 组件
├── store/        # Pinia 状态存储
\`\`\`

### 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
```

## Style Guidelines

### 1. Punctuation

Use Chinese punctuation in Chinese text:

**Good:**
```markdown
这是一个现代化的 Web 应用,支持多种功能。
```

**Bad:**
```markdown
这是一个现代化的 Web 应用,支持多种功能.
```

**Exception**: Keep English punctuation in code and technical contexts:
```markdown
运行 `pnpm dev` 命令启动服务器。
```

### 2. Spacing

Add space between Chinese and English/numbers:

**Good:**
```markdown
基于 Vue 3 构建
支持 Node.js 20 以上版本
```

**Bad:**
```markdown
基于Vue 3构建
支持Node.js 20以上版本
```

### 3. Numbers

Keep numbers and units unchanged:

**Good:**
```markdown
需要 Node.js >= 20.0.0
端口 5173
```

**Bad:**
```markdown
需要 Node.js >= 二十点零点零
端口 五一七三
```

### 4. Links

Keep link text English if it's a proper name or technical term:

**Good:**
```markdown
查看 [GitHub Issues](https://github.com/user/repo/issues)
访问 [API 文档](https://docs.example.com)
```

## Context-Dependent Translation

Some words require different translations based on context:

### "Support"

```markdown
# Context: Feature description
"Support TypeScript" → "支持 TypeScript"

# Context: Help/Assistance
"Need support?" → "需要帮助吗?"
"Community support" → "社区支持"
```

### "Build"

```markdown
# Context: Compilation
"Build the project" → "构建项目"

# Context: Development
"Build with Vue" → "使用 Vue 构建"
"Built with modern tools" → "采用现代化工具构建"
```

### "Run"

```markdown
# Context: Execute command
"Run the server" → "运行服务器"

# Context: Application running
"The app is running" → "应用正在运行"
```

## Quality Checklist

Before finalizing Chinese translation:

- [ ] All technical terms are accurate
- [ ] Code blocks are unchanged
- [ ] Commands are unchanged
- [ ] File paths are unchanged
- [ ] URLs are unchanged
- [ ] Proper spacing between Chinese and English
- [ ] Correct Chinese punctuation
- [ ] Consistent terminology throughout
- [ ] Natural Chinese expression (not word-for-word)
- [ ] Same structure as English version
- [ ] All links work
- [ ] No machine translation artifacts

## Common Translation Mistakes

### ❌ Mistake 1: Translating Package Names

**Wrong:**
```markdown
安装 平米 (pnpm)
```

**Correct:**
```markdown
安装 pnpm
```

### ❌ Mistake 2: Translating Commands

**Wrong:**
```markdown
运行 `pnpm 开发` 启动服务器
```

**Correct:**
```markdown
运行 `pnpm dev` 启动开发服务器
```

### ❌ Mistake 3: Inconsistent Terminology

**Wrong:**
```markdown
# Section 1: 使用组件
# Section 2: 使用 Component
```

**Correct:**
```markdown
# Section 1: 使用组件
# Section 2: 使用组件
```

### ❌ Mistake 4: Missing Spaces

**Wrong:**
```markdown
基于Vue 3和TypeScript构建
```

**Correct:**
```markdown
基于 Vue 3 和 TypeScript 构建
```

### ❌ Mistake 5: Wrong Punctuation

**Wrong:**
```markdown
支持以下功能:
- 功能1
- 功能2
```

**Correct:**
```markdown
支持以下功能:
- 功能 1
- 功能 2
```

## Example: Complete Translation

### English Version

```markdown
## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:
- Node.js >= 20.0.0
- pnpm >= 10.0.0

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/user/qb-web.git
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   cd qb-web
   pnpm install
   \`\`\`

3. Start development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

The app will be running at [http://localhost:5173](http://localhost:5173).
```

### Chinese Version

```markdown
## 🚀 快速开始

### 前置要求

开始之前,请确保已安装:
- Node.js >= 20.0.0
- pnpm >= 10.0.0

### 安装步骤

1. 克隆仓库:
   \`\`\`bash
   git clone https://github.com/user/qb-web.git
   \`\`\`

2. 安装依赖:
   \`\`\`bash
   cd qb-web
   pnpm install
   \`\`\`

3. 启动开发服务器:
   \`\`\`bash
   pnpm dev
   \`\`\`

应用将在 [http://localhost:5173](http://localhost:5173) 运行。
```

## Summary

When translating README files:

1. ✅ Maintain technical accuracy
2. ✅ Keep code and commands unchanged
3. ✅ Use established Chinese technical terms
4. ✅ Add English in parentheses when helpful
5. ✅ Follow Chinese punctuation rules
6. ✅ Add spaces between Chinese and English
7. ✅ Ensure consistent terminology
8. ✅ Write natural Chinese (not literal translation)
