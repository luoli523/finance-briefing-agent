/**
 * 外汇与美元数据收集器
 * 
 * 收集内容：
 * - 美元指数 (DXY)
 * - 美债收益率（2年期、5年期、10年期、30年期）
 * - 主要货币对（USDCHF, USDSGD, USDJPY, USDCNH）
 */

import YahooFinance from 'yahoo-finance2';
import { BaseCollector } from './base';
import {
  CollectedData,
  CollectorConfig,
  QuoteData,
  DataItem,
} from './types';

// 美元相关指标配置
export const FOREX_SYMBOLS = {
  // 美元指数
  dollarIndex: 'DX-Y.NYB',  // 美元指数期货
  
  // 美债收益率（Yahoo Finance 使用 ^IRX, ^FVX, ^TNX, ^TYX）
  treasuryYields: {
    '3M': '^IRX',    // 13周（约3个月）国债
    '2Y': '^/TNX',  // 2年期国债（使用期货代码）
    '5Y': '^FVX',    // 5年期国债
    '10Y': '^TNX',   // 10年期国债
    '30Y': '^TYX',   // 30年期国债
  },
  
  // 主要货币对
  currencyPairs: {
    'USDCHF': 'USDCHF=X',
    'USDSGD': 'USDSGD=X',
    'USDJPY': 'USDJPY=X',
    'USDCNH': 'USDCNH=X',
  },
};

export interface ForexConfig extends CollectorConfig {
  includeYields?: boolean;      // 是否包含美债收益率
  includeCurrencies?: boolean;  // 是否包含货币对
}

const DEFAULT_CONFIG: ForexConfig = {
  enabled: true,
  saveRaw: true,
  timeout: 30000,
  retries: 3,
  includeYields: true,
  includeCurrencies: true,
};

/**
 * 外汇与美元数据收集器
 */
export class ForexCollector extends BaseCollector<ForexConfig> {
  readonly name = 'forex-collector';
  readonly description = 'Dollar Index, Treasury Yields, and Forex pairs collector';

  constructor(config: Partial<ForexConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  /**
   * 收集外汇和美元数据
   */
  async collect(): Promise<CollectedData> {
    this.log('Starting forex and dollar data collection...');

    const symbols: string[] = [FOREX_SYMBOLS.dollarIndex];
    
    // 添加美债收益率符号
    if (this.config.includeYields) {
      symbols.push(...Object.values(FOREX_SYMBOLS.treasuryYields));
    }
    
    // 添加货币对符号
    if (this.config.includeCurrencies) {
      symbols.push(...Object.values(FOREX_SYMBOLS.currencyPairs));
    }

    try {
      const quotes = await this.fetchQuotes(symbols);
      
      // 转换为 DataItem 格式
      const items: DataItem[] = quotes.map(quote => ({
        id: quote.symbol,
        title: quote.name,
        content: JSON.stringify(quote),
        timestamp: quote.timestamp,
        metadata: quote,
      }));

      const result: CollectedData = {
        source: this.name,
        type: 'market',
        collectedAt: new Date(),
        items,
        metadata: {
          dollarIndex: this.extractDollarIndex(quotes),
          treasuryYields: this.extractTreasuryYields(quotes),
          currencyPairs: this.extractCurrencyPairs(quotes),
        },
        raw: this.config.saveRaw ? quotes : undefined,
      };

      this.log(`Collected ${quotes.length} forex data points`);
      return result;
    } catch (error) {
      this.logError('Failed to collect forex data:', error as Error);
      throw error;
    }
  }

  /**
   * 批量获取报价
   */
  private async fetchQuotes(symbols: string[]): Promise<QuoteData[]> {
    const quotes: QuoteData[] = [];
    const batchSize = 5;
    const delayMs = 1000;

    this.log(`Fetching quotes for ${symbols.length} symbols...`);

    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      
      try {
        const results = await Promise.allSettled(
          batch.map(symbol => this.fetchQuote(symbol))
        );

        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          if (result.status === 'fulfilled' && result.value) {
            quotes.push(result.value);
          } else if (result.status === 'rejected') {
            this.log(`Failed to fetch ${batch[j]}: ${result.reason}`);
          }
        }

        // 批次间延迟，避免请求过快
        if (i + batchSize < symbols.length) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        this.logError(`Failed to fetch batch starting at index ${i}:`, error as Error);
      }
    }

    return quotes;
  }

  /**
   * 获取单个报价
   */
  private async fetchQuote(symbol: string): Promise<QuoteData | null> {
    try {
      const quote = await YahooFinance.quote(symbol) as any;
      
      if (!quote || typeof quote.regularMarketPrice !== 'number') {
        this.log(`Invalid quote data for ${symbol}`);
        return null;
      }

      return {
        symbol: quote.symbol,
        name: quote.longName || quote.shortName || symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        open: quote.regularMarketOpen,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        volume: quote.regularMarketVolume,
        previousClose: quote.regularMarketPreviousClose,
        timestamp: new Date(),
      };
    } catch (error) {
      this.log(`Failed to fetch quote for ${symbol}: ${error}`);
      return null;
    }
  }

  /**
   * 提取美元指数数据
   */
  private extractDollarIndex(quotes: QuoteData[]): QuoteData | null {
    return quotes.find(q => q.symbol === FOREX_SYMBOLS.dollarIndex) || null;
  }

  /**
   * 提取美债收益率数据
   */
  private extractTreasuryYields(quotes: QuoteData[]): Record<string, QuoteData> {
    const yields: Record<string, QuoteData> = {};
    
    for (const [period, symbol] of Object.entries(FOREX_SYMBOLS.treasuryYields)) {
      const quote = quotes.find(q => q.symbol === symbol);
      if (quote) {
        yields[period] = quote;
      }
    }
    
    return yields;
  }

  /**
   * 提取货币对数据
   */
  private extractCurrencyPairs(quotes: QuoteData[]): Record<string, QuoteData> {
    const pairs: Record<string, QuoteData> = {};
    
    for (const [pair, symbol] of Object.entries(FOREX_SYMBOLS.currencyPairs)) {
      const quote = quotes.find(q => q.symbol === symbol);
      if (quote) {
        pairs[pair] = quote;
      }
    }
    
    return pairs;
  }
}

// 单例实例
export const forexCollector = new ForexCollector();

/**
 * 创建外汇收集器实例
 */
export function createForexCollector(config?: Partial<ForexConfig>): ForexCollector {
  return new ForexCollector(config);
}
