#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolDir, "..");
const validator = path.join(toolDir, "validate-ssp.mjs");

const validFixtures = [
  "examples/research-brief",
  "examples/multi-phase-review",
];

const sourceOnlyFixtures = [
  "conformance/fixtures/source-no-manifest",
];

const invalidFixtures = [
  {
    path: "conformance/fixtures/source-no-manifest",
    expectedCode: "SSP_PACKAGE_INVALID",
  },
  {
    path: "conformance/fixtures/broken-next",
    expectedCode: "SSP_NEXT_INVALID",
  },
  {
    path: "conformance/fixtures/missing-entry-metadata",
    expectedCode: "SSP_ENTRY_MISSING",
  },
  {
    path: "conformance/fixtures/missing-frontmatter",
    expectedCode: "SSP_AGENT_SKILL_INVALID",
  },
  {
    path: "conformance/fixtures/malformed-frontmatter",
    expectedCode: "SSP_AGENT_SKILL_INVALID",
  },
  {
    path: "conformance/fixtures/invalid-skill-name",
    expectedCode: "SSP_AGENT_SKILL_INVALID",
  },
  {
    path: "conformance/fixtures/skill-name-mismatch",
    expectedCode: "SSP_AGENT_SKILL_INVALID",
  },
  {
    path: "conformance/fixtures/invalid-description-shape",
    expectedCode: "SSP_AGENT_SKILL_INVALID",
  },
  {
    path: "conformance/fixtures/empty-compatibility",
    expectedCode: "SSP_AGENT_SKILL_INVALID",
  },
  {
    path: "conformance/fixtures/invalid-compatibility-scalar",
    expectedCode: "SSP_AGENT_SKILL_INVALID",
  },
  {
    path: "conformance/fixtures/invalid-metadata-shape",
    expectedCode: "SSP_AGENT_SKILL_INVALID",
  },
  {
    path: "conformance/fixtures/invalid-metadata-scalar",
    expectedCode: "SSP_AGENT_SKILL_INVALID",
  },
  {
    path: "conformance/fixtures/missing-fallback",
    expectedCode: "SSP_PACKAGE_INVALID",
  },
  {
    path: "conformance/fixtures/empty-fallback",
    expectedCode: "SSP_PACKAGE_INVALID",
  },
  {
    path: "conformance/fixtures/invalid-manifest-json",
    expectedCode: "SSP_PACKAGE_INVALID",
  },
  {
    path: "conformance/fixtures/manifest-entry-mismatch",
    expectedCode: "SSP_MANIFEST_MISMATCH",
  },
  {
    path: "conformance/fixtures/required-extension-mismatch",
    expectedCode: "SSP_MANIFEST_MISMATCH",
  },
  {
    path: "conformance/fixtures/resource-path-escape",
    expectedCode: "SSP_RESOURCE_UNREADABLE",
  },
  {
    path: "conformance/fixtures/resource-directory",
    expectedCode: "SSP_RESOURCE_UNREADABLE",
  },
  {
    path: "conformance/fixtures/malformed-resources-section",
    expectedCode: "SSP_RESOURCE_UNREADABLE",
  },
  {
    path: "conformance/fixtures/empty-instructions",
    expectedCode: "SSP_STEP_MISSING_SECTION",
  },
  {
    path: "conformance/fixtures/missing-handoff",
    expectedCode: "SSP_HANDOFF_MISSING",
  },
  {
    path: "conformance/fixtures/unreachable-step",
    expectedCode: "SSP_CHAIN_UNREACHABLE_STEP",
  },
  {
    path: "conformance/fixtures/unsupported-major-version",
    expectedCode: "SSP_VERSION_UNSUPPORTED",
  },
  {
    path: "conformance/fixtures/unsupported-required-extension",
    expectedCode: "SSP_EXTENSION_UNSUPPORTED",
  },
  {
    path: "conformance/fixtures/cyclic-chain",
    expectedCode: "SSP_CHAIN_CYCLE",
  },
  {
    path: "conformance/fixtures/frontmatter-next-mismatch",
    expectedCode: "SSP_MANIFEST_MISMATCH",
  },
  {
    path: "conformance/fixtures/entry-path-traversal",
    expectedCode: "SSP_ENTRY_MISSING",
  },
  {
    path: "conformance/fixtures/ssp-resource-access",
    expectedCode: "SSP_RESOURCE_UNREADABLE",
  },
  {
    path: "conformance/fixtures/duplicate-manifest-path",
    expectedCode: "SSP_MANIFEST_MISMATCH",
  },
  {
    path: "conformance/fixtures/invalid-required-extensions-type",
    expectedCode: "SSP_MANIFEST_MISMATCH",
  },
  {
    path: "conformance/fixtures/next-directory",
    expectedCode: "SSP_NEXT_INVALID",
  },
  {
    path: "conformance/fixtures/next-with-prose",
    expectedCode: "SSP_NEXT_INVALID",
  },
  {
    path: "conformance/fixtures/next-url",
    expectedCode: "SSP_NEXT_INVALID",
  },
  {
    path: "conformance/fixtures/next-query",
    expectedCode: "SSP_NEXT_INVALID",
  },
  {
    path: "conformance/fixtures/next-absolute-path",
    expectedCode: "SSP_NEXT_INVALID",
  },
  {
    path: "conformance/fixtures/next-backslash-path",
    expectedCode: "SSP_NEXT_INVALID",
  },
  {
    path: "conformance/fixtures/resource-url",
    expectedCode: "SSP_RESOURCE_UNREADABLE",
  },
  {
    path: "conformance/fixtures/resource-query",
    expectedCode: "SSP_RESOURCE_UNREADABLE",
  },
  {
    path: "conformance/fixtures/resource-absolute-path",
    expectedCode: "SSP_RESOURCE_UNREADABLE",
  },
  {
    path: "conformance/fixtures/frontmatter-resource-mismatch",
    expectedCode: "SSP_MANIFEST_MISMATCH",
  },
];

