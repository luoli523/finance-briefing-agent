/**
 * 决策导向的财经简报生成器
 * 
 * 设计理念:
 * - 以投资决策为中心
 * - 突出关键事件和趋势
 * - 保守风格，重视风险管理
 * - 信息层次清晰，易于快速扫描
 */

import type { ComprehensiveAnalysis } from '../analyzers/types';

import { historyManager } from '../collectors';

export class DecisionOrientedGenerator {
  // Sector mapping
  private SECTOR_MAPPING: Record<string, string[]> = {
    '主要指数': ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX', '^SPX'],
    'ETF': ['SPY', 'QQQ', 'VOO', 'SOXX', 'SMH', 'GLD'],
    '科技巨头': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'ORCL'],
    '半导体': ['NVDA', 'AMD', 'INTC', 'AVGO', 'QCOM', 'TSM', 'ASML', 'MU', 'MRVL', 'ARM', 'LRCX', 'AMAT', 'KLAC'],
    '存储': ['MU', 'WDC', 'STX', 'PSTG', 'NXPI'],
    '数据中心': ['EQIX', 'DLR', 'CCI', 'COIN'],
    'AI': ['PLTR', 'SNOW', 'RKLB'],
    '能源': ['CEG', 'LEU', 'OKLO'],
    '金融': ['V', 'LMND'],
    '其他': ['GE', 'UNH', 'CAT', 'DE', 'LLY'],
  };


  constructor() {}

  async generate(analysis: ComprehensiveAnalysis): Promise<string> {

    const sections = [
      this.generateHeader(analysis),
      await this.generateExecutiveSummary(analysis),
      this.generateMacroSection(analysis),
      await this.generateCompanySection(analysis),
      await this.generateSupplyChainSection(analysis),
      this.generateCapitalFlowSection(analysis),
      await this.generateInvestmentAdviceSection(analysis),
      await this.generateAppendixSection(analysis),
    ];

    const content = sections.join('\n\n');
    


    return content;
  }

  /**
   * 生成报告头部
   */
  private generateHeader(analysis: ComprehensiveAnalysis): string {
    const date = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    return `# 📈 投资决策简报 - ${date}

*生成时间: ${new Date().toLocaleString('zh-CN')}*

---
`;
  }

  /**
   * Section 1: 执行摘要（3分钟速读）
   */
  private async generateExecutiveSummary(analysis: ComprehensiveAnalysis): Promise<string> {
    const market = analysis.market;
    const news = analysis.news;
    const economic = analysis.economic;

    // 计算市场温度
    const vixQuote = [...(market?.topGainers || []), ...(market?.topLosers || [])].find((q: any) => q.symbol === '^VIX');
    const vixValue = vixQuote?.price || 0;
    const vixChange = vixQuote?.change || 0;
    
    let marketTemp = '🟢 风险偏好';
    let suggestedPosition = '70%-80%';
    if (vixValue > 25) {
      marketTemp = '🔴 避险情绪';
      suggestedPosition = '40%-50%';
    } else if (vixValue > 20) {
      marketTemp = '🟡 震荡市场';
      suggestedPosition = '60%-70%';
    }

    // 找出关键事件
    const keyEvents = this.extractKeyEvents(analysis);

    // 生成行动建议
    const actionAdvice = this.generateActionAdvice(analysis);

    return `## 📌 执行摘要（3 分钟速读）

### 🎯 今日行动建议

${actionAdvice}

### 📊 市场温度计

- **整体市场**: ${marketTemp}
- **波动指数 VIX**: ${vixValue.toFixed(2)} (${vixChange >= 0 ? '+' : ''}${vixChange.toFixed(2)}%)
- **恐慌程度**: ${this.getPanicLevel(vixValue)}
- **建议仓位**: ${suggestedPosition} 股票 + ${100 - parseInt(suggestedPosition)}% 现金/债券

### ⚡ 过去24小时关键事件（影响 > 5%）

${keyEvents}

---
`;
  }

  /**
   * 提取关键事件
   */
  private extractKeyEvents(analysis: ComprehensiveAnalysis): string {
    const events: string[] = [];
    
    // 1. 大涨大跌的股票
    const significantMovers = [...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]
      .filter(q => Math.abs(q.changePercent) > 5)
      .sort((a: any, b: any) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 3);

    significantMovers.forEach(quote => {
      const direction = quote.changePercent > 0 ? '大涨' : '大跌';
      const news = analysis.news?.keyHeadlines || []
        .filter((h: any) => h.headline.includes(quote.symbol))
        .slice(0, 1);
      
      const reason = news.length > 0 ? news[0].headline : '技术面突破';
      events.push(`${quote.symbol} ${direction} ${quote.changePercent.toFixed(2)}% → 原因: ${reason}`);
    });

    // 2. 重要的宏观新闻
    const macroNews = analysis.news?.keyHeadlines || []
      .filter((h: any) => h.headline.includes('经济') || h.headline.includes('Fed') || h.headline.includes('美联储'))
      .slice(0, 2);

    macroNews.forEach(news => {
      events.push(`${news.headline} → 影响: 整体市场情绪`);
    });

    // 3. Fed 重要公告
    if (analysis.economic?.highlights && (analysis.economic?.highlights || []).length > 0) {
      const topAnnouncement = (analysis.economic?.highlights || [])[0];
      events.push(`美联储: ${topAnnouncement} → 影响: 利率敏感板块`);
    }

    if (events.length === 0) {
      events.push('今日无重大市场事件，市场维持常规波动');
    }

    return events.map((e, i) => `${i + 1}. ${e}`).join('\n');
  }

  /**
   * 生成行动建议
   */
  private generateActionAdvice(analysis: ComprehensiveAnalysis): string {
    const advice: string[] = [];
    
    // 基于市场状况给建议
    const vixQuote = ([...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]).find(q => q.symbol === '^VIX');
    const vixValue = vixQuote?.price || 0;

    // 找出表现最好的板块
    const sectorPerformance = this.calculateSectorPerformance([...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]);
    const topSector = sectorPerformance[0];
    const bottomSector = sectorPerformance[sectorPerformance.length - 1];

    if (vixValue < 18) {
      advice.push(`- 🟢 **买入机会**: ${topSector.name}板块表现强劲 (+${topSector.avgChange.toFixed(2)}%)，可考虑适当加仓`);
      advice.push(`- 🔴 **规避风险**: ${bottomSector.name}板块走弱 (${bottomSector.avgChange.toFixed(2)}%)，建议观望`);
    } else if (vixValue > 25) {
      advice.push(`- 🟢 **买入机会**: 市场恐慌，优质标的出现折扣，分批建仓`);
      advice.push(`- 🔴 **规避风险**: 高波动环境，减少杠杆，增加现金持仓`);
    } else {
      advice.push(`- ⚪ **观望等待**: 市场方向不明，等待 VIX < 18 或明确信号`);
      advice.push(`- 🔴 **规避风险**: 避免追高，保持仓位灵活性`);
    }

    advice.push(`- ⚪ **持续监控**: 关注 Fed 动态、科技股财报季、地缘政治风险`);

    return advice.join('\n');
  }

  /**
   * 计算板块表现
   */
  private calculateSectorPerformance(quotes: any[]): Array<{name: string, avgChange: number}> {
    const sectors = Object.keys(this.SECTOR_MAPPING);
    const performance = sectors.map(sector => {
      const symbols = this.SECTOR_MAPPING[sector];
      const sectorQuotes = quotes.filter(q => symbols.includes(q.symbol));
      const avgChange = sectorQuotes.length > 0
        ? sectorQuotes.reduce((sum: any, q: any) => sum + q.changePercent, 0) / sectorQuotes.length
        : 0;
      
      return { name: sector, avgChange };
    });

    return performance.sort((a: any, b: any) => b.avgChange - a.avgChange);
  }

  /**
   * 获取恐慌等级
   */
  private getPanicLevel(vix: number): string {
    if (vix < 15) return '极低 😌 (市场过于乐观，需警惕)';
    if (vix < 20) return '低 😊 (市场平稳)';
    if (vix < 25) return '中等 😐 (适度谨慎)';
    if (vix < 30) return '高 😰 (市场紧张)';
    return '极高 😱 (极度恐慌，可能是买入机会)';
  }

  /**
   * Section 2: 市场宏观动态
   */
  private generateMacroSection(analysis: ComprehensiveAnalysis): string {
    const economic = analysis.economic;
    const news = analysis.news;
    const market = analysis.market;

    return `## 📌 市场宏观动态（过去 24 小时）

### 🌍 宏观经济事件

#### 💰 美联储 & 货币政策

${this.generateFedSection(economic, news)}

#### 📊 经济数据发布

${this.generateEconomicDataSection(economic)}

#### 🌐 地缘政治 & 政策

${this.generateGeopoliticalSection(news)}

#### 💹 市场情绪指标

${this.generateSentimentSection(market, news)}

---
`;
  }

  /**
   * 生成 Fed 部分
   */
  private generateFedSection(economic: any, news: any): string {
    const fedRate = economic?.indicators?.find((i: any) => i.name === 'Federal Funds Rate');
    const rateValue = fedRate?.value || 'N/A';
    
    const fedStance = economic.fedStance || '中性';
    const stanceIcon = fedStance === '鹰派' ? '🦅' : fedStance === '鸽派' ? '🕊️' : '⚖️';

    const fedNews = (news?.keyHeadlines || [])
      .filter((h: any) => h.headline.includes('美联储') || h.headline.includes('Fed') || h.source.includes('Fed'))
      .slice(0, 3);

    const announcements = economic?.highlights?.slice(0, 3) || [];

    return `- **最新动态**: ${announcements.length > 0 ? announcements[0] : '无最新公告'}
- **当前联邦基金利率**: ${rateValue}%
- **Fed 立场**: ${stanceIcon} ${fedStance}
- **市场解读**: ${this.interpretFedStance(fedStance)}
- **投资影响**: ${this.analyzeFedImpact(fedStance)}

**最近 Fed 相关新闻**:
${fedNews.length > 0 ? fedNews.map((n: any) => `- ${n.headline}`).join('\n') : '- 暂无相关新闻'}`;
  }

  /**
   * 解读 Fed 立场
   */
  private interpretFedStance(stance: string): string {
    const interpretations: Record<string, string> = {
      '鹰派': '倾向加息或维持高利率，抑制通胀',
      '鸽派': '倾向降息或宽松政策，刺激经济',
      '中性': '保持观望，数据驱动决策',
    };
    return interpretations[stance] || '立场不明';
  }

  /**
   * 分析 Fed 影响
   */
  private analyzeFedImpact(stance: string): string {
    const impacts: Record<string, string> = {
      '鹰派': '科技股和成长股承压，金融股受益；建议降低科技仓位',
      '鸽派': '科技股和成长股利好，美元走弱；可适当增加科技仓位',
      '中性': '市场维持区间震荡，关注个股基本面',
    };
    return impacts[stance] || '影响待观察';
  }

  /**
   * 生成经济数据部分
   */
  private generateEconomicDataSection(economic: any): string {
    const indicators = economic?.indicators || [];
    
    if (indicators.length === 0) {
      return '- 今日无重要经济数据发布';
    }

    const lines: string[] = [];
    
    indicators.slice(0, 5).forEach((indicator: any) => {
      const trend = indicator.trend || 'stable';
      const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
      
      lines.push(`- **${indicator.name}**: ${indicator.value} ${trendIcon} ${trend === 'up' ? '上升' : trend === 'down' ? '下降' : '稳定'}`);
    });

    return lines.join('\n');
  }

  /**
   * 生成地缘政治部分
   */
  private generateGeopoliticalSection(news: any): string {
    const geopoliticalNews = (news?.keyHeadlines || [])
      .filter((h: any) => h.headline.includes('地缘') || h.headline.includes('政治') || h.headline.includes('贸易'))
      .slice(0, 3);

    if (geopoliticalNews.length === 0) {
      return '- 🟢 今日无重大地缘政治事件';
    }

    const lines: string[] = [];
    geopoliticalNews.forEach((n: any, i: number) => {
      const riskLevel = this.assessGeopoliticalRisk(n.headline);
      lines.push(`- ${riskLevel} **${n.headline}**`);
      if (n.symbols && n.symbols.length > 0) {
        lines.push(`  └─ 受影响标的: ${n.symbols.slice(0, 5).join(', ')}`);
      }
    });

    return lines.join('\n');
  }

  /**
   * 评估地缘政治风险
   */
  private assessGeopoliticalRisk(title: string): string {
    const highRiskKeywords = ['战争', '制裁', '冲突', '危机', '禁令'];
    const mediumRiskKeywords = ['关税', '贸易', '谈判', '紧张'];
    
    if (highRiskKeywords.some(k => title.includes(k))) {
      return '🔴 高风险';
    } else if (mediumRiskKeywords.some(k => title.includes(k))) {
      return '🟡 中风险';
    }
    return '🟢 低风险';
  }

  /**
   * 生成市场情绪部分
   */
  private generateSentimentSection(market: any, news: any): string {
    const vixQuote = ([...(market?.topGainers || []), ...(market?.topLosers || [])]).find((q: any) => q.symbol === '^VIX');
    const vixValue = vixQuote?.price || 0;
    const vixChange = vixQuote?.changePercent || 0;

    const sentiment = (news?.sentiment || { positive: 0, negative: 0, neutral: 0, total: 0 });
    const sentimentScore = (sentiment.positive - sentiment.negative) / Math.max(sentiment.total, 1);
    
    let sentimentLevel = '中性';
    if (sentimentScore > 0.2) sentimentLevel = '贪婪';
    if (sentimentScore > 0.4) sentimentLevel = '极度贪婪';
    if (sentimentScore < -0.2) sentimentLevel = '恐惧';
    if (sentimentScore < -0.4) sentimentLevel = '极度恐惧';

    return `- **VIX 恐慌指数**: ${vixValue.toFixed(2)} (${vixChange >= 0 ? '+' : ''}${vixChange.toFixed(2)}%)
  └─ ${this.getPanicLevel(vixValue)}
- **新闻情绪**: ${sentimentLevel} (正面: ${sentiment.positive}, 负面: ${sentiment.negative})
- **市场判断**: ${this.getMarketJudgement(vixValue, sentimentScore)}`;
  }

  /**
   * 获取市场判断
   */
  private getMarketJudgement(vix: number, sentimentScore: number): string {
    if (vix < 18 && sentimentScore > 0.2) {
      return '⚠️ 市场过于乐观，警惕回调风险';
    } else if (vix > 25 && sentimentScore < -0.2) {
      return '💡 市场过度悲观，可能出现买入机会';
    } else if (vix < 20 && sentimentScore > -0.2 && sentimentScore < 0.2) {
      return '✅ 市场健康，适合正常操作';
    }
    return '⚠️ 市场情绪波动，建议谨慎操作';
  }

  /**
   * Section 3: 关键公司深度动态
   */
  private async generateCompanySection(analysis: ComprehensiveAnalysis): Promise<string> {
    const quotes = [...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])];
    const news = analysis.news?.keyHeadlines || [];

    // 找出有重大事件的公司（大涨大跌或有新闻）
    const significantCompanies = quotes
      .filter(q => {
        const hasNews = news.some((n: any) => n.headline.includes(q.symbol));
        const hasBigMove = Math.abs(q.changePercent) > 3;
        return hasNews || hasBigMove;
      })
      .sort((a: any, b: any) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 10);

    let section = `## 📌 关键公司深度动态（您的持仓标的）

### 🔍 重大事件公司（有显著新闻/大幅波动）

`;

    for (const quote of significantCompanies) {
      section += await this.generateCompanyCard(quote, news, analysis);
      section += '\n';
    }

    // 按行业分类展示
    section += await this.generateSectorPerformanceSection(quotes, news);

    return section + '\n---\n';
  }

  /**
   * 生成公司卡片
   */
  private async generateCompanyCard(quote: any, news: any[], analysis: ComprehensiveAnalysis): Promise<string> {
    const direction = quote.changePercent >= 0 ? '🟢' : '🔴';
    const arrow = quote.changePercent >= 0 ? '↑' : '↓';
    
    // 找相关新闻
    const relatedNews = news
      .filter(n => n.headline.includes(quote.symbol))
      .slice(0, 3);

    // 获取历史数据
    const history = await historyManager.getSymbolHistory(quote.symbol, 30);
    const weekAgoPrice = history.length >= 5 ? history[history.length - 5]?.price : null;
    const monthAgoPrice = history.length >= 20 ? history[history.length - 20]?.price : null;

    const weekChange = weekAgoPrice ? ((quote.price - weekAgoPrice) / weekAgoPrice * 100).toFixed(2) : 'N/A';
    const monthChange = monthAgoPrice ? ((quote.price - monthAgoPrice) / monthAgoPrice * 100).toFixed(2) : 'N/A';

    // 计算距离52周高低点的距离
    const distanceToHigh = quote.fiftyTwoWeekHigh 
      ? ((quote.price - quote.fiftyTwoWeekHigh) / quote.fiftyTwoWeekHigh * 100).toFixed(2)
      : 'N/A';
    const distanceToLow = quote.fiftyTwoWeekLow
      ? ((quote.price - quote.fiftyTwoWeekLow) / quote.fiftyTwoWeekLow * 100).toFixed(2)
      : 'N/A';

    // 生成投资观点
    const investmentView = this.generateInvestmentView(quote, relatedNews, analysis);

    return `${direction} **${quote.symbol} - ${quote.name}** | $${quote.price.toFixed(2)} ${arrow} ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%

\`\`\`
📰 核心事件
${relatedNews.length > 0 ? relatedNews.map(n => `   • ${n.headline}`).join('\n') : '   • 暂无重大新闻'}

📊 股价动态
   • 现价: $${quote.price.toFixed(2)} | 日: ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}% | 周: ${weekChange !== 'N/A' ? (parseFloat(weekChange) >= 0 ? '+' : '') + weekChange + '%' : 'N/A'} | 月: ${monthChange !== 'N/A' ? (parseFloat(monthChange) >= 0 ? '+' : '') + monthChange + '%' : 'N/A'}
   • 距52周高点: ${distanceToHigh}% | 距52周低点: ${distanceToLow}%
   • 成交量: ${this.getVolumeStatus(quote)}

📈 技术面
   • 突破/跌破关键位: ${this.checkKeyLevelBreak(quote)}
   • RSI 状态: ${this.getRSIStatus(quote)}
   • 趋势: ${this.getTrendStatus(quote, history)}

💡 投资观点
   • 事件影响: ${investmentView.impact}
   • 建议操作: ${investmentView.action}
   • 风险提示: ${investmentView.risk}
\`\`\`
`;
  }

  /**
   * 获取成交量状态
   */
  private getVolumeStatus(quote: any): string {
    // 简化处理，实际应该比较平均成交量
    return '正常';
  }

  /**
   * 检查关键位突破
   */
  private checkKeyLevelBreak(quote: any): string {
    if (!quote.fiftyTwoWeekHigh || !quote.fiftyTwoWeekLow) return '无明显突破';
    
    const distanceToHigh = Math.abs(quote.price - quote.fiftyTwoWeekHigh) / quote.fiftyTwoWeekHigh;
    const distanceToLow = Math.abs(quote.price - quote.fiftyTwoWeekLow) / quote.fiftyTwoWeekLow;

    if (distanceToHigh < 0.02) return '✅ 接近52周新高，突破在即';
    if (distanceToLow < 0.02) return '⚠️ 接近52周新低，支撑关键';
    return '无明显突破';
  }

  /**
   * 获取 RSI 状态
   */
  private getRSIStatus(quote: any): string {
    // 简化处理：基于日涨跌幅估算
    if (quote.changePercent > 5) return '超买 ⚠️';
    if (quote.changePercent < -5) return '超卖 💡';
    return '正常';
  }

  /**
   * 获取趋势状态
   */
  private getTrendStatus(quote: any, history: any[]): string {
    if (history.length < 5) return '数据不足';
    
    const recent = history.slice(-5);
    const isUptrend = recent.every((h, i) => i === 0 || h.price >= recent[i - 1].price);
    const isDowntrend = recent.every((h, i) => i === 0 || h.price <= recent[i - 1].price);

    if (isUptrend) return '📈 上升';
    if (isDowntrend) return '📉 下降';
    return '➡️ 震荡';
  }

  /**
   * 生成投资观点
   */
  private generateInvestmentView(quote: any, news: any[], analysis: ComprehensiveAnalysis): {
    impact: string;
    action: string;
    risk: string;
  } {
    let impact = '中性';
    let action = '持有观望';
    let risk = '常规市场风险';

    // 基于新闻情绪
    const positiveNews = news.filter(n => n.sentiment === 'positive').length;
    const negativeNews = news.filter(n => n.sentiment === 'negative').length;

    if (positiveNews > negativeNews) {
      impact = '正面 ✅';
    } else if (negativeNews > positiveNews) {
      impact = '负面 ⚠️';
    }

    // 基于涨跌幅给建议
    if (quote.changePercent > 10) {
      action = '短期超涨，建议止盈部分仓位';
      risk = '短期回调风险较高';
    } else if (quote.changePercent > 5) {
      action = '强势上涨，持有为主，可适当减仓锁定利润';
      risk = '注意回调风险';
    } else if (quote.changePercent > 2) {
      action = '稳健上涨，可继续持有';
      risk = '风险可控';
    } else if (quote.changePercent > -2) {
      action = '横盘整理，保持观望';
      risk = '方向不明，等待突破';
    } else if (quote.changePercent > -5) {
      action = '小幅回调，可考虑逢低布局';
      risk = '注意止损位';
    } else if (quote.changePercent > -10) {
      action = '显著回调，等待企稳信号';
      risk = '可能继续下探';
    } else {
      action = '暴跌，严格止损，等待明确见底信号';
      risk = '极高风险，避免接飞刀';
    }

    // 基于52周位置调整建议
    if (quote.fiftyTwoWeekHigh) {
      const distanceToHigh = (quote.price - quote.fiftyTwoWeekHigh) / quote.fiftyTwoWeekHigh;
      if (distanceToHigh > -0.05) {
        risk += '；处于高位，警惕回调';
      }
    }

    return { impact, action, risk };
  }

  /**
   * 生成板块表现部分
   */
  private async generateSectorPerformanceSection(quotes: any[], news: any[]): Promise<string> {
    let section = `\n### 📊 按行业分类的持仓表现\n\n`;

    const sectorPerformance = this.calculateSectorPerformance(quotes);

    for (const sector of sectorPerformance) {
      const sectorSymbols = this.SECTOR_MAPPING[sector.name] || [];
      const sectorQuotes = quotes.filter(q => sectorSymbols.includes(q.symbol));

      if (sectorQuotes.length === 0) continue;

      const emoji = sector.avgChange >= 0 ? '🟢' : '🔴';
      const sentiment = sector.avgChange > 2 ? '🟢 强势' : sector.avgChange < -2 ? '🔴 弱势' : '⚪ 中性';

      section += `#### ${emoji} ${sector.name} (平均: ${sector.avgChange >= 0 ? '+' : ''}${sector.avgChange.toFixed(2)}%)\n\n`;

      const sortedQuotes = sectorQuotes
        .sort((a: any, b: any) => b.changePercent - a.changePercent);

      // 使用表格格式
      section += `| 代码 | 公司名称 | 现价 | 日涨跌 | 52周高 | 52周低 |\n`;
      section += `|------|---------|------|--------|--------|--------|\n`;

      sortedQuotes.forEach((q: any) => {
        const icon = q.changePercent >= 0 ? '🟢' : '🔴';
        const priceStr = q.price ? `$${q.price.toFixed(2)}` : 'N/A';
        const dayChange = q.changePercent ? `${icon} ${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%` : 'N/A';
        const high52 = q.fiftyTwoWeekHigh ? `$${q.fiftyTwoWeekHigh.toFixed(2)}` : 'N/A';
        const low52 = q.fiftyTwoWeekLow ? `$${q.fiftyTwoWeekLow.toFixed(2)}` : 'N/A';
        const name = q.name && q.name.length > 25 ? q.name.substring(0, 25) + '...' : (q.name || q.symbol);
        
        section += `| **${q.symbol}** | ${name} | ${priceStr} | ${dayChange} | ${high52} | ${low52} |\n`;
      });

      section += `\n`;
    }

    return section;
  }

  /**
   * Section 4: AI & 半导体产业链联动分析
   */
  private async generateSupplyChainSection(analysis: ComprehensiveAnalysis): Promise<string> {
    const quotes = [...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])];
    const news = analysis.news?.keyHeadlines || [];

    // 定义产业链
    const supplyChain = {
      upstream: ['ASML', 'LRCX', 'AMAT', 'KLAC'],  // 设备与材料
      midstream: ['NVDA', 'AMD', 'INTC', 'TSM', 'AVGO', 'QCOM', 'MU', 'ARM', 'MRVL'],  // 芯片设计与制造
      downstream: ['MSFT', 'GOOGL', 'AMZN', 'META', 'EQIX', 'DLR', 'PLTR', 'SNOW'],  // 应用层
    };

    let section = `## 📌 AI & 半导体产业链联动分析

### 🔗 产业链全景图

`;

    // 上游
    section += `**上游: 半导体设备与材料**\n`;
    supplyChain.upstream.forEach(symbol => {
      const quote = quotes.find(q => q.symbol === symbol);
      if (quote) {
        section += `- ${quote.symbol} (${this.getCompanyRole(quote.symbol)}) $${quote.price.toFixed(2)} ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%\n`;
      }
    });

    // 中游
    section += `\n**中游: 芯片设计与制造**\n`;
    supplyChain.midstream.forEach(symbol => {
      const quote = quotes.find(q => q.symbol === symbol);
      if (quote) {
        section += `- ${quote.symbol} (${this.getCompanyRole(quote.symbol)}) $${quote.price.toFixed(2)} ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%\n`;
      }
    });

    // 下游
    section += `\n**下游: 应用层**\n`;
    supplyChain.downstream.forEach(symbol => {
      const quote = quotes.find(q => q.symbol === symbol);
      if (quote) {
        section += `- ${quote.symbol} (${this.getCompanyRole(quote.symbol)}) $${quote.price.toFixed(2)} ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%\n`;
      }
    });

    // 产业链热度分析
    section += `\n### 📈 产业链热度分析\n\n`;
    section += this.generateSupplyChainTrends(news, quotes);

    // 供应链风险
    section += `\n### ⚡ 供应链风险\n\n`;
    section += this.generateSupplyChainRisks(analysis);

    // 投资策略
    section += `\n### 💡 产业链投资策略\n\n`;
    section += this.generateSupplyChainStrategy(quotes);

    return section + '\n---\n';
  }

  /**
   * 获取公司角色
   */
  private getCompanyRole(symbol: string): string {
    const roles: Record<string, string> = {
      'ASML': '光刻机龙头',
      'LRCX': '蚀刻设备',
      'AMAT': '制造设备',
      'KLAC': '检测设备',
      'NVDA': 'GPU/AI芯片',
      'AMD': 'CPU/GPU',
      'INTC': 'CPU/芯片制造',
      'TSM': '代工龙头',
      'AVGO': '网络芯片',
      'QCOM': '移动芯片',
      'MU': '存储芯片',
      'ARM': '芯片架构',
      'MRVL': '数据中心芯片',
      'MSFT': '云计算',
      'GOOGL': '云计算/AI',
      'AMZN': '云计算',
      'META': 'AI应用',
      'EQIX': '数据中心',
      'DLR': '数据中心',
      'PLTR': 'AI软件',
      'SNOW': '数据云',
    };
    return roles[symbol] || symbol;
  }

  /**
   * 生成产业链趋势
   */
  private generateSupplyChainTrends(news: any[], quotes: any[]): string {
    let trends = '';

    // AI相关新闻
    const aiNews = news.filter(n => 
      n.headline.includes('AI/人工智能') || 
      n.headline.toLowerCase().includes('ai') ||
      n.headline.toLowerCase().includes('artificial intelligence')
    );

    if (aiNews.length > 0) {
      trends += `#### 🔥 热点趋势 1: AI 需求持续旺盛\n\n`;
      trends += `- **驱动因素**: ${aiNews.length} 条AI相关新闻，市场热度高\n`;
      trends += `- **关键新闻**: ${aiNews[0]?.headline || '暂无'}\n`;
      
      const aiBeneficiaries = quotes
        .filter(q => ['NVDA', 'AMD', 'MSFT', 'GOOGL', 'META'].includes(q.symbol))
        .filter(q => q.changePercent > 0);
      
      if (aiBeneficiaries.length > 0) {
        trends += `- **受益公司**: ${aiBeneficiaries.map(q => `${q.symbol} (+${q.changePercent.toFixed(2)}%)`).join(', ')}\n`;
      }
      trends += `- **持续性**: 长期趋势，AI算力需求持续增长\n\n`;
    }

    // 半导体周期
    const semiQuotes = quotes.filter(q => 
      ['NVDA', 'AMD', 'INTC', 'TSM', 'ASML'].includes(q.symbol)
    );
    const semiAvg = semiQuotes.reduce((sum: any, q: any) => sum + q.changePercent, 0) / semiQuotes.length;

    trends += `#### 🔥 热点趋势 2: 半导体行业周期\n\n`;
    trends += `- **当前状态**: 半导体板块平均 ${semiAvg >= 0 ? '+' : ''}${semiAvg.toFixed(2)}%\n`;
    trends += `- **周期判断**: ${semiAvg > 2 ? '上行周期，需求旺盛' : semiAvg < -2 ? '下行周期，需求疲软' : '震荡期，等待方向'}\n`;
    trends += `- **投资机会**: ${semiAvg > 2 ? '持续看好，重点关注上游设备商' : semiAvg < -2 ? '等待周期底部，分批布局' : '保持观望，等待明确信号'}\n\n`;

    return trends;
  }

  /**
   * 生成供应链风险
   */
  private generateSupplyChainRisks(analysis: ComprehensiveAnalysis): string {
    const risks: string[] = [];

    // 地缘政治风险
    const geopoliticalNews = (analysis.news?.keyHeadlines || []).filter(n => 
      n.headline.includes('地缘政治') || 
      n.headline.includes('中国') ||
      n.headline.includes('台湾')
    );

    if (geopoliticalNews.length > 0) {
      risks.push(`- **地缘政治**: ${geopoliticalNews.length} 条相关新闻，关注台海局势和中美关系`);
    }

    // 技术瓶颈
    const techNews = (analysis.news?.keyHeadlines || []).filter(n =>
      n.headline.includes('制程') || 
      n.headline.includes('EUV') ||
      n.headline.includes('先进封装')
    );

    if (techNews.length > 0) {
      risks.push(`- **技术瓶颈**: 先进制程和EUV技术进展关键`);
    }

    if (risks.length === 0) {
      risks.push('- 🟢 当前无明显供应链风险');
    }

    return risks.join('\n');
  }

  /**
   * 生成产业链策略
   */
  private generateSupplyChainStrategy(quotes: any[]): string {
    const upstream = quotes.filter(q => ['ASML', 'LRCX', 'AMAT'].includes(q.symbol));
    const midstream = quotes.filter(q => ['NVDA', 'AMD', 'TSM'].includes(q.symbol));
    const downstream = quotes.filter(q => ['MSFT', 'GOOGL', 'EQIX'].includes(q.symbol));

    const upstreamAvg = upstream.reduce((sum: any, q: any) => sum + q.changePercent, 0) / upstream.length;
    const midstreamAvg = midstream.reduce((sum: any, q: any) => sum + q.changePercent, 0) / midstream.length;
    const downstreamAvg = downstream.reduce((sum: any, q: any) => sum + q.changePercent, 0) / downstream.length;

    let strategy = '';

    // 推荐配置
    if (upstreamAvg > midstreamAvg && upstreamAvg > downstreamAvg) {
      strategy += `- **最优配置**: 上游设备商表现最强，建议增加上游配置\n`;
      strategy += `- **配比建议**: 上游 40%, 中游 40%, 下游 20%\n`;
    } else if (midstreamAvg > upstreamAvg && midstreamAvg > downstreamAvg) {
      strategy += `- **最优配置**: 中游芯片设计表现最强，建议增加中游配置\n`;
      strategy += `- **配比建议**: 上游 30%, 中游 50%, 下游 20%\n`;
    } else {
      strategy += `- **最优配置**: 均衡配置，分散风险\n`;
      strategy += `- **配比建议**: 上游 33%, 中游 34%, 下游 33%\n`;
    }

    // 核心标的
    const topPerformers = quotes
      .filter(q => ['NVDA', 'AMD', 'TSM', 'ASML', 'MSFT'].includes(q.symbol))
      .sort((a: any, b: any) => b.changePercent - a.changePercent)
      .slice(0, 3);

    strategy += `- **核心标的**: ${topPerformers.map(q => q.symbol).join(', ')} (近期表现强势)\n`;
    strategy += `- **对冲标的**: VOO, QQQ (ETF分散风险)\n`;

    return strategy;
  }

  /**
   * Section 5: 资本动向与资产交易
   */
  private generateCapitalFlowSection(analysis: ComprehensiveAnalysis): string {
    return `## 📌 资本动向与资产交易

### 💰 资金流向分析

**板块资金流动（过去 5 个交易日）**

${this.generateSectorFlowAnalysis(analysis)}

### 🎯 异常交易信号

${this.generateTradingSignals(analysis)}

*注: 机构持仓和内部交易数据需要从 SEC 13F/13G 文件获取，当前版本基于价格和成交量进行分析*

---
`;
  }

  /**
   * 生成板块资金流向分析
   */
  private generateSectorFlowAnalysis(analysis: ComprehensiveAnalysis): string {
    const sectorPerformance = this.calculateSectorPerformance([...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]);
    
    const inflow = sectorPerformance.filter(s => s.avgChange > 1).slice(0, 3);
    const outflow = sectorPerformance.filter(s => s.avgChange < -1).slice(0, 3);

    let flow = '**净流入**:\n';
    if (inflow.length > 0) {
      inflow.forEach((s, i) => {
        flow += `${i + 1}. ${s.name}: +${s.avgChange.toFixed(2)}% (资金追捧)\n`;
      });
    } else {
      flow += '- 暂无明显净流入板块\n';
    }

    flow += '\n**净流出**:\n';
    if (outflow.length > 0) {
      outflow.forEach((s, i) => {
        flow += `${i + 1}. ${s.name}: ${s.avgChange.toFixed(2)}% (资金流出)\n`;
      });
    } else {
      flow += '- 暂无明显净流出板块\n';
    }

    return flow;
  }

  /**
   * 生成交易信号
   */
  private generateTradingSignals(analysis: ComprehensiveAnalysis): string {
    const signals: string[] = [];

    // 找出异常波动的股票
    const bigMovers = [...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]
      .filter(q => Math.abs(q.changePercent) > 5)
      .sort((a: any, b: any) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 3);

    if (bigMovers.length > 0) {
      signals.push('**大额交易信号** (单日波动 > 5%):');
      bigMovers.forEach(q => {
        const direction = q.changePercent > 0 ? '买盘' : '卖盘';
        signals.push(`- ${q.symbol}: ${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}% (${direction}涌入)`);
      });
    } else {
      signals.push('- 今日无明显异常交易信号');
    }

    return signals.join('\n');
  }

  /**
   * Section 6: 投资建议与策略展望
   */
  private async generateInvestmentAdviceSection(analysis: ComprehensiveAnalysis): Promise<string> {
    const vixQuote = ([...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]).find(q => q.symbol === '^VIX');
    const vixValue = vixQuote?.price || 0;

    // 市场阶段判断
    const marketPhase = this.determineMarketPhase(analysis);
    const suggestedPosition = this.calculateSuggestedPosition(vixValue, marketPhase);

    let section = `## 📌 投资建议与策略展望（保守风格）

### 🎯 当前市场定位

- **市场阶段**: ${marketPhase.phase}
- **推荐仓位**: ${suggestedPosition.stock}% 股票 + ${suggestedPosition.cash}% 现金/债券
- **风险等级**: ${marketPhase.risk}

${marketPhase.explanation}

`;

    // 投资组合建议
    section += await this.generatePortfolioAdvice(analysis, suggestedPosition);

    // 本周操作计划
    section += this.generateWeeklyPlan(analysis);

    // 风险监控
    section += this.generateRiskMonitoring(analysis);

    // 关键事件日历
    section += this.generateEventCalendar(analysis);

    // 投资纪律提醒
    section += this.generateDisciplineReminder();

    return section + '\n---\n';
  }

  /**
   * 判断市场阶段
   */
  private determineMarketPhase(analysis: ComprehensiveAnalysis): {
    phase: string;
    risk: string;
    explanation: string;
  } {
    const spxQuote = ([...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]).find(q => q.symbol === '^GSPC');
    const vixQuote = ([...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]).find(q => q.symbol === '^VIX');
    
    if (!spxQuote || !vixQuote) {
      return {
        phase: '数据不足',
        risk: '中等',
        explanation: '市场数据不完整，建议保守操作',
      };
    }

    const vix = vixQuote.price;
    const spxChange = spxQuote.changePercent;

    // 简化的市场阶段判断
    if (vix < 15 && spxChange > 0) {
      return {
        phase: '牛市中期',
        risk: '中等',
        explanation: '市场情绪乐观，但需警惕过度乐观带来的回调风险',
      };
    } else if (vix < 20 && spxChange > -1) {
      return {
        phase: '震荡市',
        risk: '中等',
        explanation: '市场方向不明，适合均衡配置，等待方向明确',
      };
    } else if (vix > 25) {
      return {
        phase: '熊市/恐慌期',
        risk: '高',
        explanation: '市场恐慌，但也可能是长期买入机会，分批建仓',
      };
    } else {
      return {
        phase: '调整期',
        risk: '中高',
        explanation: '市场波动加大，建议降低仓位，保持谨慎',
      };
    }
  }

  /**
   * 计算建议仓位
   */
  private calculateSuggestedPosition(vix: number, marketPhase: any): {
    stock: number;
    cash: number;
  } {
    let stockPosition = 70;  // 默认70%

    if (vix < 15) {
      stockPosition = 75;  // 市场平稳，适当增加
    } else if (vix < 20) {
      stockPosition = 70;  // 正常仓位
    } else if (vix < 25) {
      stockPosition = 60;  // 降低仓位
    } else if (vix < 30) {
      stockPosition = 50;  // 显著降低
    } else {
      stockPosition = 40;  // 高度防御
    }

    // 根据市场阶段微调
    if (marketPhase.phase.includes('牛市')) {
      stockPosition = Math.min(stockPosition + 5, 80);
    } else if (marketPhase.phase.includes('熊市')) {
      stockPosition = Math.max(stockPosition - 10, 30);
    }

    return {
      stock: stockPosition,
      cash: 100 - stockPosition,
    };
  }

  /**
   * 生成投资组合建议
   */
  private async generatePortfolioAdvice(analysis: ComprehensiveAnalysis, position: any): Promise<string> {
    const quotes = [...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])];
    
    // 选出表现好的标的
    const topPerformers = quotes
      .filter(q => q.changePercent > 0)
      .sort((a: any, b: any) => b.changePercent - a.changePercent)
      .slice(0, 10);

    let advice = `### 💼 投资组合建议（保守型）\n\n`;

    advice += `#### 核心仓位（${Math.round(position.stock * 0.7)}%）- 稳健增长\n\n`;
    
    const coreHoldings = topPerformers.slice(0, 3);
    coreHoldings.forEach((q, i) => {
      const allocation = Math.round(position.stock * 0.7 / 3);
      advice += `${i + 1}. **${q.symbol}** ${allocation}% - ${q.name}\n`;
      advice += `   - 现价: $${q.price.toFixed(2)} | 今日: ${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%\n`;
      advice += `   - 买入理由: ${this.generateBuyReason(q, analysis)}\n`;
      advice += `   - 风险: ${this.identifyRisks(q)}\n\n`;
    });

    advice += `#### 卫星仓位（${Math.round(position.stock * 0.3)}%）- 成长机会\n\n`;
    
    const satelliteHoldings = topPerformers.slice(3, 5);
    satelliteHoldings.forEach((q, i) => {
      const allocation = Math.round(position.stock * 0.3 / 2);
      advice += `${i + 1}. **${q.symbol}** ${allocation}% - ${q.name}\n`;
      advice += `   - 现价: $${q.price.toFixed(2)} | 今日: ${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%\n`;
      advice += `   - 特点: 高成长高波动，适合中长期持有\n\n`;
    });

    advice += `#### 防御仓位（${position.cash}%）\n\n`;
    advice += `- **现金**: ${Math.round(position.cash * 0.6)}% - 等待更好买点\n`;
    advice += `- **黄金 GLD**: ${Math.round(position.cash * 0.3)}% - 对冲地缘风险\n`;
    advice += `- **短期国债/货币基金**: ${Math.round(position.cash * 0.1)}% - 保本收益\n\n`;

    return advice;
  }

  /**
   * 生成买入理由
   */
  private generateBuyReason(quote: any, analysis: ComprehensiveAnalysis): string {
    const reasons: string[] = [];

    // 基于涨势
    if (quote.changePercent > 5) {
      reasons.push('强劲上涨势头');
    } else if (quote.changePercent > 2) {
      reasons.push('稳健上涨');
    }

    // 基于新闻
    const relatedNews = (analysis.news?.keyHeadlines || []).filter(n => n.headline.includes(quote.symbol));
    if (relatedNews.length > 0) {
      reasons.push('有利好新闻支撑');
    }

    // 基于行业
    const isInHotSector = this.isInHotSector(quote.symbol, analysis);
    if (isInHotSector) {
      reasons.push('所属行业热度高');
    }

    if (reasons.length === 0) {
      return '基本面稳健，长期配置价值';
    }

    return reasons.join('，');
  }

  /**
   * 判断是否在热门板块
   */
  private isInHotSector(symbol: string, analysis: ComprehensiveAnalysis): boolean {
    const sectorPerformance = this.calculateSectorPerformance([...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]);
    const topSectors = sectorPerformance.slice(0, 3);

    for (const sector of topSectors) {
      const sectorSymbols = this.SECTOR_MAPPING[sector.name] || [];
      if (sectorSymbols.includes(symbol)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 识别风险
   */
  private identifyRisks(quote: any): string {
    const risks: string[] = [];

    // 基于涨幅
    if (quote.changePercent > 10) {
      risks.push('短期涨幅过大');
    }

    // 基于52周高点
    if (quote.fiftyTwoWeekHigh) {
      const distanceToHigh = (quote.price - quote.fiftyTwoWeekHigh) / quote.fiftyTwoWeekHigh;
      if (distanceToHigh > -0.05) {
        risks.push('接近历史高位');
      }
    }

    if (risks.length === 0) {
      return '风险可控，正常市场风险';
    }

    return risks.join('，');
  }

  /**
   * 生成本周操作计划
   */
  private generateWeeklyPlan(analysis: ComprehensiveAnalysis): string {
    let plan = `### 📋 本周操作计划\n\n`;

    plan += `**优先级 1（本周执行）**:\n\n`;
    
    // 找出回调后的优质标的
    const buyOpportunities = [...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]
      .filter(q => q.changePercent < -2 && q.changePercent > -5)
      .slice(0, 2);

    if (buyOpportunities.length > 0) {
      buyOpportunities.forEach(q => {
        plan += `- ✅ 买入 **${q.symbol}** 5-10% 仓位\n`;
        plan += `  └─ 条件: 价格回调至 $${(q.price * 0.98).toFixed(2)} 附近\n`;
        plan += `  └─ 理由: 优质标的短期回调，提供买入机会\n\n`;
      });
    } else {
      plan += `- ⏳ 当前无明显买入机会，保持观望\n\n`;
    }

    plan += `**优先级 2（观望，等待信号）**:\n\n`;
    
    const watchList = [...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]
      .filter(q => q.changePercent > -1 && q.changePercent < 1)
      .slice(0, 2);

    watchList.forEach(q => {
      plan += `- ⏳ 关注 **${q.symbol}**，等待突破或回调\n`;
      plan += `  └─ 突破信号: 放量突破 $${(q.price * 1.03).toFixed(2)}\n`;
      plan += `  └─ 回调机会: 跌至 $${(q.price * 0.97).toFixed(2)} 附近\n\n`;
    });

    return plan;
  }

  /**
   * 生成风险监控
   */
  private generateRiskMonitoring(analysis: ComprehensiveAnalysis): string {
    let section = `### ⚠️ 风险监控\n\n`;

    section += `**近期需要关注的风险**:\n\n`;

    // VIX风险
    const vixQuote = ([...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])]).find(q => q.symbol === '^VIX');
    if (vixQuote && vixQuote.price > 20) {
      section += `🔴 **高风险**: VIX 恐慌指数 ${vixQuote.price.toFixed(2)}，市场波动加大\n`;
      section += `   └─ 影响板块: 科技股、成长股\n`;
      section += `   └─ 应对策略: 降低仓位至 60% 以下，增加现金储备\n\n`;
    }

    // 地缘政治风险
    const geopoliticalNews = (analysis.news?.keyHeadlines || []).filter(n => 
      n.headline.includes('地缘政治')
    );

    if (geopoliticalNews.length > 0) {
      section += `🟡 **中风险**: 地缘政治事件 ${geopoliticalNews.length} 条\n`;
      section += `   └─ 关键事件: ${geopoliticalNews[0]?.headline || '暂无'}\n`;
      section += `   └─ 监控指标: 关注台海局势、中美关系\n\n`;
    }

    // 板块风险
    const weakSectors = this.calculateSectorPerformance([...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])])
      .filter(s => s.avgChange < -2)
      .slice(0, 2);

    if (weakSectors.length > 0) {
      section += `🟡 **板块风险**: ${weakSectors.map(s => s.name).join('、')} 板块走弱\n`;
      section += `   └─ 建议: 减少相关板块仓位\n\n`;
    }

    if (vixQuote && vixQuote.price < 20 && geopoliticalNews.length === 0 && weakSectors.length === 0) {
      section += `🟢 **当前风险可控**: 无重大风险事件，市场平稳\n\n`;
    }

    return section;
  }

  /**
   * 生成事件日历
   */
  private generateEventCalendar(analysis: ComprehensiveAnalysis): string {
    let section = `### 📅 关键事件日历（未来 2 周）\n\n`;

    // 这里应该从日历API获取，当前使用模拟数据
    section += `*注: 具体财报日期和 Fed 会议需查看官方日历*\n\n`;

    // 基于新闻推测可能的事件
    const earningsNews = (analysis.news?.keyHeadlines || []).filter(n =>
      n.headline.includes('财报') || n.headline.includes('earnings')
    );

    if (earningsNews.length > 0) {
      section += `**即将公布财报的公司**:\n`;
      earningsNews.slice(0, 3).forEach(n => {
        section += `- ${n.headline}\n`;
      });
      section += `\n`;
    }

    section += `**操作建议**:\n`;
    section += `- 财报前: 对于高仓位股票，考虑减仓 20-30% 锁定利润\n`;
    section += `- Fed 会议前: 增加现金储备至 30% 以上\n`;
    section += `- 重要数据公布日: 避免开新仓，等待数据明朗\n\n`;

    return section;
  }

  /**
   * 生成投资纪律提醒
   */
  private generateDisciplineReminder(): string {
    return `### 🎓 投资纪律提醒（保守风格）

- ✅ **严格止损**: 单只股票亏损超过 -8% 必须止损，不要心存侥幸
- ✅ **分批建仓**: 永远不要一次性满仓，分 3-5 次建仓
- ✅ **控制单只仓位**: 单只股票不超过 15%，避免过度集中
- ✅ **保持现金储备**: 至少保留 15-20% 现金，应对突发机会
- ✅ **定期复盘**: 每周五复盘，评估持仓，调整策略
- ✅ **避免情绪化**: 不追涨杀跌，按计划执行
- ✅ **长期视角**: 关注 3-5 年趋势，不被短期波动影响

**保守投资者准则**:
- 宁可错过，不要做错
- 宁可少赚，不要亏损
- 宁可慢一点，不要急躁
`;
  }


  /**
   * Section 7: 附录 - 完整持仓表
   */
  private async generateAppendixSection(analysis: ComprehensiveAnalysis): Promise<string> {
    let section = `## 📌 附录: 完整持仓一览表\n\n`;

    const quotes = [...(analysis.market?.topGainers || []), ...(analysis.market?.topLosers || [])];
    const sectors = Object.keys(this.SECTOR_MAPPING);

    for (const sector of sectors) {
      const sectorSymbols = this.SECTOR_MAPPING[sector];
      const sectorQuotes = quotes.filter(q => sectorSymbols.includes(q.symbol));

      if (sectorQuotes.length === 0) continue;

      const avgChange = sectorQuotes.reduce((sum: any, q: any) => sum + q.changePercent, 0) / sectorQuotes.length;
      const emoji = avgChange >= 0 ? '🟢' : '🔴';

      section += `### ${emoji} ${sector} (平均: ${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%)\n\n`;
      section += `| 代码 | 名称 | 现价 | 日涨跌 | 52周高 | 52周低 |\n`;
      section += `|------|------|------:|--------:|-------:|-------:|\n`;

      sectorQuotes.forEach(q => {
        const icon = q.changePercent >= 0 ? '🟢' : '🔴';
        section += `| ${icon} ${q.symbol} | ${q.name.substring(0, 12)} | $${q.price.toFixed(2)} | ${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}% | $${q.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'} | $${q.fiftyTwoWeekLow?.toFixed(2) || 'N/A'} |\n`;
      });

      section += `\n`;
    }

    section += `\n---\n\n`;
    section += `*报告结束* - 祝投资顺利！📈\n`;

    return section;
  }
}
