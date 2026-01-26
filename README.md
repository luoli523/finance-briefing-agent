# Finance Briefing Agent

> 🚀 基于 AI 的财经简报自动生成系统

专业的全自动化 **AI 产业链投资简报**生成工具，每日自动收集美股市场、财经新闻、宏观经济数据，通过 LLM 深度分析生成结构化的投资决策参考报告。

## ✨ 核心特性

### 📊 AI 产业链全覆盖
- **60 只核心标的** - 覆盖 AI 产业链上中下游
- **9 大产业分类** - GPU/半导体、晶圆制造、设备EDA、服务器、云平台、AI软件、自动驾驶/航天、数据中心能源
- **完整生态视图** - 从芯片设计到终端应用的完整投资图谱

### 🤖 LLM 深度分析
- **多模型支持** - GPT-5.2、GPT-4o、Gemini 2.0 Flash、Claude、DeepSeek
- **产业链视角** - GPU供应链、数据中心扩张、半导体CapEx三条主线分析
- **投资建议** - 短中长期配置建议、精选标的、风险控制
- **深度洞察** - 传导机制分析、受益/受损环节识别、跟踪指标

### 📈 多维度数据收集
- **Yahoo Finance** - 实时行情（无需 API Key）
- **Finnhub** - 全球财经新闻
- **FRED** - 美国宏观经济指标
- **政府 RSS** - Fed 公告、SEC 新闻

---

## 🚀 快速开始

### 1. 安装

```bash
git clone https://github.com/luoli523/finance-briefing-agent.git
cd finance-briefing-agent
npm install
```

### 2. 配置 API Keys

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据收集 API（可选但推荐）
FINNHUB_API_KEY=your_finnhub_key
FRED_API_KEY=your_fred_key

# LLM 深度分析（推荐启用）
LLM_ENABLED=true
LLM_PROVIDER=openai
LLM_MODEL=gpt-5.2
LLM_API_KEY=your_openai_key
LLM_MAX_TOKENS=16384
LLM_TIMEOUT=300000
```

### 3. 一键生成简报 🎯

```bash
npm run daily
```

这将自动执行：
1. **📊 收集数据** (~20秒) - 市场行情、新闻、经济指标
2. **🧠 智能分析** (~2秒) - 多维度数据分析
3. **🤖 LLM 深度分析** (~90秒) - GPT-5.2 产业链洞察
4. **📄 生成简报** (~1秒) - 专业投资报告

生成的简报位于 `output/ai-briefing-YYYY-MM-DD.md`

---

## 📄 简报内容

生成的简报包含 **6 大核心板块**：

### 一、核心股票池表现
按 AI 产业链分类展示 60 只标的的实时行情：

| 分类 | 公司 | 股票代号 | 最新股价 | 涨跌幅 | 表现 |
|------|------|----------|----------|--------|------|
| GPU/加速与半导体 | NVIDIA Corporation | NVDA | $184.84 | +0.91% | 🔴 |
| ... | ... | ... | ... | ... | ... |

### 二、市场宏观动态与要闻
- 5-10 条最重要新闻，带影响解读
- 覆盖政策监管、供应链、资本市场情绪

### 三、关键公司深度动态
- 股价异动公司的深度分析
- 投资逻辑、价格目标、催化剂、风险提示

### 四、行业影响与关联分析
- **GPU供应链** - 供给 → 成本 → 云厂商毛利
- **数据中心扩张** - 需求 → 服务器/网络/电力
- **半导体CapEx** - 投资 → 设备/EDA订单

### 五、产业链资本动向
- 重大 CapEx、并购、投资动态

### 六、投资建议与策略展望
- 短期（1月）/ 中期（3-6月）/ 长期（6-12月）配置
- 精选标的、风险控制、对冲建议

---

## 📊 监控标的 (60只)

### 主要指数 (5)
`^GSPC` S&P 500 | `^DJI` 道琼斯 | `^IXIC` 纳斯达克 | `^RUT` Russell 2000 | `^VIX` 恐慌指数

### ETF (8)
`SMH` `SOXX` 半导体 | `QQQ` 纳斯达克100 | `VOO` 标普500 | `ARKQ` `BOTZ` `ROBT` 机器人/AI | `GLD` 黄金对冲

### GPU/加速与半导体 (8)
`NVDA` NVIDIA | `AMD` AMD | `AVGO` Broadcom | `QCOM` 高通 | `MU` 美光 | `ARM` Arm | `WDC` 西部数据 | `STX` 希捷

### 晶圆与制造 (2)
`TSM` 台积电 | `ASML` 阿斯麦

### 设备/EDA (5)
`AMAT` 应用材料 | `LRCX` 泛林 | `KLAC` KLA | `SNPS` Synopsys | `CDNS` Cadence

### 服务器与基础设施 (7)
`SMCI` 超微 | `DELL` 戴尔 | `HPE` 惠普企业 | `ANET` Arista | `VRT` Vertiv | `ETN` 伊顿 | `CRWV` CoreWeave

### 云与平台 (4)
`MSFT` 微软 | `AMZN` 亚马逊 | `GOOGL` 谷歌 | `ORCL` 甲骨文

### 应用与软件 (6)
`META` Meta | `ADBE` Adobe | `CRM` Salesforce | `NOW` ServiceNow | `SNOW` Snowflake | `DDOG` Datadog

### 自动驾驶/机器人/航天 (5)
`TSLA` 特斯拉 | `MBLY` Mobileye | `ABB` ABB | `FANUY` 发那科 | `RKLB` Rocket Lab

### 数据中心能源 (4)
`VST` Vistra | `CEG` Constellation | `OKLO` Oklo | `BE` Bloom Energy

### 其他 (6)
`AAPL` 苹果 | `INTC` 英特尔 | `MRVL` Marvell | `PLTR` Palantir | `LLY` 礼来 | `JPM` 摩根大通

---

## 🛠️ 命令汇总

### 推荐工作流

```bash
# 每日简报（推荐）
npm run daily

