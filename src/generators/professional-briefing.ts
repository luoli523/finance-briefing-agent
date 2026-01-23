/**
 * 专业投资简报生成器
 * 
 * 按照用户要求的6大部分格式生成：
 * 一、核心股票池表现
 * 二、市场宏观动态与要闻
 * 三、关键公司深度动态
 * 四、行业影响与关联分析
 * 五、产业链资本动向与资产交易
 * 六、投资建议与策略展望
 */

import * as fs from 'fs';
import * as path from 'path';
import { AI_INDUSTRY_CATEGORIES, STOCK_INFO, MONITORED_SYMBOLS } from '../config';
import type { ComprehensiveAnalysis } from '../analyzers/types';

interface StockPerformance {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: string;
}

interface LLMInsights {
  marketMacroNews?: {
    summary: string;
    keyNews: Array<{
      title: string;
      fact: string;
      impact: string;
      category: string;
      importance: string;
    }>;
  };
  companyDeepDive?: Array<{
    ticker: string;
    company: string;
    event: string;
    investmentLogic: string;
    priceTarget?: {
      current: number;
      target: number;
      stopLoss: number;
      timeframe: string;
    };
    catalysts?: string[];
    risks?: string[];
  }>;
  industryLinkageAnalysis?: {
    gpuSupplyChain?: {
      event: string;
      mechanism: string;
      beneficiaries: string[];
      losers: string[];
      trackingMetrics: string[];
    };
    dataCenterExpansion?: {
      event: string;
      mechanism: string;
      beneficiaries: string[];
      losers: string[];
      trackingMetrics: string[];
    };
    semiconCapex?: {
      event: string;
      mechanism: string;
      beneficiaries: string[];
      losers: string[];
      trackingMetrics: string[];
    };
  };
  capitalMovements?: Array<{
    action: string;
    strategicIntent: string;
    marketReaction: string;
    riskPoints: string[];
  }>;
  investmentStrategy?: {
    overallJudgment?: {
      valuation: string;
      earnings: string;
      rates: string;
      policy: string;
      fundFlow: string;
    };
    shortTerm?: {
      timeframe: string;
      stance: string;
      cashPosition: string;
      hedgeStrategy: string;
      actionItems: string[];
    };
    mediumTerm?: {
      timeframe: string;
      focus: string;
      keyCatalysts: string[];
      verificationMetrics: string[];
      stockPicks?: Array<{
        ticker: string;
        logic: string;
        entry: number;
        target: number;
        position: string;
      }>;
    };
    longTerm?: {
      timeframe: string;
      themes: string[];
      beneficiarySubsectors: string[];
      representativeStocks: string[];
    };
    portfolioSuggestion?: {
      stocks: Array<{
        ticker: string;
        name: string;
        weight: string;
        logic: string;
        mainRisk: string;
      }>;
      etfs: Array<{
        ticker: string;
        name: string;
        useCase: string;
      }>;
    };
    riskControl?: {
      mainRisks: Array<{
        risk: string;
        probability: string;
        hedge: string;
      }>;
      hedgeInstruments: string[];
    };
  };
  dailyBlessing?: string;
}

export class ProfessionalBriefingGenerator {
  private analysis: ComprehensiveAnalysis;
  private llmInsights: LLMInsights | null;
  private date: string;
  private stockPerformance: Map<string, StockPerformance> = new Map();

  constructor(analysis: ComprehensiveAnalysis, llmInsights: LLMInsights | null = null) {
    this.analysis = analysis;
    this.llmInsights = llmInsights;
    this.date = new Date().toISOString().split('T')[0];
    this.processStockData();
  }

