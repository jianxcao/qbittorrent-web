# AGENTS.md

Guidance for AI coding agents working in this repository. This file is intended
for Codex, Claude, Cursor, and similar tools.

## Project Snapshot

`qb-web` is a Vue 3 and TypeScript web UI for qBittorrent management. It targets
desktop and mobile layouts, uses virtualized torrent lists for performance, and
talks to the qBittorrent WebUI API through `/api/v2`.

- Framework: Vue 3.5 with Composition API and `<script setup>`
- Language: TypeScript 5.8 in strict mode
- Build: Vite through `rolldown-vite`
- UI: Naive UI, UnoCSS, Less
- State: Pinia setup stores
- Router: Vue Router history mode
- Package manager: pnpm >= 10
- Runtime: Node.js >= 20

## First Steps For Agents

1. Read this file and the local files relevant to the task before editing.
2. Check `git status --short` and preserve user changes. Do not revert or
   rewrite unrelated files.
3. Prefer existing patterns in nearby components, stores, composables, and API
   modules over introducing new abstractions.
4. Keep changes scoped. Avoid broad formatting churn, dependency upgrades, or
   generated file edits unless the task requires them.
5. After code changes, run the narrowest meaningful verification command first,
   then broader checks when risk justifies it.

## Commands

```bash
pnpm install
pnpm dev
pnpm check
pnpm lint
pnpm build
pnpm preview
pnpm build:prod
pnpm release:check
pnpm release
```

Notes:

- `pnpm dev` starts Vite on port `5173` and proxies `/api` to
  `VITE_DOMAIN` or `http://localhost:8080`.
- `pnpm check` runs `vue-tsc -b`.
- `pnpm lint` auto-fixes ESLint issues. Do not run it casually if unrelated
  user edits are present; inspect the diff afterward.
- `pnpm build` runs type checking and production build.
- There is currently no dedicated test framework configured.

## Repository Layout

```text
src/
  api/                 qBittorrent WebUI API wrappers and HTTP helpers
  api/modules/         Feature API modules such as torrents, auth, sync, rss
  components/          Reusable and feature components
  components/CanvasList/
                       High-performance torrent list and canvas renderers
  components/Settings/
                       Settings panels
  components/TorrentDetail/
                       Torrent detail tabs and context menus
  composables/         Shared Vue composition functions
  const/               Shared constants
  i18n/                Vue I18n setup and locale JSON files
  router/              Vue Router routes
  store/               Pinia setup stores
  styles/              Shared Less mixins and global styles
  utils/               Generic utilities
public/                Static public assets
scripts/               Build and release scripts
docs/                  README images and documentation assets
```

## Code Style

- Use 2 spaces, LF endings, UTF-8, and a final newline.
- Do not use semicolons.
- Use single quotes.
- Keep Prettier width at 120.
- Use braces for all control structures.
- `console` is allowed.
- `any` is allowed by ESLint, but prefer precise types where the shape is known.
- Use `@/` for source-root imports.
- Keep type-only imports as `import type`.

ESLint is configured in `eslint.config.js`; Prettier is configured in
`prettier.config.cjs`; editor defaults are in `.editorconfig`.

## Vue Conventions

- Use Composition API and `<script setup lang="ts">` for Vue SFCs.
- Follow nearby component structure for templates, script order, scoped Less,
  and Naive UI usage.
- Vue, Vue Router, and VueUse APIs are auto-imported by `unplugin-auto-import`,
  but explicit imports are also present in parts of the codebase. Match the
  surrounding file style.
- Naive UI components are auto-registered through `unplugin-vue-components`.
- Avoid destructuring reactive objects in a way that loses reactivity. Use refs,
  computed values, or `storeToRefs` when appropriate.
- Clean up timers, event listeners, resize observers, and polling in component
  teardown or composable cleanup paths.
- For mobile and desktop behavior, check both layouts. Many components have
  special mobile code paths.

## Pinia Conventions

- Stores use setup-store style with `defineStore(id, () => { ... })`.
- Keep domain state separated. Existing stores include torrent, torrent detail,
  settings, session, and toolbar state.
