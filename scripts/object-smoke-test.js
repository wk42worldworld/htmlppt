"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const rendererPath = path.join(root, "renderer.js");

class FakeClassList {
  constructor(node) {
    this.node = node;
  }

  add(...tokens) {
    const classes = new Set(this.node.className.split(/\s+/).filter(Boolean));
    tokens.forEach((token) => classes.add(token));
    this.node.className = Array.from(classes).join(" ");
  }

  remove(...tokens) {
    const removeSet = new Set(tokens);
    this.node.className = this.node.className
      .split(/\s+/)
      .filter((token) => token && !removeSet.has(token))
      .join(" ");
  }

  contains(token) {
    return this.node.className.split(/\s+/).includes(token);
  }
}

class FakeElement {
  constructor(tagName) {
    this.tagName = String(tagName).toLowerCase();
    this.children = [];
    this.parentNode = null;
    this.attributes = {};
    this.style = {};
    this.className = "";
    this.classList = new FakeClassList(this);
    this.id = "";
    this._textContent = "";
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    const stringValue = String(value);
    this.attributes[name] = stringValue;
    if (name === "class") this.className = stringValue;
    if (name === "id") this.id = stringValue;
  }

  getAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attributes, name)
      ? this.attributes[name]
      : null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    return selector
      .trim()
      .split(/\s+/)
      .reduce((contexts, part) => {
        const matches = [];
        contexts.forEach((context) => {
          context.descendants().forEach((node) => {
            if (node.matches(part)) matches.push(node);
          });
        });
        return matches;
      }, [this]);
  }

  descendants() {
    const nodes = [];
    this.children.forEach((child) => {
      nodes.push(child);
      nodes.push(...child.descendants());
    });
    return nodes;
  }

  matches(selector) {
    if (selector.startsWith(".")) {
      return this.classList.contains(selector.slice(1));
    }
    if (selector.startsWith("[") && selector.endsWith("]")) {
      const attributeName = selector.slice(1, -1);
      return this.getAttribute(attributeName) != null;
    }
    return this.tagName === selector.toLowerCase();
  }

  set textContent(value) {
    this._textContent = String(value);
    this.children = [];
  }

  get textContent() {
    return this._textContent + this.children.map((child) => child.textContent).join("");
  }
}

class FakeDocument {
  constructor() {
    this.head = new FakeElement("head");
    this.body = new FakeElement("body");
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }

  createElementNS(_namespace, tagName) {
    return new FakeElement(tagName);
  }

  getElementById(id) {
    return [this.head, this.body]
      .flatMap((node) => [node, ...node.descendants()])
      .find((node) => node.id === id || node.getAttribute("id") === id) || null;
  }
}

function loadRendererWithFakeDom() {
  const document = new FakeDocument();
  const window = {
    getComputedStyle(node) {
      return {
        backgroundColor: node.style.backgroundColor || "",
        position: node.style.position || "static"
      };
    }
  };
  const context = { console, document, window };

  vm.runInNewContext(fs.readFileSync(rendererPath, "utf8"), context, { filename: rendererPath });

  return {
    document,
    ppt: context.window.PPTHtml
  };
}

const { ppt } = loadRendererWithFakeDom();

const objectDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Object smoke deck",
  slides: [
    {
      layout: "text",
      title: "Objects render",
      body: "The renderer should preserve and render overlay objects.",
      objects: [
        {
          id: "chart-object",
          type: "chart",
          locked: true,
          x: 40,
          y: 80,
          w: 420,
          h: 260,
          data: {
            kind: "bar",
            labels: ["Q1", "Q2"],
            series: [{ name: "Revenue", values: [10, 18] }],
            unit: "k"
          }
        },
        {
          id: "hidden-object",
          type: "shape",
          hidden: true,
          x: 460,
          y: 360,
          w: 180,
          h: 90,
          data: { label: "Hidden shape" }
        },
        {
          id: "table-object",
          type: "table",
          x: 500,
          y: 80,
          w: 380,
          h: 220,
          data: {
            columns: ["Name", "Status"],
            rows: [["Alpha", "Ready"]]
          }
        },
        {
          id: "image-object",
          type: "image",
          x: 40,
          y: 380,
          w: 240,
          h: 150,
          data: {
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
            alt: "Inline object image",
            caption: "Image object",
            fit: "contain"
          }
        },
        {
          id: "shape-object",
          type: "shape",
          x: 320,
          y: 380,
          w: 220,
          h: 120,
          data: { label: "Callout shape" }
        }
      ]
    }
  ]
});

