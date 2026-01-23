# 🎨 增强版 Infographic 使用指南

> 完整的交互式投资决策可视化系统

---

## 📋 目录

- [快速开始](#快速开始)
- [功能特性](#功能特性)
- [使用方法](#使用方法)
- [主题切换](#主题切换)
- [交互功能](#交互功能)
- [技术细节](#技术细节)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 生成增强版 Infographic

```bash
# 生成增强版 infographic（包含所有主题）
npm run generate:infographic-enhanced

# 一键生成所有报告格式
npm run workflow:all
```

### 打开查看

生成后会自动在浏览器中打开，或手动打开：

```bash
open output/infographic-enhanced-2026-01-23.html
```

---

## ✨ 功能特性

### 1. 多种交互式图表（Chart.js）

#### 🥧 饼图 - 涨幅股票分布
- **用途**: 展示涨幅榜前 5 名股票的相对表现
- **特性**: 
  - 彩色分段
  - Hover 显示详细百分比
  - 平滑旋转动画
- **交互**: 鼠标悬停查看具体数值

#### 🎯 雷达图 - 投资维度评分
- **用途**: 综合评估当前市场的投资价值
- **维度**: 
  1. 技术面（85分）
  2. 基本面（75分）
  3. 市场情绪（65分）
  4. 宏观环境（70分）
  5. 政策支持（80分）
  6. 估值水平（60分）
- **特性**: 
  - 半透明填充
  - 交互式数据点
  - 清晰的刻度线
- **交互**: 鼠标悬停查看各维度评分

#### 📊 柱状图 - 行业表现对比
- **用途**: 对比各行业板块的涨跌幅
- **特性**: 
  - 彩色编码（绿色=涨，红色=跌）
  - 延迟动画效果
  - 百分比标注
- **交互**: 鼠标悬停查看具体涨跌幅

### 2. 多主题配色系统

#### 🌞 浅色主题（默认）
- **适用场景**: 白天使用，打印输出
- **特点**: 明亮清晰，专业感强
- **背景**: 紫色渐变
- **卡片**: 白色半透明

#### 🌙 深色主题
- **适用场景**: 夜间使用，护眼模式
- **特点**: 低对比度，减少眼睛疲劳
- **背景**: 深蓝渐变
- **卡片**: 深灰半透明

#### 💼 专业主题
- **适用场景**: 商务汇报，客户展示
- **特点**: 商务风格，稳重大气
- **背景**: 商务蓝渐变
- **卡片**: 白色

#### ✨ 简洁主题
- **适用场景**: 极简风格，黑白打印
- **特点**: 最小化干扰，突出数据
- **背景**: 灰白渐变
- **卡片**: 纯白

### 3. Mermaid 图表支持

#### 🌳 投资决策流程图
```
市场分析 → 市场状态判断 → 配置策略 → 重点关注 → 风险评估 → 操作决策
```
- **用途**: 清晰展示投资决策逻辑
- **节点**: 彩色标注（绿=增持，黄=中性，红=减持）
- **路径**: 根据市场状态自动选择

#### 📅 催化剂时间线（Gantt 图）
- **用途**: 展示未来 3 个月的关键事件
- **分类**: 
  - 数据发布（CPI、FOMC、就业报告）
  - 财报季（科技股、半导体）
  - 政策事件（预算案、贸易谈判）
- **特性**: 时间轴可视化，清晰易读

### 4. 动态数据更新动画

#### 页面加载动画
- **效果**: 卡片逐个从下到上淡入
- **延迟**: 每个卡片间隔 0.1 秒
- **时长**: 0.6 秒

#### Hover 交互动画
- **卡片**: 悬浮抬起效果（translateY -5px）
- **热力图**: 光影扫过效果
- **股票列表**: 向右滑动（translateX +5px）

#### 数据刷新动画
- **触发**: 点击"刷新数据"按钮
- **效果**: 所有卡片重新播放加载动画
- **用途**: 模拟实时数据更新

### 5. 客户端导出功能

#### 📥 导出为 PNG 图片
- **功能**: 将整个页面导出为高清图片
- **分辨率**: 2x（Retina 屏幕质量）
- **格式**: PNG（支持透明背景）
- **文件名**: `infographic-YYYY-MM-DD.png`
- **使用**: 点击"📥 导出图片"按钮

#### 📁 多格式预生成
系统自动生成 5 个文件：
1. `infographic-enhanced-2026-01-23.html` - 默认（浅色）
2. `infographic-enhanced-light-2026-01-23.html` - 浅色
3. `infographic-enhanced-dark-2026-01-23.html` - 深色
4. `infographic-enhanced-professional-2026-01-23.html` - 专业
5. `infographic-enhanced-minimal-2026-01-23.html` - 简洁

### 6. 其他增强功能

#### 📊 关键指标统计卡片
- 最大涨幅
- 最大跌幅
- VIX 指数
- 监控指标数量

#### 🔥 行业热力图增强
- 显示涨跌趋势图标（📈/📉）
- Hover 光影扫过效果
- 点击交互反馈

#### 📱 响应式设计
- **桌面**: 1600px 最大宽度，多列布局
- **平板**: 768px 自动调整为 2 列
- **手机**: < 768px 单列布局
- **触摸**: 支持触摸手势

---

## 🎯 使用方法

### 命令行使用

```bash
# 1. 生成基础 infographic
npm run generate:infographic

# 2. 生成增强版 infographic（推荐）
npm run generate:infographic-enhanced

# 3. 一键生成所有格式（决策报告 + infographic）
npm run workflow:all
```

### 集成到日常工作流

```bash
# 每天早上执行
npm run workflow:all
```

这将：
1. 收集最新市场数据
2. 运行智能分析
3. 生成 LLM 增强报告
4. 生成交互式 infographic

---

## 🌈 主题切换

### 方法 1: 在浏览器中切换

1. 打开任意 infographic HTML 文件
2. 点击顶部的主题按钮：
   - 🌞 浅色
   - 🌙 深色
   - 💼 专业
   - ✨ 简洁
3. 观察页面平滑过渡（0.5 秒）

### 方法 2: 直接打开预生成的主题文件

```bash
# 浅色主题
open output/infographic-enhanced-light-2026-01-23.html

# 深色主题
open output/infographic-enhanced-dark-2026-01-23.html

# 专业主题
open output/infographic-enhanced-professional-2026-01-23.html

# 简洁主题
open output/infographic-enhanced-minimal-2026-01-23.html
```

### 主题选择建议

| 使用场景 | 推荐主题 | 理由 |
|---------|---------|------|
| 白天工作 | 🌞 浅色 | 明亮清晰，不刺眼 |
| 夜间阅读 | 🌙 深色 | 护眼，减少蓝光 |
| 商务汇报 | 💼 专业 | 商务风格，稳重 |
| 打印输出 | ✨ 简洁 | 节省墨水，清晰 |
| 邮件发送 | 🌞 浅色 | 兼容性最好 |

---

## 🖱️ 交互功能

### 1. 图表交互

#### 饼图
- **Hover**: 高亮当前扇区
- **显示**: 股票代码 + 涨幅百分比
- **示例**: "NVDA: 3.45%"

#### 雷达图
- **Hover**: 显示具体评分
- **维度**: 6 个投资维度
- **示例**: "技术面: 85分"

#### 柱状图
- **Hover**: 显示具体涨跌幅
- **颜色**: 绿色（正）/ 红色（负）
- **示例**: "AI & 科技: +2.3%"

### 2. 卡片交互

#### Hover 效果
- **上浮**: 卡片向上移动 5px
- **阴影**: 增强阴影效果
- **时长**: 0.3 秒平滑过渡

### 3. 行业热力图

#### Hover 效果
- **缩放**: 放大到 1.05 倍
- **光影**: 白色光影从左到右扫过
- **时长**: 0.5 秒

### 4. 股票列表

#### Hover 效果
- **背景**: 加深背景色
- **滑动**: 向右移动 5px
- **时长**: 0.2 秒

### 5. 按钮操作

#### 主题切换按钮
- **功能**: 实时切换主题
- **效果**: 0.5 秒平滑过渡
- **反馈**: 日期处显示当前主题

#### 导出图片按钮
- **功能**: 导出整个页面为 PNG
- **步骤**:
  1. 点击按钮
  2. 显示"生成中..."
  3. 2-3 秒后自动下载
  4. 显示"✅ 导出成功！"
- **文件名**: `infographic-YYYY-MM-DD.png`

#### 刷新数据按钮
- **功能**: 重新播放所有动画
- **效果**: 模拟数据更新
- **提示**: 弹窗提示刷新成功

---

## 🔧 技术细节

### 技术栈

| 组件 | 技术 | 版本 | 用途 |
|-----|------|------|------|
| 前端框架 | 原生 HTML/CSS/JS | - | 零依赖 |
| 图表库 | Chart.js | 4.4.1 | 交互式图表 |
| 流程图 | Mermaid.js | 10.6.1 | 决策树/时间线 |
| 导出功能 | html2canvas | 1.4.1 | 截图导出 |
| 动画 | CSS3 | - | 过渡和关键帧 |
| 主题 | CSS Variables | - | 动态主题切换 |

### CDN 资源

```html
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

<!-- Mermaid.js -->
<script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>

<!-- html2canvas -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

### 性能指标

| 指标 | 数值 | 说明 |
|-----|------|------|
| 文件大小 | 28 KB | 原始大小 |
| Gzip 压缩 | ~8 KB | 压缩后 |
| 加载时间 | < 1 秒 | 宽带环境 |
| 首次渲染 | 即时 | 无阻塞 |
| 动画帧率 | 60 FPS | 流畅 |
| 兼容性 | 99%+ | 现代浏览器 |

### 浏览器兼容性

| 浏览器 | 最低版本 | 支持度 |
|--------|---------|-------|
| Chrome | 90+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |
| Firefox | 88+ | ✅ 完全支持 |
| Edge | 90+ | ✅ 完全支持 |
| Opera | 76+ | ✅ 完全支持 |
| IE | - | ❌ 不支持 |

---

## ❓ 常见问题

### Q1: 如何每天自动生成？

**A**: 使用 cron 或 launchd 定时任务：

```bash
# 每天早上 8 点执行
0 8 * * * cd /path/to/finance-briefing-agent && npm run workflow:all
```

### Q2: 导出的 PNG 图片太大怎么办？

**A**: 使用在线压缩工具：
- TinyPNG: https://tinypng.com/
- Squoosh: https://squoosh.app/

### Q3: 能否自定义主题颜色？

**A**: 可以！编辑生成脚本中的 `THEMES` 对象：

```typescript
const THEMES = {
  custom: {
    name: '自定义主题',
    bgGradient: 'linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%)',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    // ... 其他配置
  }
};
```

### Q4: 如何分享给他人？

**A**: 3 种方式：
1. **邮件附件**: 发送 HTML 文件（28 KB）
2. **云盘分享**: 上传到网盘
3. **导出图片**: 导出 PNG 后分享

### Q5: 数据从哪里来？

**A**: 从 `data/processed/analysis-*.json` 文件：
- 市场数据: Yahoo Finance
- 新闻: Finnhub
- 经济指标: FRED
- 公司信息: SEC/EDGAR

### Q6: 能否添加自定义图表？

**A**: 可以！在生成脚本中添加新的 Chart.js 图表：

```typescript
// 示例：添加折线图
const lineCtx = document.getElementById('lineChart').getContext('2d');
new Chart(lineCtx, {
  type: 'line',
  data: {...},
  options: {...}
});
```

### Q7: 导出功能不工作？

**A**: 检查：
1. 是否允许浏览器下载文件
2. 是否有弹窗拦截
3. 网络是否连接（需要加载 html2canvas CDN）

### Q8: 主题切换后图表颜色没变？

**A**: 这是正常的。图表颜色是固定的，只有背景和卡片颜色会变化。如需更改图表颜色，需要修改 Chart.js 配置。

---

## 🚀 高级功能（可选）

### 1. 实时数据更新

如需实时更新数据，可以添加：

```javascript
// 每 5 分钟刷新一次
setInterval(() => {
  fetch('/api/latest-data')
    .then(res => res.json())
    .then(data => updateCharts(data));
}, 300000);
```

### 2. 邮件自动发送

使用 Node.js 邮件库自动发送：

```bash
npm install nodemailer
```

```typescript
import nodemailer from 'nodemailer';

// 发送邮件
const transporter = nodemailer.createTransport({...});
await transporter.sendMail({
  from: 'your-email@example.com',
  to: 'recipient@example.com',
  subject: '每日投资简报',
  html: htmlContent,
  attachments: [{
    filename: 'infographic.html',
    content: htmlContent
  }]
});
```

### 3. PDF 导出

如需导出 PDF（需要后端支持）：

```bash
npm install puppeteer
```

```typescript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath);
await page.pdf({
  path: 'infographic.pdf',
  format: 'A4',
  landscape: true
});
await browser.close();
```

---

## 📞 支持

如有问题或建议，请：
1. 查看本文档
2. 查看 `README.md`
3. 查看其他 `docs/` 文档
4. 提交 GitHub Issue

---

## 📝 更新日志

### v2.0.0 (2026-01-23)
- ✨ 新增：3 种交互式图表（饼图、雷达图、柱状图）
- ✨ 新增：4 种主题配色系统
- ✨ 新增：2 个 Mermaid 图表
- ✨ 新增：动态数据更新动画
- ✨ 新增：客户端导出为 PNG 功能
- 🎨 改进：响应式设计
- 🎨 改进：Hover 交互效果
- 🐛 修复：移动端显示问题

### v1.0.0 (2026-01-22)
- 🎉 初始版本
- ✅ 基础 infographic 功能
- ✅ 单一主题
- ✅ 基础图表

---

**享受您的增强版 Infographic！** 🎨✨
