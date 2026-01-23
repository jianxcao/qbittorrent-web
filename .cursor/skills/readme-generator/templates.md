# README Section Templates

This document provides detailed templates for each common README section.

## 📋 Table of Contents Template

For long READMEs (>1000 lines), add a table of contents:

```markdown
## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
```

## 🎯 Project Status Badges

Common badges to include:

```markdown
<!-- Version & Release -->
[![GitHub release](https://img.shields.io/github/v/release/user/repo)](https://github.com/user/repo/releases)
[![npm version](https://img.shields.io/npm/v/package-name)](https://www.npmjs.com/package/package-name)

<!-- Build Status -->
[![Build Status](https://img.shields.io/github/actions/workflow/status/user/repo/ci.yml)](https://github.com/user/repo/actions)

<!-- Code Quality -->
[![codecov](https://codecov.io/gh/user/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/user/repo)
[![Code Quality](https://img.shields.io/codacy/grade/hash)](https://www.codacy.com/app/user/repo)

<!-- Dependencies -->
[![Dependencies](https://img.shields.io/librariesio/github/user/repo)](package.json)

<!-- License -->
[![License](https://img.shields.io/github/license/user/repo)](LICENSE)

<!-- Activity -->
[![Last Commit](https://img.shields.io/github/last-commit/user/repo)](https://github.com/user/repo/commits)
[![Contributors](https://img.shields.io/github/contributors/user/repo)](https://github.com/user/repo/graphs/contributors)

<!-- Downloads -->
[![npm downloads](https://img.shields.io/npm/dm/package-name)](https://www.npmjs.com/package/package-name)

<!-- Tech Stack -->
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
```

## 🖼️ Screenshots Section

For UI projects, include visual examples:

```markdown
## 📸 Screenshots

### Desktop View
![Desktop Screenshot](docs/screenshots/desktop.png)

### Mobile View
<p align="center">
  <img src="docs/screenshots/mobile.png" width="375" alt="Mobile Screenshot">
</p>

### Feature Showcase
| Feature 1 | Feature 2 | Feature 3 |
|-----------|-----------|-----------|
| ![](docs/screenshots/f1.png) | ![](docs/screenshots/f2.png) | ![](docs/screenshots/f3.png) |
```

## 🎬 Demo Section

Link to live demos or videos:

```markdown
## 🎬 Demo

### Live Demo
🔗 **[Try it online](https://demo.example.com)**

### Video Tutorial
📺 [Watch on YouTube](https://youtube.com/watch?v=xxx)

### Interactive Examples
- [Basic Usage](https://codesandbox.io/s/xxx)
- [Advanced Features](https://stackblitz.com/edit/xxx)
```

## 🏗️ Architecture Section

For complex projects:

```markdown
## 🏗️ Architecture

### System Overview

\`\`\`
┌─────────────────────────────────────────────┐
│              Frontend (Vue 3)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Components│  │  Store   │  │  Router  │  │
│  │  (Views) │  │ (Pinia)  │  │   (VR)   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│         │            │            │         │
│         └────────────┴────────────┘         │
│                   │                         │
│              API Layer                      │
└─────────────────┬───────────────────────────┘
                  │
          ┌───────▼────────┐
          │   Backend API  │
          │  (REST/GraphQL)│
          └────────────────┘
\`\`\`

### Directory Structure

\`\`\`
src/
├── api/              # API integration layer
│   ├── modules/      # Feature-specific API modules
│   ├── http.ts       # HTTP client setup
│   └── types.ts      # API type definitions
├── components/       # Reusable Vue components
│   ├── common/       # Shared components
│   └── features/     # Feature-specific components
├── composables/      # Composition API hooks
├── store/            # Pinia state stores
│   ├── modules/      # Feature stores
│   └── index.ts      # Store exports
├── router/           # Vue Router configuration
│   ├── routes/       # Route definitions
│   └── guards.ts     # Navigation guards
├── views/            # Page-level components
├── utils/            # Utility functions
├── types/            # TypeScript types
├── assets/           # Static assets
└── styles/           # Global styles
\`\`\`

### Data Flow

1. User interacts with **Component**
2. Component calls **Store Action**
3. Action invokes **API Module**
4. API returns data and updates **Store State**
5. Component reactively updates via **Computed/Getter**
```

## 🔧 Troubleshooting Section

Common issues and solutions:

```markdown
## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5173`

**Solution**:
\`\`\`bash
# Find and kill process using the port
lsof -ti:5173 | xargs kill -9

# Or use a different port
pnpm dev --port 3000
\`\`\`

#### Module Not Found

**Problem**: `Cannot find module '@/components/...'`

**Solution**:
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
\`\`\`

#### Type Check Failures

**Problem**: `vue-tsc` reports type errors

**Solution**:
1. Check `tsconfig.json` settings
2. Ensure all dependencies are installed
3. Restart TypeScript server in IDE
```

## 🧪 Testing Section

For projects with tests:

```markdown
## 🧪 Testing

### Run All Tests

\`\`\`bash
pnpm test
\`\`\`

### Unit Tests

\`\`\`bash
pnpm test:unit
\`\`\`

### E2E Tests

\`\`\`bash
pnpm test:e2e
\`\`\`

### Coverage

\`\`\`bash
pnpm test:coverage
\`\`\`

### Writing Tests

\`\`\`typescript
// tests/unit/components/Example.spec.ts
import { mount } from '@vue/test-utils'
import Example from '@/components/Example.vue'

describe('Example.vue', () => {
  it('renders properly', () => {
    const wrapper = mount(Example, {
      props: { msg: 'Hello' }
    })
    expect(wrapper.text()).toContain('Hello')
  })
})
\`\`\`
```