# 等同于
npm run workflow:pro
```

### 分步执行

```bash
# 1. 数据收集
npm run collect

# 2. 数据分析
npm run analyze

# 3. 生成专业简报
npm run generate:pro
```

### 单独收集器

```bash
npm run collect:yahoo    # 美股行情（无需API）
npm run collect:finnhub  # 财经新闻
npm run collect:fred     # 经济数据
npm run collect:sec      # SEC文件
npm run collect:rss      # 政府RSS
```

### 其他命令

```bash
npm run verify:config           # 验证配置
npm run generate:infographic    # 生成信息图表
npm run workflow:intelligent    # 智能分析工作流
npm run send-email              # 发送当天简报邮件
npm run send-email 2026-01-25   # 发送指定日期简报
```

---

## ⚙️ LLM 配置

### 支持的模型

| 提供商 | 模型 | 推荐场景 |
|--------|------|----------|
| **OpenAI** | `gpt-5.2` ⭐ | 最佳质量，深度分析 |
| **OpenAI** | `gpt-4o` | 性价比之选 |
| **OpenAI** | `gpt-4o-mini` | 低成本快速 |
| **Google** | `gemini-2.0-flash` | 免费！ |
| **Anthropic** | `claude-3.5-sonnet` | 高质量 |
| **DeepSeek** | `deepseek-chat` | 中文优化 |

### 配置示例

```env
# GPT-5.2 (推荐)
LLM_ENABLED=true
LLM_PROVIDER=openai
LLM_MODEL=gpt-5.2
LLM_API_KEY=sk-xxx
LLM_MAX_TOKENS=16384
LLM_TIMEOUT=300000

# Gemini (免费)
LLM_ENABLED=true
LLM_PROVIDER=google
LLM_MODEL=gemini-2.0-flash
LLM_API_KEY=your_google_key
```

---

## 📁 项目结构

```
finance-briefing-agent/
├── src/
│   ├── collectors/          # 数据收集器
│   │   ├── yahoo-finance.ts # 美股行情
│   │   ├── finnhub.ts       # 财经新闻
│   │   ├── fred.ts          # 经济数据
│   │   └── history.ts       # 历史数据管理
│   │
│   ├── analyzers/           # 数据分析
│   │   ├── market.ts        # 市场分析
│   │   ├── news.ts          # 新闻分析
│   │   ├── economic.ts      # 经济分析
│   │   └── llm/             # LLM增强分析
│   │       └── providers/   # 多LLM提供商
│   │
│   ├── generators/          # 报告生成
│   │   └── professional-briefing.ts  # 专业简报生成器
│   │
│   ├── config/              # 配置管理
│   │   └── index.ts         # 全局配置
│   │
│   └── scripts/             # 运行脚本
│
├── prompts/                 # LLM提示词
│   ├── professional-briefing-system.txt
│   └── professional-briefing-task.txt
│
├── data/
│   ├── raw/                 # 原始数据
│   ├── processed/           # 处理后数据
│   └── history/             # 历史数据
│
├── output/                  # 生成的简报
├── docs/                    # 详细文档
└── config/                  # 配置工具
```

---

## 🔧 自定义配置

### 修改监控标的

编辑 `src/config/index.ts` 中的 `MONITORED_SYMBOLS`：

```typescript
export const MONITORED_SYMBOLS = {
  gpuAccelerator: [
    'NVDA', 'AMD', 'AVGO', 'QCOM', 'MU', 'ARM',
    // 添加新的股票...
  ],
  // ...
};
```

### 修改 LLM 提示词

编辑 `prompts/` 目录下的文件：
- `professional-briefing-system.txt` - AI 角色定义
- `professional-briefing-task.txt` - 输出格式和要求

---

## 📚 详细文档

| 文档 | 说明 |
|------|------|
| [`docs/LLM_ENHANCEMENT.md`](./docs/LLM_ENHANCEMENT.md) | LLM 配置详解 |
| [`docs/LLM_PROVIDER_COMPARISON.md`](./docs/LLM_PROVIDER_COMPARISON.md) | LLM 提供商对比 |
| [`docs/COLLECTORS_OVERVIEW.md`](./docs/COLLECTORS_OVERVIEW.md) | 数据收集器说明 |
| [`docs/SYMBOLS_CONFIGURATION.md`](./docs/SYMBOLS_CONFIGURATION.md) | 股票配置指南 |
| [`docs/PROMPT_CUSTOMIZATION.md`](./docs/PROMPT_CUSTOMIZATION.md) | 提示词定制 |
| [`docs/INTELLIGENT_ANALYZER.md`](./docs/INTELLIGENT_ANALYZER.md) | 智能分析器 |
| [`docs/INFOGRAPHIC_GUIDE.md`](./docs/INFOGRAPHIC_GUIDE.md) | 信息图表生成 |
| [`config/README.md`](./config/README.md) | 配置管理 |

---

## 📧 邮件发送配置

简报生成后可自动发送到指定邮箱，支持两种方式：

### 方式一：使用 Nodemailer（推荐 - 完全自动化）

在 `.env` 文件中配置以下环境变量：

```env
# 邮件发送配置
EMAIL_ENABLED=true
EMAIL_TO=your-email@example.com
EMAIL_FROM=your-gmail@gmail.com

