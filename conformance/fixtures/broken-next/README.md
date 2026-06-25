# Broken Next Invalid Fixture

This is an executable invalid fixture for the SSP v0 conformance suite.

Base package:

- copied from `examples/multi-phase-review/`.

Mutation:

- `steps/evaluate.md` body `## Next` points to `steps/missing.md`.
- `.ssp/manifest.json` still expects `steps/recommendations.md`.

Expected result:

- validation fails;
- error code: `SSP_NEXT_INVALID`;
- path: `steps/evaluate.md`;
- expected: `steps/recommendations.md`;
- actual: `steps/missing.md`.

Purpose:

- prove validators catch body `Next` / manifest mismatch;
- prove validators reject missing next targets;
- prove L1 execution must stop instead of inventing or searching for the next step.