  /**
   * 处理股票数据
   */
  private processStockData(): void {
    const marketData = this.analysis.market;
    
    // 从各个数据源获取股票数据
    const allQuotes: any[] = [];
    
    // 1. 从 sectors 获取（最完整的数据源）
    if (marketData.sectors && Array.isArray(marketData.sectors)) {
      for (const sector of marketData.sectors) {
        if (sector.stocks && Array.isArray(sector.stocks)) {
          allQuotes.push(...sector.stocks);
        }
      }
    }
    
    // 2. 从 indices 获取
    if (marketData.indices?.details && Array.isArray(marketData.indices.details)) {
      allQuotes.push(...marketData.indices.details);
    }
    
    // 3. 从 topGainers/topLosers 补充（可能有不在 sectors 中的数据）
    if (marketData.topGainers && Array.isArray(marketData.topGainers)) {
      allQuotes.push(...marketData.topGainers);
    }
    if (marketData.topLosers && Array.isArray(marketData.topLosers)) {
      allQuotes.push(...marketData.topLosers);
    }

    // 去重并处理
    for (const quote of allQuotes) {
      if (!quote.symbol) continue;
      
      // 跳过已处理的（保留第一个，通常是更完整的数据）
      if (this.stockPerformance.has(quote.symbol)) continue;
      
      const info = STOCK_INFO[quote.symbol] || { name: quote.name || quote.symbol, category: '其他' };
      this.stockPerformance.set(quote.symbol, {
        ticker: quote.symbol,
        name: info.name,
        price: quote.price || 0,
        change: quote.change || 0,
        changePercent: quote.changePercent || 0,
        category: info.category,
      });
    }
  }

  /**
   * 生成完整报告
   */
  async generate(): Promise<{ markdown: string }> {
    const sections = [
      this.generateHeader(),
      this.generateStockPoolSection(),
      this.generateMacroNewsSection(),
      this.generateCompanyDeepDiveSection(),
      this.generateLinkageAnalysisSection(),
      this.generateCapitalMovementsSection(),
      this.generateInvestmentStrategySection(),
      this.generateBlessing(),
      this.generateFooter(),
    ];

    const markdown = sections.join('\n\n');

    return { markdown };
  }

  /**
   * 生成报告头部
   */
  private generateHeader(): string {
    return `====================
AI Industry 每日简报与投资建议｜${this.date}
（基于过去24小时信息 & 美股上一交易日收盘）
====================`;
  }

  /**
   * 一、核心股票池表现
   */
  private generateStockPoolSection(): string {
    let content = `## 一、核心股票池表现（上一交易日官方收盘）

`;

    // 检查是否有数据
    if (this.stockPerformance.size === 0) {
      content += `⚠️ 无新收盘数据\n\n`;
      content += `| 分类 (Category) | 公司 (Company) | 股票代号 (Ticker) | 最新股价 (USD) | 涨跌幅 (%) | 表现 |\n`;
      content += `|:----------------|:---------------|:-----------------:|---------------:|------------:|:----:|\n`;
      content += `| N/A | N/A | N/A | N/A | N/A | N/A |\n`;
      return content;
    }

    content += `| 分类 (Category) | 公司 (Company) | 股票代号 (Ticker) | 最新股价 (USD) | 涨跌幅 (%) | 表现 |\n`;
    content += `|:----------------|:---------------|:-----------------:|---------------:|------------:|:----:|\n`;

    // 按产业链分类输出
    for (const [category, symbols] of Object.entries(AI_INDUSTRY_CATEGORIES)) {
      for (const symbol of symbols) {
        const stock = this.stockPerformance.get(symbol);
        if (stock) {
          const emoji = stock.changePercent > 0 ? '🔴' : stock.changePercent < 0 ? '🟢' : '➡️';
          const changeStr = stock.changePercent !== 0 
            ? `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`
            : 'N/A';
          content += `| ${category} | ${stock.name} | ${stock.ticker} | $${stock.price.toFixed(2)} | ${changeStr} | ${emoji} |\n`;
        }
      }
    }

    // ETF
    for (const symbol of MONITORED_SYMBOLS.etf) {
      const stock = this.stockPerformance.get(symbol);
      if (stock) {
        const emoji = stock.changePercent > 0 ? '🔴' : stock.changePercent < 0 ? '🟢' : '➡️';
        const changeStr = stock.changePercent !== 0 
          ? `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%`
          : 'N/A';
        content += `| ETF | ${stock.name} | ${stock.ticker} | $${stock.price.toFixed(2)} | ${changeStr} | ${emoji} |\n`;
      }
    }

    // 未上市重要主体
    content += `\n**未上市重要主体**：OpenAI / Anthropic / xAI / Perplexity（仅列示，不填价格）\n`;

    return content;
  }

