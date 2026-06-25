# invalid-allowed-tools-shape

Invalid fixture for Agent Skills compatibility.

Expected result:

- validator reports `SSP_AGENT_SKILL_INVALID`;
- package fails because optional `allowed-tools` is an inline YAML array instead of a space-separated string.
