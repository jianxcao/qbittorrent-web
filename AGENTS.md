# AGENTS.md

This file contains guidelines and commands for agentic coding agents working in the qb-web repository.

## Project Overview

**qb-web** is a modern Vue 3 + TypeScript web interface for qBittorrent client management.

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite 7.0.0 with rolldown-vite override
- **UI Library**: Naive UI 2.42.0
- **State Management**: Pinia 3.0.3
- **Styling**: UnoCSS + Less
- **Package Manager**: pnpm (>=10.0.0)
- **Node Version**: >=20.0.0

## Development Commands

```bash
# Development
pnpm dev                    # Start dev server on port 5173

# Building & Type Checking
pnpm build                  # Type-check and build for production
pnpm build:prod            # Production build with environment setup
pnpm check                  # TypeScript type checking only
pnpm preview               # Preview production build locally

# Code Quality
pnpm lint                   # ESLint with auto-fix
pnpm lint:fix              # Same as lint (auto-fix enabled)

# Release Management
pnpm release               # GitHub Actions release
pnpm release:check         # Environment validation
```

## Code Style Guidelines

### ESLint Configuration

- **Files**: `**/*.{ts,mts,tsx,vue}`
- **Key Rules**:
  - No semicolons (`semi: ['error', 'never']`)
  - Single quotes preferred
  - Console statements allowed (`no-console: 'off'`)
  - `@typescript-eslint/no-explicit-any`: off
  - Curly braces required for all control structures (`curly: ['error', 'all']`)
  - `@typescript-eslint/ban-ts-comment`: warn

### Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "none",
  "bracketSpacing": true,
  "printWidth": 120,
  "semi": false,
  "tabWidth": 2,
  "jsxSingleQuote": true
}
```

## Import Patterns & Conventions

### Import Order

```typescript
// 1. Vue ecosystem
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 2. Third-party libraries
import axios from 'axios'
import { defineStore } from 'pinia'

// 3. Local imports (absolute paths with @ alias)
import { useTorrentStore } from '@/store'
import type { Torrent } from '@/api/types'
```

### Naming Conventions

- **Components**: PascalCase (e.g., `CanvasList.vue`)
- **Composables**: camelCase with `use` prefix (e.g., `useColumns.ts`)
- **Stores**: camelCase with `use` prefix (e.g., `useTorrentStore`)
- **Utilities**: camelCase (e.g., `formatSpeed`)
- **Types**: PascalCase for interfaces (e.g., `Torrent`)
- **Constants**: UPPER_SNAKE_CASE for enums
- **Files**: kebab-case for directories, PascalCase for Vue components

## Directory Structure

```
src/
├── api/                    # API layer
│   ├── modules/           # API modules by feature
│   ├── http.ts            # HTTP client configuration
│   ├── types.ts           # Type definitions
│   └── index.ts           # API exports
├── components/            # Vue components
│   ├── AppHeader/         # Feature-specific components
│   ├── CanvasList/        # Complex list component
│   └── SiderbarView.vue   # Sidebar components
├── composables/           # Reusable composition functions
├── store/                 # Pinia stores
├── views/                 # Page-level components
├── router/                # Vue Router configuration
├── i18n/                  # Internationalization
├── utils/                 # Utility functions
├── assets/                # Static assets
└── styles/                # Global styles
```

## Architecture Patterns

### API Layer

- Modular API structure by feature in `src/api/modules/`
- Centralized HTTP client with interceptors in `src/api/http.ts`
- Type-safe API responses with TypeScript interfaces
- Helper functions for form data and URL encoding

### State Management

- Pinia with Composition API style
- Store separation by domain (torrent, setting, session)
- Reactive state with computed properties
- Async operations with proper error handling

### Component Architecture

- Feature-based component grouping
- Composition API for all components
- Reusable composables for shared logic
- Props and emits interfaces for type safety

## Error Handling Patterns

### HTTP Error Handling

```typescript
// Global interceptor handles 403 auto-redirect
httpClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (response?.status === 403) {
      // Auto-redirect to login
      if (window.router.currentRoute.value.path !== '/login') {
        window.router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)
```

### Store Error Handling

- Async operations wrapped in try-catch blocks
- Error state management in stores
- User notifications via Naive UI message system

## TypeScript Guidelines

### Type Definitions

- Co-locate types with their modules (e.g., `src/api/types.ts`)
- Use interfaces for object shapes
- Prefer explicit types over `any`
- Use generic types for API responses

### Auto-imports

- Vue ecosystem auto-imported via unplugin-auto-import
- Component auto-registration for Naive UI
- No need to manually import Vue composition functions

## Internationalization

- Vue I18n with Composition API
- Supported locales: `zh-CN`, `en-US`
- Locale persistence in localStorage
- Fallback to `en-US`
- Use `$t` in templates, `t` in script setup

## Build Configuration

### Environment Variables

- Prefix: `VITE_`, `DOMAIN`, `AUTH`
- Base URL configurable via `VITE_BASE_URL`
- Environment-specific builds

### Output

- Directory: `dist/`
- Advanced chunk splitting for common libraries
- Production optimizations enabled

## Testing

**Current Status**: No testing framework configured

- Consider adding Vitest for unit testing
- Consider adding Cypress/Playwright for E2E testing
- Test files should follow `*.test.ts` or `*.spec.ts` patterns

## Development Workflow

1. **Setup**: Ensure Node >=20.0.0 and pnpm >=10.0.0
2. **Install**: `pnpm install`
3. **Develop**: `pnpm dev` for hot module replacement
4. **Type Check**: `pnpm check` before commits
5. **Lint**: `pnpm lint` to fix code style issues
6. **Build**: `pnpm build` to verify production build

## Key Dependencies

### Core

- Vue 3.5.17 with Composition API
- TypeScript 5.8.3 (strict mode)
- Pinia 3.0.3 for state management
- Vue Router 4.5.1 for routing

### UI & Styling

- Naive UI 2.42.0 for components
- UnoCSS 66.3.2 for utility-first styling
- Less 4.3.0 for CSS preprocessing

### Utilities

- Axios 1.10.0 for HTTP requests
- VueUse 13.5.0 for composition utilities
- Day.js 1.11.13 for date handling
- Lodash-es 4.17.21 for utility functions

## Common Patterns

### Composables Pattern

```typescript
export function useFeature() {
  const state = ref()
  const computed = computed(() => state.value)

  const action = () => {
    // implementation
  }

  return {
    state,
    computed,
    action
  }
}
```

### Store Pattern

```typescript
export const useFeatureStore = defineStore('feature', () => {
  const state = ref()

  const getter = computed(() => state.value)

  const action = async () => {
    try {
      // async operation
    } catch (error) {
      // error handling
    }
  }

  return {
    state,
    getter,
    action
  }
})
```

## Git Hooks

Pre-commit hooks run linting automatically. Ensure code passes `pnpm lint` before committing.

## Release Process

Automated releases via GitHub Actions:

1. Run `pnpm release:check` to validate environment
2. Run `pnpm release` to trigger release workflow
3. Semantic versioning and changelog generation automated
