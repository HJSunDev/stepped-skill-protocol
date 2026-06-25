#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function packagePath(root, relativePath) {
  return path.join(root, ...relativePath.split("/"));
}

function isSafeProtocolPath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.startsWith("/") &&
    !/^[a-zA-Z]:/.test(value) &&
    !value.includes("\\") &&
    !value.includes("..") &&
    !value.includes("?") &&
    !value.includes("#") &&
    !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)
  );
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(text) {
  const start = /^---\r?\n/.exec(text);
  if (!start) throw new Error("SKILL.md frontmatter is missing.");
  const end = text.slice(start[0].length).search(/\r?\n---(?:\r?\n|$)/);
  if (end === -1) throw new Error("SKILL.md frontmatter is not closed.");

  const yaml = text.slice(start[0].length, start[0].length + end).split(/\r?\n/);
  const fields = {};
  const metadata = {};
  let inMetadata = false;

  for (const line of yaml) {
    if (/^\s*$/.test(line)) continue;
    const top = /^([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (top && !line.startsWith(" ")) {
      inMetadata = top[1] === "metadata";
      if (!inMetadata) fields[top[1]] = stripQuotes(top[2].trim());
      continue;
    }
    const nested = /^\s+([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (inMetadata && nested) metadata[nested[1]] = stripQuotes(nested[2].trim());
  }

  return { fields, metadata };
}

function sectionBody(markdown, sectionName) {
  const lines = markdown.split(/\r?\n/);
  const heading = `## ${sectionName}`;
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return null;
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

function parseNext(markdown) {
  const body = sectionBody(markdown, "Next");
  if (!body) throw new Error("Step is missing Next.");
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length !== 1) throw new Error(`Next must contain exactly one target. Actual: ${lines.join(" / ") || "empty"}`);
  const code = /^`([^`]+)`$/.exec(lines[0]);
  if (code) return code[1].trim();
  if (/^[^\s`]+$/.test(lines[0])) return lines[0];
  throw new Error(`Next is malformed: ${lines[0]}`);
}

