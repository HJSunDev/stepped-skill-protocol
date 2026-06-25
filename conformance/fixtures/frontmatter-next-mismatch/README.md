# Invalid Fixture: Frontmatter Next Mismatch

Expected result:

- validator fails publication validation;
- validator reports `SSP_MANIFEST_MISMATCH`;
- `steps/start.md` body `Next` is `END`, but generated frontmatter declares `steps/other.md`.

