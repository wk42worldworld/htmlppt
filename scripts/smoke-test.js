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

const imageDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Image deck",
  slides: [
    {
      layout: "imageFull",
      title: "Full image",
      image: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
        alt: "Example image",
        caption: "Image caption",
        fit: "contain"
      }
    }
  ]
});
assert.equal(imageDeck.slides[0].image.fit, "contain");
assert.equal(ppt.validateDeck(imageDeck).ok, true);

const chartDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Chart deck",
  slides: [
    {
      layout: "chart",
      title: "Quarterly growth",
      chart: {
        kind: "line",
        labels: ["Q1", "Q2", "Q3", "Q4"],
        series: [
          { name: "Revenue", values: [12, 20, 31, 42] },
          { name: "Cost", values: [8, 11, 18, 24] }
        ],
        unit: "k"
      }
    }
  ]
});
assert.equal(chartDeck.slides[0].chart.kind, "line");
assert.equal(chartDeck.slides[0].chart.series.length, 2);
assert.equal(ppt.validateDeck(chartDeck).ok, true);
const chartHtml = ppt.exportStandalone(chartDeck);
assert.match(chartHtml, /ppt-layout-chart/);
assert.match(chartHtml, /ppt-chart/);
assert.match(chartHtml, /Quarterly growth/);

const canvasDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Canvas deck",
  slides: [
    {
      layout: "hero",
      title: "Moved title",
      canvas: {
        title: { x: 24, y: 36, w: 420, h: 90 }
      }
    }
  ]
});
assert.equal(canvasDeck.slides[0].canvas.title.x, 24);
assert.equal(canvasDeck.slides[0].canvas.title.w, 420);
const canvasHtml = ppt.exportStandalone(canvasDeck);
assert.match(canvasHtml, /"canvas"/);
assert.match(canvasHtml, /data-ppt-path/);
assert.match(canvasHtml, /24/);
assert.match(canvasHtml, /420/);

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
