# Stepped Skill Protocol Authoring Guide Draft

Status: draft, pre-M1, not a public specification.

This guide is for Skill authors. It explains how to write a Stepped Skill without first learning the full protocol architecture.

SSP authoring should feel like writing a normal Skill, then moving high-fidelity phase instructions into step files.

## 1. The Authoring Contract

A good Stepped Skill has three promises:

1. It is still useful as an ordinary Skill.
2. Each step is sufficient for its own phase.
3. The model always knows exactly where to continue.

If any promise fails, the package is not ready.

## 2. When To Use SSP

Use SSP when the task naturally has phases.

Good fits:

- research brief: collect, synthesize, finalize;
- multi-phase review: intake, inspect, evaluate, recommend, report;
- migration planning: inventory, risk analysis, plan, rollout notes;
- release readiness: gather signals, classify blockers, decide, publish summary;
- document transformation: parse source, extract structure, rewrite, verify.

Use an ordinary Skill instead when:

- the skill is short;
- the task is one tightly coupled reasoning chain;
- later instructions are required to understand the current phase;
- step boundaries are arbitrary;
- the package needs hard secrecy or security isolation;
- failure to follow the chain would be dangerous.

Product rule:

> SSP is for work the user would otherwise hand-feed to an agent in multiple turns.

## 3. Package Shape

Recommended source layout:

```text
my-stepped-skill/
  SKILL.md
  steps/
    collect.md
    synthesize.md
    finalize.md
  references/
    source-guidelines.md
  .ssp/
    manifest.json
```

Authors write:

- `SKILL.md`;
- step body files under `steps/`;
- optional local reference files.

Tools generate or maintain:

- `.ssp/manifest.json`;
- generated step frontmatter, if the publication form uses it;
- conformance artifacts;
- chain diagrams.

Do not make authors hand-maintain control-plane files.

## 4. Write `SKILL.md`

`SKILL.md` is the only public entry point. It must work for both ordinary agents and SSP-aware agents.

Minimum shape:

```markdown
---
name: example-stepped-skill
description: Use when the user needs a staged result with clear phase boundaries.
metadata:
  stepped-skill.protocol: "0.1"
  stepped-skill.entry: "steps/collect.md"
---

# Example Stepped Skill

Use this skill to produce a staged result.

## Ordinary Fallback

If step files are unavailable, complete the work linearly:

1. Collect the relevant inputs.
2. Synthesize the important findings.
3. Produce the final answer.

## Stepped Execution

This skill uses Stepped Skill Protocol v0.1.

Start with `steps/collect.md`.

Loop:

1. Complete the current step.
2. Produce the required handoff.
3. Read the path named by `Next`.
4. Stop when `Next` is `END`.
```

Rules:

- The `description` should describe the user problem, not the protocol mechanics.
- The fallback must be complete enough to run.
- The protocol capsule should stay short.
- Do not put all high-fidelity step instructions in `SKILL.md`; that defeats distributed reading.

## 5. Choose Step Boundaries

A step should be a real phase of work, not a paragraph break.

Good step boundaries:

- have a clear purpose;
- produce a tangible output;
- hand off compact state to the next phase;
- can be understood without reading future steps;
- have exactly one next target in SSP v0.

Bad step boundaries:

- split one reasoning chain into fragments;
- exist only to reduce tokens;
- hide information that the current phase needs;
- create steps that only say "continue";
- branch based on model preference in v0.

Recommended count:

- 2 to 7 steps for most skills;
- more than 7 steps requires strong justification;
- one step is not SSP.

## 6. Write Step Files

Author source step files should be simple Markdown.

Recommended template:

```markdown
# collect

## Purpose

State what this step is responsible for.

## Inputs

- User request
- Relevant files or resources

## Instructions

1. Do the current phase.
2. Avoid doing later-phase work unless needed to finish this phase.
3. Capture uncertainties explicitly.

## Output

Describe the artifact this step must produce.

## Handoff

Write a compact handoff for the next step with:

- decisions made;
- facts gathered;
- unresolved questions;
- risks or constraints.

## Next

steps/synthesize.md
```

Terminal step:

```markdown
## Next

END
```

Rules:

- Every non-terminal step must have `Handoff`.
- Every step must have `Next`.
- `Next` must be a single local step path or `END`.
- `Handoff` is not hidden chain-of-thought; write only useful execution state.
- The final answer should not dump internal handoff unless the user asks for trace.

