# SSP M1 Eval Prompt

Run ID: RB-10-O
Blind ID: B019
Task ID: RB-10
Variant: ordinary
Sample: research-brief

## Task

Produce a brief on authoring burden risks and how to keep SSP usable.

## Expected Output

Authoring risk analysis and usability recommendations.

## Input Artifacts

- `docs/architecture.md`
- `docs/authoring-guide.md`
- `examples`
- `docs/evaluation/report.md`

## Variant Instructions

- Use ordinary Skill baseline: `examples/research-brief/ordinary-skill-baseline.md`.
- Do not read SSP step files, `.ssp/manifest.json`, expected-chain files, or expected-handoff files.
- Apply the ordinary baseline linearly to the task.

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to `outputs/B019.md`.
- Save any execution notes, including observed reads and failures, to `traces/RB-10-O.md`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
