# Quick Reference

Fast reference guide for generating README documentation.

## Generation Checklist

When user requests README generation:

```
Phase 1: Analysis (Required Reading)
- [ ] package.json - Name, description, scripts, dependencies
- [ ] AGENTS.md or similar - Dev guidelines
- [ ] Existing README - Current style
- [ ] src/ structure - Architecture overview
- [ ] Build configs - tsconfig.json, vite.config.ts

Phase 2: Structure Selection
- [ ] Choose template based on project type
- [ ] Determine sections to include
- [ ] Identify special features (Docker, i18n, etc.)

Phase 3: Content Generation
- [ ] Write English README.md
- [ ] Translate to Chinese README.zh-CN.md
- [ ] Add language switcher to both
- [ ] Validate all information

Phase 4: Final Validation
- [ ] All commands work
- [ ] All paths exist
- [ ] Versions are current
- [ ] Links are valid
- [ ] Both languages are consistent
```

## Essential Sections (Always Include)

```markdown
# Project Title
[Language switcher]

## Description
[1-2 compelling paragraphs]

## Features
[Bullet list with key features]

## Installation
[Prerequisites + setup steps]

## Usage
[Basic commands with examples]

## Development
[Project structure + tech stack]

## License
[License info from package.json]
```

## Optional Sections (Include if Applicable)

- Screenshots/Demo (if UI project)
- Configuration (if env vars needed)
- Docker Deployment (if Dockerfile exists)
- Internationalization (if i18n/ exists)
- Contributing (for open source)
- Troubleshooting (for common issues)

## Translation Quick Tips

| Keep Unchanged | Translate |
|----------------|-----------|
| Package names (Vue, Vite, pnpm) | Descriptions |
| Commands (dev, build, lint) | Command explanations |
| File paths (src/, vite.config.ts) | Path comments |
| URLs and links | N/A |
| Code blocks | N/A |
| Version numbers | N/A |

## Common Terms

| English | Chinese |
|---------|---------|
| Feature | 特性/功能 |
| Installation | 安装 |
| Usage | 使用 |
| Development | 开发 |
| Configuration | 配置 |
| Build | 构建 |
| Deploy | 部署 |
| Framework | 框架 |
| Library | 库 |
| Component | 组件 |

## Validation Checklist

Before presenting to user:

```
Content Accuracy:
- [ ] All scripts exist in package.json
- [ ] File paths match actual structure
- [ ] Version numbers are current
- [ ] URLs work

Bilingual Consistency:
- [ ] Same structure in both languages
- [ ] Code blocks identical
- [ ] All links work in both

Quality:
- [ ] No placeholders (TODO, FIXME)
- [ ] No broken links
- [ ] Professional tone
- [ ] Clear and concise
```

## Quick Start Example

**User**: "Generate README for this project"

**Agent Steps**:
1. Read package.json → Get metadata
2. Read src/ → Understand structure
3. Check existing README → Match style
4. Generate comprehensive English README
5. Translate to Chinese README
6. Add language switcher
7. Validate all content
8. Present both files

## Common Mistakes to Avoid

❌ Don't translate package names
❌ Don't translate commands
❌ Don't translate code
❌ Don't use machine translation quality
❌ Don't include outdated information
❌ Don't have inconsistent bilingual content

## File Naming

- English: `README.md`
- Chinese: `README.zh-CN.md`

## Language Switcher Format

```markdown
[English](README.md) | [简体中文](README.zh-CN.md)
```

Place at the top of both files, right after the title or before it.
