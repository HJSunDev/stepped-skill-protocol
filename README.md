# Stepped Skill Protocol

Stepped Skill Protocol (SSP) is an Agent Skills-compatible protocol for static, stepwise skill execution.

It keeps a Skill usable as an ordinary Skill, while allowing high-fidelity task instructions to be distributed across finite local step files. A capable agent can follow each step's `Next` target; a native runtime can later enforce stronger scoped step access.

## Repository Layout

- `docs/` - architecture, authoring, security, validation, conformance, and evaluation documents.
- `examples/` - example Stepped Skill packages.
- `conformance/fixtures/` - valid and invalid protocol fixtures.
- `tools/` - reference validation and evaluation tooling.
- `eval-runs/` - generated evaluation run packages.

## Current Status

SSP is a pre-M1 architecture draft. It has examples, validation rules, conformance fixtures, authoring guidance, security notes, and an M1 evaluation harness.

It is not yet a proven public protocol. Public value claims require real M1 evaluation results.

## Quick Checks

```bash
node tools/run-conformance.mjs
node tools/prepare-m1-eval.mjs
node tools/summarize-m1-eval.mjs
```

