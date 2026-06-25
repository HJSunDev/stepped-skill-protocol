# Stepped Skill Protocol

[简体中文](README.md) | **English**

Stepped Skill Protocol (SSP) is an Agent Skills-compatible convention for packaging naturally multi-phase work as a finite chain of local step files.

SSP keeps `SKILL.md` useful as an ordinary Skill, then moves high-fidelity phase instructions into step files that are read one at a time. The goal is staged focus through static distribution: the current step is sufficient, and the next step is only read when it becomes relevant.

SSP is not a workflow engine, planner, permission system, or security boundary. It is a small protocol layer for writing Skills that can degrade gracefully today and support stronger runtime execution later.

## Why SSP Exists

Many useful agent workflows are not one continuous prompt. They are naturally staged:

- collect inputs, then synthesize, then produce a final brief;
- inspect a codebase, then evaluate risks, then write recommendations;
- inventory a migration surface, then classify blockers, then create a rollout plan.

Without SSP, users often hand-feed these phases to an agent manually. SSP turns that manual staged prompting pattern into a reusable Skill package.

## Model in One Minute

An SSP package is still a normal Agent Skill:

- `SKILL.md` remains the entry point and includes a complete ordinary fallback.
- `metadata.stepped-skill.entry` points to the first local step file.
- Each step contains one phase's objective, resources, instructions, output contract, handoff, and `Next` target.
- `Next` is either another local step path or `END`.

The minimal loop is:

```text
Read SKILL.md -> read entry step -> complete current step -> read Next -> stop at END
```

SSP v0 is intentionally finite, linear, local-file based, and boring to validate. That restraint is the product choice.

## Execution Levels

SSP supports progressive adoption:

- **L0 ordinary Skill**: any agent can use the fallback workflow in `SKILL.md`.
- **L1 self-directed SSP**: an agent with local file access follows `Entry -> Step -> Next -> END`.
- **L2 runtime-native SSP**: a runtime validates the manifest and may enforce current-step scoped access.

L0 and L1 provide static distribution and process guidance, not hard isolation. Security-sensitive scoped access requires L2 runtime enforcement.

## Repository Map

- `docs/` - architecture, authoring, security, validation, conformance, and evaluation documents.
- `examples/` - example Stepped Skill packages.
- `skills/` - ordinary Agent Skills that help agents author or review SSP packages.
- `conformance/fixtures/` - valid and invalid protocol fixtures.
- `tools/` - reference validation, manifest, and evaluation tooling.
- `eval-runs/` - generated evaluation run packages.

## Authoring and Validation

Start with the authoring guide:

- [Authoring Guide](docs/authoring-guide.md)
- [Validation Rules](docs/validation-rules.md)
- [Conformance Suite](docs/conformance-suite.md)

## Install Authoring Skills

SSP includes portable ordinary Agent Skills that teach an agent how to author SSP packages. They are intentionally not SSP packages themselves.

- [`skills/stepped-skill-author/`](skills/stepped-skill-author/) - Simplified Chinese, default package
- [`skills/stepped-skill-author-en/`](skills/stepped-skill-author-en/) - English package

### Option 1: Ask Your Agent

Open your agent runtime and ask:

```text
Install the SSP authoring skill from https://github.com/HJSunDev/stepped-skill-protocol.
Use stepped-skill-author for Simplified Chinese or stepped-skill-author-en for English.
```

### Option 2: Use the Skills CLI

```bash
npx skills add HJSunDev/stepped-skill-protocol --skill stepped-skill-author
npx skills add HJSunDev/stepped-skill-protocol --skill stepped-skill-author-en
```

Add `-a codex`, `-a claude-code`, `-a cursor`, or another supported agent target when you want to install for a specific runtime.

### Option 3: Manual Install

Copy one complete skill directory into your agent's skills directory:

```text
skills/stepped-skill-author/
skills/stepped-skill-author-en/
```

Each directory is self-contained and can be used outside this repository. If your runtime cannot load Agent Skills automatically, open the selected `SKILL.md` and its `references/` files as plain Markdown guidance.

Agent Skills do not define a standard same-folder multilingual `SKILL.md` convention, so each language is packaged as a separate self-contained Skill directory. This project treats Chinese as the default authoring Skill, while English uses the `-en` suffix.

## Project Status

SSP is a pre-M1 architecture draft.

The repository currently includes architecture rationale, examples, validation rules, conformance fixtures, authoring guidance, security notes, a reference validator prototype, a manifest generator prototype, and an M1 evaluation harness.

It is not yet a proven public protocol. Public value claims require real M1 evaluation results: completed runs, blind review scores, chain-completion measurements, and a release decision.

The tooling in `tools/` is reference-quality for protocol invariants. Production validators should use a full YAML parser for Agent Skills frontmatter.

Before public promotion, SSP still needs real M1 runs, a formal specification split from architecture rationale, contribution and governance rules, release licensing, and a changelog.

## Primary References

- [Agent Skills Specification](https://agentskills.io/specification)
- [Anthropic Agent Skills docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Anthropic Skills repository](https://github.com/anthropics/skills)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

## Quick Checks

```bash
node tools/validate-ssp.mjs --mode source examples/research-brief
node tools/generate-manifest.mjs --check examples/research-brief examples/multi-phase-review conformance/fixtures/agent-skill-optional-fields
node tools/run-conformance.mjs
node tools/check-m1-readiness.mjs
node tools/summarize-m1-eval.mjs
```

## Generate Manifest

Publication packages include a generated `.ssp/manifest.json`. Authors should edit `SKILL.md` and step files, then regenerate the manifest:

```bash
node tools/generate-manifest.mjs path/to/skill-package
```

To check that an existing manifest is current:

```bash
node tools/generate-manifest.mjs --check path/to/skill-package
```

## Regenerate Evaluation Package

This command rewrites the generated M1 run package under `eval-runs/m1-draft/`:

```bash
node tools/prepare-m1-eval.mjs
```

## Roadmap

Before SSP moves from draft to a stable public release, the project is focused on:

- separating the normative specification from architecture notes;
- keeping source-form and publication-form examples valid;
- expanding conformance fixtures around real authoring and implementation failures;
- collecting evaluation evidence for naturally staged tasks;
- finalizing licensing, contribution, governance, and changelog policy.
