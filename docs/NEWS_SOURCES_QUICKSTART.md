# 新闻源扩展 - 快速开始指南

## 🎯 已实现功能

### ✅ SEC/EDGAR 收集器

**状态**: 已完成并可用

**功能**:
- 自动收集公司的 SEC filings
- 支持多种filing类型: 8-K, 10-K, 10-Q, 4, S-1, S-3, 13F
- 按股票代码筛选
- 时间范围过滤（默认过去7天）
- 符合SEC请求频率限制

**使用方法**:

```bash
# 1. 配置环境变量（在 .env 文件中）
SEC_USER_AGENT="YourCompany contact@yourcompany.com"

# 2. 运行 SEC 收集器
npm run collect:sec

# 3. 查看收集的数据
ls data/processed/sec-*
```

**配置选项**:

```env
# 必填: User-Agent (SEC要求)
SEC_USER_AGENT=FinanceBriefingAgent contact@example.com

# 可选: 监控的股票（逗号分隔）
SEC_SYMBOLS=AAPL,MSFT,GOOGL,AMZN,NVDA

# 可选: Filing类型（逗号分隔）
SEC_FORMS=8-K,10-K,10-Q,4

# 可选: 回溯天数
SEC_DAYS_BACK=7
```

**输出示例**:

```
============================================================
Finance Briefing Agent - SEC EDGAR Collector
============================================================

📊 Configuration:
   - Symbols: 16 companies
   - Forms: 8-K, 10-K, 10-Q, 4, S-1
   - Days back: 7
   - User-Agent: FinanceBriefingAgent contact@example.com

✓ AAPL (Apple Inc.): found 2 filings
✓ MSFT (Microsoft Corporation): found 1 filings
✓ GOOGL (Alphabet Inc.): found 0 filings
...

============================================================
📋 Collection Summary
============================================================
  ✅ Total filings: 15

📊 Filings by Type:
   8-K      8 filings
   10-Q     4 filings
   10-K     2 filings
   4        1 filings

📌 Recent Filings:

   1. Apple Inc. (AAPL)
      Form: 8-K | Date: 2026-01-21
      重大事件报告 (Current Report) - Items: 2.02
      https://www.sec.gov/Archives/edgar/data/...
```

---

## 📋 下一步实施计划

### 🚧 第二阶段: 政府机构新闻

**优先级**: 高（免费且权威）

**要实施的来源**:
1. Federal Reserve (美联储)
   - RSS: `https://www.federalreserve.gov/feeds/press_all.xml`
   - 内容: FOMC 会议纪要、利率决议

2. Federal Register (联邦公报)
   - API: `https://www.federalregister.gov/api/v1/`
   - 内容: 所有联邦机构规则和提案

3. Treasury Department (财政部)
   - RSS: `https://home.treasury.gov/rss`
   - 内容: 财政政策、国债发行

4. 其他监管机构 (CFTC, FTC, FDIC, OCC)

**实施文件**: `src/collectors/government-news.ts`

**预计工作量**: 2-3天

---

### 🚧 第三阶段: 公司 IR/新闻稿

**优先级**: 中（免费但需要维护）

**实施方式**:
- RSS 订阅（优先）
- HTML 网页爬虫（备用）

**要监控的公司**:
- 所有 51 只监控股票的 IR 页面
- 特别关注: AAPL, MSFT, GOOGL, AMZN, META, TSLA, NVDA

**实施文件**: `src/collectors/company-ir.ts`

**预计工作量**: 3-5天（需要处理各公司不同的网页结构）

---

### 📋 第四阶段: NewsAPI 集成

**优先级**: 中（免费额度有限）

**API**: https://newsapi.org/

**免费额度**: 100 请求/天

**优点**:
- 一个 API 访问多个新闻源
- 支持 Reuters, Bloomberg, WSJ 等（部分内容）
- 结构化数据

**实施文件**: `src/collectors/newsapi.ts`

**预计工作量**: 1-2天

---

### 💰 第五阶段: 付费数据源（可选）

**仅在有预算时考虑**:

1. **Reuters/LSEG News Service**
   - 成本: $1000+/月
   - 优点: 权威可靠、实时更新

2. **Dow Jones DNA** (WSJ/MarketWatch)
   - 成本: $500-$5000+/月
   - 优点: WSJ 独家内容

