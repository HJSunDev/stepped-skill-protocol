# SSP M1 Eval Prompt

Run ID: MR-02-O
Blind ID: B023
Task ID: MR-02
Variant: ordinary
Sample: multi-phase-review

## Task

Review the validation rules draft for ambiguity, missing invariants, and implementability.

## Expected Output

Findings plus concrete rule fixes.

## Input Artifacts

- `docs/validation-rules.md`

## Variant Instructions

- Use ordinary Skill baseline: `examples/multi-phase-review/ordinary-skill-baseline.md`.
- Do not read SSP step files, `.ssp/manifest.json`, expected-chain files, or expected-handoff files.
- Apply the ordinary baseline linearly to the task.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B023.md`.
- Save any execution notes, including observed reads and failures, to `traces/MR-02-O.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
