# SSP M1 Eval Prompt

Run ID: RB-06-O
Blind ID: B011
Task ID: RB-06
Variant: ordinary
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

- Use ordinary Skill baseline: `examples/research-brief/ordinary-skill-baseline.md`.
- Do not read SSP step files, `.ssp/manifest.json`, expected-chain files, or expected-handoff files.
- Apply the ordinary baseline linearly to the task.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B011.md`.
- Save any execution notes, including observed reads and failures, to `traces/RB-06-O.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
