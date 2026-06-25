# Invalid Fixture: Cyclic Chain

This fixture creates a cycle: `start -> loop -> start`.

Expected validator result:

- fail with `SSP_CHAIN_CYCLE`

This proves that SSP v0 chains must be finite.
