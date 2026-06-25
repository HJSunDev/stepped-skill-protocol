# Stepped Skill Protocol

**简体中文** | [English](README.en.md)

Stepped Skill Protocol（SSP，分步 Skill 协议）是一个兼容 Agent Skills 的约定，用于把天然多阶段的工作打包成一条有限的本地 step 文件链。

SSP 保留 `SKILL.md` 作为普通 Skill 的入口，同时把高保真的阶段说明放进按需读取的 step 文件。它的核心目标是通过静态分布获得阶段聚焦：当前 step 足以完成当前任务，下一步只在真正相关时才被读取。

SSP 不是 workflow engine、planner、权限系统，也不是安全边界。它是一个很小的协议层：让 Skill 今天可以优雅降级使用，未来也能被 runtime 原生增强。

## 为什么需要 SSP

很多有价值的 agent 工作并不是一个连续 prompt，而是天然分阶段：

- 先收集信息，再综合判断，再产出最终简报；
- 先检查代码库，再评估风险，再写改进建议；
- 先梳理迁移面，再分类阻塞点，再制定上线计划。

没有 SSP 时，用户通常会手动把这些阶段一段一段交给 agent。SSP 要把这种手动分阶段投喂的工作方式，变成可复用、可分发的 Skill 包。

## 一分钟模型

一个 SSP 包首先仍然是普通 Agent Skill：

- `SKILL.md` 仍然是入口，并且包含完整的普通 fallback。
- `metadata.stepped-skill.entry` 指向第一个本地 step 文件。
- 每个 step 包含一个阶段的目标、资源、指令、输出契约、handoff 和 `Next`。
- `Next` 要么是另一个本地 step 路径，要么是 `END`。

最小循环是：

```text
读取 SKILL.md -> 读取 entry step -> 完成当前 step -> 读取 Next -> 在 END 停止
```

SSP v0 有意保持有限、线性、基于本地文件、容易验证。这种克制本身就是产品选择。

## 执行层级

SSP 支持渐进采用：

- **L0 普通 Skill**：任何 agent 都可以使用 `SKILL.md` 中的 fallback workflow。
- **L1 模型自驱 SSP**：具备本地文件读取能力的 agent 可以沿着 `Entry -> Step -> Next -> END` 执行。
- **L2 Runtime 原生 SSP**：runtime 可以验证 manifest，并进一步强制当前 step 作用域访问。

L0 和 L1 提供的是静态分布与流程引导，不是强隔离。涉及安全敏感的作用域访问时，需要 L2 runtime 执行层支持。

## 仓库结构

- `docs/` - 架构、作者指南、安全、验证、conformance 和评估文档。
- `examples/` - Stepped Skill 示例包。
- `skills/` - 帮助 agent 编写或审查 SSP 包的普通 Agent Skills。
- `conformance/fixtures/` - 有效和无效的协议夹具。
- `tools/` - 参考验证器、manifest 生成器和评估工具。
- `eval-runs/` - 生成的评估运行包。

## 编写与验证

先阅读作者指南：

- [Authoring Guide](docs/authoring-guide.md)
- [Validation Rules](docs/validation-rules.md)
- [Conformance Suite](docs/conformance-suite.md)

## 安装作者 Skill

SSP 内置了可移植的普通 Agent Skills，用来教 agent 编写 SSP 包。它们本身故意不是 SSP 包。

- [`skills/stepped-skill-author/`](skills/stepped-skill-author/) - 简体中文，默认包
- [`skills/stepped-skill-author-en/`](skills/stepped-skill-author-en/) - 英文包

### 方式一：直接让 Agent 安装

打开你正在使用的 agent runtime，然后告诉它：

```text
帮我安装 SSP authoring skill：https://github.com/HJSunDev/stepped-skill-protocol
中文使用 stepped-skill-author，英文使用 stepped-skill-author-en。
```

### 方式二：使用 Skills CLI

```bash
npx skills add HJSunDev/stepped-skill-protocol --skill stepped-skill-author
npx skills add HJSunDev/stepped-skill-protocol --skill stepped-skill-author-en
```

如果要安装到指定 runtime，可以追加 `-a codex`、`-a claude-code`、`-a cursor` 或其他受支持的 agent 参数。

### 方式三：手动安装

把其中一个完整 skill 目录复制到你的 agent skills 目录：

```text
skills/stepped-skill-author/
skills/stepped-skill-author-en/
```

每个目录都是自包含的，可以脱离本仓库使用。如果你的 runtime 不支持自动加载 Agent Skills，也可以直接打开对应的 `SKILL.md` 和 `references/` 文件，把它们作为 Markdown 指南交给 agent 使用。

Agent Skills 目前没有标准的同目录多语言 `SKILL.md` 约定，所以每种语言以独立自包含 Skill 目录存放。本项目把中文作者 Skill 作为默认包，英文作者 Skill 使用 `-en` 后缀。

## 项目状态

SSP 目前是 pre-M1 架构草案。

仓库已经包含架构说明、示例、验证规则、conformance fixtures、作者指南、安全说明、参考验证器原型、manifest 生成器原型，以及 M1 评估框架。

它还不是已经被证明的公开协议。任何公开价值主张都需要真实 M1 评估结果支撑：完成的运行、盲审评分、链路完成率，以及明确的发布决策。

`tools/` 中的工具是用于协议不变量的参考原型。生产级验证器应该使用完整 YAML parser 处理 Agent Skills frontmatter。

公开推广前，SSP 仍然需要真实 M1 运行、从架构说明中拆出的正式 specification、贡献和治理规则、发布许可证，以及 changelog。

## 主要参考

- [Agent Skills Specification](https://agentskills.io/specification)
- [Anthropic Agent Skills docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Anthropic Skills repository](https://github.com/anthropics/skills)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

## 快速检查

```bash
node tools/validate-ssp.mjs --mode source examples/research-brief
node tools/generate-manifest.mjs --check examples/research-brief examples/multi-phase-review conformance/fixtures/agent-skill-optional-fields
node tools/run-conformance.mjs
node tools/check-m1-readiness.mjs
node tools/summarize-m1-eval.mjs
```

## 生成 Manifest

发布包包含生成的 `.ssp/manifest.json`。作者应该编辑 `SKILL.md` 和 step 文件，然后重新生成 manifest：

```bash
node tools/generate-manifest.mjs path/to/skill-package
```

检查现有 manifest 是否最新：

```bash
node tools/generate-manifest.mjs --check path/to/skill-package
```

## 重新生成评估包

这个命令会重写 `eval-runs/m1-draft/` 下生成的 M1 运行包：

```bash
node tools/prepare-m1-eval.mjs
```

## 路线图

在 SSP 从草案走向稳定公开版本之前，项目会重点推进：

- 将规范性 specification 与架构说明分离；
- 保持 source form 和 publication form 示例可验证；
- 围绕真实编写和实现问题扩展 conformance fixtures；
- 收集 SSP 对天然分阶段任务有效的评估证据；
- 完成许可证、贡献规则、治理规则和 changelog 策略。
