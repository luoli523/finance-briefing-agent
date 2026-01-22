/**
 * 决策导向 HTML 生成器
 * 将决策导向报告转换为精美的 HTML 格式
 */

import * as fs from 'fs';
import * as path from 'path';

export class DecisionOrientedHtmlGenerator {
  /**
   * 将 Markdown 报告转换为 HTML
   */
  async generateFromMarkdown(markdownPath: string, outputPath: string): Promise<void> {
    const markdown = fs.readFileSync(markdownPath, 'utf-8');
    const html = this.convertToHtml(markdown);
    fs.writeFileSync(outputPath, html, 'utf-8');
  }

  /**
   * 转换 Markdown 到 HTML
   */
  private convertToHtml(markdown: string): string {
    const lines = markdown.split('\n');
    let html = this.getHtmlHeader();
    let inCodeBlock = false;
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // 代码块
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          html += '<pre><code>';
          inCodeBlock = true;
        } else {
          html += '</code></pre>\n';
          inCodeBlock = false;
        }
        continue;
      }

      if (inCodeBlock) {
        html += this.escapeHtml(line) + '\n';
        continue;
      }

      // 标题
      if (line.startsWith('# ')) {
        html += `<h1>${this.parseInline(line.substring(2))}</h1>\n`;
      } else if (line.startsWith('## ')) {
        html += `<h2>${this.parseInline(line.substring(3))}</h2>\n`;
      } else if (line.startsWith('### ')) {
        html += `<h3>${this.parseInline(line.substring(4))}</h3>\n`;
      } else if (line.startsWith('#### ')) {
        html += `<h4>${this.parseInline(line.substring(5))}</h4>\n`;
      }
      // 水平线
      else if (line.trim() === '---') {
        html += '<hr>\n';
      }
      // 列表
      else if (line.match(/^-\s+/)) {
        if (!inList) {
          html += '<ul>\n';
          inList = true;
        }
        html += `<li>${this.parseInline(line.substring(2))}</li>\n`;
      } else if (line.match(/^\d+\.\s+/)) {
        if (!inList) {
          html += '<ol>\n';
          inList = true;
        }
        const content = line.replace(/^\d+\.\s+/, '');
        html += `<li>${this.parseInline(content)}</li>\n`;
      } else {
        if (inList) {
          html += '</ul>\n';
          inList = false;
        }
        // 普通段落
        if (line.trim()) {
          html += `<p>${this.parseInline(line)}</p>\n`;
        } else {
          html += '\n';
        }
      }
    }

    if (inList) {
      html += '</ul>\n';
    }

    html += this.getHtmlFooter();
    return html;
  }

  /**
   * 解析行内元素（粗体、斜体、代码等）
   */
  private parseInline(text: string): string {
    // 粗体
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // 斜体
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // 行内代码
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // 链接
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    return text;
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * HTML 头部
   */
  private getHtmlHeader(): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>投资决策简报</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }

        .content {
            padding: 30px;
        }

        h1 {
            color: #667eea;
            font-size: 2em;
            margin: 30px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }

        h2 {
            color: #764ba2;
            font-size: 1.8em;
            margin: 25px 0 15px 0;
            padding-left: 15px;
            border-left: 5px solid #764ba2;
        }

        h3 {
            color: #555;
            font-size: 1.4em;
            margin: 20px 0 10px 0;
        }

        h4 {
            color: #666;
            font-size: 1.2em;
            margin: 15px 0 10px 0;
        }

        p {
            margin: 10px 0;
            line-height: 1.8;
        }

        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }

        li {
            margin: 8px 0;
            line-height: 1.6;
        }

        hr {
            border: none;
            border-top: 2px solid #eee;
            margin: 30px 0;
        }

        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: "Courier New", monospace;
            font-size: 0.9em;
        }

        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
        }

        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }

        strong {
            color: #667eea;
            font-weight: 600;
        }

        /* 特殊样式 */
        .green { color: #10b981; }
        .red { color: #ef4444; }
        .yellow { color: #f59e0b; }

        /* 响应式设计 */
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }

            .container {
                border-radius: 8px;
            }

            .header {
                padding: 20px;
            }

            .header h1 {
                font-size: 1.8em;
            }

            .content {
                padding: 20px;
            }

            h1 {
                font-size: 1.6em;
            }

            h2 {
                font-size: 1.4em;
            }
        }

        /* 打印样式 */
        @media print {
            body {
                background: white;
                padding: 0;
            }

            .container {
                box-shadow: none;
            }

            .header {
                background: #667eea;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 投资决策简报</h1>
            <p>专业的全自动化财经简报生成系统</p>
        </div>
        <div class="content">
`;
  }

  /**
   * HTML 尾部
   */
  private getHtmlFooter(): string {
    return `
        </div>
    </div>
    <script>
        // 添加打印功能
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
        });
    </script>
</body>
</html>`;
  }
}
