/**
 * 发送信息图和幻灯片到 Instagram
 *
 * 使用 instagrapi (Python) 发布:
 * 1. 信息图 → 单张图片帖子
 * 2. 幻灯片 → PDF 切分后以相册（轮播）方式发布
 *
 * 用法:
 *   npm run send-instagram              # 发布当天内容
 *   npm run send-instagram 2026-01-25   # 发布指定日期内容
 *
 * 前置条件:
 *   pip install instagrapi pdf2image
 *   macOS: brew install poppler
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { execSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

dotenv.config();

function checkPythonDep(module: string): boolean {
  try {
    execSync(`python3 -c "import ${module}"`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 将 PDF 切分为图片，输出到与 PDF 同名的目录
 * @returns 输出目录路径，失败返回 null
 */
function convertPdfToImages(pdfPath: string, pyScriptsDir: string): string | null {
  const pdfName = path.basename(pdfPath, '.pdf');
  const outputDir = path.join(path.dirname(pdfPath), pdfName);

  // 如果目录已存在且有图片，跳过转换
  if (fs.existsSync(outputDir)) {
    const existing = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
    if (existing.length > 0) {
      console.log(`   ⏭️  已存在 ${existing.length} 张切分图片，跳过转换`);
      return outputDir;
    }
  }

  const convertScript = path.join(pyScriptsDir, 'pdf-to-images.py');
  const result = spawnSync('python3', [convertScript, pdfPath, '--dpi', '150'], {
    stdio: 'inherit',
    timeout: 120000,
  });

  if (result.status !== 0) {
    return null;
  }

  return outputDir;
}

/**
 * 从简报文件中提取 Instagram caption
 * Instagram caption 限制 2200 字符，需要精炼
 */
function generateCaption(briefingPath: string, targetDate: string): string {
  const lines: string[] = [];

  lines.push(`📊 AI Industry Daily Briefing`);
  lines.push(`📅 ${targetDate}`);
  lines.push('');

  if (fs.existsSync(briefingPath)) {
    const content = fs.readFileSync(briefingPath, 'utf-8');

    // 提取涨跌幅数据
    const tableRows = content.match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g);
    if (tableRows) {
      const stocks: { ticker: string; change: number; changeStr: string }[] = [];
      for (const row of tableRows) {
        const match = row.match(/\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*(\w+)\s*\|\s*[\$]?([\d,.]+)\s*\|\s*([+-]?[\d.]+%)\s*\|/);
        if (match && match[1] && match[3]) {
          const ticker = match[1].trim();
          const changeStr = match[3].trim();
          const change = parseFloat(changeStr.replace('%', ''));
          if (!isNaN(change) && ticker.length <= 5) {
            stocks.push({ ticker, change, changeStr });
          }
        }
      }

      const gainers = stocks.filter(s => s.change > 0).sort((a, b) => b.change - a.change).slice(0, 5);
      const losers = stocks.filter(s => s.change < 0).sort((a, b) => a.change - b.change).slice(0, 5);

      if (gainers.length > 0) {
        lines.push('🟢 Top Gainers');
        gainers.forEach(s => lines.push(`  ${s.ticker}: ${s.changeStr}`));
        lines.push('');
      }
      if (losers.length > 0) {
        lines.push('🔴 Top Losers');
        losers.forEach(s => lines.push(`  ${s.ticker}: ${s.changeStr}`));
        lines.push('');
      }
    }
  }

  lines.push('─────────────────');
  lines.push('#AI #Finance #StockMarket #Investing #DailyBriefing #NVIDIA #Semiconductor #TechStocks');

  const caption = lines.join('\n');

  // Instagram caption 限制 2200 字符
  if (caption.length > 2200) {
    return caption.substring(0, 2190) + '\n...';
  }
  return caption;
}

