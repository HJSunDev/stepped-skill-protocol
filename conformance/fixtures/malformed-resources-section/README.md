# malformed-resources-section

Invalid fixture for step resource syntax.

Expected result:

- validator reports `SSP_RESOURCE_UNREADABLE`;
- package fails because `Resources` is neither `None` nor a bullet list of file paths.

