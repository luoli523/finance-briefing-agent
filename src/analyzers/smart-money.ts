/**
 * 智慧资金分析器
 *
 * 整合国会交易、对冲基金持仓、预测市场、社交情绪数据
 * 生成综合的智慧资金分析报告
 */

import { CollectedData } from '../collectors/types';
import {
  SmartMoneyAnalysis,
  CongressTradingAnalysis,
  HedgeFundAnalysis,
  PredictionMarketAnalysis,
  SocialSentimentAnalysis,
  AnalyzerConfig,
} from './types';
import { STOCK_INFO } from '../config';

// 智慧资金数据
interface SmartMoneyData {
  congressTrading?: CollectedData;
  hedgeFund?: CollectedData;
  predictionMarket?: CollectedData;
  socialSentiment?: CollectedData;
  twitterSentiment?: CollectedData;
}

/**
 * 智慧资金分析器
 */
export class SmartMoneyAnalyzer {
  private config: AnalyzerConfig;

  constructor(config: AnalyzerConfig = {}) {
    this.config = {
      topN: config.topN ?? 10,
      includeDetails: config.includeDetails ?? true,
    };
  }

  /**
   * 分析智慧资金数据
   */
  async analyze(data: SmartMoneyData): Promise<SmartMoneyAnalysis> {
    console.log('[smart-money-analyzer] Starting analysis...');

    // 分析各数据源
    const congressAnalysis = data.congressTrading
      ? this.analyzeCongressTrading(data.congressTrading)
      : undefined;

    const hedgeFundAnalysis = data.hedgeFund
      ? this.analyzeHedgeFund(data.hedgeFund)
      : undefined;

    const predictionAnalysis = data.predictionMarket
      ? this.analyzePredictionMarket(data.predictionMarket)
      : undefined;

    // 合并 Reddit + X.com 情绪数据后统一分析
    const mergedSentimentData = this.mergeSentimentSources(data.socialSentiment, data.twitterSentiment);
    const sentimentAnalysis = mergedSentimentData
      ? this.analyzeSocialSentiment(mergedSentimentData)
      : undefined;

    // 生成综合研判
    const synthesis = this.synthesizeSignals(
      congressAnalysis,
      hedgeFundAnalysis,
      predictionAnalysis,
      sentimentAnalysis
    );

    // 生成高亮
    const highlights = this.generateHighlights(
      congressAnalysis,
      hedgeFundAnalysis,
      predictionAnalysis,
      sentimentAnalysis
    );

    const result: SmartMoneyAnalysis = {
      timestamp: new Date(),
      congressTrading: congressAnalysis,
      hedgeFund: hedgeFundAnalysis,
      predictionMarket: predictionAnalysis,
      socialSentiment: sentimentAnalysis,
      synthesis,
      highlights,
    };

    console.log('[smart-money-analyzer] Analysis completed');
    return result;
  }

  /**
   * 分析国会交易数据
   */
  private analyzeCongressTrading(data: CollectedData): CongressTradingAnalysis {
    const trades = data.items || [];
    const metadata = data.metadata || {};

    // 统计买卖
    const buyTrades = trades.filter(t => t.metadata?.transactionType === 'buy');
    const sellTrades = trades.filter(t => t.metadata?.transactionType === 'sell');

    // 计算净情绪
    let netSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (buyTrades.length > sellTrades.length * 1.5) {
      netSentiment = 'bullish';
    } else if (sellTrades.length > buyTrades.length * 1.5) {
      netSentiment = 'bearish';
    }

    // 聚合买入股票
    const buyAggregated = this.aggregateTradesByTicker(buyTrades);
    const sellAggregated = this.aggregateTradesByTicker(sellTrades);

    // 提取显著交易
    const notableTrades = trades
      .filter(t => {
        const amountMin = t.metadata?.amountMin || 0;
        return amountMin >= 50000; // $50K+ 交易
      })
      .slice(0, 10)
      .map(t => ({
        politician: t.metadata?.politician || '',
        party: t.metadata?.party || 'I',
        ticker: t.metadata?.ticker || '',
        type: t.metadata?.transactionType || 'buy',
        amount: t.metadata?.amount || '',
        date: new Date(t.timestamp),
        significance: this.assessTradeSignificance(t),
      }));

    const highlights: string[] = [];
    if (netSentiment === 'bullish') {
      highlights.push(`国会议员近期买入明显多于卖出，整体偏多`);
    } else if (netSentiment === 'bearish') {
      highlights.push(`国会议员近期卖出明显多于买入，整体偏空`);
    }

    if (buyAggregated.length > 0) {
      highlights.push(`国会议员买入最多: ${buyAggregated.slice(0, 3).map(b => b.ticker).join(', ')}`);
    }

    return {
      totalTrades: trades.length,
      buyTrades: buyTrades.length,
      sellTrades: sellTrades.length,
      netSentiment,
      topBuys: buyAggregated.slice(0, this.config.topN || 10),
      topSells: sellAggregated.slice(0, this.config.topN || 10).map(s => ({
        ticker: s.ticker,
        company: s.company,
        sellCount: s.buyCount, // reuse the same aggregation logic
        politicians: s.politicians,
        totalAmount: s.totalAmount,
      })),
      notableTrades,
      highlights,
    };
  }

