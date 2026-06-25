# invalid-metadata-scalar

Invalid fixture for Agent Skills metadata compatibility.

Expected result:

- validator reports `SSP_AGENT_SKILL_INVALID`;
- package fails because metadata contains an unquoted scalar that YAML would parse as a non-string value.

