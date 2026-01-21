/**
 * 数据分析脚本
 * 分析最新收集的数据并生成综合分析报告
 *
 * 运行: npm run analyze
 */

import { UnifiedAnalyzer, ComprehensiveAnalysis } from '../analyzers/index.js';

function printSeparator(title: string) {
  console.log('\n' + '═'.repeat(60));
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

function printSection(title: string) {
  console.log('\n' + '─'.repeat(50));
  console.log(`  ${title}`);
  console.log('─'.repeat(50));
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Finance Briefing Agent - Data Analysis              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const analyzer = new UnifiedAnalyzer({ topN: 5 });

  try {
    // 分析最新数据
    const analysis = await analyzer.analyzeLatest();

    // 打印综合摘要
    printSeparator('📋 综合摘要');

    const { summary } = analysis;
    const conditionEmoji = {
      'risk-on': '🟢',
      'risk-off': '🔴',
      'mixed': '🟡',
    }[summary.marketCondition];

    const sentimentEmoji = {
      'bullish': '📈',
      'bearish': '📉',
      'neutral': '➡️',
    }[summary.overallSentiment];

    console.log(`\n  市场状态: ${conditionEmoji} ${summary.marketCondition.toUpperCase()}`);
    console.log(`  整体情感: ${sentimentEmoji} ${summary.overallSentiment.toUpperCase()}`);

    if (summary.keyPoints.length > 0) {
      console.log('\n  📌 关键要点:');
      for (const point of summary.keyPoints) {
        console.log(`     • ${point}`);
      }
    }

    if (summary.risksAndConcerns.length > 0) {
      console.log('\n  ⚠️  风险关注:');
      for (const risk of summary.risksAndConcerns) {
        console.log(`     • ${risk}`);
      }
    }

    console.log(`\n  📊 展望: ${summary.outlook}`);

    // 打印市场分析
    if (analysis.market) {
      printSeparator('📊 市场分析');

      console.log('\n  🏛️  主要指数:');
      for (const index of analysis.market.indices.details) {
        const emoji = index.changePercent >= 0 ? '🟢' : '🔴';
        const sign = index.changePercent >= 0 ? '+' : '';
        console.log(`     ${emoji} ${index.name.padEnd(30)} ${sign}${index.changePercent.toFixed(2)}%`);
      }

      if (analysis.market.sectors.length > 0) {
        console.log('\n  📊 板块表现:');
        for (const sector of analysis.market.sectors.slice(0, 6)) {
          const emoji = sector.performance >= 0 ? '🟢' : '🔴';
          const sign = sector.performance >= 0 ? '+' : '';
          console.log(`     ${emoji} ${sector.name.padEnd(15)} ${sign}${sector.performance.toFixed(2)}%`);
        }
      }

      console.log('\n  📈 涨幅榜:');
      for (const stock of analysis.market.topGainers) {
        const sign = stock.changePercent >= 0 ? '+' : '';
        console.log(`     🟢 ${stock.symbol.padEnd(6)} ${stock.name.slice(0, 20).padEnd(20)} ${sign}${stock.changePercent.toFixed(2)}%`);
      }

      console.log('\n  📉 跌幅榜:');
      for (const stock of analysis.market.topLosers) {
        console.log(`     🔴 ${stock.symbol.padEnd(6)} ${stock.name.slice(0, 20).padEnd(20)} ${stock.changePercent.toFixed(2)}%`);
      }
    }

    // 打印新闻分析
    if (analysis.news) {
      printSeparator('📰 新闻分析');

      console.log(`\n  总计 ${analysis.news.totalArticles} 条新闻`);
      console.log(`  整体情感: ${analysis.news.sentiment}`);

      if (analysis.news.topTopics.length > 0) {
        console.log('\n  🔥 热门话题:');
        for (const topic of analysis.news.topTopics) {
          const sentimentEmoji = {
            'bullish': '📈',
            'bearish': '📉',
            'neutral': '➡️',
          }[topic.sentiment];
          console.log(`     ${sentimentEmoji} ${topic.topic.padEnd(15)} ${topic.count} 条新闻`);
        }
      }

      if (analysis.news.keyHeadlines.length > 0) {
        console.log('\n  📌 重要新闻:');
        for (const headline of analysis.news.keyHeadlines.slice(0, 5)) {
          const importanceEmoji = {
            'high': '🔴',
            'medium': '🟡',
            'low': '⚪',
          }[headline.importance];
          console.log(`     ${importanceEmoji} ${headline.headline.slice(0, 60)}...`);
          console.log(`        └─ ${headline.source}`);
        }
      }
    }

    // 打印经济分析
    if (analysis.economic) {
      printSeparator('🏦 经济分析');

      const outlookEmoji = {
        'expansion': '📈',
        'contraction': '📉',
        'stable': '➡️',
      }[analysis.economic.outlook];

      console.log(`\n  经济展望: ${outlookEmoji} ${analysis.economic.outlook.toUpperCase()}`);

      if (analysis.economic.keyIndicators.length > 0) {
        console.log('\n  📊 关键指标:');
        for (const indicator of analysis.economic.keyIndicators) {
          console.log(`     • ${indicator.interpretation}`);
        }
      }

      // 收益率曲线
      const yieldCurve = analysis.economic.categories.rates.yieldCurve;
      const curveEmoji = yieldCurve === 'inverted' ? '⚠️' : yieldCurve === 'flat' ? '🟡' : '🟢';
      console.log(`\n  ${curveEmoji} 收益率曲线: ${yieldCurve.toUpperCase()}`);

      if (analysis.economic.riskFactors.length > 0) {
        console.log('\n  ⚠️  风险因素:');
        for (const risk of analysis.economic.riskFactors) {
          console.log(`     • ${risk}`);
        }
      }
    }

    // 保存分析结果
    const outputPath = await analyzer.saveAnalysis(analysis);

    printSeparator('✅ 分析完成');
    console.log(`\n  📁 分析结果已保存至: ${outputPath}`);
    console.log();

  } catch (error) {
    console.error('\n❌ 分析失败:', (error as Error).message);
    console.log('\n💡 请先运行 "npm run collect" 收集数据');
    process.exit(1);
  }
}

main();
