# 新闻和时政信息源实施指南

本文档详细说明如何扩展 Collectors 模块，添加 Bloomberg、Reuters、WSJ、CNBC、Financial Times、MarketWatch、公司IR、SEC/EDGAR、美国政府/监管机构等数据源。

## 📊 数据源分类和优先级

### 第一阶段：免费数据源（已实施/正在实施）✅

#### 1. SEC/EDGAR ✅ 已实现
- **状态**: 已实现 (`src/collectors/sec-edgar.ts`)
- **数据内容**: 
  - 8-K (重大事件报告)
  - 10-K (年度报告)
  - 10-Q (季度报告)
  - 4 (内部人交易)
  - S-1/S-3 (IPO/证券注册)
  - 13F (机构持仓)
- **API**: 完全免费，官方 REST API
  - Submissions API: `https://data.sec.gov/submissions/CIK{cik}.json`
  - Company Facts: `https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json`
- **限制**: 
  - 每秒最多 10 次请求
  - 必须提供 User-Agent (格式: `CompanyName email@example.com`)
- **成本**: **免费**

#### 2. 美国政府/监管机构 🚧 待实施

##### 2.1 Federal Reserve (美联储)
- **URL**: https://www.federalreserve.gov/
- **RSS Feed**: https://www.federalreserve.gov/feeds/press_all.xml
- **内容**: 货币政策声明、利率决议、FOMC 会议纪要
- **更新频率**: 每月 1-2 次
- **成本**: **免费**

##### 2.2 Federal Register (联邦公报)
- **URL**: https://www.federalregister.gov/
- **API**: https://www.federalregister.gov/developers/api/v1
- **内容**: 所有联邦机构的规则、提案、通知
- **更新频率**: 每工作日
- **成本**: **免费**

##### 2.3 Treasury Department (财政部)
- **URL**: https://home.treasury.gov/
- **RSS**: https://home.treasury.gov/rss
- **内容**: 财政政策、国债发行、制裁公告
- **更新频率**: 不定期
- **成本**: **免费**

##### 2.4 其他监管机构
- **CFTC** (商品期货交易委员会): https://www.cftc.gov/
- **FTC** (联邦贸易委员会): https://www.ftc.gov/
- **FDIC** (联邦存款保险公司): https://www.fdic.gov/
- **OCC** (货币监理署): https://www.occ.gov/

#### 3. 公司 IR/新闻稿 🚧 待实施

大多数上市公司在官网提供 Investor Relations 页面和新闻稿：

**主要科技公司 IR 页面**:
| 公司 | IR 页面 | RSS Feed |
|------|---------|----------|
| Apple | https://investor.apple.com/ | https://investor.apple.com/rss/news.xml |
| Microsoft | https://www.microsoft.com/en-us/Investor | https://www.microsoft.com/en-us/investor/rss.xml |
| Google | https://abc.xyz/investor/ | - |
| Amazon | https://ir.aboutamazon.com/ | https://press.aboutamazon.com/rss/news-releases.xml |
| Meta | https://investor.fb.com/ | https://investor.fb.com/news/rss.xml |
| Tesla | https://ir.tesla.com/ | - |
| NVIDIA | https://investor.nvidia.com/ | https://investor.nvidia.com/rss.cfm |

**实施方式**:
- RSS 订阅（如果可用）
- HTML 爬虫（需要遵守 robots.txt）
- 定期轮询（每小时或每天）

---

### 第二阶段：免费但需要注册的API

#### 4. NewsAPI.org 📰
- **URL**: https://newsapi.org/
- **内容**: 聚合全球新闻源（包括 Reuters、Bloomberg、WSJ 等）
- **免费额度**: 100 次请求/天，最多返回 100 篇文章
- **付费**: $449/月起（开发者版）
- **优点**: 一个 API 访问多个新闻源
- **成本**: **免费/付费混合**

#### 5. Alpha Vantage ✅ 已集成
- **URL**: https://www.alphavantage.co/
- **内容**: 股票数据、新闻、情绪分析
- **免费额度**: 25 次API调用/天
- **付费**: $49.99-$799.99/月
- **成本**: **免费/付费混合**

---

### 第三阶段：付费数据源（需要企业订阅）

#### 6. Reuters/LSEG News Service 💰
- **提供商**: London Stock Exchange Group (LSEG)
- **API 文档**: https://developers.lseg.com/en/product/news
- **内容**: 
  - 实时全球新闻
  - 结构化元数据
  - 多语言支持
- **优点**: 
  - 权威可靠
  - 更新快速
  - 结构化好
- **成本**: **需要联系销售** (通常 $1000+/月)
- **实施**: REST API + WebSocket

#### 7. Bloomberg Terminal API 💰💰💰
- **URL**: https://www.bloomberg.com/professional/products/data/
- **内容**: 
  - Bloomberg 独家新闻
  - 实时市场数据
  - 分析师报告
- **成本**: **$20,000+/年/用户** (Bloomberg Terminal 订阅)
- **实施**: Bloomberg API (SAPI/B-PIPE)
- **注意**: 需要 Bloomberg 终端授权

#### 8. Dow Jones DNA (WSJ/MarketWatch) 💰
- **URL**: https://www.dowjones.com/professional/dna/
- **内容**: 
  - Wall Street Journal
  - MarketWatch
  - Barron's
  - Dow Jones Newswires
