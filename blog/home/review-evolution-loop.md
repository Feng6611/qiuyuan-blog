---
slug: review-evolution-loop
date: '2026-03-11'
title: '把 Review 变成进化回路'
description: 'Hermes 的关键机制不是定时任务，而是把复盘、记忆、技能沉淀嵌进 Agent 主循环。'
keywords:
  - hermes
  - openclaw
  - nanoclaw
  - review
  - agent
  - memory
  - skill
tags:
  - agent
  - 机制设计
  - 工作流
  - review
---

很多人第一次看 Hermes，会把它总结成一句话：

“它会自己学习。”

这句话没错，但不够准确。更准确的说法是：

**Hermes 把 Review 做成了一条持续运行的进化回路，而不是一条定时跑批任务。**

这也是它和“给 OpenClaw 加几个 cron 任务”的本质区别。

## 先说结论

如果你只做定时任务，你得到的是：

- 定期复盘
- 定期写 memory
- 定期产出总结

这已经很有价值，但它仍然是“外挂流程”。

Hermes 的特殊点在于：

- 复盘触发点在 **Agent 主循环内部**
- 记忆写入和技能沉淀在 **关键节点自动触发**
- 历史检索和用户建模在 **系统层常驻**

也就是说，它不是“定时想起来学一学”，而是“每次工作都在学习”。

## 重要机制一 轮次阈值触发的学习提醒

Hermes 在对话主循环里维护计数器。

当达到阈值时，会自动注入提醒：

- 聊了若干轮后，提醒“是否写入 memory”
- 工具调用轮次很高后，提醒“是否沉淀成 skill”

这个设计有两个好处：

1. **和任务强耦合**：复杂任务刚做完，经验最热，马上沉淀
2. **低侵入**：不是每轮都打断，只在阈值点提示

这和“每天晚上 9 点统一复盘”不同。后者容易漏掉现场信息，前者更接近“趁热打铁”。

## 重要机制二 上下文压缩前的记忆抢救

Agent 长对话会遇到上下文压缩或会话重置。

Hermes 在这些“可能遗忘”的节点前，会主动触发 memory flush：

- 先让模型快速判断有哪些内容值得长期保留
- 然后写入 memory/skill
- 再进入压缩或重置

这个机制非常关键，因为它把“遗忘风险”变成了“沉淀机会”。

很多系统的问题是：

- 压缩做了
- 上下文变短了
- 但有价值的细节也一起丢了

Hermes 的做法是先抢救再压缩，顺序是对的。

## 重要机制三 工具链闭环而不是脚本拼接

Hermes 的 memory、session_search、skill_manage 不是松散脚本，而是内建工具链。

典型闭环是：

1. 当前任务执行
2. 检索历史类似任务（session_search）
3. 完成后提炼要点（memory）
4. 发现可复用流程后固化（skill_manage）
5. 后续任务再次调用并继续优化

这条链路有“自反馈”结构：

- 技能被使用
- 使用中暴露不足
- 再次优化技能

所以它不是一次性产物，而是版本迭代对象。

## 重要机制四 系统级的跨会话检索

Hermes 把会话存入 SQLite + FTS5。

这意味着历史不是“仅归档”，而是“可检索、可召回、可参与当前决策”。

如果没有这层能力，所谓“学习”很容易沦为：

- 写了很多文档
- 但下次根本找不到
- 找到了也来不及用

学习闭环的核心不只是“存”，更是“用”。

## 重要机制五 用户建模作为第二记忆通道

Hermes 还有 Honcho 用户建模通道。

可以把它理解为：

- 一条是任务记忆（事实、流程、技能）
- 一条是用户记忆（偏好、风格、稳定习惯）

两条线并行，结果是：

- 任务越做越熟
- 对人也越理解越稳定

这对长期协作特别重要。

## 那 OpenClaw 能不能做出类似进化回路

能做，而且完全值得做。

但建议是：

**cron 只负责兜底，真正价值在 hooks + 主流程节点触发。**

一个可执行的最小方案：

- 用 cron 做每日/每周全局复盘
- 用 `agent_end` 做任务后即时提炼
- 用 `before_compaction` 做压缩前记忆抢救
- 用技能把“复盘→提炼→沉淀”固化为标准动作

这样就从“定时复盘系统”升级为“事件驱动学习系统”。

## 一个简短英文总结

Hermes is not special because it runs scheduled reviews.

It is special because review, memory flush, and skill crystallization are embedded inside the agent loop and triggered at high-value moments (iteration thresholds, pre-compaction, session transitions).

That turns learning from a periodic batch task into a continuous feedback loop.

## 收尾

如果你也在做 Agent 工作流，建议先问自己一个问题：

**你的 Review 是“按时间发生”，还是“按价值节点发生”？**

前者可用，后者才会进化。
