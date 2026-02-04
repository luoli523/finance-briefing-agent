# 美元与利率环境 - 完整分析流程

## 🔄 数据流与LLM调用流程图

```
┌─────────────────────────────────────────────────────────────────┐
│  1. 数据收集阶段 (npm run collect)                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │  src/collectors/forex-collector.ts   │
        │                                      │
        │  📊 收集数据 (Yahoo Finance - 免费)  │
        │  • 美元指数 (DXY)                    │
        │  • 美债收益率 (3M, 2Y, 5Y, 10Y, 30Y) │
        │  • 货币对 (USDCHF, USDSGD, ...)      │
        └──────────────┬──────────────────────┘
                       ↓
        ┌──────────────────────────────────────┐
        │  保存原始数据                         │
        │  data/processed/aggregated-*.json    │
        │    └── forex: { ... }                │
        └──────────────┬───────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. 规则引擎分析 (npm run analyze)                               │
└─────────────────────────────────────────────────────────────────┘
                       ↓
        ┌──────────────────────────────────────┐
        │  src/analyzers/forex.ts              │
        │                                      │
        │  🧮 规则引擎分析                      │
        │  • 美元指数: 趋势判断 (强/中/弱)      │
        │  • 收益率曲线: 形态识别               │
        │    - 正常 (spread > 0.2%)            │
        │    - 倒挂 (spread < -0.2%)           │
        │    - 平坦/陡峭                        │
        │  • 波动性: 低/中/高                   │
        │  • 货币对: 美元强弱                   │
        └──────────────┬───────────────────────┘
                       ↓
        ┌──────────────────────────────────────┐
        │  src/analyzers/unified.ts            │
        │  整合所有分析结果                     │
        └──────────────┬───────────────────────┘
                       ↓
        ┌──────────────────────────────────────┐
        │  保存分析结果                         │
        │  data/processed/analysis-*.json      │
        │    ├── market: { ... }               │
        │    ├── news: { ... }                 │
        │    ├── economic: { ... }             │
        │    └── forex: {                      │
        │          dollarIndex: { ... },       │
        │          treasuryYields: { ... },    │
        │          currencyPairs: { ... }      │
        │        }                             │
        └──────────────┬───────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. LLM 深度分析 (npm run generate:pro, 如果 LLM_ENABLED=true)  │
└─────────────────────────────────────────────────────────────────┘
                       ↓
        ┌──────────────────────────────────────┐
        │  src/scripts/                        │
        │    generate-professional-briefing.ts │
        │                                      │
        │  📝 构建数据摘要                      │
        │  buildDataSummary(analysis)          │
        └──────────────┬───────────────────────┘
                       ↓
        ┌──────────────────────────────────────────────────┐
        │  构建 LLM 输入                                    │
        │                                                  │
        │  ## 美元与利率环境                                │
        │  ### 美元指数 (DXY)                              │
        │  - 当前点位: 104.23                              │
        │  - 涨跌: +0.45%                                  │
        │  - 趋势: strengthening (strong水平)              │
        │                                                  │
        │  ### 美债收益率                                   │
        │  - 2Y: 4.15% (+0.12%, rising)                   │
        │  - 10Y: 4.05% (+0.08%, rising)                  │
        │  - 收益率曲线: inverted                          │
        │  - 2Y-10Y利差: -0.10%                           │
        │                                                  │
        │  ### 主要货币对                                   │
        │  - USDCHF: 0.8845 (+0.32%)                      │
        │  - USDJPY: 148.25 (+0.45%)                      │
        │  ...                                            │
        │                                                  │
        │  ## 市场状态                                      │
        │  - S&P 500: +0.50%                              │
        │  - 纳斯达克: +0.43%                              │
        │  ...                                            │
        │                                                  │
        │  ## 重要新闻                                      │
        │  - 美联储官员讲话...                             │
        │  - 欧洲央行维持利率...                           │
        │  ...                                            │
        └──────────────┬───────────────────────────────────┘
                       ↓
        ┌──────────────────────────────────────────────────┐
        │  调用 LLM Provider                                │
        │  (OpenAI/Google/Anthropic/DeepSeek)              │
        │                                                  │
        │  System Prompt:                                  │
        │    prompts/professional-briefing-system.txt      │
        │    "你是资深投资分析师..."                        │
        │                                                  │
        │  User Prompt:                                    │
        │    [数据摘要] +                                   │
        │    prompts/professional-briefing-task.txt        │
        │    "请按JSON格式输出分析..."                      │
        └──────────────┬───────────────────────────────────┘
                       ↓
        ┌──────────────────────────────────────────────────┐
        │  LLM 返回 JSON                                    │
        │                                                  │
        │  {                                               │
        │    "indexAnalysis": { ... },                     │
        │    "marketMacroNews": { ... },                   │
        │    "forexAnalysis": {  ⬅️ 美元/利率分析          │
        │      "dollarIndexInsight": {                     │
        │        "trendAnalysis": "美元走强主要受...",      │
        │        "marketImpact": "对AI产业链影响...",       │
        │        "tradingGuidance": ["建议1", "建议2"]      │
        │      },                                          │
        │      "treasuryYieldAnalysis": {                  │
        │        "curveInterpretation": "倒挂解读...",     │
        │        "keyInsights": ["洞察1", "洞察2"],        │
        │        "sectorRotation": "行业轮动...",          │
        │        "riskWarning": "风险提示..."              │
        │      },                                          │
        │      "crossMarketAnalysis": {                    │
        │        "integratedView": "三市联动...",          │
        │        "dollarEquityRelationship": "..."         │
        │      },                                          │
        │      "actionableStrategy": {                     │
        │        "hedgeRecommendations": ["对冲1"],        │
        │        "opportunitySpotting": ["机会1"],         │
        │        "timingGuidance": "时机判断..."           │
        │      }                                           │
        │    },                                            │
        │    "investmentStrategy": { ... },                │
        │    "smartMoneyAnalysis": { ... }                 │
        │  }                                               │
        └──────────────┬───────────────────────────────────┘
                       ↓
        ┌──────────────────────────────────────┐
        │  保存 LLM insights                    │
        │  data/processed/                     │
        │    professional-insights-*.json      │
        └──────────────┬───────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. 简报生成                                                     │
└─────────────────────────────────────────────────────────────────┘
                       ↓
        ┌──────────────────────────────────────────────────┐
        │  src/generators/professional-briefing.ts         │
        │  ProfessionalBriefingGenerator                   │
        │                                                  │
        │  构造函数接收:                                    │
        │    • analysis: 规则引擎分析结果                   │
        │    • llmInsights: LLM深度分析结果 (可选)          │
        └──────────────┬───────────────────────────────────┘
                       ↓
        ┌──────────────────────────────────────────────────┐
        │  generateForexSection()                          │
        │                                                  │
        │  智能降级策略:                                    │
        │  ┌────────────────────────────────┐             │
        │  │ if (llmInsights.forexAnalysis) │             │
        │  │   使用 LLM 深度分析  ⭐          │             │
        │  │ else                           │             │
        │  │   回退到规则引擎分析            │             │
        │  └────────────────────────────────┘             │
        │                                                  │
        │  生成内容:                                        │
        │  • 美元指数表格 + LLM趋势分析                     │
        │  • 美债收益率表格 + LLM曲线解读                   │
        │  • 货币对表格 + LLM解读                          │
        │  • 综合评估（LLM跨市场分析 + 可操作策略）         │
        └──────────────┬───────────────────────────────────┘
                       ↓
        ┌──────────────────────────────────────┐
        │  完整简报 Markdown                    │
        │  output/ai-briefing-2026-02-02.md    │
        │                                      │
        │  一、核心股票池表现                   │
        │    ├── 主要指数                      │
        │    ├── 指数深度分析                  │
        │    ├── 💵 美元与利率环境 ⬅️         │
        │    │   ├── 美元指数 (含LLM分析)      │
        │    │   ├── 美债收益率 (含LLM分析)    │
        │    │   ├── 货币对                    │
        │    │   └── 综合评估 (LLM策略)        │
        │    ├── ETF 表现                      │
        │    └── AI 产业链股票                 │
        │                                      │
        │  二、市场宏观动态与要闻               │
        │  ...                                 │
        └──────────────────────────────────────┘
```

