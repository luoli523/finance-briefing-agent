import * as fs from 'fs';
import * as path from 'path';
import { ComprehensiveAnalysis } from '../analyzers/types';
import { MarkdownGenerator } from './markdown';
import { HtmlGenerator } from './html';
import { GeneratedBriefing, GeneratorConfig, OutputFormat } from './types';

/**
 * 统一简报生成器
 * 支持多种输出格式
 */
export class UnifiedGenerator {
  private markdownGenerator: MarkdownGenerator;
  private htmlGenerator: HtmlGenerator;
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig = {}) {
    this.config = config;
    this.markdownGenerator = new MarkdownGenerator(config);
    this.htmlGenerator = new HtmlGenerator(config);
  }

  /**
   * 生成指定格式的简报
   */
  async generate(
    analysis: ComprehensiveAnalysis,
    format: OutputFormat = 'markdown'
  ): Promise<GeneratedBriefing> {
    switch (format) {
      case 'html':
        return this.htmlGenerator.generate(analysis);
      case 'markdown':
      default:
        return this.markdownGenerator.generate(analysis);
    }
  }

  /**
   * 生成所有格式的简报
   */
  async generateAll(analysis: ComprehensiveAnalysis): Promise<{
    markdown: GeneratedBriefing;
    html: GeneratedBriefing;
  }> {
    console.log('[unified-generator] Generating all formats...');

    const [markdown, html] = await Promise.all([
      this.markdownGenerator.generate(analysis),
      this.htmlGenerator.generate(analysis),
    ]);

    return { markdown, html };
  }

  /**
   * 生成并保存简报
   */
  async generateAndSave(
    analysis: ComprehensiveAnalysis,
    format: OutputFormat = 'markdown'
  ): Promise<string> {
    const briefing = await this.generate(analysis, format);

    const generator = format === 'html' ? this.htmlGenerator : this.markdownGenerator;
    return generator.save(briefing);
  }

  /**
   * 生成并保存所有格式
   */
  async generateAndSaveAll(analysis: ComprehensiveAnalysis): Promise<{
    markdown: string;
    html: string;
  }> {
    const briefings = await this.generateAll(analysis);

    const [markdownPath, htmlPath] = await Promise.all([
      this.markdownGenerator.save(briefings.markdown),
      this.htmlGenerator.save(briefings.html),
    ]);

    return {
      markdown: markdownPath,
      html: htmlPath,
    };
  }

  /**
   * 从分析文件生成简报
   */
  async generateFromAnalysisFile(
    filepath: string,
    format: OutputFormat = 'markdown'
  ): Promise<GeneratedBriefing> {
    const content = await fs.promises.readFile(filepath, 'utf-8');
    const analysis = JSON.parse(content) as ComprehensiveAnalysis;
    return this.generate(analysis, format);
  }

  /**
   * 从最新分析文件生成简报
   */
  async generateFromLatestAnalysis(
    format: OutputFormat = 'markdown'
  ): Promise<GeneratedBriefing> {
    const processedDir = path.resolve(process.cwd(), 'data/processed');
    const files = await fs.promises.readdir(processedDir);

    // 查找最新的 analysis 文件
    const analysisFiles = files
      .filter(f => f.startsWith('analysis-') && f.endsWith('.json'))
      .sort()
      .reverse();

    if (analysisFiles.length === 0) {
      throw new Error('No analysis file found. Run "npm run analyze" first.');
    }

    const latestFile = path.join(processedDir, analysisFiles[0]);
    console.log(`[unified-generator] Loading analysis: ${analysisFiles[0]}`);

    return this.generateFromAnalysisFile(latestFile, format);
  }
}

// 导出默认实例
export const unifiedGenerator = new UnifiedGenerator();
