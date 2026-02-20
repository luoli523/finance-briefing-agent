/**
 * 外汇与美债分析器
 * 
 * 提供美元指数、美债收益率、货币对的深度分析
 */

import { CollectedData, QuoteData } from '../collectors/types';
import { BaseAnalyzer } from './base';
import { AnalyzerConfig } from './types';

// 美债收益率分析结果
export interface TreasuryYieldAnalysis {
  yields: Record<string, {
    rate: number;
    change: number;
    changePercent: number;
    trend: 'rising' | 'falling' | 'stable';
  }>;
  yieldCurve: {
    shape: 'normal' | 'inverted' | 'flat' | 'steep';
    spread2Y10Y: number;  // 2年期与10年期利差
    spread10Y30Y: number; // 10年期与30年期利差
    interpretation: string;
  };
  volatility: {
    level: 'low' | 'medium' | 'high';
    description: string;
  };
  marketImplications: string[];
  risks: string[];
  outlook: string;
}

// 美元指数分析结果
export interface DollarIndexAnalysis {
  current: number;
  change: number;
  changePercent: number;
  trend: 'strengthening' | 'weakening' | 'stable';
  level: 'strong' | 'moderate' | 'weak';
  interpretation: string;
  implications: string[];
}

// 货币对分析结果
export interface CurrencyPairAnalysis {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  trend: 'usd_strengthening' | 'usd_weakening' | 'stable';
  interpretation: string;
}

// 综合外汇分析结果
export interface ForexAnalysis {
  timestamp: Date;
  dollarIndex: DollarIndexAnalysis | null;
  treasuryYields: TreasuryYieldAnalysis | null;
  currencyPairs: Record<string, CurrencyPairAnalysis>;
  overallAssessment: {
    dollarStrength: 'strong' | 'moderate' | 'weak';
    rateEnvironment: 'rising' | 'falling' | 'stable';
    marketSentiment: 'risk-on' | 'risk-off' | 'neutral';
    keyTakeaways: string[];
    tradingGuidance: string[];
  };
}

/**
 * 外汇与美债分析器
 */
export class ForexAnalyzer extends BaseAnalyzer<ForexAnalysis> {
  readonly name = 'forex-analyzer';

  constructor(config: AnalyzerConfig = {}) {
    super(config);
  }

  /**
   * 分析外汇数据
   */
  async analyze(data: CollectedData): Promise<ForexAnalysis> {
    this.log('Starting forex analysis...');

    const metadata = data.metadata || {};
    
    // 分析美元指数
    const dollarIndex = this.analyzeDollarIndex(metadata.dollarIndex);
    
    // 分析美债收益率
    const treasuryYields = this.analyzeTreasuryYields(metadata.treasuryYields);
    
    // 分析货币对
    const currencyPairs = this.analyzeCurrencyPairs(metadata.currencyPairs);
    
    // 综合评估
    const overallAssessment = this.generateOverallAssessment(
      dollarIndex,
      treasuryYields,
      currencyPairs
    );

    const result: ForexAnalysis = {
      timestamp: new Date(),
      dollarIndex,
      treasuryYields,
      currencyPairs,
      overallAssessment,
    };

    this.log('Forex analysis completed');
    return result;
  }

  /**
   * 分析美元指数
   */
  private analyzeDollarIndex(data: QuoteData | null): DollarIndexAnalysis | null {
    if (!data) return null;

    const change = data.change || 0;
    const changePercent = data.changePercent || 0;
    const current = data.price;

    // 判断趋势
    let trend: 'strengthening' | 'weakening' | 'stable';
    if (Math.abs(changePercent) < 0.2) {
      trend = 'stable';
    } else if (changePercent > 0) {
      trend = 'strengthening';
    } else {
      trend = 'weakening';
    }

    // 判断水平（基于历史区间）
    let level: 'strong' | 'moderate' | 'weak';
    if (current > 105) {
      level = 'strong';
    } else if (current > 95) {
      level = 'moderate';
    } else {
      level = 'weak';
    }

    // 生成解读
    const interpretation = this.interpretDollarIndex(current, trend, changePercent);
    
    // 生成市场影响
    const implications = this.generateDollarImplications(trend, level);

    return {
      current,
      change,
      changePercent,
      trend,
      level,
      interpretation,
      implications,
    };
  }

