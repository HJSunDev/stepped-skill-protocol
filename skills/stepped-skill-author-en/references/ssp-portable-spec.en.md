# Portable SSP Authoring Spec

This reference is intentionally self-contained. Use it when the SSP protocol repository and validator tools are not available.

## Package Identity

An SSP package is an ordinary Agent Skill directory with SSP metadata and step files.

Required source files:

```text
package-name/
  SKILL.md
  steps/
    01-first-step.md
    02-second-step.md
```

Optional files:

```text
  references/
    supporting-file.md
  .ssp/
    manifest.json
```

The package directory name must match `SKILL.md` frontmatter `name`.

## `SKILL.md` Source Contract

`SKILL.md` must remain useful as a normal Agent Skill.

Minimum frontmatter:

```yaml
---
name: package-name
description: Use when the user needs a specific staged outcome.
metadata:
  stepped-skill.version: "0.1"
  stepped-skill.entry: "steps/01-first-step.md"
---
```

Rules:

- `name` uses lowercase letters, digits, and single hyphens.
- `description` describes the user problem, not the protocol mechanics.
- `metadata.stepped-skill.version` is `"0.1"` for v0 packages.
- `metadata.stepped-skill.entry` is a safe local `steps/*.md` path.
- Optional `metadata.stepped-skill.required-extensions` is a comma-separated string.
- The body must include a complete `Fallback Workflow`.
- The body should include a short `Stepped Skill Protocol` capsule that names the entry step and loop.

## Step Source Contract

Every step file should include exactly these operational sections:

```markdown
## Objective
## Resources
## Instructions
## Output
## Completion Criteria
## Handoff
## Next
```

Rules:

- `Resources` is exactly `None` or a Markdown bullet list of skill-root relative file paths.
- `Next` is exactly one bare target or one code-spanned target.
- `Next` is either `END` or a safe local `steps/*.md` path.
- Non-terminal steps must include useful handoff state.
- Terminal steps use `Next` = `END`.
- Do not use absolute paths, URLs, query strings, fragments, backslashes, `..`, or `.ssp/` resources.

## Manifest Projection

For publication packages, create `.ssp/manifest.json` from the source files. Treat it as generated from `SKILL.md` metadata plus each step's `Resources` and `Next`.

Manifest shape:

```json
{
  "protocol": "stepped-skill",
  "version": "0.1",
  "entry": "steps/01-first-step.md",
  "steps": [
    {
      "id": "01-first-step",
      "path": "steps/01-first-step.md",
      "next": "steps/02-second-step.md",
      "resources": []
    },
    {
      "id": "02-second-step",
      "path": "steps/02-second-step.md",
      "next": "END",
      "resources": []
    }
  ]
}
```

Projection rules:

1. Read `metadata.stepped-skill.version` and `metadata.stepped-skill.entry` from `SKILL.md`.
2. Start at the entry step.
3. For each step, read its `Resources` list and `Next` target.
4. Append one manifest step object in execution order.
5. Generate `id` from the step path by removing `steps/`, removing `.md`, and replacing `/` with `.`.
6. Continue until `Next` is `END`.
7. Fail validation if the chain cycles, points to a missing step, or includes unreachable publication steps.
8. If `metadata.stepped-skill.required-extensions` exists, project it as a `requiredExtensions` array split by commas and trimmed.

After any source edit, update the manifest or mark it as stale.

## Validation Without Tools

When no validator is available, report "manual SSP validation only" and check:

- ordinary Agent Skill frontmatter is valid;
- `Fallback Workflow` is complete enough to run;
- entry path exists;
- every step has the required sections;
- every `Resources` entry is local, relative, inside the package, and an existing file;
- every `Next` is one target and resolves to a step or `END`;
- the chain has no cycles;
- publication packages contain no unreachable step files;
- manifest, if present, matches the projected chain;
- the package does not claim L0/L1 hard isolation or security.
