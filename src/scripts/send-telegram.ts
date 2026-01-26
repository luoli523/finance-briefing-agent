/**
 * 发送简报到 Telegram
 * 
 * 使用方式:
 *   npm run send-telegram              # 发送当天简报
 *   npm run send-telegram 2026-01-25   # 发送指定日期简报
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { sendBriefingTelegram, getTelegramConfig } from '../services/telegram';

dotenv.config();

async function main() {
  console.log('\n📱 Telegram 简报发送\n');

  // 获取配置
  const config = getTelegramConfig();
  
  if (!config.enabled) {
    console.log('⚠️  Telegram 发送未启用');
    console.log('   请在 .env 文件中设置:');
    console.log('   TELEGRAM_ENABLED=true');
    console.log('   TELEGRAM_BOT_TOKEN=your_bot_token');
    console.log('   TELEGRAM_CHAT_ID=your_chat_id');
    console.log('\n   详见 README.md 中的 Telegram 配置说明');
    process.exit(0);
  }

  // 确定要发送的日期
  const dateArg = process.argv[2];
  const targetDate = dateArg || new Date().toISOString().split('T')[0];
  
  // 查找简报文件
  const outputDir = path.resolve(process.cwd(), 'output');
  const briefingPath = path.join(outputDir, `ai-briefing-${targetDate}.md`);

  if (!fs.existsSync(briefingPath)) {
    console.error(`❌ 未找到 ${targetDate} 的简报文件`);
    console.error(`   期望路径: ${briefingPath}`);
    console.error('\n   请先运行 npm run daily 生成简报');
    process.exit(1);
  }

  console.log(`📄 简报文件: ${briefingPath}`);
  console.log(`📱 Chat ID: ${config.chatId}\n`);

  // 发送
  const success = await sendBriefingTelegram(briefingPath);
  
  if (!success) {
    process.exit(1);
  }
}

main().catch(console.error);
