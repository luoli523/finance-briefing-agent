# ⚙️ 配置管理

## 📝 统一配置位置

所有配置都在 **项目根目录的 `.env` 文件** 中管理。

---

## 🚀 快速开始

### 步骤 1: 创建配置文件

```bash
# 复制示例配置文件
cp config/llm.config.example.env .env
```

### 步骤 2: 选择 LLM 提供商

编辑 `.env` 文件，取消注释您想使用的提供商配置：

**推荐：Google Gemini（免费）**

```bash
# 编辑 .env
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash-exp
LLM_API_KEY=your-google-api-key-here
```

### 步骤 3: 获取 API Key

访问对应的网站获取 API Key：

| 提供商 | 获取地址 | 成本 |
|-------|---------|------|
| Google Gemini | https://aistudio.google.com/apikey | **免费** |
| OpenAI | https://platform.openai.com/api-keys | $0.18/年起 |
| Anthropic | https://console.anthropic.com/ | $7.30/年 |
| DeepSeek | https://platform.deepseek.com/ | $0.73/年 |
| Ollama | 本地安装 | **免费** |

### 步骤 4: 运行分析

```bash
npm run analyze:enhanced
```

---

## 📁 配置文件结构

```
.env                                # ← 统一配置文件（您的配置）
config/
├── README.md                       # ← 本文件
└── llm.config.example.env          # ← 配置示例模板
```

---

## ⚙️ 配置项说明

### 基础配置

| 配置项 | 作用 | 默认值 | 示例 |
|-------|------|-------|------|
| `LLM_ENABLED` | 是否启用 LLM 分析 | `false` | `true` |
| `LLM_PROVIDER` | LLM 提供商 | - | `google`, `openai`, `anthropic` |
| `LLM_MODEL` | 使用的模型 | - | `gemini-2.0-flash-exp` |
| `LLM_API_KEY` | API 密钥 | - | `your-api-key` |

### 高级配置（可选）

| 配置项 | 作用 | 默认值 | 范围 |
|-------|------|-------|------|
| `LLM_TEMPERATURE` | 输出随机性 | `0.7` | `0.0-2.0` |
| `LLM_MAX_TOKENS` | 最大输出 tokens | `4096` | - |
| `LLM_TIMEOUT` | 请求超时（毫秒） | `60000` | - |
| `LLM_BASE_URL` | 自定义 API 端点 | - | 用于 Ollama 等 |
| `LLM_CUSTOM_PROMPTS` | 使用自定义 prompt | `false` | `true`/`false` |

---

## 🔥 推荐配置方案

### 方案 1: 零成本方案（推荐新手）

```bash
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash-exp
LLM_API_KEY=your-google-api-key
```

**优势**: 完全免费、速度快、质量高  
**成本**: $0/年

---

### 方案 2: 性价比方案

```bash
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-1.5-flash
LLM_API_KEY=your-google-api-key
```

**优势**: 超低价、速度极快、生产稳定  
**成本**: $0.07/年（每天运行1次）

---

### 方案 3: 质量优先方案

```bash
LLM_ENABLED=true
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_API_KEY=your-anthropic-api-key
```

**优势**: 推理能力强、上下文理解深刻  
**成本**: $7.30/年

---

### 方案 4: 隐私优先方案（本地）

```bash
# 1. 安装 Ollama
brew install ollama

# 2. 启动 Ollama
ollama serve &

# 3. 下载模型
ollama pull qwen2.5:7b

# 4. 配置 .env
LLM_ENABLED=true
LLM_PROVIDER=ollama
LLM_MODEL=qwen2.5:7b
```

**优势**: 完全本地、数据隐私、无成本  
**成本**: $0/年

---

## 🔧 配置管理技巧

### 技巧 1: 多配置切换

创建多个配置文件：

```bash
# 日常监控配置（免费）
.env.free          # Gemini 2.0 Flash

# 重要决策配置（付费）
.env.premium       # Claude 3.5 Sonnet

# 本地隐私配置
.env.local         # Ollama

# 使用时切换
cp .env.free .env
npm run analyze:enhanced
```

