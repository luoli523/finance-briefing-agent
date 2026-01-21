import { BaseCollector } from './base';
import {
  CollectedData,
  FredConfig,
  EconomicDataPoint,
  EconomicCategory,
  EconomicOverview,
  DataItem,
} from './types';

// FRED API 基础 URL
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

// 重要经济指标系列配置
const ECONOMIC_SERIES: Record<string, {
  name: string;
  unit: string;
  category: EconomicCategory;
  description: string;
}> = {
  // 经济增长
  'GDP': {
    name: 'Real GDP',
    unit: 'Billions $',
    category: 'growth',
    description: 'Real Gross Domestic Product',
  },
  'GDPC1': {
    name: 'Real GDP (Chained)',
    unit: 'Billions $',
    category: 'growth',
    description: 'Real GDP, chained 2017 dollars',
  },

  // 通胀
  'CPIAUCSL': {
    name: 'CPI (All Items)',
    unit: 'Index',
    category: 'inflation',
    description: 'Consumer Price Index for All Urban Consumers',
  },
  'CPILFESL': {
    name: 'Core CPI',
    unit: 'Index',
    category: 'inflation',
    description: 'CPI excluding Food and Energy',
  },
  'PCEPI': {
    name: 'PCE Price Index',
    unit: 'Index',
    category: 'inflation',
    description: 'Personal Consumption Expenditures Price Index',
  },

  // 就业
  'UNRATE': {
    name: 'Unemployment Rate',
    unit: '%',
    category: 'employment',
    description: 'Civilian Unemployment Rate',
  },
  'PAYEMS': {
    name: 'Nonfarm Payrolls',
    unit: 'Thousands',
    category: 'employment',
    description: 'All Employees, Total Nonfarm',
  },
  'ICSA': {
    name: 'Initial Jobless Claims',
    unit: 'Thousands',
    category: 'employment',
    description: 'Initial Claims for Unemployment Insurance',
  },

  // 利率
  'FEDFUNDS': {
    name: 'Fed Funds Rate',
    unit: '%',
    category: 'rates',
    description: 'Effective Federal Funds Rate',
  },
  'DGS10': {
    name: '10-Year Treasury',
    unit: '%',
    category: 'rates',
    description: '10-Year Treasury Constant Maturity Rate',
  },
  'DGS2': {
    name: '2-Year Treasury',
    unit: '%',
    category: 'rates',
    description: '2-Year Treasury Constant Maturity Rate',
  },
  'T10Y2Y': {
    name: '10Y-2Y Spread',
    unit: '%',
    category: 'rates',
    description: '10-Year minus 2-Year Treasury Spread',
  },

  // 消费者信心
  'UMCSENT': {
    name: 'Consumer Sentiment',
    unit: 'Index',
    category: 'sentiment',
    description: 'University of Michigan Consumer Sentiment',
  },
};

// 默认获取的系列
const DEFAULT_SERIES = [
  'UNRATE',      // 失业率
  'CPIAUCSL',    // CPI
  'FEDFUNDS',    // 联邦基金利率
  'DGS10',       // 10年期国债
  'DGS2',        // 2年期国债
  'T10Y2Y',      // 收益率曲线
  'UMCSENT',     // 消费者信心
  'ICSA',        // 初请失业金
];

// 默认配置
const DEFAULT_CONFIG: Omit<FredConfig, 'apiKey'> = {
  enabled: true,
  saveRaw: true,
  timeout: 30000,
  retries: 3,
  seriesIds: DEFAULT_SERIES,
};

// FRED API 响应格式
interface FredObservation {
  realtime_start: string;
  realtime_end: string;
  date: string;
  value: string;
}

interface FredSeriesResponse {
  realtime_start: string;
  realtime_end: string;
  observation_start: string;
  observation_end: string;
  units: string;
  output_type: number;
  file_type: string;
  order_by: string;
  sort_order: string;
  count: number;
  offset: number;
  limit: number;
  observations: FredObservation[];
}

interface FredSeriesInfo {
  id: string;
  title: string;
  frequency: string;
  units: string;
}

/**
 * FRED 宏观经济数据收集器
 * 获取美联储经济数据库中的关键经济指标
 */
export class FredCollector extends BaseCollector<FredConfig> {
  readonly name = 'fred';
  readonly description = 'FRED macroeconomic data collector';

  constructor(config: Partial<FredConfig> & { apiKey: string }) {
    super({ ...DEFAULT_CONFIG, ...config } as FredConfig);

    if (!this.config.apiKey) {
      throw new Error('FRED API key is required');
    }
  }

