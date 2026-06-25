#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolDir, "..");
const runDir = path.resolve(process.argv[2] ?? path.join(repoRoot, "eval-runs/m1-draft"));
const scorecardPath = path.join(runDir, "scorecard.csv");
const summaryJsonPath = path.join(runDir, "summary.json");
const summaryMarkdownPath = path.join(runDir, "summary.md");

const QUALITY_CLEAR_DELTA = 0.3;
const EXPECTED_ROW_COUNT = 40;
const VALID_VARIANTS = new Set(["ordinary", "SSP"]);
const VALID_YES_NO = new Set(["yes", "no"]);
const VALID_WIN_TIE_LOSS = new Set(["", "win", "tie", "loss"]);
const VALID_FAILURE_CATEGORIES = new Set(["", "task-design", "authoring-design", "protocol-design", "model-following", "infrastructure"]);

function toPosix(value) {
  return value.replaceAll(path.sep, "/");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...dataRows] = rows.filter((item) => item.some((value) => value !== ""));
  if (!headers) return [];
  return dataRows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "" || value === "n/a") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function inRange(value, min, max, allowed = new Set([""])) {
  if (allowed.has(value)) return true;
  const parsed = numberOrNull(value);
  return parsed !== null && parsed >= min && parsed <= max;
}

function oneOf(value, allowed) {
  return allowed.has(value ?? "");
}

function yesNoOrNull(value) {
  if (value === "yes" || value === "no") return value;
  return null;
}

