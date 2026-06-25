# SSP M1 Eval Prompt

Run ID: MR-07-O
Blind ID: B033
Task ID: MR-07
Variant: ordinary
Sample: multi-phase-review

## Task

Review the validator prototype for false positives, false negatives, and maintainability.

## Expected Output

Findings with concrete test cases or code-level risks.

## Input Artifacts

- `tools/validate-ssp.mjs`

## Variant Instructions

- Use ordinary Skill baseline: `examples/multi-phase-review/ordinary-skill-baseline.md`.
- Do not read SSP step files, `.ssp/manifest.json`, expected-chain files, or expected-handoff files.
- Apply the ordinary baseline linearly to the task.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B033.md`.
- Save any execution notes, including observed reads and failures, to `traces/MR-07-O.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
