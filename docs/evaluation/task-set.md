# Stepped Skill Protocol M1 Eval Task Set

Status: draft, executable design, not yet run.

This document defines the first M1 task set, runbook, and scorecard for evaluating Stepped Skill Protocol against ordinary all-in-one Skill execution.

The point of this eval is narrow:

> Does static distributed step reading improve execution on naturally multi-phase tasks enough to justify a protocol?

It does not try to prove that step-by-step prompting is always better. It tests whether Stepped Skill packages are better than ordinary Skills for tasks that already have clean phase boundaries.

## 1. Eval Principle

SSP should win because it makes the right work easier, not because the task is artificial.

A valid M1 task must satisfy all of these conditions:

- the work naturally has multiple phases;
- each phase can be completed with bounded local context;
- later phases benefit from a compact handoff from earlier phases;
- future step instructions are not required to complete the current step;
- the same task can be run with an ordinary Skill baseline;
- task inputs are identical across A/B variants.

Reject tasks where:

- the work is one tightly coupled reasoning chain;
- splitting removes information required for correctness;
- the task is mostly about recalling hidden facts;
- the task requires hard secrecy between steps;
- success depends on model-specific tool quirks.

## 2. Fixtures Under Test

SSP fixtures:

- `examples/research-brief/`
- `examples/multi-phase-review/`

Ordinary Skill baselines:

- `examples/research-brief/ordinary-skill-baseline.md`
- `examples/multi-phase-review/ordinary-skill-baseline.md`

Preflight command:

```bash
node tools/run-conformance.mjs
node tools/check-m1-readiness.mjs
```

Expected preflight result:

```text
source validation passes for both valid fixtures
publication validation passes for both valid fixtures
CRLF frontmatter validation passes
41 invalid publication fixtures fail with expected stable error codes
PASS SSP v0 conformance suite draft
PASS SSP M1 readiness check
```

Eval harness command:

```bash
node tools/prepare-m1-eval.mjs
```

Default generated run package:

```text
eval-runs/m1-draft/
```

Generated package contents:

- `run-order.csv`: stable randomized 40-run order;
- `scorecard.csv`: one row per run;
- `blind-review-map.csv`: blind id to run id / variant mapping;
- `reviewer-guide.md`: blind quality scoring, process scoring, and win/tie/loss rules;
- `operator-guide.md`: execution discipline, required evidence, and trace template;
- `prompts/`: 40 prompts, one for each task/variant pair;
- `outputs/`: save blind final outputs here;
- `traces/`: save execution notes and observed reads here;
- `summary.md` / `summary.json`: generated after scoring by `summarize-m1-eval.mjs`.

Summary command:

```bash
node tools/check-m1-readiness.mjs
node tools/summarize-m1-eval.mjs
```

`check-m1-readiness.mjs` must pass before executing M1. It checks run package files, run/scorecard/blind-map consistency, prompt paths, input artifact paths, task pairing, and SSP prompt bias guards.

## 3. Runbook

Run every task twice:

- `ordinary`: use the ordinary Skill baseline;
- `SSP`: use the Stepped Skill package.

Controls:

- same model;
- same local repository state;
- same tool access;
- same input artifacts;
- same time budget;
- same final output request;
- same evaluator rubric.

Recommended order:

- randomize variant order per task;
- do not run all ordinary tasks first and all SSP tasks second;
- blind-review final outputs where practical.

Recording requirements:

- save the full prompt used for each variant;
- save final output;
- save observed file-read sequence if available;
- save a non-empty trace file for each completed run;
- record whether the SSP run read each step in expected order;
- record whether it skipped, duplicated, or prematurely executed a later phase;
- record any user correction or manual intervention.

Do not repair a run during evaluation. If the model ignores `Next`, skips a phase, or produces a weak handoff, record the failure instead of guiding it back.

