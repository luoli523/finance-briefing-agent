import * as fs from 'fs';
import * as path from 'path';
import { CollectedData, DataItem } from '../collectors/types';
import { MarketAnalyzer } from './market';
import { NewsAnalyzer } from './news';
import { EconomicAnalyzer } from './economic';
import {
  ComprehensiveAnalysis,
  MarketAnalysis,
  NewsAnalysis,
  EconomicAnalysis,
  Sentiment,
  AnalyzerConfig,
} from './types';

/**
 * 智能综合分析结果
 * 整合所有数据源，提供多维度深度分析
 */
export interface IntelligentAnalysis extends ComprehensiveAnalysis {
  // 多维度分析
  dimensions: {
    // 宏观经济维度
    macroEconomic: {
      overview: string;
      gdpTrend: string;
      inflationOutlook: string;
      employmentHealth: string;
      impact: string;
      sentiment: Sentiment;
    };

    // 财政货币政策（Fed）
    monetaryPolicy: {
      overview: string;
      fedStance: 'hawkish' | 'dovish' | 'neutral';
      rateExpectation: string;
      yieldCurve: string;
      recentAnnouncements: string[];
      impact: string;
      sentiment: Sentiment;
    };

    // 地缘政治
    geopolitical: {
      overview: string;
      majorEvents: string[];
      affectedSectors: string[];
      impact: string;
      riskLevel: 'high' | 'medium' | 'low';
    };

    // 政策监管
    regulatory: {
      overview: string;
      secActions: string[];
      policyChanges: string[];
      affectedCompanies: string[];
      impact: string;
    };

    // 行业深度分析
    sectorDeepDive: {
      // AI 人工智能
      ai: {
        overview: string;
        keyDevelopments: string[];
        leadingStocks: string[];
        sentiment: Sentiment;
        outlook: string;
        investmentImplication: string;
      };

      // 半导体
      semiconductor: {
        overview: string;
        supplyChainStatus: string;
        demandTrend: string;
        keyPlayers: string[];
        sentiment: Sentiment;
        outlook: string;
        investmentImplication: string;
      };

      // 数据中心
      dataCenter: {
        overview: string;
        capacityExpansion: string;
        powerDemand: string;
        keyStocks: string[];
        sentiment: Sentiment;
        outlook: string;
        investmentImplication: string;
      };

      // 能源
      energy: {
        overview: string;
        traditionalEnergy: string;
        renewableEnergy: string;
        nuclearRenaissance: string;
        keyStocks: string[];
        sentiment: Sentiment;
        outlook: string;
        investmentImplication: string;
      };
    };
  };

  // 跨领域关联分析
  crossDomainInsights: {
    keyConnections: string[];
    emergingTrends: string[];
    hiddenRisks: string[];
  };

  // 投资建议
  investmentImplications: {
    opportunities: string[];
    risks: string[];
    sectorRotation: string[];
    timingConsiderations: string[];
  };

  // 关键催化剂
  catalysts: {
    upcoming: string[];
    monitoring: string[];
  };
}

/**
 * 聚合数据（包含所有数据源）
 */
interface EnhancedAggregatedData {
  collectedAt: Date;
  market?: CollectedData;
  news?: CollectedData;
  economic?: CollectedData;
  governmentRSS?: CollectedData;  // 政府 RSS
  secFilings?: CollectedData;     // SEC 文件
}

/**
 * 智能分析器
 * 整合所有数据源，提供多维度深度分析
 * 重点关注：AI、半导体、数据中心、能源
 */
export class IntelligentAnalyzer {
  private marketAnalyzer: MarketAnalyzer;
  private newsAnalyzer: NewsAnalyzer;
  private economicAnalyzer: EconomicAnalyzer;
  private config: AnalyzerConfig;

  constructor(config: AnalyzerConfig = {}) {
    this.config = config;
    this.marketAnalyzer = new MarketAnalyzer(config);
    this.newsAnalyzer = new NewsAnalyzer(config);
    this.economicAnalyzer = new EconomicAnalyzer(config);
  }

