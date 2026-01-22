import { IntelligentAnalysis } from '../analyzers/intelligent';
import { BaseGenerator } from './base';
import { GeneratedBriefing, BriefingSection, GeneratorConfig, OutputFormat } from './types';
import { historyManager } from '../collectors/history';

/**
 * 智能 Markdown 简报生成器
 * 生成包含多维度深度分析的简报
 */
export class IntelligentMarkdownGenerator extends BaseGenerator {
  readonly name = 'intelligent-markdown-generator';
  readonly format: OutputFormat = 'markdown';

  constructor(config: GeneratorConfig = {}) {
    super({ ...config, format: 'markdown' });
  }

  /**
   * 生成智能 Markdown 格式简报
   */
  async generate(analysis: IntelligentAnalysis): Promise<GeneratedBriefing> {
    this.log('Generating intelligent markdown briefing...');

    const sections: BriefingSection[] = [];
    let order = 0;

    // 标题
    const title = this.generateTitle();

    // 综合摘要
    sections.push({
      id: 'summary',
      title: '📋 今日要点',
      content: this.generateSummarySection(analysis),
      order: order++,
    });

    // 多维度分析
    sections.push({
      id: 'dimensions',
      title: '🧠 多维度分析',
      content: this.generateDimensionsSection(analysis),
      order: order++,
    });

    // 行业深度分析
    sections.push({
      id: 'sector-deep-dive',
      title: '🏭 重点行业深度分析',
      content: this.generateSectorDeepDiveSection(analysis),
      order: order++,
    });

    // 全部持仓明细（按行业分类）
    if (analysis.market && analysis.market.sectors.length > 0) {
      sections.push({
        id: 'all-stocks',
        title: '📊 全部持仓明细（按行业分类）',
        content: await this.generateAllStocksSection(analysis.market),
        order: order++,
      });
    }

    // 涨跌榜
    if (analysis.market) {
      sections.push({
        id: 'movers',
        title: '📈 涨跌榜 Top 5',
        content: this.generateMoversSection(analysis.market),
        order: order++,
      });
    }

    // 跨领域关联洞察
    sections.push({
      id: 'cross-domain',
      title: '🔗 跨领域关联洞察',
      content: this.generateCrossDomainSection(analysis),
      order: order++,
    });

    // 投资建议
    sections.push({
      id: 'investment',
      title: '💡 投资建议',
      content: this.generateInvestmentSection(analysis),
      order: order++,
    });

    // 关键催化剂
    sections.push({
      id: 'catalysts',
      title: '🎯 关键催化剂',
      content: this.generateCatalystsSection(analysis),
      order: order++,
    });

    // 新闻要闻
    if (analysis.news) {
      sections.push({
        id: 'news',
        title: '📰 新闻要闻',
        content: this.generateNewsSection(analysis.news),
        order: order++,
      });
    }

    // 经济数据
    if (analysis.economic) {
      sections.push({
        id: 'economic',
        title: '🏦 经济数据详情',
        content: this.generateEconomicSection(analysis.economic),
        order: order++,
      });
    }

    // 风险提示
    if (analysis.summary.risksAndConcerns.length > 0) {
      sections.push({
        id: 'risks',
        title: '⚠️ 风险关注',
        content: this.generateRisksSection(analysis),
        order: order++,
      });
    }

    // 免责声明
    if (this.config.includeDisclaimer) {
      sections.push({
        id: 'disclaimer',
        title: '📝 免责声明',
        content: this.generateDisclaimer(),
        order: order++,
      });
    }

    // 组装完整内容
    const content = this.assembleContent(title, sections);

    const briefing: GeneratedBriefing = {
      title,
      date: new Date(),
      format: this.format,
      template: 'daily',
      sections,
      content,
      metadata: {
        generatedAt: new Date(),
        dataTimestamp: analysis.timestamp,
        wordCount: content.length,
        sectionCount: sections.length,
      },
    };

    this.log('Intelligent markdown briefing generated');
    return briefing;
  }

