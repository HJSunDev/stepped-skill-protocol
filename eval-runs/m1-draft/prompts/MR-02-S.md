# SSP M1 Eval Prompt

Run ID: MR-02-S
Blind ID: B024
Task ID: MR-02
Variant: SSP
Sample: multi-phase-review

## Task

Review the validation rules draft for ambiguity, missing invariants, and implementability.

## Expected Output

Findings plus concrete rule fixes.

## Input Artifacts

- `docs/validation-rules.md`

## Variant Instructions

- Use Stepped Skill package root: `examples/multi-phase-review`.
- Read `SKILL.md` first, then follow the declared SSP entry and each `Next` target exactly.
- Do not list package directories or inspect future steps unless the current step's `Next` points there.
- Record handoff state as execution state. Do not expose private reasoning in the final answer.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B024.md`.
- Save any execution notes, including observed reads and failures, to `traces/MR-02-S.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
