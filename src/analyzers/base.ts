import { CollectedData } from '../collectors/types';
import { AnalyzerConfig, TrendDirection, SignalStrength, Sentiment } from './types';

/**
 * 分析器基类
 */
export abstract class BaseAnalyzer<T = any> {
  abstract readonly name: string;
  protected config: AnalyzerConfig;

  constructor(config: AnalyzerConfig = {}) {
    this.config = {
      topN: 5,
      includeDetails: true,
      ...config,
    };
  }

  /**
   * 执行分析 - 子类必须实现
   */
  abstract analyze(data: CollectedData): Promise<T>;

  /**
   * 判断趋势方向
   */
  protected getTrend(change: number, threshold: number = 0.5): TrendDirection {
    if (change > threshold) return 'up';
    if (change < -threshold) return 'down';
    return 'neutral';
  }

  /**
   * 判断信号强度
   */
  protected getStrength(changePercent: number): SignalStrength {
    const absChange = Math.abs(changePercent);
    if (absChange >= 5) return 'strong';
    if (absChange >= 2) return 'moderate';
    return 'weak';
  }

  /**
   * 判断情感倾向
   */
  protected getSentiment(changePercent: number, threshold: number = 0.5): Sentiment {
    if (changePercent > threshold) return 'bullish';
    if (changePercent < -threshold) return 'bearish';
    return 'neutral';
  }

  /**
   * 计算平均值
   */
  protected average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  /**
   * 格式化百分比
   */
  protected formatPercent(value: number, decimals: number = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  }

  /**
   * 格式化数字
   */
  protected formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  /**
   * 日志输出
   */
  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }
}
