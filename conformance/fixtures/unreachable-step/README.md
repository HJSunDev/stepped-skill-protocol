# Invalid Fixture: Unreachable Step

This fixture contains an extra step file that is not reachable from the entry chain.

Expected validator result:

- fail with `SSP_CHAIN_UNREACHABLE_STEP`

This proves that published SSP packages cannot contain orphaned step files.
