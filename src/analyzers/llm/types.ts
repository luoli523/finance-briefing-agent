/**
 * LLM 增强分析器类型定义
 */

import { IntelligentAnalysis } from '../intelligent';

// LLM 提供商
export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'deepseek' | 'google';

// LLM 模型
export type LLMModel = 
  // OpenAI (2024-2026)
  | 'gpt-4o'                    // 最新旗舰模型 (2024)
  | 'gpt-4o-mini'               // 轻量级高性价比模型
  | 'gpt-4-turbo'               // GPT-4 Turbo
  | 'gpt-4'                     // GPT-4
  | 'gpt-3.5-turbo'             // GPT-3.5 Turbo
  | 'o1-preview'                // OpenAI o1 预览版 (推理模型)
  | 'o1-mini'                   // OpenAI o1 mini
  // Anthropic Claude
  | 'claude-3-5-sonnet-20241022' // Claude 3.5 Sonnet (最新)
  | 'claude-3-opus-20240229'     // Claude 3 Opus
  | 'claude-3-sonnet-20240229'   // Claude 3 Sonnet
  | 'claude-3-haiku-20240307'    // Claude 3 Haiku
  // DeepSeek
  | 'deepseek-chat'              // DeepSeek Chat
  | 'deepseek-reasoner'          // DeepSeek 推理模型 (R1)
  // Google Gemini
  | 'gemini-2.0-flash-exp'       // Gemini 2.0 Flash (最新实验版)
  | 'gemini-1.5-pro'             // Gemini 1.5 Pro
  | 'gemini-1.5-flash'           // Gemini 1.5 Flash
  | 'gemini-1.0-pro'             // Gemini 1.0 Pro
  // Ollama (本地模型)
  | 'qwen2.5:7b'                 // 通义千问 2.5
  | 'llama3.1:8b'                // Llama 3.1
  | 'deepseek-r1:7b'             // DeepSeek R1 本地版
  | 'gemma2:9b';                 // Google Gemma 2

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
