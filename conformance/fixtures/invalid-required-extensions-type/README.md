# Invalid Fixture: Invalid Required Extensions Type

Expected result:

- validator fails publication validation;
- validator reports `SSP_MANIFEST_MISMATCH`;
- `.ssp/manifest.json` uses a string where `requiredExtensions` must be an array.

