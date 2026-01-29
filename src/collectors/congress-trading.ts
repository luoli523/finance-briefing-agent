/**
 * 国会交易数据收集器
 *
 * 数据源: Finnhub API (免费版包含 Congressional Trading)
 * 免费限制: 60次/分钟
 *
 * 备注: 国会议员需在交易后45天内披露股票交易
 */

import { BaseCollector } from './base';
import {
  CollectedData,
  CongressTrade,
  CongressTradingConfig,
} from './types';
import { appConfig, getStockSymbols } from '../config/index';

// Finnhub API 响应类型
interface FinnhubCongressTrade {
  symbol: string;
  name: string;
  transactionDate: string;
  filingDate: string;
  transactionType: string;
  transactionAmount: string;
  ownerType: string;
  firstName?: string;
  lastName?: string;
  chamber?: string;
  party?: string;
  state?: string;
}

/**
 * 国会交易收集器 (使用 Finnhub 免费 API)
 */
export class CongressTradingCollector extends BaseCollector<CongressTradingConfig> {
  readonly name = 'congress-trading';
  readonly description = 'US Congress trading data collector via Finnhub';

  private readonly baseUrl = 'https://finnhub.io/api/v1';

  constructor(config: Partial<CongressTradingConfig> = {}) {
    super({
      enabled: true,
      apiKey: config.apiKey || appConfig.finnhub?.apiKey || '',
      daysBack: config.daysBack ?? 30,
      ...config,
    });
  }

  async collect(): Promise<CollectedData> {
    this.log('Starting Congress trading data collection via Finnhub...');

    const trades: CongressTrade[] = [];

    // 检查 API Key
    if (!this.config.apiKey) {
      this.log('⚠️ FINNHUB_API_KEY not configured, skipping collection');
      return this.createEmptyResult('FINNHUB_API_KEY not configured');
    }

    try {
      // 获取最近的国会交易
      const rawTrades = await this.fetchCongressTrades();
      this.log(`Fetched ${rawTrades.length} raw trades`);

      // 计算日期过滤范围
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (this.config.daysBack || 30));

      // 获取监控的股票列表用于过滤
      const monitoredSymbols = new Set(
        this.config.filterSymbols || getStockSymbols()
      );

      // 处理数据
      for (const trade of rawTrades) {
        // 日期过滤
        const filingDate = new Date(trade.filingDate);
        if (filingDate < cutoffDate) continue;

        // 股票过滤（可选）
        if (this.config.filterSymbols && this.config.filterSymbols.length > 0) {
          if (!monitoredSymbols.has(trade.symbol)) continue;
        }

        const processed = this.processTrade(trade);
        if (processed) {
          trades.push(processed);
        }
      }

      // 按披露日期排序（最新优先）
      trades.sort((a, b) => b.disclosureDate.getTime() - a.disclosureDate.getTime());

      this.log(`Processed ${trades.length} trades after filtering`);

      // 保存原始数据
      if (this.config.saveRaw) {
        await this.saveRawData({ trades: rawTrades });
      }

    } catch (error) {
      this.logError('Failed to fetch Congress trading data', error as Error);
      return this.createEmptyResult((error as Error).message);
    }

    const result: CollectedData = {
      source: this.name,
      type: 'congress-trading',
      collectedAt: new Date(),
      items: trades.map(trade => ({
        id: `${trade.politician}-${trade.ticker}-${trade.transactionDate.toISOString()}`,
        title: `${trade.politician} ${trade.transactionType === 'buy' ? '买入' : '卖出'} ${trade.ticker}`,
        content: this.formatTradeContent(trade),
        timestamp: trade.disclosureDate,
        metadata: {
          politician: trade.politician,
          party: trade.party,
          chamber: trade.chamber,
          ticker: trade.ticker,
          company: trade.company,
          transactionType: trade.transactionType,
          amount: trade.amount,
          amountMin: trade.amountMin,
          amountMax: trade.amountMax,
          transactionDate: trade.transactionDate,
          filingUrl: trade.filingUrl,
        },
      })),
      metadata: {
        totalTrades: trades.length,
        daysBack: this.config.daysBack,
        buyTrades: trades.filter(t => t.transactionType === 'buy').length,
        sellTrades: trades.filter(t => t.transactionType === 'sell').length,
        topBoughtStocks: this.getTopStocks(trades, 'buy'),
        topSoldStocks: this.getTopStocks(trades, 'sell'),
      },
    };

    // 保存处理后的数据
    await this.saveProcessedData(result);

