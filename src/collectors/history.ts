import * as fs from 'fs';
import * as path from 'path';
import { QuoteData } from './types';

/**
 * 历史数据点
 */
export interface HistoricalDataPoint {
  date: string;           // YYYY-MM-DD
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
}

/**
 * 历史数据记录
 */
export interface HistoricalRecord {
  date: string;           // YYYY-MM-DD
  timestamp: Date;
  quotes: HistoricalDataPoint[];
}

/**
 * 历史数据管理器
 */
export class HistoryManager {
  private historyDir: string;
  private historyFile: string;

  constructor() {
    this.historyDir = path.resolve(process.cwd(), 'data/history');
    this.historyFile = path.join(this.historyDir, 'market-history.json');
  }

  /**
   * 保存当日收盘数据
   */
  async saveQuotes(quotes: QuoteData[]): Promise<void> {
    await this.ensureDir(this.historyDir);

    const date = this.getToday();
    const dataPoints: HistoricalDataPoint[] = quotes.map(q => ({
      date,
      symbol: q.symbol,
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      volume: q.volume,
      marketCap: q.marketCap,
    }));

    const record: HistoricalRecord = {
      date,
      timestamp: new Date(),
      quotes: dataPoints,
    };

    // 读取现有历史数据
    const history = await this.loadHistory();

    // 移除当天已有的数据（如果重复运行）
    const filteredHistory = history.filter(h => h.date !== date);

    // 添加新数据
    filteredHistory.push(record);

    // 保留最近 90 天的数据
    const recentHistory = filteredHistory
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 90);

    // 保存
    await fs.promises.writeFile(
      this.historyFile,
      JSON.stringify(recentHistory, null, 2),
      'utf-8'
    );

    console.log(`[history-manager] Saved ${dataPoints.length} quotes for ${date}`);
  }

  /**
   * 加载历史数据
   */
  async loadHistory(): Promise<HistoricalRecord[]> {
    try {
      const content = await fs.promises.readFile(this.historyFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // 文件不存在，返回空数组
      return [];
    }
  }

  /**
   * 获取指定日期的数据
   */
  async getQuotesByDate(date: string): Promise<HistoricalDataPoint[]> {
    const history = await this.loadHistory();
    const record = history.find(h => h.date === date);
    return record?.quotes || [];
  }

  /**
   * 获取最近 N 天的数据
   */
  async getRecentQuotes(days: number): Promise<HistoricalRecord[]> {
    const history = await this.loadHistory();
    return history
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days);
  }

  /**
   * 获取某个股票的历史数据
   */
  async getSymbolHistory(symbol: string, days: number = 30): Promise<HistoricalDataPoint[]> {
    const history = await this.loadHistory();
    return history
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days)
      .flatMap(h => h.quotes)
      .filter(q => q.symbol === symbol);
  }

  /**
   * 获取上一个交易日的数据
   */
  async getPreviousTradingDay(): Promise<HistoricalRecord | null> {
    const history = await this.loadHistory();
    if (history.length < 2) return null;

    const sorted = history.sort((a, b) => b.date.localeCompare(a.date));
    return sorted[1] || null; // 第二个就是上一个交易日
  }

  /**
   * 对比当前数据与历史数据
   */
  async compareWithHistory(
    currentQuotes: QuoteData[],
    daysAgo: number = 1
  ): Promise<Map<string, {
    current: QuoteData;
    previous?: HistoricalDataPoint;
    periodChange?: number;
    periodChangePercent?: number;
  }>> {
    const history = await this.getRecentQuotes(daysAgo + 1);
    const result = new Map();

    if (history.length <= daysAgo) {
      // 历史数据不足
      currentQuotes.forEach(q => {
        result.set(q.symbol, { current: q });
      });
      return result;
    }

    const previousRecord = history[daysAgo];
    const previousQuotes = new Map(
      previousRecord.quotes.map(q => [q.symbol, q])
    );

    currentQuotes.forEach(current => {
      const previous = previousQuotes.get(current.symbol);
      if (previous) {
        const periodChange = current.price - previous.price;
        const periodChangePercent = (periodChange / previous.price) * 100;

        result.set(current.symbol, {
          current,
          previous,
          periodChange,
          periodChangePercent,
        });
      } else {
        result.set(current.symbol, { current });
      }
    });

    return result;
  }

  /**
   * 确保目录存在
   */
  private async ensureDir(dir: string): Promise<void> {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  /**
   * 获取今天的日期字符串
   */
  private getToday(): string {
    return new Date().toISOString().slice(0, 10);
  }
}

// 导出默认实例
export const historyManager = new HistoryManager();
