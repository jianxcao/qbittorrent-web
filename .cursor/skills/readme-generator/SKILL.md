---
name: readme-generator
description: Generate or update comprehensive bilingual README documentation (English and Chinese) for projects. Analyzes project structure, package.json, existing docs, and code to create detailed README.md and README.zh-CN.md files. Use when creating new README files, updating project documentation, or when the user asks to generate, update, or improve README documentation.
---

# README Generator

Generate comprehensive bilingual README documentation that accurately reflects your project's structure, features, and usage patterns.

## When to Apply

- User asks to generate, create, or update README documentation
- User mentions README.md, README.zh-CN.md, or project documentation
- Project needs documentation updates after significant changes
- New project requiring initial documentation

## Core Principles

1. **Accuracy First**: Analyze actual code, not assumptions
2. **Bilingual Consistency**: Keep English and Chinese versions in sync
3. **Project Context**: Match existing documentation style and tone
4. **Comprehensive Coverage**: Include all essential sections

## Generation Workflow

### Phase 1: Analysis

Before writing, gather information:

**Required Reading:**
- `package.json` - Project metadata, scripts, dependencies
- `AGENTS.md` or similar - Development guidelines
- Existing README files - Current style and structure
- `src/` structure - Architecture and components
- `tsconfig.json`, `vite.config.ts` - Build configuration

**Optional Reading (if exists):**
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history
- `LICENSE` - License information
- `.github/workflows/` - CI/CD setup
- Docker files - Deployment info

**Analysis Checklist:**
```
- [ ] Read package.json for name, description, scripts, dependencies
- [ ] Read project structure (src/, public/, scripts/)
- [ ] Read existing README if present
- [ ] Identify key features from code
- [ ] Check for internationalization (i18n/)
- [ ] Check for Docker/deployment configs
- [ ] Review build and dev scripts
```

### Phase 2: Structure Planning

Determine which sections to include based on project type:

**Always Include:**
- Project title with logo/badge (if available)
- Description (from package.json + enhancement)
- Features (analyze code to identify)
- Quick Start (installation + basic usage)
- Development (setup + common commands)

**Include If Applicable:**
- Screenshots/Demo (if UI project)
- Architecture (if complex structure)
- API Documentation (if library/API)
- Configuration (if configurable)
- Docker Deployment (if Dockerfile exists)
- Contributing Guidelines (link to CONTRIBUTING.md or inline)
- FAQ (for common issues)
- Roadmap (for active development)
- Changelog (link to releases)
- License (from package.json)
- Acknowledgments (if using notable dependencies)

### Phase 3: Content Generation

#### Title and Badges

```markdown
# Project Name

[Badge examples - choose relevant ones:]
[![GitHub release](https://img.shields.io/github/v/release/user/repo)](https://github.com/user/repo/releases)
[![License](https://img.shields.io/github/license/user/repo)](LICENSE)
[![Node Version](https://img.shields.io/node/v/package-name)](package.json)
```

#### Description Section

- Start with a compelling one-liner from package.json description
- Expand with 2-3 sentences about what problem it solves
- Highlight unique selling points
- Keep it concise (3-5 sentences max)

#### Features Section

Extract features from:
- Code structure analysis
- Key dependencies (Vue Router → routing, Pinia → state management)
- UI components (if web app)
- Special functionality (virtual scrolling, i18n, etc.)

Format as bullet points with icons (optional):
```markdown
## ✨ Features

- 🚀 **Modern Stack** - Vue 3 + TypeScript + Vite
- 📱 **Responsive Design** - Mobile-first UI
- 🌍 **Internationalization** - Multi-language support
- ⚡ **Performance** - Virtual scrolling for large lists
```

#### Installation Section

```markdown
## 📦 Installation

### Prerequisites

- Node.js >= X.X.X
- pnpm >= X.X.X (or npm/yarn)

### Clone and Install

\`\`\`bash
git clone https://github.com/user/repo.git
cd repo
pnpm install
\`\`\`
```

#### Usage Section

Provide concrete examples:

