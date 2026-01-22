# 股票监控列表配置指南

## 🎯 集中配置管理

本项目使用**集中配置管理**，所有监控的股票和指数都在 **一个地方** 定义。

**配置文件位置**: `src/config/index.ts`

**优点**:
- ✅ 只需修改一个文件，所有收集器自动生效
- ✅ 避免重复定义和不一致
- ✅ 便于维护和更新
- ✅ 清晰的分类组织

---

## 📝 如何修改监控列表

### 方式一：修改中央配置（推荐）⭐

**文件**: `src/config/index.ts`

**位置**: `MONITORED_SYMBOLS` 对象

```typescript
export const MONITORED_SYMBOLS = {
  // 主要指数 (6)
  indices: [
    '^GSPC',   // S&P 500
    '^DJI',    // Dow Jones Industrial Average
    '^IXIC',   // NASDAQ Composite
    '^RUT',    // Russell 2000
    '^VIX',    // CBOE Volatility Index
    '^SPX',    // S&P 500 Index
  ],

  // ETF (6)
  etf: [
    'SPY',     // SPDR S&P 500 ETF
    'QQQ',     // Invesco QQQ (NASDAQ 100)
    'VOO',     // Vanguard S&P 500 ETF
    'SOXX',    // iShares Semiconductor ETF
    'SMH',     // VanEck Semiconductor ETF
    'GLD',     // SPDR Gold Trust
  ],

  // 科技巨头 (7)
  techGiants: [
    'AAPL',    // Apple Inc.
    'MSFT',    // Microsoft Corporation
    'GOOGL',   // Alphabet Inc.
    'AMZN',    // Amazon.com, Inc.
    'META',    // Meta Platforms, Inc.
    'TSLA',    // Tesla, Inc.
    'ORCL',    // Oracle Corporation
  ],

  // ... 其他分类
};
```

### 添加新股票

只需在相应的分类中添加股票代码：

```typescript
// 例如：添加新的半导体公司
semiconductor: [
  'NVDA',
  'AMD',
  // ... 现有股票
  'MCHP',    // 🆕 新增：Microchip Technology
],
```

### 删除股票

直接从列表中删除即可：

```typescript
techGiants: [
  'AAPL',
  // 'ORCL',  // ❌ 删除：不再监控 Oracle
  'MSFT',
],
```

### 修改股票

替换股票代码：

```typescript
energy: [
  'OKLO',
  'FSLR',    // ✏️ 修改：用 First Solar 替代 BE
  'RKLB',
],
```

---

## 🔧 生效范围

修改 `MONITORED_SYMBOLS` 后，以下收集器会自动使用新配置：

### ✅ Yahoo Finance (`collect:yahoo`)
- 收集所有指数和股票的行情
- 使用: `getAllMonitoredSymbols()`

### ✅ SEC/EDGAR (`collect:sec`)
- 收集所有股票（不包括指数）的 filings
- 使用: `getStockSymbols()`

### ✅ 分析器 (`analyze`)
- 所有分析模块使用同样的股票列表
- 包括：板块分析、涨跌榜、历史数据对比

### ✅ 报告生成器 (`generate`)
- Markdown 和 HTML 报告自动更新
- 显示所有监控的股票和指数

---

## 🛠️ 辅助函数

配置文件提供了三个辅助函数：

### 1. `getAllMonitoredSymbols()`
返回所有监控的股票和指数（51个）

**用途**: Yahoo Finance 收集器

```typescript
const allSymbols = getAllMonitoredSymbols();
// ['GSPC', '^DJI', ..., 'AAPL', 'MSFT', ..., 'PLTR']
```

### 2. `getStockSymbols()`
返回所有股票（不包括指数，45个）

**用途**: SEC/EDGAR 收集器、公司 IR 收集器

```typescript
const stocks = getStockSymbols();
// ['SPY', 'QQQ', ..., 'AAPL', 'MSFT', ..., 'PLTR']
```

### 3. `getIndexSymbols()`
返回所有指数（6个）

**用途**: 特殊的指数分析

```typescript
const indices = getIndexSymbols();
// ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX', '^SPX']
```

---

## 🔄 更新流程

### 步骤1: 修改配置

