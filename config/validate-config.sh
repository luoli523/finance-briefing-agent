#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔍 配置验证工具
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║         🔍 LLM 配置验证工具                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# 检查 .env 文件是否存在
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ 错误: .env 文件不存在${NC}"
    echo ""
    echo "请先创建配置文件："
    echo "  bash config/setup-llm.sh"
    echo "或:"
    echo "  cp config/llm.config.example.env .env"
    exit 1
fi

echo -e "${GREEN}✅ 找到配置文件: .env${NC}"
echo ""

# 读取配置
source "$ENV_FILE"

# 验证结果
ERRORS=0
WARNINGS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 配置验证结果${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. 检查 LLM_ENABLED
echo -e "${CYAN}1. LLM 启用状态${NC}"
if [ "$LLM_ENABLED" = "true" ]; then
    echo -e "   ${GREEN}✅ LLM_ENABLED=true${NC}"
elif [ "$LLM_ENABLED" = "false" ]; then
    echo -e "   ${YELLOW}⚠️  LLM_ENABLED=false (仅使用规则引擎)${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${RED}❌ LLM_ENABLED 无效: $LLM_ENABLED${NC}"
    echo -e "      应该设置为: true 或 false"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 如果 LLM 启用，检查提供商和模型
if [ "$LLM_ENABLED" = "true" ]; then
    # 2. 检查 LLM_PROVIDER
    echo -e "${CYAN}2. LLM 提供商${NC}"
    case "$LLM_PROVIDER" in
        google)
            echo -e "   ${GREEN}✅ LLM_PROVIDER=google (Google Gemini)${NC}"
            VALID_MODELS=("gemini-2.0-flash-exp" "gemini-1.5-flash" "gemini-1.5-pro" "gemini-1.0-pro")
            ;;
        openai)
            echo -e "   ${GREEN}✅ LLM_PROVIDER=openai (OpenAI GPT)${NC}"
            VALID_MODELS=("gpt-4o" "gpt-4o-mini" "gpt-4-turbo" "gpt-4" "gpt-3.5-turbo" "o1-preview" "o1-mini")
            ;;
        anthropic)
            echo -e "   ${GREEN}✅ LLM_PROVIDER=anthropic (Anthropic Claude)${NC}"
            VALID_MODELS=("claude-3-5-sonnet-20241022" "claude-3-opus-20240229" "claude-3-sonnet-20240229" "claude-3-haiku-20240307")
            ;;
        deepseek)
            echo -e "   ${GREEN}✅ LLM_PROVIDER=deepseek (DeepSeek)${NC}"
            VALID_MODELS=("deepseek-chat" "deepseek-reasoner")
            ;;
        ollama)
            echo -e "   ${GREEN}✅ LLM_PROVIDER=ollama (本地 Ollama)${NC}"
            VALID_MODELS=("qwen2.5:7b" "llama3.1:8b" "deepseek-r1:7b" "gemma2:9b")
            ;;
        *)
            echo -e "   ${RED}❌ LLM_PROVIDER 无效: $LLM_PROVIDER${NC}"
            echo -e "      支持的提供商: google, openai, anthropic, deepseek, ollama"
            ERRORS=$((ERRORS + 1))
            ;;
    esac
    echo ""

    # 3. 检查 LLM_MODEL
    echo -e "${CYAN}3. LLM 模型${NC}"
    if [ -z "$LLM_MODEL" ]; then
        echo -e "   ${RED}❌ LLM_MODEL 未设置${NC}"
        ERRORS=$((ERRORS + 1))
    else
        # 检查模型是否在有效列表中
        MODEL_VALID=false
        for valid_model in "${VALID_MODELS[@]}"; do
            if [ "$LLM_MODEL" = "$valid_model" ]; then
                MODEL_VALID=true
                break
            fi
        done

        if [ "$MODEL_VALID" = true ]; then
            echo -e "   ${GREEN}✅ LLM_MODEL=$LLM_MODEL${NC}"
        else
            echo -e "   ${RED}❌ LLM_MODEL 无效: $LLM_MODEL${NC}"
            echo -e "      ${LLM_PROVIDER} 支持的模型:"
            for valid_model in "${VALID_MODELS[@]}"; do
                echo -e "      - $valid_model"
            done
            ERRORS=$((ERRORS + 1))
        fi
    fi
    echo ""

    # 4. 检查 API Key
    echo -e "${CYAN}4. API Key${NC}"
    if [ -z "$LLM_API_KEY" ] && [ "$LLM_PROVIDER" != "ollama" ]; then
        echo -e "   ${RED}❌ LLM_API_KEY 未设置${NC}"
        ERRORS=$((ERRORS + 1))
    elif [ "$LLM_PROVIDER" = "ollama" ]; then
        echo -e "   ${GREEN}✅ Ollama 无需 API Key${NC}"
    elif [ "$LLM_API_KEY" = "your-api-key-here" ] || [ "$LLM_API_KEY" = "your-google-api-key" ] || [ "$LLM_API_KEY" = "your-openai-api-key" ]; then
        echo -e "   ${RED}❌ LLM_API_KEY 是占位符，需要填入真实的 API Key${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "   ${GREEN}✅ LLM_API_KEY 已设置: ${LLM_API_KEY:0:10}...${NC}"
    fi
    echo ""
fi

# 5. 检查数据收集 API Keys
echo -e "${CYAN}5. 数据收集 API Keys${NC}"
if [ -z "$FINNHUB_API_KEY" ] || [ "$FINNHUB_API_KEY" = "your-finnhub-api-key" ]; then
    echo -e "   ${YELLOW}⚠️  FINNHUB_API_KEY 未设置或是占位符${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✅ FINNHUB_API_KEY 已设置${NC}"
fi

if [ -z "$FRED_API_KEY" ] || [ "$FRED_API_KEY" = "your-fred-api-key" ]; then
    echo -e "   ${YELLOW}⚠️  FRED_API_KEY 未设置或是占位符${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✅ FRED_API_KEY 已设置${NC}"
fi

if [ -z "$SEC_USER_AGENT" ]; then
    echo -e "   ${YELLOW}⚠️  SEC_USER_AGENT 未设置${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "   ${GREEN}✅ SEC_USER_AGENT 已设置${NC}"
fi
echo ""

# 总结
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 验证总结${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ 配置完全正确！可以开始使用了${NC}"
    echo ""
    echo "运行命令:"
    echo -e "  ${GREEN}npm run analyze:enhanced${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  配置有 $WARNINGS 个警告，但可以使用${NC}"
    echo ""
    echo "建议修复警告后使用"
else
    echo -e "${RED}❌ 配置有 $ERRORS 个错误${NC}"
    echo ""
    echo "请修复错误后再运行:"
    echo -e "  ${BLUE}vim .env${NC}"
    echo ""
    echo "或重新配置:"
    echo -e "  ${BLUE}bash config/setup-llm.sh${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
