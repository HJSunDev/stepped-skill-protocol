#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolDir, "..");
const defaultOutputDir = path.join(repoRoot, "eval-runs/m1-draft");
const outputDir = path.resolve(process.argv[2] ?? defaultOutputDir);

const fixtures = {
  "research-brief": {
    skillRoot: "examples/research-brief",
    ordinaryBaseline: "examples/research-brief/ordinary-skill-baseline.md",
  },
  "multi-phase-review": {
    skillRoot: "examples/multi-phase-review",
    ordinaryBaseline: "examples/multi-phase-review/ordinary-skill-baseline.md",
  },
};

const tasks = [
  {
    id: "RB-01",
    sample: "research-brief",
    task: "Produce a decision brief on whether SSP should position itself as an Agent Skill extension or a new workflow format.",
    artifacts: [
      "docs/architecture.md",
      "docs/authoring-guide.md",
      "docs/validation-rules.md",
    ],
    expected: "Decision-ready brief with recommendation, tradeoffs, risks, and unknowns.",
  },
  {
    id: "RB-02",
    sample: "research-brief",
    task: "Produce a brief on whether static distributed reading is a product capability or only a prompt pattern.",
    artifacts: [
      "docs/architecture.md",
      "docs/security-notes.md",
      "docs/architecture-review-audit.md",
    ],
    expected: "Clear position, evidence, counterarguments, and architecture implication.",
  },
  {
    id: "RB-03",
    sample: "research-brief",
    task: "Compare SSP with ordinary checklist-style Skill authoring for multi-phase review tasks.",
    artifacts: [
      "docs/architecture.md",
      "examples/multi-phase-review",
      "examples/multi-phase-review/ordinary-skill-baseline.md",
    ],
    expected: "Comparison table plus recommendation.",
  },
  {
    id: "RB-04",
    sample: "research-brief",
    task: "Summarize the strongest and weakest evidence that SSP has product value.",
    artifacts: [
      "docs/architecture.md",
      "docs/evaluation/report.md",
      "docs/architecture-review-audit.md",
    ],
    expected: "Evidence brief distinguishing proven, plausible, and unproven claims.",
  },
  {
    id: "RB-05",
    sample: "research-brief",
    task: "Produce a release-readiness brief for turning SSP from architecture draft into public spec.",
    artifacts: [
      "docs/architecture.md",
      "docs/validation-rules.md",
      "docs/conformance-suite.md",
      "docs/evaluation/report.md",
    ],
    expected: "Release gate list, missing artifacts, and stop conditions.",
  },
  {
    id: "RB-06",
    sample: "research-brief",
    task: "Produce a brief on how SSP should handle fallback for agents that do not understand the protocol.",
    artifacts: [
      "docs/architecture.md",
      "examples/research-brief/SKILL.md",
      "examples/multi-phase-review/SKILL.md",
      "examples/research-brief/ordinary-skill-baseline.md",
      "examples/multi-phase-review/ordinary-skill-baseline.md",
    ],
    expected: "Fallback policy and quality bar.",
  },
  {
    id: "RB-07",
    sample: "research-brief",
    task: "Produce a brief on protocol governance for SSP versioning and extensions.",
    artifacts: [
      "docs/architecture.md",
      "docs/validation-rules.md",
    ],
    expected: "Governance recommendation with extension and deprecation rules.",
  },
  {
    id: "RB-08",
    sample: "research-brief",
    task: "Produce a brief on the minimum viable validator for SSP v0.",
    artifacts: [
      "docs/validation-rules.md",
      "tools/validate-ssp.mjs",
      "docs/conformance-suite.md",
    ],
    expected: "Validator scope, non-scope, and required error codes.",
  },
  {
    id: "RB-09",
    sample: "research-brief",
    task: "Produce a brief on whether SSP should support branching in v0.",
    artifacts: [
      "docs/architecture.md",
      "docs/validation-rules.md",
      "docs/architecture-review-audit.md",
    ],
    expected: "Recommendation with product reasoning and future path.",
  },
  {
    id: "RB-10",
    sample: "research-brief",
    task: "Produce a brief on authoring burden risks and how to keep SSP usable.",
    artifacts: [
      "docs/architecture.md",
      "docs/authoring-guide.md",
      "examples",
      "docs/evaluation/report.md",
    ],
    expected: "Authoring risk analysis and usability recommendations.",
  },
  {
    id: "MR-01",
    sample: "multi-phase-review",
    task: "Review the SSP architecture draft for product essence, protocol boundaries, and overclaiming.",
    artifacts: [
      "docs/architecture.md",
      "docs/architecture-review-audit.md",
    ],
    expected: "Findings ordered by severity, with architecture-level recommendations.",
  },
  {
    id: "MR-02",
    sample: "multi-phase-review",
    task: "Review the validation rules draft for ambiguity, missing invariants, and implementability.",
    artifacts: ["docs/validation-rules.md"],
    expected: "Findings plus concrete rule fixes.",
  },
  {
    id: "MR-03",
    sample: "multi-phase-review",
    task: "Review the conformance suite draft for coverage gaps.",
    artifacts: ["docs/conformance-suite.md"],
    expected: "Missing fixture matrix and priority recommendations.",
  },
  {
    id: "MR-04",
    sample: "multi-phase-review",
    task: "Review the M1 evaluation report draft for whether it can prove value.",
    artifacts: ["docs/evaluation/report.md"],
    expected: "Findings on metrics, gates, and execution risks.",
  },
  {
    id: "MR-05",
    sample: "multi-phase-review",
    task: "Review the Research Brief sample as a public example.",
    artifacts: ["examples/research-brief"],
    expected: "Findings on fallback, step sufficiency, handoff quality, and clarity.",
  },
  {
    id: "MR-06",
    sample: "multi-phase-review",
    task: "Review the Multi-Phase Review sample as a public example.",
    artifacts: ["examples/multi-phase-review"],
    expected: "Findings on realism, step boundaries, and adoption clarity.",
  },
  {
    id: "MR-07",
    sample: "multi-phase-review",
    task: "Review the validator prototype for false positives, false negatives, and maintainability.",
    artifacts: ["tools/validate-ssp.mjs"],
    expected: "Findings with concrete test cases or code-level risks.",
  },
  {
    id: "MR-08",
    sample: "multi-phase-review",
    task: "Review SSP threat model and non-goals for honesty and future runtime compatibility.",
    artifacts: [
      "docs/architecture.md",
      "docs/security-notes.md",
    ],
    expected: "Findings on claims, limitations, and required warnings.",
  },
  {
    id: "MR-09",
    sample: "multi-phase-review",
    task: "Review the public release package checklist for whether it is enough for broad adoption.",
    artifacts: [
      "docs/architecture.md",
      "docs/architecture-review-audit.md",
    ],
    expected: "Findings on missing public-facing assets and launch risk.",
  },
  {
    id: "MR-10",
    sample: "multi-phase-review",
    task: "Review whether SSP's current v0 scope is narrow enough to avoid architecture debt.",
    artifacts: [
      "docs/architecture.md",
      "docs/architecture-review-audit.md",
    ],
    expected: "Findings on scope, cut lines, and future-proofing.",
  },
];

