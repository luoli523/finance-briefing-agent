# Collectors 数据收集总览

**更新时间**: 2026-01-22  
**版本**: v2.1.0

---

## 📊 系统架构概览

Finance Briefing Agent 采用**多源数据收集架构**，通过 5 个核心 Collectors 收集全面的金融市场信息：

```
┌──────────────────────────────────────────────────────────────┐
│                   Finance Briefing Agent                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Market     │  │    News      │  │   Economic   │      │
│  │   Data       │  │    Data      │  │     Data     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │              │
│         ├─────────┬───────┴──────┬───────────┘              │
│         │         │              │                          │
│    ┌────▼───┐ ┌──▼────┐  ┌──────▼──────┐  ┌─────────┐     │
│    │ Yahoo  │ │Finnhub│  │    FRED     │  │   SEC   │     │
│    │Finance │ │ News  │  │  Economic   │  │ EDGAR   │     │
│    └────────┘ └───────┘  └─────────────┘  └─────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           History Manager (历史数据管理)              │  │
│  │    - 保存每日收盘数据                                  │  │
│  │    - 90天历史记录                                      │  │
│  │    - 多周期对比（日/周/月）                            │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Yahoo Finance Collector

**文件**: `src/collectors/yahoo-finance.ts`  
**状态**: ✅ 完全实现  
**API**: Yahoo Finance API (通过 `yahoo-finance2` 库)  
**免费**: ✅ 是（无需 API Key）

### 📈 收集的数据类型

#### A. **股票/指数实时报价数据**
收集 **51 只标的**（来自中央配置 `src/config/index.ts`）：
- **6 个指数**: ^GSPC, ^DJI, ^IXIC, ^RUT, ^VIX, ^SPX
- **45 只股票**: 分布在 8 个行业（ETF、科技、半导体、存储、数据中心、能源、金融、其他）

#### B. **每只标的的详细信息**
- **基本信息**:
  - 股票代码 (symbol)
  - 公司名称 (name)
  - 当前价格 (price)
  - 货币单位 (currency)

- **价格变动**:
  - 价格变动量 (change)
  - 价格变动百分比 (changePercent)
  - 前收盘价 (previousClose)

- **交易数据**:
  - 成交量 (volume)
  - 平均成交量 (avgVolume)
  - 开盘价 (open)
  - 今日最高价 (dayHigh)
  - 今日最低价 (dayLow)

- **市场指标**:
  - 市值 (marketCap)
  - 市盈率 (peRatio)
  - 52 周最高价 (fiftyTwoWeekHigh)
  - 52 周最低价 (fiftyTwoWeekLow)

#### C. **市场总览**
- **指数数据**: 主要指数的实时数据
- **涨幅榜**: 前 5 名涨幅最大的股票
- **跌幅榜**: 前 5 名跌幅最大的股票
- **成交活跃**: 成交量最大的股票

### 🔧 配置选项
```typescript
{
  enabled: true,        // 是否启用
  saveRaw: true,        // 是否保存原始数据
  timeout: 30000,       // 超时时间（毫秒）
  retries: 3,           // 重试次数
  indices: [...],       // 指数列表（从中央配置自动获取）
  symbols: [...],       // 股票列表（从中央配置自动获取）
}
```

### 📁 数据保存
- **原始数据**: `data/raw/yahoo-finance-{timestamp}.json`
- **处理数据**: `data/processed/yahoo-finance-{timestamp}.json`
- **历史数据**: 自动保存到 `data/history/market-history.json`（通过 History Manager）

### 🚀 使用命令
```bash
npm run collect:yahoo
```

---

## 2️⃣ Finnhub News Collector

**文件**: `src/collectors/finnhub.ts`  
**状态**: ✅ 完全实现  
**API**: Finnhub API  
**免费**: ⚠️ 需要 API Key（免费层可用）

### 📰 收集的数据类型

#### A. **财经新闻**
- **新闻标题** (headline)
- **新闻摘要** (summary)
- **新闻来源** (source)
- **发布时间** (publishedAt)
- **新闻链接** (url)
- **相关股票** (related)
- **新闻分类** (category)
- **配图** (image)

#### B. **新闻分类**
支持多种新闻类型：
- `general` - 综合财经新闻（默认）
- `forex` - 外汇市场新闻
- `crypto` - 加密货币新闻
- `merger` - 并购新闻

### 🔧 配置选项
```typescript
{
  enabled: true,
  saveRaw: true,
  timeout: 30000,
  retries: 3,
  apiKey: 'YOUR_FINNHUB_API_KEY',  // 必需
  category: 'general',              // 新闻分类
}
```

### 🔑 API Key 配置
在 `.env` 文件中配置：
```bash
FINNHUB_API_KEY=your_api_key_here
```

### 📁 数据保存
- **原始数据**: `data/raw/finnhub-{timestamp}.json`
- **处理数据**: `data/processed/finnhub-{timestamp}.json`

### 🚀 使用命令
```bash
npm run collect:finnhub
```

### 📊 数据来源
- API: `https://finnhub.io/api/v1/news`
- 文档: https://finnhub.io/docs/api/market-news

