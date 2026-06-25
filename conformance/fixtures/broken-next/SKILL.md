---
name: broken-next
description: Reviews a design, plan, document, or implementation through intake, inspection, evaluation, recommendations, and final reporting.
compatibility: Works as an ordinary Agent Skill. Supports SSP L1 when the agent can read exact skill-root relative files.
metadata:
  stepped-skill.version: "0.1"
  stepped-skill.entry: "steps/intake.md"
---

# Multi-Phase Review

## What This Skill Does

Reviews a design, plan, document, or implementation through separate phases so the agent can first understand the target, then inspect evidence, evaluate quality, recommend changes, and finally write a clean user-facing report.

Use this skill when the user asks for an architecture review, design review, requirements review, product review, implementation review, or readiness review.

## Fallback Workflow

If you cannot use step files, complete the review linearly:

1. Identify the review target, scope, audience, and decision standard.
2. Inspect the target and collect evidence without jumping to recommendations.
3. Evaluate findings against the review rubric.
4. Prioritize recommendations by severity, impact, and effort.
5. Write the final review with findings first, then recommendations and residual risk.

Success standard: the user receives a review that is evidence-based, prioritized, actionable, and honest about uncertainty.

If the review target or criteria are missing, ask for the missing input before judging quality.

This fallback is complete but lower fidelity. Use the step files when available.

## Stepped Skill Protocol

This skill uses Stepped Skill Protocol v0.1.

Protocol loop:

1. Read the entry step.
2. Complete the current step's Output.
3. Record an SSP Handoff block in the execution context.
4. Read the target named by Next; the next step may use the latest SSP Handoff as inherited state.
5. If Next is END, stop the chain and produce the final answer.

Entry: `steps/intake.md`
