# Stepped Skill Protocol Conformance Suite Draft

This draft defines the initial M0/M1 conformance suite for SSP v0.

The suite is partially executable through the current reference validator prototype:

```text
tools/validate-ssp.mjs
```

Run the current suite:

```bash
node tools/run-conformance.mjs
```

Expected result:

```text
Source validation:
PASS research-brief
PASS multi-phase-review
PASS agent-skill-optional-fields
PASS source-no-manifest

Publication validation:
PASS research-brief
PASS multi-phase-review
PASS agent-skill-optional-fields

Generated manifest check:
PASS research-brief
PASS multi-phase-review
PASS agent-skill-optional-fields

CRLF frontmatter validation:
PASS research-brief-crlf

Invalid fixture publication validation:
FAIL source-no-manifest -> SSP_PACKAGE_INVALID
FAIL broken-next -> SSP_NEXT_INVALID
FAIL missing-entry-metadata -> SSP_ENTRY_MISSING
FAIL missing-frontmatter -> SSP_AGENT_SKILL_INVALID
FAIL malformed-frontmatter -> SSP_AGENT_SKILL_INVALID
FAIL invalid-skill-name -> SSP_AGENT_SKILL_INVALID
FAIL skill-name-mismatch -> SSP_AGENT_SKILL_INVALID
FAIL invalid-description-shape -> SSP_AGENT_SKILL_INVALID
FAIL empty-compatibility -> SSP_AGENT_SKILL_INVALID
FAIL invalid-compatibility-scalar -> SSP_AGENT_SKILL_INVALID
FAIL invalid-license-scalar -> SSP_AGENT_SKILL_INVALID
FAIL invalid-allowed-tools-shape -> SSP_AGENT_SKILL_INVALID
FAIL invalid-metadata-shape -> SSP_AGENT_SKILL_INVALID
FAIL invalid-metadata-scalar -> SSP_AGENT_SKILL_INVALID
FAIL missing-fallback -> SSP_PACKAGE_INVALID
FAIL empty-fallback -> SSP_PACKAGE_INVALID
FAIL invalid-manifest-json -> SSP_PACKAGE_INVALID
FAIL manifest-entry-mismatch -> SSP_MANIFEST_MISMATCH
FAIL required-extension-mismatch -> SSP_MANIFEST_MISMATCH
FAIL resource-path-escape -> SSP_RESOURCE_UNREADABLE
FAIL resource-directory -> SSP_RESOURCE_UNREADABLE
FAIL malformed-resources-section -> SSP_RESOURCE_UNREADABLE
FAIL resources-none-with-period -> SSP_RESOURCE_UNREADABLE
FAIL empty-instructions -> SSP_STEP_MISSING_SECTION
FAIL missing-handoff -> SSP_HANDOFF_MISSING
FAIL unreachable-step -> SSP_CHAIN_UNREACHABLE_STEP
FAIL unsupported-major-version -> SSP_VERSION_UNSUPPORTED
FAIL unsupported-required-extension -> SSP_EXTENSION_UNSUPPORTED
FAIL cyclic-chain -> SSP_CHAIN_CYCLE
FAIL frontmatter-next-mismatch -> SSP_MANIFEST_MISMATCH
FAIL entry-path-traversal -> SSP_ENTRY_MISSING
FAIL ssp-resource-access -> SSP_RESOURCE_UNREADABLE
FAIL duplicate-manifest-path -> SSP_MANIFEST_MISMATCH
FAIL invalid-required-extensions-type -> SSP_MANIFEST_MISMATCH
FAIL next-directory -> SSP_NEXT_INVALID
FAIL next-with-prose -> SSP_NEXT_INVALID
FAIL next-url -> SSP_NEXT_INVALID
FAIL next-query -> SSP_NEXT_INVALID
FAIL next-absolute-path -> SSP_NEXT_INVALID
FAIL next-backslash-path -> SSP_NEXT_INVALID
FAIL resource-url -> SSP_RESOURCE_UNREADABLE
FAIL resource-query -> SSP_RESOURCE_UNREADABLE
FAIL resource-absolute-path -> SSP_RESOURCE_UNREADABLE
FAIL frontmatter-resource-mismatch -> SSP_MANIFEST_MISMATCH
PASS SSP v0 conformance suite draft
```

