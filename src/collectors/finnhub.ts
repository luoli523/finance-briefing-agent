import { BaseCollector } from './base';
import {
  CollectedData,
  FinnhubConfig,
  NewsArticle,
  NewsCategory,
  DataItem,
} from './types';

// Finnhub API 基础 URL
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// 默认配置
const DEFAULT_CONFIG: Omit<FinnhubConfig, 'apiKey'> = {
  enabled: true,
  saveRaw: true,
  timeout: 30000,
  retries: 3,
  category: 'general',
};

// Finnhub API 返回的新闻格式
interface FinnhubNewsItem {
  id: number;
  category: string;
  datetime: number;
  headline: string;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

/**
 * Finnhub 财经新闻收集器
 * 获取全球财经新闻资讯
 */
export class FinnhubCollector extends BaseCollector<FinnhubConfig> {
  readonly name = 'finnhub';
  readonly description = 'Finnhub financial news collector';

  constructor(config: Partial<FinnhubConfig> & { apiKey: string }) {
    super({ ...DEFAULT_CONFIG, ...config } as FinnhubConfig);

    if (!this.config.apiKey) {
      throw new Error('Finnhub API key is required');
    }
  }

  /**
   * 收集新闻数据
   */
  async collect(): Promise<CollectedData> {
    this.log('Starting news collection...');

    try {
      const news = await this.fetchMarketNews();

      // 转换为统一的新闻格式
      const articles: NewsArticle[] = news.map(item => this.transformNews(item));

      // 转换为通用数据项格式
      const items: DataItem[] = articles.map(article => ({
        id: article.id,
        title: article.headline,
        content: article.summary,
        timestamp: article.publishedAt,
        metadata: { ...article },
      }));

      const result: CollectedData = {
        source: this.name,
        type: 'news',
        collectedAt: new Date(),
        items,
      };

      // 保存数据
      if (this.config.saveRaw) {
        await this.saveRawData(news);
      }
      await this.saveProcessedData(result);

      this.log(`Collected ${articles.length} news articles successfully`);
      return result;

    } catch (error) {
      this.logError('Failed to collect news', error as Error);
      throw error;
    }
  }

  /**
   * 获取市场新闻
   */
  private async fetchMarketNews(): Promise<FinnhubNewsItem[]> {
    const category = this.config.category || 'general';
    const url = `${FINNHUB_BASE_URL}/news?category=${category}&token=${this.config.apiKey}`;

    this.log(`Fetching ${category} news...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid Finnhub API key');
      }
      if (response.status === 429) {
        throw new Error('Finnhub API rate limit exceeded');
      }
      throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as FinnhubNewsItem[];
  }

  /**
   * 获取特定股票的新闻
   */
  async fetchCompanyNews(symbol: string, fromDate: string, toDate: string): Promise<NewsArticle[]> {
    const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${this.config.apiKey}`;

    this.log(`Fetching news for ${symbol}...`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch company news: ${response.status}`);
    }

    const data = await response.json() as FinnhubNewsItem[];
    return data.map(item => this.transformNews(item));
  }

  /**
   * 转换 Finnhub 新闻格式为统一格式
   */
  private transformNews(item: FinnhubNewsItem): NewsArticle {
    return {
      id: String(item.id),
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      imageUrl: item.image || undefined,
      publishedAt: new Date(item.datetime * 1000),
      category: this.mapCategory(item.category),
      relatedSymbols: item.related ? item.related.split(',').map(s => s.trim()) : undefined,
    };
  }

  /**
   * 映射新闻类别
   */
  private mapCategory(category: string): NewsCategory {
    const categoryMap: Record<string, NewsCategory> = {
      general: 'general',
      forex: 'forex',
      crypto: 'crypto',
      merger: 'merger',
    };
    return categoryMap[category.toLowerCase()] || 'general';
  }

  /**
   * 格式化新闻摘要（用于简报）
   */
  formatNewsSummary(articles: NewsArticle[], limit: number = 10): string {
    const topNews = articles.slice(0, limit);

    return topNews
      .map((article, index) => {
        const time = article.publishedAt.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return `${index + 1}. [${time}] ${article.headline}\n   Source: ${article.source}`;
      })
      .join('\n\n');
  }
}

/**
 * 从环境变量创建 Finnhub 收集器
 */
export function createFinnhubCollector(config?: Partial<FinnhubConfig>): FinnhubCollector {
  const apiKey = config?.apiKey || process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error('FINNHUB_API_KEY environment variable is not set');
  }

  return new FinnhubCollector({ ...config, apiKey });
}
