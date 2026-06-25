# Invalid Fixture: Missing Entry Metadata

This fixture omits `metadata.stepped-skill.entry` from `SKILL.md`.

Expected validator result:

- fail with `SSP_ENTRY_MISSING`

This proves that an SSP package must declare a single entry step.
