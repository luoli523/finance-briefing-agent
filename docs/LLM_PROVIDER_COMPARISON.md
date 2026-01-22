# 🤖 LLM 提供商对比与选择指南

## 📊 综合对比表（2026年1月）

| 提供商 | 推荐模型 | 成本/次 | 成本/年 | 速度 | 质量 | 中文 | 推理 | 免费额度 |
|-------|---------|--------|---------|------|------|------|------|---------|
| **🏆 Google** | Gemini 2.0 Flash | **$0** | **$0** | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ✅ 无限 |
| **Google** | Gemini 1.5 Flash | $0.0002 | $0.07 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | 每天15次 |
| **Google** | Gemini 1.5 Pro | $0.005 | $1.80 | ⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | ✅✅ | 每天2次 |
| **OpenAI** | GPT-4o-mini | $0.0005 | $0.18 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | ✅ | ❌ |
| **OpenAI** | GPT-4o | $0.008 | $2.92 | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | ✅✅ | ❌ |
| **OpenAI** | o1-preview | $0.05 | $18.25 | ⚡ | ⭐⭐⭐⭐⭐ | ✅ | ✅✅✅ | ❌ |
| **Anthropic** | Claude 3.5 Sonnet | $0.02 | $7.30 | ⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ | ✅✅ | ❌ |
| **DeepSeek** | DeepSeek Chat | $0.002 | $0.73 | ⚡⚡ | ⭐⭐⭐⭐ | ✅✅ | ✅ | ❌ |
| **DeepSeek** | DeepSeek R1 | $0.002 | $0.73 | ⚡ | ⭐⭐⭐⭐⭐ | ✅✅ | ✅✅✅ | ❌ |
| **Ollama** | Qwen2.5:7b | $0 | $0 | ⚡ | ⭐⭐⭐ | ✅✅ | ✅ | ✅ 无限 |
| **Ollama** | DeepSeek-R1:7b | $0 | $0 | ⚡ | ⭐⭐⭐⭐ | ✅✅ | ✅✅ | ✅ 无限 |

> 💡 **成本说明**: 假设每天运行1次分析，每次约4000 tokens输入 + 2000 tokens输出

---

## 🎯 使用场景推荐

### 1️⃣ 日常监控（每天运行）

**🥇 首选：Google Gemini 2.0 Flash（实验版）**
```bash
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash-exp
```
✅ 完全免费，无限制  
✅ 速度极快  
✅ 质量优秀  
⚠️ 实验版，可能不稳定  

**🥈 备选：Google Gemini 1.5 Flash**
```bash
LLM_PROVIDER=google
LLM_MODEL=gemini-1.5-flash
```
✅ 每天15次免费额度  
✅ 超低价（$0.07/年）  
✅ 生产稳定  

---

### 2️⃣ 重要决策（FOMC会议、重大财报）

**🥇 首选：Claude 3.5 Sonnet**
```bash
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
```
✅ 推理能力最强  
✅ 上下文理解深刻  
✅ 适合复杂分析  
💰 成本: $0.02/次  

**🥈 备选：GPT-4o**
```bash
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
```
✅ 综合能力最强  
✅ 最新知识（2023年10月）  
💰 成本: $0.008/次  

---

### 3️⃣ 复杂推理（黑天鹅、情景分析）

**🥇 首选：DeepSeek R1**
```bash
LLM_PROVIDER=deepseek
LLM_MODEL=deepseek-reasoner
```
✅ 推理能力顶级  
✅ 超低价（$0.002/次）  
✅ 中文友好  

**🥈 备选：OpenAI o1-preview**
```bash
LLM_PROVIDER=openai
LLM_MODEL=o1-preview
```
✅ 最强推理能力  
⚠️ 速度慢  
💰 成本高: $0.05/次  

---

### 4️⃣ 预算有限（追求性价比）

**排名**:
1. **Gemini 2.0 Flash**: 免费，质量高
2. **Gemini 1.5 Flash**: $0.07/年
3. **GPT-4o-mini**: $0.18/年
4. **DeepSeek Chat**: $0.73/年

---

### 5️⃣ 隐私优先（本地部署）

