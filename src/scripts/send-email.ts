/**
 * 发送已生成的简报邮件
 *
 * 用法：
 *   npm run send-email          # 发送当天简报
 *   npm run send-email 2026-01-25  # 发送指定日期简报
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendBriefingEmail, getEmailConfig } from '../services/email';

dotenv.config();

async function main() {
  const args = process.argv.slice(2);
  const targetDate = args[0] || new Date().toISOString().split('T')[0];

  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║         📧 简报邮件发送工具                                          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  // 检查邮件配置
  const emailConfig = getEmailConfig();
  if (!emailConfig.enabled) {
    console.error('❌ 邮件发送未启用');
    console.error('   请在 .env 中设置 EMAIL_ENABLED=true');
    process.exit(1);
  }

  if (!emailConfig.smtp.pass || emailConfig.smtp.pass === '你的16位AppPassword') {
    console.error('❌ 邮件密码未配置');
    console.error('   请在 .env 中设置 EMAIL_SMTP_PASS');
    process.exit(1);
  }

  // 查找简报文件
  const outputDir = path.resolve(process.cwd(), 'output');
  const briefingPath = path.join(outputDir, `ai-briefing-${targetDate}.md`);

  if (!fs.existsSync(briefingPath)) {
    console.error(`❌ 未找到简报文件: ai-briefing-${targetDate}.md`);

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
          console.log(`   npm run send-email ${date}`);
        });
      }
    }
    process.exit(1);
  }

  console.log(`📄 简报文件: ai-briefing-${targetDate}.md`);
  console.log(`📧 收件人: ${emailConfig.to}`);

  // 查找对应的 infographic 文件
  const infographicPath = path.join(outputDir, `ai-briefing-${targetDate}-infographic.png`);
  const hasInfographic = fs.existsSync(infographicPath);

  if (hasInfographic) {
    console.log(`🖼️  Infographic: ai-briefing-${targetDate}-infographic.png`);
  } else {
    console.log(`ℹ️  无 Infographic 文件`);
  }
  console.log('');

  // 发送邮件（带 infographic，如果存在）
  const success = await sendBriefingEmail(briefingPath, hasInfographic ? infographicPath : undefined);

  if (!success) {
    process.exit(1);
  }
}

main().catch(console.error);
