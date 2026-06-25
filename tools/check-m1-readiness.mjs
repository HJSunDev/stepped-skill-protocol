#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolDir, "..");
const runDir = path.resolve(process.argv[2] ?? path.join(repoRoot, "eval-runs/m1-draft"));
const EXPECTED_RUNS = 40;
const EXPECTED_TASKS = 20;
const FORBIDDEN_SSP_PROMPT_PATTERNS = [
  /Do not list package directories/i,
  /inspect future steps/i,
  /do not inspect future/i,
  /do not read future/i,
];

function toPosix(value) {
  return value.replaceAll(path.sep, "/");
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
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

function issue(issues, code, pathValue, message) {
  issues.push({ code, path: pathValue, message });
}

function exists(relativePath) {
  return fs.existsSync(path.join(runDir, relativePath));
}

function repoExists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function extractArtifacts(promptText) {
  const section = /## Input Artifacts\s+([\s\S]*?)\n## /m.exec(promptText);
  if (!section) return [];
  return section[1]
    .split(/\r?\n/)
    .map((line) => /^\s*-\s+`([^`]+)`/.exec(line)?.[1])
    .filter(Boolean);
}

function check() {
  const issues = [];
  const requiredFiles = [
    "README.md",
    "run-order.csv",
    "scorecard.csv",
    "blind-review-map.csv",
    "reviewer-guide.md",
    "operator-guide.md",
  ];

  for (const file of requiredFiles) {
    if (!exists(file)) issue(issues, "M1_FILE_MISSING", file, "Required run package file is missing.");
  }
  for (const dir of ["prompts", "outputs", "traces"]) {
    const absolute = path.join(runDir, dir);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) {
      issue(issues, "M1_DIR_MISSING", dir, "Required run package directory is missing.");
    }
  }

  if (issues.length > 0) return issues;

  const runOrder = parseCsv(readText(path.join(runDir, "run-order.csv")));
  const scorecard = parseCsv(readText(path.join(runDir, "scorecard.csv")));
  const blindMap = parseCsv(readText(path.join(runDir, "blind-review-map.csv")));

  if (runOrder.length !== EXPECTED_RUNS) issue(issues, "M1_RUN_COUNT_INVALID", "run-order.csv", `Expected ${EXPECTED_RUNS} runs, found ${runOrder.length}.`);
  if (scorecard.length !== EXPECTED_RUNS) issue(issues, "M1_SCORECARD_COUNT_INVALID", "scorecard.csv", `Expected ${EXPECTED_RUNS} scorecard rows, found ${scorecard.length}.`);
  if (blindMap.length !== EXPECTED_RUNS) issue(issues, "M1_BLIND_MAP_COUNT_INVALID", "blind-review-map.csv", `Expected ${EXPECTED_RUNS} blind-map rows, found ${blindMap.length}.`);

  const runIds = new Set();
  const blindIds = new Set();
  const tasks = new Map();

  for (const run of runOrder) {
    if (runIds.has(run.run_id)) issue(issues, "M1_RUN_ID_DUPLICATE", "run-order.csv", `Duplicate run_id: ${run.run_id}.`);
    runIds.add(run.run_id);
    if (blindIds.has(run.blind_id)) issue(issues, "M1_BLIND_ID_DUPLICATE", "run-order.csv", `Duplicate blind_id: ${run.blind_id}.`);
    blindIds.add(run.blind_id);
    if (!["ordinary", "SSP"].includes(run.variant)) issue(issues, "M1_VARIANT_INVALID", run.prompt_path, `Invalid variant: ${run.variant}.`);
    if (!tasks.has(run.task_id)) tasks.set(run.task_id, new Set());
    tasks.get(run.task_id).add(run.variant);

    for (const field of ["prompt_path", "output_path", "trace_path"]) {
      if (!run[field]) issue(issues, "M1_RUN_FIELD_MISSING", "run-order.csv", `Missing ${field} for ${run.run_id}.`);
    }
    if (run.prompt_path && !exists(run.prompt_path)) {
      issue(issues, "M1_PROMPT_MISSING", run.prompt_path, `Prompt file is missing for ${run.run_id}.`);
      continue;
    }

    const promptText = readText(path.join(runDir, run.prompt_path));
    if (!promptText.includes(`Run ID: ${run.run_id}`)) issue(issues, "M1_PROMPT_RUN_MISMATCH", run.prompt_path, "Prompt Run ID does not match run-order.");
    if (!promptText.includes(`Blind ID: ${run.blind_id}`)) issue(issues, "M1_PROMPT_BLIND_MISMATCH", run.prompt_path, "Prompt Blind ID does not match run-order.");
    if (!promptText.includes(`Variant: ${run.variant}`)) issue(issues, "M1_PROMPT_VARIANT_MISMATCH", run.prompt_path, "Prompt variant does not match run-order.");
    if (!promptText.includes(`outputs/${run.blind_id}.md`)) issue(issues, "M1_PROMPT_OUTPUT_MISMATCH", run.prompt_path, "Prompt output path does not match blind id.");
    if (!promptText.includes(`traces/${run.run_id}.md`)) issue(issues, "M1_PROMPT_TRACE_MISMATCH", run.prompt_path, "Prompt trace path does not match run id.");

    if (run.variant === "SSP") {
      for (const pattern of FORBIDDEN_SSP_PROMPT_PATTERNS) {
        if (pattern.test(promptText)) {
          issue(issues, "M1_SSP_PROMPT_FORBIDDEN_RULE", run.prompt_path, `SSP prompt contains forbidden rule pattern: ${pattern}.`);
        }
      }
      if (!promptText.includes("Use exact paths from the entry")) {
        issue(issues, "M1_SSP_PROMPT_MISSING_STRUCTURAL_RULE", run.prompt_path, "SSP prompt is missing the structural exact-path instruction.");
      }
    }

    for (const artifact of extractArtifacts(promptText)) {
      if (!repoExists(artifact)) {
        issue(issues, "M1_ARTIFACT_MISSING", run.prompt_path, `Input artifact does not exist: ${artifact}.`);
      }
    }
  }

  if (tasks.size !== EXPECTED_TASKS) issue(issues, "M1_TASK_COUNT_INVALID", "run-order.csv", `Expected ${EXPECTED_TASKS} tasks, found ${tasks.size}.`);
  for (const [taskId, variants] of tasks.entries()) {
    for (const variant of ["ordinary", "SSP"]) {
      if (!variants.has(variant)) issue(issues, "M1_TASK_PAIR_INCOMPLETE", "run-order.csv", `${taskId} is missing ${variant} variant.`);
    }
  }

  for (const row of scorecard) {
    if (!runIds.has(row.run_id)) issue(issues, "M1_SCORECARD_RUN_UNKNOWN", "scorecard.csv", `Scorecard run_id not found in run-order: ${row.run_id}.`);
    if (!blindIds.has(row.blind_id)) issue(issues, "M1_SCORECARD_BLIND_UNKNOWN", "scorecard.csv", `Scorecard blind_id not found in run-order: ${row.blind_id}.`);
  }

  for (const row of blindMap) {
    if (!runIds.has(row.run_id)) issue(issues, "M1_BLIND_MAP_RUN_UNKNOWN", "blind-review-map.csv", `Blind-map run_id not found in run-order: ${row.run_id}.`);
    if (!blindIds.has(row.blind_id)) issue(issues, "M1_BLIND_MAP_BLIND_UNKNOWN", "blind-review-map.csv", `Blind-map blind_id not found in run-order: ${row.blind_id}.`);
  }

  return issues;
}

const issues = check();
if (issues.length > 0) {
  console.log("FAIL SSP M1 readiness check");
  console.log(JSON.stringify(issues, null, 2));
  process.exit(1);
}

console.log(`PASS SSP M1 readiness check: ${toPosix(path.relative(repoRoot, runDir))}`);
