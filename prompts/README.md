# 📝 LLM Prompt 管理

## 概述

这个目录包含了 LLM 深度分析的所有 prompt 模板。您可以在这里集中管理和自定义 prompt，以调整分析的侧重点和风格。

---

## 📁 文件结构

```
prompts/
├── README.md                    # 本文件 - 使用指南
├── system-prompt.txt            # 系统提示词（定义 AI 角色和能力）
├── analysis-task.txt            # 分析任务提示词（定义输出格式）
├── analysis-focus.txt           # 分析侧重配置（参考文档）
└── custom/                      # 自定义 prompt 目录
    ├── system-prompt.txt        # 可选：自定义系统提示词
    ├── analysis-task.txt        # 可选：自定义分析任务
    └── *.txt                    # 其他自定义模板
```

---

## 🎯 快速开始

### 方式 1: 直接编辑默认 Prompt（推荐）

最简单的方式是直接编辑根目录下的 prompt 文件：

```bash
# 编辑系统提示词（定义 AI 角色）
vim prompts/system-prompt.txt

# 编辑分析任务（定义输出格式和要求）
vim prompts/analysis-task.txt

# 参考分析侧重配置
vim prompts/analysis-focus.txt
```

**修改后立即生效**，无需重启或重新编译！

---

### 方式 2: 创建自定义 Prompt（高级）

如果您想保留默认 prompt 并创建自己的版本：

```bash
# 创建自定义系统提示词
cp prompts/system-prompt.txt prompts/custom/system-prompt.txt
vim prompts/custom/system-prompt.txt

# 创建自定义分析任务
cp prompts/analysis-task.txt prompts/custom/analysis-task.txt
vim prompts/custom/analysis-task.txt

# 配置使用自定义 prompt
# 在 .env 中设置：
LLM_CUSTOM_PROMPTS=true
```

---

## 📝 Prompt 说明

### 1. `system-prompt.txt` - 系统提示词

**作用**：定义 AI 的角色、专长、分析风格

**包含内容**：
- AI 角色定位（如：资深金融分析师）
- 专业领域（宏观经济、行业研究等）
- 分析特点（基于数据、多维度、风险管理等）

**修改建议**：
- 调整 AI 的角色定位（如：侧重技术分析、价值投资等）
- 添加/删除专业领域
- 强调特定分析风格（如：更激进/保守）

**示例修改**：

```txt
# 原文：
你是一位资深的金融分析师和投资顾问...

# 修改为：侧重技术分析
你是一位专注于技术分析和量化策略的金融分析师...

# 修改为：侧重价值投资
你是一位秉持价值投资理念的资深分析师，深受巴菲特和查理·芒格的影响...
```

---

### 2. `analysis-task.txt` - 分析任务提示词

**作用**：定义具体的分析任务和输出格式

**包含内容**：
- 分析维度（宏观、Fed、地缘、行业等）
- 输出格式（JSON 结构）
- 字数要求
- 重要提示

**修改建议**：
- 调整输出字数（如：更详细或更简洁）
- 添加/删除分析维度
- 修改 JSON 结构以适应您的需求
- 调整概率分配（牛市/基准/熊市）

**示例修改**：

```txt
# 原文：
"summary": "宏观经济深度解读（150-200字）"

# 修改为：更详细
"summary": "宏观经济深度解读（300-500字）"

# 添加新的分析维度：
"technicalAnalysis": {
  "keyLevels": ["支撑位1", "阻力位1"],
  "trendAnalysis": "趋势分析（100字）"
}
```

---

### 3. `analysis-focus.txt` - 分析侧重配置

**作用**：提供分析侧重点的参考和记录

**包含内容**：
- 优先关注领域
- 时间维度侧重
- 风险偏好
- 特别关注点清单

**使用方式**：
- 此文件作为**参考文档**，不会直接传递给 LLM
- 用于记录和提醒当前的分析重点
- 根据市场情况定期更新

---

## 🎨 常见自定义场景

### 场景 1: 侧重短期交易

编辑 `system-prompt.txt`：

```txt
你是一位专注于短期交易和技术分析的金融分析师。你的分析特点：
- 重点关注 1-7 天的短期机会
- 强调技术指标和市场情绪
- 快速识别催化剂事件
- 提供明确的入场和止损点位
```