  /**
   * 二、市场宏观动态与要闻
   */
  private generateMacroNewsSection(): string {
    let content = `## 二、市场宏观动态与要闻（过去24小时）

`;

    const llmNews = this.llmInsights?.marketMacroNews;
    
    if (llmNews?.summary) {
      content += `**整体情绪**: ${llmNews.summary}\n\n`;
    }

    // 从分析数据中获取新闻
    const newsData = this.analysis.news;
    const topHeadlines = newsData?.topHeadlines || [];
    
    if (llmNews?.keyNews && llmNews.keyNews.length > 0) {
      // 使用LLM生成的新闻分析
      llmNews.keyNews.forEach((news, index) => {
        const importanceIcon = news.importance === 'high' ? '🔴' : news.importance === 'medium' ? '🟡' : '🟢';
        content += `### ${index + 1}. ${importanceIcon} ${news.title}\n\n`;
        content += `**事实摘要**: ${news.fact}\n\n`;
        content += `**影响解读**: ${news.impact}\n\n`;
        content += `**分类**: ${news.category}\n\n`;
        content += `---\n\n`;
      });
    } else if (topHeadlines.length > 0) {
      // 使用收集的新闻数据
      topHeadlines.slice(0, 10).forEach((headline, index) => {
        content += `### ${index + 1}. ${headline.title || headline}\n\n`;
        if (typeof headline === 'object') {
          content += `**来源**: ${headline.source || 'N/A'}\n\n`;
          if (headline.summary) {
            content += `**摘要**: ${headline.summary}\n\n`;
          }
        }
        content += `---\n\n`;
      });
    } else {
      content += `暂无重大新闻更新。\n`;
    }

    return content;
  }

  /**
   * 三、关键公司深度动态
   */
  private generateCompanyDeepDiveSection(): string {
    let content = `## 三、关键公司深度动态（过去24小时）

`;

    const deepDive = this.llmInsights?.companyDeepDive;
    
    if (deepDive && deepDive.length > 0) {
      for (const company of deepDive) {
        content += `### ${company.company}（${company.ticker}）\n\n`;
        content += `**事件摘要**: ${company.event}\n\n`;
        content += `**投资逻辑解读**: ${company.investmentLogic}\n\n`;
        
        if (company.priceTarget) {
          content += `**价格目标**:\n`;
          content += `- 当前价: $${company.priceTarget.current}\n`;
          content += `- 目标价: $${company.priceTarget.target}\n`;
          content += `- 止损价: $${company.priceTarget.stopLoss}\n`;
          content += `- 时间框架: ${company.priceTarget.timeframe === 'short' ? '短期' : company.priceTarget.timeframe === 'medium' ? '中期' : '长期'}\n\n`;
        }
        
        if (company.catalysts && company.catalysts.length > 0) {
          content += `**催化剂**: ${company.catalysts.join('、')}\n\n`;
        }
        
        if (company.risks && company.risks.length > 0) {
          content += `**风险提示**: ${company.risks.join('、')}\n\n`;
        }
        
        content += `---\n\n`;
      }
    } else {
      // 基于股价异动生成
      const topGainers = this.analysis.market?.topGainers?.slice(0, 3) || [];
      const topLosers = this.analysis.market?.topLosers?.slice(0, 3) || [];
      
      if (topGainers.length > 0) {
        content += `### 涨幅领先\n\n`;
        for (const stock of topGainers) {
          const info = STOCK_INFO[stock.symbol] || { name: stock.symbol, category: '其他' };
          content += `**${info.name}（${stock.symbol}）** | 涨幅 +${stock.changePercent?.toFixed(2)}% | `;
          content += `关注要点：股价异动，建议关注近期新闻和财报\n\n`;
        }
      }
      
      if (topLosers.length > 0) {
        content += `### 跌幅领先\n\n`;
        for (const stock of topLosers) {
          const info = STOCK_INFO[stock.symbol] || { name: stock.symbol, category: '其他' };
          content += `**${info.name}（${stock.symbol}）** | 跌幅 ${stock.changePercent?.toFixed(2)}% | `;
          content += `关注要点：股价异动，建议关注近期新闻和财报\n\n`;
        }
      }
    }

    return content;
  }

