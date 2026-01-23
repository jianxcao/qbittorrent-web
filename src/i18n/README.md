# 国际化 (i18n) 使用指南

本项目使用 Vue I18n 实现国际化功能，支持简体中文和英文。

## 功能特点

- 支持简体中文 (`zh-CN`) 和英文 (`en-US`)
- 语言设置会自动保存到 localStorage
- 提供语言切换组件
- 与项目设置系统集成

## 基本使用

### 在 Composition API 中使用

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 使用翻译函数
const title = t('header.title')
</script>

<template>
  <div>
    <h1>{{ $t('header.title') }}</h1>
    <p>{{ $t('common.loading') }}</p>
  </div>
</template>
```

### 在模板中使用

```vue
<template>
  <!-- 基本用法 -->
  <n-button>{{ $t('common.ok') }}</n-button>

  <!-- 绑定属性 -->
  <n-input :placeholder="$t('common.searchPlaceholder')" />

  <!-- 带参数的翻译 -->
  <span>{{ $t('statusBar.downloadSpeed', { speed: '1MB/s' }) }}</span>
</template>
```

## 切换语言

### 使用语言切换组件

已经在头部添加了语言切换组件：

```vue
<template>
  <LanguageSwitcher />
</template>
```

### 手动切换语言

```ts
import { useSettingStore } from '@/store/setting'

const settingStore = useSettingStore()

// 切换到英文
settingStore.setLanguage('en-US')

// 切换到中文
settingStore.setLanguage('zh-CN')
```

## 添加新的翻译

### 1. 在语言文件中添加翻译

**中文** (`src/i18n/locales/zh-CN.json`):
```json
{
  "newSection": {
    "myKey": "我的翻译"
  }
}
```

**英文** (`src/i18n/locales/en-US.json`):
```json
{
  "newSection": {
    "myKey": "My Translation"
  }
}
```

### 2. 在组件中使用

```vue
<template>
  <div>{{ $t('newSection.myKey') }}</div>
</template>
```

## 翻译键结构

当前的翻译键按以下结构组织：

```
common.*          # 通用文本 (ok, cancel, save 等)
nav.*             # 导航相关
status.*          # 状态文本
header.*          # 头部工具栏
sidebar.*         # 侧边栏
torrentList.*     # 种子列表
contextMenu.*     # 右键菜单
addTorrent.*      # 添加种子对话框
settings.*        # 设置页面
details.*         # 详情页面
statusBar.*       # 状态栏
notifications.*   # 通知
errors.*          # 错误信息
time.*            # 时间单位
units.*           # 数据单位
```

## 最佳实践

1. **使用有意义的键名**: 使用 `header.addTorrent` 而不是 `btn1`
2. **保持层级结构**: 相关的翻译放在同一个命名空间下
3. **避免重复**: 通用文本放在 `common` 下
4. **使用插值**: 对于动态内容使用 `{ }` 占位符
5. **保持同步**: 确保所有语言文件都有相同的键

## 自定义 Composable

项目提供了一个自定义的 composable：

```ts
import { useI18n } from '@/composables/useI18n'

const {
  t,                    // 翻译函数
  currentLocale,        // 当前语言
  currentLocaleLabel,   // 当前语言标签
  locales,             // 支持的语言列表
  switchLocale         // 切换语言函数
} = useI18n()
```

## 类型安全

项目配置了 TypeScript 支持，翻译键会有类型提示和检查。

## 扩展支持更多语言

要添加新语言：

1. 在 `src/i18n/locales/` 下创建新的语言文件 (如 `fr-FR.json`)
2. 在 `src/i18n/index.ts` 中导入并添加到 `messages` 和 `supportedLocales`
3. 更新类型定义

```ts
// 添加新语言
import frFR from './locales/fr-FR.json'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'fr-FR': frFR  // 新增
}

export const supportedLocales = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
  { value: 'fr-FR', label: 'Français' }  // 新增
]
```
