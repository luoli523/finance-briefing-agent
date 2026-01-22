# 更新日志 (Changelog)

## [未发布] - 2026-01-22

### 🆕 新增 LLM 提供商与模型（最新！）

#### ✨ Google Gemini 支持
- **新增提供商**: Google (`LLM_PROVIDER=google`)
- **支持模型**:
  - `gemini-2.0-flash-exp` - 🔥 实验版，完全免费！
  - `gemini-1.5-flash` - 超低价 ($0.07/年)
  - `gemini-1.5-pro` - 高级版
  - `gemini-1.0-pro` - 基础版
- **成本**: Gemini 2.0 Flash 完全免费，1.5 Flash 仅 $0.07/年
- **优势**: 速度极快 + 质量优秀 + 成本最低/免费

#### ✨ OpenAI 最新模型支持
- **GPT-4o** (`gpt-4o`) - 🔥 2024最新旗舰模型
- **GPT-4o-mini** (`gpt-4o-mini`) - 性价比之王 ($0.18/年)
- **o1-preview** (`o1-preview`) - 推理专家
- **o1-mini** (`o1-mini`) - 轻量推理模型

#### ✨ DeepSeek 推理模型
- **DeepSeek R1** (`deepseek-reasoner`) - 🔥 推理专家，媲美 o1-preview
- **成本**: $0.73/年（比 o1-preview 便宜 25 倍）
- **优势**: 推理能力顶级 + 中文原生 + 超低价

#### ✨ Ollama 新增模型
- **DeepSeek-R1:7b** (`deepseek-r1:7b`) - 推理强
- **Gemma2:9b** (`gemma2:9b`) - Google 开源

#### 📁 新增文件
```
src/analyzers/llm/providers/google.ts     # Google Gemini 提供商
docs/LLM_PROVIDER_COMPARISON.md           # 详细对比指南
```

#### 📝 文档更新
- **`docs/LLM_ENHANCEMENT.md`**: 新增 Gemini 配置说明，更新成本对比
- **`docs/LLM_PROVIDER_COMPARISON.md`**: 新增详细对比指南
  - 综合对比表
  - 使用场景推荐
  - 混合使用策略
  - 快速配置参考
  - 模型特点详解
- **`README.md`**: 更新 LLM 提供商列表和推荐模型

#### 💡 最佳实践推荐
1. **日常监控**: Gemini 2.0 Flash（免费！）
2. **重要决策**: Claude 3.5 Sonnet 或 GPT-4o
3. **复杂推理**: DeepSeek R1 或 o1-preview
4. **预算有限**: Gemini 1.5 Flash ($0.07/年)
5. **隐私优先**: Ollama + DeepSeek-R1:7b（本地）

---

### 🤖 LLM 深度增强（混合模式）

#### 新增功能 ✨

##### LLM 增强分析器
- **混合模式架构**: 规则引擎（基础层）+ LLM（深度层）
- **多提供商支持**: OpenAI、Anthropic (Claude)、DeepSeek、Ollama (本地)
- **深度洞察分析**:
  - 宏观经济深度解读
  - Fed 政策深度分析
  - 地缘政治深度解读
  - 行业趋势深度分析（AI、半导体、数据中心、能源）
  - 跨领域深度洞察
  - 投资策略建议（短/中/长期）
  - 情景分析（牛市/基准/熊市情景）
  - 关键问题和行动项
- **成本可控**: 
  - 默认关闭，按需启用
  - DeepSeek 仅 $0.002/次分析
  - Ollama 完全免费（本地模型）
- **完善的错误处理**: LLM 失败自动降级到规则引擎

##### 新增命令
```bash
npm run analyze:enhanced    # 混合分析（规则引擎 + LLM）
```

##### 新增文件
```
src/analyzers/llm/
├── types.ts                # LLM 类型定义
├── prompts.ts              # 精心设计的提示词模板
├── enhancer.ts             # LLM 增强器核心
├── providers/
│   ├── base.ts             # 提供商基类
│   ├── openai.ts           # OpenAI 提供商
│   ├── anthropic.ts        # Anthropic Claude 提供商
│   ├── deepseek.ts         # DeepSeek 提供商
│   └── ollama.ts           # Ollama 本地模型提供商
└── index.ts

src/scripts/analyze-enhanced.ts   # 混合分析脚本
docs/LLM_ENHANCEMENT.md            # 详细使用文档
```

##### 配置更新
- 新增 LLM 相关配置项到 `.env.example`
- 更新 `src/config/index.ts` 支持 LLM 配置

#### 技术亮点

- **零外部依赖**: 直接使用 Node.js `https`/`http` 模块
- **类型安全**: 完整的 TypeScript 类型定义
- **灵活架构**: 易于扩展新的 LLM 提供商
- **成本透明**: 实时显示 tokens 使用和成本估算

#### 使用示例

```bash
# 1. 启用 LLM 增强（.env）
LLM_ENABLED=true
LLM_PROVIDER=deepseek           # 或 openai, anthropic, ollama
LLM_MODEL=deepseek-chat
LLM_API_KEY=your-api-key

# 2. 运行混合分析
npm run analyze:enhanced
```

