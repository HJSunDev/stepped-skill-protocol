# Ordinary Skill Baseline

This baseline is used for M1 eval against the Stepped Skill sample.

A comparable ordinary Skill would place the full review workflow in one activated `SKILL.md`:

1. Understand review target and criteria.
2. Inspect the artifact.
3. Evaluate findings.
4. Recommend fixes.
5. Write the final review.

Expected weakness compared with SSP:

- the model may recommend fixes before collecting evidence;
- evaluation criteria, evidence collection, and final report formatting compete in one context;
- intermediate decisions may stay implicit;
- final report may include process notes instead of clean findings;
- weaker separation between evidence, inference, and recommendation.

Eval should compare this baseline against the SSP package on the same review targets, same model, same tools, and same artifact access.
