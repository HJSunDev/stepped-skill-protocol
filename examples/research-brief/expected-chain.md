# Expected Chain

```text
steps/collect.md
  -> steps/synthesize.md
  -> steps/finalize.md
  -> END
```

Expected validation:

- one entry step: `steps/collect.md`;
- exactly one `Next` per non-terminal step;
- one terminal step: `steps/finalize.md`;
- terminal `Next`: `END`;
- no unreachable step files;
- no directory or network transition;
- manifest order matches execution order.