---

## 3️⃣ FRED Economic Data Collector

**文件**: `src/collectors/fred.ts`  
**状态**: ✅ 完全实现  
**API**: Federal Reserve Economic Data (FRED) API  
**免费**: ⚠️ 需要 API Key（完全免费）

### 📉 收集的数据类型

#### A. **经济增长指标**
- **GDP** - 实际国内生产总值
- **GDPC1** - 实际 GDP（链式美元）

#### B. **通货膨胀指标**
- **CPIAUCSL** - 消费者价格指数（所有项目）
- **CPILFESL** - 核心 CPI（不含食品和能源）
- **PCEPI** - 个人消费支出价格指数

#### C. **就业指标**
- **UNRATE** - 失业率
- **PAYEMS** - 非农就业人数
- **ICSA** - 首次申请失业救济人数

#### D. **利率指标**
- **FEDFUNDS** - 联邦基金利率
- **DGS10** - 10 年期国债收益率
- **DGS2** - 2 年期国债收益率
- **T10Y2Y** - 10 年期与 2 年期国债利差（收益率曲线）

#### E. **其他重要指标**
- **DCOILWTICO** - WTI 原油价格
- **DEXCHUS** - 美元/人民币汇率
- **VIXCLS** - VIX 恐慌指数
- **M2SL** - M2 货币供应量

### 📊 每个指标包含的信息
- **系列 ID** (seriesId)
- **名称** (name)
- **最新值** (value)
- **上一期值** (previousValue)
- **变化量** (change)
- **变化百分比** (changePercent)
- **数据日期** (date)
- **单位** (unit)
- **分类** (category): growth, inflation, employment, rates, commodity, money, market

### 🔧 配置选项
```typescript
{
  enabled: true,
  saveRaw: true,
  timeout: 30000,
  retries: 3,
  apiKey: 'YOUR_FRED_API_KEY',  // 必需
  series: DEFAULT_SERIES,        // 要收集的经济指标列表
}
```

### 🔑 API Key 配置
在 `.env` 文件中配置：
```bash
FRED_API_KEY=your_api_key_here
```

免费申请地址: https://fred.stlouisfed.org/docs/api/api_key.html

### 📁 数据保存
- **原始数据**: `data/raw/fred-{timestamp}.json`
- **处理数据**: `data/processed/fred-{timestamp}.json`

### 🚀 使用命令
```bash
npm run collect:fred
```

### 📊 数据来源
- API: `https://api.stlouisfed.org/fred`
- 官网: https://fred.stlouisfed.org/
- 数据提供: 美国联邦储备银行圣路易斯分行

---

## 4️⃣ SEC EDGAR Collector

**文件**: `src/collectors/sec-edgar.ts`  
**状态**: ✅ 完全实现  
**API**: SEC EDGAR API (data.sec.gov)  
**免费**: ✅ 是（需要声明 User-Agent）

### 📄 收集的数据类型

#### A. **公司财报和监管文件**
收集**所有监控股票**的重要文件（自动排除指数）：

##### 主要 Filing 类型
- **8-K** - 重大事件公告
  - 并购重组
  - 高管变动
  - 财务状况变化
  - 重大合同签订
  
- **10-K** - 年度报告
  - 完整的年度财务报表
  - 业务概况
  - 风险因素
  - MD&A（管理层讨论与分析）

- **10-Q** - 季度报告
  - 季度财务报表
  - 季度业务更新

- **4** - 内部人交易报告
  - 高管和董事的股票买卖
  - 期权行权

