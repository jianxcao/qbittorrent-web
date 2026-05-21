#!/bin/bash

if [ -n "${ZSH_VERSION:-}" ]; then
    exec /bin/bash "$0" "$@"
fi

case "${BASH:-}" in
    */bash) ;;
    *) exec /bin/bash "$0" "$@" ;;
esac

if shopt -oq posix; then
    exec /bin/bash "$0" "$@"
fi

# 在本地通过 act 运行当前项目的 GitHub Actions 发布流程
# - .github/workflows/release-advanced.yml: 构建前端产物并创建 GitHub Release
# - .github/workflows/docker-publish.yml: 构建并推送 Docker 镜像
# - 通过 gh CLI 获取 GitHub Token
# - Docker 发布从 .secrets 读取 DOCKERHUB_USERNAME / DOCKERHUB_TOKEN

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { printf '%b\n' "${GREEN}[INFO]${NC} $1"; }
warn() { printf '%b\n' "${YELLOW}[WARN]${NC} $1"; }
err()  { printf '%b\n' "${RED}[ERROR]${NC} $1"; }
step() { printf '%b\n' "${BLUE}[STEP]${NC} $1"; }
ask()  { printf '%b\n' "${BLUE}[?]${NC} $1"; }

# 切换到项目根目录（脚本位于 scripts/ 下）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

RELEASE_WF=".github/workflows/release-advanced.yml"
DOCKER_WF=".github/workflows/docker-publish.yml"
SECRETS_FILE="$PROJECT_ROOT/.secrets"

read_secret_value() {
    local key="$1"
    awk -F= -v key="$key" '
        $1 == key {
            value = $0
            sub("^[^=]*=", "", value)
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
            gsub(/^["'\''"]|["'\''"]$/, "", value)
            print value
            exit
        }
    ' "$SECRETS_FILE"
}

read_workflow_env() {
    local key="$1"
    local workflow="$2"
    awk -F: -v key="$key" '
        $0 ~ "^[[:space:]]*" key ":" {
            value = $2
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
            gsub(/^["'\''"]|["'\''"]$/, "", value)
            print value
            exit
        }
    ' "$workflow"
}

# ---------- 工具检查 ----------
step "检查依赖工具"
command -v act    >/dev/null 2>&1 || { err "需要 act：brew install act"; exit 1; }
command -v gh     >/dev/null 2>&1 || { err "需要 gh CLI：brew install gh"; exit 1; }
command -v docker >/dev/null 2>&1 || { err "需要 docker"; exit 1; }
command -v git    >/dev/null 2>&1 || { err "需要 git"; exit 1; }
command -v node   >/dev/null 2>&1 || { err "需要 node"; exit 1; }

docker info >/dev/null 2>&1 || { err "Docker 未运行，请先启动 Docker Desktop"; exit 1; }
gh auth status >/dev/null 2>&1 || { err "请先执行：gh auth login"; exit 1; }

[[ -f "$RELEASE_WF" ]] || { err "找不到 workflow：$RELEASE_WF"; exit 1; }
[[ -f "$DOCKER_WF"  ]] || { err "找不到 workflow：$DOCKER_WF"; exit 1; }

log "act:    $(act --version)"
log "gh:     $(gh --version | head -n1)"
log "docker: $(docker --version)"

DOCKER_IMAGE_NAME="$(read_workflow_env IMAGE_NAME "$DOCKER_WF")"
DOCKER_IMAGE_NAME="${DOCKER_IMAGE_NAME:-qbittorrent-web}"

# ---------- 计算版本 ----------
CURRENT_VERSION=$(node -p "require('./package.json').version")
PATCH_VERSION=$(node -e "const v=require('./package.json').version.split('-')[0].split('.').map(Number);console.log(\`\${v[0]}.\${v[1]}.\${v[2]+1}\`)")
MINOR_VERSION=$(node -e "const v=require('./package.json').version.split('-')[0].split('.').map(Number);console.log(\`\${v[0]}.\${v[1]+1}.0\`)")
MAJOR_VERSION=$(node -e "const v=require('./package.json').version.split('-')[0].split('.').map(Number);console.log(\`\${v[0]+1}.0.0\`)")

