# SSP M1 Eval Prompt

Run ID: RB-08-S
Blind ID: B016
Task ID: RB-08
Variant: SSP
Sample: research-brief

## Task

Produce a brief on the minimum viable validator for SSP v0.

## Expected Output

Validator scope, non-scope, and required error codes.

## Input Artifacts

- `docs/validation-rules.md`
- `tools/validate-ssp.mjs`
- `docs/conformance-suite.md`

## Variant Instructions

- Use Stepped Skill package root: `examples/research-brief`.
- Read `SKILL.md` first, then follow the declared SSP entry and each `Next` target exactly.
- Do not list package directories or inspect future steps unless the current step's `Next` points there.
- Record handoff state as execution state. Do not expose private reasoning in the final answer.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B016.md`.
- Save any execution notes, including observed reads and failures, to `traces/RB-08-S.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