  /**
   * 分析对冲基金持仓
   */
  private analyzeHedgeFund(data: CollectedData): HedgeFundAnalysis {
    const holdings = data.items || [];
    const metadata = data.metadata || {};

    // 统计基金数
    const uniqueFunds = new Set(holdings.map(h => h.metadata?.fundName));

    // 聚合持仓
    const holdingsByTicker = new Map<string, {
      ticker: string;
      company: string;
      fundsHolding: number;
      totalValue: number;
      weights: number[];
      actions: ('new' | 'add' | 'reduce' | 'sold' | 'unchanged')[];
    }>();

    for (const holding of holdings) {
      const ticker = holding.metadata?.ticker;
      if (!ticker) continue;

      const existing = holdingsByTicker.get(ticker) || {
        ticker,
        company: holding.metadata?.company || STOCK_INFO[ticker]?.name || ticker,
        fundsHolding: 0,
        totalValue: 0,
        weights: [] as number[],
        actions: [] as ('new' | 'add' | 'reduce' | 'sold' | 'unchanged')[],
      };

      existing.fundsHolding++;
      existing.totalValue += holding.metadata?.value || 0;
      existing.weights.push(holding.metadata?.portfolioWeight || 0);
      existing.actions.push((holding.metadata?.action || 'unchanged') as 'new' | 'add' | 'reduce' | 'sold' | 'unchanged');

      holdingsByTicker.set(ticker, existing);
    }

    // 转换为数组
    const topHoldings = Array.from(holdingsByTicker.values())
      .map(h => ({
        ticker: h.ticker,
        company: h.company,
        fundsHolding: h.fundsHolding,
        totalValue: h.totalValue,
        avgWeight: h.weights.reduce((a, b) => a + b, 0) / h.weights.length,
        recentAction: this.determineRecentAction(h.actions),
      }))
      .sort((a, b) => b.fundsHolding - a.fundsHolding)
      .slice(0, this.config.topN || 10);

    // 显著变动
    const significantChanges = holdings
      .filter(h => {
        const change = Math.abs(h.metadata?.sharesChangePercent || 0);
        const action = h.metadata?.action;
        return change > 20 || action === 'new' || action === 'sold';
      })
      .slice(0, 10)
      .map(h => ({
        ticker: h.metadata?.ticker || '',
        company: h.metadata?.company || '',
        fundName: h.metadata?.fundName || '',
        action: h.metadata?.action || 'unchanged',
        changePercent: h.metadata?.sharesChangePercent || 0,
        value: h.metadata?.value || 0,
      }));

    // 判断整体情绪
    const addCount = holdings.filter(h => h.metadata?.action === 'add' || h.metadata?.action === 'new').length;
    const reduceCount = holdings.filter(h => h.metadata?.action === 'reduce' || h.metadata?.action === 'sold').length;

    let aggregatedSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (addCount > reduceCount * 1.3) {
      aggregatedSentiment = 'bullish';
    } else if (reduceCount > addCount * 1.3) {
      aggregatedSentiment = 'bearish';
    }

    const highlights: string[] = [];
    if (topHoldings.length > 0) {
      highlights.push(`机构共识持仓: ${topHoldings.slice(0, 5).map(h => h.ticker).join(', ')}`);
    }
    if (significantChanges.filter(c => c.action === 'new').length > 0) {
      highlights.push(`新建仓位: ${significantChanges.filter(c => c.action === 'new').map(c => c.ticker).join(', ')}`);
    }

    return {
      totalFundsTracked: uniqueFunds.size,
      aggregatedSentiment,
      topHoldings,
      significantChanges,
      sectorConcentration: [],
      highlights,
    };
  }

