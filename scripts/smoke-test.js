"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const rendererPath = path.join(root, "renderer.js");
const code = fs.readFileSync(rendererPath, "utf8");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");
const appJsLf = appJs.replace(/\r\n/g, "\n");
const electronMain = fs.readFileSync(path.join(root, "electron/main.js"), "utf8");
const stylesCss = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const releaseWorkflow = fs.readFileSync(path.join(root, ".github", "workflows", "release.yml"), "utf8");
const schema = JSON.parse(fs.readFileSync(path.join(root, "schema", "ppt-html-v0.1.schema.json"), "utf8"));
const context = { window: {}, console };

vm.runInNewContext(code, context, { filename: rendererPath });

const ppt = context.window.PPTHtml;

assert.equal(ppt.version, "0.1");
assert.ok(Array.isArray(ppt.deckTemplates));
assert.ok(ppt.deckTemplates.length >= 10);
assert.equal(typeof ppt.createBlankDeck, "function");
const blankDeck = ppt.createBlankDeck();
assert.equal(blankDeck.slides.length, 1);
assert.equal(blankDeck.slides[0].layout, "text");
assert.equal(blankDeck.slides[0].title, "");
assert.equal(blankDeck.slides[0].subtitle, "");
assert.equal(blankDeck.slides[0].body, "");
assert.equal(blankDeck.slides[0].objects.length, 0);
[
  "investor-pitch",
  "enterprise-proposal",
  "research-brief",
  "product-review",
  "incident-review",
  "marketing-campaign"
].forEach((id) => {
  assert.ok(ppt.deckTemplates.some((template) => template.id === id), `missing template ${id}`);
});
[
  /data-insert="text" data-variant="title"/,
  /data-insert="text" data-variant="subtitle"/,
  /data-insert="text" data-variant="body"/,
  /data-insert="text" data-variant="bullet"/,
  /data-insert="text" data-variant="label"/,
  /data-insert="text" data-variant="box"/,
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
[
  /id="tableAddRowBtn"/,
  /id="objectTableAddRowBtn"/,
  /id="objectDeleteBtn"/,
  /id="presentFullscreenBtn"/,
  /id="styleFontFamilyInput"/,
  /id="zoomOutBtn"/,
  /id="zoomFitBtn"/,
  /id="zoomInBtn"/,
  /id="insertSearchInput"[\s\S]*data-i18n-placeholder="insert\.searchPlaceholder"/,
  /id="insertSearchEmpty"/,
  /class="rail-action"/,
  /id="slideContextMenu"/,
  /id="slideLayoutMenu" hidden/,
  /id="newDeckBtn"[\s\S]*data-i18n="action\.newShort"/,
  /id="templatesBtn"[\s\S]*data-i18n="action\.templatesShort"/,
  /id="templateDialog"[\s\S]*data-i18n="dialog\.templatesHint"/,
  /data-slide-action="duplicate"/,
  /data-slide-action="delete"/,
  /data-context-action="tableInsertRowAbove"/,
  /data-context-action="tableInsertColumnRight"/,
  /data-context-action="tableClearCell"/,
  /id="objectMediaEditor"/,
  /id="objectChartEditor"/,
  /id="objectChartGrid"/,
  /id="objectChartAddLabelBtn"/,
  /id="objectChartAddSeriesBtn"/,
  /id="objectTableEditor"/,
  /id="objectTableGrid"/,
  /id="objectTableGridAddRowBtn"/,
  /id="objectTableGridAddColumnBtn"/,
  /id="objectStructuredEditor"/,
  /id="objectStructuredRowsBlock"/,
  /id="objectStructuredRows"/,
  /id="objectStructuredAddRowBtn"/,
  /id="objectStructuredBulkEditor"/,
  /id="objectStructuredInput"/,
  /id="objectCompareFields"/,
  /id="objectCompareLeftTitleInput"/,
  /id="objectCompareRightTextInput"/,
  /id="objectQuoteFields"/,
  /id="objectQuoteInput"/,
  /id="objectQuoteAuthorInput"/,
  /id="objectShapeFields"/,
  /id="objectShapeKindInput"/,
  /id="objectShapeFillInput"/,
  /id="objectShapeStrokeInput"/,
  /id="objectShapeStrokeWidthInput"/,
  /id="itemsRowsBlock"/,
  /id="itemsRows"/,
  /id="itemsAddRowBtn"/,
  /id="itemsBulkEditor"/,
  /id="cardsRowsBlock"/,
  /id="cardsRows"/,
  /id="cardsAddRowBtn"/,
  /id="cardsBulkEditor"/,
  /id="metricsRowsBlock"/,
  /id="metricsRows"/,
  /id="metricsAddRowBtn"/,
  /id="metricsBulkEditor"/,
  /id="objectLayerList"/,
  /id="copyRepairPromptBtn"/,
  /id="presentFitBtn"/,
  /id="presentShortcutsBtn"/,
  /id="shortcutDialog"/
].forEach((pattern) => {
  assert.match(indexHtml, pattern);
});
[
  "text", "hero", "section", "imageRight", "imageLeft", "imageFull", "imageBackground",
  "compare", "threeCards", "chart", "data", "table", "timeline", "quote", "video",
  "audio", "code", "ending"
].forEach((layout) => {
  assert.match(indexHtml, new RegExp(`data-slide-layout="${layout}"`));
});
[
  /data-insert="chart" data-variant="line"[\s\S]*?#icon-chart-line/,
  /data-insert="chart" data-variant="donut"[\s\S]*?#icon-chart-donut/,
  /data-insert="shape" data-variant="rectangle"[\s\S]*?#icon-shape-rectangle/,
  /data-insert="shape" data-variant="ellipse"[\s\S]*?#icon-shape-ellipse/,
  /data-insert="shape" data-variant="line"[\s\S]*?#icon-shape-line/,
  /data-insert="shape" data-variant="arrow"[\s\S]*?#icon-shape-arrow/,
  /data-insert="shape" data-variant="callout"[\s\S]*?#icon-shape-callout/,
  /data-insert="table" data-variant="compare"[\s\S]*?#icon-table-compare/,
  /data-insert="table" data-variant="checklist"[\s\S]*?#icon-table-checklist/,
  /data-insert="cards" data-variant="features"[\s\S]*?#icon-cards-features/,
  /data-insert="cards" data-variant="prosCons"[\s\S]*?#icon-cards-pros-cons/,
  /data-insert="compare" data-variant="decision"[\s\S]*?#icon-decision/,
  /id="objectBringFrontBtn"[\s\S]*?#icon-layer-front/,
  /id="objectSendBackBtn"[\s\S]*?#icon-layer-back/,
  /id="presentPrevBtn"[\s\S]*?#icon-chevron-left/,
  /id="presentFitBtn"[\s\S]*?#icon-fit-fill/,
  /id="presentShortcutsBtn"[\s\S]*?#icon-keyboard/,
  /id="presentFullscreenBtn"[\s\S]*?#icon-fullscreen/,
  /id="objectLayerList"[\s\S]*data-i18n-group="object\.geometry"/,
  /id="icon-eye"/,
  /id="icon-eye-off"/,
  /id="icon-lock"/,
  /id="icon-unlock"/
].forEach((pattern) => {
  assert.match(indexHtml, pattern);
});
assert.match(appJs, /function createSlideThumbPreview/);
assert.match(appJs, /function updateSlideListSelection/);
{
  const selectSlideSource = appJsLf.match(/function selectSlide[\s\S]*?\n  }\n\n  function focusCurrentSlideThumb/)[0];
  assert.match(selectSlideSource, /updateSlideListSelection\(\)/);
  assert.match(selectSlideSource, /renderCanvas\(\)/);
  assert.doesNotMatch(selectSlideSource, /renderAll\(\)/);
}
assert.match(appJs, /replaceDeck\(PPTHtml\.createBlankDeck\(\)/);
assert.match(appJs, /return PPTHtml\.normalizeDeck\(PPTHtml\.createBlankDeck\(\)\)/);
assert.match(appJs, /function handleCanvasWheel/);
assert.match(appJs, /function fitCanvasToViewport/);
assert.match(appJs, /function refreshSlideThumb/);
assert.match(appJs, /refreshSlideThumb\(currentIndex\)/);
assert.match(appJs, /function updateInsertFilter/);
assert.match(appJs, /function focusInsertSearch/);
assert.match(appJs, /insertSearchInput\.addEventListener\("input", updateInsertFilter\)/);
assert.match(appJs, /key === "\/"[\s\S]*focusInsertSearch\(\)/);
assert.match(stylesCss, /\.insert-search/);
assert.match(stylesCss, /\.insert-empty/);
{
  const objectMutationSource = appJsLf.match(/function commitSelectedObjectMutation[\s\S]*?\n  }\n\n  function commitObjectDataFromPanel/)[0];
  assert.match(objectMutationSource, /renderCanvas\(\)[\s\S]*refreshSlideThumb\(currentIndex\)/);
}
{
  const styleCommitSource = appJsLf.match(/function updateSelectedStyleCommit[\s\S]*?\n  }\n\n  function commitStyleMutation/)[0];
  assert.match(styleCommitSource, /renderCanvas\(\)[\s\S]*refreshSlideThumb\(currentIndex\)/);
}
assert.match(appJs, /function deleteSelectedCanvasContent/);
assert.match(appJs, /function deleteSlideAt/);
assert.match(appJs, /function handleSlideShortcut/);
assert.match(appJs, /function handleSlideContextMenuAction/);
assert.match(appJs, /function showSlideLayoutMenu/);
assert.match(appJs, /function handleSlideLayoutMenuAction/);
assert.match(appJs, /function createSlideForLayout/);
assert.match(appJs, /function structuredObjectEditorSpec/);
assert.match(appJs, /function structuredRowsSpec/);
assert.match(appJs, /function renderStructuredObjectRows/);
assert.match(appJs, /function handleStructuredRowsChange/);
assert.match(appJs, /function mutateSelectedStructuredRows/);
assert.match(appJs, /function bindObjectTextContent/);
assert.match(appJs, /function objectDataPath/);
assert.match(appJs, /function syncSpecialStructuredObjectEditors/);
assert.match(appJs, /function ensureCompareSide/);
assert.match(appJs, /function normalizeObjectShapeKind/);
assert.match(appJs, /function bindSlideRowsEditor/);
assert.match(appJs, /function renderSlideRowsEditor/);
assert.match(appJs, /function handleSlideRowsChange/);
assert.match(appJs, /function mutateSlideRows/);
assert.match(appJs, /function commitSlideRowsMutation/);
assert.match(appJs, /function applyStructuredObjectText/);
assert.match(appJs, /function stringifyStructuredObjectData/);
assert.match(appJs, /bindObjectDataInput\(els\.objectStructuredInput, applyStructuredObjectText\)/);
assert.match(appJs, /bindObjectDataInput\(els\.objectCompareLeftTitleInput/);
assert.match(appJs, /bindObjectDataInput\(els\.objectQuoteInput/);
assert.match(appJs, /bindObjectDataInput\(els\.objectShapeKindInput/);
assert.match(appJs, /objectStructuredRows\.addEventListener\("change", handleStructuredRowsChange\)/);
assert.match(appJs, /objectDataPath\(objectIndex, "cards\." \+ index \+ "\.title"\)/);
assert.match(appJs, /objectDataPath\(objectIndex, "metrics\." \+ index \+ "\.value"\)/);
assert.match(appJs, /objectDataPath\(objectIndex, "items\." \+ index \+ "\.text"\)/);
assert.match(appJs, /objectDataPath\(objectIndex, "quote"\)/);
assert.match(appJs, /objectDataPath\(objectIndex, "text"\)/);
assert.match(appJs, /bindSlideRowsEditor\("items"\)/);
assert.match(appJs, /bindSlideRowsEditor\("cards"\)/);
assert.match(appJs, /bindSlideRowsEditor\("metrics"\)/);
assert.match(appJs, /cards:[\s\S]*dataKey: "cards"[\s\S]*metrics:[\s\S]*dataKey: "metrics"[\s\S]*timeline:[\s\S]*dataKey: "items"/);
assert.match(appJs, /object\.typedStructured/);
assert.match(appJs, /object\.structuredRows/);
assert.match(stylesCss, /\.structured-row-editor/);
assert.match(stylesCss, /\.structured-row/);
assert.match(stylesCss, /\.structured-row-input/);
assert.match(stylesCss, /\.typed-object-fields/);
assert.match(stylesCss, /\.ppt-object \.ppt-shape-text[\s\S]*pointer-events: auto/);
assert.match(code, /function tagObjectContentPaths/);
assert.match(code, /prefix \+ "cards\." \+ index \+ "\.title"/);
assert.match(code, /prefix \+ "metrics\." \+ index \+ "\.value"/);
assert.match(code, /prefix \+ "items\." \+ index \+ "\.text"/);
assert.match(code, /prefix \+ "quote"/);
assert.match(code, /function otp\(n,j,ty\)/);
assert.match(code, /data-object-type',ty/);
assert.match(code, /p\+'cards\.'\+k\+'\.title'/);
assert.match(code, /p\+'metrics\.'\+k\+'\.value'/);
assert.match(code, /p\+'items\.'\+k\+'\.text'/);
assert.match(code, /tbs\(sn,sd\);objs\(sn,sd\);off\(sn,sd\)/);
assert.match(appJs, /addSlideBtn\.addEventListener\("click", function \(\) \{ showSlideLayoutMenuForButton\(els\.addSlideBtn, currentIndex\); \}\)/);
assert.match(appJs, /deck\.slides\.splice\(insertIndex, 0, createSlideForLayout\(settings\.layout, insertIndex\)\)/);
assert.match(appJs, /imageBackground: "image"/);
assert.match(appJs, /data: "metrics"/);
assert.match(appJs, /addSlideAfter\(index, \{ focusThumb: true, layout: layout \}\)/);
assert.match(appJs, /addSlideAfter\(currentIndex/);
assert.match(appJs, /lowerKey === "m"/);
assert.match(appJs, /key === "Escape"[\s\S]*hideSlideLayoutMenu\(\)/);
assert.match(appJs, /function openPresenter\(index\)[\s\S]*hideSlideLayoutMenu\(\)/);
assert.match(appJs, /function selectedExplicitTableInfo/);
assert.match(appJs, /function sameTableScope/);
assert.match(appJs, /function previewCanvasSelectionBox/);
assert.match(appJs, /function createMultiSelectionClipboard/);
assert.match(appJs, /kind: "multi"/);
assert.match(appJs, /function pasteMultiPayload/);
assert.match(appJs, /function hasCopyableCanvasSelection/);
assert.match(appJs, /function startCanvasMarquee/);
assert.match(appJs, /function updateCanvasMarqueePreview/);
assert.match(appJs, /function selectableCanvasPathsInRect/);
assert.match(appJs, /function resolveCanvasSnap/);
assert.match(appJs, /snapDisabled = event\.altKey/);
assert.match(appJs, /function renderCanvasSnapGuides/);
assert.match(appJs, /function renderObjectLayerList/);
assert.match(appJs, /function toggleObjectLocked/);
assert.match(appJs, /function toggleObjectHidden/);
assert.match(appJs, /function isLockedCanvasPath/);
assert.match(appJs, /function isLockedTableInfo/);
assert.match(appJs, /data-object-layer-action/);
assert.match(appJs, /if \(event\.target\.closest\("\[data-object-layer-action\]"\)\) return/);
assert.match(appJs, /delete object\.locked/);
assert.match(appJs, /delete object\.hidden/);
assert.match(appJs, /objectDuplicateBtn\.disabled = !hasObject/);
assert.match(appJs, /hasLocked \|\| geometryCount < 2/);
assert.match(appJs, /hasLocked \|\| geometryCount < 3/);
assert.match(appJs, /hasTable && !hasLockedTable/);
assert.match(appJs, /toast\(t\("toast\.lockedSelection"\)\)/);
assert.match(appJs, /function textBoxPreset/);
assert.match(appJs, /function fontFamilyStack/);
assert.match(appJs, /function syncTypedObjectPanel/);
assert.match(appJs, /function bindObjectDataInput/);
assert.match(appJs, /function renderObjectChartGrid/);
assert.match(appJs, /function renderObjectTableGrid/);
assert.match(appJs, /function handleObjectChartGridPaste/);
assert.match(appJs, /function handleObjectTableGridPaste/);
assert.match(appJs, /function mutateSelectedChartGrid/);
assert.match(appJs, /function mutateSelectedTableGrid/);
assert.match(appJs, /function parseClipboardMatrix/);
assert.match(appJs, /function buildRepairPrompt/);
assert.match(appJs, /function togglePresenterScaleMode/);
assert.match(appJs, /function showShortcutDialog/);
assert.match(appJs, /suppressNextPresenterClick/);
assert.match(appJs, /presenting \? presentIndex : currentIndex/);
assert.match(appJs, /function tableObjectSize/);
assert.match(appJs, /function findObjectPlacement/);
assert.match(appJs, /function fitTableObjectToData/);
assert.match(appJs, /function fitTableObjectForPath/);
assert.match(appJs, /function clampObjectInsideSlide/);
assert.match(appJs, /defaultObjectSize\(objectType, variant, data\)/);
assert.match(appJs, /if \(activeCanvasEdit\) \{[\s\S]*finishCanvasEdit\(true\);[\s\S]*canvasNodeByPath\(nextTargetPath\)/);
assert.match(appJs, /startSelectionBounds/);
assert.match(appJs, /previewOffsets/);
assert.match(appJs, /tableInsertRowAbove/);
assert.match(appJs, /table\.insertColumnRight/);
assert.match(appJs, /bindCanvasComponent\("\.ppt-chart-wrap, \.ppt-chart-empty"/);
assert.match(appJs, /bindStyleInput\(els\.styleFontFamilyInput, "fontFamily"\)/);
assert.match(appJs, /editable: true/);
assert.match(appJs, /canvasZoomMode/);
[
  "insert.text.title",
  "insert.text.subtitle",
  "insert.text.body",
  "insert.text.bullet",
  "insert.text.label",
  "insert.text.box",
  "field.fontFamily",
  "font.display",
  "font.avenir",
  "font.pingfang",
  "font.yahei",
  "font.dengxian",
  "font.simhei",
  "font.simsun",
  "font.fangsong",
  "font.aptos",
  "font.calibri",
  "font.consolas",
  "font.mono"
].forEach((key) => {
  assert.match(appJs, new RegExp(`"${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}"`));
});
[
  /<option value="yahei" data-i18n="font\.yahei">/,
  /<option value="dengxian" data-i18n="font\.dengxian">/,
  /<option value="simhei" data-i18n="font\.simhei">/,
  /<option value="simsun" data-i18n="font\.simsun">/,
  /<option value="fangsong" data-i18n="font\.fangsong">/,
  /<option value="aptos" data-i18n="font\.aptos">/,
  /<option value="calibri" data-i18n="font\.calibri">/
].forEach((pattern) => {
  assert.match(indexHtml, pattern);
});
[
  /yahei: "\\"Microsoft YaHei\\"/,
  /dengxian: "DengXian/,
  /simhei: "SimHei/,
  /simsun: "SimSun/,
  /fangsong: "FangSong/,
  /aptos: "Aptos/,
  /calibri: "Calibri/
].forEach((pattern) => {
  assert.match(appJs, pattern);
});
[
  "aptos",
  "calibri",
  "verdana",
  "tahoma",
  "cambria",
  "dengxian",
  "simhei",
  "simsun",
  "fangsong",
  "noto-sans-cjk",
  "noto-serif-cjk",
  "yu-gothic",
  "meiryo",
  "malgun",
  "courier"
].forEach((token) => {
  assert.ok(
    schema.$defs.styleOverride.properties.fontFamily.enum.includes(token),
    `schema missing font token ${token}`
  );
});
assert.equal(schema.$defs.slideObject.properties.locked.type, "boolean");
assert.equal(schema.$defs.slideObject.properties.hidden.type, "boolean");
const i18nKeys = Array.from(indexHtml.matchAll(/data-i18n(?:-[a-z]+)?="([^"]+)"/g)).map((match) => match[1]);
Array.from(new Set(i18nKeys)).forEach((key) => {
  assert.match(appJs, new RegExp(`"${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}"`), `missing i18n key ${key}`);
});
assert.match(electronMain, /canvasZoomIn/);
assert.match(electronMain, /canvasZoomFit/);
assert.match(electronMain, /Keyboard Shortcuts/);
assert.match(electronMain, /sendCommand\("shortcuts"\)/);
assert.doesNotMatch(electronMain, /role: "zoomIn"/);
assert.match(releaseWorkflow, /node-version: 24/);
assert.match(stylesCss, /\.slide-thumb-preview/);
assert.match(stylesCss, /Thumbnail stability pass/);
assert.match(stylesCss, /\.slide-thumb-frame,[\s\S]*?\.slide-thumb-frame \*/);
assert.match(stylesCss, /\.canvas-zoom-controls/);
assert.match(stylesCss, /button\.icon-button\.labeled-action/);
assert.match(stylesCss, /\.template-grid \{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
assert.match(stylesCss, /\.stage-frame\.is-canvas-moving \[data-canvas-edit\]/);
assert.match(stylesCss, /\.stage-frame \.canvas-marquee-box/);
assert.match(stylesCss, /\.stage-frame \.canvas-snap-guide-x/);
assert.match(stylesCss, /\.stage-frame \.canvas-snap-guide-y/);
assert.match(stylesCss, /\.object-layer-list/);
assert.match(stylesCss, /\.object-layer-row\.is-selected/);
assert.match(stylesCss, /\.ppt-object\.is-canvas-locked/);
assert.match(stylesCss, /\.object-data-grid/);
assert.match(stylesCss, /\.object-grid-table/);
assert.match(stylesCss, /\.object-grid-input:focus/);
assert.match(stylesCss, /\.slide-layout-menu/);
assert.match(stylesCss, /Presenter mobile controls/);
assert.match(stylesCss, /grid-template-columns: 38px minmax\(52px, 1fr\) 38px repeat\(4, 34px\)/);
assert.match(stylesCss, /\.presenter-controls button span/);
assert.match(stylesCss, /contain: layout paint/);
assert.match(stylesCss, /\.stage-frame \.ppt-object-table/);
assert.match(stylesCss, /Layout stability pass/);
assert.match(stylesCss, /grid-template-columns: 228px 88px minmax\(420px, 1fr\) minmax\(300px, 336px\)/);
assert.doesNotMatch(stylesCss, /\.slide-thumb::after/);
assert.match(code, /\.ppt-object-table\{align-content:start;overflow:visible;contain:layout\}/);
assert.match(code, /\.ppt-object \.ppt-table\{width:100%;height:auto;margin:0;table-layout:fixed/);
assert.match(code, /function tableObjectSize/);
assert.match(code, /mode='fit'/);
assert.match(code, /fitb=e\('button','','适合'\)/);
assert.match(code, /k==='m'\|\|k==='M'/);
assert.match(code, /if\(o&&o\.hidden\)return/);

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

const objectValidationDeck = {
  version: "0.1",
  title: "Object validation deck",
  slides: [
    {
      layout: "text",
      title: "Object checks",
      objects: [
        { id: "dup", type: "chart", x: 40, y: 80, w: 420, h: 260, data: { kind: "scatter", labels: ["Q1"], series: [{ name: "Revenue", values: ["bad"] }] } },
        { id: "dup", type: "table", x: 100, y: 120, w: 320, h: 180, data: { columns: ["A", "B"], rows: [["Only one"]] } },
        { id: "local-media", type: "image", x: 1200, y: 20, w: 180, h: 120, data: { src: "/Users/example/image.png" } }
      ]
    }
  ]
};
const objectValidation = ppt.validateDeck(objectValidationDeck);
assert.equal(objectValidation.ok, false);
assert.ok(objectValidation.errors.some((item) => item.path === "slides[0].objects[1].id"));
assert.ok(objectValidation.warnings.some((item) => item.path === "slides[0].objects[0].data.kind"));
assert.ok(objectValidation.warnings.some((item) => item.path === "slides[0].objects[2].data.src"));
assert.ok(objectValidation.tips.some((item) => item.path === "slides[0].objects[1].data.rows[0]"));

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

const styleDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Styled deck",
  slides: [
    {
      layout: "hero",
      title: "Styled title",
      styles: {
        title: {
          fontFamily: "menlo",
          fontSize: 88,
          color: "#ff3366",
          backgroundColor: "#ffffff",
          borderColor: "#111827",
          borderWidth: 2,
          borderRadius: 12,
          opacity: 0.9,
          textAlign: "center",
          fontWeight: "800",
          fontStyle: "italic"
        }
      }
    }
  ]
});
assert.equal(styleDeck.slides[0].styles.title.fontSize, 88);
assert.equal(styleDeck.slides[0].styles.title.fontFamily, "menlo");
assert.equal(styleDeck.slides[0].styles.title.textAlign, "center");
const styleHtml = ppt.exportStandalone(styleDeck);
assert.match(styleHtml, /"styles"/);
assert.match(styleHtml, /"fontFamily": "menlo"/);
assert.match(styleHtml, /"fontSize": 88/);
assert.match(styleHtml, /function sty/);
assert.match(styleHtml, /s\.fontFamily/);
assert.match(styleHtml, /style\.fontSize/);

const extendedFontDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Extended fonts",
  slides: [
    {
      layout: "hero",
      title: "Fonts",
      styles: {
        title: { fontFamily: "aptos" },
        subtitle: { fontFamily: "yahei" },
        body: { fontFamily: "courier" }
      }
    }
  ]
});
assert.equal(extendedFontDeck.slides[0].styles.title.fontFamily, "aptos");
assert.equal(extendedFontDeck.slides[0].styles.subtitle.fontFamily, "yahei");
assert.equal(extendedFontDeck.slides[0].styles.body.fontFamily, "courier");
const extendedFontHtml = ppt.exportStandalone(extendedFontDeck);
assert.match(extendedFontHtml, /"fontFamily": "aptos"/);
assert.match(extendedFontHtml, /Aptos, Calibri/);
assert.match(extendedFontHtml, /Courier New/);

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
assert.match(html, /blankMode/);
assert.match(html, /addJump/);
assert.match(html, /is-blank-black/);

const fencedDeck = ppt.parseFileText("```json\n" + JSON.stringify(ppt.createTemplateDeck("lesson")) + "\n```");
assert.equal(fencedDeck.title, "实战工作坊：用 AI 做用户访谈分析");

const agentCli = path.join(root, "scripts", "agent-deck.js");
const agentTmp = fs.mkdtempSync(path.join(os.tmpdir(), "htmlppt-agent-"));
const agentDeckPath = path.join(agentTmp, "deck.json");
const agentHtmlPath = path.join(agentTmp, "deck.ppt.html");
const agentExtractPath = path.join(agentTmp, "deck.extract.json");
const agentBuiltPath = path.join(agentTmp, "deck.built.ppt.html");
const validAgentDeck = ppt.createTemplateDeck("product-pitch");
fs.writeFileSync(agentDeckPath, JSON.stringify(validAgentDeck, null, 2), "utf8");
fs.writeFileSync(agentHtmlPath, ppt.exportStandalone(validAgentDeck), "utf8");

function runAgentCli(args, options = {}) {
  return childProcess.spawnSync(process.execPath, [agentCli, ...args], {
    cwd: root,
    encoding: "utf8",
    input: options.input || ""
  });
}

const agentValidate = runAgentCli(["validate", agentDeckPath, "--json"]);
assert.equal(agentValidate.status, 0, agentValidate.stderr || agentValidate.stdout);
assert.equal(JSON.parse(agentValidate.stdout).deck.slides, validAgentDeck.slides.length);

const badAgentDeckPath = path.join(agentTmp, "bad.json");
fs.writeFileSync(badAgentDeckPath, JSON.stringify({ title: "Broken", slides: [] }), "utf8");
const badAgentValidate = runAgentCli(["validate", badAgentDeckPath]);
assert.notEqual(badAgentValidate.status, 0);
assert.match(badAgentValidate.stdout, /version 必须是 "0\.1"/);
assert.match(badAgentValidate.stdout, /slides 必须是非空数组/);

const agentExtract = runAgentCli(["extract", agentHtmlPath, agentExtractPath]);
assert.equal(agentExtract.status, 0, agentExtract.stderr || agentExtract.stdout);
assert.equal(JSON.parse(fs.readFileSync(agentExtractPath, "utf8")).title, validAgentDeck.title);

const agentBuild = runAgentCli(["build", agentDeckPath, agentBuiltPath]);
assert.equal(agentBuild.status, 0, agentBuild.stderr || agentBuild.stdout);
assert.match(fs.readFileSync(agentBuiltPath, "utf8"), /id="ppt-html-data"/);

console.log("smoke tests passed");
