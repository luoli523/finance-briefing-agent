import { config } from 'dotenv';
import * as path from 'path';

// 加载 .env 文件
config({ path: path.resolve(process.cwd(), '.env') });

/**
 * 监控的股票和指数列表（全局唯一配置）
 * 按照 AI 产业链分类，覆盖上游制造/中游芯片/下游应用
 * 
 * 只需在这里修改，即可全局生效
 */
export const MONITORED_SYMBOLS = {
  // 主要指数 (5)
  indices: [
    '^GSPC',   // S&P 500
    '^DJI',    // Dow Jones Industrial Average
    '^IXIC',   // NASDAQ Composite
    '^RUT',    // Russell 2000
    '^VIX',    // CBOE Volatility Index
  ],

  // ETF (6) - 用于对冲和配置建议
  etf: [
    'SMH',     // VanEck Semiconductor ETF
    'SOXX',    // iShares Semiconductor ETF
    'QQQ',     // Invesco QQQ (NASDAQ 100)
    'ARKQ',    // ARK Autonomous Tech & Robotics ETF
    'BOTZ',    // Global X Robotics & AI ETF
    'GLD',     // SPDR Gold Trust (对冲)
  ],

  // ===== AI 产业链分类 =====

  // 1. GPU/加速与半导体 (6)
  gpuAccelerator: [
    'NVDA',    // NVIDIA Corporation - AI芯片龙头
    'AMD',     // Advanced Micro Devices - GPU/CPU
    'AVGO',    // Broadcom Inc. - 网络芯片/定制ASIC
    'QCOM',    // QUALCOMM - 移动AI芯片
    'MU',      // Micron Technology - HBM内存
    'ARM',     // Arm Holdings - 芯片架构
  ],

  // 2. 晶圆与制造 (2)
  waferManufacturing: [
    'TSM',     // Taiwan Semiconductor - 代工龙头
    'ASML',    // ASML Holding - 光刻机垄断
  ],

  // 3. 设备/EDA (5)
  equipmentEda: [
    'AMAT',    // Applied Materials - 半导体设备
    'LRCX',    // Lam Research - 刻蚀设备
    'KLAC',    // KLA Corporation - 检测设备
    'SNPS',    // Synopsys - EDA软件
    'CDNS',    // Cadence Design - EDA软件
  ],

  // 4. 服务器与基础设施 (6)
  serverInfra: [
    'SMCI',    // Super Micro Computer - AI服务器
    'DELL',    // Dell Technologies - 企业服务器
    'HPE',     // Hewlett Packard Enterprise - 服务器
    'ANET',    // Arista Networks - 数据中心网络
    'VRT',     // Vertiv Holdings - 电源/散热
    'ETN',     // Eaton Corporation - 电气设备
  ],

  // 5. 云与平台 (4)
  cloudPlatform: [
    'MSFT',    // Microsoft - Azure/OpenAI合作
    'AMZN',    // Amazon - AWS
    'GOOGL',   // Alphabet - Google Cloud/DeepMind
    'ORCL',    // Oracle - 云基础设施
  ],

  // 6. 应用与软件 (6)
  aiSoftware: [
    'META',    // Meta Platforms - AI应用/Llama
    'ADBE',    // Adobe - AI创意工具
    'CRM',     // Salesforce - 企业AI
    'NOW',     // ServiceNow - 企业自动化
    'SNOW',    // Snowflake - 数据平台
    'DDOG',    // Datadog - 监控/可观测性
  ],

  // 7. 自动驾驶/机器人 (4)
  autonomousRobotics: [
    'TSLA',    // Tesla - 自动驾驶/机器人
    'MBLY',    // Mobileye - 自动驾驶芯片
    'ABB',     // ABB Ltd - 工业机器人
    'FANUY',   // Fanuc - 工业自动化
  ],

  // 8. 数据中心能源 (4)
  dataCenterEnergy: [
    'VST',     // Vistra Corp - 数据中心电力
    'CEG',     // Constellation Energy - 核能/清洁能源
    'OKLO',    // Oklo Inc - 小型核反应堆
    'BE',      // Bloom Energy - 燃料电池
  ],

  // 9. 其他重要标的 (6) - 补充覆盖
  others: [
    'AAPL',    // Apple - 设备端AI
    'INTC',    // Intel - 传统芯片巨头
    'MRVL',    // Marvell - 定制芯片
    'PLTR',    // Palantir - AI数据分析
    'LLY',     // Eli Lilly - AI制药
    'JPM',     // JPMorgan - 金融AI应用
  ],
};

