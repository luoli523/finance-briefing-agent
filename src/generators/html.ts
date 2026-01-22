import { ComprehensiveAnalysis, MarketAnalysis } from '../analyzers/types';
import { BaseGenerator } from './base';
import { GeneratedBriefing, BriefingSection, GeneratorConfig, OutputFormat } from './types';
import { historyManager } from '../collectors/history';

/**
 * HTML 简报生成器
 */
export class HtmlGenerator extends BaseGenerator {
  readonly name = 'html-generator';
  readonly format: OutputFormat = 'html';

  constructor(config: GeneratorConfig = {}) {
    super({ ...config, format: 'html' });
  }

  /**
   * 生成 HTML 格式简报
   */
  async generate(analysis: ComprehensiveAnalysis): Promise<GeneratedBriefing> {
    this.log('Generating HTML briefing...');

    const sections: BriefingSection[] = [];
    let order = 0;

    const title = this.generateTitle();

    // 摘要卡片
    sections.push({
      id: 'summary',
      title: '今日要点',
      content: this.generateSummaryCard(analysis),
      order: order++,
    });

    // 全部持仓明细（按行业分类）
    if (analysis.market) {
      sections.push({
        id: 'all-stocks',
        title: '全部持仓明细（按行业分类）',
        content: await this.generateAllStocksCard(analysis.market),
        order: order++,
      });
    }

    // 市场概览
    if (analysis.market) {
      sections.push({
        id: 'market',
        title: '市场行情',
        content: this.generateMarketCard(analysis.market),
        order: order++,
      });

      sections.push({
        id: 'movers',
        title: '涨跌榜',
        content: this.generateMoversCard(analysis.market),
        order: order++,
      });
    }

    // 新闻
    if (analysis.news) {
      sections.push({
        id: 'news',
        title: '新闻要闻',
        content: this.generateNewsCard(analysis.news),
        order: order++,
      });
    }

    // 经济数据
    if (analysis.economic) {
      sections.push({
        id: 'economic',
        title: '经济数据',
        content: this.generateEconomicCard(analysis.economic),
        order: order++,
      });
    }

    // 组装 HTML
    const content = this.assembleHtml(title, sections, analysis);

    const briefing: GeneratedBriefing = {
      title,
      date: new Date(),
      format: 'html',
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

    this.log(`Generated HTML briefing with ${sections.length} sections`);
    return briefing;
  }

  private generateTitle(): string {
    const date = this.formatDate(new Date());
    return `财经早报 | ${date}`;
  }

  private generateSummaryCard(analysis: ComprehensiveAnalysis): string {
    const { summary } = analysis;

    const conditionClass = {
      'risk-on': 'status-positive',
      'risk-off': 'status-negative',
      'mixed': 'status-neutral',
    }[summary.marketCondition];

    const conditionText = {
      'risk-on': '风险偏好上升',
      'risk-off': '避险情绪浓厚',
      'mixed': '市场情绪分化',
    }[summary.marketCondition];

    let keyPointsHtml = '';
    if (summary.keyPoints.length > 0) {
      keyPointsHtml = `
        <div class="key-points">
          <h4>关键要点</h4>
          <ul>
            ${summary.keyPoints.map(p => `<li>${p}</li>`).join('\n')}
          </ul>
        </div>
      `;
    }

    return `
      <div class="summary-card">
        <div class="status-badges">
          <span class="badge ${conditionClass}">${conditionText}</span>
        </div>
        ${keyPointsHtml}
        <p class="outlook">${summary.outlook}</p>
      </div>
    `;
  }

  private generateMarketCard(market: any): string {
    const indicesRows = market.indices.details.map((index: any) => {
      const changeClass = index.changePercent >= 0 ? 'positive' : 'negative';
      return `
        <tr>
          <td>${index.name}</td>
          <td>${index.price.toFixed(2)}</td>
          <td class="${changeClass}">${this.formatPercent(index.changePercent)}</td>
        </tr>
      `;
    }).join('');

    return `
      <table class="market-table">
        <thead>
          <tr>
            <th>指数</th>
            <th>收盘价</th>
            <th>涨跌幅</th>
          </tr>
        </thead>
        <tbody>
          ${indicesRows}
        </tbody>
      </table>
    `;
  }

  private generateMoversCard(market: any): string {
    const gainersRows = market.topGainers.map((stock: any) => {
      const changeClass = stock.changePercent >= 0 ? 'positive' : 'negative';
      return `
        <tr>
          <td><strong>${stock.symbol}</strong></td>
          <td>${stock.name.slice(0, 15)}</td>
          <td class="${changeClass}">${this.formatPercent(stock.changePercent)}</td>
        </tr>
      `;
    }).join('');

    const losersRows = market.topLosers.map((stock: any) => `
      <tr>
        <td><strong>${stock.symbol}</strong></td>
        <td>${stock.name.slice(0, 15)}</td>
        <td class="negative">${this.formatPercent(stock.changePercent)}</td>
      </tr>
    `).join('');

    return `
      <div class="movers-grid">
        <div class="gainers">
          <h4>📈 涨幅榜</h4>
          <table>
            <tbody>${gainersRows}</tbody>
          </table>
        </div>
        <div class="losers">
          <h4>📉 跌幅榜</h4>
          <table>
            <tbody>${losersRows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  private generateNewsCard(news: any): string {
    const topicsHtml = news.topTopics.slice(0, 5).map((topic: any) => `
      <span class="topic-tag">${topic.topic} (${topic.count})</span>
    `).join('');

    const headlinesHtml = news.keyHeadlines.slice(0, 5).map((h: any) => `
      <li>
        <strong>${h.headline}</strong>
        <span class="source">- ${h.source}</span>
      </li>
    `).join('');

    return `
      <div class="topics">
        <h4>🔥 热门话题</h4>
        <div class="topic-tags">${topicsHtml}</div>
      </div>
      <div class="headlines">
        <h4>📌 重要新闻</h4>
        <ul>${headlinesHtml}</ul>
      </div>
    `;
  }

  private generateEconomicCard(economic: any): string {
    const indicatorsHtml = economic.keyIndicators.slice(0, 5).map((i: any) => `
      <tr>
        <td>${i.name}</td>
        <td>${i.value.toFixed(2)}</td>
        <td>${i.interpretation.slice(0, 25)}...</td>
      </tr>
    `).join('');

    const curveClass = economic.categories.rates.yieldCurve === 'inverted' ? 'warning' : 'normal';

    return `
      <div class="yield-curve ${curveClass}">
        收益率曲线: <strong>${economic.categories.rates.yieldCurve.toUpperCase()}</strong>
      </div>
      <table class="indicators-table">
        <thead>
          <tr>
            <th>指标</th>
            <th>数值</th>
            <th>解读</th>
          </tr>
        </thead>
        <tbody>${indicatorsHtml}</tbody>
      </table>
    `;
  }

  /**
   * 生成全部持仓明细（按行业分类）
   */
  private async generateAllStocksCard(market: MarketAnalysis): Promise<string> {
    // 统计信息
    const totalStocks = market.sectors.reduce((sum, s) => sum + s.stocks.length, 0);
    const gainers = market.sectors.reduce((sum, s) => sum + s.stocks.filter(st => st.changePercent > 0).length, 0);
    const losers = market.sectors.reduce((sum, s) => sum + s.stocks.filter(st => st.changePercent < 0).length, 0);
    const unchanged = totalStocks - gainers - losers;

    // 获取历史数据对比
    const [weekAgo, monthAgo] = await Promise.all([
      historyManager.getWeekAgoData(),
      historyManager.getMonthAgoData(),
    ]);

    // 构建历史数据映射
    const weekAgoMap = new Map(weekAgo?.quotes.map(q => [q.symbol, q]) || []);
    const monthAgoMap = new Map(monthAgo?.quotes.map(q => [q.symbol, q]) || []);

    const hasWeekData = weekAgo !== null && weekAgo.quotes.length > 0;
    const hasMonthData = monthAgo !== null && monthAgo.quotes.length > 0;

    // 统计信息
    let statsHtml = `
      <div class="stats-summary">
        <p>📊 <strong>统计</strong>: 共 ${totalStocks} 只标的 | 🟢 上涨 ${gainers} | 🔴 下跌 ${losers} | ⚪ 持平 ${unchanged}</p>
    `;

    // 显示历史数据日期
    const dateInfo: string[] = [];
    if (hasWeekData) dateInfo.push(`周对比: ${weekAgo!.date}`);
    if (hasMonthData) dateInfo.push(`月对比: ${monthAgo!.date}`);
    if (dateInfo.length > 0) {
      statsHtml += `<p>📅 <strong>历史数据</strong>: ${dateInfo.join(' | ')}</p>`;
    }
    statsHtml += '</div>';

    // 按行业分类生成表格
    let sectorsHtml = '';
    for (const sector of market.sectors) {
      if (sector.stocks.length === 0) continue;

      const sectorGainers = sector.stocks.filter(s => s.changePercent > 0).length;
      const sectorLosers = sector.stocks.filter(s => s.changePercent < 0).length;
      const sectorEmoji = sector.performance >= 0 ? '🟢' : '🔴';

      sectorsHtml += `
        <div class="sector-section">
          <h4>${sectorEmoji} ${sector.name} (平均: ${this.formatPercent(sector.performance)})</h4>
          <p class="sector-stats">${sector.stocks.length} 只标的 | 🟢 上涨 ${sectorGainers} | 🔴 下跌 ${sectorLosers}</p>
          
          <table class="stocks-table">
            <thead>
              <tr>
                <th>代码</th>
                <th>名称</th>
                <th>现价</th>
                <th>日涨跌</th>
                <th>周涨跌</th>
                <th>月涨跌</th>
                <th>52周高</th>
                <th>52周低</th>
              </tr>
            </thead>
            <tbody>
      `;

      // 按涨跌幅排序
      const sortedStocks = [...sector.stocks].sort((a, b) => b.changePercent - a.changePercent);

      for (const stock of sortedStocks) {
        const emoji = stock.changePercent > 0 ? '🟢' : stock.changePercent < 0 ? '🔴' : '⚪';
        const dayChangeClass = stock.changePercent >= 0 ? 'positive' : 'negative';

        // 周涨跌
        let weekChangeHtml = '<td class="neutral">-</td>';
        const weekData = weekAgoMap.get(stock.symbol);
        if (weekData) {
          const weekChangePercent = ((stock.price - weekData.price) / weekData.price) * 100;
          const weekChangeClass = weekChangePercent >= 0 ? 'positive' : 'negative';
          weekChangeHtml = `<td class="${weekChangeClass}">${this.formatPercent(weekChangePercent)}</td>`;
        }

        // 月涨跌
        let monthChangeHtml = '<td class="neutral">-</td>';
        const monthData = monthAgoMap.get(stock.symbol);
        if (monthData) {
          const monthChangePercent = ((stock.price - monthData.price) / monthData.price) * 100;
          const monthChangeClass = monthChangePercent >= 0 ? 'positive' : 'negative';
          monthChangeHtml = `<td class="${monthChangeClass}">${this.formatPercent(monthChangePercent)}</td>`;
        }

        // 52周高低点
        const high52w = stock.fiftyTwoWeekHigh ? `$${stock.fiftyTwoWeekHigh.toFixed(2)}` : '-';
        const low52w = stock.fiftyTwoWeekLow ? `$${stock.fiftyTwoWeekLow.toFixed(2)}` : '-';

        sectorsHtml += `
          <tr>
            <td><strong>${emoji} ${stock.symbol}</strong></td>
            <td>${stock.name.slice(0, 12)}</td>
            <td>$${stock.price.toFixed(2)}</td>
            <td class="${dayChangeClass}">${this.formatPercent(stock.changePercent)}</td>
            ${weekChangeHtml}
            ${monthChangeHtml}
            <td class="neutral">${high52w}</td>
            <td class="neutral">${low52w}</td>
          </tr>
        `;
      }

      sectorsHtml += `
            </tbody>
          </table>
        </div>
      `;
    }

    return statsHtml + sectorsHtml;
  }

  private assembleHtml(title: string, sections: BriefingSection[], analysis: ComprehensiveAnalysis): string {
    const sectionsHtml = sections
      .sort((a, b) => a.order - b.order)
      .map(s => `
        <section class="card" id="${s.id}">
          <h3>${s.title}</h3>
          ${s.content}
        </section>
      `)
      .join('\n');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    header h1 { font-size: 1.8em; margin-bottom: 10px; }
    header .meta { opacity: 0.8; font-size: 0.9em; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .card h3 { color: #1a1a2e; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    .positive { color: #22c55e; }
    .negative { color: #ef4444; }
    .neutral { color: #888; }
    .stats-summary { 
      background: #f8f9fa; 
      padding: 15px; 
      border-radius: 8px; 
      margin-bottom: 20px;
      border-left: 4px solid #3730a3;
    }
    .stats-summary p { margin: 5px 0; }
    .sector-section { margin-bottom: 30px; }
    .sector-section h4 { 
      color: #1a1a2e; 
      margin-bottom: 5px;
      font-size: 1.1em;
    }
    .sector-stats { 
      color: #666; 
      font-size: 0.9em; 
      margin-bottom: 10px;
      font-style: italic;
    }
    .stocks-table { 
      font-size: 0.9em;
      margin-bottom: 15px;
    }
    .stocks-table th {
      font-size: 0.85em;
      text-align: right;
    }
    .stocks-table th:first-child,
    .stocks-table th:nth-child(2) {
      text-align: left;
    }
    .stocks-table td {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .stocks-table td:first-child,
    .stocks-table td:nth-child(2) {
      text-align: left;
    }
    .badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
    }
    .status-positive { background: #dcfce7; color: #166534; }
    .status-negative { background: #fee2e2; color: #991b1b; }
    .status-neutral { background: #fef3c7; color: #92400e; }
    .key-points { margin: 15px 0; }
    .key-points ul { padding-left: 20px; }
    .key-points li { margin: 8px 0; }
    .outlook { font-style: italic; color: #666; margin-top: 15px; }
    .movers-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .topic-tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .topic-tag {
      background: #e0e7ff;
      color: #3730a3;
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 0.85em;
    }
    .headlines ul { list-style: none; }
    .headlines li { padding: 10px 0; border-bottom: 1px solid #eee; }
    .headlines .source { color: #888; font-size: 0.85em; }
    .yield-curve {
      padding: 10px 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .yield-curve.warning { background: #fef3c7; color: #92400e; }
    .yield-curve.normal { background: #dcfce7; color: #166534; }
    footer {
      text-align: center;
      padding: 20px;
      color: #888;
      font-size: 0.85em;
    }
    @media (max-width: 600px) {
      .movers-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 ${title}</h1>
      <div class="meta">生成时间: ${new Date().toLocaleString('zh-CN')}</div>
    </header>

    ${sectionsHtml}

    <footer>
      <p>本简报仅供参考，不构成投资建议。市场有风险，投资需谨慎。</p>
      <p>数据来源: Yahoo Finance | Finnhub | FRED</p>
    </footer>
  </div>
</body>
</html>`;
  }
}