## 1. Fixture Roots

Current fixture roots:

```text
examples/
conformance/fixtures/
```

Valid fixtures:

- `research-brief/`
- `multi-phase-review/`
- `conformance/fixtures/agent-skill-optional-fields/`

Source-only valid fixtures:

- `conformance/fixtures/source-no-manifest/`

Executable invalid fixtures:

- `conformance/fixtures/source-no-manifest/` as a publication fixture without manifest
- `conformance/fixtures/broken-next/`
- `conformance/fixtures/missing-entry-metadata/`
- `conformance/fixtures/missing-frontmatter/`
- `conformance/fixtures/malformed-frontmatter/`
- `conformance/fixtures/invalid-skill-name/`
- `conformance/fixtures/skill-name-mismatch/`
- `conformance/fixtures/invalid-description-shape/`
- `conformance/fixtures/empty-compatibility/`
- `conformance/fixtures/invalid-compatibility-scalar/`
- `conformance/fixtures/invalid-license-scalar/`
- `conformance/fixtures/invalid-allowed-tools-shape/`
- `conformance/fixtures/invalid-metadata-shape/`
- `conformance/fixtures/invalid-metadata-scalar/`
- `conformance/fixtures/missing-fallback/`
- `conformance/fixtures/empty-fallback/`
- `conformance/fixtures/invalid-manifest-json/`
- `conformance/fixtures/manifest-entry-mismatch/`
- `conformance/fixtures/required-extension-mismatch/`
- `conformance/fixtures/resource-path-escape/`
- `conformance/fixtures/resource-directory/`
- `conformance/fixtures/malformed-resources-section/`
- `conformance/fixtures/resources-none-with-period/`
- `conformance/fixtures/empty-instructions/`
- `conformance/fixtures/missing-handoff/`
- `conformance/fixtures/unreachable-step/`
- `conformance/fixtures/unsupported-major-version/`
- `conformance/fixtures/unsupported-required-extension/`
- `conformance/fixtures/cyclic-chain/`
- `conformance/fixtures/frontmatter-next-mismatch/`
- `conformance/fixtures/entry-path-traversal/`
- `conformance/fixtures/ssp-resource-access/`
- `conformance/fixtures/duplicate-manifest-path/`
- `conformance/fixtures/invalid-required-extensions-type/`
- `conformance/fixtures/next-directory/`
- `conformance/fixtures/next-with-prose/`
- `conformance/fixtures/next-url/`
- `conformance/fixtures/next-query/`
- `conformance/fixtures/next-absolute-path/`
- `conformance/fixtures/next-backslash-path/`
- `conformance/fixtures/resource-url/`
- `conformance/fixtures/resource-query/`
- `conformance/fixtures/resource-absolute-path/`
- `conformance/fixtures/frontmatter-resource-mismatch/`

Invalid fixture description:

- `examples/multi-phase-review/invalid-fixtures/broken-next/`

## 2. Valid Fixture Matrix

| Fixture | Expected Package Level | Expected Entry | Expected Terminal | Expected Result |
| --- | --- | --- | --- | --- |
| `research-brief` | L2-ready with manifest | `steps/collect.md` | `steps/finalize.md` | pass in source and publication mode |
| `multi-phase-review` | L2-ready with manifest | `steps/intake.md` | `steps/final-report.md` | pass in source and publication mode |
| `agent-skill-optional-fields` | L2-ready with manifest | `steps/start.md` | `steps/start.md` | pass in source and publication mode |
| `source-no-manifest` | L1-ready source package | `steps/start.md` | `steps/start.md` | pass in source mode only |

Required checks:

- ordinary Agent Skill compatibility;
- valid optional Agent Skills fields remain accepted;
- LF and CRLF frontmatter compatibility;
- L0 fallback exists;
- SSP metadata exists;
- generated manifests match source projection;
- all reachable steps have required sections;
- resources exist;
- chain is linear;
- manifest order matches projected chain;
- expected handoff sequence exists.

