# SSP M1 Eval Prompt

Run ID: MR-07-S
Blind ID: B034
Task ID: MR-07
Variant: SSP
Sample: multi-phase-review

## Task

Review the validator prototype for false positives, false negatives, and maintainability.

## Expected Output

Findings with concrete test cases or code-level risks.

## Input Artifacts

- `tools/validate-ssp.mjs`

## Variant Instructions

- Use Stepped Skill package root: `examples/multi-phase-review`.
- Read `SKILL.md` first, then follow the declared SSP entry and each `Next` target exactly.
- Use exact paths from the entry, current step `Resources`, and current step `Next`; a valid SSP package gives the current step enough information to proceed without directory discovery.
- Record handoff state as execution state. Do not expose private reasoning in the final answer.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B034.md`.
- Save any execution notes, including observed reads and failures, to `traces/MR-07-S.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
