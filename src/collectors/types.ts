/**
 * 收集器数据类型定义
 */

// 数据类型枚举
export type DataType = 'news' | 'market' | 'economic';

// 市场类型
export type MarketType = 'stock' | 'index' | 'forex' | 'crypto' | 'commodity';

// 单个数据项
export interface DataItem {
  id: string;
  title: string;
  content?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

// 股票/指数报价
export interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  marketCap?: number;
  previousClose?: number;
  // 52周高低点
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHighChange?: number;       // 距52周高点变化
  fiftyTwoWeekHighChangePercent?: number;
  fiftyTwoWeekLowChange?: number;        // 距52周低点变化
  fiftyTwoWeekLowChangePercent?: number;
  timestamp: Date;
}

// 市场概览数据
export interface MarketOverview {
  indices: QuoteData[];      // 主要指数
  topGainers?: QuoteData[];  // 涨幅榜
  topLosers?: QuoteData[];   // 跌幅榜
  mostActive?: QuoteData[];  // 成交活跃
}

// 收集器返回的统一数据格式
export interface CollectedData {
  source: string;            // 数据来源标识
  type: DataType;            // 数据类型
  collectedAt: Date;         // 收集时间
  items: DataItem[];         // 通用数据项
  market?: MarketOverview;   // 市场数据（可选）
  raw?: any;                 // 原始数据（调试用）
}

// 收集器配置
export interface CollectorConfig {
  enabled: boolean;
  saveRaw?: boolean;         // 是否保存原始数据
  timeout?: number;          // 请求超时（毫秒）
  retries?: number;          // 重试次数
}

// Yahoo Finance 特定配置
export interface YahooFinanceConfig extends CollectorConfig {
  symbols: string[];         // 要获取的股票代码
  indices: string[];         // 要获取的指数代码
}

// 新闻类别
export type NewsCategory = 'general' | 'forex' | 'crypto' | 'merger';

// 新闻文章
export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  category: NewsCategory;
  relatedSymbols?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

// Finnhub 特定配置
export interface FinnhubConfig extends CollectorConfig {
  apiKey: string;            // Finnhub API Key
  category?: NewsCategory;   // 新闻类别
  minId?: number;            // 最小新闻 ID（用于增量获取）
}

// 经济指标类别
export type EconomicCategory =
  | 'growth'      // 经济增长 (GDP)
  | 'inflation'   // 通胀 (CPI, PCE)
  | 'employment'  // 就业 (失业率, 非农)
  | 'rates'       // 利率 (联邦基金利率, 国债收益率)
  | 'sentiment'   // 信心指数 (消费者信心)
  | 'housing'     // 房地产
  | 'trade';      // 贸易

// 经济指标数据点
export interface EconomicDataPoint {
  seriesId: string;          // FRED 系列 ID
  name: string;              // 指标名称
  value: number;             // 当前值
  previousValue?: number;    // 前值
  change?: number;           // 变化
  changePercent?: number;    // 变化百分比
  unit: string;              // 单位
  frequency: string;         // 更新频率
  date: Date;                // 数据日期
  category: EconomicCategory;
}

// 经济数据概览
export interface EconomicOverview {
  growth: EconomicDataPoint[];
  inflation: EconomicDataPoint[];
  employment: EconomicDataPoint[];
  rates: EconomicDataPoint[];
  sentiment: EconomicDataPoint[];
}

// FRED 特定配置
export interface FredConfig extends CollectorConfig {
  apiKey: string;            // FRED API Key
  seriesIds?: string[];      // 要获取的系列 ID 列表
}