## 3. Invalid Fixture Matrix

| Fixture | Mutation | Expected Code | Expected Result |
| --- | --- | --- | --- |
| `conformance/fixtures/source-no-manifest` | Omit generated `.ssp/manifest.json` | `SSP_PACKAGE_INVALID` | fail in publication mode |
| `conformance/fixtures/broken-next` | Change `steps/evaluate.md` body `Next` to `steps/missing.md` | `SSP_NEXT_INVALID` | fail |
| `conformance/fixtures/missing-entry-metadata` | Remove `metadata.stepped-skill.entry` from `SKILL.md` | `SSP_ENTRY_MISSING` | fail |
| `conformance/fixtures/missing-frontmatter` | Remove `SKILL.md` frontmatter | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/malformed-frontmatter` | Leave `SKILL.md` frontmatter unclosed | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/invalid-skill-name` | Set `SKILL.md` name to a value that violates Agent Skills naming rules | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/skill-name-mismatch` | Set `SKILL.md` name to a valid value that does not match the package directory | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/invalid-description-shape` | Set `description` to an array instead of a string | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/empty-compatibility` | Add an empty `compatibility` field to `SKILL.md` | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/invalid-compatibility-scalar` | Set `compatibility` to an unquoted YAML boolean | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/invalid-license-scalar` | Set `license` to an unquoted YAML boolean | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/invalid-allowed-tools-shape` | Set `allowed-tools` to an inline YAML array instead of a space-separated string | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/invalid-metadata-shape` | Add a non-string metadata value to `SKILL.md` | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/invalid-metadata-scalar` | Add an unquoted numeric metadata value to `SKILL.md` | `SSP_AGENT_SKILL_INVALID` | fail |
| `conformance/fixtures/missing-fallback` | Remove `## Fallback Workflow` from `SKILL.md` | `SSP_PACKAGE_INVALID` | fail |
| `conformance/fixtures/empty-fallback` | Leave `## Fallback Workflow` empty | `SSP_PACKAGE_INVALID` | fail |
| `conformance/fixtures/invalid-manifest-json` | Make `.ssp/manifest.json` malformed JSON | `SSP_PACKAGE_INVALID` | fail |
| `conformance/fixtures/manifest-entry-mismatch` | Make manifest `entry` disagree with `SKILL.md` | `SSP_MANIFEST_MISMATCH` | fail |
| `conformance/fixtures/required-extension-mismatch` | Make manifest `requiredExtensions` disagree with `SKILL.md` | `SSP_MANIFEST_MISMATCH` | fail |
| `conformance/fixtures/resource-path-escape` | Declare `../outside.md` as a step resource | `SSP_RESOURCE_UNREADABLE` | fail |
| `conformance/fixtures/resource-directory` | Declare a directory as a step resource | `SSP_RESOURCE_UNREADABLE` | fail |
| `conformance/fixtures/malformed-resources-section` | Write prose in `Resources` instead of `None` or a bullet path list | `SSP_RESOURCE_UNREADABLE` | fail |
| `conformance/fixtures/resources-none-with-period` | Write `None.` instead of exact `None` in `Resources` | `SSP_RESOURCE_UNREADABLE` | fail |
| `conformance/fixtures/empty-instructions` | Leave a required step `Instructions` section empty | `SSP_STEP_MISSING_SECTION` | fail |
| `conformance/fixtures/missing-handoff` | Set non-terminal `Handoff` to `None` | `SSP_HANDOFF_MISSING` | fail |
| `conformance/fixtures/unreachable-step` | Include `steps/orphan.md` outside the entry chain | `SSP_CHAIN_UNREACHABLE_STEP` | fail |
| `conformance/fixtures/unsupported-major-version` | Declare SSP version `1.0` | `SSP_VERSION_UNSUPPORTED` | fail |
| `conformance/fixtures/unsupported-required-extension` | Declare unknown `example.branching` required extension | `SSP_EXTENSION_UNSUPPORTED` | fail |
| `conformance/fixtures/cyclic-chain` | Create `start -> loop -> start` | `SSP_CHAIN_CYCLE` | fail |
| `conformance/fixtures/frontmatter-next-mismatch` | Make generated step frontmatter `ssp.next` disagree with body `Next` | `SSP_MANIFEST_MISMATCH` | fail |
| `conformance/fixtures/entry-path-traversal` | Set `metadata.stepped-skill.entry` to `../outside.md` | `SSP_ENTRY_MISSING` | fail |
| `conformance/fixtures/ssp-resource-access` | Declare `.ssp/secret.md` as a step resource | `SSP_RESOURCE_UNREADABLE` | fail |
| `conformance/fixtures/duplicate-manifest-path` | Include the same step path twice in manifest `steps` | `SSP_MANIFEST_MISMATCH` | fail |
| `conformance/fixtures/invalid-required-extensions-type` | Make manifest `requiredExtensions` a string instead of an array | `SSP_MANIFEST_MISMATCH` | fail |
| `conformance/fixtures/next-directory` | Set `Next` to `steps/` instead of a step file | `SSP_NEXT_INVALID` | fail |
| `conformance/fixtures/next-with-prose` | Add explanatory prose around the `Next` target | `SSP_NEXT_INVALID` | fail |
| `conformance/fixtures/next-url` | Set `Next` to `https://example.com/step.md` | `SSP_NEXT_INVALID` | fail |
| `conformance/fixtures/next-query` | Add a query fragment to `Next` | `SSP_NEXT_INVALID` | fail |
| `conformance/fixtures/next-absolute-path` | Set `Next` to an absolute path | `SSP_NEXT_INVALID` | fail |
| `conformance/fixtures/next-backslash-path` | Use a backslash separator in `Next` | `SSP_NEXT_INVALID` | fail |
| `conformance/fixtures/resource-url` | Declare a URL as a step resource | `SSP_RESOURCE_UNREADABLE` | fail |
| `conformance/fixtures/resource-query` | Add a query fragment to a step resource | `SSP_RESOURCE_UNREADABLE` | fail |
| `conformance/fixtures/resource-absolute-path` | Declare an absolute path as a step resource | `SSP_RESOURCE_UNREADABLE` | fail |
| `conformance/fixtures/frontmatter-resource-mismatch` | Make generated step frontmatter resources disagree with body `Resources` | `SSP_MANIFEST_MISMATCH` | fail |

