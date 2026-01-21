# Finance Briefing Agent

基于 AI 的财经简报自动生成系统，用于收集、分析财经数据并生成结构化的每日财经简报。

## 功能特性

- **多源数据收集** - Yahoo Finance 美股行情、Finnhub 财经新闻、FRED 宏观经济数据
- **智能数据分析** - 市场状态判断、板块分析、情感分析、风险信号检测
- **多格式输出** - 支持 Markdown 和 HTML 格式的精美简报

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API Keys（可选）

复制环境变量模板并填入 API Keys：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Finnhub API Key (免费: https://finnhub.io)
FINNHUB_API_KEY=your_finnhub_api_key

# FRED API Key (免费: https://fred.stlouisfed.org/docs/api/api_key.html)
FRED_API_KEY=your_fred_api_key
```

> **注意**: Yahoo Finance 数据无需 API Key，即使不配置其他 API Key 也可以生成基础简报。

### 3. 一键生成简报

```bash
npm run collect && npm run analyze && npm run generate
```

生成的简报位于 `output/` 目录：
- `briefing-YYYY-MM-DD.md` - Markdown 格式
- `briefing-YYYY-MM-DD.html` - HTML 格式（可直接在浏览器打开）

---

## 命令汇总

### 🔄 完整工作流

一键运行完整流程（推荐）：

```bash
npm run collect && npm run analyze && npm run generate
```

这会依次执行：数据收集 → 数据分析 → 简报生成

---

### 📊 数据收集 (collect)

#### 统一收集（推荐）

```bash
npm run collect
```

**功能**：运行所有可用的收集器，自动收集市场、新闻、经济数据

**输出**：
- 原始数据：`data/raw/`
- 处理数据：`data/processed/aggregated-YYYY-MM-DDTHH-MM-SS.json`
- 控制台显示：市场快照、新闻标题、经济指标

**API Key 需求**：
- ✅ Yahoo Finance（美股行情）- 不需要
- ⚠️ Finnhub（财经新闻）- 可选
- ⚠️ FRED（经济数据）- 可选

> 💡 **提示**：即使不配置 Finnhub 和 FRED 的 API Key，也能收集到美股数据并生成基础简报

#### 分别收集

##### Yahoo Finance - 美股行情

```bash
npm run collect:yahoo
```

- **无需 API Key**
- 收集 51 只股票/指数（6个指数 + 6个ETF + 39只个股）
- 显示主要指数、涨跌榜 Top 5

##### Finnhub - 财经新闻

```bash
npm run collect:finnhub
```

- **需要 API Key**（免费注册：https://finnhub.io）
- 收集全球财经新闻（默认 general 类别）
- 显示最新 15 条新闻标题和摘要

##### FRED - 宏观经济数据

```bash
npm run collect:fred
```

- **需要 API Key**（免费注册：https://fred.stlouisfed.org/docs/api/api_key.html）
- 收集 8 个关键经济指标（失业率、CPI、利率等）
- 显示按类别分组的经济数据和收益率曲线状态

---

### 🧠 数据分析 (analyze)

```bash
npm run analyze
```

**功能**：
- 加载最新的 `aggregated-*.json` 数据
- 执行市场、新闻、经济三维度分析
- 生成综合分析报告

**输出**：
- 分析结果：`data/processed/analysis-YYYY-MM-DDTHH-MM-SS.json`
- 控制台显示：
  - 📋 综合摘要（市场状态、整体情感、关键要点）
  - 📊 市场分析（指数表现、板块排名、涨跌榜）
  - 📰 新闻分析（热门话题、重要新闻）
  - 🏦 经济分析（经济展望、关键指标、收益率曲线）

**分析内容包括**：
- 市场状态：risk-on / risk-off / mixed
- 整体情感：bullish / bearish / neutral
- 板块表现排名（8个行业）
- 风险信号检测（VIX、大盘暴跌、收益率倒挂等）
- 新闻情感分析和主题提取
- 经济展望判断（expansion / contraction / stable）

**前置要求**：需要先运行 `npm run collect`

---

### 📄 简报生成 (generate)

#### 生成所有格式（推荐）

```bash
npm run generate
```

生成 Markdown + HTML 两种格式的简报

#### 仅生成 Markdown

```bash
npm run generate -- --format=md
# 或
npm run generate -- --format=markdown
```

#### 仅生成 HTML

```bash
npm run generate -- --format=html
```

**输出位置**：`output/`
- `briefing-YYYY-MM-DD.md` - Markdown 格式
- `briefing-YYYY-MM-DD.html` - HTML 格式（可直接在浏览器打开）

**简报内容包括**：
- 📋 今日要点（市场状态、关键要点、展望）
- 📊 市场行情（主要指数表现）
- 🏭 板块表现（8个行业排名）
- 📈 涨跌榜（Top 5 涨幅 / 跌幅）
- 📋 全部持仓明细（按行业分类）
- 📰 新闻要闻（热门话题、重要新闻）
- 🏦 经济数据（关键指标、收益率曲线）
- ⚠️ 风险关注

**前置要求**：需要先运行 `npm run analyze`

**查看 HTML 简报**：
```bash
# macOS
open output/briefing-2026-01-21.html

# Linux
xdg-open output/briefing-2026-01-21.html

# Windows
start output/briefing-2026-01-21.html
```

---

### 📝 使用示例

**情景 1：快速生成今日简报**
```bash
# 一条命令搞定
npm run collect && npm run analyze && npm run generate
```

**情景 2：只更新市场数据**
```bash
# 只收集美股数据（无需 API Key）
npm run collect:yahoo

# 重新分析和生成
npm run analyze && npm run generate
```

**情景 3：只生成 Markdown 简报**
```bash
npm run generate -- --format=md
```

**情景 4：检查经济数据**
```bash
# 收集并查看经济指标
npm run collect:fred

# 查看详细分析
npm run analyze
```

---

### ⚠️ 常见问题

**Q: 没有配置 API Key 能用吗？**  
A: 可以！Yahoo Finance 不需要 API Key，可以收集美股数据并生成基础简报。

**Q: 数据多久更新一次？**  
A: 手动运行命令时更新。建议在美股收盘后（北京时间早上 5-6 点）运行。

**Q: 如何自动化执行？**  
A: 可以使用 cron (Linux/macOS) 或 Task Scheduler (Windows) 定时执行。

**Q: 分析失败怎么办？**  
A: 确保先运行了 `npm run collect`。检查 `data/processed/` 目录是否有 `aggregated-*.json` 文件。

**Q: 简报内容可以自定义吗？**  
A: 可以！参见下方"自定义配置"部分。

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                    Finance Briefing Agent                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │  Collectors  │ → │  Analyzers   │ → │  Generators  │    │
│  │  数据收集器   │   │   分析模块    │   │   生成模块    │    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
│         │                  │                  │             │
│         ↓                  ↓                  ↓             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │   data/raw   │   │data/processed│   │    output    │    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 目录结构

```
finance-briefing-agent/
├── src/
│   ├── collectors/          # 数据收集模块
│   │   ├── index.ts         # 统一导出
│   │   ├── types.ts         # 类型定义
│   │   ├── base.ts          # 基础收集器类
│   │   ├── yahoo-finance.ts # Yahoo Finance 收集器
│   │   ├── finnhub.ts       # Finnhub 新闻收集器
│   │   └── fred.ts          # FRED 经济数据收集器
│   │
│   ├── analyzers/           # 数据分析模块
│   │   ├── index.ts         # 统一导出
│   │   ├── types.ts         # 类型定义
│   │   ├── base.ts          # 基础分析器类
│   │   ├── market.ts        # 市场数据分析器
│   │   ├── news.ts          # 新闻分析器
│   │   ├── economic.ts      # 经济数据分析器
│   │   └── unified.ts       # 统一分析器
│   │
│   ├── generators/          # 简报生成模块
│   │   ├── index.ts         # 统一导出
│   │   ├── types.ts         # 类型定义
│   │   ├── base.ts          # 基础生成器类
│   │   ├── markdown.ts      # Markdown 生成器
│   │   ├── html.ts          # HTML 生成器
│   │   └── unified.ts       # 统一生成器
│   │
│   ├── config/              # 配置模块
│   │   └── index.ts         # 配置加载
│   │
│   └── scripts/             # 运行脚本
│       ├── collect.ts       # 统一收集脚本
│       ├── collect-yahoo.ts # Yahoo Finance 收集
│       ├── collect-finnhub.ts # Finnhub 收集
│       ├── collect-fred.ts  # FRED 收集
│       ├── analyze.ts       # 分析脚本
│       └── generate.ts      # 生成脚本
│
├── data/
│   ├── raw/                 # 原始数据
│   └── processed/           # 处理后的数据
│
├── output/                  # 生成的简报
├── config/                  # 配置文件
├── .env.example             # 环境变量模板
├── package.json
├── tsconfig.json
└── README.md
```

---

## 数据源说明

### Yahoo Finance（美股行情）

**无需 API Key**，默认收集以下标的：

**指数 (6个)**
| 代码 | 名称 |
|------|------|
| ^GSPC | S&P 500 |
| ^DJI | Dow Jones |
| ^IXIC | NASDAQ |
| ^RUT | Russell 2000 |
| ^VIX | VIX 恐慌指数 |
| ^SPX | S&P 500 Index |

**ETF (6个)**
| 代码 | 名称 |
|------|------|
| SPY | SPDR S&P 500 ETF |
| QQQ | Invesco QQQ (NASDAQ 100) |
| VOO | Vanguard S&P 500 ETF |
| SOXX | iShares Semiconductor ETF |
| SMH | VanEck Semiconductor ETF |
| GLD | SPDR Gold Trust |

**个股 (39个)**
- 科技巨头: AAPL, MSFT, GOOGL, AMZN, META, TSLA, ORCL, PLTR
- 半导体: NVDA, AMD, INTC, AVGO, QCOM, TSM, ASML, MU, MRVL, ARM, LRCX, AMAT, KLAC
- 存储: WDC, STX, PSTG
- 数据中心: VRT, DELL, ANET
- 能源/核电: VST, CEG, LEU, OKLO, BE
- 航天: RKLB
- 金融: BRK-B, JPM, V
- 其他: LMND, LLY, CRWV

### Finnhub（财经新闻）

**需要 API Key**（免费注册: https://finnhub.io）

- 全球财经新闻
- 按类别筛选（general, forex, crypto, merger）
- 支持按股票代码获取相关新闻

### FRED（宏观经济数据）

**需要 API Key**（免费注册: https://fred.stlouisfed.org/docs/api/api_key.html）

默认获取的经济指标：

| 类别 | 指标 | 系列 ID |
|------|------|---------|
| 就业 | 失业率 | UNRATE |
| 就业 | 初请失业金 | ICSA |
| 通胀 | CPI | CPIAUCSL |
| 利率 | 联邦基金利率 | FEDFUNDS |
| 利率 | 10年期国债 | DGS10 |
| 利率 | 2年期国债 | DGS2 |
| 利率 | 收益率曲线 | T10Y2Y |
| 信心 | 消费者信心 | UMCSENT |

---

## 分析功能

### 市场分析 (MarketAnalyzer)
- 判断市场状态（risk-on / risk-off / mixed）
- 板块表现分析和排名
- 涨跌榜 Top 5
- 风险信号检测（VIX、科技股集体下跌等）

### 新闻分析 (NewsAnalyzer)
- 热门话题提取（AI、美联储、财报等）
- 新闻情感分析（bullish / bearish / neutral）
- 重要新闻筛选和排序

### 经济分析 (EconomicAnalyzer)
- 经济展望判断（expansion / contraction / stable）
- 关键指标解读
- 收益率曲线状态监控
- 风险因素识别

---

## 输出示例

### Markdown 简报预览

```markdown
# 财经早报 | 2026年1月21日星期三

> **市场状态**: 🔴 避险情绪浓厚
> **整体情绪**: 📉 偏空

**关键要点：**
- 标普500 大跌 -2.06%，市场波动加剧
- 半导体板块领跌，平均跌幅 -4.32%

## 📊 市场行情

### 主要指数

| 指数 | 收盘价 | 涨跌幅 |
|------|--------|--------|
| 🔴 S&P 500 | 6796.86 | -2.06% |
| 🔴 NASDAQ | 22954.32 | -2.39% |
| 🔴 Dow Jones | 48488.59 | -1.76% |
```

### HTML 简报

精美的网页格式，支持：
- 响应式布局，适配手机和电脑
- 深色主题标题
- 数据表格和卡片
- 涨跌颜色标识

---

## 自定义配置

### 修改股票列表

编辑 `src/collectors/yahoo-finance.ts` 中的 `DEFAULT_CONFIG`：

```typescript
const DEFAULT_CONFIG: YahooFinanceConfig = {
  indices: ['^GSPC', '^DJI', '^IXIC'],  // 指数
  symbols: ['AAPL', 'MSFT', 'GOOGL'],   // 个股
};
```

### 修改经济指标

编辑 `src/collectors/fred.ts` 中的 `DEFAULT_SERIES`：

```typescript
const DEFAULT_SERIES = [
  'UNRATE',    // 失业率
  'FEDFUNDS',  // 联邦基金利率
  'DGS10',     // 10年期国债
];
```

---

## 开发

```bash
# 构建
npm run build

# 开发模式（监听文件变化）
npm run dev
```

---

## License

MIT