async function main() {
  console.log('\n📸 Instagram 发布\n');

  // 检查 Instagram 配置
  const enabled = process.env.IG_ENABLED === 'true';
  const username = process.env.IG_USERNAME;
  const password = process.env.IG_PASSWORD;

  if (!enabled) {
    console.log('⚠️  Instagram 发布未启用');
    console.log('   请在 .env 文件中设置:');
    console.log('   IG_ENABLED=true');
    console.log('   IG_USERNAME=your_username');
    console.log('   IG_PASSWORD=your_password');
    process.exit(0);
  }

  if (!username || !password) {
    console.log('❌ Instagram 凭据未配置');
    console.log('   请设置 IG_USERNAME 和 IG_PASSWORD');
    process.exit(1);
  }

  // 检查 Python 依赖
  if (!checkPythonDep('instagrapi')) {
    console.log('❌ Python 依赖 instagrapi 未安装');
    console.log('   请运行: pip install instagrapi');
    process.exit(1);
  }

  // 确定目标日期
  const dateArg = process.argv[2];
  const targetDate = dateArg || new Date().toISOString().split('T')[0];

  const outputDir = path.resolve(process.cwd(), 'output');
  const briefingPath = path.join(outputDir, `ai-briefing-${targetDate}.md`);
  const infographicPath = path.join(outputDir, `ai-briefing-${targetDate}-infographic.png`);
  const slidesPath = path.join(outputDir, `ai-briefing-${targetDate}-slide-deck.pdf`);

  // 定位 Python 脚本目录
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const pyScriptsDir = fs.existsSync(path.resolve(__dirname, 'post-instagram.py'))
    ? __dirname
    : path.resolve(process.cwd(), 'src/scripts');
  const postScript = path.join(pyScriptsDir, 'post-instagram.py');

  const igEnv = { ...process.env, IG_USERNAME: username, IG_PASSWORD: password };

  console.log(`👤 账号: ${username}`);
  console.log(`📅 日期: ${targetDate}\n`);

  let hasAnyPost = false;

  // 1. 发布信息图（单张图片）
  if (fs.existsSync(infographicPath)) {
    console.log('┌──────────────────────────────────────────────────────────────┐');
    console.log('│ 🖼️  [1/2] 发布信息图                                         │');
    console.log('└──────────────────────────────────────────────────────────────┘');

    const caption = generateCaption(briefingPath, targetDate);
    console.log(`   文件: ${path.basename(infographicPath)}`);
    console.log(`   Caption: ${caption.length} 字符\n`);

    const result = spawnSync('python3', [postScript, 'photo', infographicPath, caption], {
      stdio: 'inherit',
      env: igEnv,
      timeout: 120000,
    });

    if (result.status === 0) {
      console.log('\n   ✅ 信息图发布成功\n');
      hasAnyPost = true;
    } else {
      console.log('\n   ⚠️  信息图发布失败，继续处理...\n');
    }
  } else {
    console.log(`⏭️  未找到信息图，跳过: ${path.basename(infographicPath)}\n`);
  }

  // 发布间隔，避免 Instagram 限流
  if (hasAnyPost && fs.existsSync(slidesPath)) {
    console.log('⏳ 等待 10 秒避免 Instagram 限流...\n');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // 2. 发布幻灯片（PDF → 图片 → 相册）
  if (fs.existsSync(slidesPath)) {
    console.log('┌──────────────────────────────────────────────────────────────┐');
    console.log('│ 📑 [2/2] 发布幻灯片（相册模式）                               │');
    console.log('└──────────────────────────────────────────────────────────────┘');

    // 检查 pdf2image 依赖
    if (!checkPythonDep('pdf2image')) {
      console.log('   ⚠️  Python 依赖 pdf2image 未安装，跳过幻灯片');
      console.log('   请运行: pip install pdf2image');
      console.log('   macOS 还需要: brew install poppler\n');
    } else {
      // PDF 切分为图片
      console.log(`   📄 PDF: ${path.basename(slidesPath)}`);
      console.log('   ⏳ 切分 PDF 为图片 (150 DPI)...\n');

      const slideImagesDir = convertPdfToImages(slidesPath, pyScriptsDir);

      if (slideImagesDir) {
        const slideCaption = `📑 AI Industry Slide Deck\n📅 ${targetDate}\n\n#AI #Finance #StockMarket #Investing #DailyBriefing`;

        console.log(`\n   📤 发布相册到 Instagram...\n`);

        const result = spawnSync('python3', [postScript, 'album', slideImagesDir, slideCaption], {
          stdio: 'inherit',
          env: igEnv,
          timeout: 180000,
        });

        if (result.status === 0) {
          console.log('\n   ✅ 幻灯片相册发布成功\n');
          hasAnyPost = true;
        } else {
          console.log('\n   ⚠️  幻灯片发布失败\n');
        }
      } else {
        console.log('   ❌ PDF 切分失败，跳过幻灯片发布\n');
      }
    }
  } else {
    console.log(`⏭️  未找到幻灯片，跳过: ${path.basename(slidesPath)}\n`);
  }

  if (!hasAnyPost) {
    console.error('❌ 没有任何内容可发布');
    console.error(`   请确保 output/ 目录下存在 ${targetDate} 的信息图或幻灯片文件`);
    process.exit(1);
  }

  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║         📸 Instagram 发布完成！                                     ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
}

main().catch(console.error);
