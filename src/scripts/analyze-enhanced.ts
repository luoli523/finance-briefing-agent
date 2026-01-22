/**
 * 混合增强分析脚本
 * 规则引擎 + LLM 深度分析
 */

import * as fs from 'fs';
import * as path from 'path';
import { createIntelligentAnalyzer } from '../analyzers';
import { createLLMEnhancer } from '../analyzers/llm';
import { appConfig } from '../config';

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
  console.log('Finance Briefing Agent - Enhanced Analyzer (Hybrid Mode)');
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

  console.log('\n🤖 Starting hybrid analysis (Rule Engine + LLM)...\n');

  // 5. 执行规则引擎分析
  console.log('[Step 1/2] Rule Engine Analysis...');
  const analyzer = createIntelligentAnalyzer({
    topN: 10,
    includeDetails: true,
  });

  const baseAnalysis = await analyzer.analyze(enhancedData);
  console.log('✅ Rule engine analysis completed\n');

  // 6. LLM 增强（如果启用）
  console.log('[Step 2/2] LLM Deep Analysis...');
  
  if (!appConfig.llm.enabled) {
    console.log('⚠️  LLM enhancement is DISABLED. Set LLM_ENABLED=true in .env to enable.');
    console.log('📝 Using rule engine analysis only.\n');
    
    // 保存基础分析结果
    const outputPath = path.join(processedDir, `enhanced-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.promises.writeFile(outputPath, JSON.stringify(baseAnalysis, null, 2), 'utf-8');
    
    console.log('============================================================');
    console.log('✅ Analysis completed (Rule Engine Only)!');
    console.log(`📁 Results saved to: ${outputPath}`);
    console.log('============================================================\n');
    
    return;
  }

  // LLM 已启用
  console.log(`🧠 LLM Provider: ${appConfig.llm.provider}`);
  console.log(`🤖 LLM Model: ${appConfig.llm.model}`);
  console.log(`📊 Enhancing analysis with deep insights...\n`);

  const llmEnhancer = createLLMEnhancer(appConfig.llm as any);
  const enhancedAnalysis = await llmEnhancer.enhance(baseAnalysis);

  // 7. 保存增强分析结果
  const outputPath = path.join(processedDir, `enhanced-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await fs.promises.writeFile(outputPath, JSON.stringify(enhancedAnalysis, null, 2), 'utf-8');

  console.log('\n============================================================');
  console.log('✅ Enhanced analysis completed!');
  console.log('============================================================\n');

  // 8. 显示分析摘要
  console.log('📊 Analysis Summary:');
  console.log(`   - Market Condition: ${enhancedAnalysis.summary.marketCondition}`);
  console.log(`   - Overall Sentiment: ${enhancedAnalysis.summary.overallSentiment}`);
  console.log(`   - Outlook: ${enhancedAnalysis.summary.outlook}\n`);

  if (enhancedAnalysis.llmMetadata) {
    console.log('🧠 LLM Enhancement:');
    console.log(`   - Provider: ${enhancedAnalysis.llmMetadata.provider}`);
    console.log(`   - Model: ${enhancedAnalysis.llmMetadata.model}`);
    console.log(`   - Completion Time: ${enhancedAnalysis.llmMetadata.completionTime}ms`);
    if (enhancedAnalysis.llmMetadata.tokensUsed) {
      console.log(`   - Tokens Used: ${enhancedAnalysis.llmMetadata.tokensUsed.toLocaleString()}`);
    }
    if (enhancedAnalysis.llmMetadata.cost) {
      console.log(`   - Estimated Cost: $${enhancedAnalysis.llmMetadata.cost.toFixed(4)}`);
    }
    console.log('');
  }

  console.log(`📁 Results saved to: ${outputPath}`);
  console.log('============================================================\n');
}

main().catch(error => {
  console.error('❌ Enhanced analysis failed:', error);
  process.exit(1);
});
