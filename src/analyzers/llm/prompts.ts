/**
 * LLM 深度分析提示词模板
 * 
 * 支持从文件加载自定义 prompt，提供灵活的分析侧重点调整
 */

import { IntelligentAnalysis } from '../intelligent';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 获取 prompt 文件路径
 */
function getPromptPath(filename: string): string {
  // 使用 process.cwd() 而不是 __dirname，因为编译后的代码在 dist 目录
  const projectRoot = process.cwd();
  
  // 优先使用自定义 prompt（如果启用）
  const useCustom = process.env.LLM_CUSTOM_PROMPTS === 'true';
  if (useCustom) {
    const customPath = path.join(projectRoot, 'prompts/custom', filename);
    if (fs.existsSync(customPath)) {
      console.log(`📝 使用自定义 prompt: prompts/custom/${filename}`);
      return customPath;
    }
  }
  
  // 使用默认 prompt
  const defaultPath = path.join(projectRoot, 'prompts', filename);
  if (fs.existsSync(defaultPath)) {
    return defaultPath;
  }
  
  throw new Error(`Prompt 文件不存在: ${filename} (尝试路径: ${defaultPath})`);
}

/**
 * 从文件加载 prompt
 */
function loadPrompt(filename: string): string {
  try {
    const filePath = getPromptPath(filename);
    return fs.readFileSync(filePath, 'utf-8').trim();
  } catch (error) {
    console.warn(`⚠️ 无法加载 prompt 文件 ${filename}，使用默认值`);
    return '';
  }
}

/**
 * 系统提示词（从文件加载）
 */
export function getSystemPrompt(): string {
  const basePrompt = loadPrompt('system-prompt.txt');
  if (!basePrompt) {
    // 回退到默认值
    return `你是一位资深的金融分析师和投资顾问，拥有 20+ 年的全球市场分析经验。你的专长包括：

1. **宏观经济分析**: 深刻理解全球经济周期、货币政策、财政政策对市场的影响
2. **行业深度研究**: 尤其擅长 AI、半导体、数据中心、能源等科技领域
3. **地缘政治洞察**: 能够准确评估地缘事件对资本市场的影响
4. **投资策略制定**: 提供可执行的、风险可控的投资建议

你的分析特点：
- 基于数据和事实，避免主观臆断
- 多维度交叉验证，识别关键关联
- 平衡乐观与谨慎，重视风险管理
- 提供可操作的具体建议，而非模糊概念
- 区分短期波动与长期趋势

请基于提供的规则引擎分析结果，进行更深层次的洞察分析。`;
  }
  
  // 添加当前日期
  const currentDate = new Date().toISOString().split('T')[0];
  return `${basePrompt}\n\n当前日期: ${currentDate}`;
}

/**
 * 获取分析任务 prompt
 */
function getAnalysisTaskPrompt(): string {
  const taskPrompt = loadPrompt('analysis-task.txt');
  if (!taskPrompt) {
    // 回退到默认值（返回原始的详细格式）
    return `基于以上规则引擎的分析结果，请提供更深层次的洞察和建议...`;
  }
  return taskPrompt;
}

/**
 * 已废弃：直接使用 SYSTEM_PROMPT 常量（保留用于向后兼容）
 */
export const SYSTEM_PROMPT = getSystemPrompt();

/**
 * 生成用户提示词（包含规则引擎分析结果 + 分析任务）
 */
export function generateAnalysisPrompt(analysis: IntelligentAnalysis): string {
  const analysisData = `# 规则引擎分析结果

## 市场概览
- 市场状态: ${analysis.summary.marketCondition}
- 整体情绪: ${analysis.summary.overallSentiment}
- 市场展望: ${analysis.summary.outlook}

## 多维度分析

### 宏观经济
${JSON.stringify(analysis.dimensions.macroEconomic, null, 2)}

### 财政货币政策 (Fed)
${JSON.stringify(analysis.dimensions.monetaryPolicy, null, 2)}

### 地缘政治
${JSON.stringify(analysis.dimensions.geopolitical, null, 2)}

### 政策监管
${JSON.stringify(analysis.dimensions.regulatory, null, 2)}

## 行业深度分析

### AI 人工智能
${JSON.stringify(analysis.dimensions.sectorDeepDive.ai, null, 2)}

### 半导体
${JSON.stringify(analysis.dimensions.sectorDeepDive.semiconductor, null, 2)}

### 数据中心
${JSON.stringify(analysis.dimensions.sectorDeepDive.dataCenter, null, 2)}

### 能源
${JSON.stringify(analysis.dimensions.sectorDeepDive.energy, null, 2)}

## 跨领域关联洞察
${JSON.stringify(analysis.crossDomainInsights, null, 2)}

## 投资建议 (规则引擎)
${JSON.stringify(analysis.investmentImplications, null, 2)}

## 关键催化剂
${JSON.stringify(analysis.catalysts, null, 2)}

---

`;
  
  // 从文件加载分析任务 prompt
  const taskPrompt = getAnalysisTaskPrompt();
  
  return `${analysisData}\n${taskPrompt}`;
}

/**
 * 简化版提示词（更快，成本更低）
 */
export function generateSimplifiedPrompt(analysis: IntelligentAnalysis): string {
  return `基于以下市场分析结果，提供 3-5 个最重要的深度洞察和投资建议：

市场状态: ${analysis.summary.marketCondition}
整体情绪: ${analysis.summary.overallSentiment}

关键要点:
${analysis.summary.keyPoints.join('\n')}

风险关注:
${analysis.summary.risksAndConcerns.join('\n')}

请以 JSON 格式输出：
{
  "keyInsights": ["洞察1", "洞察2", "洞察3"],
  "actionableAdvice": ["建议1", "建议2", "建议3"]
}`;
}
