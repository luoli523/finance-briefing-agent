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
