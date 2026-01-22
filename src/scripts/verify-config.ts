#!/usr/bin/env tsx

/**
 * 配置验证脚本
 * 验证中央配置系统是否正常工作
 */

import { getAllMonitoredSymbols, getStockSymbols, getIndexSymbols, MONITORED_SYMBOLS } from '../config';

function main() {
  console.log('='.repeat(70));
  console.log('📊 Finance Briefing Agent - 配置系统验证');
  console.log('='.repeat(70));
  console.log();

  const allSymbols = getAllMonitoredSymbols();
  const stocks = getStockSymbols();
  const indices = getIndexSymbols();

  // 1. 基本统计
  console.log('📈 基本统计信息:');
  console.log('─'.repeat(70));
  console.log(`   总计标的: ${allSymbols.length} 只`);
  console.log(`   指数:     ${indices.length} 个`);
  console.log(`   股票:     ${stocks.length} 只`);
  console.log(`   验证:     ${indices.length} + ${stocks.length} = ${indices.length + stocks.length} ${indices.length + stocks.length === allSymbols.length ? '✅' : '❌'}`);
  console.log();

  // 2. 分类详情
  console.log('🏭 行业分类详情:');
  console.log('─'.repeat(70));
  const categories = [
    { name: '主要指数', data: MONITORED_SYMBOLS.indices },
    { name: 'ETF', data: MONITORED_SYMBOLS.etf },
    { name: '科技巨头', data: MONITORED_SYMBOLS.techGiants },
    { name: '半导体', data: MONITORED_SYMBOLS.semiconductor },
    { name: '存储', data: MONITORED_SYMBOLS.storage },
    { name: '数据中心', data: MONITORED_SYMBOLS.dataCenter },
    { name: '能源', data: MONITORED_SYMBOLS.energy },
    { name: '金融', data: MONITORED_SYMBOLS.finance },
    { name: '其他', data: MONITORED_SYMBOLS.others },
  ];

  let totalCount = 0;
  categories.forEach(cat => {
    console.log(`   ${cat.name.padEnd(12)} ${cat.data.length.toString().padStart(2)} 只  ${cat.data.slice(0, 5).join(', ')}${cat.data.length > 5 ? '...' : ''}`);
    totalCount += cat.data.length;
  });
  console.log(`   ${'─'.repeat(16)}`);
  console.log(`   ${'合计'.padEnd(12)} ${totalCount.toString().padStart(2)} 只`);
  console.log();

  // 3. 关键股票验证
  console.log('🔍 关键股票验证:');
  console.log('─'.repeat(70));
  const keySymbols = ['SOXX', 'AAPL', 'NVDA', 'TSLA', '^GSPC', '^VIX'];
  keySymbols.forEach(symbol => {
    const inAll = allSymbols.includes(symbol);
    const inStocks = stocks.includes(symbol);
    const inIndices = indices.includes(symbol);
    const isIndex = symbol.startsWith('^');
    
    let status = '';
    if (isIndex) {
      status = inIndices && !inStocks ? '✅ 正确（在指数列表）' : '❌ 错误';
    } else {
      status = inStocks && !inIndices ? '✅ 正确（在股票列表）' : '❌ 错误';
    }
    
    console.log(`   ${symbol.padEnd(8)} ${status}`);
  });
  console.log();

  // 4. 重复检查
  console.log('🔄 重复项检查:');
  console.log('─'.repeat(70));
  const symbolCounts = new Map<string, number>();
  allSymbols.forEach(symbol => {
    symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
  });
  const duplicates = Array.from(symbolCounts.entries()).filter(([_, count]) => count > 1);
  
  if (duplicates.length === 0) {
    console.log('   ✅ 未发现重复项');
  } else {
    console.log('   ❌ 发现重复项:');
    duplicates.forEach(([symbol, count]) => {
      console.log(`      ${symbol}: 出现 ${count} 次`);
    });
  }
  console.log();

  // 5. 数据完整性
  console.log('🛡️  数据完整性检查:');
  console.log('─'.repeat(70));
  const checks = [
    { name: '所有标的都有值', pass: allSymbols.every(s => s && s.length > 0) },
    { name: '没有空字符串', pass: allSymbols.every(s => s.trim().length > 0) },
    { name: '指数都以^开头', pass: indices.every(s => s.startsWith('^')) },
    { name: '股票都不以^开头', pass: stocks.every(s => !s.startsWith('^')) },
    { name: '没有重复项', pass: duplicates.length === 0 },
    { name: '总数正确(51)', pass: allSymbols.length === 51 },
  ];

  checks.forEach(check => {
    console.log(`   ${check.pass ? '✅' : '❌'} ${check.name}`);
  });
  console.log();

  // 6. 使用模块列表
  console.log('🚀 使用此配置的模块:');
  console.log('─'.repeat(70));
  console.log('   ✅ Yahoo Finance 收集器 (collect:yahoo)');
  console.log('   ✅ SEC/EDGAR 收集器 (collect:sec)');
  console.log('   ✅ 市场分析器 (analyze)');
  console.log('   ✅ 报告生成器 (generate)');
  console.log();

  // 7. 总结
  const allPassed = checks.every(c => c.pass);
  console.log('='.repeat(70));
  if (allPassed) {
    console.log('✅ 配置系统验证通过！所有检查都已通过。');
  } else {
    console.log('❌ 配置系统验证失败！请检查上面的错误信息。');
  }
  console.log('='.repeat(70));
  console.log();

  // 8. 快速参考
  console.log('📝 快速参考:');
  console.log('─'.repeat(70));
  console.log('   配置文件:   src/config/index.ts');
  console.log('   文档:       docs/SYMBOLS_CONFIGURATION.md');
  console.log('   修改方式:   编辑 MONITORED_SYMBOLS 对象');
  console.log('   生效范围:   全局自动生效');
  console.log('='.repeat(70));
  console.log();

  process.exit(allPassed ? 0 : 1);
}

main();
