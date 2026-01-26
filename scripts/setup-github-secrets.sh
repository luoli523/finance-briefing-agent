#!/bin/bash

# 自动从 .env 文件设置 GitHub Secrets
# 用法: ./scripts/setup-github-secrets.sh

set -e

ENV_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
    echo "错误: 未找到 .env 文件"
    exit 1
fi

# 检查 gh CLI 是否已安装
if ! command -v gh &> /dev/null; then
    echo "错误: 未安装 GitHub CLI"
    echo "请先运行: brew install gh"
    exit 1
fi

# 检查是否已登录
if ! gh auth status &> /dev/null; then
    echo "错误: 未登录 GitHub CLI"
    echo "请先运行: gh auth login"
    exit 1
fi

# 获取仓库信息
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [ -z "$REPO" ]; then
    echo "错误: 无法获取仓库信息，请确保在 git 仓库目录中"
    exit 1
fi

echo "正在为仓库 $REPO 设置 Secrets..."
echo ""

# 需要设置的 secrets 列表
SECRETS=(
    "FINNHUB_API_KEY"
    "FRED_API_KEY"
    "ALPHA_VANTAGE_API_KEY"
    "SEC_USER_AGENT"
    "SEC_SYMBOLS"
    "SEC_FORMS"
    "SEC_DAYS_BACK"
    "LLM_ENABLED"
    "LLM_PROVIDER"
    "LLM_MODEL"
    "LLM_API_KEY"
    "LLM_BASE_URL"
    "LLM_TEMPERATURE"
    "LLM_MAX_TOKENS"
    "LLM_TIMEOUT"
    "EMAIL_ENABLED"
    "EMAIL_TO"
    "EMAIL_FROM"
    "EMAIL_SMTP_HOST"
    "EMAIL_SMTP_PORT"
    "EMAIL_SMTP_USER"
    "EMAIL_SMTP_PASS"
)

SUCCESS_COUNT=0
SKIP_COUNT=0

for SECRET_NAME in "${SECRETS[@]}"; do
    # 从 .env 文件读取值（忽略注释和空行）
    VALUE=$(grep "^${SECRET_NAME}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | head -1)

    # 跳过空值或占位符
    if [ -z "$VALUE" ] || [[ "$VALUE" == *"your_"* ]] || [[ "$VALUE" == *"example"* ]]; then
        echo "⏭️  跳过 $SECRET_NAME (空值或占位符)"
        ((SKIP_COUNT++))
        continue
    fi

    # 设置 secret
    echo -n "🔐 设置 $SECRET_NAME... "
    if echo "$VALUE" | gh secret set "$SECRET_NAME" --repo="$REPO"; then
        echo "✅"
        ((SUCCESS_COUNT++))
    else
        echo "❌ 失败"
    fi
done

echo ""
echo "====================================="
echo "完成！成功设置 $SUCCESS_COUNT 个 Secrets，跳过 $SKIP_COUNT 个"
echo ""
echo "下一步："
echo "1. 推送 workflow: git push origin dev"
echo "2. 手动触发测试: gh workflow run daily-briefing.yml"
echo "3. 查看运行状态: gh run list"