```markdown
## 🚀 Usage

### Development

\`\`\`bash
pnpm dev
\`\`\`

Open http://localhost:5173 in your browser.

### Build

\`\`\`bash
pnpm build
\`\`\`

### Preview

\`\`\`bash
pnpm preview
\`\`\`
```

#### Development Section

```markdown
## 🛠️ Development

### Project Structure

\`\`\`
src/
├── api/          # API layer
├── components/   # Vue components
├── composables/  # Reusable compositions
├── store/        # Pinia stores
├── router/       # Vue Router
├── views/        # Pages
└── utils/        # Utilities
\`\`\`

### Available Scripts

| Command | Description |
|---------|-------------|
| \`pnpm dev\` | Start dev server |
| \`pnpm build\` | Production build |
| \`pnpm lint\` | Lint and fix |
| \`pnpm check\` | Type check |

### Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Naive UI / Element Plus / etc.
- **State Management**: Pinia
- **Routing**: Vue Router
```

#### Configuration Section (if applicable)

```markdown
## ⚙️ Configuration

### Environment Variables

Create \`.env\` file:

\`\`\`env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=My App
\`\`\`

### Available Options

| Variable | Description | Default |
|----------|-------------|---------|
| \`VITE_API_BASE_URL\` | API endpoint | - |
```

#### Docker Section (if Dockerfile exists)

```markdown
## 🐳 Docker Deployment

\`\`\`bash
# Build image
docker build -t project-name .

# Run container
docker run -p 8080:80 project-name
\`\`\`

Or use Docker Compose:

\`\`\`bash
docker-compose up -d
\`\`\`
```

#### Contributing Section

```markdown
## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'feat: add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request
```

#### License Section

```markdown
## 📄 License

This project is licensed under the [MIT License](LICENSE).
```

### Phase 4: Bilingual Generation

#### Translation Strategy

1. **Generate English version first** (README.md)
2. **Translate to Chinese** (README.zh-CN.md)
3. **Ensure consistency**:
   - Technical terms: Keep English or add Chinese translation in parentheses
   - Code examples: Identical in both versions
   - File paths: Identical in both versions
   - Version numbers: Identical in both versions

#### Chinese Translation Guidelines

**Technical Terms Translation:**

| English | Chinese | Note |
|---------|---------|------|
| Feature | 特性 / 功能 | Context-dependent |
| Installation | 安装 | - |
| Usage | 使用 | - |
| Development | 开发 | - |
| Configuration | 配置 | - |
| Contributing | 贡献 | - |
| License | 许可证 | - |
| Quick Start | 快速开始 | - |
| Prerequisites | 前置要求 | - |
| Build | 构建 | - |
| Deploy | 部署 | - |

**Keep in English:**
- Package names (npm, pnpm, Vite, Vue, etc.)
- Command names (dev, build, lint)
- File paths and code
- URLs and links
- Version numbers

**Example Chinese Title:**

```markdown
# 项目名称

> 项目简介的中文翻译

[中文] | [English](README.md)
```

### Phase 5: File Linking

Add language switcher at the top of each README:

**README.md:**
```markdown
[English](README.md) | [简体中文](README.zh-CN.md)
```

**README.zh-CN.md:**
```markdown
[English](README.md) | [简体中文](README.zh-CN.md)
```

### Phase 6: Validation

Before finalizing, verify:

**Content Accuracy:**
- [ ] All scripts mentioned exist in package.json
- [ ] File paths match actual structure
- [ ] Version numbers are current
- [ ] URLs are valid (repo, issues, homepage)
- [ ] Dependencies mentioned are actually used

**Consistency:**
- [ ] English and Chinese versions have same structure
- [ ] Code blocks are identical in both versions
- [ ] All links work in both versions
- [ ] Technical accuracy is maintained in translation

**Completeness:**
- [ ] No placeholder text (TODO, FIXME, etc.)
- [ ] No broken links
- [ ] All sections have content
- [ ] Examples are concrete and testable

**Style:**
- [ ] Matches existing project documentation style
- [ ] Consistent formatting (headings, lists, code blocks)
- [ ] Professional tone
- [ ] Clear and concise language

## README Templates

