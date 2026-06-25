# Invalid Fixture: Resource Path Escape

This fixture declares a resource outside the Skill package root.

Expected validator result:

- fail with `SSP_RESOURCE_UNREADABLE`

This proves that resources must be safe skill-root relative paths.
