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
assert.equal(normalizedObjects.length, 4, "normalizeDeck should keep slide.objects");
assert.equal(JSON.stringify(normalizedObjects.map((object) => object.type)), JSON.stringify(["chart", "table", "image", "shape"]));
assert.equal(normalizedObjects[0].data.series[0].values[1], 18);
assert.equal(normalizedObjects[1].data.rows[0][1], "Ready");
assert.equal(normalizedObjects[2].data.fit, "contain");
assert.equal(normalizedObjects[3].data.label, "Callout shape");

const slideNode = ppt.renderSlide(objectDeck.slides[0], objectDeck, { index: 0 });

assert.equal(slideNode.querySelectorAll(".ppt-object").length, 4);
assert.ok(slideNode.querySelector(".ppt-object-chart .ppt-chart-wrap"), "chart object should render a chart DOM subtree");
assert.ok(slideNode.querySelector(".ppt-object-chart .ppt-chart"), "chart object should include svg chart output");
assert.ok(slideNode.querySelector(".ppt-object-table .ppt-table"), "table object should render a table DOM subtree");
assert.equal(slideNode.querySelector(".ppt-object-table td").textContent, "Alpha");
assert.ok(slideNode.querySelector(".ppt-object-image .ppt-media img"), "image object should render an img in media DOM");
assert.equal(slideNode.querySelector(".ppt-object-image .ppt-caption").textContent, "Image object");
assert.ok(slideNode.querySelector(".ppt-object-shape .ppt-shape"), "shape object should render a shape DOM subtree");
assert.equal(slideNode.querySelector(".ppt-object-shape .ppt-shape-text").textContent, "Callout shape");

const standaloneHtml = ppt.exportStandalone(objectDeck);
assert.match(standaloneHtml, /function obj\(o,j,s\)/);
assert.match(standaloneHtml, /function objs\(n,s\)/);
assert.match(standaloneHtml, /objs\(sn,sd\)/);
assert.match(standaloneHtml, /ppt-object ppt-object-/);
assert.match(standaloneHtml, /ty==='image'/);
assert.match(standaloneHtml, /ty==='chart'/);
assert.match(standaloneHtml, /ty==='table'/);
assert.match(standaloneHtml, /function shape\(d,j\)/);
assert.match(standaloneHtml, /ty==='shape'/);
assert.match(standaloneHtml, /else n\.appendChild\(e\('div','ppt-image-placeholder'/);

console.log("object smoke tests passed");