## 🎯 关键代码位置

### 1. 数据摘要构建
**文件**: `src/scripts/generate-professional-briefing.ts`  
**函数**: `buildDataSummary(analysis: ComprehensiveAnalysis)`  
**行号**: ~250-400

```typescript
// 添加美元与利率数据到LLM输入
if (analysis.forex) {
  summary += `## 美元与利率环境\n\n`;
  
  // 美元指数
  summary += `### 美元指数 (DXY)\n`;
  summary += `- 当前点位: ${forex.dollarIndex.current}\n`;
  summary += `- 涨跌: ${forex.dollarIndex.changePercent}%\n`;
  summary += `- 趋势: ${forex.dollarIndex.trend}\n\n`;
  
  // 美债收益率
  summary += `### 美债收益率\n`;
  for (const [period, data] of Object.entries(forex.treasuryYields.yields)) {
    summary += `- ${period}: ${data.rate}% (${data.trend})\n`;
  }
  summary += `- 收益率曲线: ${forex.treasuryYields.yieldCurve.shape}\n`;
  summary += `- 2Y-10Y利差: ${forex.treasuryYields.yieldCurve.spread2Y10Y}%\n`;
  
  // 货币对
  summary += `### 主要货币对\n`;
  for (const [pair, data] of Object.entries(forex.currencyPairs)) {
    summary += `- ${pair}: ${data.rate} (${data.changePercent}%)\n`;
  }
}
```

### 2. LLM Prompt 定义
**文件**: `prompts/professional-briefing-task.txt`  
**位置**: 在 `dailyBlessing` 之后，`smartMoneyAnalysis` 之前

```json
{
  "forexAnalysis": {
    "dollarIndexInsight": {
      "currentLevel": "强势/中性/弱势",
      "trendAnalysis": "结合新闻分析美元走势...",
      "marketImpact": "对AI产业链影响...",
      "tradingGuidance": ["建议1", "建议2"]
    },
    "treasuryYieldAnalysis": {
      "curveInterpretation": "曲线深度解读...",
      "rateEnvironment": "利率环境影响...",
      "keyInsights": ["洞察1", "洞察2"],
      "sectorRotation": "行业轮动...",
      "riskWarning": "风险提示"
    },
    "crossMarketAnalysis": {
      "equityBondCorrelation": "股债相关性",
      "dollarEquityRelationship": "美元股市关系",
      "integratedView": "三市联动"
    },
    "actionableStrategy": {
      "hedgeRecommendations": ["对冲建议"],
      "opportunitySpotting": ["投资机会"],
      "timingGuidance": "时机判断"
    }
  }
}
```

### 3. LLM 调用
**文件**: `src/scripts/generate-professional-briefing.ts`  
**行号**: ~138-198

```typescript
if (appConfig.llm.enabled) {
  const enhancer = new LLMEnhancer(appConfig.llm);
  const provider = enhancer.provider;
  
  // 调用 LLM
  const response = await provider.chat([
    { 
      role: 'system', 
      content: systemPrompt  // professional-briefing-system.txt
    },
    { 
      role: 'user', 
      content: `${dataSummary}\n\n${taskPrompt}`  // 数据+task.txt
    }
  ]);
  
  // 解析返回的JSON
  llmInsights = JSON.parse(response.content);
  
  // 保存insights
  fs.writeFileSync(
    `data/processed/professional-insights-${date}.json`,
    JSON.stringify(llmInsights, null, 2)
  );
}
```

### 4. LLM Insights 类型定义
**文件**: `src/generators/professional-briefing.ts`  
**行号**: ~27-230

```typescript
interface LLMInsights {
  indexAnalysis?: { ... };
  marketMacroNews?: { ... };
  companyDeepDive?: [ ... ];
  
