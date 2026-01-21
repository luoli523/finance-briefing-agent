import { CollectedData, EconomicDataPoint } from '../collectors/types';
import { BaseAnalyzer } from './base';
import {
  EconomicAnalysis,
  IndicatorAnalysis,
  AnalyzerConfig,
} from './types';

// 指标重要性配置
const INDICATOR_CONFIG: Record<string, {
  significance: 'high' | 'medium' | 'low';
  category: 'employment' | 'inflation' | 'rates' | 'sentiment' | 'growth';
  goodDirection: 'up' | 'down' | 'stable';
  threshold: number; // 显著变化阈值
}> = {
  'UNRATE': { significance: 'high', category: 'employment', goodDirection: 'down', threshold: 0.2 },
  'ICSA': { significance: 'medium', category: 'employment', goodDirection: 'down', threshold: 10 },
  'PAYEMS': { significance: 'high', category: 'employment', goodDirection: 'up', threshold: 50 },
  'CPIAUCSL': { significance: 'high', category: 'inflation', goodDirection: 'stable', threshold: 0.3 },
  'CPILFESL': { significance: 'high', category: 'inflation', goodDirection: 'stable', threshold: 0.2 },
  'PCEPI': { significance: 'high', category: 'inflation', goodDirection: 'stable', threshold: 0.2 },
  'FEDFUNDS': { significance: 'high', category: 'rates', goodDirection: 'stable', threshold: 0.25 },
  'DGS10': { significance: 'high', category: 'rates', goodDirection: 'stable', threshold: 0.1 },
  'DGS2': { significance: 'medium', category: 'rates', goodDirection: 'stable', threshold: 0.1 },
  'T10Y2Y': { significance: 'high', category: 'rates', goodDirection: 'up', threshold: 0.1 },
  'UMCSENT': { significance: 'medium', category: 'sentiment', goodDirection: 'up', threshold: 2 },
  'GDP': { significance: 'high', category: 'growth', goodDirection: 'up', threshold: 0.5 },
  'GDPC1': { significance: 'high', category: 'growth', goodDirection: 'up', threshold: 0.5 },
};

/**
 * 宏观经济数据分析器
 */
export class EconomicAnalyzer extends BaseAnalyzer<EconomicAnalysis> {
  readonly name = 'economic-analyzer';

  constructor(config: AnalyzerConfig = {}) {
    super(config);
  }

  /**
   * 分析经济数据
   */
  async analyze(data: CollectedData): Promise<EconomicAnalysis> {
    this.log('Starting economic analysis...');

    const dataPoints = data.items.map(item => item.metadata as EconomicDataPoint);

    // 分析各指标
    const indicators = dataPoints.map(dp => this.analyzeIndicator(dp));

    // 按类别分组
    const categories = this.categorizeIndicators(indicators);

    // 判断经济展望
    const outlook = this.determineOutlook(indicators);

    // 提取关键指标
    const keyIndicators = indicators.filter(i => i.significance === 'high');

    // 生成关键发现
    const highlights = this.generateHighlights(indicators, categories);

    // 检测风险因素
    const riskFactors = this.detectRiskFactors(indicators, categories);

    const result: EconomicAnalysis = {
      timestamp: new Date(),
      outlook,
      keyIndicators,
      categories,
      highlights,
      riskFactors,
    };

    this.log('Economic analysis completed');
    return result;
  }

  /**
   * 分析单个指标
   */
  private analyzeIndicator(dp: EconomicDataPoint): IndicatorAnalysis {
    const config = INDICATOR_CONFIG[dp.seriesId];
    const significance = config?.significance || 'low';

    return {
      seriesId: dp.seriesId,
      name: dp.name,
      value: dp.value,
      previousValue: dp.previousValue,
      change: dp.change,
      changePercent: dp.changePercent,
      trend: this.getTrend(dp.change || 0),
      significance,
      interpretation: this.interpretIndicator(dp),
    };
  }

