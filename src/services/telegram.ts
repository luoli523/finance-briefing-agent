/**
 * Telegram 发送服务
 * 使用 Telegram Bot API 发送简报摘要
 * 
 * 设置步骤：
 * 1. 在 Telegram 中搜索 @BotFather
 * 2. 发送 /newbot 创建新 Bot
 * 3. 获取 Bot Token
 * 4. 获取你的 Chat ID（可以发送消息给 @userinfobot）
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

export function getTelegramConfig(): TelegramConfig {
  return {
    enabled: process.env.TELEGRAM_ENABLED === 'true',
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  };
}

/**
 * 从简报中提取摘要（适合 Telegram 阅读，使用纯文本格式）
 */
function extractBriefingSummary(briefingContent: string): string {
  const summary: string[] = [];
  
  // 添加标题
  const dateMatch = briefingContent.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
  summary.push('AI Industry Daily Briefing');
  summary.push(date);
  summary.push('');
  
  // 从表格中提取股票数据
  const tableRows = briefingContent.match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g);
  
  if (tableRows) {
    const stocks: { ticker: string; change: number; changeStr: string }[] = [];
    
    for (const row of tableRows) {
      // 匹配: | 分类 | 公司 | TICKER | $价格 | +/-X.XX% | 表现 |
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
    
    // 排序获取涨跌幅榜
    const gainers = stocks.filter(s => s.change > 0).sort((a, b) => b.change - a.change).slice(0, 5);
    const losers = stocks.filter(s => s.change < 0).sort((a, b) => a.change - b.change).slice(0, 5);
    
    if (gainers.length > 0) {
      summary.push('Top Gainers');
      gainers.forEach((s, i) => {
        summary.push((i + 1) + '. ' + s.ticker + ': ' + s.changeStr);
      });
      summary.push('');
    }
    
    if (losers.length > 0) {
      summary.push('Top Losers');
      losers.forEach((s, i) => {
        summary.push((i + 1) + '. ' + s.ticker + ': ' + s.changeStr);
      });
      summary.push('');
    }
  }
  
  // 添加提示
  summary.push('Full report sent via email');
  
  return summary.join('\n');
}

/**
 * 发送简报到 Telegram
 * @param briefingPath 简报文件路径
 * @returns 是否发送成功
 */
export async function sendBriefingTelegram(briefingPath: string): Promise<boolean> {
  const config = getTelegramConfig();

  if (!config.enabled) {
    console.log('📱 Telegram 发送未启用（设置 TELEGRAM_ENABLED=true 启用）');
    return false;
  }

  if (!config.botToken) {
    console.error('❌ Telegram Bot Token 未配置，请设置 TELEGRAM_BOT_TOKEN');
    return false;
  }

  if (!config.chatId) {
    console.error('❌ Telegram Chat ID 未配置，请设置 TELEGRAM_CHAT_ID');
    return false;
  }

  if (!fs.existsSync(briefingPath)) {
    console.error(`❌ 简报文件不存在: ${briefingPath}`);
    return false;
  }

  try {
    // 读取简报内容
    const briefingContent = fs.readFileSync(briefingPath, 'utf-8');
    
    // 提取摘要
    const summary = extractBriefingSummary(briefingContent);
    
    // 发送消息
    const apiUrl = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: summary,
        disable_web_page_preview: true,
      }),
    });

    const result = await response.json() as any;

    if (!result.ok) {
      throw new Error(result.description || 'Telegram API error');
    }

    console.log(`\n╔══════════════════════════════════════════════════════════════════════╗`);
    console.log(`║         📱 Telegram 简报发送成功！                                   ║`);
    console.log(`╚══════════════════════════════════════════════════════════════════════╝`);
    console.log(`   Chat ID: ${config.chatId}`);
    console.log(`   消息 ID: ${result.result.message_id}`);

    return true;
  } catch (error: any) {
    console.error(`\n❌ Telegram 发送失败: ${error.message}`);
    if (error.message.includes('chat not found')) {
      console.error('   提示: 请确保 Chat ID 正确，且已向 Bot 发送过消息');
    } else if (error.message.includes('Unauthorized')) {
      console.error('   提示: Bot Token 无效，请检查 TELEGRAM_BOT_TOKEN');
    }
    return false;
  }
}

/**
 * 发送简单文本消息到 Telegram
 * @param message 消息内容
 * @returns 是否发送成功
 */
export async function sendTelegramMessage(message: string): Promise<boolean> {
  const config = getTelegramConfig();

  if (!config.enabled || !config.botToken || !config.chatId) {
    return false;
  }

  try {
    const apiUrl = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
      }),
    });

    const result = await response.json() as any;
    return result.ok;
  } catch (error) {
    return false;
  }
}

/**
 * 发送简报文件到 Telegram
 * @param briefingPath 简报文件路径
 * @returns 是否发送成功
 */
export async function sendBriefingDocument(briefingPath: string): Promise<boolean> {
  const config = getTelegramConfig();

  if (!config.enabled || !config.botToken || !config.chatId) {
    return false;
  }

  if (!fs.existsSync(briefingPath)) {
    return false;
  }

  try {
    const fileContent = fs.readFileSync(briefingPath);
    const fileName = path.basename(briefingPath);
    
    const formData = new FormData();
    formData.append('chat_id', config.chatId);
    formData.append('document', new Blob([fileContent]), fileName);
    formData.append('caption', '📊 AI Industry 每日简报');

    const apiUrl = `https://api.telegram.org/bot${config.botToken}/sendDocument`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json() as any;
    return result.ok;
  } catch (error) {
    return false;
  }
}