echo ""
log "当前版本：$CURRENT_VERSION"
ask  "选择本次发布版本："
echo "  1) patch        -> $PATCH_VERSION"
echo "  2) minor        -> $MINOR_VERSION"
echo "  3) major        -> $MAJOR_VERSION"
echo "  4) 自定义版本号"
echo "  5) 保持当前版本 -> $CURRENT_VERSION"
read -rp "请选择 [1-5]（默认 1）: " choice
choice=${choice:-1}

case "$choice" in
    1) NEW_VERSION="$PATCH_VERSION" ;;
    2) NEW_VERSION="$MINOR_VERSION" ;;
    3) NEW_VERSION="$MAJOR_VERSION" ;;
    4) read -rp "请输入版本号 (例如 1.2.3 或 1.2.3-beta.1): " NEW_VERSION ;;
    5) NEW_VERSION="$CURRENT_VERSION" ;;
    *) err "无效选择"; exit 1 ;;
esac

if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$ ]]; then
    err "版本号格式错误：$NEW_VERSION"
    exit 1
fi

TAG="v${NEW_VERSION}"
log "目标版本：${NEW_VERSION}（tag: ${TAG}）"

# ---------- 选择要执行的步骤 ----------
echo ""
ask "需要执行哪些步骤？"
echo "  1) 仅发布 GitHub Release"
echo "  2) 仅构建并推送 Docker 镜像"
echo "  3) 全部执行（先 Release，再 Docker 推送）"
read -rp "请选择 [1-3]（默认 3）: " action
action=${action:-3}

DO_RELEASE=0
DO_DOCKER=0
case "$action" in
    1) DO_RELEASE=1 ;;
    2) DO_DOCKER=1 ;;
    3) DO_RELEASE=1; DO_DOCKER=1 ;;
    *) err "无效选择"; exit 1 ;;
esac

if [[ $DO_RELEASE -eq 1 ]]; then
    if git rev-parse "$TAG" >/dev/null 2>&1; then
        warn "本地已存在 tag ${TAG}"
    fi
    if gh release view "$TAG" >/dev/null 2>&1; then
        if [[ $DO_DOCKER -eq 1 ]]; then
            warn "GitHub 上已存在 release ${TAG}，将跳过 Release workflow，仅继续 Docker workflow"
            DO_RELEASE=0
        else
            err "GitHub 上已存在 release ${TAG}，请选择新版本或先删除已有 release"
            exit 1
        fi
    fi
fi

DOCKER_USER=""
DOCKER_BRANCH=""
DOCKER_TAG_SUFFIX=""
if [[ $DO_DOCKER -eq 1 ]]; then
    [[ -f "$SECRETS_FILE" ]] || { err "找不到密钥文件：$SECRETS_FILE"; exit 1; }

    DOCKER_USER="$(read_secret_value DOCKERHUB_USERNAME)"
    if [[ -z "$DOCKER_USER" ]]; then
        err ".secrets 中找不到 DOCKERHUB_USERNAME"
        exit 1
    fi

    CURRENT_BRANCH="$(git branch --show-current 2>/dev/null || true)"
    CURRENT_BRANCH="${CURRENT_BRANCH:-main}"

    echo ""
    ask "选择 Docker workflow 的构建分支："
    read -rp "请输入分支名（默认 ${CURRENT_BRANCH}）: " DOCKER_BRANCH
    DOCKER_BRANCH="${DOCKER_BRANCH:-$CURRENT_BRANCH}"

    echo ""
    ask "选择 Docker 标签后缀（对应 workflow_dispatch.inputs.tag_suffix）："
    echo "  1) 版本号 -> $NEW_VERSION"
    echo "  2) latest"
    echo "  3) 自定义"
    read -rp "请选择 [1-3]（默认 1）: " dchoice
    dchoice=${dchoice:-1}
    case "$dchoice" in
        1) DOCKER_TAG_SUFFIX="$NEW_VERSION" ;;
        2) DOCKER_TAG_SUFFIX="latest" ;;
        3) read -rp "请输入 Docker tag suffix: " DOCKER_TAG_SUFFIX ;;
        *) err "无效选择"; exit 1 ;;
    esac

    if [[ -z "$DOCKER_TAG_SUFFIX" ]]; then
        err "Docker tag suffix 不能为空"
        exit 1
    fi
fi

