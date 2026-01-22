/**
 * 智能综合分析脚本
 * 整合所有数据源，提供多维度深度分析
 */

import * as fs from 'fs';
import * as path from 'path';
import { createIntelligentAnalyzer } from '../analyzers';

interface EnhancedAggregatedData {
  collectedAt: Date;
  market?: any;
  news?: any;
  economic?: any;
  governmentRSS?: any;
  secFilings?: any;
}

async function main() {
  console.log('============================================================');
  console.log('Finance Briefing Agent - Intelligent Analyzer');
  console.log('============================================================\n');

  // 1. 查找最新的聚合数据文件
  const processedDir = path.join(process.cwd(), 'data/processed');
  const files = await fs.promises.readdir(processedDir);
  
  const aggregatedFiles = files
    .filter(f => f.startsWith('aggregated-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (aggregatedFiles.length === 0) {
    console.error('❌ No aggregated data found. Please run "npm run collect" first.');
    process.exit(1);
  }

  const latestFile = aggregatedFiles[0];
  const filepath = path.join(processedDir, latestFile);
  
  console.log(`📂 Loading data from: ${latestFile}`);

  // 2. 加载数据
  const content = await fs.promises.readFile(filepath, 'utf-8');
  const rawData = JSON.parse(content);

  // 3. 加载政府RSS和SEC数据（如果存在）
  const rssFiles = files.filter(f => f.startsWith('rss-') && f.endsWith('.json')).sort().reverse();
  const secFiles = files.filter(f => f.startsWith('finnhub-') && f.endsWith('.json')).sort().reverse();

  let governmentRSS;
  let secFilings;

  if (rssFiles.length > 0) {
    const rssContent = await fs.promises.readFile(path.join(processedDir, rssFiles[0]), 'utf-8');
    governmentRSS = JSON.parse(rssContent);
    console.log(`📰 Loaded government RSS: ${rssFiles[0]}`);
  }

  if (secFiles.length > 0) {
    const secContent = await fs.promises.readFile(path.join(processedDir, secFiles[0]), 'utf-8');
    secFilings = JSON.parse(secContent);
    console.log(`📋 Loaded SEC filings: ${secFiles[0]}`);
  }

  // 4. 构建增强数据
  const enhancedData: EnhancedAggregatedData = {
    ...rawData,
    governmentRSS,
    secFilings,
  };

  console.log('\n🧠 Starting intelligent analysis...\n');

  // 5. 执行智能分析
  const analyzer = createIntelligentAnalyzer({
    topN: 10,
    includeDetails: true,
  });

  const analysis = await analyzer.analyze(enhancedData);

  // 6. 保存分析结果
  const outputPath = await analyzer.save(analysis);

  // 7. 显示分析摘要
  console.log('\n============================================================');
  console.log('📊 Analysis Summary');
  console.log('============================================================\n');

  console.log(`🎯 Market Condition: ${analysis.summary.marketCondition}`);
  console.log(`💭 Overall Sentiment: ${analysis.summary.overallSentiment}\n`);

  console.log('🔑 Key Points:');
  analysis.summary.keyPoints.forEach((point, i) => {
    console.log(`   ${i + 1}. ${point}`);
  });

  console.log('\n⚠️  Risks & Concerns:');
  analysis.summary.risksAndConcerns.forEach((risk, i) => {
    console.log(`   ${i + 1}. ${risk}`);
  });

  console.log(`\n🔮 Outlook: ${analysis.summary.outlook}\n`);

  // 8. 显示多维度分析摘要
  console.log('============================================================');
  console.log('📈 Multi-Dimensional Analysis');
  console.log('============================================================\n');

  console.log('🌍 Macro Economic:');
  console.log(`   ${analysis.dimensions.macroEconomic.overview}`);
  console.log(`   Sentiment: ${analysis.dimensions.macroEconomic.sentiment}\n`);

  console.log('🏦 Monetary Policy (Fed):');
  console.log(`   ${analysis.dimensions.monetaryPolicy.overview}`);
  console.log(`   Stance: ${analysis.dimensions.monetaryPolicy.fedStance}`);
  console.log(`   Sentiment: ${analysis.dimensions.monetaryPolicy.sentiment}\n`);

  console.log('🌐 Geopolitical:');
  console.log(`   ${analysis.dimensions.geopolitical.overview}`);
  console.log(`   Risk Level: ${analysis.dimensions.geopolitical.riskLevel}\n`);

  console.log('⚖️  Regulatory:');
  console.log(`   ${analysis.dimensions.regulatory.overview}\n`);

  // 9. 显示行业深度分析
  console.log('============================================================');
  console.log('🏭 Sector Deep Dive');
  console.log('============================================================\n');

  console.log('🤖 AI:');
  console.log(`   ${analysis.dimensions.sectorDeepDive.ai.overview}`);
  console.log(`   Sentiment: ${analysis.dimensions.sectorDeepDive.ai.sentiment}`);
  console.log(`   Outlook: ${analysis.dimensions.sectorDeepDive.ai.outlook}\n`);

  console.log('💾 Semiconductor:');
  console.log(`   ${analysis.dimensions.sectorDeepDive.semiconductor.overview}`);
  console.log(`   Sentiment: ${analysis.dimensions.sectorDeepDive.semiconductor.sentiment}`);
  console.log(`   Outlook: ${analysis.dimensions.sectorDeepDive.semiconductor.outlook}\n`);

  console.log('🏢 Data Center:');
  console.log(`   ${analysis.dimensions.sectorDeepDive.dataCenter.overview}`);
  console.log(`   Sentiment: ${analysis.dimensions.sectorDeepDive.dataCenter.sentiment}`);
  console.log(`   Outlook: ${analysis.dimensions.sectorDeepDive.dataCenter.outlook}\n`);

  console.log('⚡ Energy:');
  console.log(`   ${analysis.dimensions.sectorDeepDive.energy.overview}`);
  console.log(`   Sentiment: ${analysis.dimensions.sectorDeepDive.energy.sentiment}`);
  console.log(`   Outlook: ${analysis.dimensions.sectorDeepDive.energy.outlook}\n`);

  // 10. 显示投资建议
  console.log('============================================================');
  console.log('💡 Investment Implications');
  console.log('============================================================\n');

  if (analysis.investmentImplications.opportunities.length > 0) {
    console.log('✅ Opportunities:');
    analysis.investmentImplications.opportunities.forEach((opp, i) => {
      console.log(`   ${i + 1}. ${opp}`);
    });
    console.log('');
  }

  if (analysis.investmentImplications.risks.length > 0) {
    console.log('⚠️  Risks:');
    analysis.investmentImplications.risks.forEach((risk, i) => {
      console.log(`   ${i + 1}. ${risk}`);
    });
    console.log('');
  }

  if (analysis.investmentImplications.sectorRotation.length > 0) {
    console.log('🔄 Sector Rotation:');
    analysis.investmentImplications.sectorRotation.forEach((rotation, i) => {
      console.log(`   ${i + 1}. ${rotation}`);
    });
    console.log('');
  }

  // 11. 显示关键催化剂
  console.log('============================================================');
  console.log('🎯 Key Catalysts');
  console.log('============================================================\n');

  if (analysis.catalysts.upcoming.length > 0) {
    console.log('📅 Upcoming:');
    analysis.catalysts.upcoming.forEach((catalyst, i) => {
      console.log(`   ${i + 1}. ${catalyst}`);
    });
    console.log('');
  }

  if (analysis.catalysts.monitoring.length > 0) {
    console.log('👀 Monitoring:');
    analysis.catalysts.monitoring.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item}`);
    });
    console.log('');
  }

  console.log('============================================================');
  console.log(`✅ Intelligent analysis completed!`);
  console.log(`📁 Results saved to: ${outputPath}`);
  console.log('============================================================\n');
}

main().catch(error => {
  console.error('❌ Intelligent analysis failed:', error);
  process.exit(1);
});
