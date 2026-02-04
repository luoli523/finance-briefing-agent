# 美元与利率环境 - LLM 深度分析

## 📋 概述

美元与利率环境模块支持**双层分析架构**：
1. **规则引擎分析** - 基于经典金融理论的快速分析（默认）
2. **LLM 深度增强** - 结合实时新闻和经济数据的智能洞察（启用 LLM 时）

## 🔄 分析流程

```
数据收集 (forex-collector)
    ↓
规则引擎分析 (forex.ts)
    ↓ (如果启用 LLM)
LLM 深度分析 (professional-briefing)
    ↓
简报生成 (含 LLM insights)
```

## 🎯 LLM 增强的调用位置

### 1. 数据收集
**文件**: `src/scripts/collect.ts`
- 收集美元指数、美债收益率、货币对数据
- 保存到 `data/processed/aggregated-*.json`

### 2. 规则引擎分析
**文件**: `src/analyzers/forex.ts` + `src/analyzers/unified.ts`
- 基于数值阈值进行基础判断
- 生成收益率曲线形态、美元强弱等分析
- 保存到 `data/processed/analysis-*.json`

### 3. LLM 深度分析 🤖
**文件**: `src/scripts/generate-professional-briefing.ts`

**调用时机**: 在生成简报时，如果 `LLM_ENABLED=true`

**输入数据**:
```typescript
function buildDataSummary(analysis: ComprehensiveAnalysis) {
  // ... 市场数据、新闻数据 ...
  
  // 添加美元与利率环境数据
  if (analysis.forex) {
    summary += `## 美元与利率环境\n\n`;
    summary += `### 美元指数 (DXY)\n`;
    summary += `- 当前点位: ${forex.dollarIndex.current}\n`;
    summary += `- 趋势: ${forex.dollarIndex.trend}\n`;
    summary += `### 美债收益率\n`;
    // ... 各期限收益率 ...
    summary += `- 收益率曲线: ${forex.treasuryYields.yieldCurve.shape}\n`;
    summary += `- 2Y-10Y利差: ${forex.treasuryYields.yieldCurve.spread2Y10Y}%\n`;
  }
}
```

**LLM Prompt**: `prompts/professional-briefing-task.txt`
```json
{
  "forexAnalysis": {
    "dollarIndexInsight": {
      "trendAnalysis": "结合今日新闻分析美元走势...",
      "marketImpact": "美元强弱对AI产业链的影响...",
      "tradingGuidance": ["建议1", "建议2"]
    },
    "treasuryYieldAnalysis": {
      "curveInterpretation": "收益率曲线深度解读...",
      "rateEnvironment": "利率对不同资产的影响...",
      "keyInsights": ["洞察1", "洞察2"],
      "sectorRotation": "行业轮动建议...",
      "riskWarning": "风险提示..."
    },
    "crossMarketAnalysis": {
      "integratedView": "美元-利率-股市三者联动...",
      "equityBondCorrelation": "股债相关性...",
      "dollarEquityRelationship": "美元与科技股关系..."
    },
    "actionableStrategy": {
      "hedgeRecommendations": ["对冲建议1", "建议2"],
      "opportunitySpotting": ["投资机会1", "机会2"],
      "timingGuidance": "入场/出场时机..."
    }
  }
}
```

**输出**: LLM 返回结构化的 JSON insights

### 4. 简报生成
**文件**: `src/generators/professional-briefing.ts`

**方法**: `generateForexSection()`

**逻辑**: 优先使用 LLM insights，回退到规则引擎分析

```typescript
private generateForexSection(): string {
  const forexData = this.analysis.forex;      // 规则引擎分析结果
  const forexLLM = this.llmInsights?.forexAnalysis;  // LLM 深度分析
  
  // 优先使用 LLM 分析
  if (forexLLM?.treasuryYieldAnalysis) {
    content += forexLLM.treasuryYieldAnalysis.curveInterpretation;
    content += forexLLM.treasuryYieldAnalysis.keyInsights;
    // ...
  } else {
    // 回退到规则引擎分析
    content += forexData.treasuryYields.yieldCurve.interpretation;
    content += forexData.treasuryYields.marketImplications;
    // ...
  }
}
```

## 📊 对比：规则引擎 vs LLM 增强

### 规则引擎分析（默认）

**优点**:
- ✅ 快速响应（无需等待LLM）
- ✅ 零成本（不消耗API额度）
- ✅ 稳定可靠
- ✅ 基于经典金融理论

**示例输出**:
```markdown
**曲线解读**: 收益率曲线倒挂，这是经济衰退的经典预警信号。
历史上，倒挂后12-18个月内往往出现经济衰退。

