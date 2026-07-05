#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const rendererPath = path.join(root, "renderer.js");

const usage = `
PPT.html agent deck utility

Usage:
  node scripts/agent-deck.js validate <deck.json|deck.ppt.html|-> [--json] [--strict] [--strict-assets]
  node scripts/agent-deck.js extract <deck.json|deck.ppt.html|-> [output.json|-]
  node scripts/agent-deck.js build <deck.json|deck.ppt.html|-> [output.ppt.html|-] [--strict-assets]

Commands:
  validate  Parse and validate a deck. Exits non-zero when validation has errors.
  extract   Print or write normalized deck JSON from JSON, fenced JSON, or .ppt.html.
  build     Write a standalone .ppt.html file from a normalized deck.

Options:
  --json           Print a machine-readable validation report.
  --strict         Treat warnings as a validation failure.
  --strict-assets  Treat external image/video/audio URLs as a failure.
`;

function loadPptHtml() {
  const code = fs.readFileSync(rendererPath, "utf8");
  const context = { window: {}, console };
  vm.runInNewContext(code, context, { filename: rendererPath });
  return context.window.PPTHtml;
}

function readInput(inputPath) {
  if (!inputPath) throw new Error("Missing input path.");
  if (inputPath === "-") return fs.readFileSync(0, "utf8");
  return fs.readFileSync(path.resolve(inputPath), "utf8");
}

function writeOutput(outputPath, content, fallbackPath) {
  const target = outputPath || fallbackPath;
  if (!target || target === "-") {
    process.stdout.write(content);
    if (!content.endsWith("\n")) process.stdout.write("\n");
    return "-";
  }
  const resolved = path.resolve(target);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, content, "utf8");
  return path.relative(root, resolved);
}

function decodeBasicEntities(text) {
  return String(text || "")
    .replace(/&quot;/g, "\"")
    .replace(/&#34;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function findScriptDeck(text) {
  const scriptMatch = String(text || "").match(/<script\b(?=[^>]*\bid=["']ppt-html-data["'])[^>]*>([\s\S]*?)<\/script>/i);
  if (!scriptMatch) return "";
  return decodeBasicEntities(scriptMatch[1])
    .replace(/^\s*<!--/, "")
    .replace(/-->\s*$/, "")
    .trim();
}

function findBalancedJson(text) {
  const value = String(text || "");
  const start = value.indexOf("{");
  if (start === -1) return "";

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < value.length; index += 1) {
    const char = value[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return value.slice(start, index + 1);
    }
  }

  return "";
}

function extractDeckJsonText(rawText) {
  const trimmed = String(rawText || "").trim();
  if (!trimmed) throw new Error("Input is empty.");

  const htmlDeck = findScriptDeck(trimmed);
  if (htmlDeck) return htmlDeck;

  const exactFence = trimmed.match(/^```(?:json|ppt-html|ppt\.html)?\s*([\s\S]*?)\s*```$/i);
  if (exactFence) return extractDeckJsonText(exactFence[1]);

  const firstFence = trimmed.match(/```(?:json|ppt-html|ppt\.html)?\s*([\s\S]*?)```/i);
  if (firstFence) {
    const fencedJson = extractDeckJsonText(firstFence[1]);
    if (fencedJson) return fencedJson;
  }

  if (trimmed[0] === "{") return findBalancedJson(trimmed);
  if (trimmed.indexOf("\"slides\"") !== -1) return findBalancedJson(trimmed);

  throw new Error("Could not find PPT.html deck JSON or #ppt-html-data.");
}

function parseRawDeck(inputPath) {
  const rawText = readInput(inputPath);
  const jsonText = extractDeckJsonText(rawText);
  return JSON.parse(jsonText);
}

function defaultBuildOutput(inputPath) {
  if (!inputPath || inputPath === "-") return path.join("dist", "agent-output.ppt.html");
  const parsed = path.parse(inputPath);
  const base = parsed.name.replace(/\.ppt$/i, "");
  return path.join(parsed.dir || ".", `${base}.built.ppt.html`);
}

function printExternalAssets(ppt, deck) {
  const refs = ppt.collectExternalAssetReferences(deck);
  if (!refs.length) {
    console.log("\nExternal assets: 0");
    return refs;
  }

  console.log(`\nExternal assets: ${refs.length}`);
  refs.forEach((ref) => {
    console.log(`- slide ${ref.slideNumber} ${ref.path}: ${ref.src}`);
  });
  console.log("Tip: final shared .ppt.html files should embed these as Data URI assets.");
  return refs;
}

function validateCommand(args, ppt) {
  const inputPath = args.find((arg) => !arg.startsWith("--"));
  const jsonOutput = args.includes("--json");
  const strict = args.includes("--strict");
  const strictAssets = args.includes("--strict-assets");
  const deck = parseRawDeck(inputPath);
  const result = ppt.validateDeck(deck);
  const refs = ppt.collectExternalAssetReferences(deck);

  if (jsonOutput) {
    console.log(JSON.stringify({
      ok: result.ok && (!strict || !result.warnings.length) && (!strictAssets || !refs.length),
      validation: result,
      externalAssets: refs,
      deck: {
        title: deck && deck.title ? deck.title : "",
        version: deck && deck.version ? deck.version : "",
        slides: Array.isArray(deck && deck.slides) ? deck.slides.length : 0
      }
    }, null, 2));
  } else {
    console.log(ppt.formatValidationReport(deck, result));
    printExternalAssets(ppt, deck);
  }

  if (!result.ok || (strict && result.warnings.length) || (strictAssets && refs.length)) {
    process.exitCode = 1;
  }
}

function extractCommand(args, ppt) {
  const paths = args.filter((arg) => !arg.startsWith("--"));
  const deck = ppt.normalizeDeck(parseRawDeck(paths[0]));
  const written = writeOutput(paths[1] || "-", `${JSON.stringify(deck, null, 2)}\n`);
  if (written !== "-") console.log(`wrote ${written}`);
}

function buildCommand(args, ppt) {
  const paths = args.filter((arg) => !arg.startsWith("--"));
  const strictAssets = args.includes("--strict-assets");
  const rawDeck = parseRawDeck(paths[0]);
  const result = ppt.validateDeck(rawDeck);
  if (!result.ok) {
    console.error(ppt.formatValidationReport(rawDeck, result));
    process.exitCode = 1;
    return;
  }

  const deck = ppt.normalizeDeck(rawDeck);
  const refs = ppt.collectExternalAssetReferences(deck);
  if (strictAssets && refs.length) {
    refs.forEach((ref) => console.error(`external asset: slide ${ref.slideNumber} ${ref.path}: ${ref.src}`));
    process.exitCode = 1;
    return;
  }

  const html = ppt.exportStandalone(deck);
  const written = writeOutput(paths[1], html, defaultBuildOutput(paths[0]));
  if (written !== "-") {
    console.log(`wrote ${written} (${html.length} bytes)`);
    if (refs.length) console.log(`warning: ${refs.length} external asset reference(s) remain`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args.shift();

  if (!command || command === "-h" || command === "--help") {
    process.stdout.write(usage.trimStart());
    return;
  }

  const ppt = loadPptHtml();

  if (command === "validate") {
    validateCommand(args, ppt);
  } else if (command === "extract") {
    extractCommand(args, ppt);
  } else if (command === "build") {
    buildCommand(args, ppt);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`Agent deck command failed: ${error.message}`);
  process.exitCode = 1;
}
