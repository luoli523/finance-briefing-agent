# Finance Briefing Agent

> 🚀 基于 AI 的财经简报自动生成系统

专业的全自动化 **AI 产业链投资简报**生成工具，每日自动收集美股市场、财经新闻、宏观经济数据，通过 LLM 深度分析生成结构化的投资决策参考报告。

## ✨ 核心特性

### 📊 AI 产业链全覆盖
- **48 只核心标的** - 覆盖 AI 产业链上中下游
- **9 大产业分类** - GPU/半导体、晶圆制造、设备EDA、服务器、云平台、AI软件、自动驾驶、数据中心能源
- **完整生态视图** - 从芯片设计到终端应用的完整投资图谱

### 🤖 LLM 深度分析
- **多模型支持** - GPT-5.2、GPT-4o、Gemini 2.0 Flash、Claude、DeepSeek
- **产业链视角** - GPU供应链、数据中心扩张、半导体CapEx三条主线分析
- **投资建议** - 短中长期配置建议、精选标的、风险控制
- **深度洞察** - 传导机制分析、受益/受损环节识别、跟踪指标

### 📈 多维度数据收集
- **Yahoo Finance** - 实时行情（无需 API Key）
- **Finnhub** - 全球财经新闻
- **FRED** - 美国宏观经济指标
- **政府 RSS** - Fed 公告、SEC 新闻

---

## 🚀 快速开始

### 1. 安装

```bash
git clone https://github.com/luoli523/finance-briefing-agent.git
cd finance-briefing-agent
npm install
```

### 2. 配置 API Keys

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据收集 API（可选但推荐）
FINNHUB_API_KEY=your_finnhub_key
FRED_API_KEY=your_fred_key

# LLM 深度分析（推荐启用）
LLM_ENABLED=true
LLM_PROVIDER=openai
LLM_MODEL=gpt-5.2
LLM_API_KEY=your_openai_key
LLM_MAX_TOKENS=16384
LLM_TIMEOUT=300000
```

### 3. 一键生成简报 🎯

```bash
npm run daily
```

这将自动执行：
1. **📊 收集数据** (~20秒) - 市场行情、新闻、经济指标
2. **🧠 智能分析** (~2秒) - 多维度数据分析
3. **🤖 LLM 深度分析** (~90秒) - GPT-5.2 产业链洞察
4. **📄 生成简报** (~1秒) - 专业投资报告

生成的简报位于 `output/ai-briefing-YYYY-MM-DD.md`

---

## 📄 简报内容

生成的简报包含 **6 大核心板块**：

### 一、核心股票池表现
按 AI 产业链分类展示 48 只标的的实时行情：

| 分类 | 公司 | 股票代号 | 最新股价 | 涨跌幅 | 表现 |
|------|------|----------|----------|--------|------|
| GPU/加速与半导体 | NVIDIA Corporation | NVDA | $184.84 | +0.91% | 🔴 |
| ... | ... | ... | ... | ... | ... |

### 二、市场宏观动态与要闻
- 5-10 条最重要新闻，带影响解读
- 覆盖政策监管、供应链、资本市场情绪

### 三、关键公司深度动态
- 股价异动公司的深度分析
- 投资逻辑、价格目标、催化剂、风险提示

### 四、行业影响与关联分析
- **GPU供应链** - 供给 → 成本 → 云厂商毛利
- **数据中心扩张** - 需求 → 服务器/网络/电力
- **半导体CapEx** - 投资 → 设备/EDA订单

### 五、产业链资本动向
- 重大 CapEx、并购、投资动态

### 六、投资建议与策略展望
- 短期（1月）/ 中期（3-6月）/ 长期（6-12月）配置
- 精选标的、风险控制、对冲建议

---

## 📊 监控标的 (48只)

### 主要指数 (5)
`^GSPC` S&P 500 | `^DJI` 道琼斯 | `^IXIC` 纳斯达克 | `^RUT` Russell 2000 | `^VIX` 恐慌指数

### ETF (6)
`SMH` `SOXX` 半导体 | `QQQ` 纳斯达克100 | `ARKQ` `BOTZ` 机器人/AI | `GLD` 黄金对冲

### GPU/加速与半导体 (6)
`NVDA` NVIDIA | `AMD` AMD | `AVGO` Broadcom | `QCOM` 高通 | `MU` 美光 | `ARM` Arm

### 晶圆与制造 (2)
`TSM` 台积电 | `ASML` 阿斯麦

### 设备/EDA (5)
`AMAT` 应用材料 | `LRCX` 泛林 | `KLAC` KLA | `SNPS` Synopsys | `CDNS` Cadence

### 服务器与基础设施 (6)
`SMCI` 超微 | `DELL` 戴尔 | `HPE` 惠普企业 | `ANET` Arista | `VRT` Vertiv | `ETN` 伊顿

### 云与平台 (4)
`MSFT` 微软 | `AMZN` 亚马逊 | `GOOGL` 谷歌 | `ORCL` 甲骨文

### 应用与软件 (6)
`META` Meta | `ADBE` Adobe | `CRM` Salesforce | `NOW` ServiceNow | `SNOW` Snowflake | `DDOG` Datadog

### 自动驾驶/机器人 (4)
`TSLA` 特斯拉 | `MBLY` Mobileye | `ABB` ABB | `FANUY` 发那科

### 数据中心能源 (4)
`VST` Vistra | `CEG` Constellation | `OKLO` Oklo | `BE` Bloom Energy

### 其他 (6)
`AAPL` 苹果 | `INTC` 英特尔 | `MRVL` Marvell | `PLTR` Palantir | `LLY` 礼来 | `JPM` 摩根大通

---

## 🛠️ 命令汇总

### 推荐工作流

```bash
# 每日简报（推荐）
npm run daily

