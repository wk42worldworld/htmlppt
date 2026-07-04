"use strict";

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { spawnSync } = require("node:child_process");

const rootDir = path.join(__dirname, "..");
const buildDir = path.join(rootDir, "build");
const masterIcon = path.join(buildDir, "icon.png");
const iconSetDir = path.join(buildDir, "icon.iconset");
const icoWorkDir = path.join(buildDir, ".icon-ico");
const size = 1024;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hexColor(value, alpha) {
  var hex = String(value || "").replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
    alpha == null ? 255 : alpha
  ];
}

function mix(a, b, amount) {
  var t = clamp(amount, 0, 1);
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    Math.round((a[3] == null ? 255 : a[3]) + ((b[3] == null ? 255 : b[3]) - (a[3] == null ? 255 : a[3])) * t)
  ];
}

function createCanvas(width, height) {
  return { width, height, data: Buffer.alloc(width * height * 4) };
}

function blendPixel(canvas, x, y, color, coverage) {
  var ix = Math.floor(x);
  var iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= canvas.width || iy >= canvas.height) return;

  var srcAlpha = clamp((color[3] == null ? 255 : color[3]) * (coverage == null ? 1 : coverage), 0, 255) / 255;
  if (srcAlpha <= 0) return;

  var offset = (iy * canvas.width + ix) * 4;
  var dstAlpha = canvas.data[offset + 3] / 255;
  var outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha);

  canvas.data[offset] = Math.round((color[0] * srcAlpha + canvas.data[offset] * dstAlpha * (1 - srcAlpha)) / outAlpha);
  canvas.data[offset + 1] = Math.round((color[1] * srcAlpha + canvas.data[offset + 1] * dstAlpha * (1 - srcAlpha)) / outAlpha);
  canvas.data[offset + 2] = Math.round((color[2] * srcAlpha + canvas.data[offset + 2] * dstAlpha * (1 - srcAlpha)) / outAlpha);
  canvas.data[offset + 3] = Math.round(outAlpha * 255);
}

function roundedRectAlpha(px, py, x, y, width, height, radius) {
  var cx = x + width / 2;
  var cy = y + height / 2;
  var qx = Math.abs(px - cx) - (width / 2 - radius);
  var qy = Math.abs(py - cy) - (height / 2 - radius);
  var outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  var inside = Math.min(Math.max(qx, qy), 0);
  var distance = outside + inside - radius;
  return clamp(0.5 - distance, 0, 1);
}

function drawRoundedRect(canvas, x, y, width, height, radius, color) {
  var left = Math.floor(x - 1);
  var top = Math.floor(y - 1);
  var right = Math.ceil(x + width + 1);
  var bottom = Math.ceil(y + height + 1);

  for (var py = top; py < bottom; py += 1) {
    for (var px = left; px < right; px += 1) {
      var alpha = roundedRectAlpha(px + 0.5, py + 0.5, x, y, width, height, radius);
      if (alpha <= 0) continue;
      var resolved = typeof color === "function" ? color(px + 0.5, py + 0.5) : color;
      blendPixel(canvas, px, py, resolved, alpha);
    }
  }
}

function drawCircle(canvas, cx, cy, radius, color) {
  var left = Math.floor(cx - radius - 1);
  var top = Math.floor(cy - radius - 1);
  var right = Math.ceil(cx + radius + 1);
  var bottom = Math.ceil(cy + radius + 1);

  for (var py = top; py < bottom; py += 1) {
    for (var px = left; px < right; px += 1) {
      var distance = Math.hypot(px + 0.5 - cx, py + 0.5 - cy) - radius;
      var alpha = clamp(0.5 - distance, 0, 1);
      if (alpha > 0) blendPixel(canvas, px, py, color, alpha);
    }
  }
}

function pointLineDistance(px, py, x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var lengthSq = dx * dx + dy * dy;
  var t = lengthSq ? clamp(((px - x1) * dx + (py - y1) * dy) / lengthSq, 0, 1) : 0;
  var lx = x1 + dx * t;
  var ly = y1 + dy * t;
  return Math.hypot(px - lx, py - ly);
}

function drawLine(canvas, x1, y1, x2, y2, width, color) {
  var pad = width / 2 + 2;
  var left = Math.floor(Math.min(x1, x2) - pad);
  var top = Math.floor(Math.min(y1, y2) - pad);
  var right = Math.ceil(Math.max(x1, x2) + pad);
  var bottom = Math.ceil(Math.max(y1, y2) + pad);

  for (var py = top; py < bottom; py += 1) {
    for (var px = left; px < right; px += 1) {
      var distance = pointLineDistance(px + 0.5, py + 0.5, x1, y1, x2, y2);
      var alpha = clamp(width / 2 + 0.5 - distance, 0, 1);
      if (alpha > 0) blendPixel(canvas, px, py, color, alpha);
    }
  }
}

function drawPolygon(canvas, points, color) {
  var xs = points.map(function (p) { return p[0]; });
  var ys = points.map(function (p) { return p[1]; });
  var left = Math.floor(Math.min.apply(null, xs));
  var right = Math.ceil(Math.max.apply(null, xs));
  var top = Math.floor(Math.min.apply(null, ys));
  var bottom = Math.ceil(Math.max.apply(null, ys));

  for (var py = top; py <= bottom; py += 1) {
    for (var px = left; px <= right; px += 1) {
      var inside = false;
      for (var i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        var xi = points[i][0];
        var yi = points[i][1];
        var xj = points[j][0];
        var yj = points[j][1];
        var intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
        if (intersects) inside = !inside;
      }
      if (inside) blendPixel(canvas, px, py, color, 1);
    }
  }
}