编辑 `src/config/index.ts` 的 `MONITORED_SYMBOLS`

```bash
# 使用任何编辑器打开
code src/config/index.ts
# 或
vim src/config/index.ts
```

### 步骤2: 重新编译（如果使用编译版本）

```bash
npm run build
```

### 步骤3: 运行收集器

```bash
# 收集所有数据（会自动使用新配置）
npm run collect

# 或单独运行
npm run collect:yahoo
npm run collect:sec
```

### 步骤4: 生成报告

```bash
npm run analyze && npm run generate
```

---

## ⚙️ 环境变量覆盖（可选）

虽然有中央配置，但仍然可以通过环境变量**临时覆盖**：

### Yahoo Finance

```env
# 不推荐：会覆盖中央配置
YAHOO_SYMBOLS=AAPL,MSFT,GOOGL
```

### SEC/EDGAR

```env
# 不推荐：会覆盖中央配置
SEC_SYMBOLS=AAPL,MSFT,GOOGL
```

**⚠️ 注意**: 不推荐使用环境变量覆盖，因为会导致不同收集器使用不同的列表。

**推荐做法**: 永远只修改 `src/config/index.ts`

---

## 📊 当前配置统计

截至最新版本，监控列表包括：

| 分类 | 数量 | 示例 |
|------|------|------|
| 主要指数 | 6 | ^GSPC, ^DJI, ^IXIC |
| ETF | 6 | SPY, QQQ, SOXX |
| 科技巨头 | 7 | AAPL, MSFT, GOOGL |
| 半导体 | 13 | NVDA, AMD, INTC |
| 存储 | 5 | WDC, STX, PSTG |
| 数据中心 | 4 | ANET, VST, CEG |
| 能源 | 3 | OKLO, BE, RKLB |
| 金融 | 2 | BRK-B, JPM |
| 其他 | 5 | V, LMND, LLY, CRWV, PLTR |
| **总计** | **51** | |

---

## 💡 最佳实践

### ✅ 推荐做法

1. **始终在中央配置修改** - 确保所有收集器一致
2. **按行业分类** - 便于管理和分析
3. **添加注释** - 说明公司名称和业务
4. **测试后提交** - 修改后运行一次收集确认
5. **记录变更** - 在 commit message 中说明变更原因

### ❌ 不推荐做法

1. 在多个文件中重复定义
2. 使用环境变量长期覆盖
3. 在收集器代码中硬编码
4. 不同收集器使用不同列表

---

## 🔍 示例：添加新行业

假设要添加"医疗科技"行业：

```typescript
export const MONITORED_SYMBOLS = {
  // ... 现有分类

  // 医疗科技 (3) 🆕 新增行业
  healthTech: [
    'ISRG',    // Intuitive Surgical
    'VEEV',    // Veeva Systems
    'TDOC',    // Teladoc Health
  ],

  // ... 其他分类
};
```

然后更新辅助函数：

```typescript
export function getStockSymbols(): string[] {
  return [
    ...MONITORED_SYMBOLS.etf,
    ...MONITORED_SYMBOLS.techGiants,
    ...MONITORED_SYMBOLS.semiconductor,
    ...MONITORED_SYMBOLS.storage,
    ...MONITORED_SYMBOLS.dataCenter,
    ...MONITORED_SYMBOLS.energy,
    ...MONITORED_SYMBOLS.finance,
    ...MONITORED_SYMBOLS.healthTech,  // 🆕 添加新行业
    ...MONITORED_SYMBOLS.others,
  ];
}
```

---

## 📚 相关文档

- **项目README**: [../README.md](../README.md)
- **新闻源实施指南**: [NEWS_SOURCES_IMPLEMENTATION.md](./NEWS_SOURCES_IMPLEMENTATION.md)
- **配置文件**: [../src/config/index.ts](../src/config/index.ts)

---

## 🤝 贡献

如果您发现好的投资标的，欢迎提交 PR 添加到监控列表！

**PR 标题格式**: `feat: 添加 [公司名] ([股票代码]) 到 [行业] 监控列表`

**示例**: `feat: 添加 MCHP (Microchip Technology) 到半导体监控列表`

---

**最后更新**: 2026-01-22
**当前版本**: 51 只标的（6 指数 + 45 股票）
