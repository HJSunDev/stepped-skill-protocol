# Stepped Skill Protocol (SSP) 架构草稿

## 0. 需求源头：初始想法原文

```text
我有一个想法需要被记录；Anthropic 的 Cloud 出了很多规范和协议，对吧？我记得它出过 Skill 和 MCP，应该都是它出的。它是不是还在 GitHub
  上有一个仓库，专门放 Skill 的协议和内容？我不是很确定，但好像在某视频上看到过，是 GitHub 上的一个仓库，关于 Skill 的，算是官方配套的东西。

  我现在的想法是，想自己或由我们一起来定义一个新的协议。目前的 Skill 有几个部分：标题、描述（说明何时适合触发）、具体内容（告诉大模型如何完成操作）。但目前的 Skill 只是对大模型行动的指引，没有参与到模型编排中
  。比如把任务过程分成几步：第一步大模型接收信息并执行，完成后回到流程看第二步，给第二步内容继续执行，以此类推。也就是说，内容分步给，它分步接收。最好第一步只能看到第一步内容，第二步只能看到第二步内容。

  这其实是一个加强版 Skill。原来 Skill 是一次告诉所有内容，让它自己干；但分批告诉、分多次完成，效果会更好。所以这是一个加强版 Skill，第一次看第一次内容，第二次看第二次内容。总体格式和原来 Skill
  区别不大，核心是有明显标记或定义的协议，让智能体分多次接收 Skill 的这一步信息并执行。步数必须有限，协议有规范。

  这个协议明显需要智能体内部配合。原来 Skill 对任何智能体都能用，但这个新协议的 Skill 需要智能体内部配合，所以我们从自己的执行开始配合。

  关键是先把这个协议做好，另外是不是也需要一个独立仓库放这个协议，会更专业？这是我大概的想法
```

---

## 1. 协议定位

协议名：**Stepped Skill Protocol**

简称：**SSP**

中文名：**分步 Skill 协议**

传播名：**Stepped Skill**

面向作者、用户和社区传播时，优先说 **Stepped Skill**：一个带步骤的 Skill。面向规范、验证器和 runtime 时，使用 **Stepped Skill Protocol (SSP)**。顶级传播不能先把用户拖进协议复杂度里；用户先理解“这是 Skill”，再理解“它能分步执行”。

一句话定义：

> Stepped Skill Protocol 是 Agent Skills 的向后兼容增强层：它把一个 Skill 的高保真操作内容组织成有限、静态、链式的 step，让模型在一次 execution 中完成当前 step 的交付物后，再读取当前 step 指向的 next step，直到 `END`。

SSP 不是新的插件格式，不是 workflow engine，也不是 agent runtime API。它首先是一个合法 Skill，其次才是一个分步增强 Skill。

SSP 的核心能力不是“提示模型别看后面”，而是：

> 把后续步骤从当前上下文中物理移出；把当前 step 设计到足够完整；让 next step 只在当前 step 完成后才变得相关。

这使 SSP 顺着模型变聪明的方向工作。聪明模型不需要被禁令压住，它只需要看到一个充分、清晰、边界完整的当前任务。

### 1.1 v0 范围

SSP v0 必须保持克制。

v0 是：

- single-entry；
- finite；
- linear；
- local-file based；
- Skill-compatible。

v0 不是：

- branching workflow；
- dynamic router；
- multi-agent planner；
- permission system；
- general automation engine。

因此 v0 只有一个 entry step，每个非终止 step 只有一个 `Next`，整条链只有一个显式 `END`。条件分支、并行步骤、循环、动态选择下一步，都留给未来版本。

产品判断：

> v0 先把“线性分布读取”做到极稳。顶级协议不是第一版就覆盖所有形态，而是第一版把最小本质做成标准。

## 2. 产品本质

用户真正需要的不是“更复杂的 Skill 格式”，而是把今天手动多次交给 agent 的一组任务，变成一个可复用、可分发、可执行的 Skill。

普通 Skill 的典型体验：

1. Skill 被触发。
2. 模型一次性读取完整操作说明。
3. 模型在同一大段说明中自己分辨先后、轻重、边界。

Stepped Skill 的目标体验：

1. Skill 被触发。
2. 模型读取 `SKILL.md` 中的能力说明、fallback、协议胶囊和 entry step。
3. 当前 step 给出完成当前任务所需的一切。
4. 模型完成当前 step 的交付物，并记录 handoff。
5. 模型读取当前 step 的 `Next`。
6. `Next` 是 step 文件时继续；`Next` 是 `END` 时结束。

适合 SSP 的任务不是“被硬拆开的耦合任务”，而是天然包含多个**相对解耦、顺序固定、边界清晰**的子任务。今天用户会手动分几次给 agent，SSP 要把这种人工链式交付产品化。

## 3. 顶层原则

1. **Skill-first**：SSP 必须完全兼容 Agent Skills。一个 SSP 包首先是一个普通 Skill。
2. **No empty shell**：不懂 SSP 的 agent 只读 `SKILL.md` 时，也必须得到一个可执行的低保真完整方案。
3. **High-fidelity by steps**：高保真操作说明放在 step 中，通过链式读取逐步出现。
4. **Current-step sufficiency**：每个 step 必须足以完成当前任务。聚焦来自“无需看未来”，不是“禁止看未来”。
5. **One loop**：模型侧协议规则尽量只有一条主循环：完成当前 step 的交付物和 handoff，然后读取 `Next`；`END` 即停止。
6. **Static distribution, not secrecy**：SSP 在物理文件层面分布提示词，默认不把全部内容放进上下文；但没有权限层时，它不是安全隔离。
7. **Machine-verifiable**：发布级 SSP 包必须能被静态工具验证：入口、链路、资源、handoff、无环、终点、schema。
8. **Progressive adoption**：同一个包必须支持普通 agent、自驱读取 agent、原生 SSP runtime 三档能力。
9. **Authoring stays human**：作者应主要编写 `SKILL.md` 和 step 内容；manifest、索引、校验摘要应由工具生成。顶级协议不能把机器负担推给作者。

### 3.1 核心术语

SSP 必须把概念切清，否则后续 spec、validator、runtime、示例包会各自理解。

