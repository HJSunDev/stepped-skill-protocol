# Stepped Skill Protocol

Stepped Skill Protocol (SSP) is an Agent Skills-compatible protocol for static, stepwise skill execution.

It keeps a Skill usable as an ordinary Skill, while allowing high-fidelity task instructions to be distributed across finite local step files. A capable agent can follow each step's `Next` target; a native runtime can later enforce stronger scoped step access.

## One-Minute Model

Use SSP when you would otherwise hand-feed an agent a multi-phase task one message at a time.

An SSP package is still a normal Skill:

- `SKILL.md` remains the entry point and includes a complete ordinary fallback.
- `metadata.stepped-skill.entry` points to the first local step file.
- each step contains the current phase instructions, expected output, handoff state, and one `Next` target.
- `Next` is either another local step path or `END`.

The design goal is staged focus, not a workflow engine. SSP v0 is finite, linear, local-file based, and intentionally boring to validate.

## Execution Levels

- **L0 ordinary Skill**: any agent can use the fallback in `SKILL.md`.
- **L1 self-directed SSP**: an agent with local file access follows `Entry -> Step -> Next -> END`.
- **L2 runtime-native SSP**: a runtime validates the manifest and may enforce current-step scoped access.

L0 and L1 provide static distribution and process guidance, not hard isolation. Security-sensitive isolation requires L2 runtime enforcement.

## Repository Layout

- `docs/` - architecture, authoring, security, validation, conformance, and evaluation documents.
- `examples/` - example Stepped Skill packages.
- `conformance/fixtures/` - valid and invalid protocol fixtures.
- `tools/` - reference validation and evaluation tooling.
- `eval-runs/` - generated evaluation run packages.

## Current Status

SSP is a pre-M1 architecture draft. It has examples, validation rules, conformance fixtures, authoring guidance, security notes, a source/publication validator prototype, and an M1 evaluation harness.

It is not yet a proven public protocol. Public value claims require real M1 evaluation results.

Before public promotion, SSP still needs real M1 runs, blind review results, a formal specification split from the architecture rationale, contribution/governance rules, release licensing, and a changelog.

## Quick Checks

```bash
node tools/validate-ssp.mjs --mode source examples/research-brief
node tools/run-conformance.mjs
node tools/prepare-m1-eval.mjs
node tools/check-m1-readiness.mjs
node tools/summarize-m1-eval.mjs
```