  /**
   * 智能综合分析
   */
  async analyze(data: EnhancedAggregatedData): Promise<IntelligentAnalysis> {
    console.log('[intelligent-analyzer] Starting intelligent comprehensive analysis...');

    // 1. 基础分析
    const baseAnalysis = await this.performBaseAnalysis(data);

    // 2. 多维度分析
    const dimensions = await this.analyzeDimensions(data, baseAnalysis);

    // 3. 跨领域关联分析
    const crossDomainInsights = this.analyzeCrossDomainConnections(data, baseAnalysis, dimensions);

    // 4. 投资建议
    const investmentImplications = this.generateInvestmentImplications(dimensions, crossDomainInsights);

    // 5. 关键催化剂
    const catalysts = this.identifyCatalysts(data, dimensions);

    // 6. 增强的综合摘要
    const summary = this.generateEnhancedSummary(baseAnalysis, dimensions, crossDomainInsights);

    const result: IntelligentAnalysis = {
      ...baseAnalysis,
      summary,
      dimensions,
      crossDomainInsights,
      investmentImplications,
      catalysts,
    };

    console.log('[intelligent-analyzer] Intelligent analysis completed');
    return result;
  }

  /**
   * 基础分析（使用现有分析器）
   */
  private async performBaseAnalysis(data: EnhancedAggregatedData): Promise<ComprehensiveAnalysis> {
    let marketAnalysis: MarketAnalysis | undefined;
    let newsAnalysis: NewsAnalysis | undefined;
    let economicAnalysis: EconomicAnalysis | undefined;

    if (data.market) {
      try {
        marketAnalysis = await this.marketAnalyzer.analyze(data.market);
      } catch (error) {
        console.error('[intelligent-analyzer] Market analysis failed:', error);
      }
    }

    if (data.news) {
      try {
        newsAnalysis = await this.newsAnalyzer.analyze(data.news);
      } catch (error) {
        console.error('[intelligent-analyzer] News analysis failed:', error);
      }
    }

    if (data.economic) {
      try {
        economicAnalysis = await this.economicAnalyzer.analyze(data.economic);
      } catch (error) {
        console.error('[intelligent-analyzer] Economic analysis failed:', error);
      }
    }

    return {
      timestamp: new Date(),
      market: marketAnalysis,
      news: newsAnalysis,
      economic: economicAnalysis,
      summary: {
        marketCondition: marketAnalysis?.condition || 'mixed',
        overallSentiment: this.aggregateSentiment(marketAnalysis, newsAnalysis),
        keyPoints: [],
        risksAndConcerns: [],
        outlook: '',
      },
    };
  }

  /**
   * 多维度分析
   */
  private async analyzeDimensions(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis
  ): Promise<IntelligentAnalysis['dimensions']> {
    return {
      macroEconomic: this.analyzeMacroEconomic(data, baseAnalysis),
      monetaryPolicy: this.analyzeMonetaryPolicy(data, baseAnalysis),
      geopolitical: this.analyzeGeopolitical(data, baseAnalysis),
      regulatory: this.analyzeRegulatory(data, baseAnalysis),
      sectorDeepDive: {
        ai: this.analyzeAISector(data, baseAnalysis),
        semiconductor: this.analyzeSemiconductorSector(data, baseAnalysis),
        dataCenter: this.analyzeDataCenterSector(data, baseAnalysis),
        energy: this.analyzeEnergySector(data, baseAnalysis),
      },
    };
  }

  /**
   * 宏观经济分析
   */
  private analyzeMacroEconomic(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis
  ) {
    const economic = baseAnalysis.economic;
    if (!economic) {
      return {
        overview: '宏观经济数据暂无',
        gdpTrend: '数据不足',
        inflationOutlook: '数据不足',
        employmentHealth: '数据不足',
        impact: '无法评估',
        sentiment: 'neutral' as Sentiment,
      };
    }

    // GDP 趋势
    const gdpIndicators = economic.keyIndicators.filter(i => 
      i.seriesId.includes('GDP') || i.name.includes('GDP')
    );
    const gdpTrend = gdpIndicators.length > 0
      ? `GDP ${gdpIndicators[0].trend === 'up' ? '增长' : gdpIndicators[0].trend === 'down' ? '收缩' : '平稳'}，${gdpIndicators[0].interpretation}`
      : 'GDP数据暂无';

    // 通胀展望
    const inflationData = economic.categories.inflation;
    const inflationOutlook = inflationData
      ? `${inflationData.summary}。CPI趋势${inflationData.indicators[0]?.trend === 'up' ? '上升' : inflationData.indicators[0]?.trend === 'down' ? '下降' : '平稳'}`
      : '通胀数据暂无';

    // 就业健康度
    const employmentData = economic.categories.employment;
    const employmentHealth = employmentData
      ? `${employmentData.summary}。就业市场${employmentData.indicators[0]?.trend === 'up' ? '走强' : employmentData.indicators[0]?.trend === 'down' ? '走弱' : '稳定'}`
      : '就业数据暂无';

    // 综合影响
    const sentiment = this.determineMacroSentiment(economic);
    const impact = this.describeMacroImpact(economic, sentiment);

    return {
      overview: `当前宏观经济处于${economic.outlook === 'expansion' ? '扩张期' : economic.outlook === 'contraction' ? '收缩期' : '稳定期'}`,
      gdpTrend,
      inflationOutlook,
      employmentHealth,
      impact,
      sentiment,
    };
  }

