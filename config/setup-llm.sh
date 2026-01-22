#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🤖 LLM 配置向导
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║         🤖 LLM 深度分析 - 配置向导                                 ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# 检查是否已存在 .env 文件
if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  检测到已存在 .env 文件${NC}"
    echo ""
    read -p "是否要备份现有配置？(y/n): " backup_choice
    if [ "$backup_choice" = "y" ] || [ "$backup_choice" = "Y" ]; then
        BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d%H%M%S)"
        cp "$ENV_FILE" "$BACKUP_FILE"
        echo -e "${GREEN}✅ 已备份到: $BACKUP_FILE${NC}"
    fi
    echo ""
fi

# 选择 LLM 提供商
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}步骤 1: 选择 LLM 提供商${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1) 🏆 Google Gemini      - 免费，速度快，质量高（推荐！）"
echo "2) 💎 OpenAI GPT         - 性价比高，综合能力强"
echo "3) 🧠 Anthropic Claude   - 推理能力顶级"
echo "4) 💰 DeepSeek           - 超便宜，中文友好"
echo "5) 🏠 Ollama             - 完全免费，本地部署"
echo "6) ⏸️  不启用 LLM         - 仅使用规则引擎"
echo ""
read -p "请选择 (1-6): " provider_choice

case $provider_choice in
    1)
        PROVIDER="google"
        echo ""
        echo -e "${CYAN}选择 Google Gemini 模型：${NC}"
        echo "1) gemini-2.0-flash-exp    - 🔥 实验版，完全免费！"
        echo "2) gemini-1.5-flash        - 超低价 $0.07/年"
        echo "3) gemini-1.5-pro          - 高级版 $1.80/年"
        read -p "请选择 (1-3): " model_choice
        case $model_choice in
            1) MODEL="gemini-2.0-flash-exp" ;;
            2) MODEL="gemini-1.5-flash" ;;
            3) MODEL="gemini-1.5-pro" ;;
            *) MODEL="gemini-2.0-flash-exp" ;;
        esac
        echo ""
        echo -e "${YELLOW}📝 获取 API Key:${NC}"
        echo "   访问: https://aistudio.google.com/apikey"
        echo "   注册 Google 账号，点击 'Get API key'"
        echo ""
        read -p "请输入 Google API Key: " API_KEY
        ;;
    2)
        PROVIDER="openai"
        echo ""
        echo -e "${CYAN}选择 OpenAI 模型：${NC}"
        echo "1) gpt-4o-mini             - 💎 性价比之王 $0.18/年"
        echo "2) gpt-4o                  - 最新旗舰 $2.92/年"
        echo "3) gpt-4-turbo             - GPT-4 Turbo $10.95/年"
        echo "4) o1-preview              - 推理专家 $18.25/年"
        read -p "请选择 (1-4): " model_choice
        case $model_choice in
            1) MODEL="gpt-4o-mini" ;;
            2) MODEL="gpt-4o" ;;
            3) MODEL="gpt-4-turbo" ;;
            4) MODEL="o1-preview" ;;
            *) MODEL="gpt-4o-mini" ;;
        esac
        echo ""
        echo -e "${YELLOW}📝 获取 API Key:${NC}"
        echo "   访问: https://platform.openai.com/api-keys"
        echo ""
        read -p "请输入 OpenAI API Key: " API_KEY
        ;;
    3)
        PROVIDER="anthropic"
        echo ""
        echo -e "${CYAN}选择 Anthropic 模型：${NC}"
        echo "1) claude-3-5-sonnet-20241022  - 🔥 最新，推理强"
        echo "2) claude-3-opus-20240229      - Opus 旗舰"
        echo "3) claude-3-haiku-20240307     - Haiku 快速"
        read -p "请选择 (1-3): " model_choice
        case $model_choice in
            1) MODEL="claude-3-5-sonnet-20241022" ;;
            2) MODEL="claude-3-opus-20240229" ;;
            3) MODEL="claude-3-haiku-20240307" ;;
            *) MODEL="claude-3-5-sonnet-20241022" ;;
        esac
        echo ""
        echo -e "${YELLOW}📝 获取 API Key:${NC}"
        echo "   访问: https://console.anthropic.com/"
        echo ""
        read -p "请输入 Anthropic API Key: " API_KEY
        ;;
    4)
        PROVIDER="deepseek"
        echo ""
        echo -e "${CYAN}选择 DeepSeek 模型：${NC}"
        echo "1) deepseek-chat       - 通用模型 $0.73/年"
        echo "2) deepseek-reasoner   - R1 推理模型 $0.73/年"
        read -p "请选择 (1-2): " model_choice
        case $model_choice in
            1) MODEL="deepseek-chat" ;;
            2) MODEL="deepseek-reasoner" ;;
            *) MODEL="deepseek-chat" ;;
        esac
        echo ""
        echo -e "${YELLOW}📝 获取 API Key:${NC}"
        echo "   访问: https://platform.deepseek.com/"
        echo ""
        read -p "请输入 DeepSeek API Key: " API_KEY
        ;;
    5)
        PROVIDER="ollama"
        echo ""
        echo -e "${CYAN}选择 Ollama 模型：${NC}"
        echo "1) qwen2.5:7b          - 中文顶级"
        echo "2) deepseek-r1:7b      - 推理强"
        echo "3) llama3.1:8b         - Meta 开源"
        echo "4) gemma2:9b           - Google 开源"
        read -p "请选择 (1-4): " model_choice
        case $model_choice in
            1) MODEL="qwen2.5:7b" ;;
            2) MODEL="deepseek-r1:7b" ;;
            3) MODEL="llama3.1:8b" ;;
            4) MODEL="gemma2:9b" ;;
            *) MODEL="qwen2.5:7b" ;;
        esac
        echo ""
        echo -e "${YELLOW}📝 安装 Ollama:${NC}"
        echo "   brew install ollama"
        echo "   ollama serve &"
        echo "   ollama pull $MODEL"
        echo ""
        API_KEY=""  # Ollama 不需要 API Key
        ;;
    6)
        echo ""
        echo -e "${YELLOW}⏸️  已选择不启用 LLM，将仅使用规则引擎${NC}"
        LLM_ENABLED="false"
        PROVIDER=""
        MODEL=""
        API_KEY=""
        ;;
    *)
        echo -e "${RED}❌ 无效选择，退出${NC}"
        exit 1
        ;;
