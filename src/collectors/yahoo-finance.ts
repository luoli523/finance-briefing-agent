import YahooFinance from 'yahoo-finance2';
import { BaseCollector } from './base';
import {
  CollectedData,
  YahooFinanceConfig,
  QuoteData,
  MarketOverview,
  DataItem,
} from './types';
import { historyManager } from './history';

// 工具函数：延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 动态导入代理模块（可选依赖）
async function getProxyAgent(): Promise<unknown> {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.ALL_PROXY;
  if (!proxyUrl) return undefined;

  try {
    // 使用字符串拼接避免 TypeScript 编译时检查
    const moduleName = 'https-proxy-' + 'agent';
    const proxyModule = await import(/* webpackIgnore: true */ moduleName).catch(() => null);
    if (proxyModule && proxyModule.HttpsProxyAgent) {
      console.log(`[yahoo-finance] Using proxy: ${proxyUrl}`);
      return new proxyModule.HttpsProxyAgent(proxyUrl);
    }
  } catch {
    // 忽略错误
  }
  console.log('[yahoo-finance] https-proxy-agent not available, proxy disabled');
  return undefined;
}

// 创建 yahoo-finance2 实例（支持代理）
async function createYahooFinanceClient(): Promise<InstanceType<typeof YahooFinance>> {
  const agent = await getProxyAgent();
  const options: Record<string, unknown> = { suppressNotices: ['yahooSurvey'] };

  if (agent) {
    options.fetchOptions = { agent };
  }

  return new YahooFinance(options);
}

// 默认配置：美股主要指数和热门股票
const DEFAULT_CONFIG: YahooFinanceConfig = {
  enabled: true,
  saveRaw: true,
  timeout: 30000,
  retries: 3,
  // 主要指数和 ETF
  indices: [
    '^GSPC',    // S&P 500
    '^DJI',     // Dow Jones
    '^IXIC',    // NASDAQ
    '^RUT',     // Russell 2000
    '^VIX',     // VIX 恐慌指数
    '^SPX',     // S&P 500 Index
  ],
  symbols: [
    // ===== 主要 ETF =====
    'SPY',      // SPDR S&P 500 ETF
    'QQQ',      // Invesco QQQ (NASDAQ 100)
    'VOO',      // Vanguard S&P 500 ETF
    'SOXX',     // iShares Semiconductor ETF
    'SMH',      // VanEck Semiconductor ETF
    'GLD',      // SPDR Gold Trust

    // ===== 科技巨头 =====
    'AAPL',     // Apple
    'MSFT',     // Microsoft
    'GOOGL',    // Google
    'AMZN',     // Amazon
    'META',     // Meta
    'TSLA',     // Tesla
    'ORCL',     // Oracle
    'PLTR',     // Palantir

    // ===== 半导体 =====
    'NVDA',     // NVIDIA
    'AMD',      // AMD
    'INTC',     // Intel
    'AVGO',     // Broadcom
    'QCOM',     // Qualcomm
    'TSM',      // Taiwan Semiconductor (TSMC)
    'ASML',     // ASML
    'MU',       // Micron
    'MRVL',     // Marvell
    'ARM',      // ARM Holdings
    'LRCX',     // Lam Research
    'AMAT',     // Applied Materials
    'KLAC',     // KLA Corp

    // ===== 存储 =====
    'WDC',      // Western Digital
    'STX',      // Seagate
    'PSTG',     // Pure Storage

    // ===== 数据中心/基础设施 =====
    'VRT',      // Vertiv
    'DELL',     // Dell
    'ANET',     // Arista Networks

    // ===== 能源/核电 =====
    'VST',      // Vistra
    'CEG',      // Constellation Energy
    'LEU',      // Centrus Energy
    'OKLO',     // Oklo (核能)
    'BE',       // Bloom Energy

    // ===== 航天 =====
    'RKLB',     // Rocket Lab

    // ===== 金融 =====
    'BRK-B',    // Berkshire Hathaway
    'JPM',      // JP Morgan
    'V',        // Visa

    // ===== 保险科技 =====
    'LMND',     // Lemonade

    // ===== 医疗 =====
    'LLY',      // Eli Lilly

    // ===== 其他 =====
    'CRWV',     // CoreWeave (if listed)
  ],
};

/**
 * Yahoo Finance 数据收集器
 * 获取美股市场数据，包括指数和个股报价
 */
export class YahooFinanceCollector extends BaseCollector<YahooFinanceConfig> {
  readonly name = 'yahoo-finance';
  readonly description = 'Yahoo Finance US stock market data collector';

