/**
 * 增强版决策导向报告生成器 V2
 * 专注于深度洞察、量化建议和行动指引
 */

import { BaseGenerator } from './base';
import type { ComprehensiveAnalysis } from '../analyzers/types';

export class DecisionEnhancedV2Generator extends BaseGenerator {
  /**
   * 生成增强版决策报告
   */
  async generate(
    analysis: ComprehensiveAnalysis,
    llmInsights?: any
  ): Promise<string> {
    const date = new Date().toISOString().split('T')[0];
    
    let report = this.generateHeader(date);
    
    // 如果有 LLM 洞察，使用新结构
    if (llmInsights) {
      report += this.generateExecutiveSummary(analysis, llmInsights);
      report += this.generateInvestmentThemes(llmInsights);
      report += this.generateKeyEventsDeepDive(llmInsights);
      report += this.generateQuantitativeRecommendations(llmInsights);
      report += this.generateWeeklyActionPlan(llmInsights);
      report += this.generateRiskManagement(llmInsights);
      report += this.generateScenarioAnalysis(llmInsights);
      report += this.generateMonitoringQuestions(llmInsights);
    } else {
      // 降级到基础版本
      report += this.generateBasicReport(analysis);
    }
    
    report += this.generateFooter();
    
    return report;
  }

  /**
   * 生成报告头部
   */
  private generateHeader(date: string): string {
    return `# 📊 增强版投资决策简报
    
**报告日期**: ${date}  
**分析引擎**: 规则引擎 + AI 深度洞察  
**风格**: 保守型，注重风险控制

---

`;
  }

