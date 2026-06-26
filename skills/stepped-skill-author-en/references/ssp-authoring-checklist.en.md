# SSP Authoring Checklist

Use this checklist when creating or reviewing a Stepped Skill Protocol package. It is portable and assumes no SSP protocol repository tooling is present.

## 1. Fit Test

Use SSP when all of these are true:

- The work is naturally multi-phase.
- The phases have a stable order.
- Each phase can produce a tangible output.
- Each phase can be completed without reading future phase instructions.
- The user would otherwise hand-feed the agent the phases over multiple turns.

Use an ordinary Skill instead when any of these are true:

- The task is short enough to fit comfortably in one Skill body.
- The task is one tightly coupled reasoning chain.
- Later instructions are necessary to understand the current phase.
- The split is cosmetic rather than functional.
- v0 would require branching, looping, dynamic routing, or parallel execution.
- The user needs hard secrecy or security isolation.

## 2. Package Shape

Recommended source layout:

```text
my-stepped-skill/
  SKILL.md
  steps/
    01-first-phase.md
    02-second-phase.md
    03-final-phase.md
  references/
    optional-supporting-material.md
  .ssp/
    manifest.json
```

The package directory name must match the `name` field in `SKILL.md`. `name` should be short, stable, easy to invoke, and intent-revealing; prefer 1-3 lowercase hyphenated English words and avoid sentence-like directory names or object-only/domain-only names.

## 3. `SKILL.md` Requirements

`SKILL.md` must be valid as an ordinary Agent Skill:

- Use YAML frontmatter.
- Include `name` and `description`.
- Keep the `name` lowercase, hyphenated, and equal to the folder name; prefer a short name, but the name alone should tell a user what they are asking the agent to do. Do not pack the full task description into `name`.
- Describe the user problem in `description`; do not spend the primary trigger text on protocol mechanics.
- Preserve ordinary optional Agent Skills fields such as `license`, `compatibility`, `metadata`, and `allowed-tools` when needed.

For SSP, add namespaced metadata:

```yaml
metadata:
  stepped-skill.version: "0.1"
  stepped-skill.entry: "steps/01-first-phase.md"
```

`SKILL.md` must also include:

- a useful ordinary fallback workflow;
- a short SSP protocol capsule;
- the entry step path;
- only the entry step path, not the inline entry step body or any other step body;
- no high-fidelity step instructions copied into `SKILL.md`.
- no exact future-step document lists, resource path lists, or detailed checklists; those belong in the relevant step.

The fallback is not decorative. If an agent only sees `SKILL.md`, it should still be able to complete a lower-fidelity version of the job.

## 4. Step File Requirements

Each step file should include these sections:

```markdown
# Step Title

## Objective

## Resources

## Instructions

## Output

## Completion Criteria

## Handoff

## Next
```

Section rules:

- `Objective` states the current phase only.
- `Resources` is exactly `None` or a bullet list of local skill-root relative paths.
- `Resources` lists only bundled Skill-package support files; user workspace files, project repository files, task input files, or review target files belong in `Instructions`, not in `Resources`.
- `Instructions` gives enough detail to complete the current phase without reading future steps.
- `Output` names the concrete deliverable for the step.
- `Completion Criteria` makes it clear when the step is done.
- `Handoff` states the compact state the next step needs.
- `Next` is exactly one local step path or `END`.

In SSP v0, each non-terminal step has exactly one `Next` target and the chain must terminate at `END`.

## 5. Manifest Requirements

Publication packages should include `.ssp/manifest.json`.

Authors should not maintain manifest content as independent source. Derive it from `SKILL.md` metadata plus each step's `Resources` and `Next`.

When an SSP generator is available, use it. When no generator is available, create or check the manifest manually using `ssp-portable-spec.en.md`.

## 6. Validation Checklist

Before considering a package ready:

- `SKILL.md` works as an ordinary Skill.
- The SSP entry exists.
- Every `Next` target resolves or is `END`.
- There are no cycles.
- There are no unreachable steps.
- Resource paths are local, relative, and inside the package.
- Step resources are exact paths, not directories, URLs, absolute paths, or traversal paths.
- User workspace / project repository target files are not incorrectly listed as `Resources`.
- Handoff expectations are explicit.
- The package does not claim L0/L1 hard isolation.
- The manifest, if present, matches the source files.

## 7. Anti-Patterns

Avoid these:

- Empty-shell `SKILL.md` that only points to steps.
- Sentence-like `name` values that turn the full task title into the directory name.
- Object-only or domain-only `name` values that do not express the task intent, such as naming project onboarding `project-core`.
- Arbitrary splits that make one reasoning task harder.
- Full step-chain previews, future-phase exact resource lists, or high-fidelity step details in the `SKILL.md` fallback.
- Inline entry step body or any other step body in `SKILL.md`.
- User project files, repository files, or task target files listed as `Resources`.
- Large future-step previews in the current step.
- Rule-heavy capsules that rely on prohibitions instead of good structure.
- Hidden security claims such as "the model cannot see future steps" at L0/L1.
- Handwritten manifest data that can drift from the source files.
- Step names or prose that require reading future steps to understand the current step.
