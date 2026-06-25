# Expected Chain

```text
steps/intake.md
  -> steps/inspect.md
  -> steps/evaluate.md
  -> steps/recommendations.md
  -> steps/final-report.md
  -> END
```

Expected validation:

- one entry step: `steps/intake.md`;
- exactly one `Next` per non-terminal step;
- one terminal step: `steps/final-report.md`;
- terminal `Next`: `END`;
- no unreachable step files;
- no directory or network transition;
- manifest order matches execution order.