  /**
   * 分析美债收益率
   */
  private analyzeTreasuryYields(
    data: Record<string, QuoteData> | undefined
  ): TreasuryYieldAnalysis | null {
    if (!data || Object.keys(data).length === 0) return null;

    // 提取各期限收益率
    const yields: Record<string, any> = {};
    
    for (const [period, quote] of Object.entries(data)) {
      const change = quote.change || 0;
      const changePercent = quote.changePercent || 0;
      
      let trend: 'rising' | 'falling' | 'stable';
      if (Math.abs(changePercent) < 2) {
        trend = 'stable';
      } else if (changePercent > 0) {
        trend = 'rising';
      } else {
        trend = 'falling';
      }

      yields[period] = {
        rate: quote.price,
        change,
        changePercent,
        trend,
      };
    }

    // 分析收益率曲线
    const yieldCurve = this.analyzeYieldCurve(yields);
    
    // 分析波动性
    const volatility = this.analyzeYieldVolatility(yields);
    
    // 生成市场含义
    const marketImplications = this.generateYieldImplications(yields, yieldCurve);
    
    // 识别风险
    const risks = this.identifyYieldRisks(yieldCurve, volatility);
    
    // 生成展望
    const outlook = this.generateYieldOutlook(yields, yieldCurve);

    return {
      yields,
      yieldCurve,
      volatility,
      marketImplications,
      risks,
      outlook,
    };
  }

  /**
   * 分析收益率曲线
   */
  private analyzeYieldCurve(yields: Record<string, any>): TreasuryYieldAnalysis['yieldCurve'] {
    // 2Y 收益率优先使用 Yahoo Finance 数据，fallback 到 3M 近似短端
    const y2 = yields['2Y']?.rate || yields['3M']?.rate || 0;
    const y10 = yields['10Y']?.rate || 0;
    const y30 = yields['30Y']?.rate || 0;

    const spread2Y10Y = y10 - y2;
    const spread10Y30Y = y30 - y10;

    // 判断曲线形态
    let shape: 'normal' | 'inverted' | 'flat' | 'steep';
    let interpretation: string;

    if (spread2Y10Y < -0.2) {
      shape = 'inverted';
      interpretation = '收益率曲线倒挂，这是经济衰退的经典预警信号。历史上，倒挂后12-18个月内往往出现经济衰退。当前市场定价反映了对未来经济增长放缓和美联储降息的预期。';
    } else if (spread2Y10Y < 0.2) {
      shape = 'flat';
      interpretation = '收益率曲线趋平，表明市场对短期和长期经济前景的分歧不大。这可能意味着经济增长预期疲软，或美联储政策接近中性利率。';
    } else if (spread2Y10Y > 1.0) {
      shape = 'steep';
      interpretation = '收益率曲线陡峭，通常出现在经济复苏初期。市场预期短期利率将保持低位，而长期经济增长和通胀前景改善，这对风险资产（如股票）通常是利好信号。';
    } else {
      shape = 'normal';
      interpretation = '收益率曲线呈正常形态，长期利率高于短期利率，反映了健康的经济预期。这种环境下，银行盈利能力较强，信贷扩张有利于经济增长。';
    }

    return {
      shape,
      spread2Y10Y,
      spread10Y30Y,
      interpretation,
    };
  }