/**
 * AI产业链分类映射（用于报告生成）
 */
export const AI_INDUSTRY_CATEGORIES = {
  'GPU/加速与半导体': MONITORED_SYMBOLS.gpuAccelerator,
  '晶圆与制造': MONITORED_SYMBOLS.waferManufacturing,
  '设备/EDA': MONITORED_SYMBOLS.equipmentEda,
  '服务器与基础设施': MONITORED_SYMBOLS.serverInfra,
  '云与平台': MONITORED_SYMBOLS.cloudPlatform,
  '应用与软件': MONITORED_SYMBOLS.aiSoftware,
  '自动驾驶/机器人': MONITORED_SYMBOLS.autonomousRobotics,
  '数据中心能源': MONITORED_SYMBOLS.dataCenterEnergy,
  '其他': MONITORED_SYMBOLS.others,
};

/**
 * 股票信息映射（代码 -> 公司名称）
 */
export const STOCK_INFO: Record<string, { name: string; category: string }> = {
  // GPU/加速与半导体
  'NVDA': { name: 'NVIDIA Corporation', category: 'GPU/加速与半导体' },
  'AMD': { name: 'Advanced Micro Devices', category: 'GPU/加速与半导体' },
  'AVGO': { name: 'Broadcom Inc.', category: 'GPU/加速与半导体' },
  'QCOM': { name: 'QUALCOMM Incorporated', category: 'GPU/加速与半导体' },
  'MU': { name: 'Micron Technology', category: 'GPU/加速与半导体' },
  'ARM': { name: 'Arm Holdings plc', category: 'GPU/加速与半导体' },
  // 晶圆与制造
  'TSM': { name: 'Taiwan Semiconductor', category: '晶圆与制造' },
  'ASML': { name: 'ASML Holding N.V.', category: '晶圆与制造' },
  // 设备/EDA
  'AMAT': { name: 'Applied Materials', category: '设备/EDA' },
  'LRCX': { name: 'Lam Research', category: '设备/EDA' },
  'KLAC': { name: 'KLA Corporation', category: '设备/EDA' },
  'SNPS': { name: 'Synopsys, Inc.', category: '设备/EDA' },
  'CDNS': { name: 'Cadence Design Systems', category: '设备/EDA' },
  // 服务器与基础设施
  'SMCI': { name: 'Super Micro Computer', category: '服务器与基础设施' },
  'DELL': { name: 'Dell Technologies', category: '服务器与基础设施' },
  'HPE': { name: 'Hewlett Packard Enterprise', category: '服务器与基础设施' },
  'ANET': { name: 'Arista Networks', category: '服务器与基础设施' },
  'VRT': { name: 'Vertiv Holdings', category: '服务器与基础设施' },
  'ETN': { name: 'Eaton Corporation', category: '服务器与基础设施' },
  // 云与平台
  'MSFT': { name: 'Microsoft Corporation', category: '云与平台' },
  'AMZN': { name: 'Amazon.com, Inc.', category: '云与平台' },
  'GOOGL': { name: 'Alphabet Inc.', category: '云与平台' },
  'ORCL': { name: 'Oracle Corporation', category: '云与平台' },
  // 应用与软件
  'META': { name: 'Meta Platforms, Inc.', category: '应用与软件' },
  'ADBE': { name: 'Adobe Inc.', category: '应用与软件' },
  'CRM': { name: 'Salesforce, Inc.', category: '应用与软件' },
  'NOW': { name: 'ServiceNow, Inc.', category: '应用与软件' },
  'SNOW': { name: 'Snowflake Inc.', category: '应用与软件' },
  'DDOG': { name: 'Datadog, Inc.', category: '应用与软件' },
  // 自动驾驶/机器人
  'TSLA': { name: 'Tesla, Inc.', category: '自动驾驶/机器人' },
  'MBLY': { name: 'Mobileye Global Inc.', category: '自动驾驶/机器人' },
  'ABB': { name: 'ABB Ltd', category: '自动驾驶/机器人' },
  'FANUY': { name: 'Fanuc Corporation', category: '自动驾驶/机器人' },
  // 数据中心能源
  'VST': { name: 'Vistra Corp.', category: '数据中心能源' },
  'CEG': { name: 'Constellation Energy', category: '数据中心能源' },
  'OKLO': { name: 'Oklo Inc.', category: '数据中心能源' },
  'BE': { name: 'Bloom Energy', category: '数据中心能源' },
  // 其他
  'AAPL': { name: 'Apple Inc.', category: '其他' },
  'INTC': { name: 'Intel Corporation', category: '其他' },
  'MRVL': { name: 'Marvell Technology', category: '其他' },
  'PLTR': { name: 'Palantir Technologies', category: '其他' },
  'LLY': { name: 'Eli Lilly and Company', category: '其他' },
  'JPM': { name: 'JPMorgan Chase & Co.', category: '其他' },
  // ETF
  'SMH': { name: 'VanEck Semiconductor ETF', category: 'ETF' },
  'SOXX': { name: 'iShares Semiconductor ETF', category: 'ETF' },
  'QQQ': { name: 'Invesco QQQ Trust', category: 'ETF' },
  'ARKQ': { name: 'ARK Autonomous Tech ETF', category: 'ETF' },
  'BOTZ': { name: 'Global X Robotics & AI ETF', category: 'ETF' },
  'GLD': { name: 'SPDR Gold Trust', category: 'ETF' },
};

