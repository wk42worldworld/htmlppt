"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const rendererPath = path.join(root, "renderer.js");
const outputPath = path.join(root, "examples", "ai-camera.ppt.html");

const code = fs.readFileSync(rendererPath, "utf8");
const context = { window: {}, console };

vm.runInNewContext(code, context, { filename: rendererPath });

const html = context.window.PPTHtml.exportStandalone(
  context.window.PPTHtml.createDemoDeck()
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, html, "utf8");

console.log(`wrote ${path.relative(root, outputPath)} (${html.length} bytes)`);