  /**
   * 分析预测市场数据
   */
  private analyzePredictionMarket(data: CollectedData): PredictionMarketAnalysis {
    const markets = data.items || [];

    // 提取关键预测
    const keyPredictions = markets
      .slice(0, 10)
      .map(m => {
        const outcomes = m.metadata?.outcomes || [];
        const topOutcome = outcomes.length > 0
          ? outcomes.reduce((max: any, o: any) =>
              (o.probability || 0) > (max.probability || 0) ? o : max, outcomes[0])
          : { name: 'N/A', probability: 0 };

        return {
          question: m.title || '',
          category: m.metadata?.category || 'general',
          topOutcome: topOutcome.name || 'N/A',
          probability: topOutcome.probability || 0,
          volume: m.metadata?.volume || 0,
          marketImplication: this.interpretPrediction(m),
        };
      });

    // 经济指标相关预测
    const economicIndicators = markets
      .filter(m => {
        const q = (m.title || '').toLowerCase();
        return q.includes('fed') || q.includes('rate') || q.includes('inflation') ||
               q.includes('recession') || q.includes('gdp');
      })
      .slice(0, 5)
      .map(m => {
        const outcomes = m.metadata?.outcomes || [];
        const topOutcome = outcomes.length > 0
          ? outcomes.reduce((max: any, o: any) =>
              (o.probability || 0) > (max.probability || 0) ? o : max, outcomes[0])
          : { probability: 0 };

        return {
          question: m.title || '',
          currentProbability: topOutcome.probability || 0,
          implication: this.interpretPrediction(m),
        };
      });

    // 判断市场情绪
    let marketSentiment: 'optimistic' | 'pessimistic' | 'neutral' = 'neutral';
    const recessionPredictions = markets.filter(m =>
      (m.title || '').toLowerCase().includes('recession')
    );
    if (recessionPredictions.length > 0) {
      const avgRecessionProb = recessionPredictions.reduce((sum, m) => {
        const outcomes = m.metadata?.outcomes || [];
        const yesOutcome = outcomes.find((o: any) =>
          o.name?.toLowerCase() === 'yes'
        );
        return sum + (yesOutcome?.probability || 0);
      }, 0) / recessionPredictions.length;

      if (avgRecessionProb > 0.5) {
        marketSentiment = 'pessimistic';
      } else if (avgRecessionProb < 0.3) {
        marketSentiment = 'optimistic';
      }
    }

    const highlights: string[] = [];
    if (keyPredictions.length > 0) {
      const topPred = keyPredictions[0];
      highlights.push(`热门预测: ${topPred.question} - ${(topPred.probability * 100).toFixed(0)}%`);
    }

    return {
      totalMarkets: markets.length,
      keyPredictions,
      economicIndicators,
      marketSentiment,
      highlights,
    };
  }