function runValidator(fixtures) {
  return spawnSync(process.execPath, [validator, ...fixtures], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function runValidatorMode(mode, fixtures) {
  return spawnSync(process.execPath, [validator, "--mode", mode, ...fixtures], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function printOutput(result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

function parseIssueCodes(stdout) {
  const jsonStart = stdout.indexOf("[");
  if (jsonStart === -1) return [];
  try {
    const issues = JSON.parse(stdout.slice(jsonStart));
    return Array.isArray(issues) ? issues.map((item) => item?.code).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function runCrlfFrontmatterCheck() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ssp-crlf-"));
  const tempFixture = path.join(tempRoot, "research-brief");
  try {
    fs.cpSync(path.join(repoRoot, "examples/research-brief"), tempFixture, { recursive: true });
    for (const relativePath of ["SKILL.md", "steps/collect.md"]) {
      const filePath = path.join(tempFixture, ...relativePath.split("/"));
      const text = fs.readFileSync(filePath, "utf8");
      fs.writeFileSync(filePath, text.replace(/\r?\n/g, "\r\n"), "utf8");
    }
    return runValidatorMode("publication", [tempFixture]);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

let failed = false;

console.log("Source validation:");
const sourceValidResult = runValidatorMode("source", [...validFixtures, ...sourceOnlyFixtures]);
printOutput(sourceValidResult);

if (sourceValidResult.status !== 0) {
  failed = true;
  console.error("Conformance failure: valid fixtures did not all pass source validation.");
}

console.log("Publication validation:");
const validResult = runValidatorMode("publication", validFixtures);
printOutput(validResult);

if (validResult.status !== 0) {
  failed = true;
  console.error("Conformance failure: valid fixtures did not all pass publication validation.");
}

console.log("CRLF frontmatter validation:");
const crlfResult = runCrlfFrontmatterCheck();

if (crlfResult.status !== 0) {
  failed = true;
  printOutput(crlfResult);
  console.error("Conformance failure: CRLF frontmatter fixture did not pass publication validation.");
} else {
  console.log("PASS research-brief-crlf");
}

console.log("Invalid fixture publication validation:");
for (const fixture of invalidFixtures) {
  const result = runValidator([fixture.path]);
  printOutput(result);

  if (result.status === 0) {
    failed = true;
    console.error(`Conformance failure: invalid fixture passed unexpectedly: ${fixture.path}`);
    continue;
  }

  const issueCodes = parseIssueCodes(result.stdout);
  if (!issueCodes.includes(fixture.expectedCode)) {
    failed = true;
    console.error(`Conformance failure: ${fixture.path} did not report ${fixture.expectedCode}. Actual codes: ${issueCodes.join(", ") || "none"}.`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("PASS SSP v0 conformance suite draft");