**🥇 首选：Ollama + DeepSeek-R1:7b**
```bash
# 安装 Ollama
brew install ollama

# 下载模型
ollama pull deepseek-r1:7b

# 配置
LLM_PROVIDER=ollama
LLM_MODEL=deepseek-r1:7b
```
✅ 完全本地运行  
✅ 数据不出本地  
✅ 推理能力强  
⚠️ 需要较强 GPU  

**🥈 备选：Ollama + Qwen2.5:7b**
```bash
ollama pull qwen2.5:7b

LLM_PROVIDER=ollama
LLM_MODEL=qwen2.5:7b
```
✅ 中文优秀  
✅ 运行流畅  

---

### 6️⃣ 中文分析优先

**排名**:
1. **DeepSeek R1**: 中文原生 + 推理强
2. **Qwen2.5**: 中文顶级
3. **Gemini 1.5**: 中文优秀 + 便宜
4. **GPT-4o**: 中文优秀 + 综合最强

---

## 💡 混合使用策略

### 策略 1: 免费日常 + 付费重要决策

```bash
# 默认：日常监控（免费）
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash-exp

# 手动切换：重要决策（付费）
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
```

**年成本**: 假设每年10次重要决策 = $0.20

---

### 策略 2: 多模型验证（适合高风险决策）

重要投资决策时，同时使用多个模型交叉验证：

```bash
# 第一轮：快速扫描
npm run analyze:enhanced  # Gemini 2.0 Flash

# 第二轮：深度分析
# 修改 .env 为 Claude 3.5
npm run analyze:enhanced

# 第三轮：推理验证
# 修改 .env 为 DeepSeek R1
npm run analyze:enhanced
```

**成本**: $0 + $0.02 + $0.002 = $0.022/次

---

## 📋 快速配置参考

### Google Gemini（推荐！）

```bash
# .env
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash-exp  # 或 gemini-1.5-flash, gemini-1.5-pro
LLM_API_KEY=your-google-api-key  # 从 https://aistudio.google.com/apikey 获取
```

---

### OpenAI GPT-4o（新！）

```bash
# .env
LLM_ENABLED=true
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o                # 或 gpt-4o-mini (性价比高), o1-preview (推理强)
LLM_API_KEY=sk-...              # 从 https://platform.openai.com/api-keys 获取
```

---

### Anthropic Claude

```bash
# .env
LLM_ENABLED=true
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
LLM_API_KEY=sk-ant-...          # 从 https://console.anthropic.com/ 获取
```

---

### DeepSeek

```bash
# .env
LLM_ENABLED=true
LLM_PROVIDER=deepseek
LLM_MODEL=deepseek-chat         # 或 deepseek-reasoner (推理强)
LLM_API_KEY=sk-...              # 从 https://platform.deepseek.com/ 获取
```

---

### Ollama（本地）

```bash
# 1. 安装并启动 Ollama
brew install ollama
ollama serve &

# 2. 下载模型
ollama pull deepseek-r1:7b      # 推理强
# 或
ollama pull qwen2.5:7b          # 中文好
# 或
ollama pull gemma2:9b           # Google 开源

# 3. 配置 .env
LLM_ENABLED=true
LLM_PROVIDER=ollama
LLM_MODEL=deepseek-r1:7b
# 无需 LLM_API_KEY
```

---

## 🔍 模型特点详解

### Google Gemini 系列

#### Gemini 2.0 Flash（实验版）🔥
- **发布时间**: 2025年12月
- **上下文**: 最大 1M tokens
- **优势**: 完全免费、速度极快、多模态支持
- **适用**: 日常监控、快速扫描
- **限制**: 实验版，可能不稳定

#### Gemini 1.5 Flash
- **上下文**: 最大 1M tokens
- **定价**: $0.000075/1K input, $0.0003/1K output
- **优势**: 超低价、速度快、质量高
- **适用**: 日常监控、批量分析

#### Gemini 1.5 Pro
- **上下文**: 最大 2M tokens
- **定价**: $0.00125/1K input, $0.005/1K output
- **优势**: 质量顶级、超长上下文、多模态
- **适用**: 重要决策、复杂分析

---

### OpenAI 系列

