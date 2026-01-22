/**
 * 生成 LLM 增强的决策导向财经简报
 * 结合结构化数据和 LLM 深度洞察
 */

import * as fs from 'fs';
import * as path from 'path';
import { DecisionOrientedGenerator } from '../generators/decision-oriented';
import { DecisionOrientedHtmlGenerator } from '../generators/decision-oriented-html';
import { LLMEnhancer } from '../analyzers/llm/enhancer';
import { appConfig } from '../config';
import type { ComprehensiveAnalysis } from '../analyzers/types';
import type { EnhancedIntelligentAnalysis } from '../analyzers/llm/types';

async function main() {
  console.log('[generate-decision-enhanced] 开始生成 LLM 增强决策简报...\n');

  // 1. 查找最新的分析文件
  const processedDir = path.resolve(process.cwd(), 'data/processed');
  
  if (!fs.existsSync(processedDir)) {
    console.error('[generate-decision-enhanced] 错误: data/processed 目录不存在');
    console.error('请先运行数据收集和分析: npm run collect && npm run analyze');
    process.exit(1);
  }

  const files = fs.readdirSync(processedDir)
    .filter(f => f.startsWith('analysis-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('[generate-decision-enhanced] 错误: 未找到分析数据文件');
    console.error('请先运行分析: npm run analyze');
    process.exit(1);
  }

  const latestFile = files[0];
  const analysisPath = path.join(processedDir, latestFile);

  console.log(`[generate-decision-enhanced] 读取分析数据: ${latestFile}`);

  const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf-8')) as ComprehensiveAnalysis;

  // 2. 运行 LLM 增强分析（如果启用）
  let enhancedAnalysis: any = analysisData;
  
  if (appConfig.llm.enabled) {
    console.log(`[generate-decision-enhanced] 运行 LLM 深度分析 (${appConfig.llm.provider}/${appConfig.llm.model})...`);
    
    try {
      // 使用智能分析器的结果
      const intelligentFiles = fs.readdirSync(processedDir)
        .filter(f => f.startsWith('intelligent-analysis-') && f.endsWith('.json'))
        .sort()
        .reverse();
      
      if (intelligentFiles.length > 0) {
        const intelligentPath = path.join(processedDir, intelligentFiles[0]);
        const intelligentData = JSON.parse(fs.readFileSync(intelligentPath, 'utf-8'));
        
        // 如果有 LLM 洞察，使用它
        if (intelligentData.llmInsights) {
          console.log('[generate-decision-enhanced] ✅ 找到 LLM 洞察数据');
          enhancedAnalysis = intelligentData;
        } else {
          // 否则运行 LLM 增强
          const enhancer = new LLMEnhancer(appConfig.llm as any);
          enhancedAnalysis = await enhancer.enhance(intelligentData);
          
          // 保存增强结果
          const enhancedPath = path.join(processedDir, `enhanced-${latestFile}`);
          fs.writeFileSync(enhancedPath, JSON.stringify(enhancedAnalysis, null, 2), 'utf-8');
          console.log(`[generate-decision-enhanced] ✅ LLM 分析完成，已保存到: ${enhancedPath}`);
        }
      } else {
        console.warn('[generate-decision-enhanced] ⚠️ 未找到智能分析数据，建议先运行: npm run analyze:intelligent');
      }
    } catch (error: any) {
      console.error(`[generate-decision-enhanced] ⚠️ LLM 分析失败: ${error.message}`);
      console.log('[generate-decision-enhanced] 将使用基础分析数据生成报告');
    }
  } else {
    console.log('[generate-decision-enhanced] LLM 未启用，使用基础分析数据');
  }

  // 3. 生成增强报告
  console.log('[generate-decision-enhanced] 生成增强 Markdown 报告...');

  const generator = new DecisionOrientedGenerator();
  let reportContent = await generator.generate(analysisData);

  // 4. 添加 LLM 洞察部分
  if (enhancedAnalysis.llmInsights) {
    console.log('[generate-decision-enhanced] 添加 LLM 深度洞察...');
    reportContent = addLLMInsights(reportContent, enhancedAnalysis);
  }

  // 5. 保存报告
  const outputDir = path.resolve(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const mdPath = path.join(outputDir, `decision-enhanced-${today}.md`);
  fs.writeFileSync(mdPath, reportContent, 'utf-8');

  // 6. 生成 HTML 报告
  console.log('[generate-decision-enhanced] 生成增强 HTML 报告...');
  const htmlPath = path.join(outputDir, `decision-enhanced-${today}.html`);
  const htmlGenerator = new DecisionOrientedHtmlGenerator();
  await htmlGenerator.generateFromMarkdown(mdPath, htmlPath);

  // 7. 输出结果
  const mdStats = fs.statSync(mdPath);
  const htmlStats = fs.statSync(htmlPath);

  console.log(`\n[generate-decision-enhanced] ✅ 增强报告已生成:`);
  console.log(`  📄 Markdown: ${mdPath}`);
  console.log(`     └─ 大小: ${(mdStats.size / 1024).toFixed(2)} KB`);
  console.log(`  🌐 HTML: ${htmlPath}`);
  console.log(`     └─ 大小: ${(htmlStats.size / 1024).toFixed(2)} KB`);
  
  if (enhancedAnalysis.llmMetadata) {
    console.log(`\n  🤖 LLM 信息:`);
    console.log(`     └─ 提供商: ${enhancedAnalysis.llmMetadata.provider}`);
    console.log(`     └─ 模型: ${enhancedAnalysis.llmMetadata.model}`);
    console.log(`     └─ 耗时: ${enhancedAnalysis.llmMetadata.completionTime}ms`);
    if (enhancedAnalysis.llmMetadata.cost) {
      console.log(`     └─ 成本: $${enhancedAnalysis.llmMetadata.cost.toFixed(5)}`);
    }
  }
  
  console.log(`\n[generate-decision-enhanced] 完成！\n`);
}

/**
 * 添加 LLM 洞察到报告
 */
function addLLMInsights(report: string, enhancedAnalysis: EnhancedIntelligentAnalysis): string {
  const insights = enhancedAnalysis.llmInsights;
  if (!insights) return report;

  let llmSection = `\n\n---\n\n## 🤖 AI 深度洞察与投资建议\n\n`;
  llmSection += `*由 ${enhancedAnalysis.llmMetadata?.provider}/${enhancedAnalysis.llmMetadata?.model} 生成*\n\n`;

  // 1. 宏观经济洞察
  if (insights.macroEconomicInsights) {
    llmSection += `### 📊 宏观经济深度分析\n\n`;
    llmSection += `${insights.macroEconomicInsights.summary}\n\n`;
    
    if (insights.macroEconomicInsights.implications?.length > 0) {
      llmSection += `**关键影响**:\n`;
      insights.macroEconomicInsights.implications.forEach(impl => {
        llmSection += `- ${impl}\n`;
      });
      llmSection += `\n`;
    }
    
    if (insights.macroEconomicInsights.opportunities?.length > 0) {
      llmSection += `**投资机会**:\n`;
      insights.macroEconomicInsights.opportunities.forEach(opp => {
        llmSection += `- ✅ ${opp}\n`;
      });
      llmSection += `\n`;
    }
    
    if (insights.macroEconomicInsights.riskFactors?.length > 0) {
      llmSection += `**风险因素**:\n`;
      insights.macroEconomicInsights.riskFactors.forEach(risk => {
        llmSection += `- ⚠️ ${risk}\n`;
      });
      llmSection += `\n`;
    }
  }

  // 2. 货币政策洞察
  if (insights.monetaryPolicyInsights) {
    llmSection += `### 💰 货币政策与 Fed 动态\n\n`;
    llmSection += `${insights.monetaryPolicyInsights.summary}\n\n`;
    
    if (insights.monetaryPolicyInsights.futureExpectations?.length > 0) {
      llmSection += `**未来预期**:\n`;
      insights.monetaryPolicyInsights.futureExpectations.forEach(exp => {
        llmSection += `- ${exp}\n`;
      });
      llmSection += `\n`;
    }
    
    if (insights.monetaryPolicyInsights.investmentStrategy?.length > 0) {
      llmSection += `**投资策略**:\n`;
      insights.monetaryPolicyInsights.investmentStrategy.forEach(strategy => {
        llmSection += `- 💡 ${strategy}\n`;
      });
      llmSection += `\n`;
    }
  }

  // 3. 行业趋势洞察
  if (insights.sectorTrendsInsights) {
    llmSection += `### 🏭 行业深度洞察\n\n`;
    
    // AI 行业
    if (insights.sectorTrendsInsights.ai) {
      llmSection += `#### 🤖 AI 行业\n\n`;
      llmSection += `**投资论点**: ${insights.sectorTrendsInsights.ai.investmentThesis}\n\n`;
      llmSection += `**未来展望**: ${insights.sectorTrendsInsights.ai.futureOutlook}\n\n`;
    }
    
    // 半导体行业
    if (insights.sectorTrendsInsights.semiconductor) {
      llmSection += `#### 💾 半导体行业\n\n`;
      llmSection += `**周期分析**: ${insights.sectorTrendsInsights.semiconductor.cycleTiming}\n\n`;
      
      if (insights.sectorTrendsInsights.semiconductor.opportunities?.length > 0) {
        llmSection += `**机会**:\n`;
        insights.sectorTrendsInsights.semiconductor.opportunities.forEach(opp => {
          llmSection += `- ✅ ${opp}\n`;
        });
        llmSection += `\n`;
      }
    }
  }

  // 4. 战略建议
  if (insights.strategicRecommendations) {
    llmSection += `### 🎯 战略投资建议\n\n`;
    
    if (insights.strategicRecommendations.shortTerm?.length > 0) {
      llmSection += `**短期 (1-3个月)**:\n`;
      insights.strategicRecommendations.shortTerm.forEach(rec => {
        llmSection += `- ${rec}\n`;
      });
      llmSection += `\n`;
    }
    
    if (insights.strategicRecommendations.mediumTerm?.length > 0) {
      llmSection += `**中期 (3-12个月)**:\n`;
      insights.strategicRecommendations.mediumTerm.forEach(rec => {
        llmSection += `- ${rec}\n`;
      });
      llmSection += `\n`;
    }
    
    if (insights.strategicRecommendations.portfolioAllocation) {
      llmSection += `**组合配置建议**:\n\n${insights.strategicRecommendations.portfolioAllocation}\n\n`;
    }
  }

  // 5. 情景分析
  if (insights.scenarioAnalysis) {
    llmSection += `### 📈 情景分析\n\n`;
    
    if (insights.scenarioAnalysis.bullCase) {
      llmSection += `#### 🟢 乐观情景 (概率: ${insights.scenarioAnalysis.bullCase.probability}%)\n\n`;
      llmSection += `${insights.scenarioAnalysis.bullCase.scenario}\n\n`;
    }
    
    if (insights.scenarioAnalysis.baseCase) {
      llmSection += `#### ⚪ 基准情景 (概率: ${insights.scenarioAnalysis.baseCase.probability}%)\n\n`;
      llmSection += `${insights.scenarioAnalysis.baseCase.expectedOutcome}\n\n`;
    }
    
    if (insights.scenarioAnalysis.bearCase) {
      llmSection += `#### 🔴 悲观情景 (概率: ${insights.scenarioAnalysis.bearCase.probability}%)\n\n`;
      llmSection += `${insights.scenarioAnalysis.bearCase.scenario}\n\n`;
    }
  }

  // 6. 关键问题与行动
  if (insights.keyQuestionsAndActions) {
    llmSection += `### ❓ 关键问题与行动清单\n\n`;
    
    if (insights.keyQuestionsAndActions.criticalQuestions?.length > 0) {
      llmSection += `**需要关注的关键问题**:\n`;
      insights.keyQuestionsAndActions.criticalQuestions.forEach(q => {
        llmSection += `- ❓ ${q}\n`;
      });
      llmSection += `\n`;
    }
    
    if (insights.keyQuestionsAndActions.actionItems?.length > 0) {
      llmSection += `**行动清单**:\n`;
      insights.keyQuestionsAndActions.actionItems.forEach(action => {
        llmSection += `- ✅ ${action}\n`;
      });
      llmSection += `\n`;
    }
  }

  // 在报告末尾添加 LLM 洞察
  return report + llmSection;
}

main().catch((error) => {
  console.error('[generate-decision-enhanced] 生成失败:', error);
  process.exit(1);
});
