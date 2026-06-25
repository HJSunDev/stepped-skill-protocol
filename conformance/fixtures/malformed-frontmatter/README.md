# malformed-frontmatter

Invalid fixture for base Agent Skills compatibility.

Expected result:

- validator reports `SSP_AGENT_SKILL_INVALID`;
- package fails because `SKILL.md` opens frontmatter but never closes it.

