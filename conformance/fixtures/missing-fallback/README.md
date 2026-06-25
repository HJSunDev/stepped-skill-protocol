# Invalid Fixture: Missing Fallback

This fixture is structurally close to a valid SSP package, but `SKILL.md` does not include `## Fallback Workflow`.

Expected validator result:

- fail with `SSP_PACKAGE_INVALID`

This proves that an SSP package cannot be an empty or SSP-only shell.
