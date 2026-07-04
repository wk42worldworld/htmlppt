"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const rendererPath = path.join(root, "renderer.js");
const code = fs.readFileSync(rendererPath, "utf8");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const context = { window: {}, console };

vm.runInNewContext(code, context, { filename: rendererPath });

const ppt = context.window.PPTHtml;

assert.equal(ppt.version, "0.1");
assert.ok(Array.isArray(ppt.deckTemplates));
assert.ok(ppt.deckTemplates.length >= 4);
[
  /data-insert="compare" data-variant="decision"/,
  /data-insert="chart" data-variant="line"/,
  /data-insert="chart" data-variant="donut"/,
  /data-insert="table" data-variant="checklist"/,
  /data-insert="cards" data-variant="features"/,
  /data-insert="metrics" data-variant="progress"/,
  /data-insert="timeline" data-variant="process"/
].forEach((pattern) => {
  assert.match(indexHtml, pattern);
});

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
  transition: "push",
  slides: [
    {
      layout: "chart",
      title: "Quarterly growth",
      transition: "zoom",
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
assert.equal(chartDeck.transition, "push");
assert.equal(chartDeck.slides[0].chart.kind, "line");
assert.equal(chartDeck.slides[0].transition, "zoom");
assert.equal(chartDeck.slides[0].chart.series.length, 2);
assert.equal(ppt.validateDeck(chartDeck).ok, true);
const chartHtml = ppt.exportStandalone(chartDeck);
assert.match(chartHtml, /ppt-layout-chart/);
assert.match(chartHtml, /ppt-chart/);
assert.match(chartHtml, /data-transition=push/);
assert.match(chartHtml, /prefers-reduced-motion/);
assert.match(chartHtml, /Quarterly growth/);

const videoDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Video deck",
  slides: [
    {
      layout: "video",
      title: "Product demo",
      video: {
        src: "data:video/mp4;base64,AAAA",
        caption: "Demo clip",
        fit: "contain"
      }
    }
  ]
});
assert.equal(videoDeck.slides[0].layout, "video");
assert.equal(videoDeck.slides[0].video.fit, "contain");
assert.equal(ppt.validateDeck(videoDeck).ok, true);
const videoHtml = ppt.exportStandalone(videoDeck);
assert.match(videoHtml, /ppt-layout-video/);
assert.match(videoHtml, /ppt-video/);
assert.match(videoHtml, /Product demo/);

const audioDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Audio deck",
  slides: [
    {
      layout: "audio",
      title: "Narration",
      audio: {
        src: "data:audio/mpeg;base64,AAAA",
        caption: "Voiceover"
      }
    }
  ]
});
assert.equal(audioDeck.slides[0].layout, "audio");
assert.equal(ppt.validateDeck(audioDeck).ok, true);
const audioHtml = ppt.exportStandalone(audioDeck);
assert.match(audioHtml, /ppt-layout-audio/);
assert.match(audioHtml, /ppt-audio/);
assert.match(audioHtml, /Narration/);

const externalAssetDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "External assets",
  slides: [
    {
      layout: "video",
      title: "Remote media",
      image: { src: "data:image/png;base64,AAAA" },
      video: {
        src: "media/demo.mp4",
        poster: "https://example.com/poster.png"
      },
      audio: { src: "file:///tmp/narration.mp3" }
    }
  ]
});
const externalRefs = ppt.collectExternalAssetReferences(externalAssetDeck);
assert.equal(externalRefs.length, 3);
assert.equal(JSON.stringify(externalRefs.map((item) => item.path)), JSON.stringify([
  "slides[0].video.src",
  "slides[0].video.poster",
  "slides[0].audio.src"
]));
assert.equal(ppt.collectExternalAssetReferences(audioDeck).length, 0);

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

const textBoxDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Text box deck",
  slides: [
    {
      layout: "hero",
      title: "Visible text box",
      textBoxes: [
        { id: "textbox-test", text: "Editable overlay", x: 440, y: 260, w: 360, h: 88 }
      ],
      canvas: {
        "textBoxes.0.text": { x: 12, y: -8, w: 400, h: 100 }
      }
    }
  ]
});
assert.equal(textBoxDeck.slides[0].textBoxes.length, 1);
assert.equal(textBoxDeck.slides[0].textBoxes[0].text, "Editable overlay");
assert.equal(textBoxDeck.slides[0].canvas["textBoxes.0.text"].w, 400);
const textBoxHtml = ppt.exportStandalone(textBoxDeck);
assert.match(textBoxHtml, /ppt-textbox/);
assert.match(textBoxHtml, /Editable overlay/);
assert.match(textBoxHtml, /textBoxes\.0\.text/);

const html = ppt.exportStandalone(ppt.createTemplateDeck("product-pitch"));
assert.match(html, /id="ppt-html-data"/);
assert.match(html, /data-format="ppt\.html"/);
assert.match(html, /single-file-data-uri-assets/);
assert.match(html, /F5/);
assert.match(html, /ArrowDown/);
assert.match(html, /is-ui-hidden/);
assert.match(html, /requestFullscreen/);
assert.match(html, /is-transitioning/);
assert.match(html, /data-transition/);

const fencedDeck = ppt.parseFileText("```json\n" + JSON.stringify(ppt.createTemplateDeck("lesson")) + "\n```");
assert.equal(fencedDeck.title, "课程课件");

console.log("smoke tests passed");