编辑 `analysis-task.txt`：

```json
"strategicRecommendations": {
  "thisWeek": ["本周交易机会1", "本周交易机会2"],
  "nextWeek": ["下周交易机会1"],
  "technicalLevels": ["关键支撑/阻力位"],
  "riskManagement": ["止损策略", "仓位管理"]
}
```

---

### 场景 2: 侧重长期投资

编辑 `system-prompt.txt`：

```txt
你是一位秉持价值投资理念的长期投资分析师。你的分析特点：
- 重点关注 1-5 年的长期价值
- 强调基本面和护城河分析
- 寻找被低估的优质资产
- 不受短期波动影响
```

编辑 `analysis-task.txt`：

```json
"strategicRecommendations": {
  "valueOpportunities": ["价值机会1", "价值机会2"],
  "longTermThesis": ["长期投资逻辑（500字）"],
  "compoundingPotential": ["复利潜力分析"],
  "moatAnalysis": ["护城河分析"]
}
```

---

### 场景 3: 侧重特定行业（如：只关注半导体）

编辑 `system-prompt.txt`：

```txt
你是一位专注于半导体行业的资深分析师，拥有 15+ 年的行业经验。你的专长：
- 半导体供应链深度理解
- 晶圆厂、设备、材料的技术演进
- 中美半导体竞争格局
- 先进制程节点的经济性分析
```

编辑 `analysis-task.txt`：

```json
"semiconductorDeepDive": {
  "supplyChainAnalysis": "供应链分析（500字）",
  "technologyRoadmap": "技术路线图分析",
  "geopoliticalRisks": ["地缘风险1", "地缘风险2"],
  "keyPlayers": {
    "foundries": ["台积电", "三星"],
    "equipment": ["ASML", "应用材料"],
    "design": ["英伟达", "AMD"]
  },
  "investmentRanking": ["投资优先级排名"]
}
```

---

### 场景 4: 侧重风险管理

编辑 `system-prompt.txt`：

```txt
你是一位以风险管理为核心的投资顾问。你的分析特点：
- 首要任务是保护本金
- 深度识别各类风险（系统性、行业、个股）
- 提供多层次的风险对冲方案
- 在不确定性中寻找确定性
```

编辑 `analysis-task.txt`：

```json
"riskAnalysis": {
  "systemicRisks": ["系统性风险1", "系统性风险2"],
  "sectorRisks": ["行业风险1", "行业风险2"],
  "tailRisks": ["尾部风险1", "尾部风险2"],
  "hedgingStrategies": ["对冲策略1", "对冲策略2"],
  "portfolioProtection": "投资组合保护方案（300字）"
}
```

---

## 🔧 高级技巧

### 技巧 1: 使用条件分析

在 `analysis-task.txt` 中添加条件指令：

```txt
重要提示：
1. 如果 VIX 指数 > 25，强化风险分析部分
2. 如果某行业涨幅 > 10%，分析是否过热
3. 如果 Fed 会议临近，详细分析政策预期
4. 如果出现黑天鹅事件，优先提供应对策略
```

---

### 技巧 2: 添加参考框架

在 `system-prompt.txt` 中引用经典框架：

```txt
你的分析框架基于：
1. 巴菲特的护城河理论 - 评估企业竞争优势
2. 达里奥的债务周期理论 - 理解宏观经济周期
3. 彼得·林奇的 GARP - 成长与价值的平衡
4. 索罗斯的反身性理论 - 理解市场情绪反馈
```

---

### 技巧 3: 分段式 Prompt（复杂分析）

创建多个专门的 prompt 文件：

```bash
prompts/custom/
├── macro-analysis.txt          # 专门的宏观分析 prompt
├── sector-analysis.txt         # 专门的行业分析 prompt
├── risk-analysis.txt           # 专门的风险分析 prompt
└── strategy-generation.txt     # 专门的策略生成 prompt
```

---

## 📊 输出格式自定义

### 添加新的输出字段

在 `analysis-task.txt` 的 JSON 结构中添加：