| 术语 | 定义 |
| --- | --- |
| Stepped Skill | 对外传播名：一个兼容 Agent Skills 的分步 Skill |
| SSP | 协议名：Stepped Skill Protocol |
| Skill Package | 一个合法 Agent Skill 目录，包含 `SKILL.md` 和可选资源 |
| Step File | `steps/*.md` 中的静态文件，承载一个高保真执行单元 |
| Step Execution | 一次 execution/run 中执行某个 Step File 的运行期事件 |
| Output | 当前 Step Execution 必须产出的交付物 |
| Handoff | 从当前 step 传给下一 step 的最小运行期状态 |
| Transition | 从当前 step 的 `Next` 指向下一 step 或 `END` 的转移 |
| Manifest | `.ssp/manifest.json`，发布级机器索引和校验证明 |

产品判断：

> Step File 是内容单元；Step Execution 是运行事件；Handoff 是运行期状态；Manifest 是机器索引。四者不能混成一个概念。

### 3.2 规范语言

SSP 文档使用规范关键词表达实现要求：

- **MUST** / **MUST NOT**：实现、包、validator 或 runtime 必须满足；否则不能声称满足对应 conformance level。
- **SHOULD** / **SHOULD NOT**：强烈建议；可以偏离，但必须有清晰理由，且不能破坏互操作性。
- **MAY**：允许的可选能力；不能作为其他实现必须依赖的前提。

中文说明中的“必须”“不得”“应该”“可以”分别对应上述语义。公开 specification 应统一使用这些关键词，并避免把产品建议写成规范强制。

Product judgment:

> 顶级协议要让实现者知道什么是硬要求，什么是最佳实践，什么只是可选增强。模糊的规范语言会直接制造生态分裂。

## 4. 采用层级

SSP 必须让使用者一眼知道自己支持到哪一层。

### L0：普通 Skill 兼容层

能力要求：agent 能读取 `SKILL.md`。

体验：

- agent 看到普通 Skill 的 `name` / `description` / `SKILL.md`。
- agent 可按 `SKILL.md` 的 fallback workflow 完成一个低保真版本。
- agent 不需要理解 SSP metadata，也不需要读取 step 文件。

成功标准：

> L0 下不能是空壳。它可以不如 L1/L2 精细，但必须能工作。

### L1：模型自驱 step 读取层

能力要求：agent 能按 Skill 指令读取本地资源文件。

体验：

- agent 读取 `SKILL.md`。
- 模型看到 Protocol Capsule 和 entry step。
- 模型按 `Next` 链路读取 step。
- 每个 step 产出 Output 和 Handoff。

成功标准：

> L1 是 SSP v0 的主战场：不需要 runtime 主动编排，但能获得链式分布读取的主要收益。

### L2：Runtime-native SSP 层

能力要求：agent runtime 原生识别 SSP。

体验：

- runtime 识别 metadata；
- runtime 只注入当前 step；
- runtime 可限制未来 step 读取；
- runtime 捕获 handoff 和 step trace；
- runtime 进行 validator 检查和 UI 展示。

成功标准：

> L2 提供硬保证和更好体验，但不是 SSP 成立的前提。

### 4.1 L1 资源访问契约

L1 不要求 runtime 原生理解 SSP，但要求执行环境提供一个普通的本地资源读取能力。

Resource access contract:

- The readable root is the Skill root.
- The model should request exact skill-root relative file paths.
- The model should not need directory listing to run a valid SSP package.
- The entry path comes from `SKILL.md` metadata and Protocol Capsule.
- Step resources come from the current step's `Resources`.
- The next step path comes from the current step's `Next`.
- A resource read returns file content or a clear failure.
- Directory reads are not required by SSP.
- Network reads are not required by SSP.
- `.ssp/manifest.json` is not required for L1 execution.

Failure handling:

- If the entry step cannot be read, use L0 fallback or report that the Stepped Skill path is unavailable.
- If a current-step resource cannot be read, complete what can be completed only when the step still satisfies its Completion Criteria; otherwise ask for missing material.
- If `Next` cannot be read, stop the SSP chain and report the broken transition. Do not invent a next step.

This keeps L1 portable: any agent that can read exact local Skill resource paths can attempt SSP without native runtime support.

## 5. 内容平面

SSP 有五个内容平面，职责不能混。

| 平面 | 载体 | 模型是否默认读取 | 职责 |
| --- | --- | --- | --- |
| Skill plane | `SKILL.md` | 是 | 触发说明、能力承诺、L0 fallback、协议胶囊、entry |
| Step plane | `steps/*.md` | 链式读取 | 高保真分步操作说明 |
| Resource plane | `references/` / `scripts/` / `assets/` | 当前 step 按需读取 | 当前 step 所需资料、脚本、模板 |
| Control plane | `.ssp/manifest.json` | 否 | validator / registry / runtime 的完整链路与校验信息 |
| Execution plane | 对话上下文 / runtime state | 运行期可见 | Output、Handoff、step trace |

关键判断：

- `SKILL.md` 不是空壳；
- `steps/` 不是隐藏秘密，而是高保真链路；
- `.ssp/manifest.json` 不是模型执行材料；
- `.ssp/manifest.json` 是生成物，不是作者手写源文件；
- Handoff 不写回包内文件，它存在于 execution 中；
- Handoff 默认是内部执行交接物，不是最终用户回答的一部分。

## 6. 包结构

推荐结构：

```text
my-stepped-skill/
  SKILL.md
  .ssp/
    manifest.json
  steps/
    collect.md
    synthesize.md
    finalize.md
  references/
    source-guidelines.md
  scripts/
    ...
  assets/
    ...
```

约束：

- `SKILL.md` 是唯一公开入口。
- `steps/` 存放 step 文件。
- `.ssp/manifest.json` 是控制平面文件，供 validator / registry / runtime 使用；`SKILL.md` 和 step 正文不应要求模型读取它。
- step 文件名可以表达当前任务，但不应泄露未来答案或关键结论。
- 面向发布的 SSP 包 MUST 提供 `.ssp/manifest.json`。
- 本地实验草稿 MAY 暂时省略 `.ssp/manifest.json`，但不能进入发布级协议包。
- 作者 SHOULD NOT 手写 `.ssp/manifest.json`；它 SHOULD 由工具从 `SKILL.md` metadata 与 step 正文生成。

`.ssp/manifest.json` 示例：

```json
{
  "protocol": "stepped-skill",
  "version": "0.1",
  "entry": "steps/collect.md",
  "steps": [
    {
      "id": "collect",
      "path": "steps/collect.md",
      "next": "steps/synthesize.md",
      "resources": ["references/source-guidelines.md"]
    },
    {
      "id": "synthesize",
      "path": "steps/synthesize.md",
      "next": "steps/finalize.md",
      "resources": []
    },
    {
      "id": "finalize",
      "path": "steps/finalize.md",
      "next": "END",
      "resources": []
    }
  ]
}
```

