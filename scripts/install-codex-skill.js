#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = path.join(root, "skills", "htmlppt");
const codexHome = process.env.CODEX_HOME
  ? path.resolve(process.env.CODEX_HOME)
  : path.join(os.homedir(), ".codex");
const target = path.join(codexHome, "skills", "htmlppt");
const force = process.argv.includes("--force");

if (!fs.existsSync(path.join(source, "SKILL.md"))) {
  console.error(`Missing source skill: ${source}`);
  process.exit(1);
}

if (fs.existsSync(target)) {
  if (!force) {
    console.error(`Skill already exists: ${target}`);
    console.error("Re-run with --force to replace it.");
    process.exit(1);
  }
  fs.rmSync(target, { recursive: true, force: true });
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.cpSync(source, target, { recursive: true });

console.log(`installed htmlppt skill to ${target}`);
