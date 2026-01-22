/**
 * LLM 深度分析提示词模板
 */

import { IntelligentAnalysis } from '../intelligent';

/**
 * 系统提示词
 */
export const SYSTEM_PROMPT = `你是一位资深的金融分析师和投资顾问，拥有 20+ 年的全球市场分析经验。你的专长包括：

1. **宏观经济分析**: 深刻理解全球经济周期、货币政策、财政政策对市场的影响
2. **行业深度研究**: 尤其擅长 AI、半导体、数据中心、能源等科技领域
3. **地缘政治洞察**: 能够准确评估地缘事件对资本市场的影响
4. **投资策略制定**: 提供可执行的、风险可控的投资建议

你的分析特点：
- 基于数据和事实，避免主观臆断
- 多维度交叉验证，识别关键关联
- 平衡乐观与谨慎，重视风险管理
- 提供可操作的具体建议，而非模糊概念
- 区分短期波动与长期趋势

当前日期: ${new Date().toISOString().split('T')[0]}

请基于提供的规则引擎分析结果，进行更深层次的洞察分析。`;

/**
 * 生成用户提示词
 */
export function generateAnalysisPrompt(analysis: IntelligentAnalysis): string {
  return `# 规则引擎分析结果

## 市场概览
- 市场状态: ${analysis.summary.marketCondition}
- 整体情绪: ${analysis.summary.overallSentiment}
- 市场展望: ${analysis.summary.outlook}

## 多维度分析

### 宏观经济
${JSON.stringify(analysis.dimensions.macroEconomic, null, 2)}

### 财政货币政策 (Fed)
${JSON.stringify(analysis.dimensions.monetaryPolicy, null, 2)}

### 地缘政治
${JSON.stringify(analysis.dimensions.geopolitical, null, 2)}

### 政策监管
${JSON.stringify(analysis.dimensions.regulatory, null, 2)}

## 行业深度分析

### AI 人工智能
${JSON.stringify(analysis.dimensions.sectorDeepDive.ai, null, 2)}

### 半导体
${JSON.stringify(analysis.dimensions.sectorDeepDive.semiconductor, null, 2)}

### 数据中心
${JSON.stringify(analysis.dimensions.sectorDeepDive.dataCenter, null, 2)}

### 能源
${JSON.stringify(analysis.dimensions.sectorDeepDive.energy, null, 2)}

## 跨领域关联洞察
${JSON.stringify(analysis.crossDomainInsights, null, 2)}

## 投资建议 (规则引擎)
${JSON.stringify(analysis.investmentImplications, null, 2)}

## 关键催化剂
${JSON.stringify(analysis.catalysts, null, 2)}

---

# 深度分析任务

基于以上规则引擎的分析结果，请提供更深层次的洞察和建议。请严格按照以下 JSON 格式输出：

\`\`\`json
{
  "macroEconomicInsights": {
    "summary": "宏观经济深度解读（150-200字）",
    "implications": ["影响1", "影响2", "影响3"],
    "riskFactors": ["风险因素1", "风险因素2"],
    "opportunities": ["机会1", "机会2"]
  },
  "monetaryPolicyInsights": {
    "summary": "Fed 政策深度分析（150-200字）",
    "futureExpectations": ["未来预期1", "未来预期2"],
    "marketImpact": ["市场影响1", "市场影响2"],
    "investmentStrategy": ["策略1", "策略2"]
  },
  "geopoliticalInsights": {
    "summary": "地缘政治深度解读（100-150字）",
    "keyEvents": ["关键事件1", "关键事件2"],
    "affectedSectors": ["受影响板块1", "受影响板块2"],
    "timelineAnalysis": "时间线分析（100字）"
  },
  "sectorTrendsInsights": {
    "ai": {
      "keyDrivers": ["驱动因素1", "驱动因素2", "驱动因素3"],
      "competitiveLandscape": "竞争格局分析（100-150字）",
      "futureOutlook": "未来展望（100字）",
      "investmentThesis": "投资逻辑（100-150字）"
    },
    "semiconductor": {
      "supplyDemandAnalysis": "供需分析（100-150字）",
      "cycleTiming": "周期判断（100字）",
      "keyRisks": ["风险1", "风险2"],
      "opportunities": ["机会1", "机会2"]
    },
    "dataCenter": {
      "growthDrivers": ["增长驱动1", "增长驱动2"],
      "competitiveAdvantages": "竞争优势分析（100字）",
      "infrastructureGaps": ["基础设施缺口1", "基础设施缺口2"],
      "investmentPriorities": ["投资优先级1", "投资优先级2"]
    },
    "energy": {
      "transitionAnalysis": "能源转型分析（100-150字）",
      "nuclearRenaissance": "核能复兴分析（100字）",
      "policyImpact": ["政策影响1", "政策影响2"],
      "longTermOutlook": "长期展望（100字）"
    }
  },
  "crossDomainDeepInsights": {
    "systemicConnections": ["系统性连接1", "系统性连接2", "系统性连接3"],
    "emergingNarratives": ["新兴叙事1", "新兴叙事2"],
    "contrarian": ["逆向思考1", "逆向思考2"],
    "blackSwanRisks": ["黑天鹅风险1", "黑天鹅风险2"]
  },
  "strategicRecommendations": {
    "shortTerm": ["短期建议1（1-3个月）", "短期建议2"],
    "mediumTerm": ["中期建议1（3-12个月）", "中期建议2"],
    "longTerm": ["长期建议1（1-3年）", "长期建议2"],
    "riskManagement": ["风险管理1", "风险管理2"],
    "portfolioAllocation": "投资组合配置建议（150-200字）"
  },
  "catalystTimeline": {
    "thisWeek": ["本周催化剂1", "本周催化剂2"],
    "thisMonth": ["本月催化剂1", "本月催化剂2"],
    "thisQuarter": ["本季度催化剂1", "本季度催化剂2"],
    "beyondQuarter": ["季度后催化剂1", "季度后催化剂2"]
  },
  "scenarioAnalysis": {
    "bullCase": {
      "probability": 35,
      "scenario": "牛市情景描述（100-150字）",
      "triggers": ["触发因素1", "触发因素2"],
      "targets": ["目标1", "目标2"]
    },
    "baseCase": {
      "probability": 50,
      "scenario": "基准情景描述（100-150字）",
      "expectedOutcome": "预期结果（100字）"
    },
    "bearCase": {
      "probability": 15,
      "scenario": "熊市情景描述（100-150字）",
      "triggers": ["触发因素1", "触发因素2"],
      "protections": ["保护措施1", "保护措施2"]
    }
  },
  "keyQuestionsAndActions": {
    "criticalQuestions": ["关键问题1", "关键问题2", "关键问题3"],
    "actionItems": ["行动项1", "行动项2", "行动项3"],
    "monitoringMetrics": ["监控指标1", "监控指标2", "监控指标3"]
  }
}
\`\`\`

重要提示：
1. 所有分析必须基于提供的数据，不要凭空臆测
2. 突出实用性，提供可执行的具体建议
3. 三个情景的概率之和必须为 100
4. 保持客观中立，平衡乐观与谨慎
5. 重点关注 AI、半导体、数据中心、能源这四大行业
6. 输出必须是有效的 JSON 格式，不要包含其他文本`;
}

/**
 * 简化版提示词（更快，成本更低）
 */
export function generateSimplifiedPrompt(analysis: IntelligentAnalysis): string {
  return `基于以下市场分析结果，提供 3-5 个最重要的深度洞察和投资建议：

市场状态: ${analysis.summary.marketCondition}
整体情绪: ${analysis.summary.overallSentiment}

关键要点:
${analysis.summary.keyPoints.join('\n')}

风险关注:
${analysis.summary.risksAndConcerns.join('\n')}

请以 JSON 格式输出：
{
  "keyInsights": ["洞察1", "洞察2", "洞察3"],
  "actionableAdvice": ["建议1", "建议2", "建议3"]
}`;
}