#### GPT-4o（最新旗舰）🔥
- **发布时间**: 2024年5月
- **上下文**: 128K tokens
- **定价**: $0.0025/1K input, $0.01/1K output
- **优势**: 综合能力最强、速度快、多模态
- **适用**: 重要决策、日常监控

#### GPT-4o-mini（性价比之王）🔥
- **上下文**: 128K tokens
- **定价**: $0.00015/1K input, $0.0006/1K output
- **优势**: 性价比极高、速度快、质量优秀
- **适用**: 日常监控、批量分析

#### o1-preview（推理专家）
- **发布时间**: 2024年9月
- **上下文**: 128K tokens
- **定价**: $0.015/1K input, $0.06/1K output
- **优势**: 推理能力顶级、适合复杂问题
- **适用**: 复杂推理、情景分析
- **限制**: 速度慢、成本高

---

### Anthropic Claude 系列

#### Claude 3.5 Sonnet（推理之王）
- **发布时间**: 2024年10月
- **上下文**: 200K tokens
- **定价**: $0.003/1K input, $0.015/1K output
- **优势**: 推理能力顶级、上下文理解深刻
- **适用**: 重要决策、复杂分析

---

### DeepSeek 系列

#### DeepSeek Chat
- **上下文**: 64K tokens
- **定价**: $0.00014/1K tokens
- **优势**: 超低价、中文友好、质量好
- **适用**: 日常监控、中文分析

#### DeepSeek R1（推理新星）🔥
- **发布时间**: 2025年1月
- **上下文**: 64K tokens
- **定价**: $0.00014/1K tokens
- **优势**: 推理能力顶级、超低价、中文原生
- **适用**: 复杂推理、中文分析
- **特点**: 媲美 o1-preview，但价格仅 1/400！

---

### Ollama 本地模型

#### DeepSeek-R1:7b
- **参数**: 7B
- **优势**: 推理能力强、完全免费、数据隐私
- **适用**: 隐私优先、本地部署
- **要求**: 16GB+ RAM, GPU 推荐

#### Qwen2.5:7b
- **参数**: 7B
- **优势**: 中文顶级、完全免费、运行流畅
- **适用**: 中文分析、本地部署

#### Gemma2:9b
- **参数**: 9B
- **优势**: Google 开源、质量优秀、运行流畅
- **适用**: 综合分析、本地部署

---

## 🎯 最终推荐（2026年1月）

### 🏆 最佳选择（综合排名）

1. **Gemini 2.0 Flash（实验版）** - 免费 + 快速 + 优质
2. **Gemini 1.5 Flash** - 超低价（$0.07/年）+ 稳定
3. **GPT-4o-mini** - 性价比极高（$0.18/年）+ OpenAI 生态
4. **DeepSeek R1** - 推理强 + 超便宜（$0.73/年）+ 中文友好

---

### 💰 预算方案

| 年预算 | 推荐方案 | 配置 |
|-------|---------|------|
| **$0** | Gemini 2.0 Flash + Ollama | 日常用 Gemini（免费），离线用 Ollama |
| **< $5** | Gemini 1.5 Flash | 每天运行，一年才 $0.07 |
| **< $10** | GPT-4o-mini + DeepSeek R1 | 日常用 mini，推理用 R1 |
| **< $50** | GPT-4o (日常) + Claude 3.5 (重要) | 平衡质量与成本 |
| **无限制** | 多模型验证 | 重要决策用多模型交叉验证 |

---

## 🚀 快速开始

### 零成本方案（推荐新手）

```bash
# 1. 获取免费 API Key
# https://aistudio.google.com/apikey

# 2. 配置 .env
cat >> .env << 'EOF'
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash-exp
LLM_API_KEY=your-google-api-key
EOF

# 3. 运行
npm run analyze:enhanced
```

**成本**: $0/年  
**质量**: ⭐⭐⭐⭐⭐

---

## 📚 更多资源

- **详细文档**: `docs/LLM_ENHANCEMENT.md`
- **使用教程**: `README.md`
- **API 文档**:
  - Google Gemini: https://ai.google.dev/gemini-api/docs
  - OpenAI: https://platform.openai.com/docs
  - Anthropic: https://docs.anthropic.com/
  - DeepSeek: https://platform.deepseek.com/docs
  - Ollama: https://ollama.ai/

---

**最后更新**: 2026年1月22日