  // 💵 美元与利率 LLM 分析
  forexAnalysis?: {
    dollarIndexInsight?: {
      currentLevel: string;
      trendAnalysis: string;
      marketImpact: string;
      tradingGuidance: string[];
    };
    treasuryYieldAnalysis?: {
      curveInterpretation: string;
      rateEnvironment: string;
      keyInsights: string[];
      sectorRotation: string;
      riskWarning: string;
    };
    crossMarketAnalysis?: {
      equityBondCorrelation: string;
      dollarEquityRelationship: string;
      integratedView: string;
    };
    actionableStrategy?: {
      hedgeRecommendations: string[];
      opportunitySpotting: string[];
      timingGuidance: string;
    };
  };
  
  investmentStrategy?: { ... };
  smartMoneyAnalysis?: { ... };
}
```

### 5. 简报生成（使用LLM结果）
**文件**: `src/generators/professional-briefing.ts`  
**方法**: `generateForexSection()`  
**行号**: ~446-615

```typescript
private generateForexSection(): string {
  const forexData = this.analysis.forex;      // 规则引擎结果
  const forexLLM = this.llmInsights?.forexAnalysis;  // LLM 深度分析
  
  // 美元指数
  if (forexLLM?.dollarIndexInsight) {
    // ✅ 使用 LLM 深度分析
    content += `**趋势分析**: ${forexLLM.dollarIndexInsight.trendAnalysis}\n`;
    content += `**市场影响**: ${forexLLM.dollarIndexInsight.marketImpact}\n`;
    content += `**交易指引**:\n`;
    forexLLM.dollarIndexInsight.tradingGuidance.forEach(g => {
      content += `- ${g}\n`;
    });
  } else {
    // ⚠️ 回退到规则引擎
    content += `**解读**: ${forexData.dollarIndex.interpretation}\n`;
  }
  
  // 美债收益率
  if (forexLLM?.treasuryYieldAnalysis) {
    // ✅ 使用 LLM 深度分析
    content += `**曲线深度解读**: ${forexLLM.treasuryYieldAnalysis.curveInterpretation}\n`;
    content += `**关键洞察**:\n`;
    forexLLM.treasuryYieldAnalysis.keyInsights.forEach(i => {
      content += `- ${i}\n`;
    });
    content += `**行业轮动建议**: ${forexLLM.treasuryYieldAnalysis.sectorRotation}\n`;
  } else {
    // ⚠️ 回退到规则引擎
    content += treasuryYields.yieldCurve.interpretation;
    content += treasuryYields.marketImplications;
  }
  
  // 综合评估
  if (forexLLM?.crossMarketAnalysis) {
    // ✅ 使用 LLM 跨市场分析
    content += `**三市联动**: ${forexLLM.crossMarketAnalysis.integratedView}\n`;
    content += `**股债相关性**: ${forexLLM.crossMarketAnalysis.equityBondCorrelation}\n`;
  }
  
  if (forexLLM?.actionableStrategy) {
    // ✅ 使用 LLM 策略建议
    content += `**对冲建议**:\n`;
    forexLLM.actionableStrategy.hedgeRecommendations.forEach(r => {
      content += `- ${r}\n`;
    });
  }
}
```

## 🔍 调试技巧

### 查看 LLM 输入
```bash
# 运行时会打印数据摘要
npm run generate:pro 2>&1 | grep -A 50 "美元与利率环境"
```

### 查看 LLM 输出
```bash
# 查看保存的 insights
cat data/processed/professional-insights-$(date +%Y-%m-%d).json | jq '.forexAnalysis'
```

### 查看生成的简报
```bash
# 检查美元版块内容
grep -A 100 "### 美元与利率环境" output/ai-briefing-$(date +%Y-%m-%d).md
```

### 对比分析质量
```bash
# 方式1：不启用LLM
LLM_ENABLED=false npm run generate:pro
cat output/ai-briefing-*.md | grep -A 50 "美元与利率环境" > output/forex-no-llm.txt