const variants = ["ordinary", "SSP"];
const scorecardColumns = [
  "run_id",
  "blind_id",
  "task_id",
  "sample",
  "variant",
  "model",
  "date",
  "success",
  "quality",
  "chain_complete",
  "step_order_correct",
  "skipped_step",
  "premature_future_work",
  "handoff_quality",
  "user_correction",
  "tool_reads",
  "tokens",
  "time_seconds",
  "win_tie_loss",
  "failure_category",
  "notes",
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(relativePath, content) {
  const absolute = path.join(outputDir, relativePath);
  ensureDir(path.dirname(absolute));
  fs.writeFileSync(absolute, content, "utf8");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function csvRow(values) {
  return values.map(csvEscape).join(",");
}

function seededShuffle(items, seed = 20260625) {
  const out = [...items];
  let state = seed >>> 0;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  for (let index = out.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [out[index], out[swapIndex]] = [out[swapIndex], out[index]];
  }
  return out;
}

function promptFor(task, variant, runId, blindId) {
  const fixture = fixtures[task.sample];
  const variantInstructions =
    variant === "ordinary"
      ? [
          `Use ordinary Skill baseline: \`${fixture.ordinaryBaseline}\`.`,
          "Do not read SSP step files, `.ssp/manifest.json`, expected-chain files, or expected-handoff files.",
          "Apply the ordinary baseline linearly to the task.",
        ]
      : [
          `Use Stepped Skill package root: \`${fixture.skillRoot}\`.`,
          "Read `SKILL.md` first, then follow the declared SSP entry and each `Next` target exactly.",
          "Do not list package directories or inspect future steps unless the current step's `Next` points there.",
          "Record handoff state as execution state. Do not expose private reasoning in the final answer.",
        ];

  return `# SSP M1 Eval Prompt

Run ID: ${runId}
Blind ID: ${blindId}
Task ID: ${task.id}
Variant: ${variant}
Sample: ${task.sample}

## Task

${task.task}

## Expected Output

${task.expected}

## Input Artifacts

${task.artifacts.map((artifact) => `- \`${artifact}\``).join("\n")}

## Variant Instructions

${variantInstructions.map((line) => `- ${line}`).join("\n")}

## Evaluation Controls

- Use the same model, tool access, local repository state, and time budget as the paired variant for this task.
- Do not ask for user repair unless a required input is genuinely unavailable.
- Do not mention the variant name in the final user-facing output.
- Save the final user-facing output to \`outputs/${blindId}.md\`.
- Save any execution notes, including observed reads and failures, to \`traces/${runId}.md\`.

## Final Output Requirement

Produce the requested deliverable only. Keep process notes out of the final output unless the task explicitly asks for review findings or rationale.
`;
}