function average(values) {
  const numeric = values.filter((value) => value !== null && value !== undefined);
  if (numeric.length === 0) return null;
  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

function rate(rows, field, positive = "yes") {
  const values = rows.map((row) => yesNoOrNull(row[field])).filter(Boolean);
  if (values.length === 0) return null;
  return values.filter((value) => value === positive).length / values.length;
}

function percent(value) {
  if (value === null || value === undefined) return "n/a";
  return `${(value * 100).toFixed(1)}%`;
}

function fixed(value) {
  if (value === null || value === undefined) return "n/a";
  return Number(value).toFixed(2);
}

function rowComplete(row) {
  const baseRequired = [
    "model",
    "date",
    "success",
    "quality",
    "skipped_step",
    "premature_future_work",
    "user_correction",
  ];
  for (const field of baseRequired) {
    if (!row[field] || row[field] === "n/a") return false;
  }
  if (row.variant === "SSP") {
    for (const field of ["chain_complete", "step_order_correct", "handoff_quality"]) {
      if (!row[field] || row[field] === "n/a") return false;
    }
  }
  return true;
}

function variantStats(rows) {
  return {
    count: rows.length,
    scoredRows: rows.filter(rowComplete).length,
    successAverage: average(rows.map((row) => numberOrNull(row.success))),
    qualityAverage: average(rows.map((row) => numberOrNull(row.quality))),
    skippedStepRate: rate(rows, "skipped_step"),
    prematureFutureWorkRate: rate(rows, "premature_future_work"),
    userCorrectionAverage: average(rows.map((row) => numberOrNull(row.user_correction))),
    tokenAverage: average(rows.map((row) => numberOrNull(row.tokens))),
    timeAverage: average(rows.map((row) => numberOrNull(row.time_seconds))),
  };
}

function pairResults(rows) {
  const byTask = new Map();
  for (const row of rows) {
    if (!byTask.has(row.task_id)) byTask.set(row.task_id, {});
    byTask.get(row.task_id)[row.variant] = row;
  }

  const results = [];
  for (const [taskId, pair] of [...byTask.entries()].sort()) {
    const ordinaryQuality = numberOrNull(pair.ordinary?.quality);
    const sspQuality = numberOrNull(pair.SSP?.quality);
    const explicit = pair.SSP?.win_tie_loss;
    let result = explicit || "";
    if (!result && ordinaryQuality !== null && sspQuality !== null) {
      if (sspQuality > ordinaryQuality) result = "win";
      else if (sspQuality === ordinaryQuality) result = "tie";
      else result = "loss";
    }
    results.push({ taskId, result: result || "missing" });
  }
  return results;
}

function gate(name, passed, value, threshold, note = "") {
  return { name, passed, value, threshold, note };
}

function pushValidation(validationIssues, row, field, message) {
  validationIssues.push({
    run_id: row?.run_id ?? "",
    field,
    message,
  });
}

function validateRows(rows) {
  const issues = [];
  const runIds = new Set();
  const blindIds = new Set();
  if (rows.length !== EXPECTED_ROW_COUNT) {
    issues.push({
      run_id: "",
      field: "scorecard",
      message: `Expected ${EXPECTED_ROW_COUNT} rows, found ${rows.length}.`,
    });
  }

  for (const row of rows) {
    if (!row.run_id) pushValidation(issues, row, "run_id", "Missing run_id.");
    if (row.run_id && runIds.has(row.run_id)) pushValidation(issues, row, "run_id", "Duplicate run_id.");
    if (row.run_id) runIds.add(row.run_id);
    if (!row.blind_id) pushValidation(issues, row, "blind_id", "Missing blind_id.");
    if (row.blind_id && blindIds.has(row.blind_id)) pushValidation(issues, row, "blind_id", "Duplicate blind_id.");
    if (row.blind_id) blindIds.add(row.blind_id);
    if (!VALID_VARIANTS.has(row.variant)) pushValidation(issues, row, "variant", "Variant must be ordinary or SSP.");
    if (!oneOf(row.success, new Set(["", "0", "0.5", "1"]))) pushValidation(issues, row, "success", "Success must be blank, 0, 0.5, or 1.");
    if (!oneOf(row.quality, new Set(["", "1", "2", "3", "4", "5"]))) pushValidation(issues, row, "quality", "Quality must be blank or 1..5.");
    if (row.variant === "ordinary") {
      for (const field of ["chain_complete", "step_order_correct", "handoff_quality"]) {
        if (row[field] !== "n/a") pushValidation(issues, row, field, "Ordinary rows must use n/a.");
      }
    } else if (row.variant === "SSP") {
      for (const field of ["chain_complete", "step_order_correct"]) {
        if (row[field] && !VALID_YES_NO.has(row[field])) pushValidation(issues, row, field, "SSP field must be blank, yes, or no.");
      }
      if (!oneOf(row.handoff_quality, new Set(["", "0", "1", "2", "3"]))) pushValidation(issues, row, "handoff_quality", "SSP handoff_quality must be blank or 0..3.");
    }
    for (const field of ["skipped_step", "premature_future_work"]) {
      if (row[field] && !VALID_YES_NO.has(row[field])) pushValidation(issues, row, field, "Field must be blank, yes, or no.");
    }
    for (const field of ["user_correction", "tool_reads", "tokens", "time_seconds"]) {
      if (!inRange(row[field], 0, Number.MAX_SAFE_INTEGER)) pushValidation(issues, row, field, "Field must be blank or a non-negative number.");
    }
    if (!VALID_WIN_TIE_LOSS.has(row.win_tie_loss ?? "")) pushValidation(issues, row, "win_tie_loss", "Value must be blank, win, tie, or loss.");
    if (!VALID_FAILURE_CATEGORIES.has(row.failure_category ?? "")) {
      pushValidation(issues, row, "failure_category", "Unknown failure category.");
    }
  }
  return issues;
}

if (!fs.existsSync(scorecardPath)) {
  console.error(`Missing scorecard: ${path.relative(repoRoot, scorecardPath)}`);
  process.exit(2);
}

const rows = parseCsv(fs.readFileSync(scorecardPath, "utf8"));
const validationIssues = validateRows(rows);
const ordinaryRows = rows.filter((row) => row.variant === "ordinary");
const sspRows = rows.filter((row) => row.variant === "SSP");
const incompleteRows = rows.filter((row) => !rowComplete(row));
const ordinary = variantStats(ordinaryRows);
const ssp = variantStats(sspRows);
const pairwise = pairResults(rows);
const winTieCount = pairwise.filter((item) => item.result === "win" || item.result === "tie").length;
const completePairCount = pairwise.filter((item) => item.result !== "missing").length;
const winTieRate = completePairCount > 0 ? winTieCount / completePairCount : null;
const correctionDrop =
  ordinary.userCorrectionAverage !== null && ordinary.userCorrectionAverage > 0 && ssp.userCorrectionAverage !== null
    ? (ordinary.userCorrectionAverage - ssp.userCorrectionAverage) / ordinary.userCorrectionAverage
    : null;
const qualityDelta =
  ordinary.qualityAverage !== null && ssp.qualityAverage !== null ? ssp.qualityAverage - ordinary.qualityAverage : null;
const tokenRatio =
  ordinary.tokenAverage !== null && ordinary.tokenAverage > 0 && ssp.tokenAverage !== null ? ssp.tokenAverage / ordinary.tokenAverage : null;
const timeRatio =
  ordinary.timeAverage !== null && ordinary.timeAverage > 0 && ssp.timeAverage !== null ? ssp.timeAverage / ordinary.timeAverage : null;
const chainCompletionRate = rate(sspRows, "chain_complete");
const correctionGate =
  correctionDrop !== null && correctionDrop >= 0.2
    ? true
    : qualityDelta !== null && qualityDelta >= QUALITY_CLEAR_DELTA && (correctionDrop === null || correctionDrop >= 0)
      ? true
      : false;
const costGate =
  (tokenRatio === null || tokenRatio <= 1.5) && (timeRatio === null || timeRatio <= 1.5);
const allRowsComplete = rows.length === 40 && incompleteRows.length === 0;
const gates = [
  gate("L1 chain completion rate >= 90%", chainCompletionRate !== null && chainCompletionRate >= 0.9, percent(chainCompletionRate), ">= 90%"),
  gate("SSP skipped-step rate <= 10%", ssp.skippedStepRate !== null && ssp.skippedStepRate <= 0.1, percent(ssp.skippedStepRate), "<= 10%"),
  gate(
    "SSP premature future work rate <= 10%",
    ssp.prematureFutureWorkRate !== null && ssp.prematureFutureWorkRate <= 0.1,
    percent(ssp.prematureFutureWorkRate),
    "<= 10%",
  ),
  gate("SSP wins or ties ordinary Skill on >= 70% of tasks", winTieRate !== null && winTieRate >= 0.7, percent(winTieRate), ">= 70%"),
  gate(
    "User correction drops >= 20% or quality improves clearly without correction regression",
    correctionGate,
    `correction drop=${percent(correctionDrop)}, quality delta=${fixed(qualityDelta)}`,
    "drop >= 20% or quality delta >= 0.30",
  ),
  gate("Token and time ratios stay within 1.5x when available", costGate, `tokens=${fixed(tokenRatio)}, time=${fixed(timeRatio)}`, "<= 1.5x"),
];
const passed = validationIssues.length === 0 && allRowsComplete && gates.every((item) => item.passed);
const status = validationIssues.length > 0 ? "invalid" : allRowsComplete ? (passed ? "pass" : "fail") : "incomplete";
const summary = {
  status,
  runDir: toPosix(path.relative(repoRoot, runDir)),
  rows: rows.length,
  completeRows: rows.length - incompleteRows.length,
  validationIssues,
  incompleteRows: incompleteRows.map((row) => row.run_id),
  ordinary,
  ssp,
  chainCompletionRate,
  pairwise,
  winTieRate,
  correctionDrop,
  qualityDelta,
  tokenRatio,
  timeRatio,
  gates,
};

const markdown = `# SSP M1 Eval Summary

Status: ${status}

Run package: \`${toPosix(path.relative(repoRoot, runDir))}\`

## Completion

- rows: ${rows.length}
- complete rows: ${rows.length - incompleteRows.length}
- incomplete rows: ${incompleteRows.length}
- validation issues: ${validationIssues.length}

## Variant Metrics

| Metric | ordinary | SSP |
| --- | --- | --- |
| scored rows | ${ordinary.scoredRows}/${ordinary.count} | ${ssp.scoredRows}/${ssp.count} |
| success average | ${fixed(ordinary.successAverage)} | ${fixed(ssp.successAverage)} |
| quality average | ${fixed(ordinary.qualityAverage)} | ${fixed(ssp.qualityAverage)} |
| skipped-step rate | ${percent(ordinary.skippedStepRate)} | ${percent(ssp.skippedStepRate)} |
| premature future work rate | ${percent(ordinary.prematureFutureWorkRate)} | ${percent(ssp.prematureFutureWorkRate)} |
| user correction average | ${fixed(ordinary.userCorrectionAverage)} | ${fixed(ssp.userCorrectionAverage)} |
| token average | ${fixed(ordinary.tokenAverage)} | ${fixed(ssp.tokenAverage)} |
| time average | ${fixed(ordinary.timeAverage)} | ${fixed(ssp.timeAverage)} |

## Gates

| Gate | Value | Threshold | Pass |
| --- | --- | --- | --- |
${gates.map((item) => `| ${item.name} | ${item.value} | ${item.threshold} | ${item.passed ? "yes" : "no"} |`).join("\n")}

## Validation Issues

${validationIssues.length === 0 ? "None." : validationIssues.map((item) => `- ${item.run_id || "scorecard"} / ${item.field}: ${item.message}`).join("\n")}

## Pairwise Results

| Task | Result |
| --- | --- |
${pairwise.map((item) => `| ${item.taskId} | ${item.result} |`).join("\n")}

## Missing Rows

${incompleteRows.length === 0 ? "None." : incompleteRows.map((row) => `- ${row.run_id}`).join("\n")}

## Decision

${status === "pass" ? "M1 passes the provisional gates." : status === "fail" ? "M1 does not pass the provisional gates." : status === "invalid" ? "M1 scorecard is invalid. Fix validation issues before interpreting results." : "M1 has not been executed completely. Do not make a public value claim."}
`;

fs.writeFileSync(summaryJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
fs.writeFileSync(summaryMarkdownPath, markdown, "utf8");

console.log(`M1 eval summary status: ${status}`);
console.log(`Summary: ${toPosix(path.relative(repoRoot, summaryMarkdownPath))}`);
if (status === "fail" || status === "invalid") process.exit(1);
