/**
 * Polymarket 预测市场数据收集器
 *
 * 数据源: Polymarket (无需 API Key)
 * 免费限制: 无
 */

import { BaseCollector } from './base';
import {
  CollectedData,
  PredictionMarket,
  PredictionMarketConfig,
} from './types';

// Polymarket API 响应类型
interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  category?: string;
  endDate?: string;
  end_date?: string;
  createdAt?: string;
  created_at?: string;
  volume?: string | number;
  volumeNum?: number;
  liquidity?: string | number;
  liquidityNum?: number;
  outcomes: string | string[];
  outcomePrices?: string | string[];
  outcome_prices?: string[];
  active: boolean;
  closed?: boolean;
}

interface PolymarketResponse {
  data?: PolymarketMarket[];
  markets?: PolymarketMarket[];
}

/**
 * Polymarket 收集器
 */
export class PredictionMarketCollector extends BaseCollector<PredictionMarketConfig> {
  readonly name = 'prediction-market';
  readonly description = 'Polymarket prediction market data collector';

  private readonly baseUrl = 'https://gamma-api.polymarket.com';

  // 关注的分类
  private readonly relevantCategories = [
    'economics',
    'finance',
    'crypto',
    'politics',
    'tech',
    'business',
  ];

  // 关键词过滤 (聚焦金融/经济相关)
  private readonly keywordFilters = [
    'fed', 'rate', 'inflation', 'gdp', 'recession',
    'stock', 'market', 'bitcoin', 'crypto', 'trump',
    'election', 'tariff', 'trade', 'china', 'ai',
    'nvidia', 'apple', 'tesla', 'earnings',
  ];

  constructor(config: Partial<PredictionMarketConfig> = {}) {
    super({
      enabled: true,
      minVolume: config.minVolume ?? 10000,
      ...config,
    });
  }

  async collect(): Promise<CollectedData> {
    this.log('Starting Polymarket data collection...');

    const markets: PredictionMarket[] = [];

    try {
      // 获取活跃市场
      const activeMarkets = await this.fetchActiveMarkets();
      this.log(`Fetched ${activeMarkets.length} active markets`);

      // 过滤和处理数据
      for (const market of activeMarkets) {
        // 过滤低流动性市场
        if (market.volume < (this.config.minVolume || 10000)) continue;

        // 检查是否匹配关键词
        if (!this.isRelevantMarket(market)) continue;

        const processed = this.processMarket(market);
        if (processed) {
          markets.push(processed);
        }
      }

      // 按交易量排序
      markets.sort((a, b) => b.volume - a.volume);

      this.log(`Processed ${markets.length} relevant markets`);

      // 保存原始数据
      if (this.config.saveRaw) {
        await this.saveRawData({ markets: activeMarkets });
      }

    } catch (error) {
      this.logError('Failed to fetch Polymarket data', error as Error);
    }

    const result: CollectedData = {
      source: this.name,
      type: 'prediction-market',
      collectedAt: new Date(),
      items: markets.map(market => ({
        id: market.id,
        title: market.question,
        content: this.formatMarketContent(market),
        timestamp: market.createdAt,
        metadata: {
          category: market.category,
          outcomes: market.outcomes,
          volume: market.volume,
          liquidity: market.liquidity,
          endDate: market.endDate,
          url: market.url,
        },
      })),
      metadata: {
        totalMarkets: markets.length,
        categories: [...new Set(markets.map(m => m.category))],
      },
    };

    // 保存处理后的数据
    await this.saveProcessedData(result);

    return result;
  }

  /**
   * 获取活跃市场
   */
  private async fetchActiveMarkets(): Promise<PolymarketMarket[]> {
    try {
      // 使用 Polymarket CLOB API
      const url = `${this.baseUrl}/markets?active=true&closed=false&limit=100`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FinanceBriefingAgent/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // API 直接返回数组
      if (Array.isArray(data)) {
        return data as PolymarketMarket[];
      }
      // 兼容包装格式
      const wrapped = data as PolymarketResponse;
      return wrapped.data || wrapped.markets || [];
    } catch (error) {
      this.logError('Failed to fetch active markets', error as Error);

      // 返回空数组，允许降级
      return [];
    }
  }