const normalizedObjects = objectDeck.slides[0].objects;
assert.equal(normalizedObjects.length, 5, "normalizeDeck should keep slide.objects");
assert.equal(JSON.stringify(normalizedObjects.map((object) => object.type)), JSON.stringify(["chart", "shape", "table", "image", "shape"]));
assert.equal(normalizedObjects[0].locked, true);
assert.equal(normalizedObjects[1].hidden, true);
assert.equal(normalizedObjects[0].data.series[0].values[1], 18);
assert.equal(normalizedObjects[2].data.rows[0][1], "Ready");
assert.equal(normalizedObjects[3].data.fit, "contain");
assert.equal(normalizedObjects[4].data.label, "Callout shape");

const slideNode = ppt.renderSlide(objectDeck.slides[0], objectDeck, { index: 0 });

assert.equal(slideNode.querySelectorAll(".ppt-object").length, 4);
assert.ok(slideNode.querySelector(".ppt-object-chart .ppt-chart-wrap"), "chart object should render a chart DOM subtree");
assert.ok(slideNode.querySelector(".ppt-object-chart .ppt-chart"), "chart object should include svg chart output");
assert.equal(slideNode.querySelector(".ppt-object-chart").getAttribute("data-object-locked"), "true");
assert.ok(slideNode.querySelector(".ppt-object-table .ppt-table"), "table object should render a table DOM subtree");
assert.equal(slideNode.querySelector(".ppt-object-table td").textContent, "Alpha");
assert.equal(slideNode.querySelector(".ppt-object-table").getAttribute("data-object-index"), "2");
assert.equal(
  slideNode.querySelector(".ppt-object-table th").getAttribute("data-ppt-path"),
  "objects.2.data.columns.0",
  "object table header should use an object-scoped edit path"
);
assert.equal(
  slideNode.querySelector(".ppt-object-table td").getAttribute("data-ppt-path"),
  "objects.2.data.rows.0.0",
  "object table cell should use an object-scoped edit path"
);
assert.ok(slideNode.querySelector(".ppt-object-image .ppt-media img"), "image object should render an img in media DOM");
assert.equal(slideNode.querySelector(".ppt-object-image .ppt-caption").textContent, "Image object");
assert.ok(slideNode.querySelector(".ppt-object-shape .ppt-shape"), "shape object should render a shape DOM subtree");
assert.equal(slideNode.querySelector(".ppt-object-shape .ppt-shape-text").textContent, "Callout shape");
assert.equal(slideNode.textContent.includes("Hidden shape"), false, "hidden objects should not render on slides");

const standaloneHtml = ppt.exportStandalone(objectDeck);
assert.match(standaloneHtml, /function obj\(o,j,s\)/);
assert.match(standaloneHtml, /function objs\(n,s\)/);
assert.match(standaloneHtml, /if\(o&&o\.hidden\)return/);
assert.match(standaloneHtml, /objs\(sn,sd\)/);
assert.match(standaloneHtml, /ppt-object ppt-object-/);
assert.match(standaloneHtml, /ty==='image'/);
assert.match(standaloneHtml, /ty==='chart'/);
assert.match(standaloneHtml, /ty==='table'/);
assert.match(standaloneHtml, /function shape\(d,j\)/);
assert.match(standaloneHtml, /ty==='shape'/);
assert.match(standaloneHtml, /else n\.appendChild\(e\('div','ppt-image-placeholder'/);

const emptyTextBoxDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Empty text box deck",
  slides: [
    {
      layout: "text",
      title: "",
      textBoxes: [
        { id: "empty-textbox", text: "", x: 80, y: 120, w: 220, h: 72 }
      ]
    }
  ]
});
assert.equal(emptyTextBoxDeck.slides[0].title, "", "explicitly empty titles should stay empty after normalizeDeck");

const editableEmptySlide = ppt.renderSlide(emptyTextBoxDeck.slides[0], emptyTextBoxDeck, { index: 0, editable: true });
const editableEmptyBox = editableEmptySlide.querySelector(".ppt-textbox");
assert.ok(editableEmptyBox, "editable render should keep an empty textbox selectable");
assert.equal(editableEmptyBox.textContent, "");
assert.equal(editableEmptyBox.getAttribute("data-placeholder"), "Text");
assert.equal(editableEmptyBox.getAttribute("data-ppt-path"), "textBoxes.0.text");
assert.ok(editableEmptyBox.classList.contains("is-empty-textbox"));

