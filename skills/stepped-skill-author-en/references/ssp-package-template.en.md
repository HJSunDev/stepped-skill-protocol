# SSP Package Template

Use this template when drafting a new Stepped Skill Protocol package.

## Directory

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

For publication packages, create `.ssp/manifest.json` after the source files are written. Use the projection rules in `ssp-portable-spec.en.md`; do not assume a specific toolchain exists.

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

Note: To stay compatible with the broader Agent Skills ecosystem, keep `name` in lowercase English hyphen form, short, stable, easy to invoke, and intent-revealing; prefer 1-3 words. Do not use only an object or domain name; for example, name “help the agent get familiar with a project” something like `project-onboarding` or `repo-orientation`, not `project-core`. `description` may be written in the target user language. Put full trigger semantics there, not in `name`. `Fallback Workflow` should be a lower-fidelity ordinary path and must not copy the full step chain, exact future-step resource lists, or detailed checklists. `SKILL.md` should name only the entry step path, not inline any step body.

## Non-Terminal Step

```markdown
# [Step Title]

## Objective

[State the current phase objective only.]

## Resources

- `references/example.md`

Note: `Resources` lists only support files bundled inside the Skill package. User workspace files, project repository files, task input files, or review target files belong in `Instructions`, not in `Resources`.

## Instructions

1. [Do the first current-step action.]
2. [Do the second current-step action.]
3. [Prepare the step output.]

## Output

[Name the concrete deliverable for this step.]

## Completion Criteria

- [Criterion that proves this step is complete.]
- [Criterion that proves the handoff is ready.]

## Handoff

Pass forward:

- [Compact state needed by the next step.]
- [Important constraint or unresolved question.]

## Next

`steps/02-second-step.md`
```

## Terminal Step

```markdown
# [Final Step Title]

## Objective

[State the final phase objective.]

## Resources

None

## Instructions

1. [Use the prior handoff.]
2. [Produce the final user-facing output.]
3. [Check the result against the completion criteria.]

## Output

[Name the final deliverable.]

## Completion Criteria

- [Criterion that proves the final output is complete.]
- [Criterion that proves no next step is needed.]

## Handoff

No downstream handoff. This is the terminal step.

## Next

END
```

## Portable Manifest Example

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

## Validation

Use any SSP validator available in the user's environment. If none is available, perform manual validation with `ssp-authoring-checklist.en.md` and report that validation was manual only.