function renderIcon() {
  var canvas = createCanvas(size, size);
  var deep = hexColor("#121a23");
  var teal = hexColor("#0f8b8d");
  var blue = hexColor("#356dff");
  var paper = hexColor("#f8fbff");
  var ink = hexColor("#17202a");
  var orange = hexColor("#ffb000");

  drawRoundedRect(canvas, 52, 52, 920, 920, 196, function (px, py) {
    var diagonal = (px + py) / (size * 2);
    var sweep = clamp((px - 210) / 840, 0, 1);
    return mix(mix(deep, teal, diagonal * 0.95), blue, sweep * 0.2);
  });

  drawRoundedRect(canvas, 184, 196, 676, 560, 80, [0, 0, 0, 42]);
  drawRoundedRect(canvas, 170, 170, 684, 560, 76, paper);
  drawRoundedRect(canvas, 226, 224, 572, 88, 32, teal);
  drawCircle(canvas, 270, 268, 12, hexColor("#dff7f2"));
  drawCircle(canvas, 314, 268, 12, hexColor("#b7f78b"));
  drawCircle(canvas, 358, 268, 12, hexColor("#ffcf54"));

  drawRoundedRect(canvas, 236, 358, 404, 250, 34, hexColor("#edf3fa"));
  drawLine(canvas, 382, 414, 304, 486, 42, ink);
  drawLine(canvas, 304, 486, 382, 558, 42, ink);
  drawLine(canvas, 512, 414, 590, 486, 42, ink);
  drawLine(canvas, 590, 486, 512, 558, 42, ink);
  drawLine(canvas, 460, 570, 508, 402, 34, hexColor("#0f8b8d"));

  drawPolygon(canvas, [[680, 424], [790, 492], [680, 560]], orange);
  drawRoundedRect(canvas, 622, 616, 174, 46, 23, hexColor("#eaf2ff"));
  drawRoundedRect(canvas, 656, 633, 32, 12, 6, teal);
  drawRoundedRect(canvas, 704, 633, 32, 12, 6, blue);
  drawRoundedRect(canvas, 752, 633, 20, 12, 6, orange);

  return canvas;
}

function makeCrcTable() {
  var table = [];
  for (var n = 0; n < 256; n += 1) {
    var c = n;
    for (var k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(buffer) {
  var crc = 0xffffffff;
  for (var i = 0; i < buffer.length; i += 1) {
    crc = crcTable[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  var typeBuffer = Buffer.from(type, "ascii");
  var length = Buffer.alloc(4);
  var crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(canvas) {
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(canvas.width, 0);
  ihdr.writeUInt32BE(canvas.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  var stride = canvas.width * 4;
  var raw = Buffer.alloc((stride + 1) * canvas.height);
  for (var y = 0; y < canvas.height; y += 1) {
    var rowStart = y * (stride + 1);
    raw[rowStart] = 0;
    canvas.data.copy(raw, rowStart + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function run(command, args) {
  var result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(command + " exited with " + result.status);
}

function resizePng(input, output, targetSize) {
  run("sips", ["-s", "format", "png", "-z", String(targetSize), String(targetSize), input, "--out", output]);
}

function makeIcns() {
  fs.rmSync(iconSetDir, { recursive: true, force: true });
  fs.mkdirSync(iconSetDir, { recursive: true });

  [
    ["icon_16x16.png", 16],
    ["icon_16x16@2x.png", 32],
    ["icon_32x32.png", 32],
    ["icon_32x32@2x.png", 64],
    ["icon_128x128.png", 128],
    ["icon_128x128@2x.png", 256],
    ["icon_256x256.png", 256],
    ["icon_256x256@2x.png", 512],
    ["icon_512x512.png", 512],
    ["icon_512x512@2x.png", 1024]
  ].forEach(function (entry) {
    resizePng(masterIcon, path.join(iconSetDir, entry[0]), entry[1]);
  });

  run("iconutil", ["-c", "icns", iconSetDir, "-o", path.join(buildDir, "icon.icns")]);
  fs.rmSync(iconSetDir, { recursive: true, force: true });
}

function makeIco() {
  fs.rmSync(icoWorkDir, { recursive: true, force: true });
  fs.mkdirSync(icoWorkDir, { recursive: true });

  var entries = [16, 32, 48, 64, 128, 256].map(function (targetSize) {
    var output = path.join(icoWorkDir, "icon-" + targetSize + ".png");
    resizePng(masterIcon, output, targetSize);
    return { size: targetSize, data: fs.readFileSync(output) };
  });

  var header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  var directory = Buffer.alloc(entries.length * 16);
  var offset = 6 + directory.length;
  entries.forEach(function (entry, index) {
    var start = index * 16;
    directory[start] = entry.size === 256 ? 0 : entry.size;
    directory[start + 1] = entry.size === 256 ? 0 : entry.size;
    directory[start + 2] = 0;
    directory[start + 3] = 0;
    directory.writeUInt16LE(1, start + 4);
    directory.writeUInt16LE(32, start + 6);
    directory.writeUInt32LE(entry.data.length, start + 8);
    directory.writeUInt32LE(offset, start + 12);
    offset += entry.data.length;
  });

  fs.writeFileSync(path.join(buildDir, "icon.ico"), Buffer.concat([header, directory].concat(entries.map(function (entry) {
    return entry.data;
  }))));
  fs.rmSync(icoWorkDir, { recursive: true, force: true });
}

fs.mkdirSync(buildDir, { recursive: true });
fs.writeFileSync(masterIcon, encodePng(renderIcon()));
makeIcns();
makeIco();
console.log("Generated build/icon.png, build/icon.icns, and build/icon.ico");
