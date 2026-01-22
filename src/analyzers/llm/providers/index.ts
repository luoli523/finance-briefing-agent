/**
 * LLM 提供商工厂
 */

import { LLMConfig, LLMProvider } from '../types';
import { BaseLLMProvider } from './base';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { OllamaProvider } from './ollama';
import { DeepSeekProvider } from './deepseek';

export { BaseLLMProvider } from './base';
export { OpenAIProvider } from './openai';
export { AnthropicProvider} from './anthropic';
export { OllamaProvider } from './ollama';
export { DeepSeekProvider } from './deepseek';

/**
 * 创建 LLM 提供商实例
 */
export function createLLMProvider(config: LLMConfig): BaseLLMProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    
    case 'anthropic':
      return new AnthropicProvider(config);
    
    case 'ollama':
      return new OllamaProvider(config);
    
    case 'deepseek':
      return new DeepSeekProvider(config);
    
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}