作者源文件的权威来自 `SKILL.md` metadata 与 step 正文，特别是 `Resources` 和 `Next`。Manifest 是发布级机器权威；工具生成 manifest 后，validator 用它进行包级检查。模型可见链路只需要当前 step 的 `Next`。

### 6.1 路径、ID 与 manifest 生成规则

SSP 必须让不同 validator 生成同一份 manifest。

Canonical rules:

- Skill root is the directory containing `SKILL.md`.
- All protocol paths MUST be relative to skill root.
- Protocol paths MUST use `/` as separator.
- Protocol paths MUST NOT start with `/`, contain drive letters, contain backslashes, contain `..`, contain query/hash fragments, or be URLs.
- Step files MUST live under `steps/` and end with `.md`.
- `Resources` entries MUST point to files, not directories.
- `Resources` entries MUST NOT point into `.ssp/`.
- Published packages SHOULD use lowercase ASCII filenames for step files to maximize portability.

Generated step id:

- If a generated frontmatter `ssp.id` is needed, derive it from the canonical step path.
- Remove the leading `steps/`.
- Remove the trailing `.md`.
- Replace `/` with `.`.
- The result MUST match `[a-z0-9][a-z0-9._-]*`.
- If the generated id would be invalid or duplicated, publication validation MUST fail unless the source explicitly provides a valid unique id.

Manifest generation:

- Read `metadata["stepped-skill.entry"]` as the entry path.
- Follow body `## Next` from entry until `END`.
- Add each step to `manifest.steps` in execution order.
- Copy each step's canonical `path`, generated or explicit `id`, canonical `next`, and canonical `resources`.
- The terminal step MUST have `next: "END"`.
- The manifest MUST contain exactly the reachable linear chain. Unreachable step files MAY exist in drafts but MUST fail publication validation.
- Re-running generation on the same source MUST produce byte-equivalent JSON except for formatting chosen by the generator.

Version handling:

- `stepped-skill.version`, step `ssp.version`, and manifest `version` describe the SSP protocol version.
- Tools MUST reject unsupported major versions.
- Tools MAY accept newer minor versions only when every used feature is known.

### 6.2 版本、扩展与治理

SSP v0 的最大风险不是能力不够，而是扩展过快导致互操作性坍塌。

Version policy:

- `0.x` versions are pre-1.0 draft versions.
- A minor version MAY add optional fields that older tools can ignore safely.
- A minor version MUST NOT change v0 linear execution semantics.
- A major version MAY introduce incompatible execution semantics.
- Branching, computed `Next`, parallel steps, remote resource loading, and dynamic routing require a future major version or an explicitly separate extension spec.

Reserved namespaces:

- `stepped-skill.*` is reserved for `SKILL.md` metadata keys.
- `ssp.*` is reserved for step frontmatter and manifest fields.
- `.ssp/` is reserved for control-plane generated artifacts.
- Third-party extensions MUST use a unique namespace, for example `example-org.feature`.

Extension rules:

- Extensions MUST NOT be required for L0 compatibility.
- Extensions MUST NOT be required for L1-ready package validity unless the package clearly declares that it needs that extension.
- Extensions MUST NOT redefine `Next`, `Handoff`, `Output`, or `END`.
- Extensions MAY add validator checks, registry metadata, authoring hints, UI hints, or runtime-specific optimizations.
- Unknown extension fields MUST be ignored by readers unless they are declared as required.

Required extensions:

- A package that requires an extension MUST declare it in metadata and manifest.
- `SKILL.md` metadata uses `stepped-skill.required-extensions` as a comma-separated list of extension ids.
- `.ssp/manifest.json` uses `requiredExtensions` as an array of extension ids.
- A validator MUST fail publication validation if a required extension is unknown.
- L1 self-directed execution SHOULD fall back to L0 if a required extension changes execution semantics.

Deprecation:

- Deprecated fields SHOULD remain valid for at least one minor version.
- Validators SHOULD warn before they fail deprecated fields.
- Breaking removals require a major version.

Product judgment:

> SSP should grow through disciplined extension points, not through silent mutation of v0. The v0 promise is linear distributed reading; do not break that promise in the name of flexibility.

Product judgment:

> Author source is human-readable; publication output is deterministic. If two tools generate different chains from the same package, the protocol has failed.

## 7. `SKILL.md` 结构

`SKILL.md` 必须保持普通 Skill 的可用性，并提供 SSP 增强入口。

### 7.0 Agent Skills 兼容契约

SSP 不能要求现有 Agent Skills 生态为它改变基础格式。一个 SSP 包必须先通过普通 Agent Skills 校验，再声明 SSP 增强能力。

Compatibility contract:

- `SKILL.md` MUST use YAML frontmatter followed by Markdown body.
- `name` and `description` MUST remain ordinary Agent Skills fields.
- `name` MUST follow Agent Skills naming rules: 1-64 characters, lowercase letters, numbers, single hyphens, no leading/trailing hyphen, no consecutive hyphens, and it MUST match the package directory.
- `description` MUST describe what the skill does and when to use it; it SHOULD NOT describe SSP mechanics as the primary value.
- `description` MUST stay within the Agent Skills length limit.
- `compatibility`, when present, MUST stay within the Agent Skills length limit.
- `name`, `description`, and `compatibility` values MUST be scalar strings, not arrays, nested objects, or unquoted YAML non-string scalars.
- `metadata` MUST remain a string-to-string map.
- `metadata` values MUST be scalar strings, not arrays, nested objects, or inline collections.
- `metadata` values that YAML would parse as numbers, booleans, or null MUST be quoted.
- SSP metadata keys MUST be namespaced with `stepped-skill.`.
- `compatibility` MAY mention SSP support, but ordinary agents must not need it to understand the skill.
- The full `SKILL.md` body is loaded when the skill activates, so SSP-specific content in `SKILL.md` must stay short.
- High-fidelity detail belongs in step files and resources, not in the activated `SKILL.md` body.
- File references SHOULD be skill-root relative paths.

Recommended compatibility field:

```yaml
compatibility: Works as an ordinary Agent Skill. Supports SSP L1 when the agent can read exact skill-root relative files.
```

Product judgment:

> SSP must feel like a natural evolution of Agent Skills, not a foreign format smuggled into `SKILL.md`.

推荐结构：

