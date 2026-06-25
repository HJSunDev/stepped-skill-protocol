---
name: research-brief
description: Creates a staged research brief when the user needs a topic investigated, synthesized, and finalized with clear source notes and caveats.
compatibility: Works as an ordinary Agent Skill. Supports SSP L1 when the agent can read exact skill-root relative files.
metadata:
  stepped-skill.version: "0.1"
  stepped-skill.entry: "steps/collect.md"
---

# Research Brief

## What This Skill Does

Creates a concise research brief through three phases: collect material, synthesize findings, and finalize the user-facing brief.

Use this skill when the user asks for a researched answer, comparison, background brief, decision note, or evidence-backed summary.

## Fallback Workflow

If you cannot use step files, complete the skill linearly:

1. Clarify the topic, scope, and any deadline or source constraints.
2. Collect relevant facts, sources, caveats, and unresolved questions.
3. Synthesize the strongest findings into a small set of claims.
4. Write the final brief with source notes, confidence level, and caveats.

Success standard: the user receives a brief that separates evidence from interpretation and clearly names uncertainty.

If information is missing, ask for the missing input or state the assumption before proceeding.

This fallback is complete but lower fidelity. Use the step files when available.

## Stepped Skill Protocol

This skill uses Stepped Skill Protocol v0.1.

Protocol loop:

1. Read the entry step.
2. Complete the current step's Output.
3. Record an SSP Handoff block in the execution context.
4. Read the target named by Next; the next step may use the latest SSP Handoff as inherited state.
5. If Next is END, stop the chain and produce the final answer.

Entry: `steps/collect.md`