# Gmail SMTP 配置（推荐）
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-gmail@gmail.com
EMAIL_SMTP_PASS=your-app-password
```

#### Gmail App Password 获取步骤：

1. 登录 Google 账号，访问 [Google 账号安全设置](https://myaccount.google.com/security)
2. 确保已启用**两步验证**
3. 搜索或找到 **App passwords（应用专用密码）**
4. 选择应用类型为 "Mail"，设备为 "Other"，输入名称如 "Finance Briefing"
5. 点击生成，复制 16 位密码（格式：xxxx xxxx xxxx xxxx）
6. 将此密码填入 `EMAIL_SMTP_PASS`（去掉空格）

配置完成后，运行 `npm run daily` 将自动发送简报到指定邮箱。

**单独发送邮件（不重新生成简报）：**

```bash
# 发送当天简报
npm run send-email

# 发送指定日期简报
npm run send-email 2026-01-25
```

### 方式二：使用 Claude Code + Composio（交互式）

如果你使用 Claude Code，可以通过 `connect-apps` skill 发送邮件：

```bash
# 1. 安装插件
/plugin install composio-toolrouter

# 2. 运行设置
/composio-toolrouter:setup

# 3. 重启 Claude Code 后，可以直接说：
"把今天的简报发送到 my-email@example.com"
```

这种方式支持 Gmail OAuth 认证，无需配置 App Password，但需要手动触发。

---

## 📱 Telegram 发送配置

简报摘要可自动发送到 Telegram，使用 **Telegram Bot API**（免费、无限制）。

### 配置步骤

#### 1. 创建 Telegram Bot

1. 在 Telegram 中搜索 **@BotFather**
2. 发送 `/newbot` 命令
3. 按提示设置 Bot 名称和用户名
4. 获取 **Bot Token**（格式：`123456789:ABCdefGHI...`）

#### 2. 获取 Chat ID

**方法一：使用 @userinfobot**
1. 在 Telegram 中搜索 **@userinfobot**
2. 发送任意消息，Bot 会返回你的 Chat ID

**方法二：通过 API 获取**
1. 先向你的 Bot 发送任意消息
2. 访问 `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. 在返回的 JSON 中找到 `chat.id`

#### 3. 配置环境变量

```env
# Telegram 发送配置
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

#### 4. 发送测试

```bash
# 发送当天简报
npm run send-telegram

