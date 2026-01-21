import * as fs from 'fs';
import * as path from 'path';
import { CollectedData } from '../collectors/types';
import { MarketAnalyzer } from './market';
import { NewsAnalyzer } from './news';
import { EconomicAnalyzer } from './economic';
import {
  ComprehensiveAnalysis,
  MarketAnalysis,
  NewsAnalysis,
  EconomicAnalysis,
  MarketCondition,
  Sentiment,
  AnalyzerConfig,
} from './types';

// 聚合数据类型（来自 collect.ts）
interface AggregatedData {
  collectedAt: Date;
  market?: CollectedData;
  news?: CollectedData;
  economic?: CollectedData;
}

/**
 * 统一分析器
 * 整合市场、新闻、经济数据分析，生成综合分析报告
 */
export class UnifiedAnalyzer {
  private marketAnalyzer: MarketAnalyzer;
  private newsAnalyzer: NewsAnalyzer;
  private economicAnalyzer: EconomicAnalyzer;
  private config: AnalyzerConfig;

  constructor(config: AnalyzerConfig = {}) {
    this.config = config;
    this.marketAnalyzer = new MarketAnalyzer(config);
    this.newsAnalyzer = new NewsAnalyzer(config);
    this.economicAnalyzer = new EconomicAnalyzer(config);
  }

  /**
   * 分析聚合数据
   */
  async analyze(data: AggregatedData): Promise<ComprehensiveAnalysis> {
    console.log('[unified-analyzer] Starting comprehensive analysis...');

    let marketAnalysis: MarketAnalysis | undefined;
    let newsAnalysis: NewsAnalysis | undefined;
    let economicAnalysis: EconomicAnalysis | undefined;

    // 分析市场数据
    if (data.market) {
      try {
        marketAnalysis = await this.marketAnalyzer.analyze(data.market);
      } catch (error) {
        console.error('[unified-analyzer] Market analysis failed:', error);
      }
    }

    // 分析新闻数据
    if (data.news) {
      try {
        newsAnalysis = await this.newsAnalyzer.analyze(data.news);
      } catch (error) {
        console.error('[unified-analyzer] News analysis failed:', error);
      }
    }

    // 分析经济数据
    if (data.economic) {
      try {
        economicAnalysis = await this.economicAnalyzer.analyze(data.economic);
      } catch (error) {
        console.error('[unified-analyzer] Economic analysis failed:', error);
      }
    }

    // 生成综合摘要
    const summary = this.generateSummary(marketAnalysis, newsAnalysis, economicAnalysis);

    const result: ComprehensiveAnalysis = {
      timestamp: new Date(),
      market: marketAnalysis,
      news: newsAnalysis,
      economic: economicAnalysis,
      summary,
    };

    console.log('[unified-analyzer] Comprehensive analysis completed');
    return result;
  }

  /**
   * 从文件加载并分析数据
   */
  async analyzeFromFile(filepath: string): Promise<ComprehensiveAnalysis> {
    const content = await fs.promises.readFile(filepath, 'utf-8');
    const data = JSON.parse(content) as AggregatedData;
    return this.analyze(data);
  }

  /**
   * 加载最新的聚合数据文件
   */
  async analyzeLatest(): Promise<ComprehensiveAnalysis> {
    const processedDir = path.resolve(process.cwd(), 'data/processed');
    const files = await fs.promises.readdir(processedDir);

    // 查找最新的 aggregated 文件
    const aggregatedFiles = files
      .filter(f => f.startsWith('aggregated-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (aggregatedFiles.length === 0) {
      throw new Error('No aggregated data file found. Run "npm run collect" first.');
    }

    const latestFile = path.join(processedDir, aggregatedFiles[0]);
    console.log(`[unified-analyzer] Loading: ${aggregatedFiles[0]}`);

    return this.analyzeFromFile(latestFile);
  }

  /**
   * 生成综合摘要
   */
  private generateSummary(
    market?: MarketAnalysis,
    news?: NewsAnalysis,
    economic?: EconomicAnalysis
  ): ComprehensiveAnalysis['summary'] {
    // 综合市场状态
    const marketCondition = market?.condition || 'mixed';

    // 综合情感
    const overallSentiment = this.determineOverallSentiment(market, news);

    // 收集关键点
    const keyPoints: string[] = [];

    // 市场关键点
    if (market) {
      keyPoints.push(...market.highlights.slice(0, 3));
    }

    // 新闻关键点
    if (news) {
      keyPoints.push(...news.highlights.slice(0, 2));
    }

    // 经济关键点
    if (economic) {
      keyPoints.push(...economic.highlights.slice(0, 2));
    }

    // 收集风险和关注点
    const risksAndConcerns: string[] = [];

    if (market) {
      risksAndConcerns.push(...market.riskSignals);
    }

    if (economic) {
      risksAndConcerns.push(...economic.riskFactors);
    }

    // 生成展望
    const outlook = this.generateOutlook(market, economic);

    return {
      marketCondition,
      overallSentiment,
      keyPoints,
      risksAndConcerns,
      outlook,
    };
  }

  /**
   * 判断整体情感
   */
  private determineOverallSentiment(
    market?: MarketAnalysis,
    news?: NewsAnalysis
  ): Sentiment {
    const sentiments: Sentiment[] = [];

    if (market) sentiments.push(market.sentiment);
    if (news) sentiments.push(news.sentiment);

    const bullish = sentiments.filter(s => s === 'bullish').length;
    const bearish = sentiments.filter(s => s === 'bearish').length;

    if (bullish > bearish) return 'bullish';
    if (bearish > bullish) return 'bearish';
    return 'neutral';
  }

  /**
   * 生成展望文字
   */
  private generateOutlook(
    market?: MarketAnalysis,
    economic?: EconomicAnalysis
  ): string {
    const parts: string[] = [];

    // 市场状态
    if (market) {
      switch (market.condition) {
        case 'risk-on':
          parts.push('市场风险偏好较高');
          break;
        case 'risk-off':
          parts.push('市场避险情绪浓厚');
          break;
        default:
          parts.push('市场情绪分化');
      }
    }

    // 经济展望
    if (economic) {
      switch (economic.outlook) {
        case 'expansion':
          parts.push('经济数据显示扩张态势');
          break;
        case 'contraction':
          parts.push('经济指标显示收缩风险');
          break;
        default:
          parts.push('经济运行总体平稳');
      }

      // 收益率曲线
      if (economic.categories.rates.yieldCurve === 'inverted') {
        parts.push('需关注收益率曲线倒挂带来的潜在风险');
      }
    }

    if (parts.length === 0) {
      return '数据不足，暂无法给出展望';
    }

    return parts.join('，') + '。';
  }

  /**
   * 保存分析结果
   */
  async saveAnalysis(analysis: ComprehensiveAnalysis, filename?: string): Promise<string> {
    const outputDir = path.resolve(process.cwd(), 'data/processed');
    await fs.promises.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const file = filename || `analysis-${timestamp}.json`;
    const filepath = path.join(outputDir, file);

    await fs.promises.writeFile(filepath, JSON.stringify(analysis, null, 2), 'utf-8');
    console.log(`[unified-analyzer] Analysis saved to: ${filepath}`);

    return filepath;
  }
}

// 导出默认实例
export const unifiedAnalyzer = new UnifiedAnalyzer();
