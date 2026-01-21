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

### 数据收集

| 命令 | 说明 | API Key |
|------|------|---------|
| `npm run collect` | 运行所有收集器 | 按需 |
| `npm run collect:yahoo` | 收集美股行情数据 | 不需要 |
| `npm run collect:finnhub` | 收集财经新闻 | 需要 |
| `npm run collect:fred` | 收集宏观经济数据 | 需要 |

### 数据分析

| 命令 | 说明 |
|------|------|
| `npm run analyze` | 分析最新收集的数据 |

### 简报生成

| 命令 | 说明 |
|------|------|
| `npm run generate` | 生成 Markdown + HTML 简报 |
| `npm run generate -- --format=md` | 仅生成 Markdown |
| `npm run generate -- --format=html` | 仅生成 HTML |

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