/**
 * 获取所有监控的股票代码（扁平化数组）
 */
export function getAllMonitoredSymbols(): string[] {
  return [
    ...MONITORED_SYMBOLS.indices,
    ...MONITORED_SYMBOLS.etf,
    ...MONITORED_SYMBOLS.gpuAccelerator,
    ...MONITORED_SYMBOLS.waferManufacturing,
    ...MONITORED_SYMBOLS.equipmentEda,
    ...MONITORED_SYMBOLS.serverInfra,
    ...MONITORED_SYMBOLS.cloudPlatform,
    ...MONITORED_SYMBOLS.aiSoftware,
    ...MONITORED_SYMBOLS.autonomousRobotics,
    ...MONITORED_SYMBOLS.dataCenterEnergy,
    ...MONITORED_SYMBOLS.others,
  ];
}

/**
 * 获取所有股票代码（不包括指数和ETF）
 * 用于 SEC/EDGAR 等只支持股票的收集器
 */
export function getStockSymbols(): string[] {
  return [
    ...MONITORED_SYMBOLS.gpuAccelerator,
    ...MONITORED_SYMBOLS.waferManufacturing,
    ...MONITORED_SYMBOLS.equipmentEda,
    ...MONITORED_SYMBOLS.serverInfra,
    ...MONITORED_SYMBOLS.cloudPlatform,
    ...MONITORED_SYMBOLS.aiSoftware,
    ...MONITORED_SYMBOLS.autonomousRobotics,
    ...MONITORED_SYMBOLS.dataCenterEnergy,
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
 * 获取ETF代码
 */
export function getETFSymbols(): string[] {
  return MONITORED_SYMBOLS.etf;
}

/**
 * 按产业链分类获取股票
 */
export function getStocksByCategory(): Record<string, string[]> {
  return AI_INDUSTRY_CATEGORIES;
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
  
  // 政府机构官方 RSS (✅ 已测试可用)
  government: [
    // 美联储 (Federal Reserve)
    'https://www.federalreserve.gov/feeds/press_all.xml',      // 美联储新闻稿
    'https://www.federalreserve.gov/feeds/speeches.xml',       // 美联储官员讲话
    
    // SEC (证券交易委员会)
    'https://www.sec.gov/news/pressreleases.rss',              // SEC 新闻稿
    
    // Federal Register (联邦公报)
    'https://www.federalregister.gov/api/v1/documents.rss',   // 联邦政府公告
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
    ...RSS_FEEDS.twitter,      // Twitter feeds (目前已禁用)
    ...RSS_FEEDS.government,   // 政府机构 RSS
    ...RSS_FEEDS.others,       // 其他 RSS
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
    enabled: true, // 已启用 (政府机构 RSS 可用)
  },

  // LLM 增强分析配置
  llm: {
    enabled: process.env.LLM_ENABLED === 'true' || false,
    provider: (process.env.LLM_PROVIDER as any) || 'openai',
    model: process.env.LLM_MODEL || 'gpt-4-turbo',
    apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || '',
    baseURL: process.env.LLM_BASE_URL,
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4096'),
    timeout: parseInt(process.env.LLM_TIMEOUT || '60000'),
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
