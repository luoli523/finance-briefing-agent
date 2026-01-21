import { ComprehensiveAnalysis, MarketAnalysis, NewsAnalysis, EconomicAnalysis } from '../analyzers/types';
import { BaseGenerator } from './base';
import { GeneratedBriefing, BriefingSection, GeneratorConfig, OutputFormat } from './types';

/**
 * Markdown 简报生成器
 */
export class MarkdownGenerator extends BaseGenerator {
  readonly name = 'markdown-generator';
  readonly format: OutputFormat = 'markdown';

  constructor(config: GeneratorConfig = {}) {
    super({ ...config, format: 'markdown' });
  }

  /**
   * 生成 Markdown 格式简报
   */
  async generate(analysis: ComprehensiveAnalysis): Promise<GeneratedBriefing> {
    this.log('Generating markdown briefing...');

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

    // 市场分析
    if (analysis.market) {
      sections.push({
        id: 'market',
        title: '📊 市场行情',
        content: this.generateMarketSection(analysis.market),
        order: order++,
      });
    }

    // 板块分析
    if (analysis.market && analysis.market.sectors.length > 0) {
      sections.push({
        id: 'sectors',
        title: '🏭 板块表现',
        content: this.generateSectorsSection(analysis.market),
        order: order++,
      });
    }

    // 涨跌榜
    if (analysis.market) {
      sections.push({
        id: 'movers',
        title: '📈 涨跌榜',
        content: this.generateMoversSection(analysis.market),
        order: order++,
      });
    }

    // 新闻分析
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
        title: '🏦 经济数据',
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
      format: 'markdown',
      template: this.config.template || 'daily',
      sections,
      content,
      metadata: {
        generatedAt: new Date(),
        dataTimestamp: analysis.timestamp,
        wordCount: this.countWords(content),
        sectionCount: sections.length,
      },
    };

