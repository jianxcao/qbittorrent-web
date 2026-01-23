---
name: i18n-checker
description: 检查和清理 Vue i18n 翻译文件，查找未使用的翻译 key、缺失的翻译、语言间不一致、空值翻译，以及提取重复的翻译值为公共 key。使用场景：检查 i18n 翻译、清理翻译文件、优化翻译结构，或当用户提及 i18n、翻译检查、重复翻译、未使用的翻译 key 等关键词时。
---

# i18n 翻译检查和清理

这个技能帮助你检查和清理 qb-web 项目中的 Vue i18n 翻译文件，确保翻译的完整性、一致性和最优化。

## 快速开始

当需要检查翻译时，按以下顺序执行：

1. **扫描代码中的翻译使用**
2. **加载所有语言文件**
3. **执行各项检查**
4. **生成报告并执行清理**

## 项目 i18n 配置

- **翻译文件位置**: `src/i18n/locales/`
- **支持的语言**: `zh-CN.json`, `en-US.json`
- **使用模式**: Vue I18n Composition API
- **调用方式**:
  - 模板中: `$t('key.path')`
  - 脚本中: `t('key.path')` 或 `i18n.global.t('key.path')`

## 检查工作流程

### 第 1 步：扫描代码中使用的翻译 key

搜索所有代码文件中的翻译 key 使用：

```bash
# 扫描模板中的 $t() 调用
rg '\$t\(["\']([^"\']+)["\']\)' --type vue --type ts -o

# 扫描脚本中的 t() 调用
rg '(?:^|[^$])t\(["\']([^"\']+)["\']\)' --type vue --type ts -o

# 扫描 i18n.global.t() 调用
rg 'i18n\.global\.t\(["\']([^"\']+)["\']\)' --type vue --type ts -o
```

**提取所有使用的 key**，存储到一个集合中。

### 第 2 步：加载翻译文件

读取所有语言的翻译文件：

- `src/i18n/locales/zh-CN.json`
- `src/i18n/locales/en-US.json`

解析 JSON 并提取所有的翻译 key（包括嵌套路径，如 `common.yes`, `login.title`）。

### 第 3 步：执行检查

按优先级执行以下检查：

#### 3.1 检查缺失的翻译（高优先级）

对比代码中使用的 key 和翻译文件中的 key：

- **缺失的 key**: 代码中使用但翻译文件中不存在
- **影响**: 会导致页面显示 key 本身而非翻译文本

**输出格式**:

```
❌ 缺失的翻译 key:
  - settings.newFeature.title (在 ConnectionSettings.vue:123 使用)
  - common.newButton (在 3 个文件中使用)
```

#### 3.2 检查语言间不一致（高优先级）

检查不同语言文件的 key 结构是否一致：

- zh-CN 有但 en-US 没有的 key
- en-US 有但 zh-CN 没有的 key

**输出格式**:

```
⚠️  语言间 key 不一致:
  zh-CN 独有:
    - settings.advanced.newOption
  en-US 独有:
    - settings.advanced.oldOption
```

#### 3.3 检查空值翻译（中优先级）

查找值为空字符串的翻译 key：

```
⚠️  空值翻译:
  - common.placeholder: ""
  - login.hint: ""
```

#### 3.4 检查未使用的 key（中优先级）

找出翻译文件中存在但代码中从未使用的 key：

```
🗑️  未使用的翻译 key (将被删除):
  - oldDialog.title
  - deprecated.message
  - test.debugInfo
```

#### 3.5 检查重复的翻译值（优化建议）

识别不同 key 但翻译内容相同的情况，建议提取为公共 key：

**检查逻辑**:

1. 遍历所有翻译值
2. 找出在**至少 2 个不同 key** 中出现的相同值
3. 排除极短的值（≤2 字符）和通用词（如 "是"、"否"、"确定"、"取消"）
4. 对于每个重复值，建议提取位置和新的公共 key 名称

**输出格式**:

```
💡 重复的翻译值（建议提取为公共 key）:

  值: "操作成功" (出现 5 次)
  当前使用位置:
    - settings.saveSuccess
    - category.addSuccess
    - tag.deleteSuccess
    - tracker.updateSuccess
    - profile.updateSuccess

  建议: 提取为 common.operationSuccess

  ---

  值: "请输入名称" (出现 3 次)
  当前使用位置:
    - dialog.namePlaceholder
    - category.namePlaceholder
    - tag.namePlaceholder

  建议: 提取为 common.enterNamePlaceholder
```

### 第 4 步：生成完整报告

汇总所有检查结果，按优先级排序：

```markdown
# i18n 翻译检查报告

## 📊 统计摘要

- 代码中使用的 key: 156 个
- zh-CN 翻译 key: 158 个
- en-US 翻译 key: 157 个
- 缺失的翻译: 2 个
- 未使用的 key: 5 个
- 语言不一致: 3 个
- 空值翻译: 1 个
- 重复翻译值: 8 组

## ❌ 缺失的翻译 (必须修复)

[详细列表...]

## ⚠️ 语言间不一致 (必须修复)

[详细列表...]

## ⚠️ 空值翻译 (建议修复)

[详细列表...]

## 🗑️ 未使用的翻译 key (将自动删除)

[详细列表...]

## 💡 重复翻译优化建议

[详细列表...]
```

### 第 5 步：执行自动清理