  /**
   * 生成执行摘要
   */
  private generateExecutiveSummary(analysis: ComprehensiveAnalysis, llmInsights: any): string {
    let section = `## 🎯 执行摘要

`;

    // 市场概况
    const quotes = [...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])];
    const spxQuote = quotes.find(q => q.symbol === '^GSPC');
    const vixQuote = quotes.find(q => q.symbol === '^VIX');
    
    if (spxQuote) {
      const emoji = spxQuote.changePercent >= 0 ? '🟢' : '🔴';
      section += `${emoji} **S&P 500**: ${spxQuote.price.toFixed(2)} (${spxQuote.changePercent >= 0 ? '+' : ''}${spxQuote.changePercent.toFixed(2)}%)  \n`;
    }
    
    if (vixQuote) {
      const emoji = vixQuote.price < 15 ? '🟢' : vixQuote.price < 20 ? '🟡' : '🔴';
      section += `${emoji} **VIX恐慌指数**: ${vixQuote.price.toFixed(2)}  \n`;
    }
    
    section += `\n`;

    // 核心投资主题
    if (llmInsights.investmentThemes?.primary) {
      const theme = llmInsights.investmentThemes.primary;
      section += `**🔥 核心投资主题**: ${theme.name}  \n`;
      section += `**主题强度**: ${'⭐'.repeat(Math.min(theme.strength || 5, 10))} (${theme.strength}/10)  \n`;
      section += `**持续时间**: ${theme.duration || '未知'}  \n\n`;
    }

    // 今日重点
    section += `**📌 今日投资重点**:\n\n`;
    
    if (llmInsights.weeklyActionPlan?.thisWeek) {
      llmInsights.weeklyActionPlan.thisWeek.slice(0, 3).forEach((item: any, i: number) => {
        section += `${i + 1}. ${item.action}\n`;
      });
    } else {
      section += `1. 关注市场整体走势\n`;
      section += `2. 持续监控重点持仓\n`;
      section += `3. 保持仓位纪律\n`;
    }
    
    section += `\n---\n\n`;
    
    return section;
  }

  /**
   * 生成投资主题分析
   */
  private generateInvestmentThemes(llmInsights: any): string {
    let section = `## 🎨 投资主题识别

`;

    const themes = llmInsights.investmentThemes;
    if (!themes) {
      section += `*暂无识别到的投资主题*\n\n---\n\n`;
      return section;
    }

    // 主要主题
    if (themes.primary) {
      const theme = themes.primary;
      section += `### 🔥 主题1: ${theme.name}\n\n`;
      section += `**主题描述**: ${theme.description}\n\n`;
      section += `**强度评分**: ${theme.strength}/10 ${'⭐'.repeat(Math.min(theme.strength || 5, 10))}\n\n`;
      section += `**持续时间**: ${theme.duration}\n\n`;
      
      if (theme.beneficiaries && theme.beneficiaries.length > 0) {
        section += `**最大受益股票**:\n\n`;
        section += `| 股票 | 受益原因 | 影响程度 |\n`;
        section += `|:----:|:---------|:--------:|\n`;
        theme.beneficiaries.forEach((b: any) => {
          const icon = b.impactLevel === '高' ? '🔥' : b.impactLevel === '中' ? '⚡' : '💡';
          section += `| **${b.symbol}** | ${b.reason} | ${icon} ${b.impactLevel} |\n`;
        });
        section += `\n`;
      }
      
      if (theme.catalysts && theme.catalysts.length > 0) {
        section += `**催化剂**:\n`;
        theme.catalysts.forEach((c: string) => section += `- ${c}\n`);
        section += `\n`;
      }
      
      if (theme.risks && theme.risks.length > 0) {
        section += `**风险因素**:\n`;
        theme.risks.forEach((r: string) => section += `- ⚠️ ${r}\n`);
        section += `\n`;
      }
    }

    // 次要主题
    if (themes.secondary) {
      const theme = themes.secondary;
      section += `### ⚡ 主题2: ${theme.name}\n\n`;
      section += `**主题描述**: ${theme.description}\n\n`;
      section += `**强度评分**: ${theme.strength}/10\n\n`;
      section += `**持续时间**: ${theme.duration}\n\n`;
      
      if (theme.beneficiaries && theme.beneficiaries.length > 0) {
        section += `**受益股票**: ${theme.beneficiaries.map((b: any) => b.symbol).join(', ')}\n\n`;
      }
    }

    section += `---\n\n`;
    return section;
  }

  /**
   * 生成关键事件深度分析
   */
  private generateKeyEventsDeepDive(llmInsights: any): string {
    let section = `## 🔍 关键事件深度解读

*对重要市场事件进行3层原因分析*

`;

    const events = llmInsights.keyEventsDeepDive;
    if (!events || events.length === 0) {
      section += `*今日无重大市场事件*\n\n---\n\n`;
      return section;
    }

    events.slice(0, 5).forEach((event: any, index: number) => {
      const importance = event.importance === '高' ? '🔴 高' : event.importance === '中' ? '🟡 中' : '🟢 低';
      
      section += `### ${index + 1}. ${event.event}\n\n`;
      section += `**重要性**: ${importance}\n\n`;
      
      // What Happened
      section += `**📋 发生了什么**:\n`;
      section += `${event.whatHappened}\n\n`;
      
      // Why It Happened (3层分析)
      section += `**🤔 为什么发生** (3层原因分析):\n\n`;
      
      if (event.whyItHappened) {
        section += `**第1层 - 直接原因**:  \n`;
        section += `${event.whyItHappened.layer1_immediate}\n\n`;
        
        section += `**第2层 - 深层原因**:  \n`;
        section += `${event.whyItHappened.layer2_underlying}\n\n`;
        
        section += `**第3层 - 结构性原因**:  \n`;
        section += `${event.whyItHappened.layer3_structural}\n\n`;
      }
      
      // What It Means
      section += `**💡 投资含义**:\n\n`;
      
      if (event.whatItMeans) {
        section += `- **短期影响** (1-4周): ${event.whatItMeans.shortTerm}\n`;
        section += `- **中期影响** (1-3月): ${event.whatItMeans.mediumTerm}\n`;
        section += `- **长期影响** (3月+): ${event.whatItMeans.longTerm}\n\n`;
      }
      
      // 受影响股票
      if (event.affectedStocks && event.affectedStocks.length > 0) {
        section += `**受影响股票**:\n\n`;
        section += `| 股票 | 影响方向 | 影响程度 |\n`;
        section += `|:----:|:--------:|:--------:|\n`;
        event.affectedStocks.forEach((stock: any) => {
          const impactIcon = stock.impact === '正面' ? '🟢 ↑' : stock.impact === '负面' ? '🔴 ↓' : '⚪ →';
          const magnitudeIcon = stock.magnitude === '大' ? '🔥🔥🔥' : stock.magnitude === '中' ? '🔥🔥' : '🔥';
          section += `| **${stock.symbol}** | ${impactIcon} ${stock.impact} | ${magnitudeIcon} |\n`;
        });
        section += `\n`;
      }
      
      // 投资启示
      if (event.investmentImplication) {
        section += `**🎯 投资启示**: ${event.investmentImplication}\n\n`;
      }
      
      section += `---\n\n`;
    });

    return section;
  }

  /**
   * 生成量化投资建议
   */
  private generateQuantitativeRecommendations(llmInsights: any): string {
    let section = `## 💎 量化投资建议

*每个推荐都有明确的买入价、目标价、止损位*

`;

    const recommendations = llmInsights.quantitativeRecommendations;
    if (!recommendations || recommendations.length === 0) {
      section += `*暂无量化投资建议*\n\n---\n\n`;
      return section;
    }

    recommendations.forEach((rec: any, index: number) => {
      // 行动标记
      const actionEmoji = {
        '买入': '🟢 ✅',
        '增持': '🟢 ⬆',
        '持有': '🟡 ⏸',
        '减持': '🟠 ⬇',
        '卖出': '🔴 ❌'
      }[rec.action] || '⚪';
      
      section += `### ${index + 1}. ${actionEmoji} ${rec.symbol} - ${rec.action}\n\n`;
      
      // 推荐理由
      section += `**📊 推荐理由**:  \n`;
      section += `${rec.reasoning}\n\n`;
      
      // 价格目标和风险收益
      if (rec.priceTargets) {
        const targets = rec.priceTargets;
        section += `**💰 价格目标与风险**:\n\n`;
        section += `| 指标 | 价格 | 说明 |\n`;
        section += `|:-----|-----:|:-----|\n`;
        section += `| 当前价 | $${targets.current?.toFixed(2) || 'N/A'} | - |\n`;
        section += `| 🟢 买入价 | $${targets.buyBelow?.toFixed(2) || 'N/A'} | 低于此价位考虑买入 |\n`;
        section += `| 🎯 目标价 | $${targets.targetPrice?.toFixed(2) || 'N/A'} | 预期达到的价格 |\n`;
        section += `| 🛑 止损价 | $${targets.stopLoss?.toFixed(2) || 'N/A'} | 跌破此价位立即止损 |\n`;
        
        if (targets.upside !== undefined && targets.downside !== undefined) {
          section += `| 📈 上涨空间 | ${targets.upside.toFixed(1)}% | 从当前价到目标价 |\n`;
          section += `| 📉 下跌风险 | ${targets.downside.toFixed(1)}% | 从当前价到止损价 |\n`;
          
          const ratio = (targets.upside / targets.downside).toFixed(2);
          section += `| ⚖️ 风险收益比 | 1:${ratio} | ${Number(ratio) > 1.5 ? '✅ 优秀' : Number(ratio) > 1 ? '🟡 合格' : '🔴 不佳'} |\n`;
        }
        
        section += `\n`;
      }
      
      // 仓位建议
      if (rec.positionSizing) {
        section += `**🎯 建议仓位**:\n`;
        section += `- 保守型: ${rec.positionSizing.conservative}\n`;
        section += `- 平衡型: ${rec.positionSizing.balanced}\n`;
        section += `- 进取型: ${rec.positionSizing.aggressive}\n\n`;
      }
      
      // 时间框架和信心度
      section += `**⏰ 持有周期**: ${rec.timeHorizon || '未指定'}  \n`;
      section += `**⭐ 风险评分**: ${rec.riskScore}/10  \n`;
      section += `**💪 信心水平**: ${rec.confidenceLevel || '中'}  \n\n`;
      
      // 催化剂时间线
      if (rec.catalystTimeline && rec.catalystTimeline.length > 0) {
        section += `**📅 关键催化剂**:\n`;
        rec.catalystTimeline.forEach((catalyst: any) => {
          section += `- ${catalyst.date}: ${catalyst.event} (预期${catalyst.expectedImpact})\n`;
        });
        section += `\n`;
      }
      
      // 退出策略
      if (rec.exitStrategy) {
        section += `**🚪 退出策略**: ${rec.exitStrategy}\n\n`;
      }
      
      section += `---\n\n`;
    });

    return section;
  }

  /**
   * 生成每周行动清单
   */
  private generateWeeklyActionPlan(llmInsights: any): string {
    let section = `## 📋 本周投资行动清单

*明确的 To-Do List，知道每天应该做什么*

`;

    const actionPlan = llmInsights.weeklyActionPlan;
    if (!actionPlan) {
      section += `*本周无特别行动计划，持续观察市场*\n\n---\n\n`;
      return section;
    }

    // 本周行动
    if (actionPlan.thisWeek && actionPlan.thisWeek.length > 0) {
      section += `### 📅 本周待办事项\n\n`;
      
      actionPlan.thisWeek.forEach((item: any, index: number) => {
        section += `#### ${index + 1}. ${item.day || `任务${index + 1}`}\n\n`;
        section += `**🎯 行动**: ${item.action}\n\n`;
        
        if (item.condition) {
          section += `**📊 条件**: ${item.condition}  \n`;
          section += `**✅ 则执行**: ${item.thenDo}  \n`;
          if (item.elseDo) {
            section += `**❌ 否则**: ${item.elseDo}  \n`;
          }
        } else if (item.targetPosition) {
          section += `**🎯 目标仓位**: ${item.targetPosition}\n`;
        }
        
        if (item.reasoning) {
          section += `**💡 理由**: ${item.reasoning}\n`;
        }
        
        section += `\n`;
      });
      
      section += `---\n\n`;
    }

    // 即将到来的催化剂
    if (actionPlan.upcomingCatalysts && actionPlan.upcomingCatalysts.length > 0) {
      section += `### 📅 关键事件日历\n\n`;
      section += `| 日期 | 事件 | 准备措施 |\n`;
      section += `|:-----|:-----|:---------|\n`;
      
      actionPlan.upcomingCatalysts.forEach((catalyst: any) => {
        section += `| ${catalyst.date} | ${catalyst.event} | ${catalyst.preparation || '-'} |\n`;
      });
      
      section += `\n---\n\n`;
    }

    return section;
  }

  /**
   * 生成风险管理
   */
  private generateRiskManagement(llmInsights: any): string {
    let section = `## ⚠️ 风险管理与对冲策略

`;

    const riskMgmt = llmInsights.riskManagement;
    if (!riskMgmt) {
      section += `*遵循基本风险管理原则：单只股票不超过15%，保持20%现金储备*\n\n---\n\n`;
      return section;
    }

    // 组合风险
    if (riskMgmt.portfolioRisks && riskMgmt.portfolioRisks.length > 0) {
      section += `**🚨 组合层面风险**:\n`;
      riskMgmt.portfolioRisks.forEach((risk: string) => section += `- ${risk}\n`);
      section += `\n`;
    }

    // 对冲策略
    if (riskMgmt.hedgingStrategies && riskMgmt.hedgingStrategies.length > 0) {
      section += `**🛡️ 对冲策略**:\n`;
      riskMgmt.hedgingStrategies.forEach((strategy: string) => section += `- ${strategy}\n`);
      section += `\n`;
    }

    // 止损水平
    if (riskMgmt.stopLossLevels) {
      section += `**🛑 止损纪律**:\n`;
      section += `- 组合层面: ${riskMgmt.stopLossLevels.portfolio || '-8%'}\n`;
      section += `- 单只股票: ${riskMgmt.stopLossLevels.individual || '-10%'}\n\n`;
    }

    // 再平衡触发条件
    if (riskMgmt.rebalancingTriggers && riskMgmt.rebalancingTriggers.length > 0) {
      section += `**🔄 再平衡触发条件**:\n`;
      riskMgmt.rebalancingTriggers.forEach((trigger: string) => section += `- ${trigger}\n`);
      section += `\n`;
    }

    section += `---\n\n`;
    return section;
  }

  /**
   * 生成情景分析
   */
  private generateScenarioAnalysis(llmInsights: any): string {
    let section = `## 🔮 情景分析与压力测试

`;

    const scenarios = llmInsights.scenarioAnalysis;
    if (!scenarios) {
      section += `*暂无情景分析*\n\n---\n\n`;
      return section;
    }

    // 乐观情景
    if (scenarios.bullCase) {
      const bull = scenarios.bullCase;
      section += `### 🟢 乐观情景 (概率: ${bull.probability}%)\n\n`;
      section += `**情景描述**: ${bull.scenario}\n\n`;
      
      if (bull.triggers && bull.triggers.length > 0) {
        section += `**触发因素**:\n`;
        bull.triggers.forEach((t: string) => section += `- ${t}\n`);
        section += `\n`;
      }
      
      if (bull.stockImpact && bull.stockImpact.length > 0) {
        section += `**股票目标价**:\n`;
        section += `| 股票 | 目标价 | 预期收益 |\n`;
        section += `|:----:|-------:|---------:|\n`;
        bull.stockImpact.forEach((stock: any) => {
          section += `| **${stock.symbol}** | $${stock.targetPrice.toFixed(2)} | +${stock.expectedReturn}% |\n`;
        });
        section += `\n`;
      }
      
      if (bull.portfolioStrategy) {
        section += `**组合策略**: ${bull.portfolioStrategy}\n\n`;
      }
    }

    // 基准情景
    if (scenarios.baseCase) {
      const base = scenarios.baseCase;
      section += `### 🟡 基准情景 (概率: ${base.probability}%)\n\n`;
      section += `**情景描述**: ${base.scenario}\n\n`;
      
      if (base.expectedReturns) {
        section += `**预期收益**:\n`;
        Object.entries(base.expectedReturns).forEach(([key, value]) => {
          section += `- ${key}: +${value}%\n`;
        });
        section += `\n`;
      }
      
      if (base.portfolioStrategy) {
        section += `**组合策略**: ${base.portfolioStrategy}\n\n`;
      }
    }

    // 悲观情景
    if (scenarios.bearCase) {
      const bear = scenarios.bearCase;
      section += `### 🔴 悲观情景 (概率: ${bear.probability}%)\n\n`;
      section += `**情景描述**: ${bear.scenario}\n\n`;
      
      if (bear.triggers && bear.triggers.length > 0) {
        section += `**触发因素**:\n`;
        bear.triggers.forEach((t: string) => section += `- ${t}\n`);
        section += `\n`;
      }
      
      if (bear.protections && bear.protections.length > 0) {
        section += `**保护措施**:\n`;
        bear.protections.forEach((p: string) => section += `- ${p}\n`);
        section += `\n`;
      }
    }

    section += `---\n\n`;
    return section;
  }

  /**
   * 生成监控问题
   */
  private generateMonitoringQuestions(llmInsights: any): string {
    let section = `## 🔍 关键问题监控清单

*持续跟踪这些问题，及时调整投资策略*

`;

    const questions = llmInsights.keyQuestionsToMonitor;
    if (!questions || questions.length === 0) {
      section += `*暂无关键监控问题*\n\n---\n\n`;
      return section;
    }

    questions.forEach((q: string, i: number) => {
      section += `${i + 1}. ${q}\n`;
    });
    
    section += `\n`;

    // 学习与复盘
    const learning = llmInsights.learningFromPastWeek;
    if (learning) {
      section += `### 📚 上周复盘与学习\n\n`;
      
      if (learning.correctCalls && learning.correctCalls.length > 0) {
        section += `**✅ 正确判断**:\n`;
        learning.correctCalls.forEach((c: string) => section += `- ${c}\n`);
        section += `\n`;
      }
      
      if (learning.mistakes && learning.mistakes.length > 0) {
        section += `**❌ 错误判断**:\n`;
        learning.mistakes.forEach((m: string) => section += `- ${m}\n`);
        section += `\n`;
      }
      
      if (learning.lessonsLearned && learning.lessonsLearned.length > 0) {
        section += `**💡 经验教训**:\n`;
        learning.lessonsLearned.forEach((l: string) => section += `- ${l}\n`);
        section += `\n`;
      }
    }

    section += `---\n\n`;
    return section;
  }

  /**
   * 降级基础报告
   */
  private generateBasicReport(analysis: ComprehensiveAnalysis): string {
    return `## 📊 市场概况

*LLM深度分析未启用，显示基础市场数据*

${this.summarizeMarket(analysis)}

---

`;
  }

  private summarizeMarket(analysis: ComprehensiveAnalysis): string {
    // 简单的市场汇总
    return `当前市场状态: ${analysis.market?.marketCondition || '未知'}

请启用 LLM 分析以获得更深入的洞察和投资建议。
`;
  }

  /**
   * 生成报告尾部
   */
  private generateFooter(): string {
    return `
---

**⚠️ 免责声明**: 本报告仅供参考，不构成投资建议。投资有风险，决策需谨慎。

**📧 反馈**: 如有任何问题或建议，欢迎反馈！

*报告生成时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}*
`;
  }
}

export const decisionEnhancedV2Generator = new DecisionEnhancedV2Generator();
