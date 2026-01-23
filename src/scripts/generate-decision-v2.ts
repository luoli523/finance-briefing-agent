/**
 * 生成增强版决策简报 V2
 * 专注于深度洞察、量化建议和行动指引
 */

import * as fs from 'fs';
import * as path from 'path';
import { DecisionEnhancedV2Generator } from '../generators/decision-enhanced-v2';
import { LLMEnhancer } from '../analyzers/llm/enhancer';
import { IntelligentAnalyzer } from '../analyzers/intelligent';
import { appConfig } from '../config';
import type { ComprehensiveAnalysis } from '../analyzers/types';

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                      ║');
  console.log('║         🚀 增强版决策简报生成器 V2                                  ║');
  console.log('║         专注：深度洞察 + 量化建议 + 行动指引                       ║');
  console.log('║                                                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  // 1. 查找最新的分析文件
  const processedDir = path.resolve(process.cwd(), 'data/processed');
  
  if (!fs.existsSync(processedDir)) {
    console.error('❌ 错误: data/processed 目录不存在');
    console.error('请先运行数据收集和分析: npm run workflow:decision');
    process.exit(1);
  }

  const files = fs.readdirSync(processedDir)
    .filter(f => f.startsWith('analysis-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ 错误: 未找到分析数据文件');
    console.error('请先运行分析: npm run analyze');
    process.exit(1);
  }

  const latestFile = files[0];
  const analysisPath = path.join(processedDir, latestFile);

  console.log(`📂 读取分析数据: ${latestFile}`);

  const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf-8')) as ComprehensiveAnalysis;

  // 2. 运行智能分析（如果需要）
  let intelligentAnalysis: any = null;
  
  // 查找最新的智能分析文件
  const intelligentFiles = fs.readdirSync(processedDir)
    .filter(f => f.startsWith('intelligent-analysis-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (intelligentFiles.length > 0) {
    const intelligentPath = path.join(processedDir, intelligentFiles[0]);
    intelligentAnalysis = JSON.parse(fs.readFileSync(intelligentPath, 'utf-8'));
    console.log(`📊 使用智能分析数据: ${intelligentFiles[0]}`);
  } else {
    console.log('⚠️ 未找到智能分析数据，正在生成...');
    const analyzer = new IntelligentAnalyzer();
    intelligentAnalysis = await analyzer.analyze(analysisData);
  }

  // 3. 运行 LLM 深度分析
  let llmInsights: any = null;
  
  if (appConfig.llm.enabled) {
    console.log(`\n🤖 运行 LLM 深度分析...`);
    console.log(`   提供商: ${appConfig.llm.provider}`);
    console.log(`   模型: ${appConfig.llm.model}`);
    
    try {
      const enhancer = new LLMEnhancer(appConfig.llm as any);
      const enhanced = await enhancer.enhance(intelligentAnalysis);
      llmInsights = enhanced.llmInsights;
      
      console.log(`✅ LLM 分析完成`);
      console.log(`   Token使用: ${llmInsights?.metadata?.tokensUsed || 'N/A'}`);
      console.log(`   成本: $${llmInsights?.metadata?.cost?.toFixed(4) || 'N/A'}\n`);
      
      // 保存 LLM 洞察
      const llmInsightsPath = path.join(processedDir, `llm-insights-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(llmInsightsPath, JSON.stringify(llmInsights, null, 2), 'utf-8');
      console.log(`💾 LLM洞察已保存: ${path.basename(llmInsightsPath)}\n`);
      
    } catch (error: any) {
      console.error(`❌ LLM 分析失败: ${error.message}`);
      console.log('⚠️ 将使用基础分析数据生成报告\n');
    }
  } else {
    console.log('⚠️ LLM 未启用，请在 .env 中设置 LLM_ENABLED=true\n');
  }

  // 4. 生成报告
  console.log('📝 生成增强版决策报告...');
  
  const generator = new DecisionEnhancedV2Generator();
  const reportContent = await generator.generate(analysisData, llmInsights);

  // 5. 保存报告
  const outputDir = path.resolve(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const mdOutputPath = path.join(outputDir, `decision-v2-${today}.md`);
  
  fs.writeFileSync(mdOutputPath, reportContent, 'utf-8');
  
  const mdSize = (reportContent.length / 1024).toFixed(2);
  
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                      ║');
  console.log('║         ✅ 增强版决策简报生成成功！                                  ║');
  console.log('║                                                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  console.log('📁 生成的文件:');
  console.log(`   📄 Markdown: ${mdOutputPath}`);
  console.log(`      大小: ${mdSize} KB\n`);

  if (llmInsights) {
    console.log('✨ 包含的新功能:');
    console.log('   ✅ 投资主题识别 - 当前最强的投资机会');
    console.log('   ✅ 3层原因分析 - 深度理解"为什么"');
    console.log('   ✅ 量化投资建议 - 买入价、目标价、止损位');
    console.log('   ✅ 每周行动清单 - 明确的To-Do List');
    console.log('   ✅ 风险管理策略 - 对冲和止损建议');
    console.log('   ✅ 情景分析 - 乐观/基准/悲观情景\n');
  }

  console.log('🌐 查看报告:');
  console.log(`   open ${mdOutputPath}\n`);

  // 打开报告
  const { exec } = await import('child_process');
  exec(`open ${mdOutputPath}`);
}

main().catch(console.error);