  /**
   * 财政货币政策分析（Fed）
   */
  private analyzeMonetaryPolicy(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis
  ) {
    const economic = baseAnalysis.economic;
    const govRSS = data.governmentRSS?.items || [];

    // 提取 Fed 相关新闻
    const fedNews = govRSS.filter(item =>
      item.metadata?.feedTitle?.includes('Federal Reserve') ||
      item.metadata?.feedTitle?.includes('FRB')
    );

    // 分析 Fed 立场
    const fedStance = this.determineFedStance(economic, fedNews);

    // 利率预期
    const rateIndicator = economic?.keyIndicators.find(i =>
      i.seriesId === 'FEDFUNDS' || i.name.includes('Fed Funds')
    );
    const rateExpectation = rateIndicator
      ? `当前联邦基金利率${rateIndicator.value.toFixed(2)}%，${rateIndicator.trend === 'up' ? '呈上升趋势' : rateIndicator.trend === 'down' ? '呈下降趋势' : '保持稳定'}`
      : '利率数据暂无';

    // 收益率曲线
    const yieldCurveStatus = economic?.categories.rates.yieldCurve || 'flat';
    const yieldCurve = `收益率曲线${yieldCurveStatus === 'inverted' ? '倒挂（衰退信号）' : yieldCurveStatus === 'normal' ? '正常' : '平坦'}`;

    // 最近公告
    const recentAnnouncements = fedNews.slice(0, 5).map(item => item.title);

    // 影响评估
    const impact = this.describeFedImpact(fedStance, yieldCurveStatus);

    // 情绪
    const sentiment = fedStance === 'dovish' ? 'bullish' : fedStance === 'hawkish' ? 'bearish' : 'neutral';

    return {
      overview: `美联储当前立场${fedStance === 'hawkish' ? '鹰派（紧缩）' : fedStance === 'dovish' ? '鸽派（宽松）' : '中性'}`,
      fedStance,
      rateExpectation,
      yieldCurve,
      recentAnnouncements,
      impact,
      sentiment: sentiment as Sentiment,
    };
  }

  /**
   * 地缘政治分析
   */
  private analyzeGeopolitical(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis
  ) {
    const news = baseAnalysis.news;
    const govRSS = data.governmentRSS?.items || [];

    // 提取地缘政治相关新闻
    const geopoliticalKeywords = [
      'china', 'russia', 'ukraine', 'taiwan', 'trade war', 'tariff', 'sanction',
      'middle east', 'iran', 'israel', 'election', 'trump', 'biden'
    ];

    const geopoliticalNews = [
      ...govRSS,
      ...(data.news?.items || [])
    ].filter(item =>
      geopoliticalKeywords.some(keyword =>
        item.title.toLowerCase().includes(keyword) ||
        item.content?.toLowerCase().includes(keyword)
      )
    );

    const majorEvents = geopoliticalNews
      .slice(0, 5)
      .map(item => `${item.title}`);

    // 受影响板块
    const affectedSectors: string[] = [];
    if (geopoliticalNews.some(n => n.title.toLowerCase().includes('china') || n.title.toLowerCase().includes('trade'))) {
      affectedSectors.push('科技', '半导体', '制造业');
    }
    if (geopoliticalNews.some(n => n.title.toLowerCase().includes('energy') || n.title.toLowerCase().includes('oil'))) {
      affectedSectors.push('能源');
    }

    const riskLevel: 'high' | 'medium' | 'low' = 
      geopoliticalNews.length > 10 ? 'high' :
      geopoliticalNews.length > 5 ? 'medium' : 'low';

    return {
      overview: geopoliticalNews.length > 0
        ? `发现${geopoliticalNews.length}条地缘政治相关事件`
        : '暂无重大地缘政治事件',
      majorEvents,
      affectedSectors,
      impact: this.describeGeopoliticalImpact(riskLevel, affectedSectors),
      riskLevel,
    };
  }