- **S-1/S-3** - 注册声明
  - IPO 或增发注册
  - 股票发行计划

- **13F** - 机构持仓报告
  - 大型机构的持仓情况

#### B. **每个 Filing 包含的信息**
- **文件编号** (accessionNumber)
- **文件类型** (form): 8-K, 10-K, 10-Q 等
- **提交日期** (filingDate)
- **报告期** (reportDate)
- **公司 CIK** (cik)
- **公司股票代码** (ticker)
- **文件大小** (size)
- **主要文档** (primaryDocument)
- **文档描述** (primaryDocDescription)
- **是否为 XBRL 格式** (isXBRL)

#### C. **数据收集范围**
- **默认回溯期**: 最近 7 天的文件
- **股票数量**: 45 只（自动从中央配置获取，排除指数）
- **自动 CIK 映射**: 股票代码 → SEC CIK 自动转换

### 🔧 配置选项
```typescript
{
  enabled: true,
  saveRaw: true,
  timeout: 30000,
  retries: 3,
  userAgent: 'YourAppName contact@example.com',  // 必需
  symbols: [...],       // 股票列表（从中央配置自动获取）
  forms: ['8-K', '10-K', '10-Q', '4'],  // 要收集的文件类型
  daysBack: 7,          // 回溯天数
}
```

### 🔑 User-Agent 配置
SEC 要求所有 API 请求必须包含 User-Agent，在 `.env` 文件中配置：
```bash
SEC_USER_AGENT="FinanceBriefingAgent/1.0 (contact@example.com)"
```

### 📁 数据保存
- **原始数据**: `data/raw/sec-edgar-{timestamp}.json`
- **处理数据**: `data/processed/sec-edgar-{timestamp}.json`

### 🚀 使用命令
```bash
npm run collect:sec
```

### 📊 数据来源
- API: `https://data.sec.gov`
- 官网: https://www.sec.gov/edgar/searchedgar/companysearch.html
- 数据提供: 美国证券交易委员会（SEC）

---

## 5️⃣ History Manager

**文件**: `src/collectors/history.ts`  
**状态**: ✅ 完全实现  
**类型**: 历史数据管理系统（不是独立的 Collector）

### 💾 管理的数据

#### A. **每日市场快照**
- 所有 51 只标的的每日收盘数据
- 包含：价格、涨跌、涨跌幅、成交量、市值、52 周高低

#### B. **历史记录保留**
- **保存期限**: 最近 90 天
- **自动清理**: 超过 90 天的数据自动删除
- **数据格式**: JSON

#### C. **提供的功能**
- 保存每日报价数据
- 加载历史记录
- 查询特定日期的数据
- 获取近期数据（N 天）
- 获取单只股票的历史数据
- **多周期对比**:
  - 日对比（与前一个交易日）
  - 周对比（与 7 天前）
  - 月对比（与 30 天前）

### 📁 数据保存
- **历史文件**: `data/history/market-history.json`

### 🔄 自动集成
History Manager 已自动集成到 Yahoo Finance Collector 中，每次收集数据后自动保存历史记录。

---

## 📊 数据收集总览

### 汇总表

| Collector | 数据类型 | 数量/频率 | API Key | 状态 |
|-----------|----------|-----------|---------|------|
| **Yahoo Finance** | 股票/指数报价 | 51 只标的 | ❌ 不需要 | ✅ 完全实现 |
| **Finnhub** | 财经新闻 | 实时新闻流 | ✅ 需要（免费） | ✅ 完全实现 |
| **FRED** | 经济指标 | 17+ 关键指标 | ✅ 需要（免费） | ✅ 完全实现 |
| **SEC EDGAR** | 公司文件 | 45 只股票 | ❌ 不需要* | ✅ 完全实现 |
| **History Manager** | 历史数据 | 90 天记录 | ❌ 不需要 | ✅ 完全实现 |

\* *需要声明 User-Agent*

---

## 🎯 收集的信息分类

### 1. **市场数据** (Yahoo Finance)
- ✅ 实时价格和涨跌幅
- ✅ 成交量和市值
- ✅ 52 周高低
- ✅ 市盈率等估值指标
- ✅ 指数表现
- ✅ 涨跌幅排行

### 2. **新闻资讯** (Finnhub)
- ✅ 实时财经新闻
- ✅ 新闻标题和摘要
- ✅ 相关股票标注
- ✅ 多源新闻聚合

