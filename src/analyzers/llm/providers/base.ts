/**
 * LLM 提供商基类
 */

import { LLMConfig, LLMResponse } from '../types';

export abstract class BaseLLMProvider {
  protected config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * 发送聊天完成请求
   */
  abstract chat(messages: { role: string; content: string }[]): Promise<LLMResponse>;

  /**
   * 流式聊天完成（可选）
   */
  async *streamChat(messages: { role: string; content: string }[]): AsyncGenerator<string> {
    throw new Error('Stream chat not implemented for this provider');
  }

  /**
   * 估算 token 数量（近似）
   */
  protected estimateTokens(text: string): number {
    // 简单估算：英文约 4 字符/token，中文约 2 字符/token
    // 这是一个粗略的估计
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const totalChars = text.length;
    const englishChars = totalChars - chineseChars;
    
    return Math.ceil(englishChars / 4 + chineseChars / 2);
  }

  /**
   * 估算成本（美元）
   */
  protected estimateCost(promptTokens: number, completionTokens: number): number {
    // 子类可以覆盖此方法以提供特定模型的定价
    return 0;
  }

  /**
   * 验证配置
   */
  protected validateConfig(): void {
    if (!this.config.apiKey && this.requiresApiKey()) {
      throw new Error(`API key is required for ${this.config.provider}`);
    }
  }

  /**
   * 是否需要 API key
   */
  protected requiresApiKey(): boolean {
    return true; // 默认需要，ollama 等本地模型可以覆盖为 false
  }
}
