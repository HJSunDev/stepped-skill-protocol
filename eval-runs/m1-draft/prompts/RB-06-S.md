# SSP M1 Eval Prompt

Run ID: RB-06-S
Blind ID: B012
Task ID: RB-06
Variant: SSP
Sample: research-brief

## Task

Produce a brief on how SSP should handle fallback for agents that do not understand the protocol.

## Expected Output

Fallback policy and quality bar.

## Input Artifacts

- `docs/architecture.md`
- `examples/research-brief/SKILL.md`
- `examples/multi-phase-review/SKILL.md`
- `examples/research-brief/ordinary-skill-baseline.md`
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
- Save the final user-facing output to `outputs/B012.md`.
- Save any execution notes, including observed reads and failures, to `traces/RB-06-S.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
