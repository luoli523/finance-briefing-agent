/**
 * 智能工作流脚本
 * 一键运行：收集 -> 智能分析 -> 生成智能简报
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runCommand(command: string, description: string): Promise<void> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 ${description}`);
  console.log(`${'='.repeat(70)}\n`);

  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(`\n✅ ${description} - Completed\n`);
  } catch (error: any) {
    console.error(`\n❌ ${description} - Failed:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                    ║');
  console.log('║          🧠 Finance Briefing Agent - Intelligent Workflow          ║');
  console.log('║                                                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const startTime = Date.now();

  try {
    // Step 1: 收集数据
    await runCommand('npm run collect', 'Step 1/3: Collecting Data');

    // Step 2: 智能分析
    await runCommand('npm run analyze:intelligent', 'Step 2/3: Intelligent Analysis');

    // Step 3: 生成智能简报
    await runCommand('npm run generate:intelligent', 'Step 3/3: Generating Intelligent Briefing');

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                    ║');
    console.log('║                  🎉 Workflow Completed Successfully! 🎉            ║');
    console.log('║                                                                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    console.log(`⏱️  Total Time: ${duration}s`);
    console.log('\n');
    console.log('📁 Output Files:');
    console.log('   - Intelligent Briefing: output/intelligent-briefing-YYYY-MM-DD.md');
    console.log('   - Analysis Data: data/processed/intelligent-analysis-*.json');
    console.log('\n');
    console.log('💡 Next Steps:');
    console.log('   - Review the intelligent briefing in the output/ directory');
    console.log('   - Check detailed analysis data in data/processed/');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Workflow failed. Please check the error messages above.\n');
    process.exit(1);
  }
}

main();
