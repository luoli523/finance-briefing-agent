import * as fs from 'fs';
import * as path from 'path';
import { CollectedData, CollectorConfig } from './types';

/**
 * 收集器基类
 * 定义所有收集器的通用接口和功能
 */
export abstract class BaseCollector<T extends CollectorConfig = CollectorConfig> {
  abstract readonly name: string;
  abstract readonly description: string;

  protected config: T;
  protected dataDir: string;

  constructor(config: T) {
    this.config = config;
    this.dataDir = path.resolve(process.cwd(), 'data');
  }

  /**
   * 执行数据收集 - 子类必须实现
   */
  abstract collect(): Promise<CollectedData>;

  /**
   * 检查收集器是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 保存原始数据到 data/raw 目录
   */
  protected async saveRawData(data: any, filename?: string): Promise<string> {
    const rawDir = path.join(this.dataDir, 'raw');
    await this.ensureDir(rawDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = filename || `${this.name}-${timestamp}.json`;
    const filepath = path.join(rawDir, file);

    await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[${this.name}] Raw data saved to: ${filepath}`);

    return filepath;
  }

  /**
   * 保存处理后的数据到 data/processed 目录
   */
  protected async saveProcessedData(data: CollectedData, filename?: string): Promise<string> {
    const processedDir = path.join(this.dataDir, 'processed');
    await this.ensureDir(processedDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = filename || `${this.name}-${timestamp}.json`;
    const filepath = path.join(processedDir, file);

    await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[${this.name}] Processed data saved to: ${filepath}`);

    return filepath;
  }

  /**
   * 确保目录存在
   */
  protected async ensureDir(dir: string): Promise<void> {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  /**
   * 日志输出
   */
  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }

  /**
   * 错误日志
   */
  protected logError(message: string, error?: Error): void {
    console.error(`[${this.name}] ERROR: ${message}`);
    if (error) {
      console.error(error);
    }
  }
}
