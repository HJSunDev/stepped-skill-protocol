# Stepped Skill Protocol Validation Rules Draft

This draft defines reference validation behavior for SSP v0. It is not yet the final public specification, but it is precise enough for architecture review and early validator prototyping.

Current reference prototype:

```text
tools/validate-ssp.mjs
```

Source validation:

```bash
node tools/validate-ssp.mjs --mode source path/to/skill
```

Publication validation:

```bash
node tools/validate-ssp.mjs --mode publication path/to/skill
```

The default mode is `publication`, because public packages should be checked with generated control-plane artifacts.

Current conformance runner:

```text
tools/run-conformance.mjs
```

The prototype is intentionally small. It exists to prove the validation model against M0 samples, not to serve as the final production validator.

## 1. Validation Modes

SSP validators SHOULD support two modes.

### Source Validation

Source validation checks author-written artifacts:

- `SKILL.md`;
- author source step files;
- referenced resources;
- body `## Next` values;
- L0 fallback.

Source validation MUST NOT require generated step frontmatter or `.ssp/manifest.json`.

### Publication Validation

Publication validation checks release-ready package artifacts:

- all source validation requirements;
- `.ssp/manifest.json`;
- generated step frontmatter when present;
- deterministic chain projection;
- conformance metadata.

Publication validation MUST fail if generated artifacts disagree with author source.

## 2. Validator Output Shape

Each issue SHOULD use this shape:

```json
{
  "code": "SSP_NEXT_INVALID",
  "severity": "error",
  "path": "steps/evaluate.md",
  "section": "Next",
  "expected": "steps/recommendations.md",
  "actual": "steps/missing.md",
  "message": "Body Next does not match manifest next.",
  "hint": "Update the body Next or regenerate the manifest from source."
}
```

Fields:

- `code`: stable machine-readable error code;
- `severity`: `error` or `warning`;
- `path`: skill-root relative path;
- `section`: section or field when known;
- `expected`: expected value when applicable;
- `actual`: actual value when applicable;
- `message`: concise human-readable explanation;
- `hint`: short remediation hint.

## 3. Error Codes

| Code | Severity | Applies To | Meaning |
| --- | --- | --- | --- |
| `SSP_PACKAGE_INVALID` | error | source/publication | Package fails a required invariant |
| `SSP_ENTRY_MISSING` | error | source/publication | `stepped-skill.entry` is missing or invalid |
| `SSP_VERSION_UNSUPPORTED` | error | source/publication | SSP major version is unknown or unsupported |
| `SSP_STEP_MISSING_SECTION` | error | source/publication | Step is missing a required section |
| `SSP_STEP_UNREADABLE` | error | source/publication | Step file cannot be read |
| `SSP_RESOURCE_UNREADABLE` | error | source/publication | Listed resource file cannot be read |
| `SSP_NEXT_INVALID` | error | source/publication | `Next` is missing, malformed, outside `steps/`, or inconsistent |
| `SSP_HANDOFF_MISSING` | error | source/publication | Non-terminal step lacks handoff definition |
| `SSP_CHAIN_CYCLE` | error | source/publication | Step chain cycles |
| `SSP_CHAIN_UNREACHABLE_STEP` | error | publication | Published package contains unreachable step files |
| `SSP_MANIFEST_MISMATCH` | error | publication | Manifest does not match source chain |
| `SSP_EXTENSION_UNSUPPORTED` | error | publication | Required extension is unknown |
| `SSP_COMPATIBILITY_WARNING` | warning | source/publication | Package is usable but less portable |

## 4. Source Validation Rules

### 4.1 Agent Skill Compatibility

- `SKILL.md` MUST exist.
- `SKILL.md` MUST contain YAML frontmatter followed by Markdown body.
- `name` MUST exist.
- `description` MUST exist.
- `metadata` MUST be a string-to-string map when present.
- SSP metadata keys MUST use the `stepped-skill.` namespace.

### 4.2 SSP Entry

- `metadata["stepped-skill.version"]` MUST exist.
- `metadata["stepped-skill.entry"]` MUST exist.
- Entry path MUST be skill-root relative.
- Entry path MUST point to an existing file under `steps/`.
- Entry path MUST end with `.md`.

### 4.3 L0 Fallback

- `SKILL.md` MUST include a fallback workflow or equivalent ordinary Skill path.
- Fallback MUST be complete enough to produce a lower-fidelity result without reading step files.
- Fallback MUST NOT be empty protocol boilerplate.

### 4.4 Step Sections

Every reachable step MUST include:

- `Objective`;
- `Resources`;
- `Instructions`;
- `Output`;
- `Completion Criteria`;
- `Handoff`;
- `Next`.

Terminal steps MAY define `Handoff` as `None`.

### 4.5 Resources

- `Resources` MUST be exact skill-root relative file paths or `None`.
- Resource paths MUST NOT point to directories.
- Resource paths MUST NOT escape the skill root.
- Resource paths MUST use `/` separators and MUST NOT contain backslashes, query fragments, hash fragments, absolute paths, drive letters, or URLs.
- Resource paths MUST NOT point into `.ssp/`.
- Every listed resource MUST exist.

### 4.6 Next

- `Next` MUST be a single relative step path or `END`.
- Non-terminal `Next` MUST point to an existing file under `steps/`.
- Terminal `Next` MUST be exactly `END`.
- `Next` MUST use `/` separators and MUST NOT contain backslashes, query fragments, hash fragments, absolute paths, drive letters, or URLs.
- `Next` MUST NOT be computed, conditional, multiple, network-based, or directory-based.
- The chain MUST be finite and acyclic.
- The chain MUST reach exactly one `END`.

### 4.7 Handoff

- Every non-terminal step MUST define what to carry forward.
- Handoff MUST NOT require private chain-of-thought.
- Handoff SHOULD be compact enough for the next step to consume.

## 5. Publication Validation Rules

Publication validation adds these rules:

- `.ssp/manifest.json` MUST exist.
- Manifest `protocol` MUST be `stepped-skill`.
- Manifest `version` MUST match supported SSP version.
- Manifest `version` MUST match `metadata["stepped-skill.version"]`.
- Manifest `entry` MUST match `metadata["stepped-skill.entry"]`.
- Manifest `steps` MUST list reachable steps in execution order.
- Manifest `next` values MUST match source body `## Next`.
- Manifest `resources` MUST match source body `## Resources`.
- Generated step frontmatter, when present, MUST match source body and manifest.
- Published packages MUST NOT contain unreachable step files.
- Required extensions MUST be known and supported.
- `metadata["stepped-skill.required-extensions"]`, when present, MUST be a comma-separated list of extension ids.
- Manifest `requiredExtensions`, when present, MUST be an array of extension ids.
- Manifest `requiredExtensions` MUST match `metadata["stepped-skill.required-extensions"]`.

## 6. Deterministic Chain Projection

Projection algorithm:

1. Read `metadata["stepped-skill.entry"]`.
2. Validate entry path.
3. Read the entry step.
4. Read body `## Next`.
5. If `Next` is `END`, stop.
6. Otherwise validate target path and continue.
7. Fail if a step repeats.
8. Produce ordered `manifest.steps`.

The same source package MUST project to the same chain.

## 7. Review Position

These rules are intentionally boring. SSP should feel easy to validate, because a protocol that cannot be checked will not spread professionally.