  /**
   * 分析收益率波动性
   */
  private analyzeYieldVolatility(yields: Record<string, any>): TreasuryYieldAnalysis['volatility'] {
    // 计算平均变化幅度
    const changes = Object.values(yields).map((y: any) => Math.abs(y.changePercent || 0));
    const avgChange = changes.reduce((a: number, b: number) => a + b, 0) / changes.length;

    let level: 'low' | 'medium' | 'high';
    let description: string;

    if (avgChange < 2) {
      level = 'low';
      description = '美债收益率波动较小，市场情绪稳定，投资者对经济和政策前景有较清晰的共识。这种低波动环境通常有利于风险资产配置。';
    } else if (avgChange < 5) {
      level = 'medium';
      description = '美债收益率出现温和波动，反映市场正在消化新的经济数据或政策信号。投资者应关注波动背后的驱动因素，调整投资组合的久期敞口。';
    } else {
      level = 'high';
      description = '美债收益率剧烈波动，通常由重大经济数据意外、美联储政策转向、或地缘政治危机引发。高波动环境下，建议增加避险资产配置，缩短债券久期，降低杠杆。';
    }

    return { level, description };
  }

  /**
   * 生成美债收益率市场含义
   */
  private generateYieldImplications(
    yields: Record<string, any>,
    yieldCurve: TreasuryYieldAnalysis['yieldCurve']
  ): string[] {
    const implications: string[] = [];

    // 10年期收益率水平分析
    const y10 = yields['10Y']?.rate || 0;
    if (y10 > 4.5) {
      implications.push('📈 **融资成本高企**：10年期美债收益率超过4.5%，企业和购房者融资成本显著上升，可能抑制投资和消费需求。');
    } else if (y10 < 3.5) {
      implications.push('📉 **低利率环境**：10年期美债收益率低于3.5%，有利于降低融资成本，支持经济增长和资产价格上涨。');
    }

    // 收益率趋势分析
    const y10Trend = yields['10Y']?.trend;
    if (y10Trend === 'rising') {
      implications.push('⬆️ **利率上行压力**：美债收益率上升可能由通胀担忧、美联储鹰派政策、或经济增长超预期驱动。这对高估值成长股（如科技股）构成压力，但有利于金融股。');
    } else if (y10Trend === 'falling') {
      implications.push('⬇️ **利率下行趋势**：美债收益率下降可能反映避险需求上升、经济增长放缓、或美联储转向宽松。这通常利好黄金、科技股等久期资产。');
    }

    // 收益率曲线形态影响
    if (yieldCurve.shape === 'inverted') {
      implications.push('⚠️ **衰退风险上升**：收益率曲线倒挂是最可靠的衰退预警信号之一。建议增加防御性配置，关注消费必需品、公用事业等板块。');
    } else if (yieldCurve.shape === 'steep') {
      implications.push('🚀 **复苏信号增强**：陡峭的收益率曲线通常预示经济复苏加速。周期性行业（工业、原材料）和小盘股可能表现优异。');
    }

    // 实际利率分析（如果有通胀数据）
    if (y10 > 4.0) {
      implications.push('💰 **实际利率考量**：名义利率较高时，需关注实际利率（名义利率 - 通胀预期）。如果实际利率过高，可能抑制经济活动和风险资产估值。');
    }

    return implications;
  }

  /**
   * 识别美债收益率风险
   */
  private identifyYieldRisks(
    yieldCurve: TreasuryYieldAnalysis['yieldCurve'],
    volatility: TreasuryYieldAnalysis['volatility']
  ): string[] {
    const risks: string[] = [];

    if (yieldCurve.shape === 'inverted') {
      risks.push('🔴 **经济衰退风险**：收益率曲线倒挂历史上是经济衰退的可靠领先指标。');
    }

    if (volatility.level === 'high') {
      risks.push('🟡 **市场不确定性**：利率剧烈波动增加了投资组合的不确定性，可能触发流动性危机。');
    }

    if (yieldCurve.spread2Y10Y > 2.0) {
      risks.push('🟡 **过度陡峭风险**：收益率曲线过度陡峭可能反映通胀失控担忧，需警惕美联储激进加息。');
    }

    if (risks.length === 0) {
      risks.push('🟢 **风险可控**：当前美债收益率环境相对稳定，未发现重大风险信号。');
    }

    return risks;
  }