```markdown
---
name: research-brief
description: Use when the user needs a staged research brief with separate collection, synthesis, and finalization phases.
compatibility: Works as an ordinary Agent Skill. Supports SSP L1 when the agent can read exact skill-root relative files.
metadata:
  stepped-skill.version: "0.1"
  stepped-skill.entry: "steps/collect.md"
---

# Research Brief

## What This Skill Does

Creates a research brief through three phases: collect material, synthesize findings, and finalize the answer.

## Fallback Workflow

If you cannot use step files, complete the skill linearly:

1. Collect the needed material and note unresolved questions.
2. Synthesize the strongest findings.
3. Write the final brief with caveats and source notes.

This fallback is complete but lower fidelity. Use the step files when available.

## Stepped Skill Protocol

This skill uses Stepped Skill Protocol v0.1.

Protocol loop:

1. Read the entry step.
2. Complete the current step's Output.
3. Record an `SSP Handoff` block in the execution context.
4. Read the target named by `Next`; the next step may use the latest `SSP Handoff` as inherited state.
5. If `Next` is `END`, stop the chain and produce the final answer.

Entry: `steps/collect.md`
```

### 7.1 Metadata 兼容性

Agent Skills 的 `metadata` 是 string map。SSP 不使用嵌套对象。

合法：

```yaml
metadata:
  stepped-skill.version: "0.1"
  stepped-skill.entry: "steps/collect.md"
```

不合法：

```yaml
metadata:
  stepped-skill:
    version: "0.1"
    entry: "steps/collect.md"
```

### 7.2 Fallback 要求

Fallback 是 L0 体验的生命线。它必须包含：

- Skill 能力承诺；
- 适用输入和关键假设；
- 最小可执行线性流程；
- 成功标准；
- 停止条件或最终交付形态；
- 失败、不确定或信息不足时的处理方式；
- 对 step 文件的引导；
- 明确声明 fallback 是低保真路径。

Fallback 的尺度规则：

- **必须足够完整**：不了解 SSP 的 agent 只读 fallback，也能产出一个可接受结果。
- **必须非空**：fallback MUST contain real ordinary Skill instructions, not only a heading.
- **必须保持低保真**：fallback 只写阶段、成功标准、关键注意事项，不写每一步的详细操作细节。
- **不得重复 steps**：高保真方法、复杂检查清单、长参考说明必须留在 step 中。
- **应控制长度**：fallback SHOULD 控制在 3-7 个动作或短段落内。
- **应主动引导升级**：如果 agent 能读取 step 文件，应优先使用 step，因为 step 是权威高保真路径。

判断标准：

> Fallback 让 Skill 不空壳；steps 让 Skill 值得用 SSP。两者不能互相替代。

L0 验收标准：

> 一个不懂 SSP、只读 `SKILL.md` 的普通 agent，必须能知道何时使用这个 Skill、怎样线性完成它、何时停止、交付什么、遇到缺失信息时如何处理。它可以不够精细，但不能需要猜协议。

### 7.3 Protocol Capsule 模板

Protocol Capsule 必须短、稳定、标准化。

最小模板：

```text
This skill uses Stepped Skill Protocol v0.1.

Protocol loop:
1. Read the entry step.
2. Complete the current step's Output.
3. Record an SSP Handoff block in the execution context.
4. Read the target named by Next; the next step may use the latest SSP Handoff as inherited state.
5. If Next is END, stop the chain and produce the final answer.

Entry: <entry-step-path>
```

它不应该包含“不要列目录、不要跳步、不要看未来”这类禁令堆。顶级协议不靠压制模型主动性获得核心价值。

## 8. Step 文件结构

Step File 是 SSP 的高保真执行单元。SSP 区分 author source 和 publication projection：

- **author source**：作者默认编写的人类可读 step 文件；
- **publication projection**：发布工具可生成或补全的 frontmatter、manifest、索引和校验证明。

默认作者体验应该先看 author source。frontmatter 是发布投影，不是理解 SSP 的入口。

Author source 推荐结构：

```markdown
# Step: Collect Material

## Objective

Collect the source material needed for the brief. This step's deliverable is source material, not final prose.

## Resources

- `references/source-guidelines.md`

## Instructions

1. Identify the user's topic and scope.
2. Use the listed resources to build a source map.
3. Capture key facts, source notes, and unresolved questions.

## Output

Produce:

- source map
- key facts
- unresolved questions

## Completion Criteria

This step is complete when the source map is usable by the synthesis step.

## Handoff

Carry forward:

- source map
- key facts
- unresolved questions

Before reading `Next`, record an `SSP Handoff` block with those items in the execution context.

## Next

`steps/synthesize.md`
```

Terminal author source:

```markdown
# Step: Finalize

## Objective

Produce the final answer for the user.

## Resources

None.

## Instructions

1. Use the handoff from prior steps.
2. Write the final response.
3. Treat this as the terminal step.

## Output

Produce the final answer for the user.

## Completion Criteria

The final answer is ready to send to the user.

## Handoff

None. This is the terminal step.

## Next

`END`
```

Publication projection MAY add generated frontmatter:

```yaml
---
ssp:
  version: "0.1"
  id: "collect"
  next: "steps/synthesize.md"
  resources:
    - "references/source-guidelines.md"
---
```

Rules:

- Author source MUST be sufficient for L1 execution without reading frontmatter.
- Generated frontmatter MUST match body sections and manifest.
- A package MAY keep generated frontmatter in published step files for validator and runtime convenience.
- A source package MAY omit generated frontmatter during drafting.

### 8.1 作者最小写法

作者不应该先理解整个控制平面。一个最小 SSP skill 只要求作者写：

```text
SKILL.md
steps/<first>.md
steps/<next>.md
...
```

作者必须维护：

- `SKILL.md` 中的 `stepped-skill.entry`；
- 每个 step 的 `Objective` / `Resources` / `Instructions` / `Output` / `Completion Criteria` / `Handoff` / `Next`；
- `## Next` 中的人类可读转移目标。

工具应生成：

- step frontmatter 中的 `ssp.id` / `ssp.next` / `ssp.resources`；
- `.ssp/manifest.json`；
- chain diagram；
- validation report；
- package metadata for registries。

产品判断：

> 作者写人类可读的 Skill 和 step；工具维护机器可读的索引、frontmatter 和证明。

发布级 SSP 包可以包含 step frontmatter，但作者不应该被迫手写它。顶级协议的默认作者体验应该是“写清楚步骤”，不是“维护控制平面”。

## 9. Step Schema

A published SSP step MUST include:

- `Objective`
- `Resources`
- `Instructions`
- `Output`
- `Completion Criteria`
- `Handoff`
- `Next`

`Objective`, `Instructions`, `Output`, and `Completion Criteria` MUST be non-empty.

### 9.1 Resources

Resources define what the current step needs.

Rules:

