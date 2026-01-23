/**
 * Demo: 使用 Gemini 生成交互式 Infographic
 * 
 * 这是一个演示脚本，展示如何使用 AI 生成可视化投资简报
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import type { ComprehensiveAnalysis } from '../analyzers/types';

// Gemini API 配置
const GEMINI_API_KEY = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * 调用 Gemini API
 */
async function callGemini(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
      }
    });

    const url = new URL(GEMINI_API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          
          // 详细日志
          console.log(`   HTTP 状态码: ${res.statusCode}`);
          
          // 检查错误
          if (json.error) {
            reject(new Error(`Gemini API 错误: ${json.error.message}`));
            return;
          }
          
          // 提取文本
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (!text) {
            console.log('   完整响应:', JSON.stringify(json, null, 2).substring(0, 500));
            reject(new Error('响应中没有文本内容'));
            return;
          }
          
          resolve(text);
        } catch (error) {
          console.error('   原始响应:', responseData.substring(0, 500));
          reject(new Error(`解析响应失败: ${error}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * 生成 Infographic Prompt
 */
function createInfographicPrompt(analysis: ComprehensiveAnalysis): string {
  const { market, news, economic } = analysis;
  
  // 提取关键数据
  const topGainers = market.topGainers.slice(0, 5);
  const topLosers = market.topLosers.slice(0, 5);
  const keyIndicators = economic.keyIndicators.slice(0, 5);
  const topHeadlines = news.keyHeadlines.slice(0, 5);
  
  return `你是一位专业的数据可视化设计师。请基于以下投资分析数据，生成一个**完整的交互式 HTML infographic**。

## 分析数据

### 市场概况
- 市场状态: ${market.marketCondition}
- VIX: ${market.fearGreedIndex?.vix || 'N/A'}

### 涨幅榜前5
${topGainers.map(q => `- ${q.symbol}: ${q.regularMarketChangePercent?.toFixed(2)}%`).join('\n')}

### 跌幅榜前5
${topLosers.map(q => `- ${q.symbol}: ${q.regularMarketChangePercent?.toFixed(2)}%`).join('\n')}

### 关键经济指标
${keyIndicators.map(ind => `- ${ind.name}: ${ind.value} (${ind.change})`).join('\n')}

### 重要新闻
${topHeadlines.map((h, i) => `${i + 1}. ${h}`).join('\n')}

## 要求

请生成一个**完整的 HTML 文件**，包含以下部分：

1. **顶部横幅**
   - 标题: "🎯 美股投资决策简报 Infographic"
   - 日期: ${new Date().toLocaleDateString('zh-CN')}
   - 市场情绪指示器（使用彩色徽章）

2. **市场仪表盘区域**（使用 Grid 布局）
   - 市场状态卡片（大号、醒目）
   - VIX 恐慌指数（仪表盘样式）
   - 涨跌家数对比（条形图）

3. **行业热力图**
   - 使用 CSS Grid 创建 3x4 热力图
   - 科技、半导体、能源、金融等行业
   - 颜色编码：绿色(涨)、红色(跌)、灰色(平)
   - 显示涨跌百分比

4. **个股表现矩阵**（左右分栏）
   - 左侧：涨幅榜 TOP 5（绿色主题）
   - 右侧：跌幅榜 TOP 5（红色主题）
   - 显示股票代码、名称、价格、涨跌幅

5. **宏观指标卡片组**
   - 5个关键指标并排显示
   - 每个卡片包含：指标名、数值、变化方向

6. **新闻时间线**
   - 垂直时间线样式
   - 5条重要新闻
   - 带有时间戳和图标

7. **投资建议雷达区**
   - 3个彩色卡片：看多、中性、看空
   - 包含具体建议和emoji图标

8. **底部催化剂时间线**
   - 横向时间线
   - 未来1-3个月的关键事件
   - 使用图标标注

## 设计要求

1. **使用现代化 CSS**
   - CSS Grid 和 Flexbox
   - 渐变背景、阴影、圆角
   - 响应式设计
   - 美观的配色方案（深色背景 #1a1a2e，彩色卡片）

2. **数据可视化**
   - 使用 Chart.js CDN 绘制图表
   - 包含至少2个交互式图表：
     * 涨跌分布饼图
     * 行业表现横向柱状图

3. **交互性**
   - 卡片 hover 效果
   - 平滑动画
   - 响应式布局

4. **完整性**
   - 包含 <!DOCTYPE html>
   - 完整的 <html>, <head>, <body> 标签
   - 内联所有 CSS 和 JS
   - 使用 Chart.js CDN: https://cdn.jsdelivr.net/npm/chart.js

5. **美观性**
   - 专业的配色
   - 清晰的层次结构
   - 视觉吸引力强

**请直接输出完整的 HTML 代码，不要添加任何解释文字或markdown标记。**

从 <!DOCTYPE html> 开始，到 </html> 结束。`;
}

/**
 * 清理 AI 响应（移除可能的 markdown 标记）
 */
function cleanHtmlResponse(response: string): string {
  // 移除 markdown 代码块标记
  let cleaned = response.replace(/```html\n?/g, '').replace(/```\n?$/g, '');
  // 移除开头的说明文字
  const htmlStart = cleaned.indexOf('<!DOCTYPE html>');
  if (htmlStart > 0) {
    cleaned = cleaned.substring(htmlStart);
  }
  return cleaned.trim();
}

/**
 * 主函数
 */
async function main() {
  console.log('\n🎨 [demo-infographic] 开始生成 AI 可视化报告...\n');

  // 1. 读取最新的分析数据
  const processedDir = path.resolve(process.cwd(), 'data/processed');
  const files = fs.readdirSync(processedDir)
    .filter(f => f.startsWith('analysis-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('❌ 未找到分析数据文件');
    console.error('   请先运行: npm run collect && npm run analyze');
    process.exit(1);
  }

  const latestFile = files[0];
  const analysisPath = path.join(processedDir, latestFile);
  console.log(`📊 读取分析数据: ${latestFile}`);

  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8')) as ComprehensiveAnalysis;

  // 2. 生成 prompt
  console.log('💬 构建 AI prompt...');
  const prompt = createInfographicPrompt(analysis);

  // 3. 调用 Gemini API
  console.log(`🤖 调用 Gemini API (${GEMINI_MODEL})...\n`);
  console.log('   这可能需要 20-30 秒，请稍候...\n');
  
  const startTime = Date.now();
  let htmlContent: string;
  
  try {
    const response = await callGemini(prompt);
    console.log(`📦 原始响应长度: ${response.length} 字符`);
    
    htmlContent = cleanHtmlResponse(response);
    console.log(`🧹 清理后长度: ${htmlContent.length} 字符`);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ AI 生成完成 (耗时: ${duration}s)\n`);
    
    // 如果清理后的内容为空或太短，输出原始响应以供调试
    if (htmlContent.length < 100) {
      console.error('⚠️ 生成的 HTML 内容异常短，原始响应：');
      console.error(response.substring(0, 500));
      console.error('\n尝试不清理直接使用原始响应...\n');
      htmlContent = response;
    }
  } catch (error) {
    console.error('❌ Gemini API 调用失败:', error);
    process.exit(1);
  }

  // 4. 保存 HTML 文件
  const outputDir = path.resolve(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const outputPath = path.join(outputDir, `infographic-demo-${today}.html`);
  
  fs.writeFileSync(outputPath, htmlContent, 'utf-8');

  // 5. 输出结果
  const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
  
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║         🎉 Demo Infographic 生成成功！                         ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log('📁 文件信息:');
  console.log(`   路径: ${outputPath}`);
  console.log(`   大小: ${fileSize} KB\n`);
  
  console.log('🌐 打开方式:');
  console.log(`   1. 在浏览器中打开文件`);
  console.log(`   2. 或运行: open ${outputPath}\n`);
  
  console.log('✨ 功能特性:');
  console.log('   ✅ 交互式图表（Chart.js）');
  console.log('   ✅ 市场热力图');
  console.log('   ✅ 个股表现矩阵');
  console.log('   ✅ 新闻时间线');
  console.log('   ✅ 投资建议雷达');
  console.log('   ✅ 催化剂时间线');
  console.log('   ✅ 响应式设计\n');
  
  console.log('💡 提示:');
  console.log('   这是一个 AI 生成的 demo，展示了可能的效果');
  console.log('   如果效果满意，我可以实现一个完整的可视化系统\n');
}

main().catch(error => {
  console.error('❌ 生成失败:', error);
  process.exit(1);
});
