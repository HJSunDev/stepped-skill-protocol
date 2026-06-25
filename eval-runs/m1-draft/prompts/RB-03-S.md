# SSP M1 Eval Prompt

Run ID: RB-03-S
Blind ID: B006
Task ID: RB-03
Variant: SSP
Sample: research-brief

## Task

Compare SSP with ordinary checklist-style Skill authoring for multi-phase review tasks.

## Expected Output

Comparison table plus recommendation.

## Input Artifacts

- `docs/architecture.md`
- `examples/multi-phase-review`
- `examples/multi-phase-review/ordinary-skill-baseline.md`

## Variant Instructions

- Use Stepped Skill package root: `examples/research-brief`.
- Read `SKILL.md` first, then follow the declared SSP entry and each `Next` target exactly.
- Use exact paths from the entry, current step `Resources`, and current step `Next`; a valid SSP package gives the current step enough information to proceed without directory discovery.
- Record handoff state as execution state. Do not expose private reasoning in the final answer.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B006.md`.
- Save any execution notes, including observed reads and failures, to `traces/RB-03-S.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
