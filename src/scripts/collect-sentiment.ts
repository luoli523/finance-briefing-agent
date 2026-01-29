/**
 * StockTwits 社交情绪数据收集脚本
 * 运行: npm run collect:sentiment
 */

import { SocialSentimentCollector } from '../collectors/social-sentiment';

async function main() {
  console.log('='.repeat(60));
  console.log('Finance Briefing Agent - StockTwits Sentiment Collector');
  console.log('='.repeat(60));
  console.log();

  // 使用较少的股票进行测试
  const testSymbols = [
    'NVDA', 'AMD', 'TSLA', 'MSFT', 'AAPL',
    'GOOGL', 'META', 'AMZN', 'TSM', 'AVGO',
  ];

  const collector = new SocialSentimentCollector({
    enabled: true,
    saveRaw: true,
    symbols: testSymbols,
    includeMessages: true,
  });

  try {
    const data = await collector.collect();

    // 打印摘要
    console.log('\n📊 Social Sentiment Summary');
    console.log('-'.repeat(40));

    const metadata = data.metadata || {};
    console.log(`\n📱 Total Symbols: ${metadata.totalSymbols || 0}`);
    console.log(`   Overall Bullish: ${(metadata.overallBullishPercent || 0).toFixed(1)}%`);

    if (metadata.mostBullish && metadata.mostBullish.length > 0) {
      console.log(`\n🟢 Most Bullish: ${metadata.mostBullish.join(', ')}`);
    }

    if (metadata.mostBearish && metadata.mostBearish.length > 0) {
      console.log(`🔴 Most Bearish: ${metadata.mostBearish.join(', ')}`);
    }

    // 显示详细情绪
    if (data.items.length > 0) {
      console.log('\n📋 Sentiment by Symbol:');
      for (const item of data.items.slice(0, 15)) {
        const m = item.metadata;
        const sentimentEmoji = m?.sentiment === 'bullish' ? '🟢' :
                              m?.sentiment === 'bearish' ? '🔴' : '⚪';
        const bullishBar = '█'.repeat(Math.round((m?.bullishPercent || 0) / 10));
        const bearishBar = '░'.repeat(10 - Math.round((m?.bullishPercent || 0) / 10));

        console.log(`\n   ${sentimentEmoji} ${m?.ticker} (${m?.company || 'N/A'})`);
        console.log(`      Sentiment: ${m?.sentiment} | ${(m?.bullishPercent || 0).toFixed(0)}% bullish`);
        console.log(`      [${bullishBar}${bearishBar}]`);
        console.log(`      Messages: ${m?.messageCount || 0} | Watchers: ${(m?.watchersCount || 0).toLocaleString()}`);
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
