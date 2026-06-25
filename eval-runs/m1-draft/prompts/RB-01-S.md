# SSP M1 Eval Prompt

Run ID: RB-01-S
Blind ID: B002
Task ID: RB-01
Variant: SSP
Sample: research-brief

## Task

Produce a decision brief on whether SSP should position itself as an Agent Skill extension or a new workflow format.

## Expected Output

Decision-ready brief with recommendation, tradeoffs, risks, and unknowns.

## Input Artifacts

- `docs/architecture.md`
- `docs/authoring-guide.md`
- `docs/validation-rules.md`

## Variant Instructions

- Use Stepped Skill package root: `examples/research-brief`.
- Read `SKILL.md` first, then follow the declared SSP entry and each `Next` target exactly.
- Use exact paths from the entry, current step `Resources`, and current step `Next`; a valid SSP package gives the current step enough information to proceed without directory discovery.
- Record handoff state as execution state. Do not expose private reasoning in the final answer.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B002.md`.
- Save any execution notes, including observed reads and failures, to `traces/RB-01-S.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