esac

# 如果启用了 LLM
if [ "$provider_choice" != "6" ]; then
    LLM_ENABLED="true"
fi

# 询问其他必需的 API Keys
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}步骤 2: 配置数据收集 API Keys${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}这些 API Key 用于收集市场数据和新闻${NC}"
echo ""

# Finnhub API Key
echo -e "${CYAN}Finnhub API Key (股票新闻):${NC}"
echo "获取: https://finnhub.io/"
read -p "请输入 (回车跳过): " FINNHUB_KEY
[ -z "$FINNHUB_KEY" ] && FINNHUB_KEY="your-finnhub-api-key"

# FRED API Key
echo ""
echo -e "${CYAN}FRED API Key (宏观经济数据):${NC}"
echo "获取: https://fred.stlouisfed.org/docs/api/api_key.html"
read -p "请输入 (回车跳过): " FRED_KEY
[ -z "$FRED_KEY" ] && FRED_KEY="your-fred-api-key"

# SEC User Agent
echo ""
echo -e "${CYAN}SEC User Agent (SEC EDGAR 数据):${NC}"
echo "格式: YourAppName/version (your-email@example.com)"
read -p "请输入 (回车使用默认): " SEC_AGENT
[ -z "$SEC_AGENT" ] && SEC_AGENT="FinanceBriefingAgent/1.0 (your-email@example.com)"

# 生成 .env 文件
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}步骤 3: 生成配置文件${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cat > "$ENV_FILE" << EOL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🤖 Finance Briefing Agent - 配置文件
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# LLM 配置
LLM_ENABLED=$LLM_ENABLED
EOL

if [ "$LLM_ENABLED" = "true" ]; then
    cat >> "$ENV_FILE" << EOL
LLM_PROVIDER=$PROVIDER
LLM_MODEL=$MODEL
EOL
    if [ -n "$API_KEY" ]; then
        cat >> "$ENV_FILE" << EOL
LLM_API_KEY=$API_KEY
EOL
    fi
fi

cat >> "$ENV_FILE" << EOL

# 数据收集 API Keys
FINNHUB_API_KEY=$FINNHUB_KEY
FRED_API_KEY=$FRED_KEY
SEC_USER_AGENT=$SEC_AGENT

# 可选配置
# LLM_TEMPERATURE=0.7
# LLM_MAX_TOKENS=4096
# LLM_TIMEOUT=60000
# LLM_CUSTOM_PROMPTS=false
EOL

echo -e "${GREEN}✅ 配置文件已生成: $ENV_FILE${NC}"
echo ""

# 显示配置摘要
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 配置摘要${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
if [ "$LLM_ENABLED" = "true" ]; then
    echo -e "${GREEN}✅ LLM 分析: 已启用${NC}"
    echo -e "   提供商: $PROVIDER"
    echo -e "   模型: $MODEL"
    if [ -n "$API_KEY" ]; then
        echo -e "   API Key: ${API_KEY:0:10}..."
    fi
else
    echo -e "${YELLOW}⏸️  LLM 分析: 未启用（仅使用规则引擎）${NC}"
fi
echo ""
echo -e "数据收集 API Keys:"
echo -e "   Finnhub: ${FINNHUB_KEY:0:10}..."
echo -e "   FRED: ${FRED_KEY:0:10}..."
echo ""

# 下一步提示
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 下一步${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
if [ "$LLM_ENABLED" = "true" ]; then
    echo "1. 运行增强分析:"
    echo -e "   ${GREEN}npm run analyze:enhanced${NC}"
else
    echo "1. 运行规则引擎分析:"
    echo -e "   ${GREEN}npm run analyze:intelligent${NC}"
fi
echo ""
echo "2. 查看配置:"
echo -e "   ${GREEN}cat .env${NC}"
echo ""
echo "3. 修改配置:"
echo -e "   ${GREEN}vim .env${NC}"
echo ""
echo "4. 查看更多文档:"
echo -e "   ${GREEN}cat config/README.md${NC}"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 配置完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
