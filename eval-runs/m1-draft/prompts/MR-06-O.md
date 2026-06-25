# SSP M1 Eval Prompt

Run ID: MR-06-O
Blind ID: B031
Task ID: MR-06
Variant: ordinary
Sample: multi-phase-review

## Task

Review the Multi-Phase Review sample as a public example.

## Expected Output

Findings on realism, step boundaries, and adoption clarity.

## Input Artifacts

- `examples/multi-phase-review`

## Variant Instructions

- Use ordinary Skill baseline: `examples/multi-phase-review/ordinary-skill-baseline.md`.
- Do not read SSP step files, `.ssp/manifest.json`, expected-chain files, or expected-handoff files.
- Apply the ordinary baseline linearly to the task.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B031.md`.
- Save any execution notes, including observed reads and failures, to `traces/MR-06-O.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
