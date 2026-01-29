/**
 * 国会交易数据收集脚本
 * 运行: npm run collect:congress
 */

import { CongressTradingCollector } from '../collectors/congress-trading';

async function main() {
  console.log('='.repeat(60));
  console.log('Finance Briefing Agent - Congress Trading Collector');
  console.log('='.repeat(60));
  console.log();

  const collector = new CongressTradingCollector({
    enabled: true,
    saveRaw: true,
  });

  try {
    const data = await collector.collect();

    // 打印摘要
    console.log('\n📊 Congress Trading Summary');
    console.log('-'.repeat(40));

    const metadata = data.metadata || {};
    console.log(`\n📈 Total Trades: ${metadata.totalTrades || 0}`);
    console.log(`   Buy Trades: ${metadata.buyTrades || 0}`);
    console.log(`   Sell Trades: ${metadata.sellTrades || 0}`);

    if (metadata.topBoughtStocks && metadata.topBoughtStocks.length > 0) {
      console.log('\n🔥 Top Bought Stocks:');
      for (const stock of metadata.topBoughtStocks.slice(0, 5)) {
        console.log(`   • ${stock.ticker}: ${stock.count} trades`);
      }
    }

    if (metadata.topSoldStocks && metadata.topSoldStocks.length > 0) {
      console.log('\n📉 Top Sold Stocks:');
      for (const stock of metadata.topSoldStocks.slice(0, 5)) {
        console.log(`   • ${stock.ticker}: ${stock.count} trades`);
      }
    }

    // 显示最近交易
    if (data.items.length > 0) {
      console.log('\n📋 Recent Trades:');
      for (const item of data.items.slice(0, 10)) {
        const m = item.metadata;
        const partyEmoji = m?.party === 'D' ? '🔵' : m?.party === 'R' ? '🔴' : '⚪';
        const actionEmoji = m?.transactionType === 'buy' ? '🟢' : '🔴';
        console.log(`   ${partyEmoji} ${m?.politician} ${actionEmoji} ${m?.transactionType} ${m?.ticker} (${m?.amount})`);
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
