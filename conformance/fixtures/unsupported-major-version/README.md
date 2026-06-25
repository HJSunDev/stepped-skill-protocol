# Invalid Fixture: Unsupported Major Version

This fixture declares SSP version `1.0`, which this v0 validator does not support.

Expected validator result:

- fail with `SSP_VERSION_UNSUPPORTED`

This proves that validators reject unknown major versions instead of guessing semantics.
