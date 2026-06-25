# Invalid Fixture: Invalid Manifest JSON

This fixture contains malformed `.ssp/manifest.json`.

Expected validator result:

- fail with `SSP_PACKAGE_INVALID`

This proves that publication validation rejects unreadable control-plane metadata.
