#!/usr/bin/env tsx

/**
 * RSS 收集脚本
 * 从配置的 RSS feeds 收集数据，包括：
 * - Twitter/X 账号 (通过 Nitter)
 * - 新闻网站 RSS
 * - 博客 RSS
 */

import { createRSSCollector } from '../collectors';
import { appConfig } from '../config';

async function main() {
  console.log('============================================================');
  console.log('Finance Briefing Agent - RSS Collector');
  console.log('============================================================\n');

  const collector = createRSSCollector({
    feeds: appConfig.rss.feeds,
    enabled: appConfig.rss.enabled,
    maxItemsPerFeed: 50, // 每个 feed 最多获取 50 条
  });

  console.log(`📡 Configured RSS Feeds: ${appConfig.rss.feeds.length}`);
  console.log(`   Twitter/X accounts (via Nitter)`);
  console.log(`   News websites`);
  console.log(`   Government/Company announcements`);
  console.log();

  try {
    const data = await collector.collect();
    
    console.log();
    console.log('✅ RSS collection completed!');
    console.log(`   Total items: ${data.items.length}`);
    console.log(`   Successful feeds: ${data.metadata?.successfulFeeds || 0}/${data.metadata?.totalFeeds || 0}`);
    
    if (data.metadata?.failedFeeds && data.metadata.failedFeeds > 0) {
      console.log(`   ⚠️  Failed feeds: ${data.metadata.failedFeeds}`);
    }
    
    // 显示一些示例
    if (data.items.length > 0) {
      console.log();
      console.log('📰 Recent Items (first 5):');
      console.log('─'.repeat(70));
      
      data.items.slice(0, 5).forEach((item, i) => {
        const source = item.metadata?.feedTitle || 'Unknown';
        const twitterHandle = item.metadata?.twitterHandle;
        const displaySource = twitterHandle ? `${twitterHandle} (${source})` : source;
        
        console.log(`${i + 1}. [${displaySource}]`);
        console.log(`   ${item.title}`);
        console.log(`   ${item.timestamp.toISOString()}`);
        console.log();
      });
    }
    
    console.log('============================================================');
    
  } catch (error) {
    console.error('❌ RSS collection failed:', error);
    process.exit(1);
  }
}

main();
