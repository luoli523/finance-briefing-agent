/**
 * FRED 经济数据收集脚本
 * 运行: npm run collect:fred
 */

import { createFredCollector, EconomicDataPoint } from '../collectors/index.js';
import { validateConfig } from '../config/index.js';

async function main() {
  console.log('='.repeat(60));
  console.log('Finance Briefing Agent - FRED Economic Data Collector');
  console.log('='.repeat(60));
  console.log();

  // 验证 API Key
  try {
    validateConfig(['FRED_API_KEY']);
  } catch (error) {
    console.error('❌ Configuration Error:', (error as Error).message);
    console.log('\n💡 Get your free API key at: https://fred.stlouisfed.org/docs/api/api_key.html');
    process.exit(1);
  }

  const collector = createFredCollector({
    saveRaw: true,
  });

  try {
    const data = await collector.collect();

    // 打印经济数据概览
    console.log('\n📊 US Economic Indicators');
    console.log('-'.repeat(50));

    const dataPoints = data.items.map(item => item.metadata as EconomicDataPoint);

    // 按类别分组显示
    const categories = {
      employment: { title: '👷 Employment', items: [] as EconomicDataPoint[] },
      inflation: { title: '📈 Inflation', items: [] as EconomicDataPoint[] },
      rates: { title: '🏦 Interest Rates', items: [] as EconomicDataPoint[] },
      sentiment: { title: '🎯 Sentiment', items: [] as EconomicDataPoint[] },
      growth: { title: '💹 Growth', items: [] as EconomicDataPoint[] },
    };

    for (const dp of dataPoints) {
      const cat = categories[dp.category as keyof typeof categories];
      if (cat) {
        cat.items.push(dp);
      }
    }

    for (const [key, category] of Object.entries(categories)) {
      if (category.items.length === 0) continue;

      console.log(`\n${category.title}`);
      for (const dp of category.items) {
        const changeStr = dp.change !== undefined
          ? ` (${dp.change >= 0 ? '+' : ''}${dp.change.toFixed(2)})`
          : '';
        const emoji = dp.change === undefined ? '⚪' : dp.change >= 0 ? '🔺' : '🔻';

        console.log(
          `  ${emoji} ${dp.name.padEnd(22)} ${dp.value.toFixed(2).padStart(10)} ${dp.unit.padEnd(10)}${changeStr}`
        );
        console.log(`     📅 ${dp.date.toLocaleDateString('en-US')} | ⏱️  ${dp.frequency}`);
      }
    }

    // 关键指标摘要
    console.log('\n' + '='.repeat(60));
    console.log('📋 Key Indicators Summary');
    console.log('-'.repeat(50));

    const unemployment = dataPoints.find(d => d.seriesId === 'UNRATE');
    const fedFunds = dataPoints.find(d => d.seriesId === 'FEDFUNDS');
    const treasury10y = dataPoints.find(d => d.seriesId === 'DGS10');
    const treasury2y = dataPoints.find(d => d.seriesId === 'DGS2');
    const spread = dataPoints.find(d => d.seriesId === 'T10Y2Y');

    if (unemployment) {
      console.log(`  Unemployment Rate:  ${unemployment.value.toFixed(1)}%`);
    }
    if (fedFunds) {
      console.log(`  Fed Funds Rate:     ${fedFunds.value.toFixed(2)}%`);
    }
    if (treasury10y && treasury2y) {
      console.log(`  10Y Treasury:       ${treasury10y.value.toFixed(2)}%`);
      console.log(`  2Y Treasury:        ${treasury2y.value.toFixed(2)}%`);
    }
    if (spread) {
      const yieldCurve = spread.value >= 0 ? 'Normal' : 'Inverted ⚠️';
      console.log(`  Yield Curve:        ${spread.value.toFixed(2)}% (${yieldCurve})`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Collected ${data.items.length} economic indicators`);
    console.log(`📁 Data saved to data/processed/`);

  } catch (error) {
    console.error('❌ Collection failed:', error);
    process.exit(1);
  }
}

main();