**市场含义**:
- 📈 融资成本高企：10年期美债收益率超过4.5%，企业融资成本显著上升
- ⬆️ 利率上行压力：对高估值成长股构成压力

**投资展望**: 谨慎偏空：收益率曲线倒挂预示经济可能在未来12-18个月
内进入衰退。建议增加现金和短期国债配置。
```

### LLM 增强分析（启用后）

**优点**:
- ✅ 结合当日新闻和经济数据
- ✅ 个性化的深度洞察
- ✅ 跨市场联动分析
- ✅ 更具体的操作建议

**示例输出**:
```markdown
**曲线深度解读**: 当前2Y-10Y利差为-0.15%，虽呈倒挂但幅度温和。
结合今日公布的ISM制造业PMI仍在50以上，市场对衰退的定价可能过度。
更需关注的是美联储对通胀的容忍度——如果通胀回落速度快于预期，
曲线可能在2-3季度内重新陡峭化，届时将是布局周期股的良机。

**关键洞察**:
- 当前倒挂更多反映货币政策滞后效应，而非经济基本面恶化
- 10年期4.2%的收益率对应PEG>2的成长股已形成显著压力，需筛选现金流充裕标的
- 关注美联储6月议息会议，如果点阵图暗示年内降息，长端利率可能快速下行

**行业轮动建议**: 当前环境下，建议减持高估值、零利润的AI应用公司，
增持现金流稳定的云平台（MSFT、GOOGL）和设备龙头（AMAT、ASML）。
一旦收益率曲线开始陡峭化，立即切换至小盘成长股和周期性行业。

**三市联动**: 美元走强+利率上行+VIX低位的组合表明市场对美国经济
"一枝独秀"的定价。但这种组合历史上往往不可持续——要么美元因
经济放缓而走弱，要么VIX因流动性收紧而飙升。建议在VIX<15时买入
看涨期权作为尾部风险对冲。

**对冲建议**:
- 配置5-10% TLT（长期国债ETF）对冲利率下行风险
- 持有2-3% GLD作为美元贬值保护
- 使用USDCNH期权对冲人民币贬值风险（如有中概股敞口）

**投资机会**:
- 金融股（BAC、JPM）受益于陡峭曲线和利差扩大
- 美元走强压制黄金，但如果收益率曲线倒挂加深，黄金将成为避险首选

**时机判断**: 当10年期收益率突破4.5%或DXY突破106时，需降低风险敞口；
当2Y-10Y利差重新转正且>0.3%时，是加仓周期股和小盘股的信号。
```

## 🔧 配置方法

### 启用 LLM 增强

在 `.env` 文件中配置：

```env
# 启用 LLM
LLM_ENABLED=true

# 选择提供商（推荐）
LLM_PROVIDER=google              # 免费
LLM_MODEL=gemini-2.0-flash-exp
LLM_API_KEY=your_google_api_key

# 或者使用 OpenAI（质量最佳）
# LLM_PROVIDER=openai
# LLM_MODEL=gpt-4o
# LLM_API_KEY=sk-your-openai-key

# 调整参数
LLM_MAX_TOKENS=16384    # 足够长的输出
LLM_TIMEOUT=300000      # 5分钟超时
```

### 运行分析

```bash
# 完整流程（含LLM增强）
npm run collect      # 收集美元/利率数据
npm run analyze      # 规则引擎分析
npm run generate:pro # LLM深度分析 + 生成简报

# 或一键运行
npm run daily
```

## 📈 LLM 分析的增强点

### 1. 美元指数增强

**规则引擎**: 基于数值判断强弱
```
DXY > 105 → 强势 → 压制大宗商品
```

**LLM 增强**: 结合新闻分析原因
```
"美元走强至106主要由于欧洲能源危机加剧，资金避险回流美国。
但需注意，如果美联储在6月暗示降息，这种强势可能逆转。
对于持有NVDA等海外收入占比高的股票，需警惕汇兑损失。"
```

### 2. 收益率曲线增强

**规则引擎**: 基于利差判断形态
```
2Y-10Y < -0.2% → 倒挂 → 衰退预警
```

**LLM 增强**: 深度解读倒挂含义
```
"虽然曲线倒挂，但幅度仅-0.15%且10年期处于4.2%高位，这更多
反映短期货币政策紧缩滞后效应，而非经济硬着陆。关键观察点是
企业盈利指引——如果科技龙头Q2财报仍上调全年指引，倒挂信号
可能是假警报。建议等待6月FOMC前保持观望。"
```

### 3. 跨市场联动分析

**规则引擎**: 独立分析各市场
```
美元强势 → 大宗商品承压
利率上行 → 成长股承压
```

**LLM 增强**: 三市联动分析
```
"美元走强+10年期利率4.3%+VIX仅14的组合，反映市场定价'美国
经济强、其他地区弱'的剧本。但这种分化不可持续：要么美国经济
也放缓导致美元走弱，要么其他地区复苏导致美债资金外流、利率
上行。两种情形下AI产业链龙头（NVDA、MSFT）都将受益。"
```

### 4. 行业轮动建议

**规则引擎**: 通用建议
```
利率上行 → 关注金融股
收益率曲线倒挂 → 防御性配置
```

**LLM 增强**: 结合AI产业链
```
"当前4.2%的利率环境下，AI产业链分化加剧：
- 上游（NVDA、ASML）：现金流充裕，利率敏感度低，可继续持有
- 中游（AMD、MRVL）：需验证Q2毛利率能否维持，谨慎观望  
- 下游应用（SNOW、DDOG）：烧钱模式受融资成本压制，建议减持