  /**
   * 四、行业影响与关联分析
   */
  private generateLinkageAnalysisSection(): string {
    let content = `## 四、行业影响与关联分析（联动效应）

`;

    const linkage = this.llmInsights?.industryLinkageAnalysis;

    // GPU供给链
    content += `### 1. GPU/加速卡供给与价格链\n\n`;
    if (linkage?.gpuSupplyChain) {
      const gpu = linkage.gpuSupplyChain;
      content += `**事件**: ${gpu.event}\n\n`;
      content += `**传导机制**: ${gpu.mechanism}\n\n`;
      content += `**受益环节**: ${gpu.beneficiaries.join('、') || 'N/A'}\n\n`;
      content += `**受损环节**: ${gpu.losers.join('、') || 'N/A'}\n\n`;
      content += `**跟踪指标**: ${gpu.trackingMetrics.join('、') || 'N/A'}\n\n`;
    } else {
      content += `GPU供给 → 训练/推理成本 → 云厂商与模型公司毛利/CapEx\n\n`;
      content += `- **受益方**: NVDA（供给方）、云厂商（规模效应）\n`;
      content += `- **跟踪指标**: H100/H200定价、交货周期、各厂商CapEx指引\n\n`;
    }

    // 数据中心扩张链
    content += `### 2. 数据中心扩张链\n\n`;
    if (linkage?.dataCenterExpansion) {
      const dc = linkage.dataCenterExpansion;
      content += `**事件**: ${dc.event}\n\n`;
      content += `**传导机制**: ${dc.mechanism}\n\n`;
      content += `**受益环节**: ${dc.beneficiaries.join('、') || 'N/A'}\n\n`;
      content += `**受损环节**: ${dc.losers.join('、') || 'N/A'}\n\n`;
      content += `**跟踪指标**: ${dc.trackingMetrics.join('、') || 'N/A'}\n\n`;
    } else {
      content += `数据中心扩张 → 服务器/网络/电力与冷却需求增长\n\n`;
      content += `- **受益方**: VRT（电源散热）、ETN（电气设备）、ANET（网络）、SMCI（服务器）\n`;
      content += `- **跟踪指标**: 云厂商数据中心新建计划、电力需求增长、PUE指标\n\n`;
    }

    // 半导体资本开支链
    content += `### 3. 半导体资本开支链\n\n`;
    if (linkage?.semiconCapex) {
      const capex = linkage.semiconCapex;
      content += `**事件**: ${capex.event}\n\n`;
      content += `**传导机制**: ${capex.mechanism}\n\n`;
      content += `**受益环节**: ${capex.beneficiaries.join('、') || 'N/A'}\n\n`;
      content += `**受损环节**: ${capex.losers.join('、') || 'N/A'}\n\n`;
      content += `**跟踪指标**: ${capex.trackingMetrics.join('、') || 'N/A'}\n\n`;
    } else {
      content += `半导体资本开支 → 设备/EDA订单 → 行业能见度\n\n`;
      content += `- **受益方**: AMAT、LRCX、KLAC（设备）、SNPS、CDNS（EDA）\n`;
      content += `- **跟踪指标**: TSM/Intel/三星CapEx计划、设备厂商订单backlog、EDA续约率\n\n`;
    }

    return content;
  }

  /**
   * 五、产业链资本动向与资产交易
   */
  private generateCapitalMovementsSection(): string {
    let content = `## 五、产业链资本动向与资产交易（过去24小时）

`;

    const movements = this.llmInsights?.capitalMovements;

    if (movements && movements.length > 0) {
      movements.forEach((movement, index) => {
        content += `### ${index + 1}. ${movement.action}\n\n`;
        content += `**战略意图**: ${movement.strategicIntent}\n\n`;
        content += `**市场反应**: ${movement.marketReaction}\n\n`;
        if (movement.riskPoints && movement.riskPoints.length > 0) {
          content += `**风险点**: ${movement.riskPoints.join('、')}\n\n`;
        }
        content += `---\n\n`;
      });
    } else {
      content += `### 关注领域\n\n`;
      content += `- **CapEx动向**: 云厂商2026年资本开支指引更新\n`;
      content += `- **扩产计划**: AI芯片产能扩张进展\n`;
      content += `- **数据中心建设**: 大型数据中心项目进展\n`;
      content += `- **并购/投资**: AI领域战略投资与并购动态\n\n`;
      content += `*（暂无24小时内重大资本动向更新，持续关注中）*\n`;
    }

    return content;
  }

