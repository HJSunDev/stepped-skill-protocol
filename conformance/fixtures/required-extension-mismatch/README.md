# Invalid Fixture: Required Extension Mismatch

This fixture declares a required extension in `SKILL.md` metadata but omits it from `.ssp/manifest.json`.

Expected validator result:

- fail with `SSP_MANIFEST_MISMATCH`

This proves that required extensions must be declared consistently across source and manifest.