    this.log(`Generated briefing with ${sections.length} sections, ${briefing.metadata.wordCount} words`);
    return briefing;
  }

  /**
   * 生成标题
   */
  private generateTitle(): string {
    const date = this.formatDate(new Date());
    return `财经早报 | ${date}`;
  }

  /**
   * 生成综合摘要
   */
  private generateSummarySection(analysis: ComprehensiveAnalysis): string {
    const { summary } = analysis;
    const lines: string[] = [];

    // 市场状态
    const conditionText = {
      'risk-on': '风险偏好上升',
      'risk-off': '避险情绪浓厚',
      'mixed': '市场情绪分化',
    }[summary.marketCondition];

    const sentimentText = {
      'bullish': '偏多',
      'bearish': '偏空',
      'neutral': '中性',
    }[summary.overallSentiment];

    lines.push(`> **市场状态**: ${this.getConditionEmoji(summary.marketCondition)} ${conditionText}`);
    lines.push(`> **整体情绪**: ${this.getSentimentEmoji(summary.overallSentiment)} ${sentimentText}`);
    lines.push('');

    // 关键要点
    if (summary.keyPoints.length > 0) {
      lines.push('**关键要点：**');
      for (const point of summary.keyPoints) {
        lines.push(`- ${point}`);
      }
      lines.push('');
    }

    // 展望
    if (summary.outlook) {
      lines.push(`**市场展望：** ${summary.outlook}`);
    }

    return lines.join('\n');
  }

  /**
   * 生成市场行情部分
   */
  private generateMarketSection(market: MarketAnalysis): string {
    const lines: string[] = [];

    // 指数概览
    lines.push('### 主要指数');
    lines.push('');
    lines.push('| 指数 | 收盘价 | 涨跌幅 |');
    lines.push('|------|--------|--------|');

    for (const index of market.indices.details) {
      const emoji = index.changePercent >= 0 ? '🟢' : '🔴';
      lines.push(`| ${emoji} ${index.name} | ${index.price.toFixed(2)} | ${this.formatPercent(index.changePercent)} |`);
    }

    return lines.join('\n');
  }

  /**
   * 生成板块分析部分
   */
  private generateSectorsSection(market: MarketAnalysis): string {
    const lines: string[] = [];

    lines.push('| 板块 | 平均涨跌幅 | 领涨股 | 领跌股 |');
    lines.push('|------|-----------|--------|--------|');

    for (const sector of market.sectors.slice(0, 6)) {
      const emoji = sector.performance >= 0 ? '🟢' : '🔴';
      const topGainer = sector.topGainer ? `${sector.topGainer.symbol} ${this.formatPercent(sector.topGainer.changePercent)}` : '-';
      const topLoser = sector.topLoser ? `${sector.topLoser.symbol} ${this.formatPercent(sector.topLoser.changePercent)}` : '-';

      lines.push(`| ${emoji} ${sector.name} | ${this.formatPercent(sector.performance)} | ${topGainer} | ${topLoser} |`);
    }

    return lines.join('\n');
  }

  /**
   * 生成涨跌榜部分
   */
  private generateMoversSection(market: MarketAnalysis): string {
    const lines: string[] = [];

    // 涨幅榜
    lines.push('### 📈 涨幅榜');
    lines.push('');
    lines.push('| 代码 | 名称 | 价格 | 涨跌幅 |');
    lines.push('|------|------|------|--------|');

    for (const stock of market.topGainers) {
      const emoji = stock.changePercent >= 0 ? '🟢' : '🔴';
      lines.push(`| ${stock.symbol} | ${stock.name.slice(0, 15)} | $${stock.price.toFixed(2)} | ${emoji} ${this.formatPercent(stock.changePercent)} |`);
    }

    lines.push('');

    // 跌幅榜
    lines.push('### 📉 跌幅榜');
    lines.push('');
    lines.push('| 代码 | 名称 | 价格 | 涨跌幅 |');
    lines.push('|------|------|------|--------|');

    for (const stock of market.topLosers) {
      lines.push(`| ${stock.symbol} | ${stock.name.slice(0, 15)} | $${stock.price.toFixed(2)} | 🔴 ${this.formatPercent(stock.changePercent)} |`);
    }

    return lines.join('\n');
  }

  /**
   * 生成新闻部分
   */
  private generateNewsSection(news: NewsAnalysis): string {
    const lines: string[] = [];

    // 热门话题
    if (news.topTopics.length > 0) {
      lines.push('### 🔥 热门话题');
      lines.push('');

      for (const topic of news.topTopics.slice(0, 5)) {
        const emoji = this.getSentimentEmoji(topic.sentiment);
        lines.push(`- ${emoji} **${topic.topic}** - ${topic.count} 条相关新闻`);
      }

      lines.push('');
    }

    // 重要新闻
    if (news.keyHeadlines.length > 0) {
      lines.push('### 📌 重要新闻');
      lines.push('');

      for (const headline of news.keyHeadlines.slice(0, 5)) {
        const importanceEmoji = headline.importance === 'high' ? '🔴' : headline.importance === 'medium' ? '🟡' : '⚪';
        lines.push(`${importanceEmoji} **${headline.headline}**`);
        lines.push(`   - 来源: ${headline.source}`);
        lines.push('');
      }
    }

    // 新闻洞察
    if (news.highlights.length > 0) {
      lines.push('### 💡 新闻洞察');
      lines.push('');
      for (const highlight of news.highlights) {
        lines.push(`- ${highlight}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * 生成经济数据部分
   */
  private generateEconomicSection(economic: EconomicAnalysis): string {
    const lines: string[] = [];

    // 经济展望
    const outlookText = {
      'expansion': '扩张',
      'contraction': '收缩',
      'stable': '稳定',
    }[economic.outlook];

    const outlookEmoji = {
      'expansion': '📈',
      'contraction': '📉',
      'stable': '➡️',
    }[economic.outlook];

    lines.push(`> **经济展望**: ${outlookEmoji} ${outlookText}`);
    lines.push('');

    // 关键指标表格
    if (economic.keyIndicators.length > 0) {
      lines.push('### 📊 关键指标');
      lines.push('');
      lines.push('| 指标 | 当前值 | 解读 |');
      lines.push('|------|--------|------|');

      for (const indicator of economic.keyIndicators.slice(0, 6)) {
        lines.push(`| ${indicator.name} | ${indicator.value.toFixed(2)} | ${indicator.interpretation.slice(0, 30)} |`);
      }

      lines.push('');
    }

    // 收益率曲线
    const curveEmoji = economic.categories.rates.yieldCurve === 'inverted' ? '⚠️' :
                       economic.categories.rates.yieldCurve === 'flat' ? '🟡' : '🟢';
    const curveText = {
      'normal': '正常',
      'inverted': '倒挂',
      'flat': '平坦',
    }[economic.categories.rates.yieldCurve];

    lines.push(`**收益率曲线**: ${curveEmoji} ${curveText}`);

    // 经济洞察
    if (economic.highlights.length > 0) {
      lines.push('');
      lines.push('### 💡 经济洞察');
      lines.push('');
      for (const highlight of economic.highlights) {
        lines.push(`- ${highlight}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * 生成风险提示部分
   */
  private generateRisksSection(analysis: ComprehensiveAnalysis): string {
    const lines: string[] = [];

    for (const risk of analysis.summary.risksAndConcerns) {
      lines.push(`- ${risk}`);
    }

    return lines.join('\n');
  }

  /**
   * 生成免责声明
   */
  private generateDisclaimer(): string {
    return `*本简报仅供参考，不构成任何投资建议。市场有风险，投资需谨慎。数据来源：Yahoo Finance、Finnhub、FRED。*`;
  }

  /**
   * 组装完整内容
   */
  private assembleContent(title: string, sections: BriefingSection[]): string {
    const lines: string[] = [];

    // 标题
    lines.push(`# ${title}`);
    lines.push('');

    // 生成时间
    lines.push(`*生成时间: ${new Date().toLocaleString('zh-CN')}*`);
    lines.push('');
    lines.push('---');
    lines.push('');

    // 各个段落
    for (const section of sections.sort((a, b) => a.order - b.order)) {
      lines.push(`## ${section.title}`);
      lines.push('');
      lines.push(section.content);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }
}