  /**
   * 检查市场是否相关
   */
  private isRelevantMarket(market: PolymarketMarket): boolean {
    const question = market.question.toLowerCase();
    const category = market.category?.toLowerCase() || '';

    // 检查分类
    if (this.config.categories) {
      if (!this.config.categories.some(c => category.includes(c.toLowerCase()))) {
        return false;
      }
    } else {
      // 使用默认分类过滤
      if (!this.relevantCategories.some(c => category.includes(c))) {
        // 如果分类不匹配，检查关键词
        if (!this.keywordFilters.some(kw => question.includes(kw))) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 处理市场数据
   */
  private processMarket(market: PolymarketMarket): PredictionMarket | null {
    try {
      // 解析 outcomes (可能是 JSON 字符串或数组)
      let outcomeNames: string[] = [];
      if (typeof market.outcomes === 'string') {
        try {
          outcomeNames = JSON.parse(market.outcomes);
        } catch {
          outcomeNames = [market.outcomes];
        }
      } else {
        outcomeNames = market.outcomes;
      }

      // 解析 prices (可能是 JSON 字符串或数组)
      let outcomePrices: string[] = [];
      const pricesSource = market.outcomePrices || market.outcome_prices;
      if (typeof pricesSource === 'string') {
        try {
          outcomePrices = JSON.parse(pricesSource);
        } catch {
          outcomePrices = [pricesSource];
        }
      } else if (Array.isArray(pricesSource)) {
        outcomePrices = pricesSource;
      }

      const outcomes = outcomeNames.map((name, index) => {
        const price = parseFloat(outcomePrices[index] || '0');
        return {
          name,
          probability: price,
          price,
        };
      });

      // 获取 volume 值
      const volume = market.volumeNum || 
        (typeof market.volume === 'number' ? market.volume : parseFloat(market.volume as string || '0'));
      
      // 获取 liquidity 值
      const liquidity = market.liquidityNum ||
        (typeof market.liquidity === 'number' ? market.liquidity : parseFloat(market.liquidity as string || '0'));

      // 获取日期
      const endDateStr = market.endDate || market.end_date;
      const createdAtStr = market.createdAt || market.created_at;

      return {
        id: market.id,
        question: market.question,
        category: market.category || 'general',
        outcomes,
        volume,
        liquidity,
        endDate: endDateStr ? new Date(endDateStr) : undefined,
        createdAt: createdAtStr ? new Date(createdAtStr) : new Date(),
        url: `https://polymarket.com/event/${market.slug}`,
      };
    } catch (error) {
      this.logError(`Failed to process market ${market.id}`, error as Error);
      return null;
    }
  }

  /**
   * 格式化市场内容
   */
  private formatMarketContent(market: PredictionMarket): string {
    const lines: string[] = [];

    lines.push(`问题: ${market.question}`);
    lines.push(`分类: ${market.category}`);
    lines.push(`交易量: $${market.volume.toLocaleString()}`);
    lines.push('预测结果:');

    for (const outcome of market.outcomes) {
      const percent = (outcome.probability * 100).toFixed(1);
      lines.push(`  - ${outcome.name}: ${percent}%`);
    }

    if (market.endDate) {
      lines.push(`结束日期: ${market.endDate.toISOString().split('T')[0]}`);
    }

    return lines.join('\n');
  }
}

/**
 * 创建 Polymarket 收集器
 */
export function createPredictionMarketCollector(
  config: Partial<PredictionMarketConfig> = {}
): PredictionMarketCollector {
  return new PredictionMarketCollector(config);
}

// 导出默认实例
export const predictionMarketCollector = new PredictionMarketCollector();