  /**
   * 生成标题
   */
  private generateTitle(): string {
    const date = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
    return `# 📈 智能财经简报 - ${date}\n\n`;
  }

  /**
   * 生成综合摘要部分
   */
  private generateSummarySection(analysis: IntelligentAnalysis): string {
    let content = '';

    content += `**市场状态**: ${this.translateMarketCondition(analysis.summary.marketCondition)}\n\n`;
    content += `**整体情绪**: ${this.translateSentiment(analysis.summary.overallSentiment)}\n\n`;

    if (analysis.summary.keyPoints.length > 0) {
      content += '### 关键要点\n\n';
      analysis.summary.keyPoints.forEach((point, i) => {
        content += `${i + 1}. ${point}\n`;
      });
      content += '\n';
    }

    content += `### 市场展望\n\n${analysis.summary.outlook}\n\n`;

    return content;
  }

  /**
   * 生成多维度分析部分
   */
  private generateDimensionsSection(analysis: IntelligentAnalysis): string {
    let content = '';

    // 宏观经济
    content += '## 🌍 宏观经济\n\n';
    content += `**概述**: ${analysis.dimensions.macroEconomic.overview}\n\n`;
    content += `**情绪**: ${this.translateSentiment(analysis.dimensions.macroEconomic.sentiment)}\n\n`;
    content += `- **GDP趋势**: ${analysis.dimensions.macroEconomic.gdpTrend}\n`;
    content += `- **通胀展望**: ${analysis.dimensions.macroEconomic.inflationOutlook}\n`;
    content += `- **就业健康度**: ${analysis.dimensions.macroEconomic.employmentHealth}\n\n`;
    content += `**市场影响**: ${analysis.dimensions.macroEconomic.impact}\n\n`;

    // 财政货币政策
    content += '## 🏦 财政货币政策 (Fed)\n\n';
    content += `**概述**: ${analysis.dimensions.monetaryPolicy.overview}\n\n`;
    content += `**立场**: ${this.translateFedStance(analysis.dimensions.monetaryPolicy.fedStance)}\n\n`;
    content += `**情绪**: ${this.translateSentiment(analysis.dimensions.monetaryPolicy.sentiment)}\n\n`;
    content += `- **利率预期**: ${analysis.dimensions.monetaryPolicy.rateExpectation}\n`;
    content += `- **收益率曲线**: ${analysis.dimensions.monetaryPolicy.yieldCurve}\n\n`;

    if (analysis.dimensions.monetaryPolicy.recentAnnouncements.length > 0) {
      content += '**最近公告**:\n\n';
      analysis.dimensions.monetaryPolicy.recentAnnouncements.slice(0, 3).forEach((announcement, i) => {
        content += `${i + 1}. ${announcement}\n`;
      });
      content += '\n';
    }

    content += `**市场影响**: ${analysis.dimensions.monetaryPolicy.impact}\n\n`;

    // 地缘政治
    content += '## 🌐 地缘政治\n\n';
    content += `**概述**: ${analysis.dimensions.geopolitical.overview}\n\n`;
    content += `**风险等级**: ${this.translateRiskLevel(analysis.dimensions.geopolitical.riskLevel)}\n\n`;

    if (analysis.dimensions.geopolitical.majorEvents.length > 0) {
      content += '**重大事件**:\n\n';
      analysis.dimensions.geopolitical.majorEvents.slice(0, 3).forEach((event, i) => {
        content += `${i + 1}. ${event}\n`;
      });
      content += '\n';
    }

    if (analysis.dimensions.geopolitical.affectedSectors.length > 0) {
      content += `**受影响板块**: ${analysis.dimensions.geopolitical.affectedSectors.join('、')}\n\n`;
    }

    content += `**市场影响**: ${analysis.dimensions.geopolitical.impact}\n\n`;

    // 政策监管
    content += '## ⚖️ 政策监管\n\n';
    content += `**概述**: ${analysis.dimensions.regulatory.overview}\n\n`;

    if (analysis.dimensions.regulatory.secActions.length > 0) {
      content += '**SEC 动态**:\n\n';
      analysis.dimensions.regulatory.secActions.slice(0, 3).forEach((action, i) => {
        content += `${i + 1}. ${action}\n`;
      });
      content += '\n';
    }

    if (analysis.dimensions.regulatory.policyChanges.length > 0) {
      content += '**政策变化**:\n\n';
      analysis.dimensions.regulatory.policyChanges.slice(0, 3).forEach((change, i) => {
        content += `${i + 1}. ${change}\n`;
      });
      content += '\n';
    }

    content += `**市场影响**: ${analysis.dimensions.regulatory.impact}\n\n`;

    return content;
  }

