/**
 * 智能简报生成脚本
 * 基于智能分析结果生成深度简报
 */

import * as fs from 'fs';
import * as path from 'path';
import { IntelligentAnalysis } from '../analyzers/intelligent';
import { createIntelligentMarkdownGenerator } from '../generators';

async function main() {
  console.log('============================================================');
  console.log('Finance Briefing Agent - Intelligent Report Generator');
  console.log('============================================================\n');

  // 1. 查找最新的智能分析文件
  const processedDir = path.join(process.cwd(), 'data/processed');
  const files = await fs.promises.readdir(processedDir);
  
  const analysisFiles = files
    .filter(f => f.startsWith('intelligent-analysis-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (analysisFiles.length === 0) {
    console.error('❌ No intelligent analysis found. Please run "npm run analyze:intelligent" first.');
    process.exit(1);
  }

  const latestFile = analysisFiles[0];
  const filepath = path.join(processedDir, latestFile);
  
  console.log(`📂 Loading analysis from: ${latestFile}\n`);

  // 2. 加载分析结果
  const content = await fs.promises.readFile(filepath, 'utf-8');
  const analysis: IntelligentAnalysis = JSON.parse(content);

  console.log('📝 Generating intelligent briefing...\n');

  // 3. 生成 Markdown 简报
  const markdownGenerator = createIntelligentMarkdownGenerator({
    includeDisclaimer: true,
  });

  const briefing = await markdownGenerator.generate(analysis);

  // 4. 保存简报
  const outputDir = path.join(process.cwd(), 'output');
  await fs.promises.mkdir(outputDir, { recursive: true });

  const date = new Date().toISOString().split('T')[0];
  const mdFilename = `intelligent-briefing-${date}.md`;
  const mdPath = path.join(outputDir, mdFilename);

  await fs.promises.writeFile(mdPath, briefing.content, 'utf-8');

  console.log('============================================================');
  console.log('✅ Intelligent briefing generated successfully!');
  console.log('============================================================\n');
  console.log(`📄 Markdown: ${mdPath}\n`);

  // 5. 显示简报统计
  console.log('📊 Briefing Statistics:');
  console.log(`   - Sections: ${briefing.sections.length}`);
  console.log(`   - Characters: ${briefing.content.length.toLocaleString()}`);
  console.log(`   - Lines: ${briefing.content.split('\n').length.toLocaleString()}\n`);

  console.log('💡 Tip: Open the file to view the full intelligent analysis!');
  console.log('============================================================\n');
}

main().catch(error => {
  console.error('❌ Intelligent briefing generation failed:', error);
  process.exit(1);
});
