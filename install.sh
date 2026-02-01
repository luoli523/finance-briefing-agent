#!/bin/bash

# Finance Briefing Agent - 安装脚本
# 用于检测和安装项目所需的依赖

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 版本比较函数
version_gte() {
    # 返回 0 如果 $1 >= $2
    [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

# 主安装流程
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                      ║"
    echo "║         🚀 Finance Briefing Agent 安装脚本                           ║"
    echo "║         鬼哥的开源项目                                               ║"
    echo "║                                                                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""

    ERRORS=0
    WARNINGS=0

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
        print_info "推荐使用 nvm 管理 Node.js 版本: https://github.com/nvm-sh/nvm"
        ((ERRORS++))
    fi

    if command_exists npm; then
        NPM_VERSION=$(npm -v)
        print_success "npm $NPM_VERSION"
    else
        print_error "npm 未安装"
        ((ERRORS++))
    fi

    # ==================== Python 检查 ====================
    print_header "检查 Python 环境 (NotebookLM CLI 依赖)"
    
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
            print_warning "Python $PYTHON_VERSION 版本较低，建议 >= 3.9.0"
            ((WARNINGS++))
        fi
    else
        print_warning "Python 未安装 (NotebookLM 信息图功能将不可用)"
        print_info "如需生成信息图，请安装 Python: https://www.python.org/"
        ((WARNINGS++))
    fi

    # ==================== pip 检查 ====================
    if command_exists pip3 || command_exists pip; then
        PIP_CMD=$(command_exists pip3 && echo "pip3" || echo "pip")
        PIP_VERSION=$($PIP_CMD --version 2>&1 | awk '{print $2}')
        print_success "pip $PIP_VERSION"
    else
        print_warning "pip 未安装"
        ((WARNINGS++))
    fi

    # ==================== NotebookLM CLI 检查 ====================
    print_header "检查 NotebookLM CLI (可选)"
    
    if command_exists notebooklm; then
        NOTEBOOKLM_VERSION=$(notebooklm --version 2>&1 || echo "unknown")
        print_success "notebooklm-py 已安装: $NOTEBOOKLM_VERSION"
        
        # 检查认证状态
        if [ -f "$HOME/.notebooklm/storage_state.json" ]; then
            print_success "NotebookLM 认证文件存在"
        else
            print_warning "NotebookLM 未登录，运行 'notebooklm login' 进行认证"
            ((WARNINGS++))
        fi
    else
        print_warning "notebooklm-py 未安装 (信息图/Slides 功能将不可用)"
        print_info "安装命令: pip install notebooklm-py"
        print_info "安装后运行: notebooklm login"
        ((WARNINGS++))
    fi

    # ==================== Git 检查 ====================
    print_header "检查 Git"
    
    if command_exists git; then
        GIT_VERSION=$(git --version | sed 's/git version //')
        print_success "Git $GIT_VERSION"
    else
        print_error "Git 未安装"
        ((ERRORS++))
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

    # ==================== 环境配置文件 ====================
    print_header "检查环境配置"
    
    if [ -f ".env" ]; then
        print_success ".env 文件已存在"
        
        # 检查关键配置
        if grep -q "FINNHUB_API_KEY=." .env 2>/dev/null; then
            print_success "FINNHUB_API_KEY 已配置"
        else
            print_warning "FINNHUB_API_KEY 未配置 (新闻收集功能受限)"
            ((WARNINGS++))
        fi
        
        if grep -q "LLM_ENABLED=true" .env 2>/dev/null; then
            print_success "LLM 深度分析已启用"
        else
            print_warning "LLM 深度分析未启用 (设置 LLM_ENABLED=true 启用)"
            ((WARNINGS++))
        fi
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

    # ==================== 目录结构检查 ====================
    print_header "检查目录结构"
    
    for dir in "data/raw" "data/processed" "data/history" "output"; do
        if [ -d "$dir" ]; then
            print_success "$dir/ 目录存在"
        else
            print_info "创建 $dir/ 目录..."
            mkdir -p "$dir"
            print_success "$dir/ 目录已创建"
        fi
    done

    # ==================== TypeScript 编译检查 ====================
    print_header "验证 TypeScript 编译"
    
    print_info "正在编译 TypeScript..."
    if npm run build 2>/dev/null; then
        print_success "TypeScript 编译成功"
    else
        print_warning "TypeScript 编译失败或 build 命令不存在"
        ((WARNINGS++))
    fi

    # ==================== 安装总结 ====================
    print_header "安装总结"
    
    echo ""
    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 所有检查通过！项目已准备就绪。${NC}"
    elif [ $ERRORS -eq 0 ]; then
        echo -e "${YELLOW}⚠️  安装完成，但有 $WARNINGS 个警告。${NC}"
        echo -e "${YELLOW}   部分功能可能受限，请查看上方警告信息。${NC}"
    else
        echo -e "${RED}❌ 安装过程中有 $ERRORS 个错误和 $WARNINGS 个警告。${NC}"
        echo -e "${RED}   请修复错误后重新运行安装脚本。${NC}"
    fi

    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "📋 快速开始:"
    echo ""
    echo "   1. 编辑 .env 文件，配置必要的 API Keys"
    echo "   2. 运行 npm run workflow:pro 生成每日简报"
    echo ""
    echo "📖 更多信息请查看 README.md"
    echo ""
    echo "💡 常用命令:"
    echo "   npm run daily              # 完整流程 (收集+分析+生成+发送)"
    echo "   npm run workflow:pro       # 生成简报 (收集+分析+生成)"
    echo "   npm run collect            # 仅收集数据"
    echo "   npm run generate:pro       # 仅生成简报"
    echo ""
    
    if [ $ERRORS -gt 0 ]; then
        exit 1
    fi
}

# 运行主函数
main "$@"
