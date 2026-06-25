#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolDir, "..");
const validator = path.join(toolDir, "validate-ssp.mjs");

const validFixtures = [
  "examples/research-brief",
  "examples/multi-phase-review",
];

const invalidFixtures = [
  {
    path: "conformance/fixtures/broken-next",
    expectedCode: "SSP_NEXT_INVALID",
  },
  {
    path: "conformance/fixtures/missing-entry-metadata",
    expectedCode: "SSP_ENTRY_MISSING",
  },
  {
    path: "conformance/fixtures/missing-fallback",
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
];

function runValidator(fixtures) {
  return spawnSync(process.execPath, [validator, ...fixtures], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function printOutput(result) {
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

let failed = false;

const validResult = runValidator(validFixtures);
printOutput(validResult);

if (validResult.status !== 0) {
  failed = true;
  console.error("Conformance failure: valid fixtures did not all pass.");
}

for (const fixture of invalidFixtures) {
  const result = runValidator([fixture.path]);
  printOutput(result);

  if (result.status === 0) {
    failed = true;
    console.error(`Conformance failure: invalid fixture passed unexpectedly: ${fixture.path}`);
    continue;
  }

  const combined = `${result.stdout}\n${result.stderr}`;
  if (!combined.includes(fixture.expectedCode)) {
    failed = true;
    console.error(`Conformance failure: ${fixture.path} did not report ${fixture.expectedCode}.`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("PASS SSP v0 conformance suite draft");