  /**
   * 生成行业深度分析部分
   */
  private generateSectorDeepDiveSection(analysis: IntelligentAnalysis): string {
    let content = '';

    // AI
    content += '## 🤖 AI 人工智能\n\n';
    content += `**概述**: ${analysis.dimensions.sectorDeepDive.ai.overview}\n\n`;
    content += `**情绪**: ${this.translateSentiment(analysis.dimensions.sectorDeepDive.ai.sentiment)}\n\n`;

    if (analysis.dimensions.sectorDeepDive.ai.keyDevelopments.length > 0) {
      content += '**关键进展**:\n\n';
      analysis.dimensions.sectorDeepDive.ai.keyDevelopments.slice(0, 3).forEach((dev, i) => {
        content += `${i + 1}. ${dev}\n`;
      });
      content += '\n';
    }

    if (analysis.dimensions.sectorDeepDive.ai.leadingStocks.length > 0) {
      content += `**领先股票**: ${analysis.dimensions.sectorDeepDive.ai.leadingStocks.join(', ')}\n\n`;
    }

    content += `**展望**: ${analysis.dimensions.sectorDeepDive.ai.outlook}\n\n`;
    content += `**投资建议**: ${analysis.dimensions.sectorDeepDive.ai.investmentImplication}\n\n`;

    // 半导体
    content += '## 💾 半导体\n\n';
    content += `**概述**: ${analysis.dimensions.sectorDeepDive.semiconductor.overview}\n\n`;
    content += `**情绪**: ${this.translateSentiment(analysis.dimensions.sectorDeepDive.semiconductor.sentiment)}\n\n`;
    content += `- **供应链状态**: ${analysis.dimensions.sectorDeepDive.semiconductor.supplyChainStatus}\n`;
    content += `- **需求趋势**: ${analysis.dimensions.sectorDeepDive.semiconductor.demandTrend}\n\n`;

    if (analysis.dimensions.sectorDeepDive.semiconductor.keyPlayers.length > 0) {
      content += `**关键玩家**: ${analysis.dimensions.sectorDeepDive.semiconductor.keyPlayers.join(', ')}\n\n`;
    }

    content += `**展望**: ${analysis.dimensions.sectorDeepDive.semiconductor.outlook}\n\n`;
    content += `**投资建议**: ${analysis.dimensions.sectorDeepDive.semiconductor.investmentImplication}\n\n`;

    // 数据中心
    content += '## 🏢 数据中心\n\n';
    content += `**概述**: ${analysis.dimensions.sectorDeepDive.dataCenter.overview}\n\n`;
    content += `**情绪**: ${this.translateSentiment(analysis.dimensions.sectorDeepDive.dataCenter.sentiment)}\n\n`;
    content += `- **产能扩张**: ${analysis.dimensions.sectorDeepDive.dataCenter.capacityExpansion}\n`;
    content += `- **电力需求**: ${analysis.dimensions.sectorDeepDive.dataCenter.powerDemand}\n\n`;

    if (analysis.dimensions.sectorDeepDive.dataCenter.keyStocks.length > 0) {
      content += `**关键标的**: ${analysis.dimensions.sectorDeepDive.dataCenter.keyStocks.join(', ')}\n\n`;
    }

    content += `**展望**: ${analysis.dimensions.sectorDeepDive.dataCenter.outlook}\n\n`;
    content += `**投资建议**: ${analysis.dimensions.sectorDeepDive.dataCenter.investmentImplication}\n\n`;

    // 能源
    content += '## ⚡ 能源\n\n';
    content += `**概述**: ${analysis.dimensions.sectorDeepDive.energy.overview}\n\n`;
    content += `**情绪**: ${this.translateSentiment(analysis.dimensions.sectorDeepDive.energy.sentiment)}\n\n`;
    content += `- **传统能源**: ${analysis.dimensions.sectorDeepDive.energy.traditionalEnergy}\n`;
    content += `- **可再生能源**: ${analysis.dimensions.sectorDeepDive.energy.renewableEnergy}\n`;
    content += `- **核能复兴**: ${analysis.dimensions.sectorDeepDive.energy.nuclearRenaissance}\n\n`;

    if (analysis.dimensions.sectorDeepDive.energy.keyStocks.length > 0) {
      content += `**关键标的**: ${analysis.dimensions.sectorDeepDive.energy.keyStocks.join(', ')}\n\n`;
    }

    content += `**展望**: ${analysis.dimensions.sectorDeepDive.energy.outlook}\n\n`;
    content += `**投资建议**: ${analysis.dimensions.sectorDeepDive.energy.investmentImplication}\n\n`;

    return content;
  }

