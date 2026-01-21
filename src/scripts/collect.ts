/**
 * 统一数据收集脚本
 * 运行所有可用的收集器，收集完整的财经数据
 *
 * 运行: npm run collect
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  YahooFinanceCollector,
  FinnhubCollector,
  FredCollector,
  CollectedData,
} from '../collectors/index.js';
import { appConfig } from '../config/index.js';

// 收集结果汇总
interface CollectionSummary {
  timestamp: Date;
  collectors: {
    name: string;
    status: 'success' | 'failed' | 'skipped';
    itemCount?: number;
    error?: string;
    duration?: number;
  }[];
  totalItems: number;
  outputFile: string;
}

// 合并后的数据
interface AggregatedData {
  collectedAt: Date;
  market?: CollectedData;
  news?: CollectedData;
  economic?: CollectedData;
  summary: CollectionSummary;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       Finance Briefing Agent - Data Collection             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  const startTime = Date.now();
  const summary: CollectionSummary = {
    timestamp: new Date(),
    collectors: [],
    totalItems: 0,
    outputFile: '',
  };

  const aggregatedData: AggregatedData = {
    collectedAt: new Date(),
    summary,
  };

  // 1. Yahoo Finance - 市场数据（无需 API Key）
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│ 📊 [1/3] Yahoo Finance - Market Data                         │');
  console.log('└──────────────────────────────────────────────────────────────┘');

  try {
    const yahooStart = Date.now();
    const yahooCollector = new YahooFinanceCollector({ saveRaw: true });
    const marketData = await yahooCollector.collect();

    aggregatedData.market = marketData;
    summary.collectors.push({
      name: 'yahoo-finance',
      status: 'success',
      itemCount: marketData.items.length,
      duration: Date.now() - yahooStart,
    });
    summary.totalItems += marketData.items.length;

    console.log(`✅ Collected ${marketData.items.length} market quotes\n`);
  } catch (error) {
    summary.collectors.push({
      name: 'yahoo-finance',
      status: 'failed',
      error: (error as Error).message,
    });
    console.error(`❌ Failed: ${(error as Error).message}\n`);
  }

  // 2. Finnhub - 财经新闻（需要 API Key）
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│ 📰 [2/3] Finnhub - Financial News                            │');
  console.log('└──────────────────────────────────────────────────────────────┘');

  if (appConfig.finnhub.apiKey) {
    try {
      const finnhubStart = Date.now();
      const finnhubCollector = new FinnhubCollector({
        apiKey: appConfig.finnhub.apiKey,
        saveRaw: true,
      });
      const newsData = await finnhubCollector.collect();

      aggregatedData.news = newsData;
      summary.collectors.push({
        name: 'finnhub',
        status: 'success',
        itemCount: newsData.items.length,
        duration: Date.now() - finnhubStart,
      });
      summary.totalItems += newsData.items.length;

      console.log(`✅ Collected ${newsData.items.length} news articles\n`);
    } catch (error) {
      summary.collectors.push({
        name: 'finnhub',
        status: 'failed',
        error: (error as Error).message,
      });
      console.error(`❌ Failed: ${(error as Error).message}\n`);
    }
  } else {
    summary.collectors.push({
      name: 'finnhub',
      status: 'skipped',
      error: 'FINNHUB_API_KEY not configured',
    });
    console.log('⏭️  Skipped: FINNHUB_API_KEY not configured\n');
  }

  // 3. FRED - 宏观经济数据（需要 API Key）
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│ 🏦 [3/3] FRED - Economic Indicators                          │');
  console.log('└──────────────────────────────────────────────────────────────┘');

  if (appConfig.fred.apiKey) {
    try {
      const fredStart = Date.now();
      const fredCollector = new FredCollector({
        apiKey: appConfig.fred.apiKey,
        saveRaw: true,
      });
      const economicData = await fredCollector.collect();

      aggregatedData.economic = economicData;
      summary.collectors.push({
        name: 'fred',
        status: 'success',
        itemCount: economicData.items.length,
        duration: Date.now() - fredStart,
      });
      summary.totalItems += economicData.items.length;

      console.log(`✅ Collected ${economicData.items.length} economic indicators\n`);
    } catch (error) {
      summary.collectors.push({
        name: 'fred',
        status: 'failed',
        error: (error as Error).message,
      });
      console.error(`❌ Failed: ${(error as Error).message}\n`);
    }
  } else {
    summary.collectors.push({
      name: 'fred',
      status: 'skipped',
      error: 'FRED_API_KEY not configured',
    });
    console.log('⏭️  Skipped: FRED_API_KEY not configured\n');
  }

  // 保存汇总数据
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputDir = path.resolve(process.cwd(), 'data/processed');
  const outputFile = path.join(outputDir, `aggregated-${timestamp}.json`);

  await fs.promises.mkdir(outputDir, { recursive: true });
  summary.outputFile = outputFile;
  aggregatedData.summary = summary;

  await fs.promises.writeFile(
    outputFile,
    JSON.stringify(aggregatedData, null, 2),
    'utf-8'
  );

  // 打印汇总
  const totalDuration = Date.now() - startTime;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Collection Summary                       ║');
  console.log('╠════════════════════════════════════════════════════════════╣');

  for (const collector of summary.collectors) {
    const statusIcon = collector.status === 'success' ? '✅' :
                       collector.status === 'skipped' ? '⏭️ ' : '❌';
    const itemStr = collector.itemCount !== undefined ?
                    `${collector.itemCount} items` :
                    collector.error || '';
    const durationStr = collector.duration ?
                        `(${(collector.duration / 1000).toFixed(1)}s)` : '';

    console.log(`║  ${statusIcon} ${collector.name.padEnd(15)} ${itemStr.padEnd(20)} ${durationStr.padStart(8)} ║`);
  }

  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  📦 Total items collected: ${String(summary.totalItems).padEnd(30)} ║`);
  console.log(`║  ⏱️  Total time: ${(totalDuration / 1000).toFixed(1)}s${' '.repeat(40)} ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  📁 Output: data/processed/aggregated-${timestamp}.json     ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  // 快速预览
  if (aggregatedData.market?.market) {
    console.log('\n📊 Market Snapshot:');
    for (const index of aggregatedData.market.market.indices.slice(0, 3)) {
      const sign = index.changePercent >= 0 ? '+' : '';
      const emoji = index.changePercent >= 0 ? '🟢' : '🔴';
      console.log(`   ${emoji} ${index.name}: ${index.price.toFixed(2)} (${sign}${index.changePercent.toFixed(2)}%)`);
    }
  }

  if (aggregatedData.news?.items) {
    console.log('\n📰 Top Headlines:');
    for (const news of aggregatedData.news.items.slice(0, 3)) {
      console.log(`   • ${news.title.slice(0, 60)}...`);
    }
  }

  if (aggregatedData.economic?.items) {
    console.log('\n🏦 Key Economic Data:');
    for (const item of aggregatedData.economic.items.slice(0, 3)) {
      console.log(`   • ${item.title}: ${item.metadata.value?.toFixed(2)} ${item.metadata.unit}`);
    }
  }

  console.log('\n✨ Data collection complete! Ready for briefing generation.\n');
}

main().catch(console.error);