  /**
   * 政策监管分析
   */
  private analyzeRegulatory(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis
  ) {
    const govRSS = data.governmentRSS?.items || [];
    const secFilings = data.secFilings?.items || [];

    // SEC 行动
    const secNews = govRSS.filter(item =>
      item.metadata?.feedTitle?.includes('SEC')
    );
    const secActions = secNews.slice(0, 5).map(item => item.title);

    // 政策变化
    const policyNews = govRSS.filter(item =>
      item.metadata?.feedTitle?.includes('Federal Register') ||
      item.title.toLowerCase().includes('regulation') ||
      item.title.toLowerCase().includes('policy')
    );
    const policyChanges = policyNews.slice(0, 5).map(item => item.title);

    // 受影响公司
    const affectedCompanies = this.extractAffectedCompanies(secNews, secFilings);

    const impact = this.describeRegulatoryImpact(secActions, policyChanges, affectedCompanies);

    return {
      overview: `监测到${secActions.length}条SEC动态，${policyChanges.length}条政策变化`,
      secActions,
      policyChanges,
      affectedCompanies,
      impact,
    };
  }

  /**
   * AI 行业分析
   */
  private analyzeAISector(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis
  ) {
    const market = baseAnalysis.market;
    const news = data.news?.items || [];

    // AI 相关关键词
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'gpt', 'llm', 'generative ai', 'openai', 'chatgpt'];

    // AI 新闻
    const aiNews = news.filter(item =>
      aiKeywords.some(kw => 
        item.title.toLowerCase().includes(kw) ||
        item.content?.toLowerCase().includes(kw)
      )
    );

    const keyDevelopments = aiNews.slice(0, 5).map(item => item.title);

    // AI 相关股票（科技巨头）
    const aiStocks = ['MSFT', 'GOOGL', 'META', 'NVDA', 'AMD'];
    const leadingStocks = market?.topGainers
      .filter(stock => aiStocks.includes(stock.symbol))
      .map(stock => `${stock.symbol} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`) || [];

    // 情绪分析
    const sentiment = this.analyzeSectorSentiment(aiNews, market, aiStocks);

    const outlook = this.generateAIOutlook(aiNews, market, sentiment);
    const investmentImplication = this.generateAIInvestmentImplication(sentiment, market);