  /**
   * 生成美债收益率展望
   */
  private generateYieldOutlook(
    yields: Record<string, any>,
    yieldCurve: TreasuryYieldAnalysis['yieldCurve']
  ): string {
    const y10 = yields['10Y']?.rate || 0;
    const y10Trend = yields['10Y']?.trend || 'stable';

    let outlook = '';

    if (yieldCurve.shape === 'inverted') {
      outlook = '**谨慎偏空**：收益率曲线倒挂预示经济可能在未来12-18个月内进入衰退。建议增加现金和短期国债配置，减少周期性股票敞口。一旦曲线重新陡峭化（短端利率快速下降），可能是经济底部信号。';
    } else if (y10Trend === 'rising' && y10 > 4.5) {
      outlook = '**偏空风险资产**：美债收益率持续上行且处于高位，融资成本压力增大。建议关注估值合理、现金流稳定的优质公司，避免高杠杆和高估值标的。金融股可能受益于利差扩大。';
    } else if (y10Trend === 'falling' && yieldCurve.shape === 'steep') {
      outlook = '**偏多配置**：短端利率下降但长端保持稳定，形成陡峭曲线，这是经济复苏初期的典型特征。建议增加周期性行业和小盘股配置，这些板块在复苏初期通常表现出色。';
    } else if (yieldCurve.shape === 'flat') {
      outlook = '**中性观望**：收益率曲线平坦，市场对经济前景缺乏明确方向。建议保持平衡配置，等待更明确的经济或政策信号再调整仓位。';
    } else {
      outlook = '**温和乐观**：收益率曲线形态正常，利率水平适中，有利于经济稳健增长。建议维持均衡的股债配置，适度增加优质成长股敞口。';
    }

    return outlook;
  }

  /**
   * 分析货币对
   */
  private analyzeCurrencyPairs(
    data: Record<string, QuoteData> | undefined
  ): Record<string, CurrencyPairAnalysis> {
    const result: Record<string, CurrencyPairAnalysis> = {};

    if (!data) return result;

    for (const [pair, quote] of Object.entries(data)) {
      const change = quote.change || 0;
      const changePercent = quote.changePercent || 0;

      let trend: 'usd_strengthening' | 'usd_weakening' | 'stable';
      if (Math.abs(changePercent) < 0.3) {
        trend = 'stable';
      } else if (changePercent > 0) {
        trend = 'usd_strengthening';
      } else {
        trend = 'usd_weakening';
      }

      const interpretation = this.interpretCurrencyPair(pair, quote.price, trend);

      result[pair] = {
        pair,
        rate: quote.price,
        change,
        changePercent,
        trend,
        interpretation,
      };
    }

    return result;
  }

  /**
   * 解读美元指数
   */
  private interpretDollarIndex(
    current: number,
    trend: string,
    changePercent: number
  ): string {
    const trendText = trend === 'strengthening' ? '走强' : trend === 'weakening' ? '走弱' : '持稳';
    const changeText = changePercent >= 0 ? `上涨${changePercent.toFixed(2)}%` : `下跌${Math.abs(changePercent).toFixed(2)}%`;

    return `美元指数当前报${current.toFixed(2)}，${changeText}，呈${trendText}态势。${this.getDollarLevelContext(current)}`;
  }

  /**
   * 获取美元指数水平背景
   */
  private getDollarLevelContext(level: number): string {
    if (level > 110) {
      return '美元处于极强水平，可能对新兴市场和大宗商品形成压力，但有利于美国进口和抑制通胀。';
    } else if (level > 105) {
      return '美元处于强势区间，对跨国公司海外收入换算形成一定拖累，但增强了美国购买力。';
    } else if (level > 100) {
      return '美元处于中性偏强水平，反映了相对稳健的美国经济基本面。';
    } else if (level > 95) {
      return '美元处于中性偏弱水平，可能有利于美国出口和跨国公司海外收入。';
    } else {
      return '美元处于弱势，有利于美国出口竞争力和跨国企业盈利，但可能加剧输入性通胀压力。';
    }
  }

