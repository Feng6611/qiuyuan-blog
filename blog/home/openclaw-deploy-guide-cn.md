---
slug: openclaw-deploy-guide-cn
date: '2026-02-26'
title: 'OpenClaw 部署指南'
description: '让新手在 30 分钟内拥有自己的 AI Agent 服务。'
keywords:
  - openclaw
  - deploy
  - vps
  - minimax
  - feishu
---

**目标**: 让新手在 30 分钟内拥有自己的 AI Agent 服务

**你需要**:
- 一台国内 VPS (阿里云轻量服务器，约 ¥30/月)
- 一个本地 AI Agent 客户端 (Claude Code / Kimi / Cursor 等)
- 一个 MiniMax API Key (国内大模型，速度快)

---

## 第一步 购买阿里云 VPS

推荐配置：
- **CPU**: 2核
- **内存**: 2GB
- **系统**: Ubuntu 22.04 LTS
- **带宽**: 3Mbps (够用)
- **预算**: ¥30-50/月

**购买地址**: [阿里云轻量应用服务器](https://www.aliyun.com/product/swas)

**新用户优惠**: 经常有 99元/年 的活动，建议先买一年。

购买后你会得到：
- IP 地址 (如 `123.45.67.89`)
- root 密码 (首次登录需要重置)
- SSH 端口 (默认 22)

---

## 第二步 本地准备 Agent 客户端

你需要一个能在本地运行的 AI 助手，用来远程操作 VPS。

### 选项 A: Claude Code (功能最强)
```bash
# 安装
npm install -g @anthropics/claude-code

# 运行
claude
```

### 选项 B: Kimi CLI (国内友好)
```bash
# 安装
npm install -g @kimi-ai/cli

# 运行
kimi
```

### 选项 C: Cursor (带图形界面)
下载 [Cursor](https://cursor.sh/)，按 `Ctrl+~` 打开终端。

**选择标准**: 能 SSH 连接服务器，能执行命令就行。

---

## 第三步 让 Agent 帮你安装 OpenClaw

连接 VPS，把安装交给 AI：

```bash
# SSH 连接你的 VPS
ssh root@YOUR_VPS_IP

# 然后把以下提示发给你的本地 Agent：
"帮我在这台 Ubuntu 服务器上安装 OpenClaw。
参考官方文档: https://docs.openclaw.ai/installation"
```

Agent 会自动执行：
1. 更新系统包
2. 安装 Node.js 22+
3. 安装 OpenClaw: `npm install -g openclaw`
4. 初始化配置: `openclaw init`
5. 配置 systemd 服务

你只需在关键时刻提供确认。

---

## 第四步 配置 MiniMax API Key

推荐使用 **MiniMax**，国内大模型，速度快、价格优。

### 获取 MiniMax API Key

1. 访问 [MiniMax 开放平台](https://www.minimaxi.com/platform)
2. 注册账号并完成实名认证
3. 创建应用，获取：
   - **API Key**: `你的key`
   - **Group ID**: `你的group_id`

**价格**: 新用户有免费额度，后续约 ¥0.01/千 tokens，很便宜。

### 配置到 OpenClaw

```bash
# 编辑配置文件
nano ~/.openclaw/openclaw.json
```

填入你的配置：
```json
{
  "providers": [
    {
      "name": "minimax",
      "apiKey": "你的minimax-api-key",
      "groupId": "你的group-id",
      "model": "minimax-text-01"
    }
  ]
}
```

重启服务：
```bash
openclaw gateway restart
```

---

## 第五步 接入飞书

飞书是国内最方便的接入方式，支持单聊和群聊。

### 飞书应用配置

1. **创建企业** (个人也可以):
   - 访问 [飞书开放平台](https://open.feishu.cn/)
   - 点击"创建企业自建应用"
   - 填写应用名称和描述

2. **获取凭证**:
   - 进入"凭证与基础信息"
   - 复制 **App ID** 和 **App Secret**

3. **配置权限**:
   - 进入"权限管理"
   - 添加以下权限：
     - `im:chat:readonly` (读取群信息)
     - `im:message:send` (发送消息)
     - `im:message.group_msg` (接收群消息)
     - `im:message.p2p_msg` (接收单聊消息)

4. **发布应用**:
   - 进入"版本管理与发布"
   - 创建版本，填写更新说明
   - 点击"申请发布"
   - 自己审批通过 (企业管理员就是自己)

5. **添加机器人到聊天**:
   - 在飞书中搜索你的应用名称
   - 添加到单聊或群聊

### 配置到 OpenClaw

```bash
nano ~/.openclaw/openclaw.json
```

添加 channels：
```json
{
  "channels": [
    {
      "name": "feishu",
      "type": "feishu",
      "appId": "cli_xxxxxxxxxxxx",
      "appSecret": "你的app-secret",
      "encryptKey": "",
      "verificationToken": ""
    }
  ]
}
```

**注意**: 飞书需要配置 webhook 回调地址，如果不需要事件推送，可以留空加密相关字段。

### 配置事件订阅 (可选，用于接收消息)

如果需要机器人主动接收消息：

1. 进入飞书应用的"事件与回调"
2. 配置请求地址: `http://你的VPS_IP:8787/feishu/webhook`
3. 添加订阅事件：
   - `im.message.receive_v1` (接收消息)

重启并测试：
```bash
openclaw gateway restart
```

在飞书里 @你的机器人，看看能否回复！

---

## 验证部署

运行健康检查：
```bash
openclaw status
```

应该看到：
- Gateway: running
- Providers: connected (minimax)
- Channels: connected (feishu)

发送测试消息给你的机器人，确认能正常对话。

---

## 常见问题

**Q: 为什么推荐阿里云而不是国外 VPS？**
A: 国内访问快，备案简单，价格透明。MiniMax 和飞书都是国内服务，阿里云网络延迟最低。

**Q: MiniMax 和 GPT/Claude 比怎么样？**
A: 日常对话足够用，中文理解好，价格便宜。复杂推理任务可以后续再接入 Claude。

**Q: 飞书个人能用吗？**
A: 可以。创建"个人使用"的企业，不需要营业执照。

**Q: 安全吗？**
A: 基础安全：改 SSH 端口、禁用密码登录用密钥、配置阿里云安全组。生产环境建议再加一层。

---

## 下一步

部署成功后，你可以：
- 创建自定义 Skills (自动化脚本)
- 设置定时任务 (heartbeat/cron)
- 接入更多渠道 (微信/钉钉)
- 部署多个 Agent 协作

遇到问题可以查看 [OpenClaw 文档](https://docs.openclaw.ai) 或加入社区交流。

---

**部署时间**: 约 30 分钟  
**月度成本**: ¥30 (阿里云) + ¥5-10 (MiniMax)  
**收获**: 一个 24小时在线的个人 AI 助手
