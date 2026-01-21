/**
 * 简报生成脚本
 * 基于分析结果生成财经简报
 *
 * 运行: npm run generate
 */

import * as fs from 'fs';
import * as path from 'path';
import { UnifiedAnalyzer } from '../analyzers/index.js';
import { UnifiedGenerator, MarkdownGenerator, HtmlGenerator } from '../generators/index.js';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       Finance Briefing Agent - Briefing Generator          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  // 解析命令行参数
  const args = process.argv.slice(2);
  const formatArg = args.find(a => a.startsWith('--format='));
  const format = formatArg ? formatArg.split('=')[1] : 'all';

  try {
    // 首先运行分析（如果需要）
    console.log('📊 Step 1: Loading or generating analysis...');

    const analyzer = new UnifiedAnalyzer();
    let analysis;

    try {
      // 尝试加载最新的分析结果
      analysis = await analyzer.analyzeLatest();
      console.log('   ✓ Loaded existing analysis\n');
    } catch {
      // 如果没有分析结果，提示用户
      console.log('   ⚠ No analysis found. Please run "npm run analyze" first.\n');
      process.exit(1);
    }

    // 生成简报
    console.log('📝 Step 2: Generating briefings...');

    const generator = new UnifiedGenerator();
    const outputDir = path.resolve(process.cwd(), 'output');
    await fs.promises.mkdir(outputDir, { recursive: true });

    const date = new Date().toISOString().slice(0, 10);
    const results: { format: string; path: string }[] = [];

    if (format === 'all' || format === 'markdown' || format === 'md') {
      const mdGenerator = new MarkdownGenerator();
      const mdBriefing = await mdGenerator.generate(analysis);
      const mdPath = await mdGenerator.save(mdBriefing, `briefing-${date}.md`);
      results.push({ format: 'Markdown', path: mdPath });
    }

    if (format === 'all' || format === 'html') {
      const htmlGenerator = new HtmlGenerator();
      const htmlBriefing = await htmlGenerator.generate(analysis);
      const htmlPath = await htmlGenerator.save(htmlBriefing, `briefing-${date}.html`);
      results.push({ format: 'HTML', path: htmlPath });
    }

    // 打印结果
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ Generation Complete                     ║');
    console.log('╠════════════════════════════════════════════════════════════╣');

    for (const result of results) {
      console.log(`║  📄 ${result.format.padEnd(10)} → ${path.basename(result.path).padEnd(35)} ║`);
    }

    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  📁 Output directory: output/                              ║`);
    console.log('╚════════════════════════════════════════════════════════════╝');

    // 显示 Markdown 预览
    if (results.find(r => r.format === 'Markdown')) {
      const mdPath = results.find(r => r.format === 'Markdown')!.path;
      const mdContent = await fs.promises.readFile(mdPath, 'utf-8');
      const previewLines = mdContent.split('\n').slice(0, 30);

      console.log('\n📋 Markdown Preview:');
      console.log('─'.repeat(60));
      console.log(previewLines.join('\n'));
      console.log('─'.repeat(60));
      console.log('... (truncated)\n');
    }

    // 提示打开 HTML
    if (results.find(r => r.format === 'HTML')) {
      const htmlPath = results.find(r => r.format === 'HTML')!.path;
      console.log(`💡 Open HTML briefing in browser:`);
      console.log(`   open ${htmlPath}\n`);
    }

  } catch (error) {
    console.error('\n❌ Generation failed:', (error as Error).message);
    process.exit(1);
  }
}

main();