- Keep async API operations in stores or feature composables where existing code
  already owns that behavior.
- Use computed values for derived state. Be careful with expensive computed
  loops over torrent lists; this app optimizes large lists.
- If destructuring a store in a component, use `storeToRefs` for state and
  getters that must stay reactive.

## API Layer

- Put qBittorrent API calls under `src/api/modules/`.
- Reuse helpers from `src/api/http.ts`: `get`, `post`, `postMultipart`,
  `toFormData`, `toUrlEncoded`, and `hashesToParam`.
- qBittorrent form endpoints generally use
  `application/x-www-form-urlencoded`; file upload endpoints use `FormData`.
- The HTTP client redirects to `/login` on 403 through the global response
  interceptor. Do not duplicate that behavior in every call site.
- Keep API types in `src/api/types.ts` unless a type is genuinely local to one
  module.
- Preserve compatibility with qBittorrent version differences already handled
  in code, such as v4 versus v5 API parameter behavior.

## UI And Styling

- Prefer existing Naive UI components and local components before adding new
  dependencies.
- Use UnoCSS utilities for simple layout and spacing; use scoped Less when a
  component needs structured styles or mixins.
- Shared scrollbar and style helpers live in `src/styles/mix.less`.
- Icons are mostly local SVGs in `src/assets/icons` or Naive/Icon packages.
- Keep virtualized and canvas-list layout dimensions stable. Avoid changes that
  cause row height, list width, or scroll position to drift.
- When changing UI, verify both desktop and mobile breakpoints.

## Internationalization

- Supported locales are `zh-CN` and `en-US`.
- Locale JSON files live in `src/i18n/locales/`.
- Use `$t` in templates and `t` from the i18n composable in script logic.
- When adding user-facing text, update both locale files unless the existing
  surrounding code intentionally uses a literal.
- Preserve existing locale keys and naming style.

## Routing And Environment

- Routes are defined in `src/router/index.ts`.
- `VITE_BASE_URL` controls both Vite base path and router history base.
- Vite accepts env prefixes `VITE_`, `DOMAIN`, and `AUTH`.
- Dev proxy target is `VITE_DOMAIN` or `http://localhost:8080`.
- Docker/runtime deployment uses nginx and `entrypoint.sh`; do not assume Vite
  dev behavior matches the container path handling.

## Generated And Tooling Files

- `src/auto-imports.d.ts`, `components.d.ts`, `dist/`, and lockfiles may be
  generated or tool-managed. Edit them only when the task requires it.
- `pnpm-workspace.yaml` contains pnpm build-script allowlist settings. Preserve
  it when dependency install behavior depends on pnpm 10 or newer.
- Do not hand-edit `dist/` for source changes.

## Verification Guidance

Choose checks based on the change:

- Type-only or API signature change: `pnpm check`
- Vue, store, API, or routing change: `pnpm check`
- Formatting or lint-sensitive change: `pnpm lint`, then inspect the diff
- Production or Vite config change: `pnpm build`
- UI layout change: run `pnpm dev` and verify in a browser at
  `http://localhost:5173`

If a command cannot be run, record why in the final response.

## Agent-Specific Notes

- Codex: use local shell inspection and targeted edits. Prefer `rg` for search.
  Use `apply_patch` or equivalent patch edits rather than rewriting unrelated
  files.
- Claude: read the relevant files before proposing large changes. Keep
  responses grounded in actual repository code and commands.
- Cursor or other IDE agents: respect existing TypeScript, ESLint, and Prettier
  settings. Avoid applying editor-wide format operations to unrelated files.

## Common Pitfalls

- `pnpm lint` auto-fixes files and can create unrelated diffs.
- The app relies on large-list performance; avoid repeated full scans or deep
  watchers over torrents unless measured and necessary.
- Mobile behavior is not a thin wrapper around desktop behavior. Check the
  mobile components and composables before changing shared state.
- qBittorrent API versions differ. Do not remove compatibility guards without
  checking the related API behavior.
- Router base path and Vite base path are coupled through `VITE_BASE_URL`.
- Do not introduce a testing framework, state library, CSS framework, or request
  client unless explicitly asked.
