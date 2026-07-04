"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const rendererPath = path.join(root, "renderer.js");
const code = fs.readFileSync(rendererPath, "utf8");
const context = { window: {}, console };

vm.runInNewContext(code, context, { filename: rendererPath });

const ppt = context.window.PPTHtml;

assert.equal(ppt.version, "0.1");
assert.ok(Array.isArray(ppt.deckTemplates));
assert.ok(ppt.deckTemplates.length >= 4);

ppt.deckTemplates.forEach((template) => {
  const deck = ppt.createTemplateDeck(template.id);
  const result = ppt.validateDeck(deck);
  assert.equal(result.ok, true, `template ${template.id} should pass validation`);
  assert.ok(deck.slides.length >= 1, `template ${template.id} should include slides`);
});

const badDeck = {
  version: "0.1",
  title: "Broken deck",
  slides: [
    { layout: "mystery", title: "" }
  ]
};
const badResult = ppt.validateDeck(badDeck);
assert.equal(badResult.ok, false);
assert.ok(badResult.errors.some((item) => item.path === "slides[0].layout"));
assert.match(ppt.formatValidationReport(badDeck, badResult), /AI repair instruction/);

const html = ppt.exportStandalone(ppt.createTemplateDeck("product-pitch"));
assert.match(html, /id="ppt-html-data"/);
assert.match(html, /data-format="ppt\.html"/);
assert.match(html, /F5/);
assert.match(html, /ArrowDown/);
assert.match(html, /is-ui-hidden/);
assert.match(html, /requestFullscreen/);

const fencedDeck = ppt.parseFileText("```json\n" + JSON.stringify(ppt.createTemplateDeck("lesson")) + "\n```");
assert.equal(fencedDeck.title, "课程课件");

console.log("smoke tests passed");
