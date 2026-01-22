/**
 * LLM 增强分析器类型定义
 */

import { IntelligentAnalysis } from '../intelligent';

// LLM 提供商
export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'deepseek';

// LLM 模型
export type LLMModel = 
  | 'gpt-4' 
  | 'gpt-4-turbo' 
  | 'gpt-3.5-turbo'
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'deepseek-chat'
  | 'qwen2.5:7b'
  | 'llama3.1:8b';

// LLM 配置
export interface LLMConfig {
  enabled: boolean;
  provider: LLMProvider;
  model: LLMModel;
  apiKey?: string;
  baseURL?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

// LLM 深度洞察
export interface LLMDeepInsights {
  // 宏观经济深度解读
  macroEconomicInsights: {
    summary: string;
    implications: string[];
    riskFactors: string[];
    opportunities: string[];
  };

  // Fed 政策深度分析
  monetaryPolicyInsights: {
    summary: string;
    futureExpectations: string[];
    marketImpact: string[];
    investmentStrategy: string[];
  };

  // 地缘政治深度解读
  geopoliticalInsights: {
    summary: string;
    keyEvents: string[];
    affectedSectors: string[];
    timelineAnalysis: string;
  };

  // 行业趋势深度分析
  sectorTrendsInsights: {
    ai: {
      keyDrivers: string[];
      competitiveLandscape: string;
      futureOutlook: string;
      investmentThesis: string;
    };
    semiconductor: {
      supplyDemandAnalysis: string;
      cycleTiming: string;
      keyRisks: string[];
      opportunities: string[];
    };
    dataCenter: {
      growthDrivers: string[];
      competitiveAdvantages: string;
      infrastructureGaps: string[];
      investmentPriorities: string[];
    };
    energy: {
      transitionAnalysis: string;
      nuclearRenaissance: string;
      policyImpact: string[];
      longTermOutlook: string;
    };
  };

  // 跨领域深度洞察
  crossDomainDeepInsights: {
    systemicConnections: string[];
    emergingNarratives: string[];
    contrarian: string[];
    blackSwanRisks: string[];
  };

  // 投资策略建议
  strategicRecommendations: {
    shortTerm: string[];  // 1-3 个月
    mediumTerm: string[]; // 3-12 个月
    longTerm: string[];   // 1-3 年
    riskManagement: string[];
    portfolioAllocation: string;
  };

  // 催化剂时间线
  catalystTimeline: {
    thisWeek: string[];
    thisMonth: string[];
    thisQuarter: string[];
    beyondQuarter: string[];
  };

  // 情景分析
  scenarioAnalysis: {
    bullCase: {
      probability: number;
      scenario: string;
      triggers: string[];
      targets: string[];
    };
    baseCase: {
      probability: number;
      scenario: string;
      expectedOutcome: string;
    };
    bearCase: {
      probability: number;
      scenario: string;
      triggers: string[];
      protections: string[];
    };
  };

  // 关键问题和建议
  keyQuestionsAndActions: {
    criticalQuestions: string[];
    actionItems: string[];
    monitoringMetrics: string[];
  };
}

// 增强的智能分析结果
export interface EnhancedIntelligentAnalysis extends IntelligentAnalysis {
  // LLM 深度洞察
  llmInsights?: LLMDeepInsights;

  // LLM 元数据
  llmMetadata?: {
    provider: LLMProvider;
    model: LLMModel;
    completionTime: number;
    tokensUsed?: number;
    cost?: number;
  };
}

// LLM 提示词模板
export interface LLMPromptTemplate {
  system: string;
  user: string;
}

// LLM 响应
export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}