Completed scorecard rows without a matching non-empty `outputs/<blind_id>.md` and `traces/<run_id>.md` are invalid. The summary tool treats missing evidence as a data-integrity failure, not as an SSP win/loss.

## 4. Research Brief Tasks

Use the `research-brief` fixture.

| ID | Task | Input Artifacts | Expected Output |
| --- | --- | --- | --- |
| RB-01 | Produce a decision brief on whether SSP should position itself as an Agent Skill extension or a new workflow format. | `docs/architecture.md`, `docs/authoring-guide.md`, `docs/validation-rules.md` | Decision-ready brief with recommendation, tradeoffs, risks, and unknowns. |
| RB-02 | Produce a brief on whether static distributed reading is a product capability or only a prompt pattern. | `docs/architecture.md`, `docs/security-notes.md`, `docs/architecture-review-audit.md` | Clear position, evidence, counterarguments, and architecture implication. |
| RB-03 | Compare SSP with ordinary checklist-style Skill authoring for multi-phase review tasks. | `docs/architecture.md`, `examples/multi-phase-review/`, `examples/multi-phase-review/ordinary-skill-baseline.md` | Comparison table plus recommendation. |
| RB-04 | Summarize the strongest and weakest evidence that SSP has product value. | `docs/architecture.md`, `docs/evaluation/report.md`, `docs/architecture-review-audit.md` | Evidence brief distinguishing proven, plausible, and unproven claims. |
| RB-05 | Produce a release-readiness brief for turning SSP from architecture draft into public spec. | `docs/architecture.md`, `docs/validation-rules.md`, `docs/conformance-suite.md`, `docs/evaluation/report.md` | Release gate list, missing artifacts, and stop conditions. |
| RB-06 | Produce a brief on how SSP should handle fallback for agents that do not understand the protocol. | `docs/architecture.md`, sample `SKILL.md` files, ordinary baselines | Fallback policy and quality bar. |
| RB-07 | Produce a brief on protocol governance for SSP versioning and extensions. | `docs/architecture.md`, `docs/validation-rules.md` | Governance recommendation with extension and deprecation rules. |
| RB-08 | Produce a brief on the minimum viable validator for SSP v0. | `docs/validation-rules.md`, `tools/validate-ssp.mjs`, `docs/conformance-suite.md` | Validator scope, non-scope, and required error codes. |
| RB-09 | Produce a brief on whether SSP should support branching in v0. | `docs/architecture.md`, `docs/validation-rules.md`, `docs/architecture-review-audit.md` | Recommendation with product reasoning and future path. |
| RB-10 | Produce a brief on authoring burden risks and how to keep SSP usable. | `docs/architecture.md`, `docs/authoring-guide.md`, `examples/`, `docs/evaluation/report.md` | Authoring risk analysis and usability recommendations. |

## 5. Multi-Phase Review Tasks

Use the `multi-phase-review` fixture.

| ID | Task | Input Artifacts | Expected Output |
| --- | --- | --- | --- |
| MR-01 | Review the SSP architecture draft for product essence, protocol boundaries, and overclaiming. | `docs/architecture.md`, `docs/architecture-review-audit.md` | Findings ordered by severity, with architecture-level recommendations. |
| MR-02 | Review the validation rules draft for ambiguity, missing invariants, and implementability. | `docs/validation-rules.md` | Findings plus concrete rule fixes. |
| MR-03 | Review the conformance suite draft for coverage gaps. | `docs/conformance-suite.md` | Missing fixture matrix and priority recommendations. |
| MR-04 | Review the M1 evaluation report draft for whether it can prove value. | `docs/evaluation/report.md` | Findings on metrics, gates, and execution risks. |
| MR-05 | Review the Research Brief sample as a public example. | `examples/research-brief/` | Findings on fallback, step sufficiency, handoff quality, and clarity. |
| MR-06 | Review the Multi-Phase Review sample as a public example. | `examples/multi-phase-review/` | Findings on realism, step boundaries, and adoption clarity. |
| MR-07 | Review the validator prototype for false positives, false negatives, and maintainability. | `tools/validate-ssp.mjs` | Findings with concrete test cases or code-level risks. |
| MR-08 | Review SSP threat model and non-goals for honesty and future runtime compatibility. | `docs/architecture.md`, `docs/security-notes.md` | Findings on claims, limitations, and required warnings. |
| MR-09 | Review the public release package checklist for whether it is enough for broad adoption. | `docs/architecture.md`, `docs/architecture-review-audit.md` | Findings on missing public-facing assets and launch risk. |
| MR-10 | Review whether SSP's current v0 scope is narrow enough to avoid architecture debt. | `docs/architecture.md`, `docs/architecture-review-audit.md` | Findings on scope, cut lines, and future-proofing. |

