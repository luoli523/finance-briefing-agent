/**
 * Yahoo Finance 数据收集脚本
 * 运行: npm run collect:yahoo
 */

import { YahooFinanceCollector } from '../collectors/index.js';

async function main() {
  console.log('='.repeat(60));
  console.log('Finance Briefing Agent - Yahoo Finance Collector');
  console.log('='.repeat(60));
  console.log();

  const collector = new YahooFinanceCollector({
    enabled: true,
    saveRaw: true,
  });

  try {
    const data = await collector.collect();

    // 打印市场概览
    console.log('\n📊 Market Overview');
    console.log('-'.repeat(40));

    if (data.market) {
      console.log('\n🏛️  Major Indices:');
      for (const index of data.market.indices) {
        const sign = index.change >= 0 ? '+' : '';
        const emoji = index.change >= 0 ? '🟢' : '🔴';
        console.log(
          `  ${emoji} ${index.name.padEnd(20)} ${index.price.toFixed(2).padStart(12)} ${sign}${index.changePercent.toFixed(2)}%`
        );
      }

      console.log('\n📈 Top Gainers:');
      for (const stock of data.market.topGainers || []) {
        const sign = stock.changePercent >= 0 ? '+' : '';
        const emoji = stock.changePercent >= 0 ? '🟢' : '🔴';
        console.log(
          `  ${emoji} ${stock.symbol.padEnd(6)} ${stock.name.slice(0, 20).padEnd(20)} ${sign}${stock.changePercent.toFixed(2)}%`
        );
      }

      console.log('\n📉 Top Losers:');
      for (const stock of data.market.topLosers || []) {
        const sign = stock.changePercent >= 0 ? '+' : '';
        const emoji = stock.changePercent >= 0 ? '🟢' : '🔴';
        console.log(
          `  ${emoji} ${stock.symbol.padEnd(6)} ${stock.name.slice(0, 20).padEnd(20)} ${sign}${stock.changePercent.toFixed(2)}%`
        );
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Collection completed at ${data.collectedAt.toISOString()}`);
    console.log(`📁 Data saved to data/processed/`);

  } catch (error) {
    console.error('❌ Collection failed:', error);
    process.exit(1);
  }
}

main();
