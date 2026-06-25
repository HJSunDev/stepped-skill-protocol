# Invalid Fixture: Manifest Entry Mismatch

This fixture declares `steps/start.md` in `SKILL.md` but `steps/other.md` in `.ssp/manifest.json`.

Expected validator result:

- fail with `SSP_MANIFEST_MISMATCH`

This proves that publication validation rejects manifest/source disagreement.
