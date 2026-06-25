# Step: Evaluate Quality

## Objective

Evaluate the inspected evidence against the review criteria and identify the strongest findings.

## Resources

- `references/severity-scale.md`

## Instructions

1. Use the inspection handoff as inherited state.
2. Classify findings by severity and confidence.
3. Distinguish defects, risks, tradeoffs, and open questions.
4. Avoid recommending specific fixes unless required to explain impact.
5. Keep the evaluation grounded in evidence.

## Output

Produce:

- prioritized findings;
- severity and confidence for each finding;
- evidence references;
- tradeoffs and residual uncertainty;
- evaluation summary.

## Completion Criteria

This step is complete when the recommendations step can propose actions without changing the finding set.

## Handoff

Carry forward:

- prioritized findings;
- severity and confidence;
- evidence references;
- tradeoffs;
- residual uncertainty;
- evaluation summary.

Before reading `Next`, record an `SSP Handoff` block with those items in the execution context.

## Next

`steps/recommendations.md`