function reviewerGuide() {
  return `# SSP M1 Blind Review Guide

Use this guide to score outputs in \`outputs/\` before opening \`blind-review-map.csv\`.

## Blind Review Rule

Do not inspect \`run_id\`, \`variant\`, traces, prompts, or \`blind-review-map.csv\` while assigning output quality.

Score the user-facing output first. Process reliability fields can be filled later from traces.

## Quality Score

Use a 1 to 5 scale:

- \`5\`: excellent, decision-ready, clear recommendation or findings, important tradeoffs covered, uncertainty named.
- \`4\`: strong, useful with minor gaps or polish issues.
- \`3\`: usable, but needs revision before relying on it.
- \`2\`: weak, misses important parts of the task, substantial correction needed.
- \`1\`: unusable or mostly fails the requested task.

Score the answer against the task and expected output, not against whether you personally prefer the protocol.

## Success Score

- \`1\`: satisfies the requested job.
- \`0.5\`: partially satisfies it with meaningful gaps.
- \`0\`: fails the job.

## Process Fields

Fill these from traces and execution notes:

- \`chain_complete\`: \`yes\` only if an SSP run reached \`END\`.
- \`step_order_correct\`: \`yes\` only if an SSP run followed the expected step order.
- \`skipped_step\`: \`yes\` if a required phase was omitted.
- \`premature_future_work\`: \`yes\` if later-phase work happened before current-phase deliverables existed.
- \`handoff_quality\`: \`3\`, \`2\`, \`1\`, \`0\`, or \`n/a\` for ordinary runs.

## Win / Tie / Loss

After scoring both blind outputs for a task and unblinding the pair:

- \`win\`: SSP has higher quality, or quality ties while SSP has better process reliability.
- \`tie\`: quality and process reliability are materially similar.
- \`loss\`: SSP has lower quality, or process reliability is worse without a quality gain.

Put the pair result in the SSP row's \`win_tie_loss\` field. Leave the ordinary row blank.

## Failure Category

Use one of:

- \`task-design\`: task was unsuitable or ambiguous.
- \`authoring-design\`: sample Skill or step authoring caused failure.
- \`protocol-design\`: SSP structure caused failure.
- \`model-following\`: model ignored clear instructions.
- \`infrastructure\`: tool, environment, or run setup failed.

Leave blank when no notable failure occurred.

## Bias Controls

- Score final outputs before reading traces.
- Do not reward verbose process narration unless the task asked for it.
- Do not penalize SSP for hidden process if the final output satisfies the task.
- Do not repair a run during scoring.
- Record uncertainty in \`notes\`.
`;
}