## 🌍 Internationalization Section

For i18n-enabled projects:

```markdown
## 🌍 Internationalization

This project supports multiple languages using Vue I18n.

### Supported Languages

- 🇺🇸 English (en-US)
- 🇨🇳 简体中文 (zh-CN)
- 🇯🇵 日本語 (ja-JP)

### Adding a New Language

1. Create locale file: `src/i18n/locales/[lang].json`
2. Add translations:
   \`\`\`json
   {
     "app": {
       "title": "My App",
       "description": "App description"
     }
   }
   \`\`\`
3. Register in `src/i18n/index.ts`:
   \`\`\`typescript
   import lang from './locales/[lang].json'
   
   const messages = {
     // ...
     [lang]: lang
   }
   \`\`\`

### Usage in Components

\`\`\`vue
<template>
  <div>{{ $t('app.title') }}</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
console.log(t('app.title'))
</script>
\`\`\`
```

## 🚀 Performance Section

For performance-critical projects:

```markdown
## ⚡ Performance

### Optimization Strategies

- **Code Splitting**: Route-based lazy loading
- **Virtual Scrolling**: Efficient rendering of large lists
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service Worker + HTTP caching

### Bundle Analysis

\`\`\`bash
pnpm build --report
\`\`\`

### Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | 1.2s |
| Time to Interactive | < 3.5s | 2.8s |
| Lighthouse Score | > 90 | 95 |
```

## 🔐 Security Section

For security-sensitive projects:

```markdown
## 🔐 Security

### Security Features

- 🔒 HTTPS enforced
- 🛡️ CSRF protection
- 🔑 JWT authentication
- 🚫 XSS prevention
- 📝 Input validation

### Reporting Vulnerabilities

Please report security vulnerabilities to [security@example.com](mailto:security@example.com).

**Do not** open public issues for security vulnerabilities.

### Security Best Practices

- Keep dependencies updated
- Use environment variables for secrets
- Validate all user inputs
- Sanitize data before rendering
```

## 🗺️ Roadmap Section

For active projects:

```markdown
## 🗺️ Roadmap

### Current Version (v1.0.0)
- ✅ Core functionality
- ✅ Basic UI components
- ✅ User authentication

### Next Release (v1.1.0)
- 🚧 Dark mode support
- 🚧 Offline mode
- 📋 Performance improvements

### Future Plans
- 💡 Plugin system
- 💡 Mobile app
- 💡 Advanced analytics

See [milestones](https://github.com/user/repo/milestones) for details.
```

## 👥 Team Section

For organization projects:

```markdown
## 👥 Team

### Core Team

| Avatar | Name | Role | Contact |
|--------|------|------|---------|
| ![](https://github.com/user1.png?size=50) | [@user1](https://github.com/user1) | Project Lead | - |
| ![](https://github.com/user2.png?size=50) | [@user2](https://github.com/user2) | Developer | - |

### Contributors

Thanks to all contributors! 🎉

[![Contributors](https://contrib.rocks/image?repo=user/repo)](https://github.com/user/repo/graphs/contributors)
```

## 🙏 Acknowledgments Section

```markdown
## 🙏 Acknowledgments

### Built With

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Naive UI](https://www.naiveui.com/) - Vue 3 component library

### Inspired By

- [Project A](https://github.com/user/project-a) - Initial concept
- [Project B](https://github.com/user/project-b) - UI design patterns

### Special Thanks

- [@contributor1](https://github.com/contributor1) - For the awesome feature
- [@contributor2](https://github.com/contributor2) - For bug fixes
```

## 📞 Contact Section

```markdown
## 📞 Contact

### Maintainer

**Your Name**
- GitHub: [@username](https://github.com/username)
- Email: your.email@example.com
- Twitter: [@username](https://twitter.com/username)

### Community

- 💬 [Discussions](https://github.com/user/repo/discussions)
- 🐛 [Issues](https://github.com/user/repo/issues)
- 📧 Mailing List: list@example.com
- 💼 Discord: [Join Server](https://discord.gg/xxx)
```

## 📚 Additional Documentation Section

```markdown
## 📚 Documentation

- 📖 [Full Documentation](https://docs.example.com)
- 🎓 [Tutorials](https://docs.example.com/tutorials)
- 📘 [API Reference](https://docs.example.com/api)
- 💡 [Examples](https://github.com/user/repo/tree/main/examples)
- 🎥 [Video Guides](https://youtube.com/playlist?list=xxx)
```

## 📊 Project Statistics Section

```markdown
## 📊 Project Stats

![Alt](https://repobeats.axiom.co/api/embed/hash.svg "Repobeats analytics image")

### Repository Info

- ⭐ Stars: [View on GitHub](https://github.com/user/repo/stargazers)
- 🍴 Forks: [View on GitHub](https://github.com/user/repo/network/members)
- 🐛 Issues: [View on GitHub](https://github.com/user/repo/issues)
- 📝 Pull Requests: [View on GitHub](https://github.com/user/repo/pulls)
```
