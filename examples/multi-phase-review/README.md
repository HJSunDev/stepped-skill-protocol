# Multi-Phase Review Stepped Skill Sample

This is the second M0 sample package for Stepped Skill Protocol.

Purpose:

- prove SSP can handle a realistic professional review workflow;
- prove step-specific resources keep each phase focused;
- prove Handoff carries decisions and evidence across multiple phases;
- prove final user-facing output can stay clean while internal state remains available.

Expected chain:

```text
steps/intake.md -> steps/inspect.md -> steps/evaluate.md -> steps/recommendations.md -> steps/final-report.md -> END
```

Package level:

- `SSP Package L1-ready` as author source;
- `SSP Package L2-ready` when `.ssp/manifest.json` is treated as generated publication projection.

This sample should be evaluated against an ordinary all-in-one review Skill on the same review targets. SSP should win when the task has natural phase boundaries and benefits from separating inspection, evaluation, recommendations, and final reporting.