  /**
   * 六、投资建议与策略展望
   */
  private generateInvestmentStrategySection(): string {
    let content = `## 六、投资建议与策略展望

`;

    const strategy = this.llmInsights?.investmentStrategy;

    // 总体判断
    content += `### 总体判断\n\n`;
    if (strategy?.overallJudgment) {
      const judgment = strategy.overallJudgment;
      content += `| 维度 | 判断 |\n`;
      content += `|:-----|:-----|\n`;
      content += `| 估值 | ${judgment.valuation || 'N/A'} |\n`;
      content += `| 业绩 | ${judgment.earnings || 'N/A'} |\n`;
      content += `| 利率 | ${judgment.rates || 'N/A'} |\n`;
      content += `| 政策 | ${judgment.policy || 'N/A'} |\n`;
      content += `| 资金偏好 | ${judgment.fundFlow || 'N/A'} |\n\n`;
    } else {
      content += `- **估值-业绩-利率-政策**: 需结合最新数据综合判断\n`;
      content += `- **资金偏好**: 关注AI相关ETF资金流向\n\n`;
    }

    // 短期建议
    content += `### 短期配置（1个月内）\n\n`;
    if (strategy?.shortTerm) {
      const short = strategy.shortTerm;
      const stanceText = short.stance === 'defensive' ? '防御' : short.stance === 'aggressive' ? '进取' : '中性';
      content += `- **立场**: ${stanceText}\n`;
      content += `- **现金仓位**: ${short.cashPosition}\n`;
      content += `- **对冲思路**: ${short.hedgeStrategy}\n`;
      if (short.actionItems && short.actionItems.length > 0) {
        content += `- **具体操作**:\n`;
        short.actionItems.forEach(item => {
          content += `  - ${item}\n`;
        });
      }
      content += `\n`;
    } else {
      content += `- 强调防御性、仓位与流动性管理\n`;
      content += `- 建议现金比例: 20-30%\n`;
      content += `- 对冲工具: GLD、短债ETF\n\n`;
    }

    // 中期建议
    content += `### 中期配置（3-6个月）\n\n`;
    if (strategy?.mediumTerm) {
      const medium = strategy.mediumTerm;
      content += `- **聚焦**: ${medium.focus}\n`;
      if (medium.keyCatalysts && medium.keyCatalysts.length > 0) {
        content += `- **关键催化**: ${medium.keyCatalysts.join('、')}\n`;
      }
      if (medium.verificationMetrics && medium.verificationMetrics.length > 0) {
        content += `- **验证指标**: ${medium.verificationMetrics.join('、')}\n`;
      }
      if (medium.stockPicks && medium.stockPicks.length > 0) {
        content += `\n**精选标的**:\n\n`;
        content += `| 股票 | 核心逻辑 | 买入价 | 目标价 | 建议仓位 |\n`;
        content += `|:----:|:---------|-------:|-------:|:--------:|\n`;
        medium.stockPicks.forEach(pick => {
          content += `| ${pick.ticker} | ${pick.logic} | $${pick.entry} | $${pick.target} | ${pick.position} |\n`;
        });
      }
      content += `\n`;
    } else {
      content += `- 聚焦估值修复与业绩兑现\n`;
      content += `- 关键催化: 财报季、AI产品发布、云厂商CapEx指引\n`;
      content += `- 验证指标: 收入增速、毛利率、客户数增长\n\n`;
    }

    // 长期建议
    content += `### 长期配置（6-12个月以上）\n\n`;
    if (strategy?.longTerm) {
      const long = strategy.longTerm;
      if (long.themes && long.themes.length > 0) {
        content += `**结构性成长主题**:\n`;
        long.themes.forEach(theme => {
          content += `- ${theme}\n`;
        });
        content += `\n`;
      }
      if (long.beneficiarySubsectors && long.beneficiarySubsectors.length > 0) {
        content += `**受益子行业**: ${long.beneficiarySubsectors.join('、')}\n\n`;
      }
      if (long.representativeStocks && long.representativeStocks.length > 0) {
        content += `**代表标的**: ${long.representativeStocks.join('、')}\n\n`;
      }
    } else {
      content += `**结构性成长主题**:\n`;
      content += `- 算力基础设施（GPU、服务器、网络）\n`;
      content += `- 半导体CapEx周期（设备、EDA）\n`;
      content += `- AI应用渗透（企业软件、自动驾驶）\n\n`;
    }

    // 投资组合参考
    content += `### 投资组合参考\n\n`;
    if (strategy?.portfolioSuggestion) {
      const portfolio = strategy.portfolioSuggestion;
      if (portfolio.stocks && portfolio.stocks.length > 0) {
        content += `**个股配置**:\n\n`;
        content += `| 股票 | 名称 | 权重 | 核心逻辑 | 主要风险 |\n`;
        content += `|:----:|:-----|:----:|:---------|:---------|\n`;
        portfolio.stocks.forEach(stock => {
          content += `| ${stock.ticker} | ${stock.name} | ${stock.weight} | ${stock.logic} | ${stock.mainRisk} |\n`;
        });
        content += `\n`;
      }
      if (portfolio.etfs && portfolio.etfs.length > 0) {
        content += `**ETF配置**:\n\n`;
        content += `| ETF | 名称 | 适用场景 |\n`;
        content += `|:----|:-----|:---------|\n`;
        portfolio.etfs.forEach(etf => {
          content += `| ${etf.ticker} | ${etf.name} | ${etf.useCase} |\n`;
        });
        content += `\n`;
      }
    } else {
      content += `**个股参考**: NVDA、MSFT、TSM、AMZN、META、AMD、ASML、AVGO\n\n`;
      content += `**ETF参考**:\n`;
      content += `- SMH / SOXX: 半导体行业配置\n`;
      content += `- QQQ: 科技龙头配置\n`;
      content += `- ARKQ / BOTZ: 自动化/机器人主题\n\n`;
    }

    // 风险控制
    content += `### 风险控制\n\n`;
    if (strategy?.riskControl) {
      const risk = strategy.riskControl;
      if (risk.mainRisks && risk.mainRisks.length > 0) {
        content += `**主要风险**:\n\n`;
        content += `| 风险 | 概率 | 对冲建议 |\n`;
        content += `|:-----|:----:|:---------|\n`;
        risk.mainRisks.forEach(r => {
          const probText = r.probability === 'high' ? '高' : r.probability === 'medium' ? '中' : '低';
          content += `| ${r.risk} | ${probText} | ${r.hedge} |\n`;
        });
        content += `\n`;
      }
      if (risk.hedgeInstruments && risk.hedgeInstruments.length > 0) {
        content += `**对冲工具**: ${risk.hedgeInstruments.join('、')}\n`;
      }
    } else {
      content += `**主要风险**:\n`;
      content += `- 政策收紧（出口管制升级）\n`;
      content += `- 供应链风险（地缘政治）\n`;
      content += `- 估值过热（增速放缓）\n`;
      content += `- 利率上行（资金成本）\n`;
      content += `- 地缘冲突（台海风险）\n\n`;
      content += `**对冲建议**: 短债ETF、美元、黄金(GLD)\n`;
    }

    return content;
  }

  /**
   * 生成祝福语
   */
  private generateBlessing(): string {
    const blessing = this.llmInsights?.dailyBlessing || '愿您在投资的道路上，保持耐心与智慧，每一天都向目标更近一步';
    return `---

**【今日祝福】** ${blessing}`;
  }

  /**
   * 生成页脚
   */
  private generateFooter(): string {
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    return `
====================
END OF BRIEFING
====================

---

**免责声明**: 本报告仅供参考，不构成投资建议。投资有风险，决策需谨慎。

*报告生成时间: ${timeStr}*`;
  }
}
