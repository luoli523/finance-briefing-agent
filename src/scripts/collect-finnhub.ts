/**
 * Finnhub 新闻收集脚本
 * 运行: npm run collect:finnhub
 */

import { createFinnhubCollector, NewsArticle } from '../collectors/index.js';
import { appConfig, validateConfig } from '../config/index.js';

async function main() {
  console.log('='.repeat(60));
  console.log('Finance Briefing Agent - Finnhub News Collector');
  console.log('='.repeat(60));
  console.log();

  // 验证 API Key
  try {
    validateConfig(['FINNHUB_API_KEY']);
  } catch (error) {
    console.error('❌ Configuration Error:', (error as Error).message);
    console.log('\n💡 Get your free API key at: https://finnhub.io');
    process.exit(1);
  }

  const collector = createFinnhubCollector({
    saveRaw: true,
    category: 'general',
  });

  try {
    const data = await collector.collect();

    // 打印新闻摘要
    console.log('\n📰 Latest Financial News');
    console.log('-'.repeat(40));

    const articles = data.items.map(item => item.metadata as NewsArticle);
    const topNews = articles.slice(0, 15);

    for (const article of topNews) {
      const time = article.publishedAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const date = article.publishedAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      console.log(`\n📌 ${article.headline}`);
      console.log(`   🕐 ${date} ${time} | 📡 ${article.source}`);
      if (article.summary) {
        // 截断摘要
        const summary = article.summary.length > 150
          ? article.summary.slice(0, 150) + '...'
          : article.summary;
        console.log(`   ${summary}`);
      }
      if (article.relatedSymbols && article.relatedSymbols.length > 0) {
        console.log(`   🏷️  ${article.relatedSymbols.join(', ')}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Collected ${data.items.length} news articles`);
    console.log(`📁 Data saved to data/processed/`);

  } catch (error) {
    console.error('❌ Collection failed:', error);
    process.exit(1);
  }
}

main();