```json
{
  // ... 现有字段 ...
  
  "quantitativeMetrics": {
    "valuationAnalysis": "估值分析",
    "technicalIndicators": ["技术指标1", "技术指标2"],
    "correlationAnalysis": "相关性分析"
  },
  
  "sentimentAnalysis": {
    "retailInvestors": "散户情绪",
    "institutionalFlow": "机构资金流向",
    "optionsMarket": "期权市场信号"
  }
}
```

---

### 调整字数要求

根据您的需求调整每个部分的字数：

```txt
# 适合快速扫描（精简版）
"summary": "宏观经济解读（50-80字）"

# 适合深度研究（详细版）
"summary": "宏观经济深度解读（500-800字）"

# 适合报告呈现（中等版）
"summary": "宏观经济解读（150-200字）"  # 默认
```

---

## 🚀 测试 Prompt 修改

修改 prompt 后，立即测试效果：

```bash
# 1. 修改 prompt
vim prompts/system-prompt.txt

# 2. 运行增强分析
npm run analyze:enhanced

# 3. 查看输出
cat data/processed/enhanced-analysis-*.json
```

**提示**：由于 LLM 的输出具有随机性，建议多次测试以评估 prompt 的稳定性。

---

## 💡 最佳实践

### ✅ Do（推荐）

1. **明确具体**：提供清晰的指令和示例
2. **结构化输出**：使用 JSON 格式确保一致性
3. **限定范围**：指定字数、数量，避免过长输出
4. **分层指导**：系统 prompt 定角色，任务 prompt 定要求
5. **迭代优化**：逐步调整，每次小幅修改
6. **备份原文**：修改前复制一份到 `custom/`

### ❌ Don't（避免）

1. **过于模糊**：如"给我一些建议"
2. **自相矛盾**：如同时要求"激进"和"保守"
3. **过度复杂**：一个 prompt 包含太多任务
4. **缺乏示例**：没有展示期望的输出格式
5. **忽略成本**：过长的 prompt 会增加 token 消耗

---

## 🔄 版本管理

建议使用 Git 管理您的自定义 prompt：

```bash
# 创建自定义分支
git checkout -b custom-prompts

# 提交修改
git add prompts/
git commit -m "自定义 prompt: 侧重短期交易策略"

# 随时恢复默认
git checkout main -- prompts/
```

---

## 📚 参考资源

### Prompt Engineering 最佳实践

1. **OpenAI Prompt Engineering Guide**
   https://platform.openai.com/docs/guides/prompt-engineering

2. **Anthropic Prompt Library**
   https://docs.anthropic.com/claude/prompt-library

3. **Google Gemini Prompting Guide**
   https://ai.google.dev/gemini-api/docs/prompting-strategies

### 金融分析框架

1. **CFA 协会分析框架**
2. **晨星投资风格箱**
3. **波特五力模型**
4. **SWOT 分析**

---

## 🆘 故障排除

### 问题 1: 修改后没有生效

**原因**：可能使用了缓存或自定义 prompt

**解决**：
```bash
# 确认使用的是默认 prompt
grep "LLM_CUSTOM_PROMPTS" .env

# 如果为 true，改为 false 或删除该行
```

### 问题 2: LLM 输出格式不正确

**原因**：prompt 中的 JSON 格式示例有误

**解决**：
```bash
# 验证 JSON 格式
cat prompts/analysis-task.txt | grep -A 100 "```json"

# 使用在线 JSON 验证器检查
```

### 问题 3: 输出与预期差异大

**原因**：LLM 理解有偏差或 prompt 不够明确

**解决**：
1. 在 prompt 中添加更多示例
2. 使用更明确的指令（如"必须"、"禁止"）
3. 增加输出约束（如字数、格式）

---

## 📧 反馈与贡献

如果您创建了优秀的自定义 prompt，欢迎分享！

您可以：
1. 在项目仓库创建 Issue 分享您的 prompt
2. 提交 Pull Request 贡献到 `prompts/examples/`
3. 在社区讨论您的 prompt 设计思路

---

**最后更新**: 2026-01-22

**下一步**: 开始编辑 `prompts/system-prompt.txt` 或 `prompts/analysis-task.txt`，立即自定义您的分析！
