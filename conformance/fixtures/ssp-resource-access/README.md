# Invalid Fixture: Control Plane Resource Access

Expected result:

- validator fails publication validation;
- validator reports `SSP_RESOURCE_UNREADABLE`;
- a step attempts to use `.ssp/secret.md` as an execution resource.