**仅对未使用的 key 执行自动删除**：

1. 读取两个语言文件的完整 JSON
2. 从 JSON 对象中删除未使用的 key（保持嵌套结构）
3. 使用格式化的 JSON 写回文件（2 空格缩进）
4. 报告删除结果

**注意**:

- ✅ 自动删除：未使用的 key
- ⚠️ 手动处理：缺失的翻译、语言不一致、空值
- 💡 手动决策：重复翻译提取（需要评估是否真的应该公用）

```
✅ 清理完成:
  - 已从 zh-CN.json 删除 5 个未使用的 key
  - 已从 en-US.json 删除 5 个未使用的 key
```

## 重复翻译提取指南

当发现重复翻译时，评估是否应该提取为公共 key：

### 应该提取的情况

- ✅ 通用的操作反馈消息（如 "操作成功"、"操作失败"）
- ✅ 常见的表单占位符（如 "请输入"、"请选择"）
- ✅ 通用的按钮文本（如 "保存并继续"）
- ✅ 标准的确认提示（如 "确认要删除吗？"）

### 不应该提取的情况

- ❌ 虽然文字相同但语义不同的翻译
- ❌ 可能在未来需要独立修改的翻译
- ❌ 仅出现 2 次且不太可能扩展的翻译

### 提取步骤

如果决定提取重复翻译：

1. 在 `common` 命名空间下创建新的公共 key
2. 使用语义化的命名（如 `operationSuccess` 而非 `success1`）
3. 更新所有使用旧 key 的代码位置
4. 删除旧的重复 key
5. 在两种语言文件中同步操作

## 正则表达式模式

用于搜索翻译使用的准确模式：

```javascript
// 模板中的 $t() 调用
/\$t\(['"]([^'"]+)['"]\)/g

// 脚本中的 t() 调用（不包括 $t）
/(?:^|[^$\w])t\(['"]([^'"]+)['"]\)/g

// i18n.global.t() 调用
/i18n\.global\.t\(['"]([^'"]+)['"]\)/g
```

## 扁平化嵌套 key

翻译文件是嵌套 JSON，但使用时是点号路径。需要扁平化处理：

```javascript
// 嵌套结构
{
  "common": {
    "yes": "Yes",
    "no": "No"
  }
}

// 扁平化为
{
  "common.yes": "Yes",
  "common.no": "No"
}
```

## 排除模式

某些情况不应该报告为问题：

- 动态构造的 key（如 `t(\`status.\${state}\`)`）：提示用户手动检查
- 测试文件中的 key
- 注释中的 key 引用

## 最佳实践建议

检查完成后，向用户提供以下建议：

1. **优先修复缺失的翻译**：避免页面显示错误
2. **保持语言文件同步**：每次添加新 key 时同步更新所有语言
3. **定期运行检查**：建议在提交前运行此检查
4. **使用 common 命名空间**：通用翻译统一放在 `common` 下
5. **语义化命名**：key 名称应该描述内容含义而非位置

## 输出示例

完整的检查输出示例：

```
🔍 正在检查 i18n 翻译...

📁 扫描代码文件...
  找到 156 个使用的翻译 key

📄 加载翻译文件...
  zh-CN.json: 158 个 key
  en-US.json: 157 个 key

🔎 执行检查...

❌ 发现 2 个缺失的翻译:
  1. settings.newFeature.title
     使用位置: src/components/Settings/ConnectionSettings.vue:123

  2. common.newAction
     使用位置:
       - src/components/AppHeader.vue:45
       - src/views/DashboardView.vue:89

⚠️  发现 3 处语言不一致:
  zh-CN 独有:
    - settings.advanced.option1

  en-US 独有:
    - settings.advanced.option2
    - sidebar.newMenu

⚠️  发现 1 个空值翻译:
  - login.emptyHint: ""

🗑️  发现 5 个未使用的 key:
  - oldFeature.title
  - deprecated.message
  - test.debug
  - unused.key1
  - unused.key2

💡 发现 3 组重复翻译:

  "操作成功" (出现 5 次)
  → 建议提取为 common.operationSuccess
    当前位置: settings.saveSuccess, tag.addSuccess, ...

  "请输入名称" (出现 3 次)
  → 建议提取为 common.enterNamePlaceholder
    当前位置: dialog.namePlaceholder, tag.namePlaceholder, ...

🔧 正在清理未使用的 key...

✅ 清理完成！
  - 从 zh-CN.json 删除了 5 个 key
  - 从 en-US.json 删除了 5 个 key

---

📋 总结:
  ✅ 已自动清理: 5 个未使用的 key
  ⚠️  需要手动修复: 2 个缺失翻译, 3 处语言不一致, 1 个空值
  💡 优化建议: 3 组重复翻译可提取为公共 key

建议下一步:
  1. 添加缺失的翻译 key
  2. 统一不同语言文件的 key 结构
  3. 填充空值翻译
  4. 考虑提取重复的翻译值（参考上述建议）
```

## 注意事项

- 删除 key 前会备份原始文件（添加 `.backup` 后缀）
- 仅删除确认未使用的 key，不会删除任何被引用的 key
- 对于动态 key 使用（如 `t(\`prefix.\${variable}\`)`），会提示需要手动检查
- 重复翻译提取是建议性的，需要人工判断是否合理
- 保持 JSON 文件格式化（2 空格缩进）
