# Stepped Skill Protocol Architecture Review Audit

Status: current-state audit, pre-M1.

This document audits the current Stepped Skill Protocol draft against the product and architecture bar:

> top-tier protocol, top-tier architecture, broadly usable, easy to adopt, high-quality in effect, and durable enough to deserve public promotion.

It is intentionally strict. The goal is not to defend SSP. The goal is to identify whether SSP is becoming a real protocol or merely an elegant idea.

## 1. Current Verdict

Architecture coherence:

> Conditional pass.

SSP now has a coherent product center, disciplined v0 scope, compatible Skill packaging, authoring guidance, security boundary language, validation rules, sample packages, conformance fixtures, and an M1 eval plan.

Public protocol readiness:

> Not passed.

SSP must not be publicly promoted as a proven protocol until M1 evaluation has real runs, blind review scores, chain-completion measurements, and a pass/fail decision.

Reason:

> The architecture can be good before the product value is proven. The public claim cannot.

## 2. Review Standard

SSP should pass only if these are true in current artifacts, not merely intended:

- product essence is clear;
- it remains Skill-first;
- it avoids becoming a workflow engine;
- its core mechanism is static distributed reading, not fake security;
- authoring is simple enough for real adoption;
- validation is deterministic;
- failure modes are explicit;
- public claims are honest;
- value is measurable against ordinary Skills.

## 3. Requirement Audit

| Requirement | Current Evidence | Verdict | Notes |
| --- | --- | --- | --- |
| Product essence is clear | `docs/architecture.md` defines SSP as turning manual staged prompting into reusable Skill packages. | Pass | The center is strong: productizing work users already hand-feed across turns. |
| Skill compatibility is preserved | `SKILL.md` remains the entry point; samples include ordinary fallbacks and ordinary baselines. | Pass | The protocol stays close enough to Agent Skills to avoid looking like an unrelated format. |
| v0 scope is disciplined | v0 is single-entry, finite, linear, local-file based; branching and runtime orchestration are out of scope. | Pass | This is the right scope cut. Branching in v0 would create architecture debt. |
| Core mechanism is physical distribution | Main draft and security notes distinguish distributed files from prompt-only instruction. | Pass | The design does move future step detail out of initial context. |
| Isolation claims are honest | Security notes say only L2 can enforce scoped access; L0/L1 are not security boundaries. | Pass | This corrects the biggest external-review risk. |
| Focus comes from sufficiency, not prohibition | Main draft and authoring guide require each step to be sufficient. | Pass | This aligns with the "models get smarter" belief: the model has no reason to inspect irrelevant future steps. |
| Authoring is easy | Authoring guide reduces the model to ordinary `SKILL.md`, step bodies, resources, and validator. | Conditional pass | The design is easy on paper; real authoring time still needs M1 measurement. |
| L0 fallback is not an empty shell | Sample packages include ordinary fallback and ordinary baseline files. | Pass for M0 | More sample diversity is needed before public release. |
| L1 execution is portable | L1 uses local file reads and explicit `Next`; samples and validator support the chain. | Conditional pass | Needs real L1 execution traces from M1. |
| L2 has a clean growth path | Security notes define scoped access, structured handoff, traces, and policy checks. | Pass | L2 enhances the same protocol instead of replacing it. |
| Validation is deterministic | Validation rules, validator prototype, source/publication modes, and conformance runner exist. | Pass for M0 | The suite now covers source-only validation plus twenty-eight invalid publication classes across entry, fallback, manifest, resource, handoff, chain, version, extension, generated frontmatter, and path-shape failures. |
| Failure is honest | Invalid fixtures reject broken `Next`, missing entry, missing fallback, invalid manifest JSON, manifest mismatch, unsafe resources, missing handoff, unreachable step, unsupported version, unsupported extension, cycle, generated frontmatter mismatch, duplicate manifest paths, invalid extension field types, entry traversal, and directory-like `Next`. | Pass for M0 | More edge-case fixtures are still useful before public release, but the core failure model is now materially exercised. |
| Trust boundary is named | Security notes distinguish trusted package content from untrusted task/external data. | Pass | Public wording is appropriately conservative. |
| Public release is gated | Main draft lists spec, authoring guide, examples, validator, conformance suite, eval report, security notes, changelog. | Conditional pass | Some artifacts exist only as drafts; formal spec and changelog are intentionally not created before M1. |
| Value is testable | Evaluation report, 20-task eval task set, eval harness, readiness checker, blind reviewer guide, scorecard validator/summarizer, and generated 40-run package exist. | Conditional pass | Value is executable, scoreable, readiness-checkable, and aggregatable, but not yet tested. |
| Public value is proven | No real M1 run data yet. | Fail / missing | This is the main remaining blocker. |