  /**
   * 分析社交情绪
   */
  private analyzeSocialSentiment(data: CollectedData): SocialSentimentAnalysis {
    const sentiments = data.items || [];

    // 计算整体情绪
    const bullishCount = sentiments.filter(s => s.metadata?.sentiment === 'bullish').length;
    const bearishCount = sentiments.filter(s => s.metadata?.sentiment === 'bearish').length;
    const totalWithSentiment = bullishCount + bearishCount;

    let overallSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let sentimentScore = 0;

    if (totalWithSentiment > 0) {
      sentimentScore = ((bullishCount - bearishCount) / totalWithSentiment) * 100;
      if (sentimentScore > 20) {
        overallSentiment = 'bullish';
      } else if (sentimentScore < -20) {
        overallSentiment = 'bearish';
      }
    }

    // 最看涨
    const mostBullish = sentiments
      .filter(s => s.metadata?.bullishPercent > 60)
      .sort((a, b) => (b.metadata?.bullishPercent || 0) - (a.metadata?.bullishPercent || 0))
      .slice(0, 5)
      .map(s => ({
        ticker: s.metadata?.ticker || '',
        company: s.metadata?.company || STOCK_INFO[s.metadata?.ticker]?.name || '',
        bullishPercent: s.metadata?.bullishPercent || 0,
        messageCount: s.metadata?.messageCount || 0,
      }));

    // 最看跌
    const mostBearish = sentiments
      .filter(s => s.metadata?.bearishPercent > 60)
      .sort((a, b) => (b.metadata?.bearishPercent || 0) - (a.metadata?.bearishPercent || 0))
      .slice(0, 5)
      .map(s => ({
        ticker: s.metadata?.ticker || '',
        company: s.metadata?.company || STOCK_INFO[s.metadata?.ticker]?.name || '',
        bearishPercent: s.metadata?.bearishPercent || 0,
        messageCount: s.metadata?.messageCount || 0,
      }));

    // 热门
    const trending = sentiments
      .sort((a, b) => (b.metadata?.messageCount || 0) - (a.metadata?.messageCount || 0))
      .slice(0, 5)
      .map(s => ({
        ticker: s.metadata?.ticker || '',
        messageVolume: s.metadata?.messageCount || 0,
        sentiment: s.metadata?.sentiment || 'neutral',
        trendingScore: s.metadata?.watchersCount || 0,
      }));

    // 逆向信号
    const contrarianSignals: {
      ticker: string;
      signal: 'extreme_bullish' | 'extreme_bearish';
      interpretation: string;
    }[] = [];

    for (const s of sentiments) {
      const bullishPercent = s.metadata?.bullishPercent || 0;
      const bearishPercent = s.metadata?.bearishPercent || 0;

      if (bullishPercent > 85) {
        contrarianSignals.push({
          ticker: s.metadata?.ticker || '',
          signal: 'extreme_bullish',
          interpretation: '极端看涨情绪，可能已过热，需警惕回调',
        });
      } else if (bearishPercent > 85) {
        contrarianSignals.push({
          ticker: s.metadata?.ticker || '',
          signal: 'extreme_bearish',
          interpretation: '极端看跌情绪，可能存在超卖机会',
        });
      }
    }

    const highlights: string[] = [];
    if (overallSentiment !== 'neutral') {
      highlights.push(`社交媒体整体情绪: ${overallSentiment === 'bullish' ? '偏多' : '偏空'}`);
    }
    if (mostBullish.length > 0) {
      highlights.push(`最受看好: ${mostBullish.slice(0, 3).map(s => s.ticker).join(', ')}`);
    }
    if (contrarianSignals.length > 0) {
      highlights.push(`逆向信号提示: ${contrarianSignals.map(c => c.ticker).join(', ')}`);
    }

    return {
      overallSentiment,
      sentimentScore,
      mostBullish,
      mostBearish,
      trending,
      contrarianSignals,
      highlights,
    };
  }

  /**
   * 合并 Reddit 和 X.com 情绪数据源
   */
  private mergeSentimentSources(
    reddit?: CollectedData,
    twitter?: CollectedData
  ): CollectedData | undefined {
    if (!reddit && !twitter) return undefined;
    if (!reddit) return twitter;
    if (!twitter) return reddit;

    return {
      ...reddit,
      items: [...reddit.items, ...twitter.items],
      metadata: {
        ...reddit.metadata,
        sources: ['reddit', 'twitter'],
        redditItems: reddit.items.length,
        twitterItems: twitter.items.length,
      },
    };
  }

