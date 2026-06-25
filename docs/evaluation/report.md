# Stepped Skill Protocol M1 Evaluation Report Draft

Status: planned, not yet executed.

This document defines the M1 evaluation plan for Stepped Skill Protocol. It must be completed with real runs before SSP can advance from architecture draft to public specification.

## 1. Evaluation Question

Does SSP produce better or more reliable results than an ordinary all-in-one Skill on suitable multi-phase tasks?

The evaluation is not asking whether step-by-step prompting is generally good. It is asking whether a Stepped Skill package, with static distributed step reading and handoff continuity, is worth using over an ordinary Skill for tasks with natural phase boundaries.

## 2. Hypothesis

For suitable multi-phase tasks, SSP should:

- reduce skipped-step behavior;
- reduce premature future work;
- improve final output quality or tie ordinary Skill while improving process reliability;
- keep authoring burden and runtime cost within an acceptable product budget.

## 3. Current Fixtures

Stepped Skill samples:

- `examples/research-brief/`
- `examples/multi-phase-review/`

Ordinary Skill baselines:

- `examples/research-brief/ordinary-skill-baseline.md`
- `examples/multi-phase-review/ordinary-skill-baseline.md`

Validator:

- `tools/validate-ssp.mjs`

Task set and runbook:

- `docs/evaluation/task-set.md`

Eval harness:

- `tools/prepare-m1-eval.mjs`
- `tools/summarize-m1-eval.mjs`
- generated run package: `eval-runs/m1-draft/`
- generated summary: `eval-runs/m1-draft/summary.md`

Preflight command:

```bash
node tools/run-conformance.mjs
```

Expected preflight result:

```text
PASS research-brief
PASS multi-phase-review
13 invalid fixtures fail with expected stable error codes
PASS SSP v0 conformance suite draft
```

Prepare run package:

```bash
node tools/prepare-m1-eval.mjs
```

Expected run package result:

```text
Prepared SSP M1 eval package: eval-runs/m1-draft
Runs: 40
```

Summarize current run package:

```bash
node tools/summarize-m1-eval.mjs
```

Expected before execution:

```text
M1 eval summary status: incomplete
```

## 4. Task Set

M1 uses the task set defined in:

- `docs/evaluation/task-set.md`

Current split:

- 10 Research Brief tasks;
- 10 Multi-Phase Review tasks.

Task requirements:

- each task must have natural phase boundaries;
- each task must be feasible with both SSP and ordinary Skill;
- tasks must not require private or unsafe data;
- task inputs must be identical across A/B runs;
- source access and tool availability must be identical across A/B runs.

Research brief task examples:

- product positioning and protocol-format decisions;
- static distributed reading value analysis;
- release readiness and validator scope;
- fallback policy, governance, v0 scope, and authoring burden.

Multi-phase review task examples:

- architecture review;
- validation rules review;
- conformance suite review;
- evaluation plan review;
- sample package and validator review.

## 5. Experimental Design

Run each task twice:

- A: ordinary Skill baseline;
- B: Stepped Skill package.

Controls:

- same model;
- same tool access;
- same input artifact;
- same time budget;
- same output expectation;
- same evaluator rubric.

Order should be randomized when possible to reduce order effects.

The evaluator should blind-review final outputs where practical. The evaluator should not know whether an output came from ordinary Skill or SSP during quality scoring.

## 6. Metrics

Primary metrics:

- task success;
- blind output quality;
- skipped-step rate;
- premature future work rate;
- user correction rate;
- chain completion rate.

Secondary metrics:

- token usage;
- execution time;
- number of tool reads;
- handoff quality;
- final answer cleanliness;
- authoring burden.

## 7. Scoring Rubric

Task success:

- `1`: satisfies user need;
- `0.5`: partially satisfies user need with meaningful gaps;
- `0`: fails the task.

Blind output quality:

- `5`: excellent, decision-ready;
- `4`: strong, minor gaps;
- `3`: usable, but needs revision;
- `2`: weak, substantial gaps;
- `1`: unusable.

Skipped-step:

- `yes`: a required phase was omitted;
- `no`: all required phases were represented.

Premature future work:

- `yes`: the model performed later-phase work before current-phase deliverables existed;
- `no`: phase boundaries were respected.

Handoff quality:

- `3`: compact and sufficient;
- `2`: usable but noisy or incomplete;
- `1`: poor;
- `0`: missing.

## 8. Go Gates

SSP may advance from architecture draft to public specification only if:

- L1 chain completion rate >= 90%;
- skipped-step rate <= 10%;
- premature future work rate <= 10%;
- SSP wins or ties ordinary Skill on >= 70% of tasks in blind review;
- user correction rate drops by >= 20%, or blind quality improves clearly without correction-rate regression;
- token usage and latency stay within 1.5x ordinary Skill unless quality gains justify the cost;
- failures are diagnosable by validator or step design.

Stop or redesign if:

- agents often ignore `Next`;
- handoff quality is too poor for later steps;
- fallback is the only reliable path;
- authoring cost outweighs execution quality gains;
- ordinary Skill performs the same with less structure.

## 9. Run Log Template

| Run ID | Task | Sample | Variant | Model | Result | Quality | Skipped Step | Premature Future Work | Chain Complete | User Correction | Tokens | Time | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TBD | TBD | research-brief | ordinary | TBD | TBD | TBD | TBD | TBD | n/a | TBD | TBD | TBD | TBD |
| TBD | TBD | research-brief | SSP | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

Variant values:

- `ordinary`;
- `SSP`.

## 10. Decision Record Template

After evaluation, record:

- date;
- model and environment;
- task set;
- evaluator;
- aggregate metrics;
- notable wins;
- notable failures;
- whether SSP passes M1 gates;
- required redesign, if any;
- decision: continue to specification, repeat eval, or stop/redesign.

## 11. Current Status

Not yet executed.

Current evidence completed:

- architecture draft exists;
- architecture review audit exists;
- authoring guide draft exists;
- security notes draft exists;
- two M0 sample packages exist;
- ordinary baselines exist;
- validation rules draft exists;
- conformance suite draft exists with thirteen executable invalid fixtures;
- M1 task set and runbook exist;
- M1 eval harness exists;
- M1 eval summarizer exists;
- generated M1 run package exists with 40 prompts, run order, reviewer guide, scorecard, blind-review map, and incomplete summary;
- validator prototype passes valid samples and rejects `broken-next`.

Missing evidence:

- 20-task eval execution;
- blind review scores;
- chain completion measurements from real L1 executions;
- user correction measurements;
- token and latency comparison;
- final pass/fail decision.

## 12. Review Position

SSP should not be publicly promoted as a proven protocol until this report contains real results. The architecture may be strong, but product truth comes from whether the protocol improves real task execution.