- Every step MUST have a `Resources` section.
- If no resource is needed, write `None`.
- Otherwise `Resources` MUST be a Markdown bullet list of exact skill-root relative file paths.
- Step frontmatter MAY list the same resources for validators.
- Resources SHOULD be exact paths, not directory names.
- Resources are current-step inputs, not future-step hints.

This reduces exploration pressure. The model should not need to inspect the package to discover what the current step needs.

### 9.2 Output

Output is what the current step must produce.

Rules:

- Output MUST be visible in the execution context.
- Output MAY be user-facing or intermediate.
- Output SHOULD avoid hidden reasoning traces.
- Output SHOULD be concise enough for the next step to consume.

### 9.3 Handoff

Handoff is the minimal state carried from one step to the next.

Rules:

- Every non-terminal step MUST define Handoff.
- Handoff SHOULD be a compact artifact: facts, decisions, file paths, open questions, constraints.
- Handoff MUST NOT rely on private chain-of-thought.
- The next step MAY refer to “the handoff from the previous step”.
- Runtime-native SSP MAY capture Handoff as structured state.

Without Handoff, SSP is only “read another file”. With Handoff, it becomes an execution protocol.

### 9.3.1 Handoff 语义与 L1 Markdown 投影

Handoff is a protocol semantic object. It is the minimal state produced by one Step Execution and consumed by the next Step Execution.

Allowed representations:

- L2 runtime MAY capture Handoff as structured state.
- Environments with internal notes/state channels SHOULD store Handoff internally.
- L1 plain-chat execution SHOULD use the standard Markdown projection below.

The Markdown block is the standard L1 projection, not the only possible representation.

Recommended L1 Markdown projection:

```markdown
## SSP Handoff

- Step: <step-id>
- Output: <short description of produced artifact>
- Carry Forward:
  - <fact / decision / file path / constraint / open question>
- Ready For Next: yes
```

Rules:

- A non-terminal Step Execution MUST produce Handoff before Transition.
- Handoff MUST be available to the next Step Execution.
- Handoff is internal execution state by default, not part of the final user-facing answer.
- If the environment only supports plain chat, the Markdown projection MAY appear as an intermediate visible artifact, but it SHOULD NOT be repeated in the final answer unless the user asks for execution trace.
- Handoff SHOULD be concise.
- Handoff MUST contain only information needed by the next step.
- Handoff MUST NOT expose private chain-of-thought.
- The next step MAY treat the latest Handoff as inherited state.

Handoff is the bridge between “a sequence of files” and “a continuous execution”. The Markdown block is a compatibility surface for L1, not a UX requirement to show process logs to the user.

### 9.4 Next

`Next` is the core step transition interface.

Rules:

- `Next` MUST be a relative step file path or `END`.
- `Next` MUST be written as exactly one bare value or exactly one Markdown code span; explanatory prose belongs in `Instructions`, not `Next`.
- SSP v0 allows exactly one `Next` per step.
- SSP v0 does not allow conditional, multiple, or computed next steps.
- `## Next` in the body is the source authority for authors and the model-readable transition.
- Published packages SHOULD project `Next` into generated step frontmatter or manifest for validators and runtimes.
- Manifest `next` is the publication machine authority.
- Validator MUST fail if body `Next`, frontmatter `next` when present, and manifest `next` disagree.
- `Next` MUST NOT point to a directory.
- `Next` MUST NOT require network access.
- `Next` MUST NOT form a cycle.
- `END` MUST be explicit.

## 10. Execution Semantics

L1 self-directed execution:

```text
Activate Skill
  ↓
Read SKILL.md
  ↓
Read entry step
  ↓
Execute current step
  ↓
Produce Output + Handoff
  ↓
Read Next
  ↓
Next == END ? final answer : next step
```

For Zhixing, this happens inside one run: the model can read files, receive observations, continue reasoning, and produce the final response. For the external protocol, the generic term is execution.

### 10.1 Static Distribution vs Prompt Constraint

SSP is not a pure prompt constraint.

It uses static physical distribution:

- future steps are separate files;
- they are not in the current prompt by default;
- the model receives future step content only after reading `Next`.

But SSP is also not hard access control:

- a model with unrestricted file tools may inspect the package;
- a malicious or misaligned agent can skip ahead;
- sensitive secrets must not be stored in future steps.

The precise claim is:

> SSP shapes visibility through static distribution. L2 runtime support can turn that shape into enforceable scope.

### 10.2 Focus Through Sufficiency

SSP must not rely on “do not inspect future steps” as its core mechanism.

The current step must be good enough that future steps are irrelevant to the current task. The model should continue because the next step becomes relevant after the current handoff exists, not because the protocol forbids curiosity.

This is the design that ages well: stronger models should find SSP more natural, not more constraining.

### 10.3 Threat Model and Non-goals

SSP's baseline threat model is cooperative execution:

- the model is trying to complete the user's task;
- the agent can read local Skill resources;
- the package author is trusted;
- the protocol optimizes focus, sequencing, and reusable execution quality.

SSP baseline does not defend against:

- malicious models or tools;
- prompt-injection inside untrusted resources;
- agents that intentionally enumerate the whole package;
- secrets hidden in future step files;
- safety-critical workflows that require hard access control.

Non-goals:

- SSP is not a security boundary.
- SSP is not a permission system.
- SSP is not a replacement for runtime sandboxing.
- SSP is not a general workflow engine for arbitrary branching automation.

Security-sensitive or compliance-sensitive use requires L2 runtime enforcement: scoped resource access, execution trace, validator checks, and policy controls. The public protocol must say this plainly; overclaiming isolation would destroy trust.

Untrusted input handling:

- User-provided content, web content, retrieved documents, and external files MUST be treated as task data, not protocol instructions.
- Step files and bundled package resources are trusted package instructions only when the package author is trusted.
- A step SHOULD label untrusted inputs explicitly when it asks the model to inspect them.
- Handoff SHOULD carry facts and decisions derived from untrusted inputs, not untrusted instructions copied wholesale.
- L2 runtime SHOULD preserve the distinction between protocol content, trusted package resources, tool observations, and user data in traces.

Product judgment:

> SSP improves sequencing; it does not magically solve instruction hierarchy. A professional protocol names the trust boundary instead of hoping models infer it.

### 10.4 Error Model

SSP must fail clearly. A broken chain is better than an invented chain.

Error classes:

