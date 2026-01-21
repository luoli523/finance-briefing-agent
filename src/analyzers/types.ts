/**
 * 分析器类型定义
 */

// 趋势方向
export type TrendDirection = 'up' | 'down' | 'neutral';

// 信号强度
export type SignalStrength = 'strong' | 'moderate' | 'weak';

// 情感倾向
export type Sentiment = 'bullish' | 'bearish' | 'neutral';

// 市场状态
export type MarketCondition = 'risk-on' | 'risk-off' | 'mixed';

// ===== 市场分析结果 =====

// 单个股票/指数分析
export interface AssetAnalysis {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  trend: TrendDirection;
  strength: SignalStrength;
  notes?: string;
}

// 板块分析
export interface SectorAnalysis {
  name: string;
  performance: number;       // 平均涨跌幅
  trend: TrendDirection;
  topGainer?: AssetAnalysis;
  topLoser?: AssetAnalysis;
  stocks: AssetAnalysis[];
}

// 市场分析结果
export interface MarketAnalysis {
  timestamp: Date;
  condition: MarketCondition;
  sentiment: Sentiment;

  // 指数概览
  indices: {
    summary: string;
    details: AssetAnalysis[];
  };

  // 板块分析
  sectors: SectorAnalysis[];

  // 涨跌榜
  topGainers: AssetAnalysis[];
  topLosers: AssetAnalysis[];

  // 关键发现
  highlights: string[];

  // 风险信号
  riskSignals: string[];
}

// ===== 新闻分析结果 =====

// 新闻主题
export interface NewsTopic {
  topic: string;
  count: number;
  sentiment: Sentiment;
  relatedSymbols: string[];
  headlines: string[];
}

// 新闻分析结果
export interface NewsAnalysis {
  timestamp: Date;
  totalArticles: number;
  sentiment: Sentiment;

  // 热门主题
  topTopics: NewsTopic[];

  // 重要新闻
  keyHeadlines: {
    headline: string;
    source: string;
    sentiment: Sentiment;
    importance: 'high' | 'medium' | 'low';
  }[];

  // 关键发现
  highlights: string[];
}

// ===== 经济分析结果 =====

// 经济指标分析
export interface IndicatorAnalysis {
  seriesId: string;
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend: TrendDirection;
  significance: 'high' | 'medium' | 'low';
  interpretation: string;
}

// 经济分析结果
export interface EconomicAnalysis {
  timestamp: Date;
  outlook: 'expansion' | 'contraction' | 'stable';

  // 关键指标
  keyIndicators: IndicatorAnalysis[];

  // 分类分析
  categories: {
    employment: {
      summary: string;
      indicators: IndicatorAnalysis[];
    };
    inflation: {
      summary: string;
      indicators: IndicatorAnalysis[];
    };
    rates: {
      summary: string;
      yieldCurve: 'normal' | 'inverted' | 'flat';
      indicators: IndicatorAnalysis[];
    };
    sentiment: {
      summary: string;
      indicators: IndicatorAnalysis[];
    };
  };

  // 关键发现
  highlights: string[];

  // 风险因素
  riskFactors: string[];
}

// ===== 综合分析结果 =====

export interface ComprehensiveAnalysis {
  timestamp: Date;
  market?: MarketAnalysis;
  news?: NewsAnalysis;
  economic?: EconomicAnalysis;

  // 综合摘要
  summary: {
    marketCondition: MarketCondition;
    overallSentiment: Sentiment;
    keyPoints: string[];
    risksAndConcerns: string[];
    outlook: string;
  };
}

// 分析器配置
export interface AnalyzerConfig {
  topN?: number;              // Top N 结果数量
  includeDetails?: boolean;   // 是否包含详细信息
}
