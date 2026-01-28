/**
 * 邮件发送服务
 * 用于将生成的简报自动发送到指定邮箱
 */

import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';

export interface EmailConfig {
  enabled: boolean;
  to: string;
  from: string;
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
  };
}

export interface EmailAttachment {
  filename: string;
  path?: string;
  content?: string | Buffer;
  contentType?: string;
  cid?: string; // Content-ID for inline images
}

export function getEmailConfig(): EmailConfig {
  return {
    enabled: process.env.EMAIL_ENABLED === 'true',
    to: process.env.EMAIL_TO || '',
    from: process.env.EMAIL_FROM || '',
    smtp: {
      host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_SMTP_PORT || '587', 10),
      user: process.env.EMAIL_SMTP_USER || '',
      pass: process.env.EMAIL_SMTP_PASS || '',
    },
  };
}

/**
 * 发送简报邮件
 * @param briefingPath 简报文件路径
 * @param infographicPath 可选的 infographic 图片路径
 * @param slidesPath 可选的 slides PDF 路径
 * @returns 是否发送成功
 */
export async function sendBriefingEmail(briefingPath: string, infographicPath?: string, slidesPath?: string): Promise<boolean> {
  const config = getEmailConfig();

  if (!config.enabled) {
    console.log('📧 邮件发送未启用（设置 EMAIL_ENABLED=true 启用）');
    return false;
  }

  if (!config.to || !config.smtp.user || !config.smtp.pass) {
    console.error('❌ 邮件配置不完整，请检查 EMAIL_TO, EMAIL_SMTP_USER, EMAIL_SMTP_PASS');
    return false;
  }

  if (!fs.existsSync(briefingPath)) {
    console.error(`❌ 简报文件不存在: ${briefingPath}`);
    return false;
  }

  try {
    // 读取简报内容
    const briefingContent = fs.readFileSync(briefingPath, 'utf-8');
    const today = new Date().toISOString().split('T')[0];
    const fileName = path.basename(briefingPath);

    // 创建 SMTP 传输器
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465, // 465 使用 SSL，其他端口使用 STARTTLS
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    // 验证连接配置
    await transporter.verify();
    console.log('✅ SMTP 连接验证成功');

    // 将 Markdown 转换为 HTML
    const htmlContent = await markdownToHtml(briefingContent);

    // 准备附件
    const attachments: any[] = [
      {
        filename: fileName,
        content: briefingContent,
        contentType: 'text/markdown',
      },
    ];

    // 添加 Infographic 图片附件（如果存在）
    let hasInfographic = false;
    if (infographicPath && fs.existsSync(infographicPath)) {
      const infographicFileName = path.basename(infographicPath);
      attachments.push({
        filename: infographicFileName,
        path: infographicPath,
        contentType: 'image/png',
        cid: 'infographic', // Content-ID for inline display
      });
      hasInfographic = true;
      console.log(`   📷 附加 Infographic: ${infographicFileName}`);
    }

    // 添加 Slides PDF 附件（如果存在）
    let hasSlides = false;
    if (slidesPath && fs.existsSync(slidesPath)) {
      const slidesFileName = path.basename(slidesPath);
      attachments.push({
        filename: slidesFileName,
        path: slidesPath,
        contentType: 'application/pdf',
      });
      hasSlides = true;
      console.log(`   📑 附加 Slides: ${slidesFileName}`);
    }

    // 如果有 infographic，在 HTML 中添加内联图片
    let finalHtmlContent = htmlContent;
    if (hasInfographic) {
      // 在 HTML 开头添加 infographic 预览
      const infographicHtml = `
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px;">
          <h2 style="color: white; margin-bottom: 15px;">📊 今日简报信息图</h2>
          <img src="cid:infographic" alt="AI投资简报信息图" style="max-width: 100%; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);" />
        </div>
      `;
      finalHtmlContent = htmlContent.replace('<div class="container">', `<div class="container">\n${infographicHtml}`);
    }

    // 发送邮件
    const info = await transporter.sendMail({
      from: `"AI投资简报" <${config.from || config.smtp.user}>`,
      to: config.to,
      subject: `📊 AI Industry 每日简报 - ${today}${hasInfographic || hasSlides ? ' [含' + (hasInfographic ? '信息图' : '') + (hasInfographic && hasSlides ? '+' : '') + (hasSlides ? 'Slides' : '') + ']' : ''}`,
      text: briefingContent, // 纯文本版本
      html: finalHtmlContent, // HTML 版本
      attachments,
    });

    console.log(`\n╔══════════════════════════════════════════════════════════════════════╗`);
    console.log(`║         📧 简报邮件发送成功！                                        ║`);
    console.log(`╚══════════════════════════════════════════════════════════════════════╝`);
    console.log(`   收件人: ${config.to}`);
    console.log(`   消息ID: ${info.messageId}`);

    return true;
  } catch (error: any) {
    console.error(`\n❌ 邮件发送失败: ${error.message}`);
    if (error.code === 'EAUTH') {
      console.error('   提示: 请检查 SMTP 用户名和密码是否正确');
      console.error('   如果使用 Gmail，请确保使用 App Password 而非登录密码');
    }
    return false;
  }
}