#### 成本对比

| 提供商 | 模型 | 成本/次 | 质量 |
|-------|------|---------|------|
| DeepSeek | deepseek-chat | ~$0.002 | ⭐⭐⭐⭐ |
| Anthropic | Claude 3.5 Sonnet | ~$0.02 | ⭐⭐⭐⭐⭐ |
| OpenAI | GPT-4 Turbo | ~$0.03 | ⭐⭐⭐⭐⭐ |
| Ollama | Qwen2.5/Llama3.1 | 免费 | ⭐⭐⭐ |

#### 文档
- 详细使用指南: `docs/LLM_ENHANCEMENT.md`
- 配置示例: `.env.example`
- README 已更新

---

## [1.2.0] - 2026-01-22

### 🌟 重大更新：智能综合分析器

#### 新增功能 ✨

##### 1. 智能综合分析器 (Intelligent Analyzer)
- **5 大维度深度分析**
  - 🌍 宏观经济：GDP、通胀、就业健康度分析
  - 🏦 财政货币政策：Fed 立场（鹰派/鸽派）、利率预期、收益率曲线
  - 🌐 地缘政治：重大事件、受影响板块、风险等级
  - ⚖️ 政策监管：SEC 动态、政策变化、受影响公司
  - 🏭 行业深度分析：AI、半导体、数据中心、能源

- **4 大重点行业深度分析**
  - 🤖 AI 人工智能：关键进展、领先股票、投资建议
  - 💾 半导体：供应链状态、需求趋势、关键玩家
  - 🏢 数据中心：产能扩张、电力需求、关键标的
  - ⚡ 能源：传统能源、可再生能源、核能复兴

- **跨领域关联分析**
  - 识别关键关联（如 AI 需求 → 半导体景气度）
  - 发现新兴趋势（如 AI 算力竞赛 → 电力基础设施投资）
  - 揭示隐藏风险（如利率上升 → 高估值科技股压力）

- **智能投资建议**
  - ✅ 投资机会识别
  - ⚠️ 投资风险警示
  - 🔄 板块轮动建议
  - ⏰ 时机考量分析

- **关键催化剂识别**
  - 📅 即将到来的重要事件（FOMC 会议、CPI 发布等）
  - 👀 需要持续监控的项目（财报季、政策进展等）

##### 2. 新增数据源
- **政府 RSS 收集器**
  - Federal Reserve (美联储新闻稿和官员讲话)
  - SEC (证券监管动态)
  - Federal Register (联邦法规)
  - 100% 成功率，110+ 条实时政府动态

- **SEC EDGAR 收集器**
  - 公司监管文件（8-K, 10-K, 10-Q, Form 4）
  - XBRL 财务数据
  - 支持自定义监控公司和文件类型

##### 3. 智能简报生成器
- **新的智能简报格式** (`intelligent-briefing-YYYY-MM-DD.md`)
  - 📋 今日要点和市场展望
  - 🧠 多维度分析详情
  - 🏭 重点行业深度分析
  - 🔗 跨领域关联洞察
  - 💡 投资建议
  - 🎯 关键催化剂
  - 📊 完整持仓明细
  - 📰 新闻要闻
  - 🏦 经济数据详情

##### 4. 一键智能工作流
- **新命令**：`npm run workflow:intelligent`
  - 自动收集所有数据源
  - 执行智能综合分析
  - 生成智能简报
  - 全程自动化，约 40 秒完成

### 新增命令 📝

```bash
# 智能分析
npm run analyze:intelligent      # 执行智能综合分析
npm run generate:intelligent     # 生成智能简报
npm run workflow:intelligent     # 一键智能工作流（推荐）

# 数据收集
npm run collect:sec             # 收集 SEC 监管数据
npm run collect:rss             # 收集政府 RSS 数据
```

### 新增文件 📁

```
src/analyzers/intelligent.ts              # 智能分析器核心
src/scripts/analyze-intelligent.ts        # 智能分析脚本
src/generators/intelligent-markdown.ts    # 智能简报生成器
src/scripts/generate-intelligent.ts       # 智能简报生成脚本
src/scripts/run-intelligent-workflow.ts   # 智能工作流脚本
src/collectors/sec-edgar.ts               # SEC 收集器
src/collectors/rss.ts                     # RSS 收集器
docs/INTELLIGENT_ANALYZER.md              # 智能分析器文档
docs/NEWS_SOURCES_IMPLEMENTATION.md       # 新闻源实施指南
docs/NEWS_SOURCES_QUICKSTART.md           # 新闻源快速开始
docs/SYMBOLS_CONFIGURATION.md             # 符号配置文档
docs/CONFIG_TEST_REPORT.md                # 配置测试报告
docs/COLLECTORS_OVERVIEW.md               # 收集器概览
```

### 改进 🔧

#### 数据整合
- 整合 6 个数据源（Yahoo Finance、Finnhub、FRED、SEC、政府 RSS、历史数据）
- 跨数据源关联分析
- 多维度情绪综合判断

