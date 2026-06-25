# Expected Handoff Sequence

## After `steps/intake.md`

```markdown
## SSP Handoff

- Step: intake
- Output: target summary, decision context, criteria, assumptions, and review plan
- Carry Forward:
  - target summary
  - audience
  - decision context
  - review criteria
  - assumptions and missing information
  - review plan
- Ready For Next: yes
```

## After `steps/inspect.md`

```markdown
## SSP Handoff

- Step: inspect
- Output: evidence map, observations, inferred risks, missing evidence, and questions
- Carry Forward:
  - evidence map
  - direct observations
  - inferred risks
  - missing evidence
  - unresolved questions
  - criteria used during inspection
- Ready For Next: yes
```

## After `steps/evaluate.md`

```markdown
## SSP Handoff

- Step: evaluate
- Output: prioritized findings with severity, confidence, evidence, and uncertainty
- Carry Forward:
  - prioritized findings
  - severity and confidence
  - evidence references
  - tradeoffs
  - residual uncertainty
  - evaluation summary
- Ready For Next: yes
```

## After `steps/recommendations.md`

```markdown
## SSP Handoff

- Step: recommendations
- Output: prioritized actions and final-report outline
- Carry Forward:
  - prioritized findings
  - recommended actions
  - impact and effort
  - actions to defer or reject
  - final-report outline
  - residual risk
- Ready For Next: yes
```

## After `steps/final-report.md`

No handoff is required. The final step produces the user-facing answer and terminates at `END`.