Expected validator detail for `broken-next`:

```json
{
  "code": "SSP_NEXT_INVALID",
  "severity": "error",
  "path": "steps/evaluate.md",
  "section": "Next",
  "expected": "steps/recommendations.md",
  "actual": "steps/missing.md"
}
```

## 4. Required Suite Outputs

Each fixture should define:

- validator result;
- stable error code when invalid;
- expected manifest when valid;
- expected chain diagram;
- expected handoff sequence when valid;
- short rationale explaining what the fixture proves.

## 5. Minimum Passing Validator

A minimum SSP v0 validator passes this suite when it can:

- accept all valid publication fixtures;
- accept `source-no-manifest` in source mode;
- reject `source-no-manifest` in publication mode with `SSP_PACKAGE_INVALID`;
- reject `broken-next` with `SSP_NEXT_INVALID`;
- reject `missing-entry-metadata` with `SSP_ENTRY_MISSING`;
- reject `missing-frontmatter` with `SSP_AGENT_SKILL_INVALID`;
- reject `malformed-frontmatter` with `SSP_AGENT_SKILL_INVALID`;
- reject `invalid-skill-name` with `SSP_AGENT_SKILL_INVALID`;
- reject `skill-name-mismatch` with `SSP_AGENT_SKILL_INVALID`;
- reject `invalid-description-shape` with `SSP_AGENT_SKILL_INVALID`;
- reject `empty-compatibility` with `SSP_AGENT_SKILL_INVALID`;
- reject `invalid-compatibility-scalar` with `SSP_AGENT_SKILL_INVALID`;
- reject `invalid-license-scalar` with `SSP_AGENT_SKILL_INVALID`;
- reject `invalid-allowed-tools-shape` with `SSP_AGENT_SKILL_INVALID`;
- reject `invalid-metadata-shape` with `SSP_AGENT_SKILL_INVALID`;
- reject `invalid-metadata-scalar` with `SSP_AGENT_SKILL_INVALID`;
- reject `missing-fallback` with `SSP_PACKAGE_INVALID`;
- reject `empty-fallback` with `SSP_PACKAGE_INVALID`;
- reject `invalid-manifest-json` with `SSP_PACKAGE_INVALID`;
- reject `manifest-entry-mismatch` with `SSP_MANIFEST_MISMATCH`;
- reject `required-extension-mismatch` with `SSP_MANIFEST_MISMATCH`;
- reject `resource-path-escape` with `SSP_RESOURCE_UNREADABLE`;
- reject `resource-directory` with `SSP_RESOURCE_UNREADABLE`;
- reject `malformed-resources-section` with `SSP_RESOURCE_UNREADABLE`;
- reject `resources-none-with-period` with `SSP_RESOURCE_UNREADABLE`;
- reject `empty-instructions` with `SSP_STEP_MISSING_SECTION`;
- reject `missing-handoff` with `SSP_HANDOFF_MISSING`;
- reject `unreachable-step` with `SSP_CHAIN_UNREACHABLE_STEP`;
- reject `unsupported-major-version` with `SSP_VERSION_UNSUPPORTED`;
- reject `unsupported-required-extension` with `SSP_EXTENSION_UNSUPPORTED`;
- reject `cyclic-chain` with `SSP_CHAIN_CYCLE`;
- reject `frontmatter-next-mismatch` with `SSP_MANIFEST_MISMATCH`;
- reject `entry-path-traversal` with `SSP_ENTRY_MISSING`;
- reject `ssp-resource-access` with `SSP_RESOURCE_UNREADABLE`;
- reject `duplicate-manifest-path` with `SSP_MANIFEST_MISMATCH`;
- reject `invalid-required-extensions-type` with `SSP_MANIFEST_MISMATCH`;
- reject `next-directory` with `SSP_NEXT_INVALID`;
- reject `next-with-prose` with `SSP_NEXT_INVALID`;
- reject `next-url` with `SSP_NEXT_INVALID`;
- reject `next-query` with `SSP_NEXT_INVALID`;
- reject `next-absolute-path` with `SSP_NEXT_INVALID`;
- reject `next-backslash-path` with `SSP_NEXT_INVALID`;
- reject `resource-url` with `SSP_RESOURCE_UNREADABLE`;
- reject `resource-query` with `SSP_RESOURCE_UNREADABLE`;
- reject `resource-absolute-path` with `SSP_RESOURCE_UNREADABLE`;
- reject `frontmatter-resource-mismatch` with `SSP_MANIFEST_MISMATCH`;
- project the same chains as `expected-chain.md`;
- verify generated manifests for valid publication fixtures;
- produce stable issue output for invalid fixtures;
- distinguish source validation from publication validation.

Current prototype status:

- accepts `research-brief`;
- accepts `multi-phase-review`;
- accepts `agent-skill-optional-fields`;
- accepts `source-no-manifest` in source mode;
- supports `--mode source` and `--mode publication`;
- verifies generated manifests with `tools/generate-manifest.mjs --check`;
- rejects executable invalid fixtures for base Agent Skills compatibility, missing entry, missing fallback, invalid manifest JSON, manifest mismatch, unsafe resources, missing handoff, unreachable step, unsupported version, unsupported extension, cyclic chain, generated frontmatter mismatch, duplicate manifest paths, invalid extension field types, entry path traversal, directory-like `Next`, malformed `Next` paths, and malformed resource paths.
- `run-conformance.mjs` verifies source validation, publication validation, and parsed invalid fixture issue codes in one command.

## 6. Expansion Plan

Add future invalid fixtures when real authoring or implementation failures reveal new edge cases, especially:

- invalid manifest `steps` shapes beyond duplicate paths;
- L1 execution transcript fixtures once M1 runs exist.

Product judgment:

> The suite should grow from the mistakes authors actually make. The first version should prove the core chain, resource, handoff, and manifest invariants without becoming a full testing framework.