function parseResources(markdown) {
  const body = sectionBody(markdown, "Resources");
  if (!body) throw new Error("Step is missing Resources.");
  if (body.trim() === "None") return [];
  const resources = [];
  for (const line of body.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const bullet = /^\s*-\s+`?([^`]+?)`?\s*$/.exec(line);
    if (!bullet) throw new Error(`Resources contains a malformed line: ${line.trim()}`);
    resources.push(bullet[1].trim());
  }
  return resources;
}

function parseRequiredExtensions(value) {
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function generatedStepId(stepPath) {
  return stepPath.replace(/^steps\//, "").replace(/\.md$/, "").replaceAll("/", ".");
}

function arraysEqual(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((item, index) => item === right[index]);
}

function manifestsEqual(left, right) {
  if (!left || !right) return false;
  if (left.protocol !== right.protocol || left.version !== right.version || left.entry !== right.entry) return false;
  const leftRequired = left.requiredExtensions ?? [];
  const rightRequired = right.requiredExtensions ?? [];
  if (!arraysEqual(leftRequired, rightRequired)) return false;
  if (!Array.isArray(left.steps) || !Array.isArray(right.steps) || left.steps.length !== right.steps.length) return false;
  return left.steps.every((step, index) => {
    const other = right.steps[index];
    return step.id === other?.id && step.path === other.path && step.next === other.next && arraysEqual(step.resources, other.resources ?? []);
  });
}

function projectManifest(rootInput) {
  const root = path.resolve(rootInput);
  const skillPath = path.join(root, "SKILL.md");
  if (!exists(skillPath)) throw new Error("SKILL.md is missing.");

  const skill = parseFrontmatter(readText(skillPath));
  const version = skill.metadata["stepped-skill.version"];
  const entry = skill.metadata["stepped-skill.entry"];
  if (!version) throw new Error("metadata.stepped-skill.version is missing.");
  if (!entry) throw new Error("metadata.stepped-skill.entry is missing.");
  if (!isSafeProtocolPath(entry) || !entry.startsWith("steps/") || !entry.endsWith(".md")) {
    throw new Error(`Entry must be a safe steps/*.md path. Actual: ${entry}`);
  }

  const steps = [];
  const seen = new Set();
  let current = entry;
  while (current !== "END") {
    if (seen.has(current)) throw new Error(`Step chain contains a cycle at ${current}.`);
    seen.add(current);

    const stepPath = packagePath(root, current);
    if (!exists(stepPath)) throw new Error(`Step file is missing: ${current}`);
    const body = readText(stepPath);
    const resources = parseResources(body);
    for (const resource of resources) {
      if (!isSafeProtocolPath(resource) || resource.startsWith(".ssp/")) {
        throw new Error(`Resource path is invalid: ${resource}`);
      }
      const absoluteResource = packagePath(root, resource);
      if (!exists(absoluteResource) || fs.statSync(absoluteResource).isDirectory()) {
        throw new Error(`Resource is missing or not a file: ${resource}`);
      }
    }

    const next = parseNext(body);
    if (next !== "END" && (!isSafeProtocolPath(next) || !next.startsWith("steps/") || !next.endsWith(".md"))) {
      throw new Error(`Next must be END or a safe steps/*.md path. Actual: ${next}`);
    }

    steps.push({
      id: generatedStepId(current),
      path: current,
      next,
      resources,
    });

    current = next;
  }

  const manifest = {
    protocol: "stepped-skill",
    version,
    entry,
  };
  const requiredExtensions = parseRequiredExtensions(skill.metadata["stepped-skill.required-extensions"]);
  if (requiredExtensions.length > 0) manifest.requiredExtensions = requiredExtensions;
  manifest.steps = steps;
  return { root, manifest };
}

function quote(value) {
  return JSON.stringify(value);
}

function renderManifest(manifest) {
  const lines = [
    "{",
    `  "protocol": ${quote(manifest.protocol)},`,
    `  "version": ${quote(manifest.version)},`,
    `  "entry": ${quote(manifest.entry)},`,
  ];
  if (manifest.requiredExtensions?.length > 0) {
    lines.push(`  "requiredExtensions": [${manifest.requiredExtensions.map(quote).join(", ")}],`);
  }
  lines.push('  "steps": [');
  manifest.steps.forEach((step, index) => {
    lines.push("    {");
    lines.push(`      "id": ${quote(step.id)},`);
    lines.push(`      "path": ${quote(step.path)},`);
    lines.push(`      "next": ${quote(step.next)},`);
    lines.push(`      "resources": [${step.resources.map(quote).join(", ")}]`);
    lines.push(`    }${index === manifest.steps.length - 1 ? "" : ","}`);
  });
  lines.push("  ]");
  lines.push("}");
  return `${lines.join("\n")}\n`;
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const packageArgs = args.filter((arg) => arg !== "--check");

if (packageArgs.length === 0) {
  console.error("Usage: node generate-manifest.mjs [--check] <skill-package> [<skill-package> ...]");
  process.exit(2);
}

let failed = false;
for (const packageArg of packageArgs) {
  try {
    const { root, manifest } = projectManifest(packageArg);
    const manifestPath = packagePath(root, ".ssp/manifest.json");
    if (check) {
      if (!exists(manifestPath)) throw new Error(".ssp/manifest.json is missing.");
      const existing = JSON.parse(readText(manifestPath));
      if (!manifestsEqual(existing, manifest)) throw new Error(".ssp/manifest.json does not match generated manifest.");
      console.log(`PASS ${path.relative(process.cwd(), root) || root}`);
    } else {
      fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
      fs.writeFileSync(manifestPath, renderManifest(manifest), "utf8");
      console.log(`WROTE ${path.relative(process.cwd(), manifestPath) || manifestPath}`);
    }
  } catch (error) {
    failed = true;
    console.error(`FAIL ${packageArg}: ${error.message}`);
  }
}

process.exit(failed ? 1 : 0);