| Code | Class | Meaning | Recovery |
| --- | --- | --- | --- |
| `SSP_PACKAGE_INVALID` | package | Package fails required validation | Fix package before publication |
| `SSP_AGENT_SKILL_INVALID` | compatibility | Base Agent Skills frontmatter is invalid | Fix `SKILL.md` before claiming SSP compatibility |
| `SSP_ENTRY_MISSING` | package | `stepped-skill.entry` is missing or invalid | Use L0 fallback or fail SSP path |
| `SSP_VERSION_UNSUPPORTED` | compatibility | SSP major version is unknown or unsupported | Fail publication validation or upgrade validator/runtime |
| `SSP_STEP_MISSING_SECTION` | package | Step is missing a required section | Fix step source before publication |
| `SSP_STEP_UNREADABLE` | execution | Current or next step cannot be read | Stop chain; report broken transition |
| `SSP_RESOURCE_UNREADABLE` | execution | Current-step resource cannot be read | Continue only if Completion Criteria can still be met |
| `SSP_NEXT_INVALID` | package/execution | `Next` is missing, malformed, points outside `steps/`, or disagrees with manifest | Stop chain; do not infer next step |
| `SSP_HANDOFF_MISSING` | execution | Non-terminal step completed without handoff | Produce handoff before transition, or stop |
| `SSP_CHAIN_CYCLE` | package | Step chain contains a cycle | Break the cycle before publication |
| `SSP_CHAIN_UNREACHABLE_STEP` | package | Published package contains unreachable step files | Remove orphan steps or link them into the chain |
| `SSP_MANIFEST_MISMATCH` | package | Manifest does not match source metadata, chain, resources, version, or required extensions | Regenerate manifest from source |
| `SSP_EXTENSION_UNSUPPORTED` | compatibility | Required extension is unknown | Fail publication validation or fall back to L0 |
| `SSP_SCOPE_DENIED` | L2 runtime | Runtime denies access outside current allowed scope | Treat as enforcement success; continue only with allowed inputs |

Rules:

- L1 execution MUST NOT invent missing step content.
- L1 execution MUST NOT skip a broken `Next` by searching the package.
- L1 execution MAY use L0 fallback when SSP execution cannot start.
- Once an SSP chain has started, a broken transition SHOULD be reported as an SSP execution failure, not silently converted into an ordinary Skill run.
- L2 runtime SHOULD expose structured error codes for UI, traces, and eval.
- Validators SHOULD report errors with file path, section, expected value, and actual value when available.

Product judgment:

> Failure clarity is product quality. Users can trust a protocol that says “this chain is broken”; they cannot trust one that improvises a hidden next step.

## 11. Validation

Validator checks:

- `SKILL.md` exists.
- `metadata["stepped-skill.version"]` exists.
- `metadata["stepped-skill.entry"]` points to an existing step.
- `Fallback Workflow` exists and satisfies L0 acceptance requirements.
- `.ssp/manifest.json` exists for published packages.
- Manifest entry matches `SKILL.md` entry.
- Every step has required sections.
- Generated step frontmatter has `ssp.version`, `ssp.id`, `ssp.next` when publication builds include frontmatter.
- When step frontmatter exists, body `Next` matches frontmatter `next`.
- Body `Next` matches manifest `next`.
- Resource paths exist.
- The chain has exactly one entry.
- Every non-terminal step has exactly one `Next`.
- The chain has no cycles.
- The chain reaches exactly one explicit `END` terminal.
- Published packages have no unreachable step files.
- Non-terminal steps define Handoff.
- Terminal steps define no further handoff.
- Handoff rules avoid private chain-of-thought and user-facing leakage by default.
- Required extensions are known and supported.

Validation is part of product quality. A protocol that cannot be checked will not spread professionally.

The validator should distinguish source validation from publication validation:

- **source validation** checks what the author wrote: `SKILL.md`, step sections, resources, `Next`, fallback;
- **publication validation** checks generated artifacts: step frontmatter, `.ssp/manifest.json`, chain diagram, registry metadata.

This keeps authoring lightweight while keeping published packages strict.

Validator output should be stable:

- error code;
- severity;
- file path;
- section or field;
- expected value when applicable;
- actual value when applicable;
- short remediation hint.

## 12. Conformance

SSP conformance applies separately to packages and execution environments.

### 12.1 Package Conformance

- **SSP Package L0-compatible**：`SKILL.md` is a valid Agent Skill and includes a usable fallback workflow.
- **SSP Package L1-ready**：package is L0-compatible and includes valid step files, `Next` chain, Resources, Output, Handoff, and END.
- **SSP Package L2-ready**：package is L1-ready and includes generated `.ssp/manifest.json` passing validation.

### 12.2 Execution Capability

- **SSP Execution L0**：can use the skill as an ordinary Agent Skill.
- **SSP Execution L1**：can self-direct through the Protocol Capsule with ordinary resource reading; no native SSP implementation required.
- **SSP Runtime L2**：natively recognizes SSP metadata, can scope current step, can capture Handoff, and can validate or consume `.ssp/manifest.json`.

L1 is deliberately called execution capability, not runtime conformance. It is a property of an agent-in-environment being able to follow the chain. L2 is runtime conformance because the runtime itself understands SSP.

### 12.3 Claiming Support

Published packages and environments SHOULD state the highest level they satisfy.

Example:

```text
Package: SSP Package L1-ready
Execution: SSP Execution L1
```

This prevents vague adoption claims. A tool either supports a level or it does not.

### 12.4 Conformance Suite

SSP should ship a conformance suite before public promotion.

The suite should include:

- valid L0-compatible package;
- valid L1-ready package;
- valid L2-ready package with manifest;
- invalid package with invalid base Agent Skills frontmatter;
- invalid package with missing fallback;
- invalid package with broken `Next`;
- invalid package with resource path escaping skill root;
- invalid package with unreachable step;
- invalid package with body `Next` / manifest mismatch;
- invalid package with non-terminal step missing Handoff;
- L1 execution transcript showing successful chain completion.

Conformance suite outputs:

- expected validator result;
- expected error code for invalid fixtures;
- expected manifest;
- expected chain diagram;
- expected L1 handoff sequence.

Product judgment:

> Public support claims need executable proof. Without a conformance suite, SSP support becomes marketing language.

## 13. Public Release Bar

Do not promote SSP publicly as a protocol until it has a release-quality package.

Minimum public release package:

