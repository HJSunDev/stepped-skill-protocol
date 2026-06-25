# Invalid Fixture: Broken Next

This fixture documents the first intentional invalid variant for the conformance suite.

Mutation:

- In `steps/evaluate.md`, change `## Next` from `steps/recommendations.md` to `steps/missing.md`.

Expected result:

- validation fails;
- error code: `SSP_NEXT_INVALID`;
- validator reports `steps/evaluate.md`;
- validator reports expected reachable next step from manifest: `steps/recommendations.md`;
- validator reports actual body `Next`: `steps/missing.md`.

Purpose:

- prove validators catch body `Next` / manifest mismatch;
- prove L1 execution must stop instead of inventing or searching for the next step.