## 7. Make Each Step Sufficient

Current-step sufficiency is the heart of SSP.

Ask this before publishing any step:

> Could a capable model complete this step well if it only saw `SKILL.md`, this step, its listed resources, the user request, and the previous handoff?

If the answer is no, fix the step. Do not rely on future steps to explain current work.

Good:

- "Collect candidate sources and classify their reliability."
- "Output a source table and open questions."
- `Next: steps/synthesize.md`

Bad:

- "Start researching. Details are in the next step."
- "Think about the final answer style, then continue."
- `Next: steps/final-answer.md`

## 8. Use Resources Sparingly

Resources are local supporting files, not a dumping ground.

Use resources for:

- rubrics;
- source policies;
- examples;
- domain constraints;
- reusable checklists.

Do not use resources for:

- future step instructions;
- secret answers;
- large unrelated background packs;
- dynamic state that belongs in handoff.

Each step should list only the resources it needs.

## 9. Handoff Quality

Handoff is what makes separate files feel like one execution.

A good handoff is:

- short;
- factual;
- sufficient for the next step;
- free of private reasoning;
- explicit about uncertainty.

Suggested shape:

```markdown
### SSP Handoff

- Completed: ...
- Decisions: ...
- Key facts: ...
- Open questions: ...
- Risks: ...
```

Avoid:

- verbose transcripts;
- hidden reasoning;
- final-answer prose too early;
- "nothing to hand off";
- raw dumps of every observed detail.

## 10. Authoring Checklist

Before running the validator, check:

- `SKILL.md` is a valid ordinary Skill.
- `SKILL.md` has a useful ordinary fallback.
- `SKILL.md` names one entry step.
- each step has `Purpose`, `Instructions`, `Output`, `Handoff` when non-terminal, and `Next`;
- each `Next` target exists or is `END`;
- the chain is finite and linear;
- no step requires reading future steps;
- resources are local and step-scoped;
- the final step produces the user-facing result;
- filenames are boring, portable, and non-misleading.

## 11. Validation

Run the reference validator:

```bash
node tools/validate-ssp.mjs path/to/my-stepped-skill
```

A package is not publication-ready until validation passes.

Validation can catch structural mistakes:

- missing entry step;
- broken `Next`;
- missing resources;
- manifest mismatch;
- missing handoff;
- unreachable step files.

Validation cannot prove product value. Product value requires evaluation on real tasks.

## 12. Self-Test Before Sharing

Run one ordinary Skill execution and one SSP execution on the same task.

Record:

- whether the SSP run read steps in order;
- whether it skipped a phase;
- whether it did future work too early;
- whether the final output improved;
- whether authoring effort was worth it.

If the ordinary Skill is as good with less structure, do not publish the Stepped Skill yet.

## 13. Common Anti-Patterns

Empty shell:

- `SKILL.md` only says "read steps".
- Fix: add a real ordinary fallback.

Future preview:

- `SKILL.md` summarizes every step in detail.
- Fix: keep only a short fallback and entry pointer.

Artificial split:

- one tightly coupled reasoning task is cut into many files.
- Fix: use an ordinary Skill.

Protocol ceremony:

- authors must maintain manifest, ids, schemas, and projections by hand.
- Fix: move those to tooling.

Weak handoff:

- later steps must reconstruct earlier decisions.
- Fix: define a compact handoff contract in each non-terminal step.

Resource dumping:

- every step links every file.
- Fix: list only resources needed for the current phase.

Hidden security claim:

- the package implies future steps are protected.
- Fix: say SSP distributes context by default; hard isolation requires runtime enforcement.

## 14. Publication Checklist

Before public release, a Stepped Skill should include:

- valid ordinary `SKILL.md` fallback;
- source step files;
- generated `.ssp/manifest.json`;
- validator pass;
- expected chain;
- expected handoff sequence;
- one ordinary baseline;
- one successful SSP run note;
- known limitations.

Do not publish a Stepped Skill as evidence for SSP unless it is realistic enough that someone would actually want to use it.

## 15. The Taste Test

A Stepped Skill is good when the author can say:

> I would have manually given these phases to the agent one by one. This package lets the agent do that for me, without turning the Skill into a workflow engine.

That is the product center. Keep every authoring decision pointed at it.