## 6. Scorecard

Use one row per run.

The generated run package includes `reviewer-guide.md`; reviewers should score final outputs before opening `blind-review-map.csv`.

| Field | Values |
| --- | --- |
| `run_id` | Stable ID, for example `RB-01-A` |
| `blind_id` | Blind output ID, for example `B001` |
| `task_id` | `RB-01` to `MR-10` |
| `variant` | `ordinary` or `SSP` |
| `model` | Exact model identifier |
| `date` | ISO date |
| `success` | `1`, `0.5`, or `0` |
| `quality` | `1` to `5` |
| `chain_complete` | `yes`, `no`, or `n/a` |
| `step_order_correct` | `yes`, `no`, or `n/a` |
| `skipped_step` | `yes` or `no` |
| `premature_future_work` | `yes` or `no` |
| `handoff_quality` | `3`, `2`, `1`, `0`, or `n/a` |
| `user_correction` | count |
| `tool_reads` | count |
| `tokens` | total tokens if available |
| `time_seconds` | wall-clock seconds |
| `win_tie_loss` | `win`, `tie`, `loss`, or blank for automatic quality-based comparison |
| `failure_category` | task-design, authoring-design, protocol-design, model-following, infrastructure, or blank |
| `notes` | short failure or success note |

The summarizer validates scorecard values before interpreting gates. Blank fields keep the summary `incomplete`; illegal values make the summary `invalid`.

Quality scale:

- `5`: excellent, decision-ready;
- `4`: strong, minor gaps;
- `3`: usable, needs revision;
- `2`: weak, substantial gaps;
- `1`: unusable.

Success scale:

- `1`: satisfies the requested job;
- `0.5`: partially satisfies it with meaningful gaps;
- `0`: fails the job.

Handoff quality:

- `3`: compact, complete, and useful to the next phase;
- `2`: usable but noisy or missing a minor item;
- `1`: weak and forces the next phase to reconstruct context;
- `0`: missing.

## 7. Aggregation

Aggregate separately for:

- all tasks;
- Research Brief tasks only;
- Multi-Phase Review tasks only.

Required aggregate numbers:

- SSP chain completion rate;
- skipped-step rate by variant;
- premature future work rate by variant;
- average blind quality by variant;
- win/tie/loss count for SSP against ordinary Skill;
- user correction delta;
- token and time ratio;
- notable failure categories.

SSP win/tie/loss:

- `win`: SSP quality is higher, or quality ties while SSP has better process reliability;
- `tie`: quality and process reliability are materially similar;
- `loss`: SSP quality is lower, or process reliability is worse without a quality gain.

## 8. M1 Decision Rule

SSP passes M1 only if it clears the gates in `docs/evaluation/report.md`.

If SSP fails:

- do not publish a formal protocol;
- classify failures as task-design, authoring-design, protocol-design, or model-following failures;
- redesign the smallest layer that explains the failures;
- rerun the eval with the same task set plus targeted regression tasks.

If SSP passes:

- freeze the M1 task set as the first public evidence baseline;
- write the formal specification;
- keep this task set as a regression suite for future SSP changes.
