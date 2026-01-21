import { ComprehensiveAnalysis } from '../analyzers/types';
import { BaseGenerator } from './base';
import { GeneratedBriefing, BriefingSection, GeneratorConfig, OutputFormat } from './types';

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
    .container { max-width: 800px; margin: 0 auto; }
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
