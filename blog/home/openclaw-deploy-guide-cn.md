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
- IP 地址（如 `123.45.67.89`）
- root 密码（首次登录需重置）
- SSH 端口（默认 22）

---

## 第二步：安装 Kimi CLI

Kimi CLI 是月之暗面推出的 AI 编程助手，国内访问快，支持代码生成和系统操作。

### 本地安装 Kimi CLI

```bash
# 安装 Kimi CLI
npm install -g @kimi-ai/cli

# 运行
kimi
```

**为什么推荐 Kimi？**
- 国内服务，速度快
- 支持 Kimi Coding Plan（专业代码能力）
- 可以直接 SSH 连接 VPS 执行命令
- 免费额度够用，付费也便宜

---

## 第三步：一键安装 OpenClaw

### 连接 VPS

```bash
# SSH 连接你的 VPS
ssh root@YOUR_VPS_IP
```

### 复制以下提示词给 Kimi CLI

```
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
```

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

```bash
# 编辑配置文件
nano ~/.openclaw/openclaw.json
```

**一键复制配置**（替换你的 API Key）：

```json
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
```

**配置说明**:
- `kimi`: 日常对话模型（便宜，速度快）
- `kimi-coding`: 代码任务模型（专业，推理强）
- `defaultProvider`: 默认使用 kimi，需要时自动切换到 kimi-coding

### 常见踩坑点

**坑 1: API Key 格式错误**
- Kimi API Key 格式：`sk-xxxxxxxxxxxxxx`
- 不要包含空格或换行符
- 检查是否复制完整

**坑 2: 模型名称写错**
- Kimi 对话模型：`moonshot-v1-8k` 或 `moonshot-v1-32k`
- Kimi Coding Plan：`k2p5`（不是 `kimi-coding`）

**坑 3: 配置文件格式**
- JSON 格式严格，注意逗号和引号
- 最后一项不要加逗号
- 用 `jq` 验证：`cat ~/.openclaw/openclaw.json | jq`

**坑 4: 权限问题**
- 配置文件权限：`chmod 600 ~/.openclaw/openclaw.json`
- 避免泄露 API Key

重启服务：
```bash
openclaw gateway restart
```

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

OpenClaw 安装好后，还需要配置核心文件和必要工具，让它真正好用。

### 1. 创建核心工作文件

这些文件是 OpenClaw 的"记忆系统"，基于我们实际使用的最佳实践。

```bash
mkdir -p ~/.openclaw/workspace/memory
cd ~/.openclaw/workspace
```

**核心文件说明**：

**AGENTS.md** - 工作规范
- 每次启动先读取 SOUL.md、USER.md、memory/YYYY-MM-DD.md
- 在主会话中读取 MEMORY.md（长期记忆）
- 记录重要事件到 memory/YYYY-MM-DD.md
- 群聊中知道何时说话、何时沉默
- 用 emoji 反应代替不必要的回复

**SOUL.md** - 个性设定
- 真诚帮助，不要表演式客套
- 有观点，可以表达偏好
- 先尝试自己解决，再寻求帮助
- 通过能力赢得信任

**USER.md** - 用户信息
- 名字、时区、偏好
- 项目列表
- 联系方式

**MEMORY.md** - 长期记忆（仅主会话加载）
- 重要决策记录
- 常用命令和配置
- 踩过的坑和解决方案
- 不在群聊中加载（安全考虑）

**HEARTBEAT.md** - 心跳任务
- 定期检查的任务列表
- 检查频率和提醒规则

**TOOLS.md** - 工具配置
- SSH 主机、API Key 位置
- 常用命令别名

**IDENTITY.md** - 身份设定（可选）
- Agent 的名字和形象
- 喜好和工作方式

**一键复制提示词给 Kimi**：

```
帮我在 ~/.openclaw/workspace 目录下创建以下文件：

1. AGENTS.md - 参考 https://github.com/openclaw/openclaw/blob/main/examples/workspace/AGENTS.md
2. SOUL.md - 参考 https://github.com/openclaw/openclaw/blob/main/examples/workspace/SOUL.md  
3. USER.md - 包含：名字、时区、偏好、项目列表
4. MEMORY.md - 空文件，后续手动填充
5. HEARTBEAT.md - 包含：任务清单、检查规则
6. TOOLS.md - 包含：SSH 主机、API Key 位置、命令别名
7. IDENTITY.md - 包含：Agent 名字、形象、风格

创建 memory 目录：
mkdir -p memory

所有文件用 UTF-8 编码，Markdown 格式。
```

### 2. 安装必要的 Skills

#### skill-library-manager（必装）

Vercel 开发的技能管理工具，用于发现、安装、更新高质量 Skills。