如果10年期收益率回落至3.8%以下，优先买入的是云平台（MSFT、GOOGL）
和半导体设备（AMAT、LRCX），这些板块的估值弹性最大。"
```

## 🚀 使用场景

### 场景 1: 日常监控（快速模式）
```bash
# 不启用LLM，使用规则引擎
LLM_ENABLED=false
npm run daily
```
- ⏱️ 耗时: ~30秒
- 💰 成本: $0
- 📊 输出: 基础美元/利率分析

### 场景 2: 深度研究（推荐）
```bash
# 启用LLM增强
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash-exp
npm run daily
```
- ⏱️ 耗时: ~2分钟
- 💰 成本: $0（Gemini免费）或 $0.01-0.05（其他模型）
- 📊 输出: 深度美元/利率分析 + 跨市场联动 + 行业轮动

### 场景 3: 紧急决策（跳过LLM）
```bash
# 使用之前的LLM insights
npm run generate:pro --skip-llm
```
- ⏱️ 耗时: ~5秒
- 💰 成本: $0
- 📊 输出: 复用最新的LLM分析

## 📝 LLM 输出格式

LLM 会返回以下结构的 JSON：

```json
{
  "forexAnalysis": {
    "dollarIndexInsight": {
      "currentLevel": "美元指数处于强势水平",
      "trendAnalysis": "美元今日走强主要受欧洲央行鸽派立场影响，欧元兑美元跌至1.08低位。短期内，美联储相对鹰派的立场将继续支撑美元。",
      "marketImpact": "强势美元对科技股形成双重压力：一是跨国公司海外收入换算损失（NVDA、MSFT海外收入占比>50%），二是新兴市场需求疲软影响芯片出口。",
      "tradingGuidance": [
        "短期内减持海外收入占比高的半导体公司，转向纯内需的云平台",
        "关注美元指数106阻力位，突破则需进一步降低风险敞口"
      ]
    },
    
    "treasuryYieldAnalysis": {
      "curveInterpretation": "2Y-10Y利差-0.18%，倒挂幅度较上周收窄。这反映市场对美联储在年中降息的预期升温。但需注意，只要倒挂持续存在，衰退风险就未解除。历史经验表明，曲线重新陡峭化（短端快速下降）往往才是衰退真正来临的信号。",
      "rateEnvironment": "10年期4.15%的利率水平对AI产业链估值形成显著压力。按DCF模型，4.15%折现率下，PEG>2.5的成长股理论估值需下调15-20%。但如果企业能维持40%+的增长，高利率的负面影响可被消化。关键看Q2财报的指引。",
      "keyInsights": [
        "当前倒挂更多是政策预期导向，而非经济恶化信号——失业率仍在3.7%低位",
        "10年期4.15%隐含的实际利率约1.8%（扣除2.3%通胀预期），处于中性偏紧区间",
        "30年期与10年期利差仅0.15%，反映市场对长期增长前景缺乏信心"
      ],
      "sectorRotation": "建议战术性减持AI应用软件（SNOW、DDOG），增持现金流稳定的基础设施（ANET、VRT）。如果6月FOMC暗示降息路径，立即回补云平台龙头（MSFT、AMZN）。",
      "riskWarning": "如果2Y-10Y利差扩大至-0.3%以下，或3M-10Y倒挂（目前尚未），需立即提高现金比例至30%以上，并买入VIX看涨期权对冲尾部风险。"
    },
    
    "crossMarketAnalysis": {
      "equityBondCorrelation": "当前股债相关性转为正相关（过去1周相关系数+0.4），这意味着债券的对冲作用减弱。在美债收益率和股市同步上行的环境下，传统60/40股债组合的风险暴露增加，需考虑加入黄金或商品对冲。",
      "dollarEquityRelationship": "强势美元通常压制美股，但本周出现背离——DXY上涨的同时纳指也上涨0.5%。这反映科技股对美国本土AI需求的依赖度上升（OpenAI、Anthropic等需求爆发）。但如果DXY突破106，这种正相关可能断裂。",
      "integratedView": "美元强+利率高+股市涨的'三高组合'不可持续。历史上，这种组合维持时间通常不超过2-3个月。要么美联储被迫降息导致美元走弱，要么高利率抑制经济导致股市下跌。当前阶段建议控制仓位，等待三者关系重新平衡。"
    },
    
    "actionableStrategy": {
      "hedgeRecommendations": [
        "配置7-10% TLT（20年期国债ETF）对冲利率快速下行的尾部风险",
        "持有3-5% GLD作为美元贬值和地缘风险的保护",
        "使用SPY看跌价差期权（买入ATM、卖出OTM）在VIX低位时建立保护"
      ],
      "opportunitySpotting": [
        "如果USDCNH突破7.30，关注出口导向的中国科技公司（如在美上市的半导体设备商）的做空机会",
        "美元走强压制铜价，但AI数据中心建设需求强劲，可关注铜矿企业（FCX）的反转机会",
        "日本央行可能在7月退出YCC，届时USDJPY回落将利好日本半导体企业（Tokyo Electron、Advantest）"
      ],
      "timingGuidance": "关键观察点位：(1) DXY 106阻力位——突破则需减仓；(2) 10年期4.5%——突破则暂停AI股布局；(3) 2Y-10Y利差重新转正——是加仓周期股的信号。当前建议保持60-70%仓位，等待更明确的方向性突破。"
    }
  }
}
```

## 🎓 LLM 如何增强分析？

### 1. 新闻关联
**规则引擎**: 无法关联新闻
**LLM**: "美元走强主要受欧洲能源危机影响..."

### 2. 产业链视角
**规则引擎**: 通用影响分析
**LLM**: "对AI产业链分化影响：上游现金流强可抗压，下游应用承压..."

### 3. 时机判断
**规则引擎**: 静态阈值
**LLM**: "关注DXY 106阻力位、10年期4.5%关键点位，结合VIX判断..."

### 4. 具体标的
**规则引擎**: 一般性建议
**LLM**: "减持SNOW、DDOG，增持MSFT、GOOGL，理由是..."

## 💡 提示词优化建议

如需进一步增强美元分析，可编辑 `prompts/professional-briefing-task.txt`：

```json
"treasuryYieldAnalysis": {
  // 添加更具体的要求
  "curveInterpretation": "必须包含：(1)倒挂幅度变化 (2)与上周对比 (3)历史案例参照 (4)当前与历史倒挂的差异",
  "sectorRotation": "必须明确指出：哪3只AI产业链股票应减持，哪3只应增持，给出具体理由和目标价位"
}
```

## 🔍 验证 LLM 是否生效

### 检查日志
```bash
npm run generate:pro
```

查看输出：
```
🤖 运行 LLM 深度分析...
   提供商: google
   模型: gemini-2.0-flash-exp