- `specification.md`：normative SSP spec, separate from architecture rationale;
- `authoring-guide.md`：how to write a Stepped Skill without understanding control-plane details;
- `examples/`：at least two realistic Stepped Skills, one simple and one complex;
- `validator`：reference validator or validation rules precise enough to implement independently;
- `conformance-suite/`：valid and invalid fixtures with expected outputs;
- `evaluation-report.md`：M1 eval results, task set description, model/environment notes, failure analysis;
- `security.md`：threat model, non-goals, and L2 enforcement guidance;
- `CONTRIBUTING.md` or `governance.md`：how changes, extension proposals, conformance additions, and compatibility questions are reviewed;
- `LICENSE`：clear licensing for code, docs, examples, and any generated protocol artifacts;
- `CHANGELOG.md`：version history and compatibility notes.

Current draft artifacts:

- authoring guide draft: `docs/authoring-guide.md`;
- security notes draft: `docs/security-notes.md`;
- architecture review audit: `docs/architecture-review-audit.md`;
- validation rules draft: `docs/validation-rules.md`;
- conformance suite draft: `docs/conformance-suite.md`;
- evaluation report draft: `docs/evaluation/report.md`;
- M1 eval task set and runbook: `docs/evaluation/task-set.md`;
- M1 eval harness: `tools/prepare-m1-eval.mjs`;
- M1 eval summarizer: `tools/summarize-m1-eval.mjs`;
- M1 generated run package: `eval-runs/m1-draft/`;
- sample fixtures: `examples/`;
- reference validator prototype: `tools/validate-ssp.mjs`;
- conformance runner: `tools/run-conformance.mjs`;
- executable invalid fixtures: `conformance/fixtures/`.

Public release principles:

- The spec must be boring to implement.
- The authoring guide must be easy to follow.
- The examples must prove the format is useful.
- The validator must catch the mistakes authors will actually make.
- The evaluation report must honestly show where SSP wins, ties, and fails.

SSP should not seek adoption through novelty. It should earn adoption by being easier to use than manual staged prompting and more reliable than ordinary all-in-one Skill instructions for suitable tasks.

## 14. M0 Sample Portfolio

Before SSP moves from architecture draft to formal specification, it needs sample packages that pressure-test the product essence.

The first sample set SHOULD include at least two hand-written Stepped Skills:

### 14.1 Simple Sample: Research Brief

Current draft artifact:

- `examples/research-brief/`

Purpose:

- prove the basic linear chain;
- prove author source can be easy to write;
- prove L0 fallback is usable;
- prove Handoff carries useful intermediate state.

Suggested chain:

```text
collect -> synthesize -> finalize -> END
```

What it should test:

- current-step sufficiency;
- source/resource reading;
- concise handoff;
- terminal final answer;
- ordinary Skill fallback.

Pass condition:

> A capable L1 agent should complete the chain without listing the package, reading manifest, or asking the user how SSP works.

### 14.2 Complex Sample: Multi-Phase Review

Current draft artifact:

- `examples/multi-phase-review/`

Purpose:

- prove SSP handles a real professional workflow with sharper phase boundaries;
- prove Handoff prevents later steps from losing important decisions;
- prove `Resources` can keep each step focused.

Suggested chain:

```text
intake -> inspect -> evaluate -> recommendations -> final-report -> END
```

What it should test:

- multiple intermediate artifacts;
- step-specific resources;
- failure handling for missing inputs;
- internal handoff vs final user-facing report;
- value over an ordinary all-in-one Skill.

Pass condition:

> A capable L1 agent should produce a better final report than an ordinary Skill on the same task because each phase is smaller, clearer, and less polluted by future-step detail.

Sample rules:

- Samples MUST be realistic, not toy examples designed only to pass the protocol.
- Samples MUST include an ordinary Skill fallback.
- Samples MUST include author source step files without requiring hand-written frontmatter.
- Samples SHOULD include generated manifest and expected chain diagram.
- Samples SHOULD include at least one intentional invalid variant for the conformance suite.

Product judgment:

> If SSP cannot make two real skills easier to run and easier to review, it is not ready to become a public protocol.

## 15. Architecture Review Gate

SSP architecture passes review only when the following claims are true in the current artifacts, not merely intended.

Review gate:

| Requirement | Evidence needed |
| --- | --- |
| Product essence is clear | Architecture states SSP turns manual staged prompting into reusable Skill packages |
| Skill compatibility is preserved | SSP package remains a valid Agent Skill with usable `SKILL.md` fallback |
| v0 scope is disciplined | v0 is single-entry, finite, linear, local-file based, and not a workflow engine |
| Authoring is easy | Authoring guide exists; author writes `SKILL.md` and step bodies; tools generate control-plane artifacts |
| L1 is portable | Resource access contract works with exact skill-root relative file reads |
| L2 has room to grow | Runtime-native support can add scoping, structured handoff, validation, and trace |
| Validation is deterministic | Path, id, manifest, chain, and error output rules are specified |
| Failure is honest | Error model forbids invented steps and silent fallback after a broken transition |
| Trust boundary is named | Security notes distinguish static distribution from enforced isolation and package instructions from untrusted task data |
| Public release is gated | Spec, authoring guide, examples, validator, conformance suite, eval report, security notes, governance/contribution rules, license, and changelog are required |
| Value is testable | Eval gates compare SSP against ordinary Skill on suitable multi-phase tasks |

Failure conditions:

- If SSP requires agent-side native support to be useful, v0 fails.
- If L0 fallback is an empty shell, v0 fails.
- If authors must maintain machine control-plane files by hand, v0 fails.
- If different validators produce different chains from the same source, v0 fails.
- If SSP cannot beat or tie ordinary Skill on suitable tasks after eval, stop and redesign.

Product judgment:

> Passing review does not mean the protocol is popular. It means the architecture is coherent enough, useful enough, and verifiable enough to deserve real examples and eval.

## 16. Applicability

Use SSP when:

- the skill naturally has multiple fixed phases;
- each phase can be made self-contained;
- phases are mostly sequential, not globally coupled;
- the user would otherwise manually feed the agent step by step;
- the high-fidelity version benefits from current-step focus.

Avoid SSP when:

- the model must see all constraints from the start;
- the task is too tightly coupled to split;
- the skill is short enough that a single instruction is clearer;
- the package contains sensitive future instructions requiring hard secrecy;
- failure to follow the chain would be dangerous.

Product rule:

> If step boundaries are artificial, do not use SSP. If step boundaries match the work, SSP can be excellent.

## 17. Eval Before Spec

External research can justify the direction, but SSP must earn its own evidence.

Do not write a polished public specification before eval.

Current eval draft:

- `docs/evaluation/report.md`
- `docs/evaluation/task-set.md`

Current status:

- planned, not executed;
- M0 samples and ordinary baselines exist;
- M1 task set and runbook exist;
- M1 eval harness, reviewer guide, scorecard validator/summarizer, and generated 40-run package exist;
- validator preflight exists;
- architecture review audit exists;
- M1 task execution and blind review are still missing.

