import * as fs from 'fs';
import * as path from 'path';
import { ComprehensiveAnalysis } from '../analyzers/types';
import { GeneratedBriefing, GeneratorConfig, OutputFormat } from './types';

/**
 * 生成器基类
 */
export abstract class BaseGenerator {
  abstract readonly name: string;
  abstract readonly format: OutputFormat;

  protected config: GeneratorConfig;
  protected outputDir: string;

  constructor(config: GeneratorConfig = {}) {
    this.config = {
      template: 'daily',
      language: 'zh',
      includeDisclaimer: true,
      maxSections: 10,
      ...config,
    };
    this.outputDir = path.resolve(process.cwd(), 'output');
  }

  /**
   * 生成简报 - 子类必须实现
   */
  abstract generate(analysis: ComprehensiveAnalysis): Promise<GeneratedBriefing>;

  /**
   * 保存简报到文件
   */
  async save(briefing: GeneratedBriefing, filename?: string): Promise<string> {
    await this.ensureDir(this.outputDir);

    const date = new Date().toISOString().slice(0, 10);
    const ext = this.getFileExtension();
    const file = filename || `briefing-${date}.${ext}`;
    const filepath = path.join(this.outputDir, file);

    await fs.promises.writeFile(filepath, briefing.content, 'utf-8');
    this.log(`Briefing saved to: ${filepath}`);

    return filepath;
  }

  /**
   * 获取文件扩展名
   */
  protected getFileExtension(): string {
    switch (this.format) {
      case 'markdown': return 'md';
      case 'html': return 'html';
      default: return 'txt';
    }
  }

  /**
   * 确保目录存在
   */
  protected async ensureDir(dir: string): Promise<void> {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  /**
   * 格式化日期
   */
  protected formatDate(date: Date, format: 'full' | 'short' = 'full'): string {
    if (this.config.language === 'zh') {
      if (format === 'full') {
        return date.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        });
      }
      return date.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      });
    }

    if (format === 'full') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * 格式化百分比
   */
  protected formatPercent(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  /**
   * 获取趋势箭头
   */
  protected getTrendArrow(value: number): string {
    if (value > 0.5) return '↑';
    if (value < -0.5) return '↓';
    return '→';
  }

  /**
   * 获取情感 emoji
   */
  protected getSentimentEmoji(sentiment: string): string {
    switch (sentiment) {
      case 'bullish': return '📈';
      case 'bearish': return '📉';
      default: return '➡️';
    }
  }

  /**
   * 获取状态 emoji
   */
  protected getConditionEmoji(condition: string): string {
    switch (condition) {
      case 'risk-on': return '🟢';
      case 'risk-off': return '🔴';
      default: return '🟡';
    }
  }

  /**
   * 计算字数
   */
  protected countWords(text: string): number {
    // 中文按字符计数，英文按空格分词
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = text.replace(/[\u4e00-\u9fa5]/g, '').split(/\s+/).filter(w => w.length > 0).length;
    return chineseChars + englishWords;
  }

  /**
   * 日志输出
   */
  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }
}
