/**
 * 专业投资简报生成脚本
 * 
 * 按照用户要求的6大部分格式生成：
 * 一、核心股票池表现
 * 二、市场宏观动态与要闻
 * 三、关键公司深度动态
 * 四、行业影响与关联分析
 * 五、产业链资本动向与资产交易
 * 六、投资建议与策略展望
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ProfessionalBriefingGenerator } from '../generators/professional-briefing';
import { LLMEnhancer } from '../analyzers/llm/enhancer';
import { appConfig } from '../config';
import type { ComprehensiveAnalysis } from '../analyzers/types';
import { sendBriefingEmail, getEmailConfig } from '../services/email';
import { sendBriefingTelegram, getTelegramConfig } from '../services/telegram';
import { generateInfographic, checkNotebookLMCLI, checkNotebookLMAuth } from './generate-notebooklm-infographic';

// 加载环境变量
dotenv.config();

// 解析命令行参数
const args = process.argv.slice(2);
const skipLLM = args.includes('--skip-llm') || args.includes('-s');
const sendOnly = args.includes('--send-only') || args.includes('-o');
const withInfographic = args.includes('--with-infographic') || args.includes('-i');
const skipInfographic = args.includes('--skip-infographic');

// 专业简报的prompt加载
function loadProfessionalPrompts(): { systemPrompt: string; taskPrompt: string } {
  const promptsDir = path.resolve(process.cwd(), 'prompts');
  
  let systemPrompt = '';
  let taskPrompt = '';
  
  try {
    systemPrompt = fs.readFileSync(path.join(promptsDir, 'professional-briefing-system.txt'), 'utf-8');
  } catch {
    console.warn('[professional-briefing] 未找到 professional-briefing-system.txt，使用默认');
  }
  
  try {
    taskPrompt = fs.readFileSync(path.join(promptsDir, 'professional-briefing-task.txt'), 'utf-8');
  } catch {
    console.warn('[professional-briefing] 未找到 professional-briefing-task.txt，使用默认');
  }
  
  return { systemPrompt, taskPrompt };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                      ║');
  console.log('║         📊 AI Industry 每日简报生成器                                ║');
  console.log('║         专业 · 精炼 · 可操作                                         ║');
  console.log('║                                                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  // 显示运行模式
  if (sendOnly) {
    console.log('📤 模式: 仅发送已有报告 (--send-only)\n');
  } else if (skipLLM) {
    console.log('⚡ 模式: 跳过 LLM 分析，使用已有 insights (--skip-llm)\n');
  }

  const outputDir = path.resolve(process.cwd(), 'output');
  const processedDir = path.resolve(process.cwd(), 'data/processed');
  const today = new Date().toISOString().split('T')[0];
  const markdownPath = path.join(outputDir, `ai-briefing-${today}.md`);

  // --send-only 模式：只发送已有的报告
  if (sendOnly) {
    if (!fs.existsSync(markdownPath)) {
      console.error(`❌ 错误: 今日报告不存在: ${markdownPath}`);
      console.error('请先生成报告: npm run generate:pro');
      process.exit(1);
    }

    console.log(`📄 使用已有报告: ${markdownPath}`);

    // 检查是否有已生成的 infographic
    const infographicPath = path.join(outputDir, `ai-briefing-${today}-infographic.png`);
    const existingInfographic = fs.existsSync(infographicPath) ? infographicPath : undefined;
    if (existingInfographic) {
      console.log(`🖼️  使用已有 Infographic: ${path.basename(infographicPath)}`);
    }

    await sendReports(markdownPath, existingInfographic);
    return;
  }

  // 1. 查找最新的分析文件

  if (!fs.existsSync(processedDir)) {
    console.error('[professional-briefing] 错误: data/processed 目录不存在');
    console.error('请先运行数据收集和分析: npm run collect && npm run analyze');
    process.exit(1);
  }

  const files = fs.readdirSync(processedDir)
    .filter(f => f.startsWith('analysis-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('[professional-briefing] 错误: 未找到分析数据文件');
    console.error('请先运行分析: npm run analyze');
    process.exit(1);
  }

  const latestFile = files[0];
  const analysisPath = path.join(processedDir, latestFile);

  console.log(`📂 读取分析数据: ${latestFile}`);

  const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf-8')) as ComprehensiveAnalysis;

  // 2. 运行 LLM 深度分析（如果启用且未跳过）
  let llmInsights: any = null;

  // 查找已有的 LLM insights 文件
  const insightsFiles = fs.readdirSync(processedDir)
    .filter(f => f.startsWith('professional-insights-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (skipLLM) {
    // 跳过 LLM，使用已有的 insights
    if (insightsFiles.length > 0) {
      const latestInsightsFile = insightsFiles[0];
      const insightsPath = path.join(processedDir, latestInsightsFile);
      console.log(`\n📂 加载已有 LLM 洞察: ${latestInsightsFile}`);
      try {
        llmInsights = JSON.parse(fs.readFileSync(insightsPath, 'utf-8'));
        console.log('✅ LLM 洞察加载成功');
      } catch (e: any) {
        console.warn(`⚠️ 加载 LLM 洞察失败: ${e.message}`);
        console.log('将使用基础数据生成报告');
      }
    } else {
      console.log('\n⚠️ 未找到已有的 LLM 洞察文件');
      console.log('将使用基础数据生成报告');
    }
  } else if (appConfig.llm.enabled) {
    console.log('\n🤖 运行 LLM 深度分析...');
    console.log(`   提供商: ${appConfig.llm.provider}`);
    console.log(`   模型: ${appConfig.llm.model}`);

    try {
      // 加载专业简报的prompt
      const { systemPrompt, taskPrompt } = loadProfessionalPrompts();
      
      // 构建分析数据摘要
      const dataSummary = buildDataSummary(analysisData);
      
      // 创建LLM请求
      const enhancer = new LLMEnhancer(appConfig.llm as any);
      
      // 直接调用provider进行分析
      const provider = (enhancer as any).provider;
      if (provider) {
        const startTime = Date.now();
        
        const response = await provider.chat([
          { role: 'system', content: systemPrompt || getDefaultSystemPrompt() },
          { role: 'user', content: `${dataSummary}\n\n${taskPrompt || getDefaultTaskPrompt()}` }
        ]);
        
        const completionTime = Date.now() - startTime;
        
        console.log(`\n✅ LLM 分析完成`);
        console.log(`   耗时: ${(completionTime / 1000).toFixed(1)}秒`);
        if (response.usage) {
          console.log(`   Token使用: ${response.usage.totalTokens}`);
        }
        
        // 解析LLM响应
        try {
          const content = response.content;
          
          // 移除可能的markdown代码块标记
          const jsonContent = content
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
          
          llmInsights = JSON.parse(jsonContent);
          
          // 保存LLM洞察
          const insightsPath = path.join(processedDir, `professional-insights-${new Date().toISOString().split('T')[0]}.json`);
          fs.writeFileSync(insightsPath, JSON.stringify(llmInsights, null, 2), 'utf-8');
          console.log(`💾 LLM洞察已保存: ${path.basename(insightsPath)}`);
          
        } catch (parseError: any) {
          console.warn(`\n⚠️ LLM响应解析失败: ${parseError.message}`);
          console.log('将使用基础数据生成报告');
        }
      }
      
    } catch (error: any) {
      console.error(`\n❌ LLM 分析失败: ${error.message}`);
      console.log('将使用基础数据生成报告');
    }
  } else {
    console.log('\n📝 LLM 未启用，将使用基础数据生成报告');
    console.log('   提示: 设置 LLM_ENABLED=true 启用深度分析');
  }

  // 3. 生成专业简报
  console.log('\n📝 生成专业投资简报...');

  const generator = new ProfessionalBriefingGenerator(analysisData, llmInsights);
  const report = await generator.generate();

  // 4. 保存报告
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(markdownPath, report.markdown, 'utf-8');

  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                      ║');
  console.log('║         ✅ AI Industry 每日简报生成完成！                            ║');
  console.log('║                                                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  console.log('📁 生成的文件:');
  console.log(`   📄 ${markdownPath}`);
  console.log(`      大小: ${(fs.statSync(markdownPath).size / 1024).toFixed(2)} KB`);

  console.log('\n📋 报告内容:');
  console.log('   一、核心股票池表现（按AI产业链分类）');
  console.log('   二、市场宏观动态与要闻');
  console.log('   三、关键公司深度动态');
  console.log('   四、行业影响与关联分析');
  console.log('   五、产业链资本动向与资产交易');
  console.log('   六、投资建议与策略展望');

  console.log('\n📄 查看报告:');
  console.log(`   cat ${markdownPath}`);

  // 5. 生成 NotebookLM Infographic（如果启用）
  let infographicPath: string | undefined;
  const infographicOutputPath = path.join(outputDir, `ai-briefing-${today}-infographic.png`);

  // 默认启用 infographic，除非指定 --skip-infographic
  const shouldGenerateInfographic = !skipInfographic;

  if (shouldGenerateInfographic) {
    console.log('\n🎨 生成 NotebookLM Infographic...');

    // 检查 NotebookLM CLI 是否可用
    if (!checkNotebookLMCLI()) {
      console.log('   ⚠️ NotebookLM CLI 未安装，跳过 Infographic 生成');
      console.log('   提示: pip install notebooklm-cli');
    } else if (!checkNotebookLMAuth()) {
      console.log('   ⚠️ NotebookLM 未认证，跳过 Infographic 生成');
      console.log('   提示: notebooklm login');
    } else {
      try {
        const result = await generateInfographic(markdownPath, infographicOutputPath);
        if (result.success && result.imagePath) {
          infographicPath = result.imagePath;
          console.log(`   ✅ Infographic 生成成功: ${path.basename(infographicPath)}`);
        } else {
          console.log(`   ⚠️ Infographic 生成失败: ${result.error}`);
        }
      } catch (error: any) {
        console.log(`   ⚠️ Infographic 生成出错: ${error.message}`);
      }
    }
  }

  // 6. 发送报告（邮件和/或 Telegram）
  await sendReports(markdownPath, infographicPath);

  console.log('\n');
}

/**
 * 发送报告（邮件和/或 Telegram）
 */