/**
 * 使用 marked 将 Markdown 转换为 HTML
 */
async function markdownToHtml(markdown: string): Promise<string> {
  // 配置 marked
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // 换行符转为 <br>
  });

  // 解析 markdown
  const htmlBody = await marked.parse(markdown);

  // 包装完整的 HTML 文档
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Industry 每日简报</title>
  <style>
    /* 基础样式 */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.8;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 30px 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* 标题样式 */
    h1 {
      color: #1a1a1a;
      font-size: 28px;
      font-weight: 600;
      border-bottom: 3px solid #3498db;
      padding-bottom: 12px;
      margin-top: 0;
      margin-bottom: 24px;
    }

    h2 {
      color: #2c3e50;
      font-size: 22px;
      font-weight: 600;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 10px;
      margin-top: 32px;
      margin-bottom: 16px;
    }

    h3 {
      color: #34495e;
      font-size: 18px;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 12px;
    }

    h4 {
      color: #7f8c8d;
      font-size: 16px;
      font-weight: 600;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    /* 段落和文本 */
    p {
      margin: 12px 0;
      text-align: justify;
    }

    strong {
      color: #2c3e50;
      font-weight: 600;
    }

    em {
      color: #7f8c8d;
    }

    /* 表格样式 - 专业金融报告风格 */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
      border: 1px solid #ddd;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    thead {
      background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    }

    th {
      color: #ffffff;
      font-weight: 600;
      padding: 12px 15px;
      text-align: left;
      border: 1px solid #3498db;
      white-space: nowrap;
    }

    td {
      padding: 10px 15px;
      border: 1px solid #ddd;
      vertical-align: top;
    }

    tbody tr:nth-child(even) {
      background-color: #f8f9fa;
    }

    tbody tr:hover {
      background-color: #eef2f7;
    }

    /* 涨跌颜色 */
    td:contains('+'), td:contains('🟢'), td:contains('🔴') {
      font-weight: 500;
    }

    /* 列表样式 */
    ul, ol {
      margin: 16px 0;
      padding-left: 24px;
    }

    li {
      margin: 8px 0;
      line-height: 1.7;
    }

    li > ul, li > ol {
      margin: 8px 0;
    }

    /* 引用块 */
    blockquote {
      margin: 16px 0;
      padding: 12px 20px;
      border-left: 4px solid #3498db;
      background-color: #f8f9fa;
      color: #555;
    }

    blockquote p {
      margin: 0;
    }

    /* 代码样式 */
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
      font-size: 13px;
      color: #e74c3c;
    }

    pre {
      background-color: #2c3e50;
      color: #ecf0f1;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
    }

    pre code {
      background: none;
      padding: 0;
      color: inherit;
    }

    /* 分隔线 */
    hr {
      border: none;
      border-top: 2px solid #ecf0f1;
      margin: 32px 0;
    }

    /* 链接 */
    a {
      color: #3498db;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* 页脚 */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
      color: #95a5a6;
      font-size: 13px;
      text-align: center;
    }

    /* 响应式 */
    @media screen and (max-width: 600px) {
      .container {
        padding: 20px;
      }

      table {
        font-size: 12px;
      }

      th, td {
        padding: 8px 10px;
      }

      h1 { font-size: 24px; }
      h2 { font-size: 20px; }
      h3 { font-size: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    ${htmlBody}
    <div class="footer">
      <p>本简报由 AI Industry 每日简报系统自动生成</p>
      <p>数据仅供参考，不构成投资建议</p>
    </div>
  </div>
</body>
</html>`;
}