  /**
   * 生成全部持仓明细部分（复用原有逻辑）
   */
  private async generateAllStocksSection(market: any): Promise<string> {
    let content = '';

    // 获取历史数据用于对比
    const weekAgoData = await historyManager.getWeekAgoData();
    const monthAgoData = await historyManager.getMonthAgoData();

    // 添加对比日期说明
    if (weekAgoData || monthAgoData) {
      content += '> ';
      if (weekAgoData) {
        content += `周对比基准: ${weekAgoData.date}`;
      }
      if (monthAgoData) {
        if (weekAgoData) content += ' | ';
        content += `月对比基准: ${monthAgoData.date}`;
      }
      content += '\n\n';
    }

    // 遍历所有板块
    for (const sector of market.sectors) {
      content += `### ${sector.name}\n\n`;
      content += `**板块表现**: ${sector.performance > 0 ? '+' : ''}${sector.performance.toFixed(2)}%\n\n`;

      // 表格头
      content += '| 代码 | 名称 | 价格 | 日涨跌 | 周涨跌 | 月涨跌 | 52周高 | 52周低 |\n';
      content += '|------|------|------|--------|--------|--------|--------|--------|\n';

      // 表格内容
      for (const stock of sector.stocks) {
        const weekChange = await this.getHistoricalChange(stock.symbol, weekAgoData);
        const monthChange = await this.getHistoricalChange(stock.symbol, monthAgoData);

        content += `| ${stock.symbol} | ${stock.name} | $${stock.price.toFixed(2)} | `;
        content += `${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}% | `;
        content += `${weekChange} | ${monthChange} | `;
        content += `${stock.fiftyTwoWeekHigh ? '$' + stock.fiftyTwoWeekHigh.toFixed(2) : 'N/A'} | `;
        content += `${stock.fiftyTwoWeekLow ? '$' + stock.fiftyTwoWeekLow.toFixed(2) : 'N/A'} |\n`;
      }

      content += '\n';
    }

    return content;
  }

  /**
   * 获取历史涨跌幅
   */
  private async getHistoricalChange(symbol: string, historicalData: any): Promise<string> {
    if (!historicalData) return 'N/A';

    const historicalQuote = historicalData.quotes.find((q: any) => q.symbol === symbol);
    if (!historicalQuote) return 'N/A';

    // 这里需要当前价格来计算，简化处理
    return 'N/A'; // 实际应该从当前数据中获取价格并计算
  }

