#!/bin/bash

# Finance Briefing Agent - 安装脚本
# 用于检测系统依赖、创建 Python venv、安装所有依赖

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info()    { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error()   { echo -e "${RED}❌ $1${NC}"; }

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

command_exists() { command -v "$1" >/dev/null 2>&1; }

version_gte() {
    [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$PROJECT_DIR/.venv"

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                      ║"
    echo "║         🚀 Finance Briefing Agent 安装脚本                           ║"
    echo "║         鬼哥的开源项目                                               ║"
    echo "║                                                                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""

    cd "$PROJECT_DIR"

    ERRORS=0
    WARNINGS=0

    # ==================== Git 检查 ====================
    print_header "检查 Git"

    if command_exists git; then
        GIT_VERSION=$(git --version | sed 's/git version //')
        print_success "Git $GIT_VERSION"
    else
        print_error "Git 未安装"
        ((ERRORS++))
    fi

    # ==================== Node.js 检查 ====================
    print_header "检查 Node.js 环境"

    if command_exists node; then
        NODE_VERSION=$(node -v | sed 's/v//')
        if version_gte "$NODE_VERSION" "18.0.0"; then
            print_success "Node.js $NODE_VERSION (>= 18.0.0 ✓)"
        else
            print_error "Node.js $NODE_VERSION 版本过低，需要 >= 18.0.0"
            print_info "请升级 Node.js: https://nodejs.org/"
            ((ERRORS++))
        fi
    else
        print_error "Node.js 未安装"
        print_info "请安装 Node.js: https://nodejs.org/"
        print_info "推荐使用 nvm: https://github.com/nvm-sh/nvm"
        ((ERRORS++))
    fi

    if command_exists npm; then
        print_success "npm $(npm -v)"
    else
        print_error "npm 未安装"
        ((ERRORS++))
    fi

    # ==================== Python 检查 ====================
    print_header "检查 Python 环境"

    PYTHON_CMD=""
    if command_exists python3; then
        PYTHON_CMD="python3"
    elif command_exists python; then
        PYTHON_CMD="python"
    fi

    if [ -n "$PYTHON_CMD" ]; then
        PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | sed 's/Python //')
        if version_gte "$PYTHON_VERSION" "3.9.0"; then
            print_success "Python $PYTHON_VERSION (>= 3.9.0 ✓)"
        else
            print_error "Python $PYTHON_VERSION 版本过低，需要 >= 3.9.0"
            ((ERRORS++))
        fi
    else
        print_error "Python 未安装"
        print_info "请安装 Python >= 3.9: https://www.python.org/"
        print_info "macOS: brew install python3"
        ((ERRORS++))
    fi

    # ==================== poppler 检查 ====================
    print_header "检查系统依赖"

    if command_exists pdftoppm; then
        print_success "poppler (pdftoppm) 已安装"
    else
        print_warning "poppler 未安装 (PDF 切分功能将不可用)"
        print_info "macOS:  brew install poppler"
        print_info "Ubuntu: sudo apt-get install poppler-utils"
        ((WARNINGS++))
    fi

    # ==================== 安装 npm 依赖 ====================
    print_header "安装 npm 依赖"

    if [ -f "package.json" ]; then
        print_info "正在安装 npm 依赖..."
        if npm install; then
            print_success "npm 依赖安装成功"
        else
            print_error "npm 依赖安装失败"
            ((ERRORS++))
        fi
    else
        print_error "package.json 不存在，请确保在项目根目录运行"
        ((ERRORS++))
    fi

    # ==================== 创建 Python venv ====================
    print_header "创建 Python 虚拟环境 (.venv)"

    if [ -n "$PYTHON_CMD" ]; then
        if [ -d "$VENV_DIR" ]; then
            print_info "虚拟环境已存在: $VENV_DIR"
            # 验证 venv 是否完好
            if [ -f "$VENV_DIR/bin/python3" ]; then
                VENV_PYTHON_VERSION=$("$VENV_DIR/bin/python3" --version 2>&1 | sed 's/Python //')
                print_success "venv Python $VENV_PYTHON_VERSION"
            else
                print_warning "venv 损坏，重新创建..."
                rm -rf "$VENV_DIR"
                $PYTHON_CMD -m venv "$VENV_DIR"
                print_success "虚拟环境已重建"
            fi
        else
            print_info "正在创建虚拟环境..."
            $PYTHON_CMD -m venv "$VENV_DIR"
            print_success "虚拟环境已创建: $VENV_DIR"
        fi

        # 升级 pip
        print_info "升级 pip..."
        "$VENV_DIR/bin/pip" install --upgrade pip -q
        print_success "pip $("$VENV_DIR/bin/pip" --version | awk '{print $2}')"

        # ==================== 安装 Python 依赖 ====================
        print_header "安装 Python 依赖 (venv)"

        print_info "正在安装 requirements.txt 中的依赖..."

        if "$VENV_DIR/bin/pip" install -r "$PROJECT_DIR/requirements.txt"; then
            print_success "Python 依赖安装成功"
        else
            print_error "Python 依赖安装失败"
            ((ERRORS++))
        fi

        # 验证安装
        for pkg in notebooklm instagrapi pdf2image; do
            if "$VENV_DIR/bin/python3" -c "import $pkg" 2>/dev/null; then
                print_success "$pkg ✓"
            else
                # notebooklm 的 import name 可能不同
                if [ "$pkg" = "notebooklm" ] && "$VENV_DIR/bin/notebooklm" --version >/dev/null 2>&1; then
                    print_success "notebooklm-py ✓ ($("$VENV_DIR/bin/notebooklm" --version 2>&1 || echo 'installed'))"
                else
                    print_warning "$pkg 安装验证失败"
                    ((WARNINGS++))
                fi
            fi
        done
    else
        print_warning "跳过 Python 虚拟环境（Python 未安装）"
        ((WARNINGS++))
    fi

    # ==================== NotebookLM 认证检查 ====================
    print_header "检查 NotebookLM 认证 (可选)"

    if [ -f "$VENV_DIR/bin/notebooklm" ]; then
        if [ -f "$HOME/.notebooklm/storage_state.json" ]; then
            print_success "NotebookLM 认证文件存在"
        else
            print_warning "NotebookLM 未登录"
            print_info "运行: .venv/bin/notebooklm login"
            ((WARNINGS++))
        fi
    fi

    # ==================== Instagram session 检查 ====================
    if [ -f "$HOME/.instagram/session.json" ]; then
        print_success "Instagram session 文件存在"
    else
        print_info "Instagram 首次运行时会自动登录并保存 session"
    fi

    # ==================== 环境配置文件 ====================
    print_header "检查环境配置"

    if [ -f ".env" ]; then
        print_success ".env 文件已存在"

        # 检查关键配置
        grep -q "FINNHUB_API_KEY=." .env 2>/dev/null && print_success "FINNHUB_API_KEY 已配置" \
            || { print_warning "FINNHUB_API_KEY 未配置"; ((WARNINGS++)); }
        grep -q "FRED_API_KEY=." .env 2>/dev/null && print_success "FRED_API_KEY 已配置" \
            || { print_warning "FRED_API_KEY 未配置"; ((WARNINGS++)); }
        grep -q "LLM_ENABLED=true" .env 2>/dev/null && print_success "LLM 深度分析已启用" \
            || print_info "LLM 深度分析未启用 (可选)"
        grep -q "EMAIL_ENABLED=true" .env 2>/dev/null && print_success "邮件发送已启用" \
            || print_info "邮件发送未启用 (可选)"
        grep -q "TELEGRAM_ENABLED=true" .env 2>/dev/null && print_success "Telegram 发送已启用" \
            || print_info "Telegram 发送未启用 (可选)"
        grep -q "IG_ENABLED=true" .env 2>/dev/null && print_success "Instagram 发布已启用" \
            || print_info "Instagram 发布未启用 (可选)"
    else
        print_warning ".env 文件不存在，正在从模板创建..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env 文件已从模板创建"
            print_info "请编辑 .env 文件配置 API Keys"
        else
            print_error ".env.example 模板文件不存在"
            ((ERRORS++))
        fi
    fi

    # ==================== 目录结构 ====================
    print_header "检查目录结构"

    for dir in "data/raw" "data/processed" "data/history" "output"; do
        if [ -d "$dir" ]; then
            print_success "$dir/"
        else
            mkdir -p "$dir"
            print_success "$dir/ (已创建)"
        fi
    done

    # ==================== TypeScript 编译 ====================
    print_header "验证 TypeScript 编译"

    print_info "正在编译 TypeScript..."
    if npm run build 2>/dev/null; then
        print_success "TypeScript 编译成功"
    else
        print_warning "TypeScript 编译有警告（不影响 tsx 运行）"
        ((WARNINGS++))
    fi

    # ==================== 安装总结 ====================
    print_header "安装总结"

    echo ""
    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 所有检查通过！项目已准备就绪。${NC}"
    elif [ $ERRORS -eq 0 ]; then
        echo -e "${YELLOW}⚠️  安装完成，但有 $WARNINGS 个警告（部分可选功能受限）。${NC}"
    else
        echo -e "${RED}❌ 安装过程中有 $ERRORS 个错误和 $WARNINGS 个警告。${NC}"
        echo -e "${RED}   请修复错误后重新运行。${NC}"
    fi

    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📋 快速开始:"
    echo ""
    echo "   1. 编辑 .env 文件，配置必要的 API Keys"
    echo "   2. 运行 npm run daily 执行完整工作流"
    echo ""
    echo "💡 常用命令:"
    echo "   npm run daily              # 完整流程 (收集+分析+生成+发送)"
    echo "   npm run workflow:pro       # 生成简报 (收集+分析+生成)"
    echo "   npm run collect            # 仅收集数据"
    echo "   npm run generate:pro       # 仅生成简报"
    echo "   npm run send-telegram      # 发送 Telegram"
    echo "   npm run send-instagram     # 发布 Instagram"
    echo "   npm run help               # 显示所有命令"
    echo ""
    echo "🐍 Python venv:"
    echo "   .venv/bin/python3          # venv Python"
    echo "   .venv/bin/notebooklm       # NotebookLM CLI"
    echo "   .venv/bin/notebooklm login # 首次需登录 NotebookLM"
    echo ""
    echo "📖 更多信息请查看 README.md"
    echo ""

    if [ $ERRORS -gt 0 ]; then
        exit 1
    fi
}

main "$@"
