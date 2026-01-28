/**
 * NotebookLM Infographic 生成脚本
 *
 * 使用 NotebookLM CLI 基于当日简报生成中文信息图
 * 复用固定的 "AI投资简报" notebook，避免创建过多临时 notebook
 *
 * 用法：
 *   npm run infographic                    # 使用当天简报生成 infographic
 *   npm run infographic 2026-01-25         # 使用指定日期简报
 *   npm run infographic 2026-01-25 slides  # 生成 slides 而不是 infographic
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync, spawnSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

// 固定的 Notebook 名称
const NOTEBOOK_NAME = 'AI投资简报';

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
    return !result.includes('not authenticated') && !result.includes('login');
  } catch {
    return false;
  }
}

/**
 * 查找名为 NOTEBOOK_NAME 的 notebook
 * @returns notebook ID 或 null
 */
function findNotebook(): string | null {
  try {
    // 使用 --json 格式获取更精确的数据
    const result = execSync('notebooklm list --json 2>&1', { encoding: 'utf-8' });
    try {
      const data = JSON.parse(result);
      // 格式: { notebooks: [...] }
      const notebooks = data.notebooks || data;
      for (const nb of notebooks) {
        // 精确匹配 "AI投资简报"（不带日期后缀）
        if (nb.title === NOTEBOOK_NAME) {
          return nb.id;
        }
      }
    } catch {
      // JSON 解析失败，回退到文本解析
      const lines = result.split('\n');
      for (const line of lines) {
        if (line.includes('│') && line.includes(NOTEBOOK_NAME)) {
          const parts = line.split('│').map(p => p.trim());
          if (parts[2] === NOTEBOOK_NAME) {
            const idMatch = parts[1].match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
            if (idMatch) {
              return idMatch[1];
            }
            const shortId = parts[1].replace('…', '').replace(/[^0-9a-f-]/gi, '').trim();
            if (shortId.length >= 8) {
              return shortId;
            }
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 创建新的 notebook
 * @returns notebook ID
 */
function createNotebook(): string {
  const result = spawnSync('notebooklm', ['create', NOTEBOOK_NAME], {
    encoding: 'utf-8',
    timeout: 30000,
  });

  if (result.status !== 0) {
    throw new Error(`创建 Notebook 失败: ${result.stderr || result.stdout}`);
  }

  const idMatch = result.stdout.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  if (!idMatch) {
    throw new Error('无法获取新创建的 Notebook ID');
  }
  return idMatch[1];
}

/**
 * 检查指定日期的简报是否已上传
 * @param targetDate 目标日期 (YYYY-MM-DD)
 * @returns source ID 或 null
 */
function findExistingSource(targetDate: string): string | null {
  try {
    const result = execSync('notebooklm source list --json 2>&1', { encoding: 'utf-8' });
    // 匹配 "ai-briefing-2026-01-28" 或 "ai-briefing-2026-01-28.md"
    const sourcePattern = `ai-briefing-${targetDate}`;

    try {
      const data = JSON.parse(result);
      const sources = data.sources || [];
      for (const src of sources) {
        // 检查 title 是否包含目标日期
        if (src.title && src.title.includes(sourcePattern)) {
          return src.id;
        }
      }
    } catch {
      // JSON 解析失败，回退到文本解析
      const lines = result.split('\n');
      for (const line of lines) {
        if (line.includes('│') && line.includes(sourcePattern)) {
          const parts = line.split('│').map(p => p.trim());
          const shortId = parts[1].replace('…', '').trim();
          if (shortId.length >= 8) {
            return shortId;
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 使用 NotebookLM 生成 infographic 或 slides
 */
async function generateInfographic(
  briefingPath: string,
  outputPath: string,
  targetDate: string,
  artifactType: 'infographic' | 'slide-deck' = 'infographic'
): Promise<InfographicResult> {
  console.log('\n🎨 [NotebookLM] 开始生成 Infographic...\n');

  try {
    // 1. 查找或创建 Notebook
    let notebookId = findNotebook();

    if (notebookId) {
      console.log(`📓 找到已有 Notebook: ${NOTEBOOK_NAME}`);
      console.log(`   ID: ${notebookId}`);
    } else {
      console.log(`📓 创建新 Notebook: ${NOTEBOOK_NAME}`);
      notebookId = createNotebook();
      console.log(`   ✅ Notebook ID: ${notebookId}`);
    }

    // 2. 设置当前 Notebook
    console.log(`📌 设置当前 Notebook...`);
    const useResult = spawnSync('notebooklm', ['use', notebookId], {
      encoding: 'utf-8',
      timeout: 30000,
    });

    if (useResult.status !== 0) {
      throw new Error(`设置 Notebook 失败: ${useResult.stderr || useResult.stdout}`);
    }

    // 3. 检查当天简报是否已上传，获取 source ID
    let sourceId = findExistingSource(targetDate);

    if (sourceId) {
      console.log(`📄 简报已存在: ai-briefing-${targetDate}`);
      console.log(`   Source ID: ${sourceId}`);
    } else {
      // 上传简报文件
      console.log(`📤 上传简报文件: ${path.basename(briefingPath)}`);
      const addResult = spawnSync('notebooklm', [
        'source', 'add', briefingPath,
        '--title', `ai-briefing-${targetDate}`,
        '--json'
      ], {
        encoding: 'utf-8',
        timeout: 120000,
      });

      if (addResult.status !== 0) {
        throw new Error(`上传文件失败: ${addResult.stderr || addResult.stdout}`);
      }

      // 从 JSON 输出中提取 source ID
      try {
        const addData = JSON.parse(addResult.stdout);
        sourceId = addData.source_id || addData.id;
      } catch {
        // 回退到正则匹配
        const sourceIdMatch = addResult.stdout.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
        if (sourceIdMatch) {
          sourceId = sourceIdMatch[1];
        }
      }
      console.log(`   ✅ 文件上传成功`);

      // 等待 source 处理完成
      if (sourceId) {
        console.log(`⏳ 等待 NotebookLM 处理文件...`);
        console.log(`   Source ID: ${sourceId}`);
        const waitResult = spawnSync('notebooklm', [
          'source', 'wait', sourceId,
          '--timeout', '120'
        ], {
          encoding: 'utf-8',
          timeout: 130000,
        });

        if (waitResult.status !== 0) {
          console.log(`   ⚠️ 等待超时，继续尝试生成...`);
        } else {
          console.log(`   ✅ 文件处理完成`);
        }
      } else {
        // 无法提取 source ID，等待固定时间
        console.log(`⏳ 等待 NotebookLM 处理文件...`);
        await sleep(5000);
      }
    }

    // 4. 生成 Infographic 或 Slides（仅使用当天的简报 source）
    const typeLabel = artifactType === 'slide-deck' ? 'Slides' : 'Infographic';
    console.log(`🎨 生成中文${typeLabel}...`);
    if (sourceId) {
      console.log(`   📌 仅使用 Source: ai-briefing-${targetDate}`);
    }

    const generateArgs = artifactType === 'infographic'
      ? [
          'generate', 'infographic',
          '请生成信息图，重点展示：主要指数表现、AI产业链股票涨跌情况、市场宏观要闻、投资建议与策略。使用清晰的可视化布局。',
          '--language', 'zh_Hans',
          '--detail', 'detailed',
          '--orientation', 'portrait',
          '--wait',
          ...(sourceId ? ['--source', sourceId] : [])
        ]
      : [
          'generate', 'slide-deck',
          '请生成投资简报PPT，包含：主要指数表现、涨跌榜、市场要闻、投资建议。',
          '--language', 'zh_Hans',
          '--wait',
          ...(sourceId ? ['--source', sourceId] : [])
        ];

    const generateResult = spawnSync('notebooklm', generateArgs, {
      encoding: 'utf-8',
      timeout: 300000,
    });

    if (generateResult.status !== 0) {
      throw new Error(`生成 ${typeLabel} 失败: ${generateResult.stderr || generateResult.stdout}`);
    }
    console.log(`   ✅ ${typeLabel} 生成成功`);

    // 5. 下载生成的文件
    console.log(`📥 下载 ${typeLabel} 到: ${outputPath}`);
    const downloadResult = spawnSync('notebooklm', [
      'download', artifactType, outputPath,
      '--force',  // 覆盖已有文件
      '--latest'  // 下载最新的 artifact
    ], {
      encoding: 'utf-8',
      timeout: 60000,
    });

    if (downloadResult.status !== 0) {
      throw new Error(`下载 ${typeLabel} 失败: ${downloadResult.stderr || downloadResult.stdout}`);
    }

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
  const artifactType = (args[1] === 'slides' || args[1] === 'slide-deck') ? 'slide-deck' : 'infographic';

  // 1. 检查 NotebookLM CLI
  console.log('🔍 检查 NotebookLM CLI...');
  if (!checkNotebookLMCLI()) {
    console.error('❌ NotebookLM CLI 未安装');
    console.error('   请先安装: pip install notebooklm-py');
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
          console.log(`   npm run infographic ${date}`);
        });
      }
    }
    process.exit(1);
  }

  console.log(`📄 简报文件: ai-briefing-${targetDate}.md`);
  console.log(`🎯 生成类型: ${artifactType === 'slide-deck' ? 'Slides (PPT)' : 'Infographic'}`);

  // 4. 生成 Infographic 或 Slides
  const ext = artifactType === 'slide-deck' ? 'pdf' : 'png';
  const outputFile = path.join(outputDir, `ai-briefing-${targetDate}-${artifactType}.${ext}`);

  const result = await generateInfographic(briefingPath, outputFile, targetDate, artifactType);

  if (result.success) {
    console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
    console.log(`║         ✅ ${artifactType === 'slide-deck' ? 'Slides' : 'Infographic'} 生成成功！                                    ║`);
    console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

    console.log('📁 生成的文件:');
    console.log(`   🖼️  ${result.imagePath}`);
    console.log(`   📓 Notebook: ${NOTEBOOK_NAME}`);

    console.log('\n🌐 打开方式:');
    console.log(`   open ${result.imagePath}`);

    process.env.INFOGRAPHIC_PATH = result.imagePath;

  } else {
    console.error('\n❌ 生成失败');
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
