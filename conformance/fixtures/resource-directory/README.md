# Invalid Fixture: Resource Directory

This fixture declares a directory as a step resource.

Expected validator result:

- fail with `SSP_RESOURCE_UNREADABLE`

This proves that resources must point to concrete files, not directories.