async function sendReports(markdownPath: string, infographicPath?: string): Promise<void> {
  const emailConfig = getEmailConfig();
  const telegramConfig = getTelegramConfig();

  // 发送邮件
  if (emailConfig.enabled) {
    console.log('\n📧 正在发送简报邮件...');
    if (infographicPath && fs.existsSync(infographicPath)) {
      console.log(`   📷 附带 Infographic: ${path.basename(infographicPath)}`);
    }
    await sendBriefingEmail(markdownPath, infographicPath);
  }

  // 发送 Telegram
  if (telegramConfig.enabled) {
    console.log('\n📱 正在发送 Telegram 消息...');
    await sendBriefingTelegram(markdownPath);
  }

  if (!emailConfig.enabled && !telegramConfig.enabled) {
    console.log('\n💡 提示: 邮件和 Telegram 都未启用');
    console.log('   设置 EMAIL_ENABLED=true 启用邮件发送');
    console.log('   设置 TELEGRAM_ENABLED=true 启用 Telegram 发送');
  }
}

/**
 * 构建数据摘要供LLM分析
 */
function buildDataSummary(analysis: ComprehensiveAnalysis): string {
  let summary = `# 市场数据摘要 (${new Date().toISOString().split('T')[0]})\n\n`;
  
  // 市场状态
  summary += `## 市场状态\n`;
  summary += `- 整体状态: ${analysis.market?.condition || 'N/A'}\n`;
  summary += `- 市场情绪: ${analysis.market?.sentiment || 'N/A'}\n\n`;
  
  // 涨幅榜
  if (analysis.market?.topGainers && analysis.market.topGainers.length > 0) {
    summary += `## 涨幅榜 TOP 10\n`;
    analysis.market.topGainers.slice(0, 10).forEach((stock: any) => {
      summary += `- ${stock.symbol}: $${stock.price?.toFixed(2) || 'N/A'} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent?.toFixed(2) || 'N/A'}%)\n`;
    });
    summary += `\n`;
  }
  
  // 跌幅榜
  if (analysis.market?.topLosers && analysis.market.topLosers.length > 0) {
    summary += `## 跌幅榜 TOP 10\n`;
    analysis.market.topLosers.slice(0, 10).forEach((stock: any) => {
      summary += `- ${stock.symbol}: $${stock.price?.toFixed(2) || 'N/A'} (${stock.changePercent?.toFixed(2) || 'N/A'}%)\n`;
    });
    summary += `\n`;
  }
  
  // 新闻摘要
  summary += `## 重要新闻\n`;
  summary += `总计新闻: ${analysis.news?.totalArticles || 0}条\n`;
  summary += `整体情绪: ${analysis.news?.sentiment || 'N/A'}\n\n`;
  
  // 关键新闻 (keyHeadlines)
  if (analysis.news?.keyHeadlines && analysis.news.keyHeadlines.length > 0) {
    summary += `### 关键新闻\n`;
    analysis.news.keyHeadlines.forEach((item: any, i: number) => {
      summary += `${i + 1}. [${item.importance || 'medium'}] ${item.headline}\n`;
      summary += `   来源: ${item.source || 'N/A'} | 情绪: ${item.sentiment || 'N/A'}\n`;
    });
    summary += `\n`;
  }
  
  // 热门话题 (topTopics)
  if (analysis.news?.topTopics && analysis.news.topTopics.length > 0) {
    summary += `### 热门话题\n`;
    analysis.news.topTopics.forEach((topic: any) => {
      summary += `**${topic.topic}** (${topic.count}条, ${topic.sentiment})\n`;
      if (topic.headlines && topic.headlines.length > 0) {
        topic.headlines.slice(0, 3).forEach((h: string) => {
          summary += `  - ${h}\n`;
        });
      }
    });
    summary += `\n`;
  }
  
  // 兜底：尝试读取 topHeadlines
  if (analysis.news?.topHeadlines && analysis.news.topHeadlines.length > 0) {
    summary += `### 其他新闻\n`;
    analysis.news.topHeadlines.slice(0, 10).forEach((headline: any, i: number) => {
      if (typeof headline === 'string') {
        summary += `${i + 1}. ${headline}\n`;
      } else {
        summary += `${i + 1}. ${headline.title || headline}\n`;
      }
    });
    summary += `\n`;
  }
  
  // 经济指标
  if (analysis.economic) {
    summary += `## 经济指标\n`;
    summary += `- 经济展望: ${analysis.economic.outlook || 'N/A'}\n`;
    if (analysis.economic.keyIndicators) {
      summary += `- 关键指标:\n`;
      for (const [key, value] of Object.entries(analysis.economic.keyIndicators)) {
        summary += `  - ${key}: ${value}\n`;
      }
    }
    summary += `\n`;
  }
  
  return summary;
}