echo ""
log "执行计划："
[[ $DO_RELEASE -eq 1 ]] && log "  - GitHub Release workflow: $RELEASE_WF"
[[ $DO_RELEASE -eq 1 ]] && log "    version: $NEW_VERSION"
if [[ $DO_DOCKER -eq 1 ]]; then
    log "  - Docker workflow        : $DOCKER_WF"
    log "    image                 : ${DOCKER_USER}/${DOCKER_IMAGE_NAME}"
    log "    tag_suffix            : $DOCKER_TAG_SUFFIX"
    log "    branch                : $DOCKER_BRANCH"
fi
read -rp "确认开始? (y/N): " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || { warn "已取消"; exit 0; }

# ---------- 获取 GitHub Token ----------
step "从 gh CLI 获取 GitHub Token"
GITHUB_TOKEN="$(gh auth token)"
[[ -n "$GITHUB_TOKEN" ]] || { err "无法获取 GitHub Token"; exit 1; }

# ---------- act 通用参数 ----------
ARCH_ARG=()
if [[ "$(uname -m)" == "arm64" || "$(uname -m)" == "aarch64" ]]; then
    # Apple Silicon 上跑 ubuntu-latest 镜像需要指定 amd64 才能装上常见 action
    ARCH_ARG=(--container-architecture linux/amd64)
fi

SECRET_ARGS=()
if [[ -f "$SECRETS_FILE" ]]; then
    SECRET_ARGS=(--secret-file "$SECRETS_FILE")
fi

ARTIFACT_DIR="$(mktemp -d -t act-artifacts-XXXXXX)"
log "Artifact 临时目录：$ARTIFACT_DIR"

run_act() {
    local workflow="$1"
    shift
    # 注意：act 默认会自动挂载宿主机 docker.sock，不要再通过 --container-options 重复挂载，
    # 否则会报 "Duplicate mount point: /var/run/docker.sock"。
    act workflow_dispatch \
        -W "$workflow" \
        -s GITHUB_TOKEN="$GITHUB_TOKEN" \
        --env ACT=true \
        "${SECRET_ARGS[@]}" \
        --artifact-server-path "$ARTIFACT_DIR" \
        "${ARCH_ARG[@]}" \
        "$@"
}

# ---------- 1. Release Workflow ----------
if [[ $DO_RELEASE -eq 1 ]]; then
    step "通过 act 运行 Release Workflow"
    log "Workflow: $RELEASE_WF"
    log "version : $NEW_VERSION"

    set +e
    run_act "$RELEASE_WF" --input version="$NEW_VERSION"
    ACT_EXIT=$?
    set -e

    if [[ $ACT_EXIT -ne 0 ]]; then
        err "Release Workflow 失败 (exit=$ACT_EXIT)"
        exit $ACT_EXIT
    fi
    log "GitHub Release workflow 完成：$TAG"
fi

# ---------- 2. Docker Publish Workflow ----------
if [[ $DO_DOCKER -eq 1 ]]; then
    step "通过 act 运行 Docker Publish Workflow"
    log "Workflow   : $DOCKER_WF"
    log "image      : ${DOCKER_USER}/${DOCKER_IMAGE_NAME}"
    log "tag_suffix : $DOCKER_TAG_SUFFIX"
    log "branch     : $DOCKER_BRANCH"
    log "platforms  : linux/amd64, linux/arm64"
    warn "多架构构建会通过 QEMU 模拟非原生架构，首次跑可能比较慢，请耐心等待..."

    set +e
    run_act "$DOCKER_WF" \
        --input tag_suffix="$DOCKER_TAG_SUFFIX" \
        --input branch="$DOCKER_BRANCH"
    ACT_EXIT=$?
    set -e

    if [[ $ACT_EXIT -ne 0 ]]; then
        err "Docker Publish Workflow 失败 (exit=$ACT_EXIT)"
        exit $ACT_EXIT
    fi
    log "Docker 镜像推送完成：${DOCKER_USER}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG_SUFFIX}"
fi

# ---------- 收尾 ----------
echo ""
REPO_SLUG="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo 'jianxcao/qb-web')"
log "全部完成"
[[ $DO_RELEASE -eq 1 ]] && log "Release: https://github.com/${REPO_SLUG}/releases/tag/${TAG}"
[[ $DO_DOCKER  -eq 1 ]] && log "Docker : https://hub.docker.com/r/${DOCKER_USER}/${DOCKER_IMAGE_NAME}/tags"