- **成本**: **需要联系销售** (通常 $500-$5000+/月)
- **实施**: REST API

#### 9. Financial Times Content Platform 💰
- **URL**: https://developer.ft.com/
- **内容**: FT 新闻文章、市场数据
- **成本**: **需要申请试用和商业许可**
- **实施**: REST API

---

### 第四阶段：网页抓取方案（法律风险较高）⚠️

#### 10. CNBC/MarketWatch 网页抓取
- **方式**: Headless Browser (Puppeteer/Playwright) 或 BeautifulSoup
- **RSS**: 
  - CNBC: https://www.cnbc.com/id/100003114/device/rss/rss.html
  - MarketWatch: https://www.marketwatch.com/rss/
- **法律风险**: 
  - ⚠️ 需要遵守网站的 Terms of Service
  - ⚠️ 不能用于商业用途（通常）
  - ⚠️ 可能违反版权
- **建议**: 仅用于个人研究，或使用 RSS feed

---

## 🏗️ 实施架构

### 模块结构

```
src/collectors/
├── sec-edgar.ts           ✅ 已实现
├── government-news.ts      🚧 待实施
├── company-ir.ts          🚧 待实施
├── newsapi.ts             📋 计划中
├── reuters.ts             💰 需要付费
├── bloomberg.ts           💰 需要付费
└── rss-aggregator.ts      🚧 通用 RSS 收集器
```

### 统一数据格式

所有收集器输出统一的 `CollectedData` 格式：

```typescript
interface NewsItem {
  id: string;
  source: string;          // 'sec-edgar', 'fed', 'company-ir', etc.
  type: 'sec-filings' | 'government-news' | 'company-ir' | 'news';
  title: string;
  summary: string;
  content?: string;        // 全文（如果可用）
  url: string;
  publishedAt: Date;
  relatedSymbols?: string[];  // 相关股票代码
  tags?: string[];         // 标签 (政策, 财报, 监管, 等)
  sentiment?: 'positive' | 'negative' | 'neutral';
  metadata: {
    author?: string;
    category?: string;
    entities?: string[];   // 提到的公司/人物
    [key: string]: any;
  };
}
```

---

## 📝 使用建议

### 优先级 1: 立即实施（免费）
1. ✅ **SEC/EDGAR** - 已实现，配置即可使用
2. 🚧 **政府机构 RSS** - 实施 government-news.ts
3. 🚧 **公司 IR RSS** - 实施 company-ir.ts

### 优先级 2: 短期计划（免费/低成本）
4. **NewsAPI** - 注册免费账号
5. **通用 RSS 聚合器** - 支持任意 RSS 源

### 优先级 3: 中期计划（需要预算）
6. **Reuters API** - 评估成本和ROI
7. **Dow Jones DNA** - 如果需要 WSJ 内容

### 优先级 4: 长期计划（高成本）
8. **Bloomberg API** - 仅在有充足预算时考虑

---

## ⚖️ 法律合规要点

### ✅ 合法使用
- 官方 API (SEC, Fed, Treasury, etc.)
- 已授权的付费服务
- 公司自己发布的 IR 材料（遵守使用条款）
- RSS feeds（遵守 robots.txt 和 ToS）

### ⚠️ 需要注意
- 网页爬虫（检查 robots.txt）
- 未授权的内容转载
- 付费墙内容

### ❌ 不建议
- 绕过付费墙
- 违反 Terms of Service
- 未经授权的商业使用

---

## 🚀 快速开始

### 使用 SEC/EDGAR 收集器

```bash
# 1. 配置环境变量
echo 'SEC_USER_AGENT="YourCompany contact@yourcompany.com"' >> .env

# 2. 在配置文件中添加要监控的股票
# src/config/index.ts
export const SEC_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];

# 3. 运行收集器
npm run collect:sec
```

### 配置文件示例

```typescript
// src/config/sec-config.ts
export const SEC_CONFIG = {
  userAgent: process.env.SEC_USER_AGENT!,
  symbols: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
    'TSLA', 'NVDA', 'AMD', 'INTC'
  ],
  forms: ['8-K', '10-K', '10-Q', '4'],  // 关注的 filing 类型
  daysBack: 7,  // 回溯 7 天
};
```

---

## 📚 参考资料

### SEC/EDGAR
- 官方 API 文档: https://www.sec.gov/edgar/sec-api-documentation
- Data.SEC.gov: https://www.sec.gov/data-research/sec-markets-data/data-sec-gov
- EDGAR 搜索: https://www.sec.gov/edgar/searchedgar/companysearch.html

### 政府机构
- Federal Register API: https://www.federalregister.gov/developers/api/v1
- Fed RSS Feeds: https://www.federalreserve.gov/feeds.htm
- Treasury RSS: https://home.treasury.gov/rss

### 新闻API
- NewsAPI: https://newsapi.org/docs
- Alpha Vantage News: https://www.alphavantage.co/documentation/#news-sentiment
- LSEG News: https://developers.lseg.com/en/product/news

---

## 📞 需要帮助？

如有问题或建议，请：
1. 查看项目 README.md
2. 在 GitHub Issues 提问
3. 查阅各数据源的官方文档

---

**最后更新**: 2026-01-22
