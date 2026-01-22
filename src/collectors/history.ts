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
  // 52周高低点
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
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
 * 多周期对比结果
 */
export interface MultiPeriodComparison {
  symbol: string;
  currentPrice: number;
  // 日涨跌
  dayChange?: number;
  dayChangePercent?: number;
  // 周涨跌
  weekChange?: number;
  weekChangePercent?: number;
  weekPrice?: number;
  // 月涨跌
  monthChange?: number;
  monthChangePercent?: number;
  monthPrice?: number;
  // 52周高低点
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
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
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow,
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
   * 获取指定天数前最近的历史记录
   * 如果精确的那一天没有数据，会返回最近的一条
   */
  async getDataAroundDaysAgo(daysAgo: number): Promise<HistoricalRecord | null> {
    const history = await this.loadHistory();
    if (history.length === 0) return null;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const targetDateStr = targetDate.toISOString().slice(0, 10);

    // 按日期排序（降序）
    const sorted = history.sort((a, b) => b.date.localeCompare(a.date));

    // 找到目标日期或之前最近的记录
    for (const record of sorted) {
      if (record.date <= targetDateStr) {
        return record;
      }
    }

    // 如果没有找到，返回最早的记录
    return sorted[sorted.length - 1] || null;
  }

  /**
   * 获取一周前的数据（约 5-7 个交易日）
   */
  async getWeekAgoData(): Promise<HistoricalRecord | null> {
    return this.getDataAroundDaysAgo(7);
  }

  /**
   * 获取一个月前的数据（约 20-22 个交易日）
   */
  async getMonthAgoData(): Promise<HistoricalRecord | null> {
    return this.getDataAroundDaysAgo(30);
  }

  /**
   * 获取多周期对比数据（日、周、月）
   */
  async getMultiPeriodComparison(
    currentQuotes: QuoteData[]
  ): Promise<Map<string, MultiPeriodComparison>> {
    const result = new Map();

    // 获取各周期历史数据
    const [prevDay, weekAgo, monthAgo] = await Promise.all([
      this.getPreviousTradingDay(),
      this.getWeekAgoData(),
      this.getMonthAgoData(),
    ]);

    // 构建历史数据映射
    const prevDayMap = new Map(prevDay?.quotes.map(q => [q.symbol, q]) || []);
    const weekAgoMap = new Map(weekAgo?.quotes.map(q => [q.symbol, q]) || []);
    const monthAgoMap = new Map(monthAgo?.quotes.map(q => [q.symbol, q]) || []);

    for (const current of currentQuotes) {
      const comparison: any = {
        symbol: current.symbol,
        currentPrice: current.price,
        dayChange: current.change,
        dayChangePercent: current.changePercent,
        fiftyTwoWeekHigh: current.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: current.fiftyTwoWeekLow,
      };

      // 周对比
      const weekData = weekAgoMap.get(current.symbol);
      if (weekData) {
        comparison.weekPrice = weekData.price;
        comparison.weekChange = current.price - weekData.price;
        comparison.weekChangePercent = (comparison.weekChange / weekData.price) * 100;
      }

      // 月对比
      const monthData = monthAgoMap.get(current.symbol);
      if (monthData) {
        comparison.monthPrice = monthData.price;
        comparison.monthChange = current.price - monthData.price;
        comparison.monthChangePercent = (comparison.monthChange / monthData.price) * 100;
      }

      result.set(current.symbol, comparison);
    }

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
