/**
 * 生成决策导向的财经简报
 */

import * as fs from 'fs';
import * as path from 'path';
import { DecisionOrientedGenerator } from '../generators/decision-oriented';
import { DecisionOrientedHtmlGenerator } from '../generators/decision-oriented-html';
import type { ComprehensiveAnalysis } from '../analyzers/types';

async function main() {
  console.log('[generate-decision] 开始生成决策导向简报...\n');

  // 1. 查找最新的分析文件
  const processedDir = path.resolve(process.cwd(), 'data/processed');
  
  if (!fs.existsSync(processedDir)) {
    console.error('[generate-decision] 错误: data/processed 目录不存在');
    console.error('请先运行数据收集和分析: npm run collect && npm run analyze');
    process.exit(1);
  }

  const files = fs.readdirSync(processedDir)
    .filter(f => f.startsWith('analysis-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('[generate-decision] 错误: 未找到分析数据文件');
    console.error('请先运行分析: npm run analyze');
    process.exit(1);
  }

  const latestFile = files[0];
  const analysisPath = path.join(processedDir, latestFile);

  console.log(`[generate-decision] 读取分析数据: ${latestFile}`);

  const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf-8')) as ComprehensiveAnalysis;

  // 2. 生成 Markdown 报告
  console.log('[generate-decision] 生成 Markdown 报告...');

  const generator = new DecisionOrientedGenerator();
  const reportContent = await generator.generate(analysisData);

  // 3. 保存 Markdown 报告
  const outputDir = path.resolve(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const mdPath = path.join(outputDir, `decision-report-${today}.md`);
  fs.writeFileSync(mdPath, reportContent, 'utf-8');

  // 4. 生成 HTML 报告
  console.log('[generate-decision] 生成 HTML 报告...');
  const htmlPath = path.join(outputDir, `decision-report-${today}.html`);
  const htmlGenerator = new DecisionOrientedHtmlGenerator();
  await htmlGenerator.generateFromMarkdown(mdPath, htmlPath);

  // 5. 输出结果
  const mdStats = fs.statSync(mdPath);
  const htmlStats = fs.statSync(htmlPath);

  console.log(`\n[generate-decision] ✅ 报告已生成:`);
  console.log(`  📄 Markdown: ${mdPath}`);
  console.log(`     └─ 大小: ${(mdStats.size / 1024).toFixed(2)} KB`);
  console.log(`  🌐 HTML: ${htmlPath}`);
  console.log(`     └─ 大小: ${(htmlStats.size / 1024).toFixed(2)} KB`);
  console.log(`\n[generate-decision] 完成！\n`);
}

main().catch((error) => {
  console.error('[generate-decision] 生成失败:', error);
  process.exit(1);
});