  /**
   * 生成美元指数影响
   */
  private generateDollarImplications(
    trend: string,
    level: string
  ): string[] {
    const implications: string[] = [];

    if (trend === 'strengthening') {
      implications.push('📈 **美元走强影响**：可能对黄金、原油等大宗商品形成压力；跨国公司海外收入换算受损；新兴市场资本外流风险上升。');
      if (level === 'strong') {
        implications.push('⚠️ **新兴市场压力**：强势美元增加新兴市场美元债务负担，需警惕流动性危机。');
      }
    } else if (trend === 'weakening') {
      implications.push('📉 **美元走弱影响**：有利于黄金、大宗商品；美国跨国公司海外收入增厚；新兴市场获得喘息机会。');
      implications.push('💰 **通胀考量**：美元贬值可能加剧输入性通胀，需关注美联储政策反应。');
    }

    return implications;
  }

  /**
   * 解读货币对
   */
  private interpretCurrencyPair(pair: string, rate: number, trend: string): string {
    const trendText = trend === 'usd_strengthening' ? '美元相对走强' : 
                     trend === 'usd_weakening' ? '美元相对走弱' : '波动不大';

    let context = '';
    switch (pair) {
      case 'USDCHF':
        context = '瑞郎是传统避险货币，美元兑瑞郎上涨通常反映美元避险需求或美国利率优势。';
        break;
      case 'USDSGD':
        context = '新加坡元与区域经济和贸易紧密相关，该汇率反映了亚太地区经济活力和美元强弱。';
        break;
      case 'USDJPY':
        context = '日元是重要的套息交易货币，USDJPY上涨意味着利差扩大或风险偏好上升。当前利差环境下，该货币对对美联储和日本央行政策变化高度敏感。';
        break;
      case 'USDCNH':
        context = '人民币汇率受中美经济周期差异、贸易局势、资本流动等多重因素影响。该汇率是观察中国经济和政策预期的重要窗口。';
        break;
    }

    return `${pair}当前报${rate.toFixed(4)}，${trendText}。${context}`;
  }

  /**
   * 生成综合评估
   */
  private generateOverallAssessment(
    dollarIndex: DollarIndexAnalysis | null,
    treasuryYields: TreasuryYieldAnalysis | null,
    currencyPairs: Record<string, CurrencyPairAnalysis>
  ): ForexAnalysis['overallAssessment'] {
    // 判断美元强度
    const dollarStrength = dollarIndex?.level || 'moderate';

    // 判断利率环境
    let rateEnvironment: 'rising' | 'falling' | 'stable' = 'stable';
    if (treasuryYields) {
      const y10Trend = treasuryYields.yields['10Y']?.trend;
      rateEnvironment = y10Trend === 'rising' ? 'rising' : 
                       y10Trend === 'falling' ? 'falling' : 'stable';
    }

    // 判断市场情绪
    let marketSentiment: 'risk-on' | 'risk-off' | 'neutral' = 'neutral';
    if (dollarIndex && treasuryYields) {
      if (dollarIndex.trend === 'strengthening' && 
          treasuryYields.yieldCurve.shape === 'inverted') {
        marketSentiment = 'risk-off';
      } else if (dollarIndex.trend === 'weakening' && 
                treasuryYields.yieldCurve.shape === 'steep') {
        marketSentiment = 'risk-on';
      }
    }

    // 生成关键要点
    const keyTakeaways = this.generateKeyTakeaways(
      dollarIndex,
      treasuryYields,
      currencyPairs
    );

    // 生成交易指引
    const tradingGuidance = this.generateTradingGuidance(
      dollarStrength,
      rateEnvironment,
      marketSentiment,
      treasuryYields
    );

    return {
      dollarStrength,
      rateEnvironment,
      marketSentiment,
      keyTakeaways,
      tradingGuidance,
    };
  }