---

### 技巧 2: 环境变量优先级

```bash
# 命令行覆盖 .env 中的配置
LLM_MODEL=gpt-4o npm run analyze:enhanced

# 适合临时测试不同模型
LLM_PROVIDER=openai LLM_MODEL=gpt-4o-mini npm run analyze:enhanced
```

---

### 技巧 3: 配置验证

```bash
# 查看当前配置
npm run analyze:enhanced 2>&1 | grep "LLM"

# 输出示例:
# [llm-enhancer] Starting LLM enhancement with google/gemini-2.0-flash-exp...
```

---

## ⚠️ 注意事项

### 安全提示

1. **不要提交 `.env` 到 Git**
   - `.env` 已在 `.gitignore` 中
   - 包含敏感的 API Key

2. **不要在公开场合分享 API Key**
   - 泄露可能导致额外费用
   - 定期轮换 API Key

3. **设置 API 使用限额**
   - 在提供商平台设置月度限额
   - 避免意外高额费用

---

### 成本控制

1. **使用免费方案**
   - Gemini 2.0 Flash 完全免费
   - Ollama 本地运行免费

2. **按需启用 LLM**
   - 日常监控: 设置 `LLM_ENABLED=false` 使用规则引擎
   - 重要决策: 设置 `LLM_ENABLED=true` 启用 LLM

3. **选择合适的模型**
   - 简单分析: Gemini 1.5 Flash ($0.07/年)
   - 复杂分析: Claude 3.5 Sonnet ($7.30/年)

---

## 📚 相关文档

- **LLM 提供商对比**: `docs/LLM_PROVIDER_COMPARISON.md`
- **LLM 增强分析**: `docs/LLM_ENHANCEMENT.md`
- **Prompt 自定义**: `docs/PROMPT_CUSTOMIZATION.md`
- **完整 Prompt 手册**: `prompts/README.md`

---

## 🆘 故障排除

### 问题 1: 找不到 API Key

**错误**: `Missing required environment variables: LLM_API_KEY`

**解决**:
```bash
# 检查 .env 文件是否存在
ls -la .env

# 检查配置是否正确
cat .env | grep LLM_API_KEY

# 确保没有多余空格
LLM_API_KEY=your-key-here  # ✅ 正确
LLM_API_KEY = your-key-here  # ❌ 错误（有空格）
```

---

### 问题 2: LLM 没有生效

**症状**: 运行 `npm run analyze:enhanced` 但没有使用 LLM

**解决**:
```bash
# 1. 检查 LLM_ENABLED
cat .env | grep LLM_ENABLED
# 确保是: LLM_ENABLED=true

# 2. 检查是否有语法错误
cat .env

# 3. 重新运行
npm run analyze:enhanced
```

---

### 问题 3: API Key 无效

**错误**: `OpenAI API error: Incorrect API key provided`

**解决**:
1. 检查 API Key 是否正确复制（没有多余空格）
2. 确认 API Key 是否已激活
3. 检查 API Key 是否还有额度
4. 访问提供商网站重新生成 API Key

---

## 💡 推荐工作流

### 日常监控（免费）

```bash
# .env 配置
LLM_ENABLED=false  # 使用规则引擎（免费）

# 或使用免费 LLM
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash-exp
```

---

### 重要决策（付费）

```bash
# 遇到 FOMC 会议、重大财报日时
# 临时启用高质量 LLM

# .env 配置
LLM_ENABLED=true
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
```

---

### 多模型验证（高风险决策）

```bash
# 1. 使用 Gemini 快速扫描
LLM_PROVIDER=google LLM_MODEL=gemini-2.0-flash-exp npm run analyze:enhanced

# 2. 使用 Claude 深度分析
LLM_PROVIDER=anthropic LLM_MODEL=claude-3-5-sonnet-20241022 npm run analyze:enhanced

# 3. 使用 DeepSeek R1 推理验证
LLM_PROVIDER=deepseek LLM_MODEL=deepseek-reasoner npm run analyze:enhanced

# 4. 对比三个分析结果
```

---

**最后更新**: 2026-01-22
