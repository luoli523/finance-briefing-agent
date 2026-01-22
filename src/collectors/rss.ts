import Parser from 'rss-parser';
import { BaseCollector } from './base';
import {
  CollectedData,
  RSSConfig,
  DataItem,
  NewsArticle,
} from './types';

/**
 * RSS Feed 收集器
 * 支持从任何 RSS feed 收集数据，包括：
 * - Nitter Twitter RSS feeds
 * - 新闻网站 RSS
 * - 博客 RSS
 * - 政府/公司公告 RSS
 */
export class RSSCollector extends BaseCollector<RSSConfig> {
  readonly name = 'rss';
  readonly description = 'Generic RSS feed collector';
  
  private parser: Parser;

  constructor(config: Partial<RSSConfig> = {}) {
    const defaultConfig: RSSConfig = {
      enabled: true,
      saveRaw: true,
      timeout: 30000,
      retries: 3,
      feeds: [],
      maxItemsPerFeed: 50, // 每个 feed 最多获取 50 条
    };
    
    super({ ...defaultConfig, ...config });
    
    // 初始化 RSS parser
    this.parser = new Parser({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': 'FinanceBriefingAgent/1.0',
      },
    });
  }

  /**
   * 收集所有配置的 RSS feeds
   */
  async collect(): Promise<CollectedData> {
    this.log('Starting RSS collection...');
    
    const feeds = this.config.feeds;
    if (!feeds || feeds.length === 0) {
      throw new Error('No RSS feeds configured');
    }

    this.log(`Fetching ${feeds.length} RSS feeds...`);
    
    const allItems: DataItem[] = [];
    const errors: Array<{ feed: string; error: string }> = [];

    // 并发获取所有 feeds
    const results = await Promise.allSettled(
      feeds.map(feed => this.fetchFeed(feed))
    );

    // 处理结果
    results.forEach((result, index) => {
      const feedUrl = feeds[index];
      
      if (result.status === 'fulfilled') {
        const items = result.value;
        this.log(`✓ ${feedUrl}: ${items.length} items`);
        allItems.push(...items);
      } else {
        const error = result.reason?.message || 'Unknown error';
        this.logError(`✗ ${feedUrl}: ${error}`);
        errors.push({ feed: feedUrl, error });
      }
    });

    this.log(`Total items collected: ${allItems.length}`);
    if (errors.length > 0) {
      this.log(`Failed feeds: ${errors.length}`);
    }

    const result: CollectedData = {
      source: this.name,
      type: 'rss',
      collectedAt: new Date(),
      items: allItems,
      metadata: {
        totalFeeds: feeds.length,
        successfulFeeds: feeds.length - errors.length,
        failedFeeds: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    };

    // 保存数据
    await this.saveProcessedData(result);
    
    this.log(`RSS collection completed: ${allItems.length} items from ${feeds.length} feeds`);
    
    return result;
  }

  /**
   * 获取单个 RSS feed
   */
  private async fetchFeed(feedUrl: string): Promise<DataItem[]> {
    try {
      const feed = await this.parser.parseURL(feedUrl);
      
      // 解析 feed 信息
      const feedTitle = feed.title || 'Unknown Feed';
      const feedLink = feed.link || feedUrl;
      
      // 检测是否为 Twitter/X feed (通过 Nitter)
      const isTwitterFeed = feedUrl.includes('nitter') || feedUrl.includes('twitter');
      const twitterHandle = isTwitterFeed ? this.extractTwitterHandle(feedUrl) : undefined;

      // 转换为标准格式
      const items: DataItem[] = (feed.items || [])
        .slice(0, this.config.maxItemsPerFeed)
        .map((item, index) => {
          const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
          
          return {
            id: item.guid || item.link || `${feedUrl}-${index}`,
            title: item.title || 'Untitled',
            content: this.cleanContent(item.contentSnippet || item.content || ''),
            timestamp: publishedAt,
            url: item.link,
            metadata: {
              feedTitle,
              feedUrl,
              feedLink,
              author: item.creator || item.author,
              categories: item.categories,
              // Twitter 特定元数据
              ...(isTwitterFeed && {
                source: 'twitter',
                twitterHandle,
                isRetweet: item.title?.startsWith('RT @'),
              }),
            },
          };
        });

      return items;
    } catch (error) {
      throw new Error(`Failed to fetch feed ${feedUrl}: ${error}`);
    }
  }

  /**
   * 清理内容（移除 HTML 标签等）
   */
  private cleanContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, '') // 移除 HTML 标签
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * 从 RSS URL 提取 Twitter 用户名
   */
  private extractTwitterHandle(feedUrl: string): string | undefined {
    // Nitter URL 格式: https://nitter.net/elonmusk/rss
    const match = feedUrl.match(/nitter\.[^/]+\/([^/]+)\/?/);
    if (match && match[1] && match[1] !== 'rss') {
      return `@${match[1]}`;
    }
    return undefined;
  }
}

/**
 * 从配置创建 RSS 收集器实例
 */
export function createRSSCollector(config?: Partial<RSSConfig>): RSSCollector {
  return new RSSCollector(config);
}
