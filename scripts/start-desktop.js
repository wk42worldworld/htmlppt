"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.join(__dirname, "..");
const productName = "PPT.html Studio";

function localBin(name) {
  return path.join(root, "node_modules", ".bin", process.platform === "win32" ? `${name}.cmd` : name);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit"
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function findBuiltMacApp(directory) {
  if (!fs.existsSync(directory)) return "";
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name === `${productName}.app`) {
      return fullPath;
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.endsWith(".app")) continue;
    const found = findBuiltMacApp(path.join(directory, entry.name));
    if (found) return found;
  }

  return "";
}

function startMacApp() {
  const arch = process.env.npm_config_arch || process.env.ARCH || process.arch;
  const macArch = arch === "x64" ? "x64" : "arm64";

  run(localBin("electron-builder"), [
    "--mac",
    "dir",
    `--${macArch}`,
    "--publish",
    "never",
    "--config.mac.identity=null",
    "--config.mac.notarize=false"
  ]);

  const appPath = findBuiltMacApp(path.join(root, "dist"));
  if (!appPath) {
    console.error(`Could not find ${productName}.app in dist.`);
    process.exit(1);
  }

  console.log(`Opening ${appPath}`);
  run("open", ["-W", "-n", appPath]);
}

if (process.platform === "darwin") {
  startMacApp();
} else {
  run(localBin("electron"), ["."]);
}
