/**
 * 智慧资金 LLM 深度分析器
 * 
 * 对国会交易、对冲基金持仓、预测市场、社交情绪数据进行 LLM 深度分析
 * 生成投资洞察和具体的投资标的建议
 */

import * as fs from 'fs';
import * as path from 'path';
import { CollectedData } from '../../collectors/types';
import { LLMConfig } from './types';
import { createLLMProvider } from './providers';

// 智慧资金数据输入
export interface SmartMoneyData {
  congressTrading?: CollectedData;
  hedgeFund?: CollectedData;
  predictionMarket?: CollectedData;
  socialSentiment?: CollectedData;      // Reddit (ApeWisdom)
  twitterSentiment?: CollectedData;     // X.com (StockGeist)
}

// LLM 智慧资金分析结果
export interface SmartMoneyLLMAnalysis {
  smartMoneyAnalysis: {
    congressTrading?: {
      summary: string;
      notableTrades: Array<{
        politician: string;
        party: 'D' | 'R' | 'I';
        ticker: string;
        action: string;
        amount: string;
        significance: string;
      }>;
      focusStocks: string[];
      interpretation: string;
    };
    hedgeFundHoldings?: {
      summary: string;
      topHoldings: string[];
      significantChanges: Array<{
        fund: string;
        ticker: string;
        action: string;
        implication: string;
      }>;
      interpretation: string;
    };
    predictionMarket?: {
      summary: string;
      keyPredictions: Array<{
        question: string;
        probability: string;
        marketImplication: string;
      }>;
      interpretation: string;
    };
    socialSentiment?: {
      summary: string;
      mostBullish: string[];
      mostBearish: string[];
      contrarianSignals: Array<{
        ticker: string;
        signal: string;
        interpretation: string;
      }>;
      interpretation: string;
    };
    synthesis?: {
      overallSignal: 'bullish' | 'bearish' | 'neutral' | 'mixed';
      signalStrength: 'strong' | 'moderate' | 'weak';
      focusStocks: Array<{
        ticker: string;
        signals: string[];
        recommendation: string;
      }>;
      actionableInsights: string[];
      riskWarnings: string[];
    };
  };
  investmentTheses?: Array<{
    ticker: string;
    company: string;
    thesis: string;
    signals: string[];
    entryStrategy: string;
    riskFactors: string[];
    timeHorizon: 'short' | 'medium' | 'long';
  }>;
  watchlist?: {
    topPicks: Array<{
      ticker: string;
      reason: string;
      signalSource: string;
    }>;
    cautionList: Array<{
      ticker: string;
      reason: string;
    }>;
  };
  marketOutlook?: {
    shortTerm: string;
    mediumTerm: string;
    keyRisks: string[];
    keyCatalysts: string[];
  };
}

/**
 * 智慧资金 LLM 分析器
 */
export class SmartMoneyLLMAnalyzer {
  private config: LLMConfig;
  private provider: any;

  constructor(config: LLMConfig) {
    this.config = config;
    if (config.enabled) {
      this.provider = createLLMProvider(config);
    }
  }

