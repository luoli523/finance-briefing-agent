/**
 * Polymarket 预测市场数据收集脚本
 * 运行: npm run collect:prediction
 */

import { PredictionMarketCollector } from '../collectors/prediction-market';

async function main() {
  console.log('='.repeat(60));
  console.log('Finance Briefing Agent - Polymarket Prediction Collector');
  console.log('='.repeat(60));
  console.log();

  const collector = new PredictionMarketCollector({
    enabled: true,
    saveRaw: true,
    minVolume: 5000, // 降低阈值以获取更多市场
  });

  try {
    const data = await collector.collect();

    // 打印摘要
    console.log('\n📊 Prediction Market Summary');
    console.log('-'.repeat(40));

    const metadata = data.metadata || {};
    console.log(`\n🎯 Total Markets: ${metadata.totalMarkets || 0}`);
    console.log(`   Categories: ${(metadata.categories || []).join(', ')}`);

    // 显示热门预测
    if (data.items.length > 0) {
      console.log('\n🔮 Top Predictions (by volume):');
      for (const item of data.items.slice(0, 15)) {
        const m = item.metadata;
        const outcomes = m?.outcomes || [];
        const topOutcome = outcomes.length > 0
          ? outcomes.reduce((max: any, o: any) =>
              (o.probability || 0) > (max.probability || 0) ? o : max, outcomes[0])
          : null;

        const volumeStr = m?.volume
          ? `$${(m.volume / 1000).toFixed(0)}K`
          : 'N/A';

        console.log(`\n   📌 ${item.title}`);
        console.log(`      Category: ${m?.category || 'N/A'}`);
        console.log(`      Volume: ${volumeStr}`);

        if (topOutcome) {
          const probStr = (topOutcome.probability * 100).toFixed(1);
          console.log(`      Top Outcome: ${topOutcome.name} (${probStr}%)`);
        }

        if (outcomes.length > 1) {
          console.log(`      All Outcomes:`);
          for (const o of outcomes) {
            const prob = ((o.probability || 0) * 100).toFixed(1);
            console.log(`        - ${o.name}: ${prob}%`);
          }
        }
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
