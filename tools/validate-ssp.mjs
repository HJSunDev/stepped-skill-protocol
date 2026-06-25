#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const REQUIRED_STEP_SECTIONS = [
  "Objective",
  "Resources",
  "Instructions",
  "Output",
  "Completion Criteria",
  "Handoff",
  "Next",
];
const REQUIRED_NON_EMPTY_STEP_SECTIONS = [
  "Objective",
  "Instructions",
  "Output",
  "Completion Criteria",
];

const SUPPORTED_REQUIRED_EXTENSIONS = new Set();
const SUPPORTED_MAJOR_VERSION = "0";
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function issue(code, pathValue, section, expected, actual, message, hint) {
  return {
    code,
    severity: "error",
    path: pathValue,
    section,
    expected,
    actual,
    message,
    hint,
  };
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

function toPosix(value) {
  return value.replaceAll(path.sep, "/");
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

function parseFrontmatter(text) {
  const start = /^---\r?\n/.exec(text);
  if (!start) return { frontmatterOk: false, fields: {}, metadata: {}, metadataIssues: [], body: text };
  const end = text.slice(start[0].length).search(/\r?\n---(?:\r?\n|$)/);
  if (end === -1) return { frontmatterOk: false, fields: {}, metadata: {}, metadataIssues: [], body: text };
  const yamlStart = start[0].length;
  const yamlEnd = yamlStart + end;
  const close = /\r?\n---(?:\r?\n|$)/.exec(text.slice(yamlEnd));
  const bodyStart = yamlEnd + (close?.[0].length ?? 0);
  const yaml = text.slice(yamlStart, yamlEnd).split(/\r?\n/);
  const fields = {};
  const fieldIssues = [];
  const metadata = {};
  const metadataIssues = [];
  let inMetadata = false;

  for (const line of yaml) {
    if (/^\s*$/.test(line)) continue;
    const top = /^([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (top && !line.startsWith(" ")) {
      inMetadata = top[1] === "metadata";
      if (inMetadata && top[2].trim()) {
        metadataIssues.push({
          section: "metadata",
          actual: top[2].trim(),
          message: "Metadata must be a YAML map, not an inline scalar or collection.",
        });
      }
      if (!inMetadata) {
        const rawValue = top[2].trim();
        fields[top[1]] = stripQuotes(rawValue);
        if (["name", "description", "compatibility"].includes(top[1])) {
          if (rawValue.startsWith("[") || rawValue.startsWith("{")) {
            fieldIssues.push({
              section: top[1],
              actual: rawValue,
              message: `${top[1]} must be a scalar string.`,
            });
          } else if (rawValue && looksLikeNonStringYamlScalar(rawValue)) {
            fieldIssues.push({
              section: top[1],
              actual: rawValue,
              message: `${top[1]} must be a string; quote values that YAML would parse as numbers, booleans, or null.`,
            });
          }
        }
      }
      continue;
    }
    const nested = /^\s+([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (inMetadata && nested) {
      const rawValue = nested[2].trim();
      if (!rawValue || rawValue.startsWith("[") || rawValue.startsWith("{")) {
        metadataIssues.push({
          section: `metadata.${nested[1]}`,
          actual: rawValue || "empty or nested value",
          message: "Metadata values must be scalar strings.",
        });
      } else if (looksLikeNonStringYamlScalar(rawValue)) {
        metadataIssues.push({
          section: `metadata.${nested[1]}`,
          actual: rawValue,
          message: "Metadata values must be strings; quote values that YAML would parse as numbers, booleans, or null.",
        });
      }
      metadata[nested[1]] = stripQuotes(rawValue);
      continue;
    }
    if (inMetadata && line.startsWith(" ")) {
      metadataIssues.push({
        section: "metadata",
        actual: line.trim(),
        message: "Metadata entries must be simple string key-value pairs.",
      });
    }
  }

  return { frontmatterOk: true, fields, fieldIssues, metadata, metadataIssues, body: text.slice(bodyStart) };
}

function parseStepProjection(text) {
  const start = /^---\r?\n/.exec(text);
  if (!start) return null;
  const end = text.slice(start[0].length).search(/\r?\n---(?:\r?\n|$)/);
  if (end === -1) return null;

  const yaml = text.slice(start[0].length, start[0].length + end).split(/\r?\n/);
  const ssp = {};
  let inSsp = false;
  let inResources = false;

  for (const line of yaml) {
    if (/^\s*$/.test(line)) continue;

    if (/^ssp:\s*$/.test(line)) {
      inSsp = true;
      inResources = false;
      continue;
    }

    if (!line.startsWith(" ")) {
      inSsp = false;
      inResources = false;
      continue;
    }

    if (!inSsp) continue;

    const pair = /^\s+([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (pair) {
      const key = pair[1];
      const value = pair[2].trim();
      inResources = key === "resources";
      if (inResources) {
        ssp.resources = value === "[]" || value === "" ? [] : [stripQuotes(value)];
      } else {
        ssp[key] = stripQuotes(value);
      }
      continue;
    }

    const bullet = /^\s+-\s+["']?(.+?)["']?\s*$/.exec(line);
    if (inResources && bullet) {
      if (!Array.isArray(ssp.resources)) ssp.resources = [];
      ssp.resources.push(bullet[1].trim());
    }
  }

  return Object.keys(ssp).length > 0 ? ssp : null;
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function isQuoted(value) {
  return /^["'].*["']$/.test(value);
}

function looksLikeNonStringYamlScalar(value) {
  if (isQuoted(value)) return false;
  return /^(?:true|false|null|~)$/i.test(value) || /^[-+]?(?:\d+|\d+\.\d+|\.\d+)(?:[eE][-+]?\d+)?$/.test(value);
}

function parseRequiredExtensionMetadata(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function majorVersion(value) {
  if (!value) return null;
  return String(value).split(".")[0] || null;
}

function isSupportedVersion(value) {
  return majorVersion(value) === SUPPORTED_MAJOR_VERSION;
}

function isValidSkillName(value) {
  return typeof value === "string" && value.length >= 1 && value.length <= 64 && SKILL_NAME_PATTERN.test(value);
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
  if (!body) return { next: null, malformed: false, actual: body ?? "missing" };
  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length !== 1) {
    return { next: null, malformed: true, actual: lines.join(" / ") || "empty" };
  }
  const line = lines[0];
  const code = /^`([^`]+)`$/.exec(line);
  if (code) return { next: code[1].trim(), malformed: false, actual: line };
  if (/^[^\s`]+$/.test(line)) return { next: line, malformed: false, actual: line };
  return { next: null, malformed: true, actual: line };
}

function parseResources(markdown) {
  const body = sectionBody(markdown, "Resources");
  if (!body) return null;
  if (/^None\.?$/i.test(body.trim())) return { resources: [], malformedLines: [] };
  const resources = [];
  const malformedLines = [];
  for (const line of body.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const bullet = /^\s*-\s+`?([^`]+?)`?\s*$/.exec(line);
    if (bullet) {
      resources.push(bullet[1].trim());
    } else {
      malformedLines.push(line.trim());
    }
  }
  return { resources, malformedLines };
}

function generatedStepId(stepPath) {
  return stepPath.replace(/^steps\//, "").replace(/\.md$/, "").replaceAll("/", ".");
}

function listStepFiles(root) {
  const stepsRoot = packagePath(root, "steps");
  if (!exists(stepsRoot)) return [];
  const out = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(absolute);
      if (entry.isFile() && entry.name.endsWith(".md")) {
        out.push(toPosix(path.relative(root, absolute)));
      }
    }
  };
  visit(stepsRoot);
  return out.sort();
}

function validatePackage(rootInput, options = {}) {
  const root = path.resolve(rootInput);
  const mode = options.mode ?? "publication";
  const publicationMode = mode === "publication";
  const issues = [];
  const skillPath = path.join(root, "SKILL.md");

  if (!exists(skillPath)) {
    issues.push(issue("SSP_PACKAGE_INVALID", "SKILL.md", "file", "present", "missing", "SKILL.md is missing.", "Add SKILL.md."));
    return { root, ok: false, issues };
  }

  const skill = parseFrontmatter(readText(skillPath));
  if (!skill.frontmatterOk) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", "frontmatter", "YAML frontmatter followed by Markdown body", "missing or malformed", "SKILL.md frontmatter is missing or malformed.", "Start SKILL.md with a valid YAML frontmatter block delimited by --- lines."));
    return { root, ok: false, issues };
  }
  for (const fieldIssue of skill.fieldIssues) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", fieldIssue.section, "scalar string", fieldIssue.actual, fieldIssue.message, "Keep Agent Skills frontmatter fields as strings."));
  }
  for (const metadataIssue of skill.metadataIssues) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", metadataIssue.section, "string-to-string metadata map", metadataIssue.actual, metadataIssue.message, "Keep metadata as simple string key-value pairs."));
  }
  const skillName = skill.fields.name;
  const packageName = path.basename(root);
  if (!skillName) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", "name", "present", "missing", "Skill name is missing.", "Add name frontmatter."));
  } else if (!isValidSkillName(skillName)) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", "name", "1-64 lowercase letters, numbers, and single hyphens", skillName, "Skill name does not satisfy Agent Skills naming rules.", "Use lowercase letters, numbers, and hyphens; avoid leading, trailing, or repeated hyphens."));
  } else if (skillName !== packageName) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", "name", packageName, skillName, "Skill name must match the package directory name.", "Rename the package directory or update SKILL.md name."));
  }
  const skillDescription = skill.fields.description;
  if (!skillDescription) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", "description", "present", "missing", "Skill description is missing.", "Add description frontmatter."));
  } else if (skillDescription.length > 1024) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", "description", "1-1024 characters", `${skillDescription.length} characters`, "Skill description exceeds the Agent Skills length limit.", "Shorten description while keeping what the skill does and when to use it."));
  }
  if (Object.hasOwn(skill.fields, "compatibility") && skill.fields.compatibility.length === 0) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", "compatibility", "1-500 characters", "empty", "Skill compatibility is present but empty.", "Remove compatibility or provide a short compatibility statement."));
  } else if (skill.fields.compatibility && skill.fields.compatibility.length > 500) {
    issues.push(issue("SSP_AGENT_SKILL_INVALID", "SKILL.md", "compatibility", "1-500 characters", `${skill.fields.compatibility.length} characters`, "Skill compatibility exceeds the Agent Skills length limit.", "Shorten compatibility or move detail into the body."));
  }
  const skillVersion = skill.metadata["stepped-skill.version"];
  if (!skillVersion) {
    issues.push(issue("SSP_ENTRY_MISSING", "SKILL.md", "metadata.stepped-skill.version", "present", "missing", "SSP version metadata is missing.", "Add stepped-skill.version."));
  } else if (!isSupportedVersion(skillVersion)) {
    issues.push(issue("SSP_VERSION_UNSUPPORTED", "SKILL.md", "metadata.stepped-skill.version", `${SUPPORTED_MAJOR_VERSION}.x`, skillVersion, "SSP major version is unsupported.", "Use a supported SSP version or upgrade the validator/runtime."));
  }
  const entry = skill.metadata["stepped-skill.entry"];
  if (!entry) {
    issues.push(issue("SSP_ENTRY_MISSING", "SKILL.md", "metadata.stepped-skill.entry", "present", "missing", "SSP entry metadata is missing.", "Add stepped-skill.entry."));
  }
  const fallbackWorkflow = sectionBody(skill.body, "Fallback Workflow");
  if (fallbackWorkflow === null) {
    issues.push(issue("SSP_PACKAGE_INVALID", "SKILL.md", "Fallback Workflow", "present", "missing", "Fallback workflow is missing.", "Add an ordinary Skill fallback."));
  } else if (!fallbackWorkflow.trim()) {
    issues.push(issue("SSP_PACKAGE_INVALID", "SKILL.md", "Fallback Workflow", "non-empty ordinary Skill fallback", "empty", "Fallback workflow is empty.", "Add a complete ordinary Skill fallback."));
  }

  const metadataRequiredExtensions = parseRequiredExtensionMetadata(skill.metadata["stepped-skill.required-extensions"]);
  let manifest = null;
  const manifestPath = packagePath(root, ".ssp/manifest.json");
  if (publicationMode && exists(manifestPath)) {
    try {
      manifest = JSON.parse(readText(manifestPath));
    } catch (error) {
      issues.push(issue("SSP_PACKAGE_INVALID", ".ssp/manifest.json", "json", "valid JSON", error.message, "Manifest is not valid JSON.", "Regenerate the manifest."));
    }
  } else if (publicationMode) {
    issues.push(issue("SSP_PACKAGE_INVALID", ".ssp/manifest.json", "file", "present", "missing", "Manifest is missing for publication validation.", "Generate .ssp/manifest.json."));
  }

  let manifestRequiredExtensions = [];
  if (publicationMode && manifest?.requiredExtensions !== undefined) {
    if (Array.isArray(manifest.requiredExtensions)) {
      manifestRequiredExtensions = manifest.requiredExtensions;
    } else {
      issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "requiredExtensions", "array of extension ids", typeof manifest.requiredExtensions, "Manifest requiredExtensions must be an array.", "Regenerate manifest with requiredExtensions as an array."));
    }
  }
  const requiredExtensions = [...new Set([...metadataRequiredExtensions, ...manifestRequiredExtensions])];
  if (publicationMode) {
    for (const extension of requiredExtensions) {
      if (!SUPPORTED_REQUIRED_EXTENSIONS.has(extension)) {
        issues.push(issue("SSP_EXTENSION_UNSUPPORTED", ".ssp/manifest.json", "requiredExtensions", "known supported extension", extension, "Required extension is unknown.", "Remove the required extension or use a validator/runtime that supports it."));
      }
    }
  }
  if (publicationMode && manifest && JSON.stringify(metadataRequiredExtensions) !== JSON.stringify(manifestRequiredExtensions)) {
    issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "requiredExtensions", JSON.stringify(metadataRequiredExtensions), JSON.stringify(manifestRequiredExtensions), "Manifest requiredExtensions do not match SKILL.md metadata.", "Regenerate manifest."));
  }
  if (publicationMode && manifest) {
    if (!manifest.version) {
      issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "version", skillVersion ?? "supported version", "missing", "Manifest version is missing.", "Regenerate manifest."));
    } else if (!isSupportedVersion(manifest.version)) {
      issues.push(issue("SSP_VERSION_UNSUPPORTED", ".ssp/manifest.json", "version", `${SUPPORTED_MAJOR_VERSION}.x`, manifest.version, "Manifest SSP major version is unsupported.", "Use a supported SSP version or upgrade the validator/runtime."));
    } else if (skillVersion && manifest.version !== skillVersion) {
      issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "version", skillVersion, manifest.version, "Manifest version does not match SKILL.md metadata.", "Regenerate manifest."));
    }
    if (!Array.isArray(manifest.steps)) {
      issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "steps", "array", typeof manifest.steps, "Manifest steps must be an array.", "Regenerate manifest."));
    } else {
      const seenManifestPaths = new Set();
      const seenManifestIds = new Set();
      for (const step of manifest.steps) {
        if (step?.path) {
          if (seenManifestPaths.has(step.path)) {
            issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "steps.path", "unique step paths", step.path, "Manifest contains a duplicate step path.", "Regenerate manifest from the source chain."));
          }
          seenManifestPaths.add(step.path);
        }
        if (step?.id) {
          if (seenManifestIds.has(step.id)) {
            issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "steps.id", "unique step ids", step.id, "Manifest contains a duplicate step id.", "Regenerate manifest from the source chain."));
          }
          seenManifestIds.add(step.id);
        }
      }
    }
  }

  if (!entry) return { root, ok: issues.length === 0, issues };
  if (!isSafeProtocolPath(entry) || !entry.startsWith("steps/") || !entry.endsWith(".md")) {
    issues.push(issue("SSP_ENTRY_MISSING", "SKILL.md", "metadata.stepped-skill.entry", "steps/*.md", entry, "Entry path is invalid.", "Use a safe steps/*.md path."));
    return { root, ok: false, issues };
  }

  const projected = [];
  const seen = new Set();
  let current = entry;
  let chainBroken = false;

  while (current !== "END") {
    if (seen.has(current)) {
      issues.push(issue("SSP_CHAIN_CYCLE", current, "Next", "acyclic chain", current, "Step chain contains a cycle.", "Break the cycle."));
      break;
    }
    seen.add(current);

    const currentPath = packagePath(root, current);
    if (!exists(currentPath)) {
      issues.push(issue("SSP_STEP_UNREADABLE", current, "file", "present", "missing", "Step file cannot be read.", "Create the step file or fix Next."));
      break;
    }

    const body = readText(currentPath);
    for (const section of REQUIRED_STEP_SECTIONS) {
      const content = sectionBody(body, section);
      if (content === null) {
        issues.push(issue("SSP_STEP_MISSING_SECTION", current, section, "present", "missing", `Step is missing ${section}.`, `Add ## ${section}.`));
      } else if (REQUIRED_NON_EMPTY_STEP_SECTIONS.includes(section) && !content.trim()) {
        issues.push(issue("SSP_STEP_MISSING_SECTION", current, section, "non-empty section", "empty", `Step section ${section} is empty.`, `Fill ## ${section}.`));
      }
    }

    const parsedResources = parseResources(body);
    const resources = parsedResources?.resources ?? [];
    for (const malformedLine of parsedResources?.malformedLines ?? []) {
      issues.push(issue("SSP_RESOURCE_UNREADABLE", current, "Resources", "`None` or bullet list of file paths", malformedLine, "Resources section contains a malformed line.", "Use `None` or `- path/to/file.md` entries only."));
    }
    for (const resource of resources) {
      const validResource = isSafeProtocolPath(resource) && !resource.startsWith(".ssp/");
      if (!validResource || !exists(packagePath(root, resource)) || fs.statSync(packagePath(root, resource)).isDirectory()) {
        issues.push(issue("SSP_RESOURCE_UNREADABLE", current, "Resources", "existing file path", resource, "Resource path is invalid or unreadable.", "Use an existing skill-root relative file path."));
      }
    }

    const parsedNext = parseNext(body);
    const next = parsedNext.next;
    const manifestStep = Array.isArray(manifest?.steps) ? manifest.steps.find((step) => step.path === current) : null;
    const expectedNext = manifestStep?.next;
    let invalidNext = false;
    if (parsedNext.malformed) {
      issues.push(issue("SSP_NEXT_INVALID", current, "Next", "single bare path, single code-spanned path, or END", parsedNext.actual, "Next section is malformed.", "Use exactly one target: `steps/name.md` or `END`."));
      chainBroken = true;
      break;
    }
    if (!next) {
      issues.push(issue("SSP_NEXT_INVALID", current, "Next", "step path or END", "missing", "Next is missing.", "Add ## Next."));
      chainBroken = true;
      break;
    }
    if (publicationMode && expectedNext && next !== expectedNext) {
      issues.push(issue("SSP_NEXT_INVALID", current, "Next", expectedNext, next, "Body Next does not match manifest next.", "Update body Next or regenerate manifest from source."));
      invalidNext = true;
    }
    if (next !== "END") {
      const validNext = isSafeProtocolPath(next) && next.startsWith("steps/") && next.endsWith(".md");
      if (!invalidNext && (!validNext || !exists(packagePath(root, next)))) {
        issues.push(issue("SSP_NEXT_INVALID", current, "Next", expectedNext ?? "existing steps/*.md or END", next, "Next target is invalid or missing.", "Use an existing steps/*.md path or END."));
        invalidNext = true;
      }
      if (invalidNext) {
        projected.push({
          id: generatedStepId(current),
          path: current,
          next,
          resources,
        });
        chainBroken = true;
        break;
      }
    }

    if (publicationMode) {
      const stepProjection = parseStepProjection(body);
      if (stepProjection) {
        const expectedId = generatedStepId(current);
        if (stepProjection.version && skillVersion && stepProjection.version !== skillVersion) {
          issues.push(issue("SSP_MANIFEST_MISMATCH", current, "frontmatter.ssp.version", skillVersion, stepProjection.version, "Step frontmatter version does not match SKILL.md metadata.", "Regenerate step frontmatter."));
        }
        if (stepProjection.id && stepProjection.id !== expectedId) {
          issues.push(issue("SSP_MANIFEST_MISMATCH", current, "frontmatter.ssp.id", expectedId, stepProjection.id, "Step frontmatter id does not match the canonical step id.", "Regenerate step frontmatter."));
        }
        if (stepProjection.next && next && stepProjection.next !== next) {
          issues.push(issue("SSP_MANIFEST_MISMATCH", current, "frontmatter.ssp.next", next, stepProjection.next, "Step frontmatter next does not match body Next.", "Regenerate step frontmatter."));
        }
        if (Array.isArray(stepProjection.resources) && JSON.stringify(stepProjection.resources) !== JSON.stringify(resources)) {
          issues.push(issue("SSP_MANIFEST_MISMATCH", current, "frontmatter.ssp.resources", JSON.stringify(resources), JSON.stringify(stepProjection.resources), "Step frontmatter resources do not match body Resources.", "Regenerate step frontmatter."));
        }
      }
    }

    if (next !== "END") {
      const handoff = sectionBody(body, "Handoff");
      if (!handoff || /^None\.?$/i.test(handoff.trim())) {
        issues.push(issue("SSP_HANDOFF_MISSING", current, "Handoff", "carry-forward state", handoff ?? "missing", "Non-terminal step lacks handoff.", "Define carry-forward state."));
      }
    }

    projected.push({
      id: generatedStepId(current),
      path: current,
      next,
      resources,
    });
    current = next;
  }

  if (publicationMode && manifest && !chainBroken) {
    if (manifest.protocol !== "stepped-skill") {
      issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "protocol", "stepped-skill", manifest.protocol, "Manifest protocol is invalid.", "Set protocol to stepped-skill."));
    }
    if (manifest.entry !== entry) {
      issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "entry", entry, manifest.entry, "Manifest entry does not match SKILL.md.", "Regenerate manifest."));
    }
    const actualManifestSteps = Array.isArray(manifest.steps) ? manifest.steps : [];
    const expectedPaths = projected.map((step) => step.path);
    const actualPaths = actualManifestSteps.map((step) => step.path);
    if (JSON.stringify(expectedPaths) !== JSON.stringify(actualPaths)) {
      issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", "steps", expectedPaths.join(" -> "), actualPaths.join(" -> "), "Manifest step order does not match projected chain.", "Regenerate manifest."));
    }
    for (const step of projected) {
      const actual = actualManifestSteps.find((item) => item.path === step.path);
      if (!actual) continue;
      if (actual.next !== step.next) {
        issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", `${step.path}.next`, step.next, actual.next, "Manifest next does not match source.", "Regenerate manifest."));
      }
      if (JSON.stringify(actual.resources ?? []) !== JSON.stringify(step.resources)) {
        issues.push(issue("SSP_MANIFEST_MISMATCH", ".ssp/manifest.json", `${step.path}.resources`, JSON.stringify(step.resources), JSON.stringify(actual.resources ?? []), "Manifest resources do not match source.", "Regenerate manifest."));
      }
    }
  }

  if (publicationMode && !chainBroken) {
    const reachable = new Set(projected.map((step) => step.path));
    for (const stepFile of listStepFiles(root)) {
      if (!reachable.has(stepFile)) {
        issues.push(issue("SSP_CHAIN_UNREACHABLE_STEP", stepFile, "chain", "reachable", "unreachable", "Published package contains an unreachable step file.", "Remove the step or link it into the chain."));
      }
    }
  }

  return { root, ok: issues.length === 0, projected, issues };
}

const args = process.argv.slice(2);
let mode = "publication";
const packageArgs = [];

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === "--mode") {
    mode = args[index + 1];
    index += 1;
    continue;
  }
  if (arg.startsWith("--mode=")) {
    mode = arg.slice("--mode=".length);
    continue;
  }
  packageArgs.push(arg);
}

if (!new Set(["source", "publication"]).has(mode)) {
  console.error("Invalid mode. Use --mode source or --mode publication.");
  process.exit(2);
}

if (packageArgs.length === 0) {
  console.error("Usage: node validate-ssp.mjs [--mode source|publication] <skill-package> [<skill-package> ...]");
  process.exit(2);
}

let failed = false;
for (const arg of packageArgs) {
  const result = validatePackage(arg, { mode });
  const label = path.relative(process.cwd(), result.root) || result.root;
  if (result.ok) {
    console.log(`PASS ${label}`);
  } else {
    failed = true;
    console.log(`FAIL ${label}`);
    console.log(JSON.stringify(result.issues, null, 2));
  }
}

process.exit(failed ? 1 : 0);