  /**
   * 生成涨跌榜部分
   */
  private generateMoversSection(market: any): string {
    let content = '';

    content += '### 📈 涨幅榜\n\n';
    content += '| 代码 | 名称 | 价格 | 涨跌幅 |\n';
    content += '|------|------|------|--------|\n';

    market.topGainers.slice(0, 5).forEach((stock: any) => {
      content += `| ${stock.symbol} | ${stock.name} | $${stock.price.toFixed(2)} | `;
      content += `+${stock.changePercent.toFixed(2)}% |\n`;
    });

    content += '\n### 📉 跌幅榜\n\n';
    content += '| 代码 | 名称 | 价格 | 涨跌幅 |\n';
    content += '|------|------|------|--------|\n';

    market.topLosers.slice(0, 5).forEach((stock: any) => {
      content += `| ${stock.symbol} | ${stock.name} | $${stock.price.toFixed(2)} | `;
      content += `${stock.changePercent.toFixed(2)}% |\n`;
    });

    content += '\n';
    return content;
  }

  /**
   * 生成跨领域关联洞察部分
   */
  private generateCrossDomainSection(analysis: IntelligentAnalysis): string {
    let content = '';

    if (analysis.crossDomainInsights.keyConnections.length > 0) {
      content += '### 🔗 关键关联\n\n';
      analysis.crossDomainInsights.keyConnections.forEach((connection, i) => {
        content += `${i + 1}. ${connection}\n`;
      });
      content += '\n';
    }

    if (analysis.crossDomainInsights.emergingTrends.length > 0) {
      content += '### 📈 新兴趋势\n\n';
      analysis.crossDomainInsights.emergingTrends.forEach((trend, i) => {
        content += `${i + 1}. ${trend}\n`;
      });
      content += '\n';
    }

    if (analysis.crossDomainInsights.hiddenRisks.length > 0) {
      content += '### ⚠️ 隐藏风险\n\n';
      analysis.crossDomainInsights.hiddenRisks.forEach((risk, i) => {
        content += `${i + 1}. ${risk}\n`;
      });
      content += '\n';
    }

    return content;
  }

  /**
   * 生成投资建议部分
   */
  private generateInvestmentSection(analysis: IntelligentAnalysis): string {
    let content = '';

    if (analysis.investmentImplications.opportunities.length > 0) {
      content += '### ✅ 投资机会\n\n';
      analysis.investmentImplications.opportunities.forEach((opp, i) => {
        content += `${i + 1}. ${opp}\n`;
      });
      content += '\n';
    }

    if (analysis.investmentImplications.risks.length > 0) {
      content += '### ⚠️ 投资风险\n\n';
      analysis.investmentImplications.risks.forEach((risk, i) => {
        content += `${i + 1}. ${risk}\n`;
      });
      content += '\n';
    }

    if (analysis.investmentImplications.sectorRotation.length > 0) {
      content += '### 🔄 板块轮动建议\n\n';
      analysis.investmentImplications.sectorRotation.forEach((rotation, i) => {
        content += `${i + 1}. ${rotation}\n`;
      });
      content += '\n';
    }

    if (analysis.investmentImplications.timingConsiderations.length > 0) {
      content += '### ⏰ 时机考量\n\n';
      analysis.investmentImplications.timingConsiderations.forEach((timing, i) => {
        content += `${i + 1}. ${timing}\n`;
      });
      content += '\n';
    }

    return content;
  }

  /**
   * 生成关键催化剂部分
   */
  private generateCatalystsSection(analysis: IntelligentAnalysis): string {
    let content = '';

    if (analysis.catalysts.upcoming.length > 0) {
      content += '### 📅 即将到来\n\n';
      analysis.catalysts.upcoming.forEach((catalyst, i) => {
        content += `${i + 1}. ${catalyst}\n`;
      });
      content += '\n';
    }

    if (analysis.catalysts.monitoring.length > 0) {
      content += '### 👀 持续监控\n\n';
      analysis.catalysts.monitoring.forEach((item, i) => {
        content += `${i + 1}. ${item}\n`;
      });
      content += '\n';
    }

    return content;
  }