### 3. **宏观经济** (FRED)
- ✅ GDP 和经济增长
- ✅ 通货膨胀（CPI, PCE）
- ✅ 就业数据（失业率、非农）
- ✅ 利率和收益率曲线
- ✅ 商品价格（原油）
- ✅ 汇率和货币供应

### 4. **公司监管** (SEC)
- ✅ 年度/季度财报
- ✅ 重大事件公告
- ✅ 内部人交易
- ✅ 机构持仓
- ✅ IPO/增发注册

### 5. **历史对比** (History Manager)
- ✅ 每日历史记录
- ✅ 日/周/月对比
- ✅ 长期趋势分析
- ✅ 52 周高低追踪

---

## 🚀 统一收集命令

### 单独收集
```bash
# 市场数据
npm run collect:yahoo

# 新闻数据
npm run collect:finnhub

# 经济数据
npm run collect:fred

# SEC 文件
npm run collect:sec
```

### 全量收集
```bash
# 一次性收集所有数据源
npm run collect
```

---

## ⚙️ 配置管理

### 1. **中央配置** (`src/config/index.ts`)
所有 **51 只监控标的** 都在这里集中管理：
- 6 个指数
- 45 只股票（分 8 个行业）

**修改股票列表**只需编辑此文件，所有 Collectors 自动生效！

### 2. **环境变量** (`.env`)
API Keys 和配置：
```bash
# Finnhub
FINNHUB_API_KEY=your_key

# FRED
FRED_API_KEY=your_key

# SEC
SEC_USER_AGENT="YourApp/1.0 (email@example.com)"

# Alpha Vantage (备用)
ALPHA_VANTAGE_API_KEY=your_key
```

### 3. **验证配置**
```bash
# 验证配置系统完整性
npm run verify:config
```

---

## 📁 数据文件结构

```
data/
├── raw/                          # 原始 API 响应
│   ├── yahoo-finance-*.json
│   ├── finnhub-*.json
│   ├── fred-*.json
│   └── sec-edgar-*.json
│
├── processed/                    # 处理后的数据
│   ├── yahoo-finance-*.json
│   ├── finnhub-*.json
│   ├── fred-*.json
│   ├── sec-edgar-*.json
│   ├── aggregated-*.json        # 聚合数据
│   └── analysis-*.json          # 分析结果
│
└── history/                      # 历史数据
    └── market-history.json      # 90 天市场历史
```

---

## 🔮 即将支持的数据源

根据 `docs/NEWS_SOURCES_IMPLEMENTATION.md` 的计划，即将实现：

### Phase 1: 免费/官方渠道（优先）
- ⏳ **美联储 RSS** - 政策声明和讲话
- ⏳ **Federal Register API** - 政府公告
- ⏳ **Treasury 新闻** - 财政部公告
- ⏳ **公司 IR** - 51 只股票的投资者关系页面

### Phase 2: 新闻聚合服务
- ⏳ **NewsAPI** - 多源新闻聚合（免费层）

### Phase 3: 付费数据源（根据需求）
- ⏳ Reuters / Bloomberg Terminal
- ⏳ WSJ / MarketWatch API

---

## 📚 相关文档

- [配置管理指南](./SYMBOLS_CONFIGURATION.md)
- [新闻源实施计划](./NEWS_SOURCES_IMPLEMENTATION.md)
- [快速开始指南](./NEWS_SOURCES_QUICKSTART.md)
- [完整测试报告](./CONFIG_TEST_REPORT.md)
- [使用手册](../README.md)

---

## 🎊 总结

Finance Briefing Agent 当前通过 **4 个核心 Collectors + 1 个历史管理器** 收集全面的金融市场信息：

✅ **51 只标的** 的实时市场数据  
✅ **实时财经新闻** 和市场动态  
✅ **17+ 关键宏观经济指标**  
✅ **45 只股票** 的 SEC 监管文件  
✅ **90 天历史数据** 和多周期对比  

**覆盖面**: 市场 + 新闻 + 经济 + 监管 + 历史  
**数据源**: 100% 官方/权威来源  
**成本**: 仅需 2 个免费 API Key（Finnhub + FRED）  
**维护**: 集中配置，自动同步  

🚀 **系统已就绪，可投入生产使用！**