  /**
   * 综合研判
   */
  private synthesizeSignals(
    congress?: CongressTradingAnalysis,
    hedgeFund?: HedgeFundAnalysis,
    prediction?: PredictionMarketAnalysis,
    social?: SocialSentimentAnalysis
  ): SmartMoneyAnalysis['synthesis'] {
    const signals: SmartMoneyAnalysis['synthesis']['aggregatedSignals'] = [];

    // 收集各数据源信号
    if (congress) {
      signals.push({
        source: '国会交易',
        signal: congress.netSentiment,
        weight: 0.3,
        confidence: congress.totalTrades > 10 ? 0.8 : 0.5,
      });
    }

    if (hedgeFund) {
      signals.push({
        source: '对冲基金',
        signal: hedgeFund.aggregatedSentiment,
        weight: 0.35,
        confidence: hedgeFund.totalFundsTracked > 5 ? 0.8 : 0.5,
      });
    }

    if (prediction) {
      const predSignal = prediction.marketSentiment === 'optimistic' ? 'bullish' :
                        prediction.marketSentiment === 'pessimistic' ? 'bearish' : 'neutral';
      signals.push({
        source: '预测市场',
        signal: predSignal,
        weight: 0.2,
        confidence: prediction.totalMarkets > 5 ? 0.7 : 0.4,
      });
    }

    if (social) {
      signals.push({
        source: '社交情绪',
        signal: social.overallSentiment,
        weight: 0.15,
        confidence: 0.5, // 社交情绪噪音较大，权重较低
      });
    }

    // 计算综合信号
    let bullishScore = 0;
    let bearishScore = 0;
    let totalWeight = 0;

    for (const signal of signals) {
      const weight = signal.weight * signal.confidence;
      totalWeight += weight;

      if (signal.signal === 'bullish') {
        bullishScore += weight;
      } else if (signal.signal === 'bearish') {
        bearishScore += weight;
      }
    }

    let overallSignal: 'bullish' | 'bearish' | 'neutral' | 'mixed' = 'neutral';
    let signalStrength: 'strong' | 'moderate' | 'weak' = 'weak';

    if (totalWeight > 0) {
      const netScore = (bullishScore - bearishScore) / totalWeight;

      if (netScore > 0.3) {
        overallSignal = 'bullish';
        signalStrength = netScore > 0.5 ? 'strong' : 'moderate';
      } else if (netScore < -0.3) {
        overallSignal = 'bearish';
        signalStrength = netScore < -0.5 ? 'strong' : 'moderate';
      } else if (Math.abs(bullishScore - bearishScore) < 0.1 * totalWeight) {
        overallSignal = 'neutral';
      } else {
        overallSignal = 'mixed';
      }
    }

    // 找出共识股票
    const focusStocks = this.findFocusStocks(congress, hedgeFund, social);

    // 可操作建议
    const actionableInsights: string[] = [];
    if (overallSignal === 'bullish' && signalStrength !== 'weak') {
      actionableInsights.push('智慧资金整体偏多，可考虑增加股票敞口');
    } else if (overallSignal === 'bearish' && signalStrength !== 'weak') {
      actionableInsights.push('智慧资金整体偏空，建议控制仓位、增加防守');
    }

    if (congress?.topBuys && congress.topBuys.length > 0) {
      actionableInsights.push(`国会议员买入集中于: ${congress.topBuys.slice(0, 3).map(b => b.ticker).join(', ')}`);
    }

    if (social?.contrarianSignals && social.contrarianSignals.length > 0) {
      for (const signal of social.contrarianSignals.slice(0, 2)) {
        actionableInsights.push(`${signal.ticker}: ${signal.interpretation}`);
      }
    }

    // 风险提示
    const riskWarnings: string[] = [];
    if (social?.overallSentiment === 'bullish' && social.sentimentScore > 50) {
      riskWarnings.push('社交媒体情绪过热，需警惕短期回调');
    }

    if (prediction?.marketSentiment === 'pessimistic') {
      riskWarnings.push('预测市场显示经济担忧，注意尾部风险');
    }

    return {
      overallSignal,
      signalStrength,
      aggregatedSignals: signals,
      focusStocks,
      actionableInsights,
      riskWarnings,
    };
  }

  /**
   * 找出重点关注股票
   */
  private findFocusStocks(
    congress?: CongressTradingAnalysis,
    hedgeFund?: HedgeFundAnalysis,
    social?: SocialSentimentAnalysis
  ): SmartMoneyAnalysis['synthesis']['focusStocks'] {
    const stockSignals = new Map<string, {
      ticker: string;
      company: string;
      signals: string[];
    }>();

    // 国会买入
    if (congress?.topBuys) {
      for (const buy of congress.topBuys.slice(0, 5)) {
        const existing = stockSignals.get(buy.ticker) || {
          ticker: buy.ticker,
          company: buy.company,
          signals: [],
        };
        existing.signals.push(`国会买入(${buy.buyCount}笔)`);
        stockSignals.set(buy.ticker, existing);
      }
    }

    // 机构共识
    if (hedgeFund?.topHoldings) {
      for (const holding of hedgeFund.topHoldings.slice(0, 5)) {
        const existing = stockSignals.get(holding.ticker) || {
          ticker: holding.ticker,
          company: holding.company,
          signals: [],
        };
        existing.signals.push(`机构持有(${holding.fundsHolding}家)`);
        stockSignals.set(holding.ticker, existing);
      }
    }

    // 社交热门
    if (social?.mostBullish) {
      for (const bull of social.mostBullish.slice(0, 3)) {
        const existing = stockSignals.get(bull.ticker) || {
          ticker: bull.ticker,
          company: bull.company,
          signals: [],
        };
        existing.signals.push(`社交看涨(${bull.bullishPercent.toFixed(0)}%)`);
        stockSignals.set(bull.ticker, existing);
      }
    }

    // 转换并过滤
    return Array.from(stockSignals.values())
      .filter(s => s.signals.length >= 2) // 至少2个信号源
      .sort((a, b) => b.signals.length - a.signals.length)
      .slice(0, 5)
      .map(s => ({
        ticker: s.ticker,
        company: s.company,
        signals: s.signals,
        recommendation: this.generateRecommendation(s.signals),
      }));
  }

