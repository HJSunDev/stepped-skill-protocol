# SSP M1 Eval Prompt

Run ID: MR-09-S
Blind ID: B038
Task ID: MR-09
Variant: SSP
Sample: multi-phase-review

## Task

Review the public release package checklist for whether it is enough for broad adoption.

## Expected Output

Findings on missing public-facing assets and launch risk.

## Input Artifacts

- `docs/architecture.md`
- `docs/architecture-review-audit.md`

## Variant Instructions

- Use Stepped Skill package root: `examples/multi-phase-review`.
- Read `SKILL.md` first, then follow the declared SSP entry and each `Next` target exactly.
- Do not list package directories or inspect future steps unless the current step's `Next` points there.
- Record handoff state as execution state. Do not expose private reasoning in the final answer.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B038.md`.
- Save any execution notes, including observed reads and failures, to `traces/MR-09-S.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