### Minimal Template (Basic Projects)

```markdown
# Project Name

[Language switcher]

## 📖 Description

[1-2 paragraphs describing the project]

## ✨ Features

- Feature 1
- Feature 2
- Feature 3

## 📦 Installation

\`\`\`bash
npm install
\`\`\`

## 🚀 Usage

\`\`\`bash
npm run dev
\`\`\`

## 📄 License

[License information]
```

### Standard Template (Most Projects)

Use the sections outlined in Phase 3, including:
- Title + Badges
- Description
- Features
- Installation (with prerequisites)
- Usage
- Development
- Contributing
- License

### Comprehensive Template (Complex Projects)

Add to standard template:
- Screenshots/Demo
- Architecture diagram or explanation
- API Documentation
- Configuration details
- Docker deployment
- FAQ
- Roadmap
- Changelog link
- Acknowledgments

## Common Patterns

### Vue Project README

Key sections to emphasize:
- Tech stack (Vue version, TypeScript, build tool)
- Project structure (src/ organization)
- Component architecture
- State management approach
- Development workflow
- Build and deployment

### Library/Package README

Key sections to emphasize:
- Installation via package manager
- API documentation
- Usage examples with code
- TypeScript types
- Browser compatibility
- Bundle size

### Full-Stack Project README

Key sections to emphasize:
- Architecture overview (frontend + backend)
- Separate setup instructions
- Environment variables
- API endpoints
- Database setup
- Deployment guide

## Tips for Quality README

1. **Show, Don't Tell**: Use code examples instead of describing
2. **Be Specific**: "npm run dev starts on port 5173" not "run dev server"
3. **Test Everything**: Every command should actually work
4. **Keep It Updated**: README should match current code state
5. **Use Visuals**: Screenshots for UI, diagrams for architecture
6. **Link Liberally**: Link to detailed docs, issues, wiki
7. **Consider Audience**: Adjust detail level for target users

## Anti-Patterns to Avoid

❌ **Placeholder Content**
```markdown
## Features
TODO: Add features list
```

❌ **Outdated Information**
```markdown
npm install express@3.0.0  # Project actually uses v4
```

❌ **Vague Instructions**
```markdown
Install dependencies and run the app
```

❌ **Broken Links**
```markdown
[Documentation](docs/guide.md)  # File doesn't exist
```

❌ **Inconsistent Bilingual Content**
```markdown
# English has 10 sections
# Chinese has 6 sections
```

❌ **Machine Translation Quality**
```markdown
# Use natural language, not word-by-word translation
```

## Handling Updates

When updating existing README:

1. **Preserve Style**: Match existing formatting and tone
2. **Incremental Changes**: Don't rewrite unless requested
3. **Keep History**: Maintain existing badges, acknowledgments
4. **Sync Languages**: Update both English and Chinese
5. **Validate Links**: Ensure all existing links still work

## Example Workflow

```markdown
User: "Generate README for this project"

Agent:
1. Read package.json → Get name, description, scripts, dependencies
2. Read src/ structure → Understand architecture
3. Check for existing README → Analyze style
4. Check for i18n/ → Project has internationalization
5. Check for Dockerfile → Project supports Docker
6. Generate comprehensive README.md (English)
7. Translate to README.zh-CN.md (Chinese)
8. Add language switcher to both
9. Validate all commands and links
10. Present both files to user
```

## Additional Resources

For reference when generating README:

- **Badges**: [shields.io](https://shields.io/) for status badges
- **Emojis**: [gitmoji](https://gitmoji.dev/) for commit/section emojis
- **Markdown**: [GitHub Flavored Markdown](https://github.github.com/gfm/)
- **Examples**: Search "awesome readme" on GitHub for inspiration

## Summary

When generating README documentation:

1. ✅ Analyze project thoroughly before writing
2. ✅ Match content to project complexity and type
3. ✅ Generate English first, then translate to Chinese
4. ✅ Ensure bilingual consistency
5. ✅ Validate all commands, paths, and links
6. ✅ Use concrete examples, not vague descriptions
7. ✅ Keep it maintainable and up-to-date