#### 分析深度
- 从单维度分析升级到 5 大维度综合分析
- 新增 4 大重点行业深度分析
- 识别跨领域关联和新兴趋势

#### 投资价值
- 从基础市场分析升级到可操作的投资建议
- 提供机会、风险、板块轮动、时机考量
- 识别关键催化剂，提前布局

### 技术架构 🏗️

```
IntelligentAnalyzer
├── performBaseAnalysis()              # 基础分析
├── analyzeDimensions()                 # 多维度分析
│   ├── analyzeMacroEconomic()         # 宏观经济
│   ├── analyzeMonetaryPolicy()        # 货币政策
│   ├── analyzeGeopolitical()          # 地缘政治
│   ├── analyzeRegulatory()            # 政策监管
│   └── sectorDeepDive                 # 行业深度
│       ├── analyzeAISector()
│       ├── analyzeSemiconductorSector()
│       ├── analyzeDataCenterSector()
│       └── analyzeEnergySector()
├── analyzeCrossDomainConnections()    # 跨领域关联
├── generateInvestmentImplications()   # 投资建议
├── identifyCatalysts()                # 关键催化剂
└── generateEnhancedSummary()          # 综合摘要
```

### 使用方法 📖

#### 快速开始（推荐）

```bash
npm run workflow:intelligent
```

#### 分步执行

```bash
npm run collect                # 收集所有数据
npm run analyze:intelligent    # 智能分析
npm run generate:intelligent   # 生成智能简报
```

### 文档 📚

- 详细文档：`docs/INTELLIGENT_ANALYZER.md`
- 收集器概览：`docs/COLLECTORS_OVERVIEW.md`
- 配置管理：`docs/SYMBOLS_CONFIGURATION.md`

---

## [1.1.0] - 2026-01-21

### 新增功能 ✨

#### 1. 完整的持仓明细显示
- **按行业分类显示所有监控标的**：简报现在包含 12 个行业分类，覆盖全部 51 只标的
  - 主要指数 (6只)
  - ETF (6只)
  - 科技巨头 (7只)
  - 半导体 (13只)
  - 存储 (3只)
  - 数据中心 (3只)
  - 能源/核电 (5只)
  - AI/软件 (2只)
  - 航天 (1只)
  - 金融 (3只)
  - 保险科技 (1只)
  - 医疗 (1只)

- **详细的板块统计**：每个板块显示
  - 平均涨跌幅
  - 上涨/下跌标的数量
  - 完整的标的列表（按涨跌幅排序）

#### 2. 历史数据保存和对比 📊
- **自动保存每日收盘数据**
  - 收集器现在会自动将每日收盘数据保存到 `data/history/market-history.json`
  - 保留最近 90 天的历史数据
  - 支持历史数据查询和对比

- **历史数据管理 API**
  - `HistoryManager` 类提供完整的历史数据管理功能
  - 支持按日期、按股票代码查询历史数据
  - 支持多日期对比分析

- **未来功能预留**：简报生成器已预留历史对比接口
  - 当历史数据充足时，简报将自动显示"对比前日"列
  - 可以对比任意历史交易日的涨跌情况

### 改进 🔧

#### 简报结构优化
- 将"主要指数"、"板块表现"、"涨跌榜"整合为"全部持仓明细（按行业分类）"
- 保留"涨跌榜 Top 5"作为快速概览
- 简报内容从 750 词增加到 1564 词，信息更加全面

#### 代码结构优化
- 新增 `src/collectors/history.ts` - 历史数据管理模块
- 更新 `src/analyzers/market.ts` - 支持指数作为独立板块分类
- 更新 `src/generators/markdown.ts` - 支持异步生成和历史对比

### 技术细节 🔧

#### 新增文件
```
src/collectors/history.ts          # 历史数据管理器
data/history/market-history.json   # 历史数据存储
```

#### 修改文件
```
src/collectors/index.ts            # 导出历史管理器
src/collectors/yahoo-finance.ts    # 自动保存历史数据
src/analyzers/market.ts            # 完善板块分类
src/generators/markdown.ts         # 支持完整持仓和历史对比
```

### 使用方法 📖

#### 查看完整简报
```bash
npm run collect && npm run analyze && npm run generate
```

生成的简报将包含：
- ✅ 51 只标的的完整持仓明细
- ✅ 按 12 个行业分类显示
- ✅ 每个标的的当前价、日涨跌、日涨跌幅
- ⏳ 历史对比（需要多日数据后自动显示）

#### 历史数据位置
- 存储位置：`data/history/market-history.json`
- 保留时长：最近 90 天
- 更新频率：每次运行 `npm run collect` 自动更新

### 未来计划 🚀

- [ ] 添加周对比、月对比功能
- [ ] 添加历史趋势图表
- [ ] 支持自定义历史对比时间范围
- [ ] 添加历史数据导出功能
- [ ] 支持历史回测分析

---

## [1.0.0] - 2026-01-21

### 初始版本
- 多源数据收集 (Yahoo Finance, Finnhub, FRED)
- 智能数据分析 (市场、新闻、经济)
- 多格式输出 (Markdown, HTML)