const readonlyEmptySlide = ppt.renderSlide(emptyTextBoxDeck.slides[0], emptyTextBoxDeck, { index: 0 });
assert.equal(readonlyEmptySlide.querySelectorAll(".ppt-textbox").length, 0, "export/player render should still hide empty textboxes");

const emptyChartDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Empty chart deck",
  slides: [
    {
      layout: "chart",
      title: "Chart placeholder",
      chart: { kind: "bar", labels: [], series: [] }
    }
  ]
});
const emptyChartNode = ppt.renderSlide(emptyChartDeck.slides[0], emptyChartDeck, { index: 0 }).querySelector(".ppt-chart-empty");
assert.ok(emptyChartNode, "empty chart should render a selectable placeholder");
assert.equal(emptyChartNode.getAttribute("data-ppt-path"), "chart");

const largeTableRows = Array.from({ length: 10 }, (_item, index) => [`Row ${index + 1}`, `Value ${index + 1}`]);
const largeTableDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Large table deck",
  slides: [
    {
      layout: "table",
      title: "Full table",
      table: {
        columns: ["Name", "Value"],
        rows: largeTableRows
      },
      objects: [
        {
          id: "large-object-table",
          type: "table",
          x: 80,
          y: 100,
          w: 520,
          h: 360,
          data: {
            columns: ["Name", "Value"],
            rows: largeTableRows
          }
        }
      ]
    }
  ]
});
const largeTableNode = ppt.renderSlide(largeTableDeck.slides[0], largeTableDeck, { index: 0 });
assert.equal(
  largeTableNode.querySelectorAll(".ppt-object-table tbody tr").length,
  10,
  "object table rendering should not truncate rows"
);
assert.equal(
  largeTableNode.querySelectorAll(".ppt-table tbody tr").length,
  20,
  "page and object table rendering should keep all rows"
);
assert.ok(largeTableNode.textContent.includes("Row 10"), "page table rendering should include the last row");
const largeTableStandalone = ppt.exportStandalone(largeTableDeck);
assert.match(largeTableStandalone, /arr\(t\.rows\)\.forEach/);
assert.match(largeTableStandalone, /arr\(\(s\.table\|\|\{\}\)\.rows\)\.forEach/);
assert.doesNotMatch(largeTableStandalone, /arr\(t\.rows\)\.slice\(0,8\)/);
assert.doesNotMatch(largeTableStandalone, /arr\(\(s\.table\|\|\{\}\)\.rows\)\.slice\(0,6\)/);

const defaultSizedTableDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Default object sizing",
  slides: [
    {
      layout: "text",
      title: "Object table",
      objects: [
        {
          id: "default-table",
          type: "table",
          data: {
            columns: ["Dimension", "Option A", "Option B", "Recommendation"],
            rows: [
              ["Cost", "Low", "Medium", "Option A"],
              ["Speed", "Fast", "Medium", "Option A"],
              ["Scale", "Medium", "High", "Option B"]
            ]
          }
        }
      ]
    }
  ]
});
const defaultSizedTableNode = ppt.renderSlide(defaultSizedTableDeck.slides[0], defaultSizedTableDeck, { index: 0 })
  .querySelector(".ppt-object-table");
const defaultTableWidth = Number.parseInt(defaultSizedTableNode.style.width, 10);
const defaultTableHeight = Number.parseInt(defaultSizedTableNode.style.height, 10);
assert.ok(defaultTableWidth >= 720, "default table object should be wide enough for four columns");
assert.ok(defaultTableHeight >= 200, "default table object should be tall enough for header and rows");
assert.ok(defaultTableHeight <= 260, "default table object should not reserve a large empty box for a short table");

const longTextTableDeck = ppt.normalizeDeck({
  version: "0.1",
  title: "Long cell sizing",
  slides: [
    {
      layout: "text",
      title: "Long table",
      objects: [
        {
          id: "long-table",
          type: "table",
          data: {
            columns: ["Decision", "Owner"],
            rows: [
              ["A deliberately long table cell should make the default object taller instead of clipping content", "Product"]
            ]
          }
        }
      ]
    }
  ]
});
const longTextTableNode = ppt.renderSlide(longTextTableDeck.slides[0], longTextTableDeck, { index: 0 })
  .querySelector(".ppt-object-table");
assert.ok(
  Number.parseInt(longTextTableNode.style.height, 10) > defaultTableHeight,
  "long table content should increase the default object height"
);

console.log("object smoke tests passed");