    return {
      overview: `AI行业${aiNews.length > 0 ? '热度持续' : '保持关注'}，${leadingStocks.length}只AI核心股表现${sentiment === 'bullish' ? '强劲' : sentiment === 'bearish' ? '疲软' : '平稳'}`,
      keyDevelopments,
      leadingStocks,
      sentiment,
      outlook,
      investmentImplication,
    };
  }

  /**
   * 半导体行业分析
   */
  private analyzeSemiconductorSector(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis
  ) {
    const market = baseAnalysis.market;
    const news = data.news?.items || [];

    // 半导体关键词
    const semKeywords = ['semiconductor', 'chip', 'tsmc', 'asml', 'foundry', 'fab'];

    const semNews = news.filter(item =>
      semKeywords.some(kw => 
        item.title.toLowerCase().includes(kw) ||
        item.content?.toLowerCase().includes(kw)
      )
    );

    // 半导体股票
    const semStocks = ['NVDA', 'AMD', 'INTC', 'TSM', 'ASML', 'MU', 'AVGO', 'QCOM'];

    // 供应链状态
    const supplyChainStatus = this.analyzeSupplyChain(semNews);

    // 需求趋势
    const demandTrend = this.analyzeDemandTrend(semNews, market);

    const keyPlayers = market?.topGainers
      .filter(stock => semStocks.includes(stock.symbol))
      .map(stock => `${stock.symbol} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`) || [];

    const sentiment = this.analyzeSectorSentiment(semNews, market, semStocks);

    return {
      overview: `半导体行业${semNews.length}条动态，供应链${supplyChainStatus.includes('紧张') ? '存在压力' : '运行平稳'}`,
      supplyChainStatus,
      demandTrend,
      keyPlayers,
      sentiment,
      outlook: this.generateSemiconductorOutlook(supplyChainStatus, demandTrend, sentiment),
      investmentImplication: this.generateSemiconductorInvestment(sentiment, market),
    };
  }

  /**
   * 数据中心行业分析
   */
  private analyzeDataCenterSector(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis
  ) {
    const market = baseAnalysis.market;
    const news = data.news?.items || [];

    const dcKeywords = ['data center', 'datacenter', 'cloud', 'hyperscale'];
    const dcNews = news.filter(item =>
      dcKeywords.some(kw => 
        item.title.toLowerCase().includes(kw) ||
        item.content?.toLowerCase().includes(kw)
      )
    );

    const dcStocks = ['ANET', 'VST', 'CEG', 'LEU'];

    const capacityExpansion = dcNews.some(n => n.title.toLowerCase().includes('expand') || n.title.toLowerCase().includes('build'))
      ? '多家企业宣布扩建计划'
      : '产能扩张信息有限';

    const powerDemand = 'AI驱动下数据中心电力需求持续增长';

    const keyStocks = market?.topGainers
      .filter(stock => dcStocks.includes(stock.symbol))
      .map(stock => `${stock.symbol} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`) || [];

    const sentiment = this.analyzeSectorSentiment(dcNews, market, dcStocks);

    return {
      overview: `数据中心行业受AI需求推动，${dcNews.length}条相关动态`,
      capacityExpansion,
      powerDemand,
      keyStocks,
      sentiment,
      outlook: '长期看好，AI算力需求持续增长',
      investmentImplication: '关注基础设施提供商和能源供应链',
    };
  }

  /**
   * 能源行业分析
   */
  private analyzeEnergySector(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis
  ) {
    const market = baseAnalysis.market;
    const news = data.news?.items || [];

    const energyKeywords = ['energy', 'nuclear', 'renewable', 'solar', 'wind', 'oil', 'gas'];
    const energyNews = news.filter(item =>
      energyKeywords.some(kw => 
        item.title.toLowerCase().includes(kw) ||
        item.content?.toLowerCase().includes(kw)
      )
    );

    const energyStocks = ['CEG', 'LEU', 'OKLO', 'BE', 'RKLB'];

    const traditionalEnergy = '传统能源价格波动，关注地缘政治影响';
    const renewableEnergy = '清洁能源转型持续推进';
    const nuclearRenaissance = energyNews.some(n => n.title.toLowerCase().includes('nuclear'))
      ? '小型核反应堆(SMR)获得关注，AI数据中心需求推动'
      : '核能发展值得关注';

    const keyStocks = market?.topGainers
      .filter(stock => energyStocks.includes(stock.symbol))
      .map(stock => `${stock.symbol} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`) || [];

    const sentiment = this.analyzeSectorSentiment(energyNews, market, energyStocks);

    return {
      overview: `能源行业${energyNews.length}条动态，核能复兴势头明显`,
      traditionalEnergy,
      renewableEnergy,
      nuclearRenaissance,
      keyStocks,
      sentiment,
      outlook: 'AI驱动的电力需求将利好清洁能源和核能',
      investmentImplication: '重点关注核能相关标的(CEG, LEU, OKLO)和可再生能源',
    };
  }

  // ==================== 辅助方法 ====================

  private aggregateSentiment(market?: MarketAnalysis, news?: NewsAnalysis): Sentiment {
    if (!market && !news) return 'neutral';
    if (!market) return news!.sentiment;
    if (!news) return market.sentiment;

    // 市场和新闻情绪综合
    if (market.sentiment === news.sentiment) return market.sentiment;
    if (market.sentiment === 'neutral') return news.sentiment;
    if (news.sentiment === 'neutral') return market.sentiment;
    return 'neutral'; // 矛盾时返回中性
  }

  private determineMacroSentiment(economic: EconomicAnalysis): Sentiment {
    if (economic.outlook === 'expansion') return 'bullish';
    if (economic.outlook === 'contraction') return 'bearish';
    return 'neutral';
  }

  private describeMacroImpact(economic: EconomicAnalysis, sentiment: Sentiment): string {
    if (sentiment === 'bullish') {
      return '宏观经济向好，支撑市场继续上涨，利好周期性板块';
    } else if (sentiment === 'bearish') {
      return '宏观经济承压，市场面临下行风险，建议防御性配置';
    }
    return '宏观经济平稳，市场维持震荡，关注结构性机会';
  }

  private determineFedStance(
    economic: EconomicAnalysis | undefined,
    fedNews: DataItem[]
  ): 'hawkish' | 'dovish' | 'neutral' {
    // 基于通胀和就业数据判断
    if (!economic) return 'neutral';

    const inflationHigh = economic.categories.inflation.indicators.some(i =>
      i.trend === 'up' && i.significance === 'high'
    );
    const employmentStrong = economic.categories.employment.indicators.some(i =>
      i.trend === 'up' && i.significance === 'high'
    );

    if (inflationHigh || employmentStrong) return 'hawkish';
    if (!inflationHigh && !employmentStrong) return 'dovish';
    return 'neutral';
  }

  private describeFedImpact(fedStance: string, yieldCurve: string): string {
    if (fedStance === 'hawkish') {
      return '鹰派立场将压制估值，利率敏感板块(科技、成长股)承压';
    } else if (fedStance === 'dovish') {
      return '鸽派立场利好市场，成长股和科技股有望受益';
    }

    if (yieldCurve === 'inverted') {
      return '收益率曲线倒挂警示衰退风险，需保持谨慎';
    }

    return 'Fed立场中性，市场保持观望';
  }

  private describeGeopoliticalImpact(riskLevel: string, sectors: string[]): string {
    if (riskLevel === 'high') {
      return `地缘政治风险升级，${sectors.join('、')}等板块面临不确定性，避险情绪升温`;
    } else if (riskLevel === 'medium') {
      return `地缘政治存在波动，关注${sectors.join('、')}等板块的短期影响`;
    }
    return '地缘政治整体平稳，对市场影响有限';
  }

  private describeRegulatoryImpact(secActions: string[], policies: string[], companies: string[]): string {
    if (secActions.length === 0 && policies.length === 0) {
      return '监管环境平稳';
    }

    let impact = '';
    if (secActions.length > 0) {
      impact += `SEC监管行动${secActions.length}起，`;
    }
    if (policies.length > 0) {
      impact += `新政策${policies.length}项，`;
    }
    if (companies.length > 0) {
      impact += `影响${companies.join('、')}等公司`;
    }

    return impact || '监管动态需持续关注';
  }

  private extractAffectedCompanies(secNews: DataItem[], secFilings: DataItem[]): string[] {
    // 从新闻标题中提取公司名称
    const companies = new Set<string>();
    
    // 简单的公司名称提取逻辑（可以优化）
    const allText = [...secNews, ...secFilings].map(item => item.title).join(' ');
    const stockSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];
    
    stockSymbols.forEach(symbol => {
      if (allText.includes(symbol)) {
        companies.add(symbol);
      }
    });

    return Array.from(companies).slice(0, 5);
  }

  private analyzeSectorSentiment(
    news: DataItem[],
    market: MarketAnalysis | undefined,
    stocks: string[]
  ): Sentiment {
    if (!market) return 'neutral';

    // 计算该板块股票的平均表现
    const sectorStocks = market.topGainers
      .concat(market.topLosers)
      .filter(stock => stocks.includes(stock.symbol));

    if (sectorStocks.length === 0) return 'neutral';

    const avgChange = sectorStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / sectorStocks.length;

    if (avgChange > 1) return 'bullish';
    if (avgChange < -1) return 'bearish';
    return 'neutral';
  }

  private analyzeSupplyChain(news: DataItem[]): string {
    if (news.some(n => 
      n.title.toLowerCase().includes('shortage') ||
      n.title.toLowerCase().includes('constraint')
    )) {
      return '供应链存在紧张信号';
    }
    if (news.some(n => 
      n.title.toLowerCase().includes('capacity') ||
      n.title.toLowerCase().includes('expand')
    )) {
      return '产能扩张进行中';
    }
    return '供应链运行平稳';
  }

  private analyzeDemandTrend(news: DataItem[], market: MarketAnalysis | undefined): string {
    if (news.some(n => 
      n.title.toLowerCase().includes('ai') ||
      n.title.toLowerCase().includes('demand surge')
    )) {
      return 'AI需求推动强劲增长';
    }
    return '需求保持稳定';
  }

  private generateAIOutlook(news: DataItem[], market: MarketAnalysis | undefined, sentiment: Sentiment): string {
    if (sentiment === 'bullish') {
      return 'AI革命持续深化，相关标的长期向好';
    }
    return 'AI行业保持关注，等待更明确信号';
  }

  private generateAIInvestmentImplication(sentiment: Sentiment, market: MarketAnalysis | undefined): string {
    if (sentiment === 'bullish') {
      return '重点配置AI芯片(NVDA, AMD)和应用层(MSFT, GOOGL)';
    }
    return '分批建仓AI龙头，关注回调机会';
  }

  private generateSemiconductorOutlook(supply: string, demand: string, sentiment: Sentiment): string {
    return `${demand}，${supply}，整体前景${sentiment === 'bullish' ? '乐观' : sentiment === 'bearish' ? '谨慎' : '中性'}`;
  }

  private generateSemiconductorInvestment(sentiment: Sentiment, market: MarketAnalysis | undefined): string {
    if (sentiment === 'bullish') {
      return '优选龙头(NVDA, TSM, ASML)，关注设备股(LRCX, AMAT)';
    }
    return '等待行业周期底部信号';
  }

  /**
   * 跨领域关联分析
   */
  private analyzeCrossDomainConnections(
    data: EnhancedAggregatedData,
    baseAnalysis: ComprehensiveAnalysis,
    dimensions: IntelligentAnalysis['dimensions']
  ) {
    const keyConnections: string[] = [];
    const emergingTrends: string[] = [];
    const hiddenRisks: string[] = [];

    // AI与半导体的关联
    if (dimensions.sectorDeepDive.ai.sentiment === 'bullish') {
      keyConnections.push('AI需求持续推动半导体行业景气度');
    }

    // 数据中心与能源的关联
    if (dimensions.sectorDeepDive.dataCenter.powerDemand.includes('增长')) {
      keyConnections.push('数据中心扩张驱动清洁能源和核能需求');
      emergingTrends.push('AI算力竞赛推动电力基础设施投资');
    }

    // Fed政策与科技股的关联
    if (dimensions.monetaryPolicy.fedStance === 'hawkish') {
      hiddenRisks.push('利率上升将压制高估值科技股');
    }

    // 地缘政治与半导体的关联
    if (dimensions.geopolitical.affectedSectors.includes('半导体')) {
      hiddenRisks.push('地缘政治紧张可能影响半导体供应链');
    }

    // 监管与科技巨头的关联
    if (dimensions.regulatory.secActions.length > 0) {
      hiddenRisks.push('监管加强可能影响大型科技公司');
    }

    return {
      keyConnections,
      emergingTrends,
      hiddenRisks,
    };
  }

  /**
   * 生成投资建议
   */
  private generateInvestmentImplications(
    dimensions: IntelligentAnalysis['dimensions'],
    insights: IntelligentAnalysis['crossDomainInsights']
  ) {
    const opportunities: string[] = [];
    const risks: string[] = [];
    const sectorRotation: string[] = [];
    const timingConsiderations: string[] = [];

    // 基于各维度生成建议
    if (dimensions.sectorDeepDive.ai.sentiment === 'bullish') {
      opportunities.push('AI芯片和应用层标的(NVDA, AMD, MSFT, GOOGL)');
    }

    if (dimensions.sectorDeepDive.energy.sentiment === 'bullish') {
      opportunities.push('核能和清洁能源标的(CEG, LEU, OKLO)');
    }

    if (dimensions.monetaryPolicy.fedStance === 'hawkish') {
      risks.push('利率上升压制成长股估值');
      sectorRotation.push('从科技转向防御性板块(消费必需品、公用事业)');
    }

    if (dimensions.geopolitical.riskLevel === 'high') {
      risks.push('地缘政治不确定性增加市场波动');
      sectorRotation.push('增加避险资产配置(黄金、国债)');
    }

    // 时机考量
    if (dimensions.macroEconomic.sentiment === 'bullish' && dimensions.monetaryPolicy.sentiment === 'bullish') {
      timingConsiderations.push('宏观和政策环境双重利好，适合积极配置');
    } else if (dimensions.macroEconomic.sentiment === 'bearish' || dimensions.monetaryPolicy.sentiment === 'bearish') {
      timingConsiderations.push('存在不利因素，建议分批建仓或等待');
    }

    return {
      opportunities,
      risks,
      sectorRotation,
      timingConsiderations,
    };
  }

  /**
   * 识别关键催化剂
   */
  private identifyCatalysts(
    data: EnhancedAggregatedData,
    dimensions: IntelligentAnalysis['dimensions']
  ) {
    const upcoming: string[] = [];
    const monitoring: string[] = [];

    // 基于经济数据
    upcoming.push('下次FOMC会议利率决议');
    upcoming.push('CPI和就业数据发布');

    // 基于行业动态
    if (dimensions.sectorDeepDive.semiconductor.sentiment !== 'neutral') {
      monitoring.push('半导体财报季');
    }

    if (dimensions.sectorDeepDive.ai.keyDevelopments.length > 0) {
      monitoring.push('AI新产品发布和应用进展');
    }

    // 基于政策
    if (dimensions.regulatory.secActions.length > 0) {
      monitoring.push('监管政策进展');
    }

    if (dimensions.geopolitical.riskLevel === 'high') {
      monitoring.push('地缘政治事态发展');
    }

    return {
      upcoming,
      monitoring,
    };
  }

  /**
   * 生成增强的综合摘要
   */
  private generateEnhancedSummary(
    baseAnalysis: ComprehensiveAnalysis,
    dimensions: IntelligentAnalysis['dimensions'],
    insights: IntelligentAnalysis['crossDomainInsights']
  ) {
    const keyPoints: string[] = [];

    // 宏观经济要点
    keyPoints.push(`宏观: ${dimensions.macroEconomic.overview}`);

    // Fed政策要点
    keyPoints.push(`货币政策: ${dimensions.monetaryPolicy.overview}`);

    // 行业要点
    if (dimensions.sectorDeepDive.ai.sentiment === 'bullish') {
      keyPoints.push(`AI: ${dimensions.sectorDeepDive.ai.overview}`);
    }
    if (dimensions.sectorDeepDive.semiconductor.sentiment === 'bullish') {
      keyPoints.push(`半导体: ${dimensions.sectorDeepDive.semiconductor.overview}`);
    }

    // 跨领域洞察
    if (insights.keyConnections.length > 0) {
      keyPoints.push(`关联: ${insights.keyConnections[0]}`);
    }

    const risksAndConcerns = [
      ...insights.hiddenRisks,
      ...(dimensions.geopolitical.riskLevel === 'high' ? [dimensions.geopolitical.overview] : []),
    ];

    const outlook = this.generateOutlookStatement(dimensions, insights);

    return {
      marketCondition: baseAnalysis.market?.condition || 'mixed',
      overallSentiment: this.calculateOverallSentiment(dimensions),
      keyPoints,
      risksAndConcerns,
      outlook,
    };
  }

  private calculateOverallSentiment(dimensions: IntelligentAnalysis['dimensions']): Sentiment {
    const sentiments = [
      dimensions.macroEconomic.sentiment,
      dimensions.monetaryPolicy.sentiment,
      dimensions.sectorDeepDive.ai.sentiment,
      dimensions.sectorDeepDive.semiconductor.sentiment,
      dimensions.sectorDeepDive.energy.sentiment,
    ];

    const bullishCount = sentiments.filter(s => s === 'bullish').length;
    const bearishCount = sentiments.filter(s => s === 'bearish').length;

    if (bullishCount > bearishCount + 1) return 'bullish';
    if (bearishCount > bullishCount + 1) return 'bearish';
    return 'neutral';
  }

  private generateOutlookStatement(
    dimensions: IntelligentAnalysis['dimensions'],
    insights: IntelligentAnalysis['crossDomainInsights']
  ): string {
    const sentiment = this.calculateOverallSentiment(dimensions);

    if (sentiment === 'bullish') {
      return '整体环境利好，AI和清洁能源等结构性机会突出，建议积极配置优质标的';
    } else if (sentiment === 'bearish') {
      return '面临多重不利因素，建议防御性配置，等待更明确的转折信号';
    }
    return '市场处于震荡期，建议均衡配置，关注AI、半导体、能源等结构性机会';
  }

  /**
   * 保存分析结果
   */
  async save(analysis: IntelligentAnalysis, outputDir: string = 'data/processed'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `intelligent-analysis-${timestamp}.json`;
    const filepath = path.join(process.cwd(), outputDir, filename);

    await fs.promises.writeFile(filepath, JSON.stringify(analysis, null, 2), 'utf-8');
    console.log(`[intelligent-analyzer] Analysis saved to: ${filepath}`);

    return filepath;
  }
}

/**
 * 创建智能分析器实例
 */
export function createIntelligentAnalyzer(config?: AnalyzerConfig): IntelligentAnalyzer {
  return new IntelligentAnalyzer(config);
}