  /**
   * 执行智慧资金深度分析
   */
  async analyze(data: SmartMoneyData): Promise<SmartMoneyLLMAnalysis | null> {
    if (!this.config.enabled) {
      console.log('[smart-money-llm] LLM analysis is disabled');
      return null;
    }

    // 检查是否有数据
    const hasData = data.congressTrading?.items?.length ||
                    data.hedgeFund?.items?.length ||
                    data.predictionMarket?.items?.length ||
                    data.socialSentiment?.items?.length ||
                    data.twitterSentiment?.items?.length;

    if (!hasData) {
      console.log('[smart-money-llm] No smart money data available for analysis');
      return null;
    }

    console.log(`[smart-money-llm] Starting LLM analysis with ${this.config.provider}/${this.config.model}...`);

    const startTime = Date.now();

    try {
      // 准备数据摘要
      const dataSummary = this.prepareDataSummary(data);

      // 加载 prompt
      const prompt = this.loadPrompt(dataSummary);

      // 调用 LLM
      const messages = [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: prompt },
      ];

      const response = await this.provider.chat(messages);

      // 解析响应
      const analysis = this.parseResponse(response.content);

      const completionTime = Date.now() - startTime;
      console.log(`[smart-money-llm] Analysis completed in ${completionTime}ms`);

      if (response.usage) {
        console.log(`[smart-money-llm] Tokens used: ${response.usage.totalTokens}`);
      }

      return analysis;

    } catch (error: any) {
      console.error(`[smart-money-llm] Analysis failed: ${error.message}`);
      return null;
    }
  }

  /**
   * 获取系统提示词
   */
  private getSystemPrompt(): string {
    return `你是一位专注于追踪"聪明钱"动向的资深投资分析师，拥有 15+ 年跟踪机构投资者、国会议员交易和市场情绪的经验。

你的专长：
1. 解读对冲基金 13F 持仓报告，识别机构共识和分歧
2. 分析国会议员交易背后的政策信号和信息优势
3. 解读预测市场赔率对资本市场的影响
4. 利用散户情绪数据寻找逆向投资机会

分析原则：
- 基于数据说话，不做无根据的推测
- 多数据源交叉验证，提高信号可靠性
- 区分噪音和真正的信号
- 提供具体、可操作的投资建议
- 重视风险管理

当前日期: ${new Date().toISOString().split('T')[0]}`;
  }

  /**
   * 准备数据摘要
   */
  private prepareDataSummary(data: SmartMoneyData): string {
    const sections: string[] = [];

    // 国会交易数据
    if (data.congressTrading?.items?.length) {
      sections.push('## 国会交易数据\n');
      sections.push(`共 ${data.congressTrading.items.length} 笔交易\n`);
      
      const metadata = data.congressTrading.metadata || {};
      if (metadata.buyTrades !== undefined) {
        sections.push(`- 买入: ${metadata.buyTrades} 笔\n`);
        sections.push(`- 卖出: ${metadata.sellTrades} 笔\n`);
      }

      sections.push('\n近期重要交易:\n');
      for (const item of data.congressTrading.items.slice(0, 15)) {
        const m = item.metadata || {};
        sections.push(`- ${m.politician || '未知'} (${m.party || '?'}): ${m.transactionType === 'buy' ? '买入' : '卖出'} ${m.ticker || '?'}, 金额: ${m.amount || '未知'}\n`);
      }
    }

    // 对冲基金持仓
    if (data.hedgeFund?.items?.length) {
      sections.push('\n## 对冲基金 13F 持仓数据\n');
      sections.push(`共 ${data.hedgeFund.items.length} 条持仓记录\n`);
      
      const metadata = data.hedgeFund.metadata || {};
      if (metadata.topHoldings) {
        sections.push('\n机构共识持仓 (多家基金持有):\n');
        for (const h of (metadata.topHoldings as any[]).slice(0, 10)) {
          sections.push(`- ${h.ticker}: ${h.fundsCount} 家基金持有, 总市值 $${(h.totalValue / 1e9).toFixed(2)}B\n`);
        }
      }

      sections.push('\n主要持仓详情:\n');
      for (const item of data.hedgeFund.items.slice(0, 20)) {
        const m = item.metadata || {};
        sections.push(`- ${m.fundName || '未知'}: ${m.ticker || '?'} (${m.company || ''}), 市值 $${((m.value || 0) / 1e6).toFixed(1)}M\n`);
      }
    }

    // 预测市场
    if (data.predictionMarket?.items?.length) {
      sections.push('\n## 预测市场 (Polymarket)\n');
      sections.push(`共 ${data.predictionMarket.items.length} 个活跃市场\n`);

      sections.push('\n关键预测:\n');
      for (const item of data.predictionMarket.items.slice(0, 10)) {
        const m = item.metadata || {};
        const outcomes = m.outcomes || [];
        sections.push(`- ${item.title}\n`);
        for (const o of outcomes.slice(0, 2)) {
          sections.push(`  - ${o.name}: ${(o.probability * 100).toFixed(1)}%\n`);
        }
        sections.push(`  交易量: $${(m.volume || 0).toLocaleString()}\n`);
      }
    }

    // Reddit 情绪
    if (data.socialSentiment?.items?.length) {
      sections.push('\n## Reddit 社交情绪 (ApeWisdom)\n');
      sections.push(`共追踪 ${data.socialSentiment.items.length} 只股票\n`);

      const metadata = data.socialSentiment.metadata || {};
      sections.push('\n热门讨论股票:\n');
      for (const item of data.socialSentiment.items.slice(0, 15)) {
        const m = item.metadata || {};
        const emoji = m.sentiment === 'bullish' ? '🟢' : m.sentiment === 'bearish' ? '🔴' : '⚪';
        sections.push(`- ${emoji} ${m.ticker}: 排名 #${m.rank || '?'}, 提及 ${m.mentions || 0} 次, 情绪: ${m.sentiment || '中性'}\n`);
      }
    }

    // X.com 情绪
    if (data.twitterSentiment?.items?.length) {
      sections.push('\n## X.com 情绪 (StockGeist)\n');
      sections.push(`共追踪 ${data.twitterSentiment.items.length} 只股票\n`);

      sections.push('\n热门讨论股票:\n');
      for (const item of data.twitterSentiment.items.slice(0, 15)) {
        const m = item.metadata || {};
        const score = m.sentimentScore || 0;
        const emoji = m.sentiment === 'bullish' ? '🟢' : m.sentiment === 'bearish' ? '🔴' : '⚪';
        sections.push(`- ${emoji} ${m.ticker}: 情绪分数 ${score > 0 ? '+' : ''}${score.toFixed(0)}, 提及 ${m.messageVolume || 0} 次${m.trending ? ' 🔥' : ''}\n`);
      }
    }

    return sections.join('');
  }

  /**
   * 加载 prompt
   */
  private loadPrompt(dataSummary: string): string {
    try {
      const promptPath = path.join(process.cwd(), 'prompts', 'smart-money-analysis.txt');
      let template = fs.readFileSync(promptPath, 'utf-8');
      return template.replace('{DATA}', dataSummary);
    } catch (error) {
      // 如果文件不存在，使用内联模板
      return `请基于以下智慧资金数据进行深度分析，提供投资洞察和具体建议：

${dataSummary}

请以 JSON 格式输出分析结果，包含：
1. 各数据源的深度解读
2. 综合投资信号
3. 具体的投资标的建议
4. 风险警示`;
    }
  }

  /**
   * 解析 LLM 响应
   */
  private parseResponse(content: string): SmartMoneyLLMAnalysis | null {
    try {
      // 提取 JSON
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;

      // 尝试找到 JSON 对象的开始和结束
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No JSON object found in response');
      }

      const cleanJson = jsonContent.substring(jsonStart, jsonEnd + 1);
      return JSON.parse(cleanJson) as SmartMoneyLLMAnalysis;
    } catch (error: any) {
      console.error(`[smart-money-llm] Failed to parse response: ${error.message}`);
      return null;
    }
  }
}

/**
 * 创建智慧资金 LLM 分析器
 */
export function createSmartMoneyLLMAnalyzer(config: LLMConfig): SmartMoneyLLMAnalyzer {
  return new SmartMoneyLLMAnalyzer(config);
}