  /**
   * 解读指标含义
   */
  private interpretIndicator(dp: EconomicDataPoint): string {
    const config = INDICATOR_CONFIG[dp.seriesId];
    if (!config) return `${dp.name}: ${dp.value.toFixed(2)} ${dp.unit}`;

    const change = dp.change || 0;
    const isSignificant = Math.abs(change) >= config.threshold;

    switch (dp.seriesId) {
      case 'UNRATE':
        if (dp.value < 4) return `失业率 ${dp.value.toFixed(1)}%，劳动力市场紧张`;
        if (dp.value > 5) return `失业率 ${dp.value.toFixed(1)}%，就业市场疲软`;
        return `失业率 ${dp.value.toFixed(1)}%，处于健康水平`;

      case 'FEDFUNDS':
        return `联邦基金利率 ${dp.value.toFixed(2)}%`;

      case 'DGS10':
        return `10年期国债收益率 ${dp.value.toFixed(2)}%`;

      case 'T10Y2Y':
        if (dp.value < 0) return `收益率曲线倒挂 (${dp.value.toFixed(2)}%)，经济衰退预警信号`;
        if (dp.value < 0.5) return `收益率曲线趋平 (${dp.value.toFixed(2)}%)，需关注`;
        return `收益率曲线正常 (${dp.value.toFixed(2)}%)`;

      case 'UMCSENT':
        if (dp.value > 100) return `消费者信心指数 ${dp.value.toFixed(1)}，乐观`;
        if (dp.value < 70) return `消费者信心指数 ${dp.value.toFixed(1)}，悲观`;
        return `消费者信心指数 ${dp.value.toFixed(1)}，中性`;

      case 'ICSA':
        if (change && isSignificant) {
          const direction = change > 0 ? '增加' : '减少';
          return `初请失业金 ${(dp.value / 1000).toFixed(0)}K，${direction} ${Math.abs(change / 1000).toFixed(0)}K`;
        }
        return `初请失业金 ${(dp.value / 1000).toFixed(0)}K`;

      default:
        if (change && isSignificant) {
          const direction = change > 0 ? '上升' : '下降';
          return `${dp.name} ${direction}至 ${dp.value.toFixed(2)} ${dp.unit}`;
        }
        return `${dp.name}: ${dp.value.toFixed(2)} ${dp.unit}`;
    }
  }

  /**
   * 按类别分组指标
   */
  private categorizeIndicators(indicators: IndicatorAnalysis[]): EconomicAnalysis['categories'] {
    const getIndicators = (category: string) =>
      indicators.filter(i => INDICATOR_CONFIG[i.seriesId]?.category === category);

    const employment = getIndicators('employment');
    const inflation = getIndicators('inflation');
    const rates = getIndicators('rates');
    const sentiment = getIndicators('sentiment');

    // 判断收益率曲线状态
    const spread = indicators.find(i => i.seriesId === 'T10Y2Y');
    let yieldCurve: 'normal' | 'inverted' | 'flat' = 'normal';
    if (spread) {
      if (spread.value < 0) yieldCurve = 'inverted';
      else if (spread.value < 0.5) yieldCurve = 'flat';
    }

    return {
      employment: {
        summary: this.summarizeEmployment(employment),
        indicators: employment,
      },
      inflation: {
        summary: this.summarizeInflation(inflation),
        indicators: inflation,
      },
      rates: {
        summary: this.summarizeRates(rates),
        yieldCurve,
        indicators: rates,
      },
      sentiment: {
        summary: this.summarizeSentiment(sentiment),
        indicators: sentiment,
      },
    };
  }

  /**
   * 就业摘要
   */
  private summarizeEmployment(indicators: IndicatorAnalysis[]): string {
    const unrate = indicators.find(i => i.seriesId === 'UNRATE');
    if (!unrate) return '就业数据暂缺';

    if (unrate.value < 4) return '劳动力市场强劲';
    if (unrate.value > 5) return '就业市场承压';
    return '就业市场稳定';
  }

  /**
   * 通胀摘要
   */
  private summarizeInflation(indicators: IndicatorAnalysis[]): string {
    // CPI 通常以年化增长率表示，这里是指数值
    // 简化处理
    return '通胀数据需结合同比变化分析';
  }

  /**
   * 利率摘要
   */
  private summarizeRates(indicators: IndicatorAnalysis[]): string {
    const fedFunds = indicators.find(i => i.seriesId === 'FEDFUNDS');
    const spread = indicators.find(i => i.seriesId === 'T10Y2Y');

    const parts: string[] = [];

    if (fedFunds) {
      parts.push(`联邦基金利率 ${fedFunds.value.toFixed(2)}%`);
    }

    if (spread) {
      if (spread.value < 0) {
        parts.push('收益率曲线倒挂');
      } else if (spread.value < 0.5) {
        parts.push('收益率曲线趋平');
      }
    }

    return parts.join('，') || '利率数据暂缺';
  }

