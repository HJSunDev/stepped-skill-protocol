# SSP M1 Blind Review Guide

Use this guide to score outputs in `outputs/` before opening `blind-review-map.csv`.

## Blind Review Rule

Do not inspect `run_id`, `variant`, traces, prompts, or `blind-review-map.csv` while assigning output quality.

Score the user-facing output first. Process reliability fields can be filled later from traces.

## Quality Score

Use a 1 to 5 scale:

- `5`: excellent, decision-ready, clear recommendation or findings, important tradeoffs covered, uncertainty named.
- `4`: strong, useful with minor gaps or polish issues.
- `3`: usable, but needs revision before relying on it.
- `2`: weak, misses important parts of the task, substantial correction needed.
- `1`: unusable or mostly fails the requested task.

Score the answer against the task and expected output, not against whether you personally prefer the protocol.

## Success Score

- `1`: satisfies the requested job.
- `0.5`: partially satisfies it with meaningful gaps.
- `0`: fails the job.

## Process Fields

Fill these from traces and execution notes:

- `chain_complete`: `yes` only if an SSP run reached `END`.
- `step_order_correct`: `yes` only if an SSP run followed the expected step order.
- `skipped_step`: `yes` if a required phase was omitted.
- `premature_future_work`: `yes` if later-phase work happened before current-phase deliverables existed.
- `handoff_quality`: `3`, `2`, `1`, `0`, or `n/a` for ordinary runs.

## Win / Tie / Loss

After scoring both blind outputs for a task and unblinding the pair:

- `win`: SSP has higher quality, or quality ties while SSP has better process reliability.
- `tie`: quality and process reliability are materially similar.
- `loss`: SSP has lower quality, or process reliability is worse without a quality gain.

Put the pair result in the SSP row's `win_tie_loss` field. Leave the ordinary row blank.

## Failure Category

Use one of:

- `task-design`: task was unsuitable or ambiguous.
- `authoring-design`: sample Skill or step authoring caused failure.
- `protocol-design`: SSP structure caused failure.
- `model-following`: model ignored clear instructions.
- `infrastructure`: tool, environment, or run setup failed.

Leave blank when no notable failure occurred.

## Bias Controls

- Score final outputs before reading traces.
- Do not reward verbose process narration unless the task asked for it.
- Do not penalize SSP for hidden process if the final output satisfies the task.
- Do not repair a run during scoring.
- Record uncertainty in `notes`.
