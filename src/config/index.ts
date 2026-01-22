import { config } from 'dotenv';
import * as path from 'path';

// 加载 .env 文件
config({ path: path.resolve(process.cwd(), '.env') });

/**
 * 监控的股票和指数列表（全局唯一配置）
 * 所有收集器（Yahoo Finance, SEC/EDGAR 等）都使用这个列表
 * 
 * 只需在这里修改，即可全局生效
 */
export const MONITORED_SYMBOLS = {
  // 主要指数 (6)
  indices: [
    '^GSPC',   // S&P 500
    '^DJI',    // Dow Jones Industrial Average
    '^IXIC',   // NASDAQ Composite
    '^RUT',    // Russell 2000
    '^VIX',    // CBOE Volatility Index
    '^SPX',    // S&P 500 Index
  ],

  // ETF (6)
  etf: [
    'SPY',     // SPDR S&P 500 ETF
    'QQQ',     // Invesco QQQ (NASDAQ 100)
    'VOO',     // Vanguard S&P 500 ETF
    'SOXX',    // iShares Semiconductor ETF
    'SMH',     // VanEck Semiconductor ETF
    'GLD',     // SPDR Gold Trust
  ],

  // 科技巨头 (7)
  techGiants: [
    'AAPL',    // Apple Inc.
    'MSFT',    // Microsoft Corporation
    'GOOGL',   // Alphabet Inc.
    'AMZN',    // Amazon.com, Inc.
    'META',    // Meta Platforms, Inc.
    'TSLA',    // Tesla, Inc.
    'ORCL',    // Oracle Corporation
  ],

  // 半导体 (13)
  semiconductor: [
    'NVDA',    // NVIDIA Corporation
    'AMD',     // Advanced Micro Devices
    'INTC',    // Intel Corporation
    'AVGO',    // Broadcom Inc.
    'QCOM',    // QUALCOMM Incorporated
    'TSM',     // Taiwan Semiconductor
    'ASML',    // ASML Holding N.V.
    'MU',      // Micron Technology
    'MRVL',    // Marvell Technology
    'ARM',     // Arm Holdings plc
    'LRCX',    // Lam Research Corporation
    'AMAT',    // Applied Materials
    'KLAC',    // KLA Corporation
  ],

  // 存储 (5)
  storage: [
    'WDC',     // Western Digital Corporation
    'STX',     // Seagate Technology Holdings
    'PSTG',    // Pure Storage, Inc.
    'VRT',     // Vertiv Holdings Co
    'DELL',    // Dell Technologies Inc.
  ],

  // 数据中心 (4)
  dataCenter: [
    'ANET',    // Arista Networks, Inc.
    'VST',     // Vistra Corp.
    'CEG',     // Constellation Energy Corporation
    'LEU',     // Centrus Energy Corp.
  ],

  // 能源 (3)
  energy: [
    'OKLO',    // Oklo Inc. (核能)
    'BE',      // Bloom Energy Corporation
    'RKLB',    // Rocket Lab USA, Inc.
  ],

  // 金融 (2)
  finance: [
    'BRK-B',   // Berkshire Hathaway Inc.
    'JPM',     // JPMorgan Chase & Co.
  ],

  // 其他 (5)
  others: [
    'V',       // Visa Inc.
    'LMND',    // Lemonade, Inc.
    'LLY',     // Eli Lilly and Company
    'CRWV',    // Crown Electrokinetics Corp.
    'PLTR',    // Palantir Technologies Inc.
  ],
};

/**
 * 获取所有监控的股票代码（扁平化数组）
 */
export function getAllMonitoredSymbols(): string[] {
  return [
    ...MONITORED_SYMBOLS.indices,
    ...MONITORED_SYMBOLS.etf,
    ...MONITORED_SYMBOLS.techGiants,
    ...MONITORED_SYMBOLS.semiconductor,
    ...MONITORED_SYMBOLS.storage,
    ...MONITORED_SYMBOLS.dataCenter,
    ...MONITORED_SYMBOLS.energy,
    ...MONITORED_SYMBOLS.finance,
    ...MONITORED_SYMBOLS.others,
  ];
}

/**
 * 获取所有股票代码（不包括指数）
 * 用于 SEC/EDGAR 等只支持股票的收集器
 */
