/**
 * Collectors 模块统一导出
 */

// 类型导出
export * from './types';

// 基类导出
export { BaseCollector } from './base';

// 收集器导出
export { YahooFinanceCollector, yahooFinanceCollector } from './yahoo-finance';
export { FinnhubCollector, createFinnhubCollector } from './finnhub';
export { FredCollector, createFredCollector, ECONOMIC_SERIES, DEFAULT_SERIES } from './fred';
