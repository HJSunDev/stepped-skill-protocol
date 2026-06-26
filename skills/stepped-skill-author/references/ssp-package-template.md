# SSP 包模板

起草新的 Stepped Skill Protocol 包时使用本模板。

## 目录

```text
package-name/
  SKILL.md
  steps/
    01-first-step.md
    02-second-step.md
    03-final-step.md
  references/
    optional-reference.md
```

面向发布的包，在 source 文件写完后创建 `.ssp/manifest.json`。使用 `ssp-portable-spec.md` 中的投影规则，不假设当前环境存在特定工具链。

## `SKILL.md`

```markdown
---
name: package-name
description: Use when the user needs [specific staged outcome] for [specific situation].
metadata:
  stepped-skill.version: "0.1"
  stepped-skill.entry: "steps/01-first-step.md"
---

# Package Title

Use this skill to [plain-language job].

## Fallback Workflow

If step files are unavailable, complete the work linearly:

1. [Lower-fidelity action that can run without step files.]
2. [Lower-fidelity action that describes the capability, not the full future step details.]
3. [Final lower-fidelity action and stopping condition.]

This fallback is complete but lower fidelity. Use the step files when available because exact future-stage resources and high-fidelity instructions live there.

## Stepped Skill Protocol

This skill uses Stepped Skill Protocol v0.1.

Start with `steps/01-first-step.md`.

Loop:

1. Complete the current step.
2. Record the handoff requested by the step.
3. Read the path named by `Next`.
4. Stop when `Next` is `END`.
```

说明：为了兼容更广的 Agent Skills 生态，`name` 建议保持英文小写连字符，并且要短、稳定、方便触发、表达任务意图；优先 1-3 个词。不要只写对象名或领域名；例如“让 agent 熟悉项目”应命名为类似 `project-onboarding` / `repo-orientation`，而不是 `project-core`。`description` 可按目标用户语言编写，完整触发语义放在这里，不要塞进 `name`。`Fallback Workflow` 只写低保真普通路径，不要复制完整 step 链、未来 step 的精确资源清单或详细检查表。`SKILL.md` 只声明 entry step 路径，不内联任何 step 正文。

## 非终止 Step

```markdown
# [Step Title]

## Objective

[只说明当前阶段目标。]

## Resources

- `references/example.md`

说明：`Resources` 只列 skill 包内支持文件。用户工作区、项目仓库、任务输入文件或被审查目标文件应写在 `Instructions` 中，不写进 `Resources`。

## Instructions

1. [执行当前 step 的第一个动作。]
2. [执行当前 step 的第二个动作。]
3. [准备当前 step 输出。]

## Output

[命名当前 step 的具体交付物。]

## Completion Criteria

- [证明当前 step 已完成的标准。]
- [证明 handoff 已准备好的标准。]

## Handoff

Pass forward:

- [下一步需要的最小状态。]
- [重要约束或未解决问题。]

## Next

`steps/02-second-step.md`
```

## 终止 Step

```markdown
# [Final Step Title]

## Objective

[说明最终阶段目标。]

## Resources

None

## Instructions

1. [使用前序 handoff。]
2. [产出最终面向用户的结果。]
3. [按完成标准检查结果。]

## Output

[命名最终交付物。]

## Completion Criteria

- [证明最终输出完整的标准。]
- [证明不需要下一步的标准。]

## Handoff

No downstream handoff. This is the terminal step.

## Next

END
```

## 便携 Manifest 示例

```json
{
  "protocol": "stepped-skill",
  "version": "0.1",
  "entry": "steps/01-first-step.md",
  "steps": [
    {
      "id": "01-first-step",
      "path": "steps/01-first-step.md",
      "next": "steps/02-second-step.md",
      "resources": []
    },
    {
      "id": "02-second-step",
      "path": "steps/02-second-step.md",
      "next": "steps/03-final-step.md",
      "resources": []
    },
    {
      "id": "03-final-step",
      "path": "steps/03-final-step.md",
      "next": "END",
      "resources": []
    }
  ]
}
```

## 验证

使用用户环境中可用的任何 SSP validator。没有 validator 时，用 `ssp-authoring-checklist.md` 手动验证，并报告“仅完成手动验证”。
