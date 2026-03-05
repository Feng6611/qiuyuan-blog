---
slug: opus-effort-investigation
date: '2026-03-05'
title: 'Opus Effort 排查报告'
description: '一次从配置到请求体的完整排查与临时修复。'
keywords:
  - openclaw
  - claude-opus
  - effort
  - payload
  - proxy
tags:
  - openclaw
  - claude
  - 排障
  - 工程实践
---

这篇记录一次真实的线上排查：
目标很简单，`Opus=effort:max`，`Sonnet=effort:high`，thinking 都用 `adaptive`。

实际却不是这样。

## 现象

配置里已经写了：
- Opus: `thinking=adaptive`, `effort=max`
- Sonnet: `thinking=adaptive`, `effort=high`

但真实请求体里，Opus 经常不是 `max`，而是 `high`，甚至在某些会话里是 `medium`。

## 排查过程

我按三层去看：

1. **配置层**：`openclaw.json` 是否写对。
2. **运行层**：session 实际模型与 thinking level 是什么。
3. **请求层**：真正发给上游的 payload 到底是什么。

为了看清请求层，启用了 Anthropic payload 日志，抓到了每次 request 的 `thinking` 与 `output_config`。

## 关键发现

### 1) 配置不等于最终请求体

OpenClaw 的通用 extra params 路径不会把 `effort=max` 直接透传到 Anthropic payload。
所以你在配置里写了，不代表最终一定按这个发。

### 2) `adaptive` 会走内部映射

在某些链路里，`thinking=adaptive` 会先映射成内部 effort（常见是 `medium`），
然后再进入发送阶段。

### 3) 多 agent 会话各自有运行态缓存

即使主配置改了，不同 agent 的运行态模型缓存不一定立刻一致。
同一时间，不同 agent 可能发出不同 effort。

## 临时修复方案

先不改 OpenClaw 核心代码，采用**最小可行工程修复**：

- 增加本地代理：`codesome-effort-proxy.js`
- 把 `custom-v3-codesome-cn` 的 baseUrl 指向本地代理
- 代理按模型强制重写：
  - `claude-opus-4.6` -> `output_config.effort = max`
  - `claude-sonnet-4.6` -> `output_config.effort = high`
  - 两者统一 `thinking.type = adaptive`
- 用 systemd 常驻托管，避免进程掉线

这个方案的好处是：
- 改动小
- 可回滚
- 立刻生效

## 验证结果

从代理日志看，重写规则稳定命中：
- Opus 请求被改为 `effort=max`
- Sonnet 请求被改为 `effort=high`

也就是说，尽管某些“重写前日志”仍会看到 `medium/high`，
但**上游最终收到的是我们强制后的值**。

## 后续计划

临时方案已经解决当前需求，但不是终点。
下一步应做正式修复：

1. 在 OpenClaw 的 Anthropic payload 组装链路中补 provider-specific effort 注入。
2. 统一 pre-send 与 post-send 可观测性，避免日志语义混淆。
3. 增加针对 Opus/Sonnet 的回归测试，确保配置值可预期落地。

## 总结

这次排查再次说明一个工程常识：

**“配置正确”不是终点，“请求体正确”才是。**

当链路较长、运行态较复杂时，必须把观测点放到最终发送层，
否则很容易陷入“看起来都对，但实际不对”的错觉。
