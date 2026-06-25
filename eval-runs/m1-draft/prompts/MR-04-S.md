# SSP M1 Eval Prompt

Run ID: MR-04-S
Blind ID: B028
Task ID: MR-04
Variant: SSP
Sample: multi-phase-review

## Task

Review the M1 evaluation report draft for whether it can prove value.

## Expected Output

Findings on metrics, gates, and execution risks.

## Input Artifacts

- `docs/evaluation/report.md`

## Variant Instructions

- Use Stepped Skill package root: `examples/multi-phase-review`.
- Read `SKILL.md` first, then follow the declared SSP entry and each `Next` target exactly.
- Do not list package directories or inspect future steps unless the current step's `Next` points there.
- Record handoff state as execution state. Do not expose private reasoning in the final answer.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B028.md`.
- Save any execution notes, including observed reads and failures, to `traces/MR-04-S.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
