# 发布脚本说明

本项目使用 GitHub Actions 实现自动化发布，本地只需要两个脚本：

## 📁 脚本文件

- **`check-env.sh`** - 环境检查脚本
- **`release-github.sh`** - GitHub Actions 发布脚本
- **`build.sh`** - 本地构建脚本（设置环境变量）

## 🚀 使用方法

### 1. 检查环境

```bash
pnpm run release:check
```

检查项目：

- Git、Node.js、pnpm 是否安装
- GitHub CLI 是否安装并认证
- 压缩工具是否可用
- 项目配置是否正确

### 2. 本地构建（可选）

```bash
# 本地构建测试
pnpm run build:prod
```

这个脚本会：

1. 设置 `VITE_BASE_URL=/qbittorrent/web`
2. 安装依赖
3. 构建项目
4. 验证构建结果
5. 检查基础路径配置

### 3. 发布

```bash
pnpm run release 1.0.0
```

这个脚本会：

1. 更新 package.json 版本号
2. 提交更改
3. 创建标签
4. 推送到 GitHub
5. 自动触发 GitHub Actions 构建和发布

## 🔧 前置要求

1. **安装 GitHub CLI**

   ```bash
   # macOS
   brew install gh

   # 登录
   gh auth login
   ```

2. **确保在正确的分支**
   - 在 `main` 或 `master` 分支上发布

3. **检查 Git 状态**
   - 确保没有未提交的更改

## 📋 发布流程

1. **本地操作**（由脚本自动完成）
   - 更新版本号
   - 提交更改
   - 创建标签
   - 推送到 GitHub

2. **GitHub Actions**（自动触发）
   - 环境准备
   - 依赖安装
   - 代码检查
   - 项目构建
   - 打包压缩
   - 创建 Release
   - 上传文件

## 🎯 优势

- ✅ 无需本地构建环境
- ✅ 自动处理依赖安装
- ✅ 自动生成变更日志
- ✅ 构建产物自动上传
- ✅ 支持手动触发
- ✅ 完全免费

## 📊 监控

- **GitHub Actions 页面**: 查看构建进度
- **Release 页面**: 查看发布的版本
- **命令行**: `gh run list --workflow=release.yml`

## 🆘 故障排除

1. **GitHub CLI 未认证**

   ```bash
   gh auth login
   ```

2. **构建失败**
   - 检查 GitHub Actions 日志
   - 验证依赖是否正确

3. **权限不足**
   ```bash
   gh auth status
   ```

## 📝 注意事项

- 使用语义化版本号（如 `1.0.0`、`1.0.0-beta.1`）
- 标签格式：`v{version}`
- 在 main/master 分支上发布
- 确保代码已测试通过

## 🏷️ 版本类型

### 正式版本

- 格式：`1.0.0`、`2.1.3`
- 自动发布到正式版本
- 用户可以直接下载

### 预发布版本

- 格式：`1.0.0-beta.1`、`1.0.0-alpha.2`、`1.0.0-rc.1`
- 标记为 "Pre-release"
- 用户需要手动选择下载
- 适合测试和预览
