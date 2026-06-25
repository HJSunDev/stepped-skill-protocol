# Invalid Fixture: Missing Handoff

This fixture has a non-terminal step whose `Handoff` section is `None`.

Expected validator result:

- fail with `SSP_HANDOFF_MISSING`

This proves that non-terminal steps must define carry-forward state.
