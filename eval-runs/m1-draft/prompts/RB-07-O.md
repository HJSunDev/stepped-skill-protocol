# SSP M1 Eval Prompt

Run ID: RB-07-O
Blind ID: B013
Task ID: RB-07
Variant: ordinary
Sample: research-brief

## Task

Produce a brief on protocol governance for SSP versioning and extensions.

## Expected Output

Governance recommendation with extension and deprecation rules.

## Input Artifacts

- `docs/architecture.md`
- `docs/validation-rules.md`

## Variant Instructions

- Use ordinary Skill baseline: `examples/research-brief/ordinary-skill-baseline.md`.
- Do not read SSP step files, `.ssp/manifest.json`, expected-chain files, or expected-handoff files.
- Apply the ordinary baseline linearly to the task.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B013.md`.
- Save any execution notes, including observed reads and failures, to `traces/RB-07-O.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