# 方式2：启用LLM
LLM_ENABLED=true npm run generate:pro  
cat output/ai-briefing-*.md | grep -A 50 "美元与利率环境" > output/forex-with-llm.txt

# 对比差异
diff output/forex-no-llm.txt output/forex-with-llm.txt
```

## 📊 LLM 调用统计

每次生成简报时，LLM 会处理：

| 输入部分 | Token 估算 |
|---------|-----------|
| 市场数据（指数、股票） | ~2000 |
| 新闻数据 | ~3000 |
| 经济数据 | ~1000 |
| **美元与利率数据** | **~800** |
| 智慧资金数据 | ~2000 |
| **总计输入** | **~8800** |

| 输出部分 | Token 估算 |
|---------|-----------|
| 指数分析 | ~1500 |
| 新闻分析 | ~2000 |
| 公司深度 | ~1500 |
| **美元与利率分析** | **~1200** |
| 投资策略 | ~2000 |
| 智慧资金分析 | ~1500 |
| **总计输出** | **~9700** |

**总 Token**: ~18,500  
**成本估算**: 
- Gemini 2.0 Flash: $0（免费）
- GPT-4o-mini: $0.003
- GPT-4o: $0.15
- Claude 3.5 Sonnet: $0.28

## 🎓 最佳实践

### 1. 提示词优化

如果 LLM 对美元/利率的分析不够具体，可以在 `prompts/professional-briefing-task.txt` 中增强要求：

```json
"treasuryYieldAnalysis": {
  "curveInterpretation": "必须包含：(1) 与上周利差对比 (2) 历史倒挂案例参照 (3) 当前倒挂的独特性 (4) 未来1-3个月曲线演变预测",
  "sectorRotation": "必须明确：AI产业链中哪3只应减持（具体原因+目标减仓价位），哪3只应增持（具体原因+目标建仓价位）",
  "keyInsights": "必须至少3条，每条必须包含：(1) 数据支持 (2) 逻辑推导 (3) 投资含义"
}
```

### 2. 多轮对话

如果需要更深入的分析，可以将 LLM 返回的结果作为输入，进行二次分析：

```typescript
// 第二轮：针对性深化
const secondRoundPrompt = `
基于以下美债收益率倒挂分析：
${llmInsights.forexAnalysis.treasuryYieldAnalysis.curveInterpretation}

请进一步分析：
1. 如果美联储在6月降息25bp，收益率曲线将如何变化？
2. 这种情况下，AI产业链各细分领域的相对表现如何？
3. 给出具体的仓位调整建议（哪只股票应增加多少%仓位）
`;
```

### 3. 验证 LLM 质量

检查 LLM 是否真正理解了数据：

```typescript
// 在 prompt 中添加测试问题
"treasuryYieldAnalysis": {
  // ...
  "validationCheck": "请用一句话说明：当前2Y-10Y利差是多少，是正还是负？"
}
```

如果 LLM 返回的 validationCheck 不正确，说明数据理解有问题。

## 🚀 完整示例

### 启用配置
```env
# .env
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash-exp
LLM_API_KEY=your_api_key
```

### 运行命令
```bash
npm run collect      # 收集美元/利率数据
npm run analyze      # 规则引擎分析
npm run generate:pro # LLM 深度分析 + 生成简报
```

### 查看结果
```bash
# 1. 查看 LLM insights
cat data/processed/professional-insights-2026-02-02.json | jq '.forexAnalysis'

# 2. 查看简报中的美元版块
cat output/ai-briefing-2026-02-02.md | sed -n '/### 美元与利率环境/,/### ETF 表现/p'
```

### 预期输出差异

**无 LLM**:
- 通用的经济学原理描述
- 基于阈值的机械判断
- 一般性的投资建议

**有 LLM**:
- 结合当日新闻的具体分析
- 针对 AI 产业链的细分建议
- 具体的标的、价位、时机判断
- 跨市场联动的深度洞察

## 📚 相关文档

- [`FOREX_MODULE.md`](./FOREX_MODULE.md) - 美元模块基础功能
- [`LLM_ENHANCEMENT.md`](./LLM_ENHANCEMENT.md) - LLM 配置详解
- [`PROMPT_CUSTOMIZATION.md`](./PROMPT_CUSTOMIZATION.md) - 提示词定制

---

**更新日期**: 2026-02-02  
**作者**: Finance Briefing Agent Team
