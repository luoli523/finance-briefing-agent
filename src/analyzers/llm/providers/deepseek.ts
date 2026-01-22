/**
 * DeepSeek LLM 提供商
 * DeepSeek 使用 OpenAI 兼容的 API
 */

import { OpenAIProvider } from './openai';

export class DeepSeekProvider extends OpenAIProvider {
  constructor(config: any) {
    // DeepSeek 使用自己的 base URL
    super({
      ...config,
      baseURL: config.baseURL || 'https://api.deepseek.com',
    });
  }

  protected estimateCost(promptTokens: number, completionTokens: number): number {
    // DeepSeek 定价 (非常便宜)
    const pricing = {
      input: 0.00014,  // $0.14 per 1M tokens
      output: 0.00028, // $0.28 per 1M tokens
    };

    return (
      (promptTokens / 1000000) * pricing.input +
      (completionTokens / 1000000) * pricing.output
    );
  }
}