# 等同于
npm run workflow:pro
```

### 分步执行

```bash
# 1. 数据收集
npm run collect

# 2. 数据分析
npm run analyze

# 3. 生成专业简报
npm run generate:pro
```

### 单独收集器

```bash
npm run collect:yahoo    # 美股行情（无需API）
npm run collect:finnhub  # 财经新闻
npm run collect:fred     # 经济数据
npm run collect:sec      # SEC文件
npm run collect:rss      # 政府RSS
```

### 其他命令

```bash
npm run verify:config           # 验证配置
npm run generate:infographic    # 生成信息图表
npm run workflow:intelligent    # 智能分析工作流
```

---

## ⚙️ LLM 配置

### 支持的模型

| 提供商 | 模型 | 推荐场景 |
|--------|------|----------|
| **OpenAI** | `gpt-5.2` ⭐ | 最佳质量，深度分析 |
| **OpenAI** | `gpt-4o` | 性价比之选 |
| **OpenAI** | `gpt-4o-mini` | 低成本快速 |
| **Google** | `gemini-2.0-flash` | 免费！ |
| **Anthropic** | `claude-3.5-sonnet` | 高质量 |
| **DeepSeek** | `deepseek-chat` | 中文优化 |

### 配置示例

```env
# GPT-5.2 (推荐)
LLM_ENABLED=true
LLM_PROVIDER=openai
LLM_MODEL=gpt-5.2
LLM_API_KEY=sk-xxx
LLM_MAX_TOKENS=16384
LLM_TIMEOUT=300000

# Gemini (免费)
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash
LLM_API_KEY=your_google_key
```

---

## 📁 项目结构

```
finance-briefing-agent/
├── src/
│   ├── collectors/          # 数据收集器
│   │   ├── yahoo-finance.ts # 美股行情
│   │   ├── finnhub.ts       # 财经新闻
│   │   ├── fred.ts          # 经济数据
│   │   └── history.ts       # 历史数据管理
│   │
│   ├── analyzers/           # 数据分析
│   │   ├── market.ts        # 市场分析
│   │   ├── news.ts          # 新闻分析
│   │   ├── economic.ts      # 经济分析
│   │   └── llm/             # LLM增强分析
│   │       └── providers/   # 多LLM提供商
│   │
│   ├── generators/          # 报告生成
│   │   └── professional-briefing.ts  # 专业简报生成器
│   │
│   ├── config/              # 配置管理
│   │   └── index.ts         # 全局配置
│   │
│   └── scripts/             # 运行脚本
│
├── prompts/                 # LLM提示词
│   ├── professional-briefing-system.txt
│   └── professional-briefing-task.txt
│
├── data/
│   ├── raw/                 # 原始数据
│   ├── processed/           # 处理后数据
│   └── history/             # 历史数据
│
├── output/                  # 生成的简报
├── docs/                    # 详细文档
└── config/                  # 配置工具
```

---

## 🔧 自定义配置

### 修改监控标的

编辑 `src/config/index.ts` 中的 `MONITORED_SYMBOLS`：

```typescript
export const MONITORED_SYMBOLS = {
  gpuAccelerator: [
    'NVDA', 'AMD', 'AVGO', 'QCOM', 'MU', 'ARM',
    // 添加新的股票...
  ],
  // ...
};
```

### 修改 LLM 提示词

编辑 `prompts/` 目录下的文件：
- `professional-briefing-system.txt` - AI 角色定义
- `professional-briefing-task.txt` - 输出格式和要求

---

## 📚 详细文档

- [`docs/LLM_ENHANCEMENT.md`](./docs/LLM_ENHANCEMENT.md) - LLM 配置详解
- [`docs/COLLECTORS_OVERVIEW.md`](./docs/COLLECTORS_OVERVIEW.md) - 数据收集器
- [`docs/SYMBOLS_CONFIGURATION.md`](./docs/SYMBOLS_CONFIGURATION.md) - 股票配置
- [`docs/PROMPT_CUSTOMIZATION.md`](./docs/PROMPT_CUSTOMIZATION.md) - 提示词定制
- [`config/README.md`](./config/README.md) - 配置管理

---

## ⚠️ 常见问题

**Q: 没有 LLM API Key 能用吗？**  
A: 可以！系统会使用规则引擎生成基础报告。但推荐启用 LLM 获得深度洞察。

**Q: 推荐用哪个 LLM？**  
A: GPT-5.2 质量最佳；Gemini 2.0 Flash 免费；GPT-4o-mini 性价比高。

**Q: 数据多久更新？**  
A: 手动运行命令时更新。建议美股收盘后（北京时间早上 5-6 点）运行。

**Q: LLM 分析超时怎么办？**  
A: 增加 `LLM_TIMEOUT` 值（默认 300000 = 5分钟）。

---

## ⚖️ 免责声明

本工具仅供学习和参考使用，生成的简报不构成任何投资建议。投资有风险，决策需谨慎。

- ⚠️ 数据来源于第三方 API，不保证准确性和实时性
- ⚠️ LLM 分析基于模型推理，可能存在偏差
- ⚠️ 使用者应独立判断，自行承担投资风险

---

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

**Happy Trading! 📈**