  /**
   * 收集经济数据
   */
  async collect(): Promise<CollectedData> {
    this.log('Starting economic data collection...');

    const seriesIds = this.config.seriesIds || DEFAULT_SERIES;

    try {
      const dataPoints: EconomicDataPoint[] = [];
      const rawData: Record<string, any> = {};

      for (const seriesId of seriesIds) {
        try {
          const data = await this.fetchSeries(seriesId);
          if (data) {
            dataPoints.push(data);
            rawData[seriesId] = data;
            this.log(`✓ ${seriesId} fetched: ${data.value} ${data.unit}`);
          }
        } catch (error) {
          this.logError(`Failed to fetch ${seriesId}`, error as Error);
        }

        // 添加延迟避免速率限制
        await this.delay(200);
      }

      // 按类别组织数据
      const overview = this.organizeByCategory(dataPoints);

      // 转换为通用数据项格式
      const items: DataItem[] = dataPoints.map(dp => ({
        id: dp.seriesId,
        title: dp.name,
        content: this.formatDataPoint(dp),
        timestamp: dp.date,
        metadata: { ...dp },
      }));

      const result: CollectedData = {
        source: this.name,
        type: 'economic',
        collectedAt: new Date(),
        items,
        raw: this.config.saveRaw ? { overview, rawData } : undefined,
      };

      // 保存数据
      if (this.config.saveRaw) {
        await this.saveRawData(rawData);
      }
      await this.saveProcessedData(result);

      this.log(`Collected ${dataPoints.length} economic indicators successfully`);
      return result;

    } catch (error) {
      this.logError('Failed to collect economic data', error as Error);
      throw error;
    }
  }

  /**
   * 获取单个系列的最新数据
   */
  private async fetchSeries(seriesId: string): Promise<EconomicDataPoint | null> {
    const url = new URL(`${FRED_BASE_URL}/series/observations`);
    url.searchParams.set('series_id', seriesId);
    url.searchParams.set('api_key', this.config.apiKey);
    url.searchParams.set('file_type', 'json');
    url.searchParams.set('sort_order', 'desc');
    url.searchParams.set('limit', '2'); // 获取最近两个数据点用于计算变化

    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(`Invalid series ID: ${seriesId}`);
      }
      if (response.status === 429) {
        throw new Error('FRED API rate limit exceeded');
      }
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json() as FredSeriesResponse;

    if (!data.observations || data.observations.length === 0) {
      return null;
    }

    const latest = data.observations[0];
    const previous = data.observations[1];

    // 处理特殊值 "."（表示数据不可用）
    if (latest.value === '.') {
      return null;
    }

    const seriesInfo = ECONOMIC_SERIES[seriesId];
    const currentValue = parseFloat(latest.value);
    const previousValue = previous && previous.value !== '.' ? parseFloat(previous.value) : undefined;

    return {
      seriesId,
      name: seriesInfo?.name || seriesId,
      value: currentValue,
      previousValue,
      change: previousValue !== undefined ? currentValue - previousValue : undefined,
      changePercent: previousValue !== undefined && previousValue !== 0
        ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
        : undefined,
      unit: seriesInfo?.unit || data.units || '',
      frequency: await this.getSeriesFrequency(seriesId),
      date: new Date(latest.date),
      category: seriesInfo?.category || 'growth',
    };
  }

  /**
   * 获取系列的更新频率
   */
  private async getSeriesFrequency(seriesId: string): Promise<string> {
    // 使用硬编码的频率信息避免额外 API 调用
    const frequencies: Record<string, string> = {
      'GDP': 'Quarterly',
      'GDPC1': 'Quarterly',
      'CPIAUCSL': 'Monthly',
      'CPILFESL': 'Monthly',
      'PCEPI': 'Monthly',
      'UNRATE': 'Monthly',
      'PAYEMS': 'Monthly',
      'ICSA': 'Weekly',
      'FEDFUNDS': 'Monthly',
      'DGS10': 'Daily',
      'DGS2': 'Daily',
      'T10Y2Y': 'Daily',
      'UMCSENT': 'Monthly',
    };
    return frequencies[seriesId] || 'Unknown';
  }

  /**
   * 按类别组织数据
   */
  private organizeByCategory(dataPoints: EconomicDataPoint[]): EconomicOverview {
    return {
      growth: dataPoints.filter(d => d.category === 'growth'),
      inflation: dataPoints.filter(d => d.category === 'inflation'),
      employment: dataPoints.filter(d => d.category === 'employment'),
      rates: dataPoints.filter(d => d.category === 'rates'),
      sentiment: dataPoints.filter(d => d.category === 'sentiment'),
    };
  }

  /**
   * 格式化数据点描述
   */
  private formatDataPoint(dp: EconomicDataPoint): string {
    let result = `${dp.name}: ${dp.value.toFixed(2)} ${dp.unit}`;
    if (dp.change !== undefined) {
      const sign = dp.change >= 0 ? '+' : '';
      result += ` (${sign}${dp.change.toFixed(2)})`;
    }
    return result;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取经济概览（简化方法）
   */
  async getEconomicOverview(): Promise<EconomicOverview> {
    const data = await this.collect();
    const dataPoints = data.items.map(item => item.metadata as EconomicDataPoint);
    return this.organizeByCategory(dataPoints);
  }
}

/**
 * 从环境变量创建 FRED 收集器
 */
export function createFredCollector(config?: Partial<FredConfig>): FredCollector {
  const apiKey = config?.apiKey || process.env.FRED_API_KEY;

  if (!apiKey) {
    throw new Error('FRED_API_KEY environment variable is not set');
  }

  return new FredCollector({ ...config, apiKey });
}

// 导出系列配置供参考
export { ECONOMIC_SERIES, DEFAULT_SERIES };
