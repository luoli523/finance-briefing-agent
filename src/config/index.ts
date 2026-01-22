import { config } from 'dotenv';
import * as path from 'path';

// 加载 .env 文件
config({ path: path.resolve(process.cwd(), '.env') });

/**
 * 应用配置
 */
export const appConfig = {
  // Finnhub 配置
  finnhub: {
    apiKey: process.env.FINNHUB_API_KEY || '',
  },

  // FRED 配置
  fred: {
    apiKey: process.env.FRED_API_KEY || '',
  },

  // Alpha Vantage 配置（备用数据源）
  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || '',
  },

  // 数据目录
  paths: {
    data: path.resolve(process.cwd(), 'data'),
    raw: path.resolve(process.cwd(), 'data/raw'),
    processed: path.resolve(process.cwd(), 'data/processed'),
    output: path.resolve(process.cwd(), 'output'),
  },
};

/**
 * 验证必需的配置
 */
export function validateConfig(requiredKeys: string[]): void {
  const missing: string[] = [];

  for (const key of requiredKeys) {
    if (key === 'FINNHUB_API_KEY' && !appConfig.finnhub.apiKey) {
      missing.push(key);
    }
    if (key === 'FRED_API_KEY' && !appConfig.fred.apiKey) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please copy .env.example to .env and fill in the values.`
    );
  }
}
