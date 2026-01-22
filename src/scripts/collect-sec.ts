#!/usr/bin/env tsx

/**
 * SEC EDGAR 数据收集脚本
 * 收集公司的 SEC filings (8-K, 10-K, 10-Q, 等)
 */

import { createSECCollector } from '../collectors';
import { getStockSymbols } from '../config';

// 使用中央配置的股票列表（不包括指数，因为指数不在 SEC 中）
// 所有监控的股票都在 src/config/index.ts 的 MONITORED_SYMBOLS 中定义
const DEFAULT_SYMBOLS = getStockSymbols();

// 要监控的 filing 类型
const IMPORTANT_FORMS = [
  '8-K',    // 重大事件报告
  '10-K',   // 年度报告
  '10-Q',   // 季度报告
  '4',      // 内部人交易
  'S-1',    // IPO 注册
];

async function main() {
  console.log('============================================================');
  console.log('Finance Briefing Agent - SEC EDGAR Collector');
  console.log('============================================================\n');

  try {
    // 从环境变量读取配置
    const userAgent = process.env.SEC_USER_AGENT || 'FinanceBriefingAgent contact@example.com';
    const symbols = process.env.SEC_SYMBOLS?.split(',') || DEFAULT_SYMBOLS;
    const forms = process.env.SEC_FORMS?.split(',') || IMPORTANT_FORMS;
    const daysBack = parseInt(process.env.SEC_DAYS_BACK || '7');

    console.log(`📊 Configuration:`);
    console.log(`   - Symbols: ${symbols.length} companies`);
    console.log(`   - Forms: ${forms.join(', ')}`);
    console.log(`   - Days back: ${daysBack}`);
    console.log(`   - User-Agent: ${userAgent}`);
    console.log();

    // 创建 SEC 收集器
    const collector = createSECCollector({
      userAgent,
      symbols,
      forms,
      daysBack,
      enabled: true,
      saveRaw: true,
      timeout: 30000,
      retries: 3,
    });

    // 收集数据
    const data = await collector.collect();

    console.log('\n============================================================');
    console.log('📋 Collection Summary');
    console.log('============================================================');
    console.log(`  ✅ Total filings: ${data.items.length}`);
    console.log();

    // 按 form 类型分组统计
    const formCounts: Record<string, number> = {};
    data.items.forEach(item => {
      const form = (item.metadata as any).form;
      formCounts[form] = (formCounts[form] || 0) + 1;
    });

    console.log('📊 Filings by Type:');
    Object.entries(formCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([form, count]) => {
        console.log(`   ${form.padEnd(6)} ${count.toString().padStart(3)} filings`);
      });

    // 显示最近的几个 filings
    if (data.items.length > 0) {
      console.log('\n📌 Recent Filings:');
      data.items
        .slice(0, 10)
        .forEach((item, index) => {
          const metadata = item.metadata as any;
          console.log(`\n   ${index + 1}. ${metadata.companyName} (${metadata.symbol})`);
          console.log(`      Form: ${metadata.form} | Date: ${metadata.filingDate}`);
          console.log(`      ${item.content}`);
          console.log(`      ${metadata.url}`);
        });
    }

    console.log('\n============================================================');
    console.log(`✅ SEC EDGAR collection completed successfully!`);
    console.log('============================================================\n');

  } catch (error) {
    console.error('\n❌ Collection failed:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
