# SSP M1 Operator Guide

Use this guide while executing prompts from `run-order.csv`.

## Run Discipline

1. Run prompts in `run-order.csv` order.
2. Use the same model, tools, repository state, and time budget for every paired task.
3. Do not repair weak model behavior during a run.
4. Save only the final user-facing deliverable to `outputs/<blind_id>.md`.
5. Save execution evidence to `traces/<run_id>.md`.
6. Fill `scorecard.csv` after the run, using blind review for final output quality.

## Required Evidence

Every completed scorecard row must have:

- a non-empty final output file at `outputs/<blind_id>.md`;
- a non-empty trace file at `traces/<run_id>.md`;
- scorecard fields filled according to `reviewer-guide.md`.

`tools/summarize-m1-eval.mjs` treats a completed row without output or trace evidence as invalid.

## Trace Template

Use this shape for `traces/<run_id>.md`:

```markdown
# Trace: <run_id>

## Environment

- model:
- date:
- operator:
- time budget:

## Prompt

- prompt path:
- output path:

## Observed Reads

- <path read or n/a>

## SSP Process

- chain complete: yes/no/n/a
- step order correct: yes/no/n/a
- steps observed:
- handoff quality notes:

## Failures Or Deviations

- skipped step:
- premature future work:
- user correction:
- infrastructure issue:

## Notes

- ...
```

## After Running

1. Blind-score final outputs before opening `blind-review-map.csv`.
2. Fill process fields from traces.
3. Run `node tools/summarize-m1-eval.mjs`.
4. Treat `invalid` as a data-integrity failure, not an SSP result.
