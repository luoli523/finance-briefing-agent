/**
 * 对冲基金持仓数据收集脚本
 * 运行: npm run collect:hedgefund
 */

import { HedgeFundCollector } from '../collectors/hedge-fund';

async function main() {
  console.log('='.repeat(60));
  console.log('Finance Briefing Agent - Hedge Fund Holdings Collector');
  console.log('='.repeat(60));
  console.log();

  const collector = new HedgeFundCollector({
    enabled: true,
    saveRaw: true,
  });

  try {
    const data = await collector.collect();

    // 打印摘要
    console.log('\n📊 Hedge Fund Holdings Summary');
    console.log('-'.repeat(40));

    const metadata = data.metadata || {};
    console.log(`\n🏦 Total Holdings: ${metadata.totalHoldings || 0}`);
    console.log(`   Unique Funds: ${metadata.uniqueFunds || 0}`);
    console.log(`   Unique Stocks: ${metadata.uniqueStocks || 0}`);

    if (metadata.topHoldings && metadata.topHoldings.length > 0) {
      console.log('\n🔥 Top Holdings (by fund count):');
      for (const holding of metadata.topHoldings.slice(0, 10)) {
        const valueStr = holding.totalValue ? `$${(holding.totalValue / 1e9).toFixed(2)}B` : 'N/A';
        console.log(`   • ${holding.ticker}: ${holding.fundsCount} funds, ${valueStr}`);
      }
    }

    if (metadata.significantChanges && metadata.significantChanges.length > 0) {
      console.log('\n📈 Significant Changes:');
      for (const change of metadata.significantChanges.slice(0, 10)) {
        const actionEmoji = change.action === 'new' ? '🆕' :
                           change.action === 'add' ? '⬆️' :
                           change.action === 'reduce' ? '⬇️' :
                           change.action === 'sold' ? '🚫' : '➡️';
        const sign = change.changePercent >= 0 ? '+' : '';
        console.log(`   ${actionEmoji} ${change.fund}: ${change.ticker} (${sign}${change.changePercent.toFixed(1)}%)`);
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