  constructor(config: Partial<YahooFinanceConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  /**
   * 收集市场数据
   */
  async collect(): Promise<CollectedData> {
    this.log('Starting data collection...');

    const allSymbols = [...this.config.indices, ...this.config.symbols];

    try {
      // 批量获取报价数据
      const quotes = await this.fetchQuotes(allSymbols);

      // 分离指数和股票数据
      const indicesData = quotes.filter(q =>
        this.config.indices.includes(q.symbol)
      );
      const stocksData = quotes.filter(q =>
        this.config.symbols.includes(q.symbol)
      );

      // 按涨跌幅排序
      const sortedByChange = [...stocksData].sort(
        (a, b) => b.changePercent - a.changePercent
      );

      const market: MarketOverview = {
        indices: indicesData,
        topGainers: sortedByChange.slice(0, 5),
        topLosers: sortedByChange.slice(-5).reverse(),
      };

      // 转换为通用数据项格式
      const items: DataItem[] = quotes.map(q => ({
        id: q.symbol,
        title: `${q.name} (${q.symbol})`,
        content: this.formatQuoteSummary(q),
        timestamp: q.timestamp,
        metadata: { ...q },
      }));

      const result: CollectedData = {
        source: this.name,
        type: 'market',
        collectedAt: new Date(),
        items,
        market,
      };

      // 保存数据
      if (this.config.saveRaw) {
        await this.saveRawData({ quotes, market });
      }
      await this.saveProcessedData(result);

      // 保存历史数据
      await historyManager.saveQuotes(quotes);

      this.log(`Collected ${quotes.length} quotes successfully`);
      return result;

    } catch (error) {
      this.logError('Failed to collect data', error as Error);
      throw error;
    }
  }

  /**
   * 批量获取股票报价（带速率限制和重试）
   * 优先使用批量接口，失败后降级为单个请求
   */
  private async fetchQuotes(symbols: string[]): Promise<QuoteData[]> {
    this.log(`Fetching quotes for ${symbols.length} symbols...`);

    // 创建客户端（支持代理）
    const yahooFinance = await createYahooFinanceClient();

    // 首先尝试批量获取（分批，每批最多 10 个）
    const batchSize = 10;
    const results: QuoteData[] = [];
    const failedSymbols: string[] = [];

    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);

      // 批次间延迟 3 秒
      if (i > 0) {
        this.log(`Waiting 3 seconds before next batch...`);
        await delay(3000);
      }

      try {
        // 尝试批量获取
        this.log(`Fetching batch ${Math.floor(i / batchSize) + 1}: ${batch.join(', ')}`);
        const quotes = await yahooFinance.quote(batch);

        if (Array.isArray(quotes)) {
          for (const quote of quotes) {
            if (quote) {
              results.push(this.transformQuote(quote));
              this.log(`✓ ${quote.symbol} fetched`);
            }
          }
        } else if (quotes) {
          results.push(this.transformQuote(quotes));
          this.log(`✓ ${(quotes as any).symbol} fetched`);
        }

        // 检查哪些股票没有获取到
        const fetchedSymbols = new Set(results.map(r => r.symbol));
        for (const symbol of batch) {
          if (!fetchedSymbols.has(symbol)) {
            failedSymbols.push(symbol);
          }
        }

      } catch (error) {
        this.log(`⚠ Batch fetch failed, will retry individually: ${(error as Error).message}`);
        failedSymbols.push(...batch);
      }
    }

    // 对失败的股票进行单个重试
    if (failedSymbols.length > 0) {
      this.log(`Retrying ${failedSymbols.length} failed symbols individually...`);

      for (const symbol of failedSymbols) {
        await delay(2000); // 单个请求间隔 2 秒

        try {
          const quote = await yahooFinance.quote(symbol);
          if (quote) {
            results.push(this.transformQuote(quote));
            this.log(`✓ ${symbol} fetched (retry)`);
          }
        } catch (error) {
          this.logError(`Failed to fetch ${symbol}: ${(error as Error).message}`);
        }
      }
    }

    return results;
  }

  /**
   * 转换 Yahoo Finance 返回的数据为统一格式
   */
  private transformQuote(quote: any): QuoteData {
    return {
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || quote.symbol,
      price: quote.regularMarketPrice ?? 0,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      previousClose: quote.regularMarketPreviousClose,
      // 52周高低点
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      fiftyTwoWeekHighChange: quote.fiftyTwoWeekHighChange,
      fiftyTwoWeekHighChangePercent: quote.fiftyTwoWeekHighChangePercent,
      fiftyTwoWeekLowChange: quote.fiftyTwoWeekLowChange,
      fiftyTwoWeekLowChangePercent: quote.fiftyTwoWeekLowChangePercent,
      timestamp: new Date(quote.regularMarketTime * 1000),
    };
  }

  /**
   * 格式化报价摘要
   */
  private formatQuoteSummary(quote: QuoteData): string {
    const direction = quote.change >= 0 ? '↑' : '↓';
    const sign = quote.change >= 0 ? '+' : '';
    return `${quote.name}: $${quote.price.toFixed(2)} ${direction} ${sign}${quote.change.toFixed(2)} (${sign}${quote.changePercent.toFixed(2)}%)`;
  }

  /**
   * 获取市场概览（简化方法）
   */
  async getMarketSummary(): Promise<MarketOverview> {
    const data = await this.collect();
    return data.market!;
  }
}

// 导出默认实例
export const yahooFinanceCollector = new YahooFinanceCollector();
