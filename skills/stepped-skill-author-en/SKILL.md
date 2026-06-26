---
name: stepped-skill-author-en
description: Author or review portable Stepped Skill Protocol (SSP) packages from natural-language workflow ideas. Use when an agent needs to decide whether SSP fits a task, design step boundaries, write a Skill-compatible SKILL.md fallback, create SSP step files, create or check .ssp/manifest.json when needed, or validate a Stepped Skill package without assuming the SSP protocol repository is present.
---

# Stepped Skill Author

Use this skill to create or repair Stepped Skill Protocol packages in any project. An SSP package must remain an ordinary Agent Skill first; SSP adds a finite local chain for high-fidelity staged execution.

Before creating or reviewing an SSP package, read `references/ssp-portable-spec.en.md` and `references/ssp-authoring-checklist.en.md`. When drafting a new package, also use `references/ssp-package-template.en.md`.

## Core Judgment

Use SSP only when the work is naturally multi-phase and the user would otherwise hand-feed the agent one phase at a time.

Recommend an ordinary Skill instead when the task is short, tightly coupled, arbitrary to split, depends on hidden future instructions, needs dynamic branching in v0, or requires hard security isolation.

## Authoring Workflow

1. Decide whether SSP fits the task.
2. Define the Skill's user-facing job, trigger conditions, inputs, and final output.
3. Choose a short, easy-to-invoke, intent-revealing `name` first: prefer 1-3 lowercase hyphenated English words, and the name alone should roughly tell a user what they are asking the agent to do. Do not use only an object, project, or domain name such as `xxx-core`, and do not pack the full task description into the name; the directory name must equal `name`, and detailed trigger semantics belong in `description`.
4. Design a finite linear step chain with natural phase boundaries.
5. Write `SKILL.md` as a complete but lower-fidelity ordinary Skill fallback, then add the short SSP protocol capsule and `metadata.stepped-skill.*` fields. `SKILL.md` must name only the entry step path; do not inline any step body, future-step high-fidelity instructions, exact document lists, or resource paths.
6. Write step files under `steps/`, making each step sufficient for its own phase.
7. For publication packages, create or check `.ssp/manifest.json` from the source files using the portable projection rules.
8. Use any available local validator as optional confirmation, then manually check the package against the bundled checklist.
9. Fix structural failures before polishing prose.

## Quality Bar

- The package is useful at L0 when only `SKILL.md` is available.
- `name` is short, stable, easy for users to invoke, and intent-revealing; avoid sentence-like directory names and object-only/domain-only names.
- `SKILL.md` does not contain any step body and does not expose the high-fidelity step chain; exact phase document lists, resource paths, and detailed checklists belong in the relevant step.
- `Resources` list only bundled Skill-package support files; target files in the user's project, repository, or workspace belong in step `Instructions`, not in `Resources`.
- Each step has one clear objective, one output contract, one handoff contract, and one `Next` target.
- Focus comes from current-step sufficiency, not from telling the model not to inspect future files.
- The protocol never claims L0/L1 hard isolation or security.
- Author-maintained files stay simple: `SKILL.md`, step files, and optional resources. Generated indexes should be derived from source.

## Validation

Do not assume any external repository, validator, or project-specific toolchain exists. If an official or local SSP validator is available in the user's environment, use it. If no validator is available, perform the manual checks in `references/ssp-authoring-checklist.en.md` and clearly report that validation was manual only.