✅ LLM 分析完成
   耗时: 45.2秒
   Token使用: 12543
💾 LLM洞察已保存: professional-insights-2026-02-02.json
```

### 检查 insights 文件
```bash
cat data/processed/professional-insights-2026-02-02.json | jq '.forexAnalysis'
```

应该能看到完整的 forexAnalysis JSON 结构。

### 检查简报内容
```bash
grep -A 20 "美元与利率环境" output/ai-briefing-2026-02-02.md
```

如果启用了LLM，你会看到更详细、更具体的分析内容。

## 📊 成本估算

| 模型 | Token使用 | 单次成本 | 月成本(30天) |
|------|-----------|---------|--------------|
| Gemini 2.0 Flash | ~12K | $0 | $0 |
| GPT-4o-mini | ~12K | $0.003 | $0.09 |
| GPT-4o | ~12K | $0.12 | $3.60 |
| Claude 3.5 Sonnet | ~12K | $0.20 | $6.00 |

**推荐**: Gemini 2.0 Flash（免费且质量优秀）

## 🎯 总结

✅ **LLM 调用位置**: `src/scripts/generate-professional-briefing.ts`  
✅ **输入构建**: `buildDataSummary()` 函数添加 forex 数据  
✅ **输出格式**: `prompts/professional-briefing-task.txt` 定义 `forexAnalysis`  
✅ **结果使用**: `src/generators/professional-briefing.ts` 的 `generateForexSection()`  
✅ **降级策略**: LLM 失败时自动回退到规则引擎分析

**无需额外配置**：只要启用 `LLM_ENABLED=true`，美元与利率环境就会自动获得 LLM 深度增强！
