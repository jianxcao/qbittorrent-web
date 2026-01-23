#!/bin/bash

# 环境检查脚本
set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

echo "🔍 检查发布环境..."

# 检查基本工具
echo ""
echo "📋 基本工具检查:"

if command -v git >/dev/null 2>&1; then
    log "Git: $(git --version)"
else
    error "Git 未安装"
    exit 1
fi

if command -v node >/dev/null 2>&1; then
    log "Node.js: $(node --version)"
else
    error "Node.js 未安装"
    exit 1
fi

if command -v pnpm >/dev/null 2>&1; then
    log "pnpm: $(pnpm --version)"
else
    error "pnpm 未安装"
    exit 1
fi

if command -v gh >/dev/null 2>&1; then
    log "GitHub CLI: $(gh --version | head -n1)"
else
    error "GitHub CLI 未安装"
    exit 1
fi

# 检查压缩工具
echo ""
echo "📦 压缩工具检查:"

if command -v zip >/dev/null 2>&1; then
    log "zip: $(zip --version | head -n1)"
elif command -v 7z >/dev/null 2>&1; then
    log "7z: $(7z | head -n1)"
else
    error "未找到 zip 或 7z 命令"
    exit 1
fi

# 检查 GitHub 认证状态
echo ""
echo "🔐 GitHub 认证检查:"

if gh auth status >/dev/null 2>&1; then
    log "GitHub CLI 已认证"
    info "用户: $(gh auth status --json user | jq -r '.user.login' 2>/dev/null || echo '未知')"
else
    error "GitHub CLI 未认证，请运行: gh auth login"
    exit 1
fi

# 检查 Git 仓库状态
echo ""
echo "📁 Git 仓库检查:"

if git rev-parse --git-dir >/dev/null 2>&1; then
    log "当前目录是 Git 仓库"

    # 检查远程仓库
    if git remote get-url origin >/dev/null 2>&1; then
        log "远程仓库: $(git remote get-url origin)"
    else
        warn "未配置远程仓库"
    fi

    # 检查当前分支
    current_branch=$(git branch --show-current)
    log "当前分支: $current_branch"

    # 检查未提交的更改
    if [[ -n $(git status --porcelain) ]]; then
        warn "有未提交的更改:"
        git status --short
    else
        log "工作目录干净"
    fi
else
    error "当前目录不是 Git 仓库"
    exit 1
fi

# 检查项目文件
echo ""
echo "📄 项目文件检查:"

if [[ -f "package.json" ]]; then
    log "package.json 存在"
    version=$(node -p "require('./package.json').version")
    info "当前版本: $version"

    # 检查版本类型
    if [[ $version =~ - ]]; then
        warn "当前是预发布版本"
        echo "  支持的预发布格式: 1.0.0-beta.1, 1.0.0-alpha.2, 1.0.0-rc.1"
    else
        log "当前是正式版本"
    fi
else
    error "package.json 不存在"
    exit 1
fi

if [[ -f "vite.config.ts" ]] || [[ -f "vite.config.js" ]]; then
    log "Vite 配置文件存在"
else
    warn "Vite 配置文件不存在"
fi

# 检查依赖
echo ""
echo "📦 依赖检查:"

if [[ -d "node_modules" ]]; then
    log "node_modules 目录存在"
else
    warn "node_modules 目录不存在，请运行: pnpm install"
fi

if [[ -f "pnpm-lock.yaml" ]]; then
    log "pnpm-lock.yaml 存在"
else
    warn "pnpm-lock.yaml 不存在"
fi

# 检查发布脚本
echo ""
echo "🚀 发布脚本检查:"

if [[ -f "scripts/release-github.sh" ]]; then
    log "GitHub Actions 发布脚本存在"
else
    warn "GitHub Actions 发布脚本不存在"
fi

if [[ -f "scripts/build.sh" ]]; then
    log "本地构建脚本存在"
else
    warn "本地构建脚本不存在"
fi



echo ""
echo "✅ 环境检查完成！"

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    echo ""
    info "可用的命令:"
    echo "  pnpm run build:prod          # 本地构建测试"
    echo "  pnpm run release [版本号]     # 使用 GitHub Actions 发布"
    echo ""
    echo "示例:"
    echo "  pnpm run build:prod"
    echo "  pnpm run release 1.0.0"
fi