    return result;
  }

  /**
   * 获取国会交易数据 (Finnhub)
   */
  private async fetchCongressTrades(): Promise<FinnhubCongressTrade[]> {
    // Finnhub Congressional Trading endpoint
    const url = `${this.baseUrl}/stock/congressional-trading?token=${this.config.apiKey}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Finnhub API key');
      }
      if (response.status === 429) {
        throw new Error('Finnhub API rate limit exceeded');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  /**
   * 处理单笔交易
   */
  private processTrade(trade: FinnhubCongressTrade): CongressTrade | null {
    try {
      // 解析交易类型
      const transactionLower = trade.transactionType?.toLowerCase() || '';
      let transactionType: 'buy' | 'sell' | 'exchange' = 'buy';
      if (transactionLower.includes('sale') || transactionLower.includes('sold') || transactionLower.includes('sell')) {
        transactionType = 'sell';
      } else if (transactionLower.includes('exchange')) {
        transactionType = 'exchange';
      }

      // 解析党派
      let party: 'D' | 'R' | 'I' = 'I';
      if (trade.party) {
        const partyLower = trade.party.toLowerCase();
        if (partyLower.includes('democrat') || partyLower === 'd' || partyLower === 'democratic') {
          party = 'D';
        } else if (partyLower.includes('republican') || partyLower === 'r') {
          party = 'R';
        }
      }

      // 解析议院
      const chamber: 'House' | 'Senate' = trade.chamber?.toLowerCase() === 'senate' ? 'Senate' : 'House';

      // 解析金额范围
      const { min, max } = this.parseAmountRange(trade.transactionAmount);

      // 构建议员名称
      const politician = [trade.firstName, trade.lastName].filter(Boolean).join(' ') || 'Unknown';

      return {
        politician,
        party,
        chamber,
        ticker: trade.symbol,
        company: trade.name || trade.symbol,
        transactionType,
        amount: trade.transactionAmount,
        amountMin: min,
        amountMax: max,
        transactionDate: new Date(trade.transactionDate),
        disclosureDate: new Date(trade.filingDate),
        filingUrl: undefined,
      };
    } catch (error) {
      this.logError(`Failed to process trade`, error as Error);
      return null;
    }
  }

  /**
   * 解析金额范围
   */
  private parseAmountRange(range: string): { min: number; max: number } {
    // 常见格式: "$1,001 - $15,000", "$15,001 - $50,000", etc.
    const amounts: Record<string, { min: number; max: number }> = {
      '$1,001 - $15,000': { min: 1001, max: 15000 },
      '$15,001 - $50,000': { min: 15001, max: 50000 },
      '$50,001 - $100,000': { min: 50001, max: 100000 },
      '$100,001 - $250,000': { min: 100001, max: 250000 },
      '$250,001 - $500,000': { min: 250001, max: 500000 },
      '$500,001 - $1,000,000': { min: 500001, max: 1000000 },
      '$1,000,001 - $5,000,000': { min: 1000001, max: 5000000 },
      '$5,000,001 - $25,000,000': { min: 5000001, max: 25000000 },
      '$25,000,001 - $50,000,000': { min: 25000001, max: 50000000 },
      'Over $50,000,000': { min: 50000001, max: 100000000 },
    };

    return amounts[range] || { min: 0, max: 0 };
  }

  /**
   * 格式化交易内容
   */
  private formatTradeContent(trade: CongressTrade): string {
    const partyName = trade.party === 'D' ? '民主党' : trade.party === 'R' ? '共和党' : '独立';
    const chamberName = trade.chamber === 'Senate' ? '参议院' : '众议院';
    const actionName = trade.transactionType === 'buy' ? '买入' : trade.transactionType === 'sell' ? '卖出' : '交换';

    const lines: string[] = [];
    lines.push(`议员: ${trade.politician}`);
    lines.push(`党派: ${partyName}`);
    lines.push(`议院: ${chamberName}`);
    lines.push(`股票: ${trade.ticker}`);
    lines.push(`操作: ${actionName}`);
    lines.push(`金额: ${trade.amount}`);
    lines.push(`交易日期: ${trade.transactionDate.toISOString().split('T')[0]}`);
    lines.push(`披露日期: ${trade.disclosureDate.toISOString().split('T')[0]}`);

    return lines.join('\n');
  }

  /**
   * 获取热门交易股票
   */
  private getTopStocks(
    trades: CongressTrade[],
    type: 'buy' | 'sell'
  ): { ticker: string; count: number }[] {
    const filtered = trades.filter(t => t.transactionType === type);
    const counts = new Map<string, number>();

    for (const trade of filtered) {
      counts.set(trade.ticker, (counts.get(trade.ticker) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([ticker, count]) => ({ ticker, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * 创建空结果
   */
  private createEmptyResult(reason: string): CollectedData {
    return {
      source: this.name,
      type: 'congress-trading',
      collectedAt: new Date(),
      items: [],
      metadata: {
        status: 'no_data',
        reason,
      },
    };
  }
}

/**
 * 创建国会交易收集器
 */
export function createCongressTradingCollector(
  config: Partial<CongressTradingConfig> = {}
): CongressTradingCollector {
  return new CongressTradingCollector(config);
}

// 导出默认实例
export const congressTradingCollector = new CongressTradingCollector();
