/**
 * 生成器类型定义
 */

// 输出格式
export type OutputFormat = 'markdown' | 'html' | 'text';

// 简报模板类型
export type BriefingTemplate = 'daily' | 'weekly' | 'flash';

// 简报段落
export interface BriefingSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

// 生成的简报
export interface GeneratedBriefing {
  title: string;
  date: Date;
  format: OutputFormat;
  template: BriefingTemplate;
  sections: BriefingSection[];
  content: string;          // 完整内容
  metadata: {
    generatedAt: Date;
    dataTimestamp?: Date;
    wordCount: number;
    sectionCount: number;
  };
}

// 生成器配置
export interface GeneratorConfig {
  template?: BriefingTemplate;
  format?: OutputFormat;
  language?: 'zh' | 'en';
  includeDisclaimer?: boolean;
  maxSections?: number;
}

// 简报模板配置
export interface TemplateConfig {
  name: string;
  sections: {
    id: string;
    title: string;
    enabled: boolean;
    order: number;
  }[];
}