/**
 * 默认系统prompt
 */
function getDefaultSystemPrompt(): string {
  return `你是一位专业的全球科技与人工智能领域投资经理，正在为客户撰写"AI Industry 每日简报和投资建议"。

## 核心要求
1. 数据准确性：仅使用提供的数据，任何无法核验的数值写 N/A
2. 专业中立：风格专业、精炼、符合投资报告标准
3. 输出语言：中文
4. 产业链视角：始终从AI产业链上下游视角分析

## 输出格式
直接输出纯净的JSON，不要使用markdown代码块。`;
}

/**
 * 默认任务prompt
 */
function getDefaultTaskPrompt(): string {
  return `基于以上市场数据，生成以下结构的JSON分析报告：

{
  "marketMacroNews": { "summary": "...", "keyNews": [...] },
  "companyDeepDive": [...],
  "industryLinkageAnalysis": { "gpuSupplyChain": {...}, "dataCenterExpansion": {...}, "semiconCapex": {...} },
  "capitalMovements": [...],
  "investmentStrategy": { "overallJudgment": {...}, "shortTerm": {...}, "mediumTerm": {...}, "longTerm": {...}, "portfolioSuggestion": {...}, "riskControl": {...} },
  "dailyBlessing": "一句温和积极的祝福语"
}

请确保：
1. 所有内容用中文
2. 数字准确，不确定写N/A
3. 输出有效JSON，可被JSON.parse()解析
4. 不要添加markdown代码块标记`;
}

main().catch(console.error);
