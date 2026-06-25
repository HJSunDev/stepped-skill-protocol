# Invalid Fixture: Unsupported Required Extension

This fixture declares an unknown required extension in both `SKILL.md` metadata and `.ssp/manifest.json`.

Expected validator result:

- fail with `SSP_EXTENSION_UNSUPPORTED`

This proves that validators must reject required extensions they do not understand.
