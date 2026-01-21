import { CollectedData, NewsArticle } from '../collectors/types';
import { BaseAnalyzer } from './base';
import {
  NewsAnalysis,
  NewsTopic,
  Sentiment,
  AnalyzerConfig,
} from './types';

// 关键词分类
const TOPIC_KEYWORDS: Record<string, string[]> = {
  'AI/人工智能': ['AI', 'artificial intelligence', 'ChatGPT', 'OpenAI', 'machine learning', 'neural', 'LLM'],
  '美联储/利率': ['Fed', 'Federal Reserve', 'interest rate', 'rate cut', 'rate hike', 'Powell', 'FOMC', 'monetary'],
  '科技股': ['tech', 'technology', 'Apple', 'Microsoft', 'Google', 'Amazon', 'Meta', 'NVIDIA'],
  '半导体': ['chip', 'semiconductor', 'NVIDIA', 'AMD', 'Intel', 'TSMC', 'ASML'],
  '财报': ['earnings', 'revenue', 'profit', 'quarterly', 'guidance', 'beat', 'miss'],
  '地缘政治': ['China', 'Taiwan', 'Russia', 'Ukraine', 'tariff', 'sanction', 'trade war'],
  '能源': ['oil', 'gas', 'energy', 'OPEC', 'crude', 'renewable', 'nuclear'],
  '加密货币': ['crypto', 'Bitcoin', 'Ethereum', 'blockchain', 'cryptocurrency'],
  '就业': ['jobs', 'employment', 'unemployment', 'layoff', 'hiring', 'labor'],
  '通胀': ['inflation', 'CPI', 'price', 'cost', 'consumer'],
};

// 情感关键词
const SENTIMENT_KEYWORDS = {
  bullish: ['surge', 'soar', 'jump', 'rally', 'gain', 'rise', 'beat', 'outperform', 'bullish', 'record high', 'breakthrough'],
  bearish: ['plunge', 'crash', 'drop', 'fall', 'decline', 'sink', 'miss', 'bearish', 'warning', 'concern', 'fear', 'risk'],
};

/**
 * 新闻分析器
 */
export class NewsAnalyzer extends BaseAnalyzer<NewsAnalysis> {
  readonly name = 'news-analyzer';

  constructor(config: AnalyzerConfig = {}) {
    super(config);
  }

  /**
   * 分析新闻数据
   */
  async analyze(data: CollectedData): Promise<NewsAnalysis> {
    this.log('Starting news analysis...');

    const articles = data.items.map(item => item.metadata as NewsArticle);

    // 分析主题
    const topTopics = this.analyzeTopics(articles);

    // 分析整体情感
    const overallSentiment = this.analyzeOverallSentiment(articles);

    // 提取重要新闻
    const keyHeadlines = this.extractKeyHeadlines(articles);

    // 生成关键发现
    const highlights = this.generateHighlights(topTopics, keyHeadlines, articles);

    const result: NewsAnalysis = {
      timestamp: new Date(),
      totalArticles: articles.length,
      sentiment: overallSentiment,
      topTopics,
      keyHeadlines,
      highlights,
    };

    this.log(`News analysis completed: ${articles.length} articles analyzed`);
    return result;
  }

  /**
   * 分析新闻主题
   */
  private analyzeTopics(articles: NewsArticle[]): NewsTopic[] {
    const topicCounts: Record<string, {
      count: number;
      headlines: string[];
      relatedSymbols: Set<string>;
      sentiments: Sentiment[];
    }> = {};

    // 统计每个主题
    for (const article of articles) {
      const text = `${article.headline} ${article.summary}`.toLowerCase();

      for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        const hasKeyword = keywords.some(kw => text.includes(kw.toLowerCase()));

        if (hasKeyword) {
          if (!topicCounts[topic]) {
            topicCounts[topic] = {
              count: 0,
              headlines: [],
              relatedSymbols: new Set(),
              sentiments: [],
            };
          }

          topicCounts[topic].count++;
          if (topicCounts[topic].headlines.length < 3) {
            topicCounts[topic].headlines.push(article.headline);
          }

          if (article.relatedSymbols) {
            article.relatedSymbols.forEach(s => topicCounts[topic].relatedSymbols.add(s));
          }

          topicCounts[topic].sentiments.push(this.analyzeSentiment(article));
        }
      }
    }