  /**
   * 生成建议
   */
  private generateRecommendation(signals: string[]): string {
    if (signals.length >= 3) {
      return '多重信号共振，值得重点关注';
    } else if (signals.some(s => s.includes('国会'))) {
      return '国会议员交易，信息价值高';
    } else if (signals.some(s => s.includes('机构'))) {
      return '机构共识持仓，基本面支撑';
    }
    return '关注相关动态';
  }

  /**
   * 生成高亮
   */
  private generateHighlights(
    congress?: CongressTradingAnalysis,
    hedgeFund?: HedgeFundAnalysis,
    prediction?: PredictionMarketAnalysis,
    social?: SocialSentimentAnalysis
  ): string[] {
    const highlights: string[] = [];

    if (congress?.highlights) {
      highlights.push(...congress.highlights);
    }
    if (hedgeFund?.highlights) {
      highlights.push(...hedgeFund.highlights);
    }
    if (prediction?.highlights) {
      highlights.push(...prediction.highlights);
    }
    if (social?.highlights) {
      highlights.push(...social.highlights);
    }

    return highlights.slice(0, 10);
  }

  // ===== 辅助函数 =====

  private aggregateTradesByTicker(
    trades: any[]
  ): { ticker: string; company: string; buyCount: number; politicians: string[]; totalAmount: string }[] {
    const aggregated = new Map<string, {
      ticker: string;
      company: string;
      count: number;
      politicians: Set<string>;
      maxAmount: number;
    }>();

    for (const trade of trades) {
      const ticker = trade.metadata?.ticker;
      if (!ticker) continue;

      const existing = aggregated.get(ticker) || {
        ticker,
        company: trade.metadata?.company || STOCK_INFO[ticker]?.name || ticker,
        count: 0,
        politicians: new Set(),
        maxAmount: 0,
      };

      existing.count++;
      existing.politicians.add(trade.metadata?.politician || '');
      existing.maxAmount = Math.max(existing.maxAmount, trade.metadata?.amountMax || 0);

      aggregated.set(ticker, existing);
    }

    return Array.from(aggregated.values())
      .map(a => ({
        ticker: a.ticker,
        company: a.company,
        buyCount: a.count,
        politicians: Array.from(a.politicians).slice(0, 5),
        totalAmount: a.maxAmount > 1000000 ? `$${(a.maxAmount / 1e6).toFixed(1)}M+` :
                     a.maxAmount > 1000 ? `$${(a.maxAmount / 1e3).toFixed(0)}K+` : 'N/A',
      }))
      .sort((a, b) => b.buyCount - a.buyCount);
  }

  private assessTradeSignificance(trade: any): string {
    const amountMin = trade.metadata?.amountMin || 0;
    if (amountMin >= 1000000) return '大额交易，高度关注';
    if (amountMin >= 250000) return '中等规模，值得留意';
    return '常规交易';
  }

  private determineRecentAction(
    actions: string[]
  ): 'accumulating' | 'reducing' | 'stable' {
    const addCount = actions.filter(a => a === 'add' || a === 'new').length;
    const reduceCount = actions.filter(a => a === 'reduce' || a === 'sold').length;

    if (addCount > reduceCount * 1.5) return 'accumulating';
    if (reduceCount > addCount * 1.5) return 'reducing';
    return 'stable';
  }

  private interpretPrediction(market: any): string {
    const question = (market.title || '').toLowerCase();

    if (question.includes('recession')) {
      return '经济衰退预期指标';
    }
    if (question.includes('rate') && question.includes('fed')) {
      return '美联储利率政策预期';
    }
    if (question.includes('inflation')) {
      return '通胀预期指标';
    }
    if (question.includes('election')) {
      return '政治风险指标';
    }
    if (question.includes('bitcoin') || question.includes('crypto')) {
      return '加密市场风险偏好';
    }

    return '市场情绪参考';
  }
}

// 导出默认实例
export const smartMoneyAnalyzer = new SmartMoneyAnalyzer();