# 发送指定日期简报
npm run send-telegram 2026-01-25
```

### 消息内容

系统会自动提取简报摘要发送到 Telegram：
- 📈 涨幅榜 Top 5
- 📉 跌幅榜 Top 5
- 💡 市场情绪
- 📰 今日要闻

完整报告通过邮件发送。

### 群组通知

如需发送到群组：
1. 将 Bot 添加到群组
2. 设置 Bot 为群管理员（可选，用于发送消息）
3. 获取群组 Chat ID（负数，如 `-123456789`）
4. 更新 `TELEGRAM_CHAT_ID` 为群组 ID

---

## 🤖 GitHub Actions 自动化

项目已配置 GitHub Actions 工作流，可以实现每日自动生成简报并发送邮件。

### 自动运行时间

- **定时运行**：每周二至周六，新加坡时间 09:30（UTC 01:30）
- **对应美股**：周一至周五收盘后
- **支持手动触发**：可随时在 GitHub Actions 页面手动运行

### 配置 GitHub Secrets

在 GitHub 仓库的 `Settings → Secrets and variables → Actions` 中添加以下 Secrets：

#### 数据收集 API
| Secret 名称 | 说明 | 必需 |
|-------------|------|:----:|
| `FINNHUB_API_KEY` | Finnhub 新闻 API | 推荐 |
| `FRED_API_KEY` | FRED 经济数据 API | 推荐 |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage 备用 | 可选 |

#### LLM 配置
| Secret 名称 | 说明 | 示例值 |
|-------------|------|--------|
| `LLM_ENABLED` | 是否启用 LLM | `true` |
| `LLM_PROVIDER` | LLM 提供商 | `openai` |
| `LLM_MODEL` | 模型名称 | `gpt-5.2` |
| `LLM_API_KEY` | API 密钥 | `sk-xxx` |
| `LLM_MAX_TOKENS` | 最大 Token 数 | `16384` |
| `LLM_TIMEOUT` | 超时时间(ms) | `300000` |

#### 邮件配置
| Secret 名称 | 说明 | 示例值 |
|-------------|------|--------|
| `EMAIL_ENABLED` | 是否发送邮件 | `true` |
| `EMAIL_TO` | 收件人邮箱 | `you@example.com` |
| `EMAIL_FROM` | 发件人邮箱 | `sender@gmail.com` |
| `EMAIL_SMTP_HOST` | SMTP 服务器 | `smtp.gmail.com` |
| `EMAIL_SMTP_PORT` | SMTP 端口 | `587` |
| `EMAIL_SMTP_USER` | SMTP 用户名 | `sender@gmail.com` |
| `EMAIL_SMTP_PASS` | SMTP 密码/App密码 | `xxxx xxxx xxxx xxxx` |

#### Telegram 配置
| Secret 名称 | 说明 | 示例值 |
|-------------|------|--------|
| `TELEGRAM_ENABLED` | 是否发送Telegram | `true` |
| `TELEGRAM_BOT_TOKEN` | Bot Token | `123456789:ABCdef...` |
| `TELEGRAM_CHAT_ID` | Chat ID | `123456789` |

### 手动触发工作流

1. 进入仓库的 **Actions** 页面
2. 选择 **Daily Finance Briefing** 工作流
3. 点击 **Run workflow**
4. 选择是否发送邮件和 Telegram
5. 点击 **Run workflow** 按钮

### 查看运行结果

- 工作流完成后，简报会作为 **Artifact** 保存（保留 30 天）
- 可在 Actions 运行详情页的 **Summary** 中预览简报前 50 行
- 如配置了邮件，完整简报会自动发送到指定邮箱
- 如配置了 WhatsApp，简报摘要会自动发送到指定手机

---

## ⚠️ 常见问题

**Q: 没有 LLM API Key 能用吗？**  
A: 可以！系统会使用规则引擎生成基础报告。但推荐启用 LLM 获得深度洞察。

**Q: 推荐用哪个 LLM？**  
A: GPT-5.2 质量最佳；Gemini 2.0 Flash 免费；GPT-4o-mini 性价比高。

**Q: 数据多久更新？**  
A: 手动运行命令时更新。建议美股收盘后（北京时间早上 5-6 点，新加坡时间早上 9-10 点）运行。

**Q: LLM 分析超时怎么办？**  
A: 增加 `LLM_TIMEOUT` 值（默认 300000 = 5分钟）。

**Q: 如何添加新的监控标的？**  
A: 编辑 `src/config/index.ts` 中的 `MONITORED_SYMBOLS` 对象，在对应分类中添加股票代码即可。

**Q: GitHub Actions 没有自动运行怎么办？**  
A: 检查 Secrets 是否正确配置，可以先手动触发测试。注意 cron 时间是 UTC 时区。

**Q: 邮件发送失败怎么办？**  
A: 确认 Gmail App Password 正确，确保已开启两步验证。检查 `EMAIL_SMTP_PASS` 是否去掉了空格。

**Q: 报告中某些数据显示 N/A？**  
A: 这通常是因为 LLM 无法从当日新闻中提取具体数值。这是正常现象，表示该数据暂无可靠来源。

---

## ⚖️ 免责声明

本工具仅供学习和参考使用，生成的简报不构成任何投资建议。投资有风险，决策需谨慎。

- ⚠️ 数据来源于第三方 API，不保证准确性和实时性
- ⚠️ LLM 分析基于模型推理，可能存在偏差
- ⚠️ 使用者应独立判断，自行承担投资风险

---

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE) 文件

---

**Happy Trading! 📈**
