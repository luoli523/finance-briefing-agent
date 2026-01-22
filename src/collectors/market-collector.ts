import { YahooFinanceCollector } from './yahoo-finance';
import { AlphaVantageCollector } from './alpha-vantage';
import { CollectedData, QuoteData } from './types';
import { appConfig } from '../config';
import { historyManager } from './history';

// 默认监控的股票列表
const DEFAULT_INDICES = [
  '^GSPC',    // S&P 500
  '^DJI',     // Dow Jones
  '^IXIC',    // NASDAQ
  '^RUT',     // Russell 2000
  '^VIX',     // VIX 恐慌指数
  '^SPX',     // S&P 500 Index
];

const DEFAULT_SYMBOLS = [
  // ETF
  'SPY', 'QQQ', 'VOO', 'SOXX', 'SMH', 'GLD',
  // 科技巨头
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'ORCL', 'PLTR',
  // 半导体
  'NVDA', 'AMD', 'INTC', 'AVGO', 'QCOM', 'TSM', 'ASML', 'MU', 'MRVL', 'ARM', 'LRCX', 'AMAT', 'KLAC',
  // 存储
  'WDC', 'STX', 'PSTG',
  // 数据中心
  'VRT', 'DELL', 'ANET',
  // 能源/核电
  'VST', 'CEG', 'LEU', 'OKLO', 'BE',
  // 航天
  'RKLB',
  // 金融
  'BRK-B', 'JPM', 'V',
  // 保险科技
  'LMND',
  // 医疗
  'LLY',
  // 其他
  'CRWV',
];

export type DataSource = 'yahoo' | 'alpha-vantage';

export interface MarketCollectorConfig {
  preferredSource?: DataSource;
  fallbackEnabled?: boolean;
  saveHistory?: boolean;
}

/**
 * 统一市场数据收集器
 * 支持多数据源和自动故障转移
 */
export class MarketCollector {
  private yahooCollector: YahooFinanceCollector;
  private alphaVantageCollector: AlphaVantageCollector | null = null;
  private config: MarketCollectorConfig;

  constructor(config: MarketCollectorConfig = {}) {
    this.config = {
      preferredSource: 'yahoo',
      fallbackEnabled: true,
      saveHistory: true,
      ...config,
    };

    // 初始化 Yahoo Finance 收集器
    this.yahooCollector = new YahooFinanceCollector({
      indices: DEFAULT_INDICES,
      symbols: DEFAULT_SYMBOLS,
    });

    // 如果配置了 Alpha Vantage API Key，初始化备用收集器
    if (appConfig.alphaVantage.apiKey) {
      this.alphaVantageCollector = new AlphaVantageCollector({
        apiKey: appConfig.alphaVantage.apiKey,
        indices: DEFAULT_INDICES,
        symbols: DEFAULT_SYMBOLS,
      });
      console.log('[market-collector] Alpha Vantage backup enabled');
    }
  }

  /**
   * 收集市场数据（支持自动故障转移）
   */
  async collect(): Promise<CollectedData> {
    console.log(`[market-collector] Starting collection with preferred source: ${this.config.preferredSource}`);

    let result: CollectedData | null = null;
    let usedSource: DataSource = this.config.preferredSource!;

    // 尝试首选数据源
    try {
      if (this.config.preferredSource === 'yahoo') {
        result = await this.collectFromYahoo();
      } else if (this.config.preferredSource === 'alpha-vantage') {
        result = await this.collectFromAlphaVantage();
      }
    } catch (error) {
      console.log(`[market-collector] Primary source (${this.config.preferredSource}) failed: ${(error as Error).message}`);
    }

    // 检查是否获取到足够的数据
    const minDataCount = 10; // 至少需要 10 条数据
    if (!result || result.items.length < minDataCount) {
      console.log(`[market-collector] Primary source returned insufficient data (${result?.items.length || 0} items)`);

      if (this.config.fallbackEnabled) {
        // 尝试备用数据源
        try {
          if (this.config.preferredSource === 'yahoo' && this.alphaVantageCollector) {
            console.log('[market-collector] Falling back to Alpha Vantage...');
            result = await this.collectFromAlphaVantage();
            usedSource = 'alpha-vantage';
          } else if (this.config.preferredSource === 'alpha-vantage') {
            console.log('[market-collector] Falling back to Yahoo Finance...');
            result = await this.collectFromYahoo();
            usedSource = 'yahoo';
          }
        } catch (fallbackError) {
          console.log(`[market-collector] Fallback source also failed: ${(fallbackError as Error).message}`);
        }
      }
    }

    if (!result || result.items.length === 0) {
      throw new Error('All data sources failed to fetch market data');
    }

    console.log(`[market-collector] Successfully collected ${result.items.length} items from ${usedSource}`);

    // 保存历史数据
    if (this.config.saveHistory && result.market) {
      const quotes = result.items.map(item => item.metadata as QuoteData);
      await historyManager.saveQuotes(quotes);
    }

    return result;
  }

  /**
   * 从 Yahoo Finance 收集数据
   */
  private async collectFromYahoo(): Promise<CollectedData> {
    return await this.yahooCollector.collect();
  }

  /**
   * 从 Alpha Vantage 收集数据
   */
  private async collectFromAlphaVantage(): Promise<CollectedData> {
    if (!this.alphaVantageCollector) {
      throw new Error('Alpha Vantage not configured (missing API key)');
    }
    return await this.alphaVantageCollector.collect();
  }

  /**
   * 检查数据源可用性
   */
  checkAvailability(): { yahoo: boolean; alphaVantage: boolean } {
    return {
      yahoo: true, // Yahoo Finance 始终可用（不需要 API Key）
      alphaVantage: !!appConfig.alphaVantage.apiKey,
    };
  }
}

// 导出默认实例
export const marketCollector = new MarketCollector();
