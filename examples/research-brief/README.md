# Research Brief Stepped Skill Sample

This is the first M0 sample package for Stepped Skill Protocol.

Purpose:

- prove the basic SSP v0 linear chain;
- prove author source steps can stay human-readable;
- prove an ordinary Agent Skill fallback remains usable;
- prove Handoff can carry compact state between steps.

Expected chain:

```text
steps/collect.md -> steps/synthesize.md -> steps/finalize.md -> END
```

Package level:

- `SSP Package L1-ready` as author source;
- `SSP Package L2-ready` when `.ssp/manifest.json` is treated as generated publication projection.

This sample should be evaluated against an ordinary all-in-one research brief Skill on the same tasks. SSP should win when the task naturally benefits from separate collection, synthesis, and finalization phases.
