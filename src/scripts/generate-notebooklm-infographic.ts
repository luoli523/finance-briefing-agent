/**
 * NotebookLM Infographic 生成脚本
 *
 * 使用 NotebookLM CLI 基于当日简报生成中文信息图
 *
 * 用法：
 *   npm run generate:nlm-infographic          # 使用当天简报
 *   npm run generate:nlm-infographic 2026-01-25  # 使用指定日期简报
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawnSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

interface InfographicResult {
  success: boolean;
  imagePath?: string;
  notebookId?: string;
  error?: string;
}

/**
 * 检查 notebooklm CLI 是否可用
 */
function checkNotebookLMCLI(): boolean {
  try {
    execSync('notebooklm --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查 notebooklm 认证状态
 */
function checkNotebookLMAuth(): boolean {
  try {
    const result = execSync('notebooklm status 2>&1', { encoding: 'utf-8' });
    // 如果没有报错，说明已认证
    return !result.includes('not authenticated') && !result.includes('login');
  } catch {
    return false;
  }
}

/**
 * 使用 NotebookLM 生成 infographic
 */
async function generateInfographic(briefingPath: string, outputPath: string): Promise<InfographicResult> {
  const today = new Date().toISOString().split('T')[0];
  const notebookTitle = `AI投资简报 ${today}`;

  console.log('\n🎨 [NotebookLM] 开始生成 Infographic...\n');

  try {
    // 1. 创建新的 Notebook
    console.log(`📓 创建 Notebook: ${notebookTitle}`);
    const createResult = spawnSync('notebooklm', ['create', notebookTitle], {
      encoding: 'utf-8',
      timeout: 30000,
    });

    if (createResult.status !== 0) {
      throw new Error(`创建 Notebook 失败: ${createResult.stderr || createResult.stdout}`);
    }

    // 提取 notebook ID
    const createOutput = createResult.stdout;
    const notebookIdMatch = createOutput.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (!notebookIdMatch) {
      throw new Error('无法获取 Notebook ID');
    }
    const notebookId = notebookIdMatch[1];
    console.log(`   ✅ Notebook ID: ${notebookId}`);

    // 2. 设置当前 Notebook
    console.log(`📌 设置当前 Notebook...`);
    const useResult = spawnSync('notebooklm', ['use', notebookId], {
      encoding: 'utf-8',
      timeout: 30000,
    });

    if (useResult.status !== 0) {
      throw new Error(`设置 Notebook 失败: ${useResult.stderr || useResult.stdout}`);
    }

    // 3. 上传简报文件
    console.log(`📤 上传简报文件: ${path.basename(briefingPath)}`);
    const addResult = spawnSync('notebooklm', [
      'source', 'add', briefingPath,
      '--title', `AI投资简报 ${today}`
    ], {
      encoding: 'utf-8',
      timeout: 60000,
    });

    if (addResult.status !== 0) {
      throw new Error(`上传文件失败: ${addResult.stderr || addResult.stdout}`);
    }
    console.log(`   ✅ 文件上传成功`);

    // 等待处理完成
    console.log(`⏳ 等待 NotebookLM 处理文件...`);
    await sleep(5000);

    // 4. 生成 Infographic
    console.log(`🎨 生成中文信息图...`);
    const generateResult = spawnSync('notebooklm', [
      'generate', 'infographic',
      '请生成信息图，重点展示：主要指数表现、AI产业链股票涨跌情况、市场宏观要闻、投资建议与策略。使用清晰的可视化布局。',
      '--language', 'zh_Hans',
      '--detail', 'detailed',
      '--orientation', 'portrait',
      '--wait'
    ], {
      encoding: 'utf-8',
      timeout: 300000, // 5 分钟超时
    });

    if (generateResult.status !== 0) {
      throw new Error(`生成 Infographic 失败: ${generateResult.stderr || generateResult.stdout}`);
    }
    console.log(`   ✅ Infographic 生成成功`);

    // 5. 下载 Infographic
    console.log(`📥 下载 Infographic 到: ${outputPath}`);
    const downloadResult = spawnSync('notebooklm', [
      'download', 'infographic', outputPath
    ], {
      encoding: 'utf-8',
      timeout: 60000,
    });

    if (downloadResult.status !== 0) {
      throw new Error(`下载 Infographic 失败: ${downloadResult.stderr || downloadResult.stdout}`);
    }

    // 验证文件是否存在
    if (!fs.existsSync(outputPath)) {
      throw new Error('下载完成但文件不存在');
    }

    const fileSize = fs.statSync(outputPath).size;
    console.log(`   ✅ 下载成功 (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    return {
      success: true,
      imagePath: outputPath,
      notebookId,
    };

  } catch (error: any) {
    console.error(`\n❌ 错误: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 睡眠函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 主函数
 */
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║         🎨 NotebookLM Infographic 生成器                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  // 解析命令行参数
  const args = process.argv.slice(2);
  const targetDate = args[0] || new Date().toISOString().split('T')[0];

  // 1. 检查 NotebookLM CLI
  console.log('🔍 检查 NotebookLM CLI...');
  if (!checkNotebookLMCLI()) {
    console.error('❌ NotebookLM CLI 未安装');
    console.error('   请先安装: pip install notebooklm-cli');
    process.exit(1);
  }
  console.log('   ✅ NotebookLM CLI 已安装');

  // 2. 检查认证状态
  console.log('🔐 检查认证状态...');
  if (!checkNotebookLMAuth()) {
    console.error('❌ NotebookLM 未认证');
    console.error('   请先运行: notebooklm login');
    process.exit(1);
  }
  console.log('   ✅ 已认证');

  // 3. 查找简报文件
  const outputDir = path.resolve(process.cwd(), 'output');
  const briefingPath = path.join(outputDir, `ai-briefing-${targetDate}.md`);

  if (!fs.existsSync(briefingPath)) {
    console.error(`\n❌ 未找到简报文件: ai-briefing-${targetDate}.md`);

    // 列出可用的简报
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir)
        .filter(f => f.startsWith('ai-briefing-') && f.endsWith('.md'))
        .sort()
        .reverse()
        .slice(0, 5);

      if (files.length > 0) {
        console.log('\n📁 可用的简报文件:');
        files.forEach(f => {
          const date = f.replace('ai-briefing-', '').replace('.md', '');
          console.log(`   npm run generate:nlm-infographic ${date}`);
        });
      }
    }
    process.exit(1);
  }

  console.log(`📄 简报文件: ai-briefing-${targetDate}.md`);

  // 4. 生成 Infographic
  const infographicPath = path.join(outputDir, `ai-briefing-${targetDate}-infographic.png`);

  const result = await generateInfographic(briefingPath, infographicPath);

  if (result.success) {
    console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
    console.log('║         ✅ Infographic 生成成功！                                    ║');
    console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

    console.log('📁 生成的文件:');
    console.log(`   🖼️  ${result.imagePath}`);
    console.log(`   📓 Notebook ID: ${result.notebookId}`);

    console.log('\n🌐 打开方式:');
    console.log(`   open ${result.imagePath}`);

    // 导出路径供其他脚本使用
    process.env.INFOGRAPHIC_PATH = result.imagePath;

  } else {
    console.error('\n❌ Infographic 生成失败');
    console.error(`   错误: ${result.error}`);
    process.exit(1);
  }
}

// 导出函数供其他模块使用
export { generateInfographic, checkNotebookLMCLI, checkNotebookLMAuth };
export type { InfographicResult };

// 只在直接运行时执行 main()
const isDirectRun = process.argv[1]?.includes('generate-notebooklm-infographic');
if (isDirectRun) {
  main().catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}