    // 转换为结果数组并排序
    const topics: NewsTopic[] = Object.entries(topicCounts)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        sentiment: this.aggregateSentiment(data.sentiments),
        relatedSymbols: Array.from(data.relatedSymbols),
        headlines: data.headlines,
      }))
      .sort((a, b) => b.count - a.count);

    return topics.slice(0, this.config.topN || 5);
  }

  /**
   * 分析单篇文章情感
   */
  private analyzeSentiment(article: NewsArticle): Sentiment {
    const text = `${article.headline} ${article.summary}`.toLowerCase();

    let bullishScore = 0;
    let bearishScore = 0;

    for (const keyword of SENTIMENT_KEYWORDS.bullish) {
      if (text.includes(keyword.toLowerCase())) {
        bullishScore++;
      }
    }

    for (const keyword of SENTIMENT_KEYWORDS.bearish) {
      if (text.includes(keyword.toLowerCase())) {
        bearishScore++;
      }
    }

    if (bullishScore > bearishScore + 1) return 'bullish';
    if (bearishScore > bullishScore + 1) return 'bearish';
    return 'neutral';
  }

  /**
   * 聚合多个情感为一个
   */
  private aggregateSentiment(sentiments: Sentiment[]): Sentiment {
    const counts = { bullish: 0, bearish: 0, neutral: 0 };

    for (const s of sentiments) {
      counts[s]++;
    }

    if (counts.bullish > counts.bearish * 1.5) return 'bullish';
    if (counts.bearish > counts.bullish * 1.5) return 'bearish';
    return 'neutral';
  }

  /**
   * 分析整体新闻情感
   */
  private analyzeOverallSentiment(articles: NewsArticle[]): Sentiment {
    const sentiments = articles.map(a => this.analyzeSentiment(a));
    return this.aggregateSentiment(sentiments);
  }

  /**
   * 提取重要新闻
   */
  private extractKeyHeadlines(articles: NewsArticle[]): NewsAnalysis['keyHeadlines'] {
    // 按重要性评分
    const scored = articles.map(article => {
      let score = 0;

      // 来源权重
      const premiumSources = ['Bloomberg', 'Reuters', 'WSJ', 'Financial Times', 'CNBC'];
      if (premiumSources.some(s => article.source.includes(s))) {
        score += 3;
      }

      // 关键主题加分
      const text = `${article.headline} ${article.summary}`.toLowerCase();
      if (text.includes('fed') || text.includes('federal reserve')) score += 2;
      if (text.includes('earnings')) score += 1;
      if (text.includes('breaking')) score += 2;

      // 相关股票加分
      if (article.relatedSymbols && article.relatedSymbols.length > 0) {
        score += 1;
      }

      const sentiment = this.analyzeSentiment(article);

      return {
        headline: article.headline,
        source: article.source,
        sentiment,
        importance: score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low',
        score,
      } as const;
    });

    // 按评分排序并取 top N
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.topN || 10)
      .map(({ score, ...rest }) => rest);
  }

  /**
   * 生成关键发现
   */
  private generateHighlights(
    topics: NewsTopic[],
    keyHeadlines: NewsAnalysis['keyHeadlines'],
    articles: NewsArticle[]
  ): string[] {
    const highlights: string[] = [];

    // 热门主题
    if (topics.length > 0) {
      const topTopic = topics[0];
      highlights.push(`今日热点：${topTopic.topic}，相关新闻 ${topTopic.count} 条`);
    }

    // 情感分析
    const bullishCount = articles.filter(a => this.analyzeSentiment(a) === 'bullish').length;
    const bearishCount = articles.filter(a => this.analyzeSentiment(a) === 'bearish').length;

    if (bullishCount > bearishCount * 2) {
      highlights.push(`新闻情绪偏乐观，利好消息占主导`);
    } else if (bearishCount > bullishCount * 2) {
      highlights.push(`新闻情绪偏悲观，市场担忧情绪较重`);
    }

    // 重要来源
    const premiumNews = keyHeadlines.filter(h => h.importance === 'high');
    if (premiumNews.length > 0) {
      highlights.push(`${premiumNews.length} 条重要新闻值得关注`);
    }

    // 特定主题提醒
    const fedTopic = topics.find(t => t.topic === '美联储/利率');
    if (fedTopic && fedTopic.count >= 3) {
      highlights.push(`美联储相关新闻较多，关注货币政策动向`);
    }

    const aiTopic = topics.find(t => t.topic === 'AI/人工智能');
    if (aiTopic && aiTopic.count >= 5) {
      highlights.push(`AI 话题持续火热，${aiTopic.count} 条相关新闻`);
    }

    return highlights;
  }
}