Minimum eval:

- A/B test ordinary Skill vs Stepped Skill.
- Same model, same tools, same task set.
- Tasks must be real multi-phase tasks with relatively clean boundaries.

Metrics:

- success rate;
- skipped-step rate;
- premature future work rate;
- need for user correction;
- output quality blind review;
- token usage;
- execution time;
- authoring burden.

Decision gate:

SSP should advance from architecture draft to public specification only if M1 eval clears explicit gates.

Initial go gates:

- L1 chain completion rate is high enough to trust self-directed execution.
- SSP wins or ties ordinary Skill on most suitable tasks in blind review.
- skipped-step rate and premature future work rate are materially lower than ordinary Skill.
- user correction rate is materially lower, or output quality is materially higher without unacceptable cost.
- token usage, latency, and authoring burden stay within an acceptable product budget.
- failures are diagnosable by validator or step design, not mysterious model behavior.

M1 provisional numeric gates for the first internal eval:

These numbers are internal product gates, not public evidence. They should be recalibrated after real sample skills and task sets exist.

- at least 20 suitable multi-phase tasks;
- L1 chain completion rate >= 90%;
- skipped-step rate <= 10%;
- premature future work rate <= 10%;
- SSP wins or ties ordinary Skill on >= 70% of tasks in blind review;
- user correction rate drops by >= 20%, or blind quality improves clearly without correction-rate regression;
- token usage and latency stay within 1.5x ordinary Skill unless quality gains justify the cost;
- authoring time for a small SSP skill stays practical for a skilled user without tooling-heavy ceremony.

Stop or redesign if:

- agents often ignore `Next`;
- handoff quality is too poor for later steps;
- fallback is the only reliable path;
- authoring cost outweighs execution quality gains;
- ordinary Skill performs the same with less structure.

> If SSP does not reliably beat ordinary Skill on suitable tasks, stop and redesign. Do not ship a protocol because it feels elegant.

## 18. Maturity Path

### M0：Architecture Draft

- Define SSP product essence and structure.
- Produce the two M0 sample skills: Research Brief and Multi-Phase Review.
- Confirm each sample has L0 fallback, author source steps, expected chain, and expected handoff sequence.
- Current Research Brief sample: `examples/research-brief/`.
- Current Multi-Phase Review sample: `examples/multi-phase-review/`.
- Do not optimize tooling yet.

### M1：Eval Prototype

- Run ordinary Skill vs SSP samples.
- Use the fixed 20-task M1 set in `docs/evaluation/task-set.md`.
- Use `tools/prepare-m1-eval.mjs` to generate the 40-run A/B package.
- Use the generated `reviewer-guide.md` for blind scoring.
- Use `tools/summarize-m1-eval.mjs` to validate the scorecard and aggregate gate status.
- Measure whether models follow `Next`.
- Measure whether current-step sufficiency reduces drift.
- Fill `docs/evaluation/report.md` with real run data.
- Decide whether SSP deserves a formal spec.

### M2：Specification Draft

- Write `specification.md`.
- Define `SKILL.md` metadata schema.
- Define step schema.
- Define manifest schema.
- Define normative keyword semantics.
- Define deterministic path, id, and manifest generation rules.
- Define version, extension, and deprecation policy.
- Define Protocol Capsule.
- Define L0/L1/L2 conformance levels.
- Define L1 resource access contract.
- Define Handoff semantics and L1 Markdown projection.
- Define error model and stable validator output.
- Define authoring source vs generated artifacts.
- Keep the authoring guide separate from the normative spec.

### M3：Tooling

- Static validator.
- Sample generator.
- Authoring linter.
- Chain diagram generator.
- Manifest generator.
- Conformance suite.
- Current validation rules draft: `docs/validation-rules.md`.
- Current conformance suite draft: `docs/conformance-suite.md`.
- Current validator prototype: `tools/validate-ssp.mjs`.
- Current conformance runner: `tools/run-conformance.mjs`.
- Current authoring guide draft: `docs/authoring-guide.md`.

### M4：Public Release Candidate

- Authoring guide.
- Security notes.
- At least two realistic example packages.
- Evaluation report.
- Security / threat model document.
- Contribution / governance guide.
- Changelog and version policy.
- Public release checklist.

### M5：Runtime-native SSP（Optional）

- Scope current step.
- Capture Handoff.
- Show step progress in UI.
- Prevent future-step access when desired.
- Record execution trace.

## 19. Reference Baselines

SSP must stay grounded in the existing Agent Skills model. Current primary reference points:

- [Anthropic Agent Skills docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)：Skills are filesystem-based resources loaded through progressive disclosure: metadata first, `SKILL.md` body on activation, and resources/code only as needed.
- [Agent Skills Specification](https://agentskills.io/specification)：`SKILL.md` uses YAML frontmatter with required `name` and `description`; optional `metadata` is a string-to-string map; file references should be skill-root relative; resources are loaded on demand.
- [anthropics/skills](https://github.com/anthropics/skills)：Anthropic's public Skills repository shows Skills as self-contained directories with `SKILL.md`, instructions, metadata, scripts, and resources.
- [Anthropic: Building effective agents](https://www.anthropic.com/research/building-effective-agents)：prompt chaining is recommended for work that can be cleanly decomposed into fixed subtasks, trading latency for higher accuracy.

Compatibility consequences:

- SSP metadata belongs under the existing optional `metadata` map, using the `stepped-skill.*` namespace.
- SSP step files are ordinary skill-root relative files, not a new packaging primitive.
- SSP L1 execution relies on the same on-demand file access pattern as Agent Skills progressive disclosure.
- SSP does not claim prompt chaining research proves the protocol's value; it only supports the plausibility of fixed-phase execution. SSP value still requires M1 A/B evaluation against ordinary Skills.

## 20. 暂定结论

SSP 值得继续，但它必须按顶级协议标准推进。

它的产品本质是：

> 把手动多次喂给 agent 的高质量分阶段工作方式，变成一个兼容 Agent Skills、可静态分布读取、可被普通模型自驱执行、未来可被 runtime 原生增强的协议。

SSP 要成功，不能靠概念新鲜，也不能靠“模型应该听话”。它必须做到：

- 普通 agent 不空壳；
- 自驱 agent 有清晰链路；
- 原生 runtime 有增强空间；
- 作者负担可接受；
- validator 能保质量；
- eval 能证明效果。

满足这些，它才有资格成为一个经得起时间检验的 Skill 增强协议。