3. **Bloomberg Terminal API**
   - 成本: $20,000+/年
   - 优点: Bloomberg 独家分析

---

## 🛠️ 代码架构

### 当前结构

```
src/collectors/
├── base.ts                  # 基类
├── types.ts                 # 类型定义 ✅ 已更新
├── index.ts                 # 统一导出 ✅ 已更新
├── yahoo-finance.ts         # Yahoo Finance
├── finnhub.ts              # Finnhub 新闻
├── fred.ts                 # FRED 经济数据
├── history.ts              # 历史数据管理
├── sec-edgar.ts            # SEC/EDGAR ✅ 新增
└── [待添加]
    ├── government-news.ts  # 政府机构新闻
    ├── company-ir.ts       # 公司 IR/新闻稿
    ├── newsapi.ts          # NewsAPI 集成
    └── rss-aggregator.ts   # 通用 RSS 收集器
```

### 统一数据格式

所有收集器都输出 `CollectedData` 格式：

```typescript
interface CollectedData {
  source: string;              // 'sec-edgar', 'fed', 'company-ir'
  type: DataType;              // 'sec-filings', 'government-news', 'company-ir'
  collectedAt: Date;
  items: DataItem[];           // 标准化的数据项
}

interface DataItem {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  metadata: {
    url: string;
    source: string;
    relatedSymbols?: string[];
    tags?: string[];
    ...
  };
}
```

---

## 📊 数据流程

### 当前工作流

```
1. 收集 (collect)
   ├─ Yahoo Finance (市场数据)
   ├─ Finnhub (财经新闻)
   ├─ FRED (经济数据)
   └─ SEC/EDGAR (公司filings) ✅ 新增

2. 聚合
   └─ aggregated-YYYY-MM-DD.json

3. 分析 (analyze)
   ├─ 市场分析
   ├─ 新闻分析
   └─ 经济分析

4. 生成 (generate)
   ├─ Markdown 报告
   └─ HTML 报告
```

### 扩展后的工作流

```
1. 收集 (collect)
   ├─ Yahoo Finance (市场数据)
   ├─ Finnhub (财经新闻)
   ├─ FRED (经济数据)
   ├─ SEC/EDGAR (公司filings) ✅
   ├─ Government News (政府机构) 🚧
   ├─ Company IR (公司新闻稿) 🚧
   └─ NewsAPI (聚合新闻) 📋

2. 聚合和去重
   └─ 合并所有来源，去除重复

3. 分析 (analyze)
   ├─ 市场分析
   ├─ 新闻分析 (增强版)
   │   ├─ 政策影响分析
   │   ├─ 公司事件追踪
   │   └─ 监管动态
   └─ 经济分析

4. 生成 (generate)
   ├─ Markdown 报告 (新增板块)
   │   ├─ 重大公司事件 (SEC)
   │   ├─ 政策动态 (Gov)
   │   └─ 公司公告 (IR)
   └─ HTML 报告 (同步更新)
```

---

## ⚡ 快速测试

### 测试 SEC 收集器

```bash
# 1. 确保环境变量已配置
cat .env | grep SEC_USER_AGENT

# 2. 运行收集器
npm run collect:sec

# 3. 检查输出
ls -lh data/processed/sec-*

# 4. 查看数据
cat data/processed/sec-*.json | jq '.'
```

### 验证数据

```bash
# 统计收集的 filings 数量
cat data/processed/sec-*.json | jq '.items | length'

# 查看最新的 filing
cat data/processed/sec-*.json | jq '.items[0]'

# 按公司分组统计
cat data/processed/sec-*.json | jq '[.items[].metadata.symbol] | group_by(.) | map({symbol: .[0], count: length})'
```

---

## 📚 参考文档

- **完整实施指南**: [NEWS_SOURCES_IMPLEMENTATION.md](./NEWS_SOURCES_IMPLEMENTATION.md)
- **SEC API 官方文档**: https://www.sec.gov/edgar/sec-api-documentation
- **项目 README**: [../README.md](../README.md)

---

## 🤝 贡献指南

如果您想帮助实施其他数据源：

1. 查看 `NEWS_SOURCES_IMPLEMENTATION.md` 了解详细需求
2. 选择一个数据源（优先级高的）
3. 参考 `sec-edgar.ts` 的实现模式
4. 提交 Pull Request

---

**最后更新**: 2026-01-22