  /**
   * 信心摘要
   */
  private summarizeSentiment(indicators: IndicatorAnalysis[]): string {
    const umcsent = indicators.find(i => i.seriesId === 'UMCSENT');
    if (!umcsent) return '信心数据暂缺';

    if (umcsent.value > 100) return '消费者信心高涨';
    if (umcsent.value < 70) return '消费者信心低迷';
    return '消费者信心中性';
  }

  /**
   * 判断经济展望
   */
  private determineOutlook(indicators: IndicatorAnalysis[]): 'expansion' | 'contraction' | 'stable' {
    const spread = indicators.find(i => i.seriesId === 'T10Y2Y');
    const unrate = indicators.find(i => i.seriesId === 'UNRATE');
    const sentiment = indicators.find(i => i.seriesId === 'UMCSENT');

    let expansionSignals = 0;
    let contractionSignals = 0;

    // 收益率曲线
    if (spread) {
      if (spread.value < 0) contractionSignals += 2;
      else if (spread.value > 1) expansionSignals += 1;
    }

    // 失业率
    if (unrate) {
      if (unrate.value < 4) expansionSignals += 1;
      if (unrate.value > 5) contractionSignals += 1;
      if (unrate.change && unrate.change > 0.3) contractionSignals += 1;
    }

    // 消费者信心
    if (sentiment) {
      if (sentiment.value > 100) expansionSignals += 1;
      if (sentiment.value < 70) contractionSignals += 1;
    }

    if (contractionSignals >= 3) return 'contraction';
    if (expansionSignals >= 2) return 'expansion';
    return 'stable';
  }

  /**
   * 生成关键发现
   */
  private generateHighlights(
    indicators: IndicatorAnalysis[],
    categories: EconomicAnalysis['categories']
  ): string[] {
    const highlights: string[] = [];

    // 收益率曲线
    if (categories.rates.yieldCurve === 'inverted') {
      highlights.push('⚠️ 收益率曲线倒挂，历史上是经济衰退的领先指标');
    }

    // 失业率
    const unrate = indicators.find(i => i.seriesId === 'UNRATE');
    if (unrate) {
      if (unrate.value < 4) {
        highlights.push(`失业率仅 ${unrate.value.toFixed(1)}%，劳动力市场非常紧张`);
      }
      if (unrate.change && unrate.change >= 0.2) {
        highlights.push(`失业率上升 ${unrate.change.toFixed(1)} 个百分点，就业市场有所降温`);
      }
    }

    // 联邦基金利率
    const fedFunds = indicators.find(i => i.seriesId === 'FEDFUNDS');
    if (fedFunds && fedFunds.value >= 5) {
      highlights.push(`联邦基金利率维持在 ${fedFunds.value.toFixed(2)}% 高位`);
    }

    // 消费者信心
    const sentiment = indicators.find(i => i.seriesId === 'UMCSENT');
    if (sentiment) {
      if (sentiment.change && Math.abs(sentiment.change) >= 5) {
        const direction = sentiment.change > 0 ? '大幅上升' : '大幅下降';
        highlights.push(`消费者信心指数${direction}，当前 ${sentiment.value.toFixed(1)}`);
      }
    }

    return highlights;
  }

  /**
   * 检测风险因素
   */
  private detectRiskFactors(
    indicators: IndicatorAnalysis[],
    categories: EconomicAnalysis['categories']
  ): string[] {
    const risks: string[] = [];

    // 收益率曲线倒挂
    if (categories.rates.yieldCurve === 'inverted') {
      risks.push('收益率曲线倒挂预示经济可能放缓');
    }

    // 失业率上升
    const unrate = indicators.find(i => i.seriesId === 'UNRATE');
    if (unrate && unrate.change && unrate.change >= 0.3) {
      risks.push('失业率快速上升，经济可能降温');
    }

    // 消费者信心骤降
    const sentiment = indicators.find(i => i.seriesId === 'UMCSENT');
    if (sentiment && sentiment.value < 60) {
      risks.push('消费者信心极度低迷，消费支出可能受影响');
    }

    // 高利率环境
    const fedFunds = indicators.find(i => i.seriesId === 'FEDFUNDS');
    const dgs10 = indicators.find(i => i.seriesId === 'DGS10');
    if (fedFunds && fedFunds.value >= 5 && dgs10 && dgs10.value >= 4.5) {
      risks.push('高利率环境持续，企业融资成本压力大');
    }

    return risks;
  }
}