```bash
cd ~/.openclaw/skills
git clone https://github.com/vercel/skill-library-manager.git
cd skill-library-manager
npm install
```

**用法**：
```bash
# 搜索技能
openclaw skill search github

# 安装高分技能
openclaw skill install --top-rated

# 更新技能
openclaw skill update
```

#### agent-reach（必装）

集成多个搜索服务的全网搜索工具，支持：
- Twitter/X、Reddit、YouTube
- GitHub、Bilibili、小红书、抖音
- LinkedIn、Boss直聘、RSS

```bash
cd ~/.openclaw/skills
git clone https://github.com/openclaw/agent-reach.git
cd agent-reach
npm install
```

**配置各平台 API**：
```bash
nano ~/.openclaw/skills/agent-reach/config.json
```

**一键复制提示词给 Kimi**：
```
帮我安装 OpenClaw 的必要 Skills：

1. skill-library-manager
   - 克隆：git clone https://github.com/vercel/skill-library-manager.git
   - 安装依赖：npm install

2. agent-reach  
   - 克隆：git clone https://github.com/openclaw/agent-reach.git
   - 安装依赖：npm install
   - 创建配置文件模板

位置：~/.openclaw/skills/
```

#### 其他推荐 Skills（按需安装）

```bash
cd ~/.openclaw/skills

# GitHub 操作
git clone https://github.com/openclaw/skill-github.git

# 天气查询
git clone https://github.com/openclaw/skill-weather.git

# 日历管理
git clone https://github.com/openclaw/skill-calendar.git
```

### 3. 配置心跳机制

心跳机制让 OpenClaw 定期检查任务，主动提醒你。

编辑 `~/.openclaw/openclaw.json`，添加：

```json
{
  "heartbeat": {
    "enabled": true,
    "interval": 3600,
    "prompt": "读取 HEARTBEAT.md 中的任务，有重要事项时提醒我。没有就回复 HEARTBEAT_OK。"
  }
}
```

**HEARTBEAT.md 示例**：

```markdown
# HEARTBEAT.md - 心跳任务

## 任务清单

- [ ] 邮件检查 - 有未读重要邮件吗？
- [ ] 日历检查 - 未来 24 小时有活动吗？
- [ ] GitHub 通知 - 有新的 Issues/PR 吗？

## 检查规则

1. 工作时间（9:00-22:00）每小时检查
2. 深夜（22:00-9:00）仅紧急情况提醒
3. 有重要事项时主动通知
4. 没有事项时回复 HEARTBEAT_OK
```

### 4. Memory 管理规范

基于我们实际使用的管理方式：

**日常记录**：`memory/YYYY-MM-DD.md`
- 今天做了什么
- 遇到的问题和解决方案
- 重要决策和想法

**长期记忆**：`MEMORY.md`
- 每周整理一次日常记录
- 提取重要信息到 MEMORY.md
- 保持精简（< 5000 字）

**安全规则**：
- MEMORY.md 只在主会话加载（不在群聊）
- 敏感信息放在 `~/.openclaw/secrets/`

**示例**：

```bash
# 今天的记录
cat >> memory/2026-03-01.md << 'EOF'
## 2026-03-01

### 完成
- 部署了 OpenClaw
- 配置了飞书对话

### 问题
- Kimi API Key 格式错误 → 不要包含空格

### 决策
- 使用社区版飞书扩展
EOF

# 更新长期记忆
cat >> MEMORY.md << 'EOF'
## 踩坑记录
- Kimi API Key 不要包含空格
- 飞书权限要完整配置
EOF
```

### 5. 群聊礼仪配置

如果 OpenClaw 会加入群聊，在 `AGENTS.md` 中添加：

**何时说话**：
- 被 @ 或直接提问
- 能提供真正有价值的信息
- 纠正重要错误

**何时沉默（HEARTBEAT_OK）**：
- 人类之间的闲聊
- 问题已被回答
- 只想说"好的"、"赞"

**使用 Emoji 反应**：
- 认可：👍 ❤️ 🙌
- 有趣：😂 💀
- 思考：🤔 💡
- 确认：✅ 👀

**原则**：参与，不要主导。质量 > 数量。

---

## 验证部署

### 1. 检查服务状态

```bash
openclaw status
```

应该看到：
- ✅ Gateway: running
- ✅ Providers: connected (kimi, kimi-coding)
- ✅ Channels: connected (feishu)

### 2. 测试对话

在飞书里 @你的机器人：

```
你好，帮我检查一下系统状态
```

机器人应该回复当前时间、系统信息等。

### 3. 测试代码能力（如果配置了 Kimi Coding Plan）

```
帮我写一个 Python 脚本，读取 CSV 文件并统计行数
```

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