## 4. Architecture Debt Risks

### 4.1 Workflow Engine Drift

Risk:

SSP may grow branching, dynamic routing, retries, permissions, and planning until it becomes a workflow engine.

Guardrail:

- v0 stays linear and finite;
- branching remains future work;
- runtime-native L2 adds enforcement, not new authoring complexity;
- "ordinary Skill first" remains the product anchor.

Current status:

> Controlled.

### 4.2 Fake Isolation

Risk:

People may believe L1 prevents future-step reading.

Guardrail:

- security notes explicitly disallow hard-isolation claims for L0/L1;
- L2 is the only enforceable isolation level;
- public wording uses "static distribution" rather than "hidden".

Current status:

> Controlled in docs; must be preserved in all future marketing and spec language.

### 4.3 Authoring Ceremony

Risk:

Authors may be forced to maintain manifest, ids, generated frontmatter, and conformance artifacts manually.

Guardrail:

- author source is plain `SKILL.md` plus Markdown step files;
- machine artifacts are generated;
- authoring guide frames validator as feedback, not ceremony.

Current status:

> Mostly controlled, pending real authoring-time data.

### 4.4 Premature Standardization

Risk:

Publishing a formal spec before eval could freeze the wrong abstraction.

Guardrail:

- main draft says do not write polished public specification before eval;
- M1 gates must decide whether to proceed, repeat, or redesign.

Current status:

> Controlled.

### 4.5 Evidence Laundering

Risk:

External research about general task decomposition may be used as if it proves SSP.

Guardrail:

- evaluation report defines a narrow SSP-vs-ordinary-Skill question;
- task set uses naturally multi-phase work;
- public proof requires M1 data.

Current status:

> Controlled in current evaluation framing.

## 5. Forbidden Public Claims

Until M1 passes, do not claim:

- SSP is proven better than ordinary Skills;
- SSP broadly improves agent quality;
- SSP prevents agents from seeing future steps;
- SSP solves prompt injection;
- SSP is a workflow engine;
- SSP is ready as a public standard.

Allowed current claim:

> SSP is a coherent architecture draft for Skill-compatible static distributed step reading, with samples, validation rules, conformance fixtures, authoring guidance, security notes, and a planned M1 evaluation.

## 6. Public Release Readiness Snapshot

| Artifact | Current State | Release Readiness |
| --- | --- | --- |
| Architecture draft | Exists | Draft-ready |
| Authoring guide | Exists | Draft-ready |
| Security notes | Exists | Draft-ready |
| Validation rules | Exists | Draft-ready |
| Validator prototype | Exists | M0 prototype |
| Conformance suite | Exists with source-only validation plus twenty-eight executable invalid publication fixtures | M0/M1 draft |
| Sample packages | Two exist | M0 sample quality |
| Evaluation task set | Exists | Ready to run |
| Evaluation harness | Exists with generated 40-run package and readiness checker | Ready to execute after readiness check |
| Evaluation summarizer | Exists with incomplete current summary, scorecard validation, and output/trace evidence checks | Ready to validate evidence and aggregate real scores |
| Evaluation report | Planned, not executed | Not release-ready |
| Formal specification | Not written by design | Blocked until M1 |
| Changelog | Not written | Future release artifact |

## 7. Next Actions For Review Passage

Priority 1:

- execute the generated 40-run M1 package;
- fill scorecard using the reviewer guide and run the M1 summarizer;
- run the 20-task M1 eval;
- record L1 chain completion;
- blind-score final outputs;
- compare ordinary Skill vs SSP;
- decide continue/repeat/redesign.

Priority 2:

- add future conformance fixtures only when real authoring or implementation failures reveal new edge cases;
- add sample execution transcripts after M1;
- record authoring time for at least one new Stepped Skill.

Priority 3:

- after M1 pass, split architecture rationale from normative `specification.md`;
- create release changelog;
- create public examples from the validated samples;
- keep security notes separate and blunt.

## 8. Chief Product / Architecture Judgment

The core idea still passes the taste test:

> Users already manually feed multi-phase work to agents. SSP packages that behavior into a reusable Skill without requiring a full workflow engine.

The architecture is strongest where it refuses overreach:

- no branching in v0;
- no fake security claims;
- no empty `SKILL.md`;
- no agent-native requirement for basic usefulness;
- no public spec before evidence.

The remaining question is not "is the architecture elegant?" It is:

> Does SSP reliably make suitable multi-phase Skills better than ordinary Skills?

That question is now testable, but not answered.

## 9. Audit Conclusion

Current state:

> SSP passes internal architecture-coherence review conditionally, but it does not yet pass public-product-value review.

This is the right state before M1. A weaker architecture would already be making public claims. A stronger next step is not more abstraction; it is real evaluation.
