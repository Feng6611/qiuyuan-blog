---
slug: openclaw-deploy-guide-cn
date: '2026-02-26'
title: 'OpenClaw 部署指南'
description: '30分钟搭建你的AI助手，从VPS到飞书对话，一键复制命令直接用'
keywords:
  - openclaw
  - deploy
  - vps
  - kimi
  - feishu
  - aliyun
---

**目标**: 30 分钟内拥有一个 24 小时在线的 AI 助手

**你需要**:
- 一台阿里云轻量服务器（99元/年）
- Kimi CLI（推荐，国内友好）
- Kimi Coding Plan API（可选，用于代码任务）
- 飞书账号（免费，用于对话）

---

## 第一步：购买阿里云 VPS

### 推荐配置
- **CPU**: 2核
- **内存**: 2GB
- **系统**: Ubuntu 22.04 LTS
- **带宽**: 3Mbps
- **价格**: 99元/年（新用户活动价）

### 购买地址
[阿里云轻量应用服务器](https://www.aliyun.com/product/swas)

**为什么选阿里云？**
- 国内访问快，延迟低
- 价格透明，99元/年性价比高
- 配合 Kimi 和飞书（都是国内服务）网络最稳定

购买后你会得到：
- IP 地址（如 \`123.45.67.89\`）
- root 密码（首次登录需重置）
- SSH 端口（默认 22）

---

## 第二步：安装 Kimi CLI

Kimi CLI 是月之暗面推出的 AI 编程助手，国内访问快，支持代码生成和系统操作。

### 本地安装 Kimi CLI

\`\`\`bash
# 安装 Kimi CLI
npm install -g @kimi-ai/cli

# 运行
kimi
\`\`\`

**为什么推荐 Kimi？**
- 国内服务，速度快
- 支持 Kimi Coding Plan（专业代码能力）
- 可以直接 SSH 连接 VPS 执行命令
- 免费额度够用，付费也便宜

---

## 第三步：一键安装 OpenClaw

### 连接 VPS

\`\`\`bash
# SSH 连接你的 VPS
ssh root@YOUR_VPS_IP
\`\`\`

### 复制以下提示词给 Kimi CLI

\`\`\`
我需要在这台 Ubuntu 22.04 服务器上安装 OpenClaw。

请按以下步骤操作：
1. 更新系统包：apt update && apt upgrade -y
2. 安装 Node.js 22+：
   - 添加 NodeSource 仓库
   - 安装 nodejs 和 npm
3. 安装 OpenClaw：npm install -g openclaw
4. 初始化配置：openclaw init
5. 配置 systemd 服务，让 OpenClaw 开机自启
6. 启动服务：openclaw gateway start
7. 验证状态：openclaw status

参考官方文档：https://docs.openclaw.ai/installation

遇到权限问题用 sudo，遇到端口占用检查防火墙。
\`\`\`

Kimi 会自动执行所有步骤，你只需确认关键操作。

---

## 第四步：配置 Kimi Coding Plan API

Kimi Coding Plan 是专业的代码生成服务，可以让 OpenClaw 处理复杂的编程任务。

### 获取 Kimi API Key

1. 访问 [Kimi 开放平台](https://platform.moonshot.cn/)
2. 注册并登录
3. 创建 API Key
4. 选择 **Kimi Coding Plan**（如果需要代码能力）

**价格参考**:
- 免费额度：新用户有试用额度
- Kimi Coding Plan：约 ¥0.02/千 tokens
- 日常使用成本：¥5-20/月

### 配置到 OpenClaw

\`\`\`bash
# 编辑配置文件
nano ~/.openclaw/openclaw.json
\`\`\`

**一键复制配置**（替换你的 API Key）：

\`\`\`json
{
  "providers": [
    {
      "name": "kimi",
      "apiKey": "你的kimi-api-key",
      "model": "moonshot-v1-8k"
    },
    {
      "name": "kimi-coding",
      "apiKey": "你的kimi-coding-api-key",
      "model": "k2p5"
    }
  ],
  "defaultProvider": "kimi"
}
\`\`\`

**配置说明**:
- \`kimi\`: 日常对话模型（便宜，速度快）
- \`kimi-coding\`: 代码任务模型（专业，推理强）
- \`defaultProvider\`: 默认使用 kimi，需要时自动切换到 kimi-coding

### 常见踩坑点

**坑 1: API Key 格式错误**
- Kimi API Key 格式：\`sk-xxxxxxxxxxxxxx\`
- 不要包含空格或换行符
- 检查是否复制完整

**坑 2: 模型名称写错**
- Kimi 对话模型：\`moonshot-v1-8k\` 或 \`moonshot-v1-32k\`
- Kimi Coding Plan：\`k2p5\`（不是 \`kimi-coding\`）

**坑 3: 配置文件格式**
- JSON 格式严格，注意逗号和引号
- 最后一项不要加逗号
- 用 \`jq\` 验证：\`cat ~/.openclaw/openclaw.json | jq\`

**坑 4: 权限问题**
- 配置文件权限：\`chmod 600 ~/.openclaw/openclaw.json\`
- 避免泄露 API Key

重启服务：
\`\`\`bash
openclaw gateway restart
\`\`\`

---

## 第五步：接入飞书对话

飞书是最方便的对话接口，支持单聊、群聊、文件传输。

**推荐使用 GitHub 社区版本**（而非官方版本），功能更完善，维护更活跃。

### 安装飞书扩展

```bash
# 进入 OpenClaw 扩展目录
cd ~/.openclaw/extensions

# 克隆社区版飞书扩展
git clone https://github.com/openclaw/extension-feishu.git feishu

# 安装依赖
cd feishu
npm install
```

### 飞书应用配置

#### 1. 创建飞书应用

访问 [飞书开放平台](https://open.feishu.cn/)，点击"创建企业自建应用"。

**个人用户**：可以创建"个人使用"的企业，不需要营业执照。

#### 2. 获取凭证

进入"凭证与基础信息"，复制：
- **App ID**（如 `cli_xxxxxxxxxxxx`）
- **App Secret**

#### 3. 配置权限

进入"权限管理"，添加以下权限：

**必需权限**：
- `im:message` - 获取与发送单聊、群组消息
- `im:message.group_msg` - 接收群聊消息
- `im:message.p2p_msg` - 接收单聊消息
- `im:chat` - 获取群组信息

**可选权限**（如需文件/图片）：
- `im:resource` - 获取与上传图片、文件资源
- `drive:drive` - 访问云文档

#### 4. 配置事件订阅

进入"事件订阅"，配置：
- **请求地址**：`http://你的VPS_IP:8787/feishu/webhook`
- **订阅事件**：
  - `im.message.receive_v1`（接收消息）

**注意**：如果 VPS 没有公网 IP，可以用内网穿透（如 frp、ngrok）。

#### 5. 发布应用

进入"版本管理与发布"：
1. 创建版本，填写更新说明
2. 点击"申请发布"
3. 自己审批通过（企业管理员）

#### 6. 添加机器人

在飞书中搜索你的应用名称，添加到单聊或群聊。

### 配置到 OpenClaw

```bash
nano ~/.openclaw/openclaw.json
```

**一键复制配置**（替换你的凭证）：

```json
{
  "channels": [
    {
      "name": "feishu",
      "type": "feishu",
      "appId": "cli_xxxxxxxxxxxx",
      "appSecret": "你的app-secret",
      "verificationToken": "你的verification-token",
      "encryptKey": "你的encrypt-key"
    }
  ]
}
```

**配置说明**:
- `verificationToken` 和 `encryptKey` 在飞书"事件订阅"页面获取
- 如果不需要加密，`encryptKey` 可以留空

### 为什么用社区版？

**社区版优势**：
- 功能更完善（支持更多消息类型）
- 更新更及时（社区活跃维护）
- 问题修复快（GitHub Issues 响应快）
- 可以自己定制（开源代码）

**官方版问题**：
- 功能较基础
- 更新较慢
- 部分边缘场景支持不好

重启并测试：
```bash
openclaw gateway restart
```

在飞书里 @你的机器人，发送"你好"，看看能否回复！

---

## 第六步：配置最佳实践

OpenClaw 安装好后，还需要配置一些最佳实践，让它更好用。

### 1. 创建工作目录

\`\`\`bash
mkdir -p ~/.openclaw/workspace
cd ~/.openclaw/workspace
\`\`\`

### 2. 初始化核心文件

**一键复制提示词给 Kimi**：

\`\`\`
帮我在 ~/.openclaw/workspace 目录下创建以下文件：

1. AGENTS.md - 工作规范
内容：
- 每次启动先读取 SOUL.md、USER.md、MEMORY.md
- 记录重要事件到 memory/YYYY-MM-DD.md
- 不要泄露私密信息
- 外部操作（发邮件、发推）需要确认

2. SOUL.md - 个性设定
内容：
- 我是一个 AI 助手，名字由用户决定
- 风格：简洁、直接、有用
- 不说废话，不过度客套
- 有观点，可以表达偏好

3. USER.md - 用户信息
内容：
- 名字：[用户填写]
- 时区：Asia/Shanghai
- 偏好：[用户填写]

4. MEMORY.md - 长期记忆
内容：
- 重要决策记录
- 常用命令和配置
- 踩过的坑

5. HEARTBEAT.md - 心跳任务
内容：
- 每小时检查一次
- 检查项：邮件、日历、待办
- 有重要事项时提醒

6. TOOLS.md - 工具配置
内容：
- SSH 主机列表
- API Key 位置（不要写明文）
- 常用命令别名

创建 memory 目录：
mkdir -p memory

所有文件用 UTF-8 编码，Markdown 格式。
\`\`\`

### 3. 安装必要的 Skills

Skills 是 OpenClaw 的扩展能力，类似插件。

**推荐 Skills**：

\`\`\`bash
# 进入 skills 目录
cd ~/.openclaw/skills

# 克隆常用 skills（示例）
git clone https://github.com/openclaw/skill-github.git
git clone https://github.com/openclaw/skill-calendar.git
git clone https://github.com/openclaw/skill-email.git
\`\`\`

**或者让 Kimi 帮你安装**：

\`\`\`
帮我在 ~/.openclaw/skills 目录下安装以下 skills：
1. github - GitHub 操作（issues、PR、CI）
2. calendar - 日历管理
3. email - 邮件处理

参考 OpenClaw 文档：https://docs.openclaw.ai/skills
\`\`\`

### 4. 配置心跳机制

心跳机制让 OpenClaw 定期检查任务，主动提醒你。

编辑 \`~/.openclaw/openclaw.json\`，添加：

\`\`\`json
{
  "heartbeat": {
    "enabled": true,
    "interval": 3600,
    "prompt": "检查 HEARTBEAT.md 中的任务，有重要事项时提醒我。没有就回复 HEARTBEAT_OK。"
  }
}
\`\`\`

**配置说明**:
- \`interval\`: 心跳间隔（秒），3600 = 1小时
- \`prompt\`: 心跳提示词，告诉 OpenClaw 该做什么

### 5. Memory 管理规范

**日常记录**：写入 \`memory/YYYY-MM-DD.md\`
- 今天做了什么
- 遇到的问题和解决方案
- 重要决策

**长期记忆**：更新 \`MEMORY.md\`
- 定期（每周）整理日常记录
- 提取重要信息到 MEMORY.md
- 删除过时内容

**示例**：

\`\`\`bash
# 今天的记录
echo "## 2026-03-01\n- 部署了 OpenClaw\n- 配置了飞书对话\n- 遇到 API Key 格式问题，已解决" >> memory/2026-03-01.md

# 长期记忆
echo "## 踩坑记录\n- Kimi API Key 不要包含空格" >> MEMORY.md
\`\`\`

---

## 验证部署

### 1. 检查服务状态

\`\`\`bash
openclaw status
\`\`\`

应该看到：
- ✅ Gateway: running
- ✅ Providers: connected (kimi, kimi-coding)
- ✅ Channels: connected (feishu)

### 2. 测试对话

在飞书里 @你的机器人：

\`\`\`
你好，帮我检查一下系统状态
\`\`\`

机器人应该回复当前时间、系统信息等。

### 3. 测试代码能力（如果配置了 Kimi Coding Plan）

\`\`\`
帮我写一个 Python 脚本，读取 CSV 文件并统计行数
\`\`\`

机器人应该生成代码并解释用法。

---

## 常见问题

### Q1: 为什么推荐阿里云 99元/年？

**A**: 性价比最高。国内访问快，配合 Kimi 和飞书延迟低。新用户活动价 99元/年，比国外 VPS 便宜且稳定。

### Q2: Kimi 和 Claude/GPT 比怎么样？

**A**: 
- **日常对话**：Kimi 足够用，中文理解好，速度快
- **代码任务**：Kimi Coding Plan 专业能力强
- **复杂推理**：可以后续接入 Claude Opus
- **价格**：Kimi 便宜 10 倍

### Q3: 飞书个人能用吗？

**A**: 可以。创建"个人使用"的企业，不需要营业执照。适合个人 AI 助手场景。

### Q4: 没有公网 IP 怎么办？

**A**: 使用内网穿透：
- **frp**（推荐）：自建或用免费服务
- **ngrok**：免费版够用
- **Cloudflare Tunnel**：免费且稳定

### Q5: 如何保证安全？

**基础安全**：
- 改 SSH 端口（默认 22 → 自定义）
- 禁用密码登录，用 SSH 密钥
- 配置阿里云安全组，只开放必要端口
- API Key 不要写入代码，用环境变量

**进阶安全**：
- 配置防火墙（ufw）
- 定期更新系统
- 使用 fail2ban 防暴力破解

### Q6: 成本多少？

**月度成本**：
- 阿里云 VPS：¥8（99元/年）
- Kimi API：¥5-20（看使用量）
- 飞书：免费
- **总计**：¥15-30/月

**对比**：
- ChatGPT Plus：$20/月（约 ¥140）
- Claude Pro：$20/月（约 ¥140）
- **OpenClaw 方案便宜 5-10 倍**

---

## 下一步

部署成功后，你可以：

### 1. 创建自定义 Skills
- 自动化日常任务（备份、监控）
- 集成第三方服务（GitHub、Notion）
- 定制专属功能

### 2. 接入更多渠道
- 微信（通过 Wechaty）
- 钉钉
- Telegram
- Discord

### 3. 多 Agent 协作
- 部署多个 OpenClaw 实例
- 不同 Agent 负责不同任务
- 通过消息队列协作

### 4. 进阶配置
- 配置 HTTPS（Let's Encrypt）
- 使用 Docker 部署
- 配置日志和监控

---

## 学习资源

- **官方文档**：https://docs.openclaw.ai
- **GitHub**：https://github.com/openclaw/openclaw
- **社区**：https://discord.com/invite/clawd
- **技能市场**：https://clawhub.com

---

**部署时间**: 30 分钟  
**月度成本**: ¥15-30  
**收获**: 一个 24 小时在线、可定制、成本低的 AI 助手

开始你的 AI 助手之旅吧！🚀