  /**
   * 生成关键要点
   */
  private generateKeyTakeaways(
    dollarIndex: DollarIndexAnalysis | null,
    treasuryYields: TreasuryYieldAnalysis | null,
    currencyPairs: Record<string, CurrencyPairAnalysis>
  ): string[] {
    const takeaways: string[] = [];

    if (dollarIndex) {
      const directionText = dollarIndex.trend === 'strengthening' ? '走强' : 
                           dollarIndex.trend === 'weakening' ? '走弱' : '持稳';
      takeaways.push(`💵 美元指数${directionText}至${dollarIndex.current.toFixed(2)}，处于${dollarIndex.level === 'strong' ? '强势' : dollarIndex.level === 'weak' ? '弱势' : '中性'}水平`);
    }

    if (treasuryYields) {
      const y10 = treasuryYields.yields['10Y'];
      if (y10) {
        const trendText = y10.trend === 'rising' ? '上行' : y10.trend === 'falling' ? '下行' : '稳定';
        takeaways.push(`📊 10年期美债收益率${y10.rate.toFixed(2)}%（${trendText}），收益率曲线呈${this.getShapeText(treasuryYields.yieldCurve.shape)}形态`);
      }
    }

    if (Object.keys(currencyPairs).length > 0) {
      const strongCount = Object.values(currencyPairs).filter(p => p.trend === 'usd_strengthening').length;
      const weakCount = Object.values(currencyPairs).filter(p => p.trend === 'usd_weakening').length;
      
      if (strongCount > weakCount) {
        takeaways.push(`🌍 主要货币对显示美元广泛走强，反映美元需求旺盛`);
      } else if (weakCount > strongCount) {
        takeaways.push(`🌍 主要货币对显示美元走弱，其他货币相对升值`);
      } else {
        takeaways.push(`🌍 主要货币对走势分化，市场对美元方向存在分歧`);
      }
    }

    return takeaways;
  }

  /**
   * 生成交易指引
   */
  private generateTradingGuidance(
    dollarStrength: string,
    rateEnvironment: string,
    marketSentiment: string,
    treasuryYields: TreasuryYieldAnalysis | null
  ): string[] {
    const guidance: string[] = [];

    // 基于市场情绪的指引
    if (marketSentiment === 'risk-off') {
      guidance.push('🛡️ **防御为主**：当前环境偏向避险，建议增持美债、黄金等避险资产，降低高风险敞口');
      guidance.push('📉 **警惕衰退**：关注经济领先指标，适当配置防御性板块（公用事业、必需消费品）');
    } else if (marketSentiment === 'risk-on') {
      guidance.push('📈 **风险偏好回升**：可适度增加风险资产配置，关注周期性行业和新兴市场机会');
      guidance.push('💎 **关注价值修复**：利率下行环境利好久期资产，科技成长股和长久期债券或有表现');
    }

    // 基于利率环境的指引
    if (rateEnvironment === 'rising') {
      guidance.push('⬆️ **利率上行应对**：缩短债券久期，增加浮动利率资产；关注金融股机会，谨慎对待高估值成长股');
    } else if (rateEnvironment === 'falling') {
      guidance.push('⬇️ **利率下行机会**：延长债券久期锁定收益；科技、房地产等利率敏感板块可能受益');
    }

    // 基于美元强度的指引
    if (dollarStrength === 'strong') {
      guidance.push('💵 **强美元策略**：关注纯内需企业；谨慎对待海外收入占比高的跨国公司；新兴市场需谨慎');
    } else if (dollarStrength === 'weak') {
      guidance.push('💵 **弱美元机会**：跨国公司海外收入受益；黄金、大宗商品、新兴市场或有机会');
    }

    // 基于收益率曲线的特殊指引
    if (treasuryYields?.yieldCurve.shape === 'inverted') {
      guidance.push('⚠️ **倒挂警示**：收益率曲线倒挂是衰退预警，建议提高现金比例，等待曲线重新陡峭化后布局复苏主题');
    }

    return guidance;
  }

  /**
   * 获取收益率曲线形态文本
   */
  private getShapeText(shape: string): string {
    switch (shape) {
      case 'inverted': return '倒挂';
      case 'flat': return '平坦';
      case 'steep': return '陡峭';
      case 'normal': return '正常';
      default: return shape;
    }
  }
}

/**
 * 创建外汇分析器
 */
export function createForexAnalyzer(config?: AnalyzerConfig): ForexAnalyzer {
  return new ForexAnalyzer(config);
}
