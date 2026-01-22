import { BaseCollector } from './base';
import {
  CollectedData,
  CollectorConfig,
  QuoteData,
  MarketOverview,
  DataItem,
} from './types';

// Alpha Vantage 配置
export interface AlphaVantageConfig extends CollectorConfig {
  apiKey: string;
  symbols: string[];
  indices: string[];
}

// Alpha Vantage API 响应类型
interface AVGlobalQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

// 工具函数：延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 默认配置
const DEFAULT_CONFIG: AlphaVantageConfig = {
  enabled: true,
  saveRaw: true,
  timeout: 30000,
  retries: 3,
  apiKey: '',
  indices: [],
  symbols: [],
};

/**
 * Alpha Vantage 数据收集器（备用数据源）
 * 免费版限制：每分钟 5 次请求，每天 500 次请求
 */
export class AlphaVantageCollector extends BaseCollector<AlphaVantageConfig> {
  readonly name = 'alpha-vantage';
  readonly description = 'Alpha Vantage stock market data collector (backup)';

  private baseUrl = 'https://www.alphavantage.co/query';

  constructor(config: Partial<AlphaVantageConfig> = {}) {
    super({ ...DEFAULT_CONFIG, ...config });
  }

  /**
   * 检查是否可用（API Key 已配置）
   */
  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  /**
   * 收集市场数据
   */
  async collect(): Promise<CollectedData> {
    if (!this.config.apiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    this.log('Starting data collection...');

    const allSymbols = [...this.config.indices, ...this.config.symbols];
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

    this.log(`Collected ${quotes.length} quotes successfully`);
    return result;
  }

  /**
   * 批量获取股票报价
   * Alpha Vantage 免费版限制每分钟 5 次请求
   */
  private async fetchQuotes(symbols: string[]): Promise<QuoteData[]> {
    this.log(`Fetching quotes for ${symbols.length} symbols...`);

    const results: QuoteData[] = [];
    const requestDelay = 12000; // 每分钟 5 次 = 每 12 秒 1 次

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];

      // 每次请求间隔 12 秒（免费版限制）
      if (i > 0) {
        this.log(`Waiting 12 seconds (API rate limit)... [${i + 1}/${symbols.length}]`);
        await delay(requestDelay);
      }

      try {
        const quote = await this.fetchQuote(symbol);
        if (quote) {
          results.push(quote);
          this.log(`✓ ${symbol} fetched`);
        }
      } catch (error) {
        this.logError(`Failed to fetch ${symbol}: ${(error as Error).message}`);
      }
    }

    return results;
  }

  /**
   * 获取单个股票报价
   */
  private async fetchQuote(symbol: string): Promise<QuoteData | null> {
    const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json() as {
        'Global Quote'?: AVGlobalQuote;
        'Note'?: string;
        'Information'?: string;
      };

      if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
        return this.transformQuote(data['Global Quote'], symbol);
      }

      // 检查是否是 API 限制错误
      if (data['Note'] || data['Information']) {
        this.log(`⚠ API limit reached: ${data['Note'] || data['Information']}`);
        return null;
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 转换 Alpha Vantage 数据格式
   */
  private transformQuote(quote: AVGlobalQuote, symbol: string): QuoteData {
    const price = parseFloat(quote['05. price']) || 0;
    const change = parseFloat(quote['09. change']) || 0;
    const changePercentStr = quote['10. change percent'] || '0%';
    const changePercent = parseFloat(changePercentStr.replace('%', '')) || 0;

    return {
      symbol: quote['01. symbol'] || symbol,
      name: symbol, // Alpha Vantage 不返回公司名称
      price,
      change,
      changePercent,
      open: parseFloat(quote['02. open']) || undefined,
      high: parseFloat(quote['03. high']) || undefined,
      low: parseFloat(quote['04. low']) || undefined,
      volume: parseInt(quote['06. volume']) || undefined,
      previousClose: parseFloat(quote['08. previous close']) || undefined,
      timestamp: new Date(),
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
}

// 导出默认实例
export const alphaVantageCollector = new AlphaVantageCollector();