const runs = [];
for (const task of tasks) {
  for (const variant of variants) {
    const suffix = variant === "ordinary" ? "O" : "S";
    const runId = `${task.id}-${suffix}`;
    const blindId = `B${String(runs.length + 1).padStart(3, "0")}`;
    runs.push({
      runId,
      blindId,
      taskId: task.id,
      sample: task.sample,
      variant,
      promptPath: `prompts/${runId}.md`,
      outputPath: `outputs/${blindId}.md`,
      tracePath: `traces/${runId}.md`,
      task,
    });
  }
}

const runOrder = seededShuffle(runs);

ensureDir(outputDir);
writeFile("README.md", `# SSP M1 Eval Run Package

Generated by:

\`\`\`bash
node tools/prepare-m1-eval.mjs
\`\`\`

Purpose:

> Run a reproducible 20-task A/B evaluation comparing ordinary Skill execution against Stepped Skill execution.

This package does not contain results. It contains prompts, run order, scorecard columns, and blind-review mapping.

## Files

- \`run-order.csv\`: randomized execution order.
- \`scorecard.csv\`: one row per run, ready for manual scoring.
- \`blind-review-map.csv\`: maps blind output ids to run ids and variants.
- \`reviewer-guide.md\`: blind scoring and process-scoring guide.
- \`prompts/\`: one prompt per run.
- \`outputs/\`: save final outputs here using blind ids.
- \`traces/\`: save execution notes here using run ids.

## Rules

- Run every prompt exactly once unless a run fails for infrastructure reasons.
- Do not repair weak model behavior during a run.
- Do not reveal variant labels to blind reviewers.
- Score final outputs before looking at \`blind-review-map.csv\`.
- Use \`reviewer-guide.md\` when filling \`scorecard.csv\`.
- Record failures as data.

## Preflight

\`\`\`bash
node tools/run-conformance.mjs
\`\`\`

## Summarize

After filling \`scorecard.csv\`, run:

\`\`\`bash
node tools/summarize-m1-eval.mjs
\`\`\`

This writes \`summary.md\` and \`summary.json\`.
`);

writeFile(
  "run-order.csv",
  [
    csvRow(["order", "run_id", "blind_id", "task_id", "sample", "variant", "prompt_path", "output_path", "trace_path"]),
    ...runOrder.map((run, index) =>
      csvRow([index + 1, run.runId, run.blindId, run.taskId, run.sample, run.variant, run.promptPath, run.outputPath, run.tracePath]),
    ),
  ].join("\n") + "\n",
);

writeFile(
  "blind-review-map.csv",
  [
    csvRow(["blind_id", "run_id", "task_id", "sample", "variant"]),
    ...runs.map((run) => csvRow([run.blindId, run.runId, run.taskId, run.sample, run.variant])),
  ].join("\n") + "\n",
);

writeFile("reviewer-guide.md", reviewerGuide());

writeFile(
  "scorecard.csv",
  [
    csvRow(scorecardColumns),
    ...runs.map((run) =>
      csvRow([
        run.runId,
        run.blindId,
        run.taskId,
        run.sample,
        run.variant,
        "",
        "",
        "",
        "",
        run.variant === "SSP" ? "" : "n/a",
        run.variant === "SSP" ? "" : "n/a",
        "",
        "",
        run.variant === "SSP" ? "" : "n/a",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]),
    ),
  ].join("\n") + "\n",
);

for (const run of runs) {
  writeFile(run.promptPath, promptFor(run.task, run.variant, run.runId, run.blindId));
}

writeFile("outputs/.gitkeep", "");
writeFile("traces/.gitkeep", "");

console.log(`Prepared SSP M1 eval package: ${path.relative(repoRoot, outputDir)}`);
console.log(`Runs: ${runs.length}`);