export function getStockSymbols(): string[] {
  return [
    ...MONITORED_SYMBOLS.etf,
    ...MONITORED_SYMBOLS.techGiants,
    ...MONITORED_SYMBOLS.semiconductor,
    ...MONITORED_SYMBOLS.storage,
    ...MONITORED_SYMBOLS.dataCenter,
    ...MONITORED_SYMBOLS.energy,
    ...MONITORED_SYMBOLS.finance,
    ...MONITORED_SYMBOLS.others,
  ];
}

/**
 * 获取所有指数代码
 */
export function getIndexSymbols(): string[] {
  return MONITORED_SYMBOLS.indices;
}

/**
 * RSS Feeds 配置
 * 
 * 注意: Twitter/X feeds 目前已禁用（Nitter 实例不可用）
 * 如需启用，请申请 Twitter API 或使用其他方案
 * 详见: docs/TWITTER_X_ALTERNATIVES.md
 */
export const RSS_FEEDS = {
  // Twitter/X 账号 (目前已禁用 - Nitter 不可用)
  // 如需使用，请申请 Twitter API 并实现 TwitterCollector
  twitter: [
    // 已禁用，保留配置以备将来使用
    // 🌟 特别关注 - Elon Musk (Tesla CEO, 市场影响力极大)
    // 'https://nitter.net/elonmusk/rss',
    
    // 财经媒体官方
    // 'https://nitter.net/Bloomberg/rss',
    // 'https://nitter.net/Reuters/rss',
    // 'https://nitter.net/WSJ/rss',
    // 'https://nitter.net/CNBC/rss',
    // 'https://nitter.net/FT/rss',
    // 'https://nitter.net/MarketWatch/rss',
    // 'https://nitter.net/YahooFinance/rss',
    // 'https://nitter.net/business/rss',
    
    // 政府/监管机构
    // 'https://nitter.net/federalreserve/rss',
    // 'https://nitter.net/USTreasury/rss',
    // 'https://nitter.net/SEC_News/rss',
    // 'https://nitter.net/WhiteHouse/rss',
    
    // 科技公司官方
    // 'https://nitter.net/Apple/rss',
    // 'https://nitter.net/Microsoft/rss',
    // 'https://nitter.net/Google/rss',
    // 'https://nitter.net/Amazon/rss',
    // 'https://nitter.net/Meta/rss',
    // 'https://nitter.net/Tesla/rss',
    // 'https://nitter.net/nvidia/rss',
    // 'https://nitter.net/AMD/rss',
    // 'https://nitter.net/intel/rss',
    
    // 知名分析师/投资者
    // 'https://nitter.net/CathieDWood/rss',
    // 'https://nitter.net/jimcramer/rss',
    // 'https://nitter.net/TheStalwart/rss',
    // 'https://nitter.net/markets/rss',
  ],
  
  // 其他 RSS 源（新闻网站、博客等）
  // 可以添加任何支持 RSS 的网站
  others: [
    // 示例: 添加其他财经新闻 RSS
    // 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    // 'https://feeds.bloomberg.com/markets/news.rss',
  ],
};

/**
 * 获取所有 RSS feeds
 */
export function getAllRSSFeeds(): string[] {
  return [
    ...RSS_FEEDS.twitter,
    ...RSS_FEEDS.others,
  ];
}

/**
 * 应用配置
 */
export const appConfig = {
  // Finnhub 配置
  finnhub: {
    apiKey: process.env.FINNHUB_API_KEY || '',
  },

  // FRED 配置
  fred: {
    apiKey: process.env.FRED_API_KEY || '',
  },

  // Alpha Vantage 配置（备用数据源）
  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
  },

  // SEC EDGAR 配置
  sec: {
    userAgent: process.env.SEC_USER_AGENT || 'FinanceBriefingAgent/1.0 (contact@example.com)',
  },

  // RSS 配置
  rss: {
    feeds: getAllRSSFeeds(),
    enabled: false, // 暂时禁用 (Twitter feeds 不可用)
  },

  // 数据目录
  paths: {
    data: path.resolve(process.cwd(), 'data'),
    raw: path.resolve(process.cwd(), 'data/raw'),
    processed: path.resolve(process.cwd(), 'data/processed'),
    output: path.resolve(process.cwd(), 'output'),
  },
};

/**
 * 验证必需的配置
 */
export function validateConfig(requiredKeys: string[]): void {
  const missing: string[] = [];

  for (const key of requiredKeys) {
    if (key === 'FINNHUB_API_KEY' && !appConfig.finnhub.apiKey) {
      missing.push(key);
    }
    if (key === 'FRED_API_KEY' && !appConfig.fred.apiKey) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please copy .env.example to .env and fill in the values.`
    );
  }
}