  /**
   * 生成新闻部分
   */
  private generateNewsSection(news: any): string {
    let content = '';

    if (news.keyHeadlines && news.keyHeadlines.length > 0) {
      content += '### 重要新闻\n\n';
      news.keyHeadlines.slice(0, 5).forEach((item: any, i: number) => {
        const importance = item.importance === 'high' ? '🔴' : item.importance === 'medium' ? '🟡' : '⚪';
        content += `${i + 1}. ${importance} **${item.headline}**\n`;
        content += `   - 来源: ${item.source}\n`;
        content += `   - 情绪: ${this.translateSentiment(item.sentiment)}\n\n`;
      });
    }

    return content;
  }

  /**
   * 生成经济数据部分
   */
  private generateEconomicSection(economic: any): string {
    let content = '';

    content += '### 关键指标\n\n';
    content += '| 指标 | 当前值 | 变化 | 趋势 | 解读 |\n';
    content += '|------|--------|------|------|------|\n';

    economic.keyIndicators.slice(0, 5).forEach((indicator: any) => {
      const trendIcon = indicator.trend === 'up' ? '📈' : indicator.trend === 'down' ? '📉' : '➡️';
      content += `| ${indicator.name} | ${indicator.value.toFixed(2)} | `;
      content += `${indicator.change ? (indicator.change > 0 ? '+' : '') + indicator.change.toFixed(2) : 'N/A'} | `;
      content += `${trendIcon} | ${indicator.interpretation} |\n`;
    });

    content += '\n';
    return content;
  }

  /**
   * 生成风险提示部分
   */
  private generateRisksSection(analysis: IntelligentAnalysis): string {
    let content = '';

    analysis.summary.risksAndConcerns.forEach((risk, i) => {
      content += `${i + 1}. ${risk}\n`;
    });

    content += '\n';
    return content;
  }

  /**
   * 生成免责声明
   */
  private generateDisclaimer(): string {
    return `本简报仅供参考，不构成投资建议。投资有风险，入市需谨慎。\n\n`;
  }

  /**
   * 组装完整内容
   */
  private assembleContent(title: string, sections: BriefingSection[]): string {
    let content = title;

    const sortedSections = sections.sort((a, b) => a.order - b.order);

    sortedSections.forEach(section => {
      content += `## ${section.title}\n\n`;
      content += section.content;
      content += '\n---\n\n';
    });

    return content;
  }

  // ==================== 辅助方法 ====================

  private translateMarketCondition(condition: string): string {
    const map: Record<string, string> = {
      'risk-on': '风险偏好 🟢',
      'risk-off': '风险规避 🔴',
      'mixed': '震荡整理 🟡',
    };
    return map[condition] || condition;
  }

  private translateSentiment(sentiment: string): string {
    const map: Record<string, string> = {
      'bullish': '看涨 🐂',
      'bearish': '看跌 🐻',
      'neutral': '中性 ⚖️',
    };
    return map[sentiment] || sentiment;
  }

  private translateFedStance(stance: string): string {
    const map: Record<string, string> = {
      'hawkish': '鹰派（紧缩）🦅',
      'dovish': '鸽派（宽松）🕊️',
      'neutral': '中性 ⚖️',
    };
    return map[stance] || stance;
  }

  private translateRiskLevel(level: string): string {
    const map: Record<string, string> = {
      'high': '高 🔴',
      'medium': '中 🟡',
      'low': '低 🟢',
    };
    return map[level] || level;
  }
}

/**
 * 创建智能 Markdown 生成器实例
 */
export function createIntelligentMarkdownGenerator(config?: GeneratorConfig): IntelligentMarkdownGenerator {
  return new IntelligentMarkdownGenerator(config);
}
