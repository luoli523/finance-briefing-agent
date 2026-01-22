/**
 * LLM 增强分析器
 * 将规则引擎的分析结果与 LLM 的深度洞察结合
 */

import { IntelligentAnalysis } from '../intelligent';
import { LLMConfig, LLMDeepInsights, EnhancedIntelligentAnalysis } from './types';
import { createLLMProvider } from './providers';
import { getSystemPrompt, generateAnalysisPrompt, generateSimplifiedPrompt } from './prompts';

export class LLMEnhancer {
  private config: LLMConfig;
  private provider: any;

  constructor(config: LLMConfig) {
    this.config = config;
    if (config.enabled) {
      this.provider = createLLMProvider(config);
    }
  }

  /**
   * 增强智能分析结果
   */
  async enhance(analysis: IntelligentAnalysis): Promise<EnhancedIntelligentAnalysis> {
    if (!this.config.enabled) {
      console.log('[llm-enhancer] LLM enhancement is disabled');
      return analysis as EnhancedIntelligentAnalysis;
    }

    console.log(`[llm-enhancer] Starting LLM enhancement with ${this.config.provider}/${this.config.model}...`);
    
    const startTime = Date.now();

    try {
      // 生成提示词
      const userPrompt = generateAnalysisPrompt(analysis);

      // 调用 LLM
      const messages = [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: userPrompt },
      ];

      const response = await this.provider.chat(messages);

      // 解析 LLM 响应
      const llmInsights = this.parseLLMResponse(response.content);

      // 计算成本
      const cost = response.usage
        ? this.provider.estimateCost(response.usage.promptTokens, response.usage.completionTokens)
        : undefined;

      const completionTime = Date.now() - startTime;

      console.log(`[llm-enhancer] LLM enhancement completed in ${completionTime}ms`);
      if (response.usage) {
        console.log(`[llm-enhancer] Tokens used: ${response.usage.totalTokens} (${response.usage.promptTokens} prompt + ${response.usage.completionTokens} completion)`);
      }
      if (cost) {
        console.log(`[llm-enhancer] Estimated cost: $${cost.toFixed(4)}`);
      }

      // 返回增强的分析结果
      return {
        ...analysis,
        llmInsights,
        llmMetadata: {
          provider: this.config.provider,
          model: this.config.model,
          completionTime,
          tokensUsed: response.usage?.totalTokens,
          cost,
        },
      };
    } catch (error: any) {
      console.error(`[llm-enhancer] LLM enhancement failed: ${error.message}`);
      // 失败时返回原始分析结果
      return analysis as EnhancedIntelligentAnalysis;
    }
  }

  /**
   * 解析 LLM 响应
   */
  private parseLLMResponse(content: string): LLMDeepInsights {
    try {
      // 提取 JSON 内容（处理可能被 markdown 包裹的情况）
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;

      const parsed = JSON.parse(jsonContent);
      
      // 验证必要字段
      if (!parsed.macroEconomicInsights || !parsed.strategicRecommendations) {
        throw new Error('Missing required fields in LLM response');
      }

      return parsed as LLMDeepInsights;
    } catch (error: any) {
      console.error(`[llm-enhancer] Failed to parse LLM response: ${error.message}`);
      
      // 返回一个默认的结构，避免完全失败
      return this.getDefaultInsights(content);
    }
  }

  /**
   * 获取默认的洞察结构（解析失败时使用）
   */
  private getDefaultInsights(content: string): LLMDeepInsights {
    return {
      macroEconomicInsights: {
        summary: content.substring(0, 200) || 'LLM 分析解析失败',
        implications: [],
        riskFactors: [],
        opportunities: [],
      },
      monetaryPolicyInsights: {
        summary: 'LLM 分析解析失败',
        futureExpectations: [],
        marketImpact: [],
        investmentStrategy: [],
      },
      geopoliticalInsights: {
        summary: 'LLM 分析解析失败',
        keyEvents: [],
        affectedSectors: [],
        timelineAnalysis: 'N/A',
      },
      sectorTrendsInsights: {
        ai: {
          keyDrivers: [],
          competitiveLandscape: 'LLM 分析解析失败',
          futureOutlook: 'N/A',
          investmentThesis: 'N/A',
        },
        semiconductor: {
          supplyDemandAnalysis: 'LLM 分析解析失败',
          cycleTiming: 'N/A',
          keyRisks: [],
          opportunities: [],
        },
        dataCenter: {
          growthDrivers: [],
          competitiveAdvantages: 'LLM 分析解析失败',
          infrastructureGaps: [],
          investmentPriorities: [],
        },
        energy: {
          transitionAnalysis: 'LLM 分析解析失败',
          nuclearRenaissance: 'N/A',
          policyImpact: [],
          longTermOutlook: 'N/A',
        },
      },
      crossDomainDeepInsights: {
        systemicConnections: [],
        emergingNarratives: [],
        contrarian: [],
        blackSwanRisks: [],
      },
      strategicRecommendations: {
        shortTerm: [],
        mediumTerm: [],
        longTerm: [],
        riskManagement: [],
        portfolioAllocation: 'LLM 分析解析失败',
      },
      catalystTimeline: {
        thisWeek: [],
        thisMonth: [],
        thisQuarter: [],
        beyondQuarter: [],
      },
      scenarioAnalysis: {
        bullCase: {
          probability: 33,
          scenario: 'LLM 分析解析失败',
          triggers: [],
          targets: [],
        },
        baseCase: {
          probability: 34,
          scenario: 'LLM 分析解析失败',
          expectedOutcome: 'N/A',
        },
        bearCase: {
          probability: 33,
          scenario: 'LLM 分析解析失败',
          triggers: [],
          protections: [],
        },
      },
      keyQuestionsAndActions: {
        criticalQuestions: [],
        actionItems: [],
        monitoringMetrics: [],
      },
    };
  }
}

/**
 * 创建 LLM 增强器实例
 */
export function createLLMEnhancer(config: LLMConfig): LLMEnhancer {
  return new LLMEnhancer(config);
}
