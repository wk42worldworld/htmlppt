(function () {
  "use strict";

  var FORMAT_VERSION = "0.1";
  var BASE_WIDTH = 1280;
  var BASE_HEIGHT = 720;
  var THEMES = ["paper", "launch", "studio", "boardroom"];
  var CHART_KINDS = ["bar", "line", "donut"];

  var LAYOUTS = [
    ["hero", "封面"],
    ["section", "章节"],
    ["text", "文本"],
    ["imageRight", "左文右图"],
    ["imageLeft", "左图右文"],
    ["imageFull", "全屏图片"],
    ["imageBackground", "背景图文"],
    ["compare", "对比"],
    ["threeCards", "三卡片"],
    ["quote", "引用"],
    ["timeline", "时间线"],
    ["data", "数据"],
    ["chart", "图表"],
    ["video", "视频"],
    ["audio", "音频"],
    ["table", "表格"],
    ["code", "代码"],
    ["ending", "结束"]
  ];

  var SLIDE_CSS = [
    ".ppt-slide{box-sizing:border-box;position:relative;overflow:hidden;width:1280px;height:720px;padding:72px 86px;background:var(--ppt-bg);color:var(--ppt-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0;box-shadow:0 20px 70px rgba(18,24,38,.18)}",
    ".ppt-slide *{box-sizing:border-box}",
    ".ppt-slide h1,.ppt-slide h2,.ppt-slide h3,.ppt-slide p{margin:0}",
    ".ppt-theme-paper{--ppt-bg:#f7f7f2;--ppt-surface:#ffffff;--ppt-muted:#6d716f;--ppt-text:#1f2725;--ppt-line:#d9ddd5;--ppt-accent:#0f8b8d;--ppt-accent-2:#df4f3f;--ppt-strong:#101614}",
    ".ppt-theme-launch{--ppt-bg:#151515;--ppt-surface:#232323;--ppt-muted:#b6b1a8;--ppt-text:#f5f1e8;--ppt-line:#3c3a36;--ppt-accent:#ffb000;--ppt-accent-2:#41c7b9;--ppt-strong:#fff9ed}",
    ".ppt-theme-studio{--ppt-bg:#f1f3f5;--ppt-surface:#ffffff;--ppt-muted:#65707a;--ppt-text:#20252b;--ppt-line:#cfd6dc;--ppt-accent:#356dff;--ppt-accent-2:#ec6f43;--ppt-strong:#11161c}",
    ".ppt-theme-boardroom{--ppt-bg:#f8f8f8;--ppt-surface:#ffffff;--ppt-muted:#5f6670;--ppt-text:#1b2330;--ppt-line:#d7dce2;--ppt-accent:#0d6b57;--ppt-accent-2:#b84b36;--ppt-strong:#101722}",
    ".ppt-kicker{display:inline-flex;align-items:center;min-height:34px;padding:0 14px;border:1px solid var(--ppt-line);border-radius:6px;color:var(--ppt-accent);font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}",
    ".ppt-title{max-width:980px;color:var(--ppt-strong);font-size:66px;line-height:1.02;font-weight:860;letter-spacing:0}",
    ".ppt-subtitle{max-width:820px;color:var(--ppt-muted);font-size:29px;line-height:1.36;font-weight:500}",
    ".ppt-body{max-width:790px;color:var(--ppt-text);font-size:27px;line-height:1.52;white-space:pre-wrap}",
    ".ppt-list{display:grid;gap:18px;margin:0;padding:0;list-style:none}",
    ".ppt-list li{position:relative;padding-left:34px;color:var(--ppt-text);font-size:27px;line-height:1.38}",
    ".ppt-list li:before{content:'';position:absolute;left:0;top:14px;width:12px;height:12px;border-radius:50%;background:var(--ppt-accent)}",
    ".ppt-textbox{position:absolute;z-index:7;padding:14px 16px;border:1px solid var(--ppt-line);border-radius:8px;background:rgba(255,255,255,.88);color:var(--ppt-text);font-size:28px;line-height:1.26;font-weight:650;white-space:pre-wrap;box-shadow:0 14px 34px rgba(18,24,38,.14);backdrop-filter:blur(8px)}",
    ".ppt-theme-launch .ppt-textbox{background:rgba(35,35,35,.86);color:var(--ppt-text);box-shadow:0 14px 34px rgba(0,0,0,.28)}",
    ".ppt-media{position:relative;overflow:hidden;margin:0;border-radius:8px;background:var(--ppt-surface);border:1px solid var(--ppt-line);min-height:260px}",
    ".ppt-media img{display:block;width:100%;height:100%;object-fit:cover}",
    ".ppt-media[data-fit='contain'] img{object-fit:contain;background:var(--ppt-surface)}",
    ".ppt-caption{position:absolute;left:18px;right:18px;bottom:14px;padding:8px 10px;border-radius:6px;background:rgba(0,0,0,.48);color:#fff;font-size:17px;line-height:1.3}",
    ".ppt-image-placeholder{display:grid;place-items:center;width:100%;height:100%;min-height:360px;color:var(--ppt-muted);font-size:22px;background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(0,0,0,.04))}",
    ".ppt-layout-video{display:grid;grid-template-rows:auto minmax(0,1fr);gap:24px}",
    ".ppt-layout-video .ppt-content-stack{max-width:980px}",
    ".ppt-video{position:relative;overflow:hidden;margin:0;border-radius:8px;background:#0f1216;border:1px solid var(--ppt-line);min-height:400px}",
    ".ppt-video video{display:block;width:100%;height:100%;min-height:400px;object-fit:cover;background:#0f1216}",
    ".ppt-video[data-fit='contain'] video{object-fit:contain}",
    ".ppt-video-placeholder{display:grid;place-items:center;width:100%;height:100%;min-height:400px;color:var(--ppt-muted);font-size:22px;background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(0,0,0,.2))}",
    ".ppt-layout-audio{display:grid;grid-template-rows:auto minmax(0,1fr);gap:30px}",
    ".ppt-layout-audio .ppt-content-stack{max-width:980px}",
    ".ppt-audio{display:grid;align-content:center;gap:22px;margin:0;padding:42px;border-radius:8px;background:var(--ppt-surface);border:1px solid var(--ppt-line);min-height:320px}",
    ".ppt-audio audio{display:block;width:100%}",
    ".ppt-audio-placeholder{display:grid;place-items:center;min-height:110px;border:1px dashed var(--ppt-line);border-radius:8px;color:var(--ppt-muted);font-size:22px;background:rgba(0,0,0,.03)}",
    ".ppt-audio .ppt-caption{position:static;display:inline-flex;justify-self:start;max-width:100%;background:rgba(0,0,0,.06);color:var(--ppt-muted)}",
    ".ppt-layout-hero{display:flex;flex-direction:column;justify-content:center;gap:28px}",
    ".ppt-layout-hero .ppt-title{font-size:82px;max-width:1040px}",
    ".ppt-layout-hero .ppt-subtitle{font-size:32px;max-width:860px}",
    ".ppt-hero-image{position:absolute;right:72px;bottom:64px;width:360px;height:230px;opacity:.94}",
    ".ppt-layout-section{display:grid;grid-template-columns:300px 1fr;align-items:center;gap:58px}",
    ".ppt-section-number{font-size:158px;font-weight:900;color:var(--ppt-accent);line-height:1}",
    ".ppt-layout-text{display:grid;grid-template-rows:auto auto 1fr;gap:28px}",
    ".ppt-text-flow{display:grid;grid-template-columns:1fr 420px;gap:42px;align-items:start}",
    ".ppt-layout-imageRight,.ppt-layout-imageLeft{display:grid;grid-template-columns:1fr 480px;gap:58px;align-items:center}",
    ".ppt-layout-imageLeft{grid-template-columns:480px 1fr}",
    ".ppt-content-stack{display:flex;flex-direction:column;gap:24px}",
    ".ppt-layout-imageRight .ppt-media,.ppt-layout-imageLeft .ppt-media{height:470px}",
    ".ppt-layout-imageFull{padding:0}",
    ".ppt-layout-imageFull .ppt-full-media{position:absolute;inset:0;border:0;border-radius:0;min-height:0}",
    ".ppt-layout-imageFull .ppt-image-overlay{position:absolute;left:72px;bottom:72px;max-width:760px;padding:28px 32px;border-radius:8px;background:rgba(16,18,20,.68);backdrop-filter:blur(10px)}",
    ".ppt-layout-imageFull .ppt-image-overlay .ppt-title{color:#fff;font-size:54px}",
    ".ppt-layout-imageFull .ppt-image-overlay .ppt-subtitle{color:rgba(255,255,255,.82);font-size:25px}",
    ".ppt-layout-imageBackground{display:flex;align-items:center}",
    ".ppt-background-media{position:absolute;inset:0;border:0;border-radius:0;min-height:0}",
    ".ppt-background-media:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,12,.78),rgba(8,10,12,.34),rgba(8,10,12,.08))}",
    ".ppt-layout-imageBackground .ppt-content-stack{position:relative;z-index:1;max-width:760px;padding:34px;border-radius:8px;background:rgba(16,18,20,.58);backdrop-filter:blur(10px)}",
    ".ppt-layout-imageBackground .ppt-title,.ppt-layout-imageBackground .ppt-body{color:#fff}",
    ".ppt-layout-imageBackground .ppt-subtitle{color:rgba(255,255,255,.82)}",
    ".ppt-layout-compare{display:flex;flex-direction:column;gap:34px}",
    ".ppt-compare-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}",
    ".ppt-compare-card{min-height:350px;padding:34px;border-radius:8px;background:var(--ppt-surface);border:1px solid var(--ppt-line)}",
    ".ppt-compare-card h2{margin-bottom:18px;color:var(--ppt-strong);font-size:34px}",
    ".ppt-compare-card p{color:var(--ppt-muted);font-size:28px;line-height:1.42;white-space:pre-wrap}",
    ".ppt-card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:34px}",
    ".ppt-card{min-height:305px;padding:30px;border-radius:8px;background:var(--ppt-surface);border:1px solid var(--ppt-line)}",
    ".ppt-card h2{margin-bottom:18px;color:var(--ppt-strong);font-size:32px;line-height:1.15}",
    ".ppt-card p{color:var(--ppt-muted);font-size:23px;line-height:1.42;white-space:pre-wrap}",
    ".ppt-layout-quote{display:flex;flex-direction:column;justify-content:center;gap:32px}",
    ".ppt-quote-mark{color:var(--ppt-accent);font-size:84px;line-height:.6;font-weight:900}",
    ".ppt-quote{max-width:980px;color:var(--ppt-strong);font-size:54px;line-height:1.18;font-weight:780}",
    ".ppt-author{color:var(--ppt-muted);font-size:25px}",
    ".ppt-timeline{display:grid;gap:18px;margin-top:30px}",
    ".ppt-time-item{display:grid;grid-template-columns:210px 1fr;gap:26px;padding:18px 0;border-top:1px solid var(--ppt-line)}",
    ".ppt-time-item h2{color:var(--ppt-accent);font-size:28px}",
    ".ppt-time-item p{color:var(--ppt-text);font-size:25px;line-height:1.4}",
    ".ppt-metric-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:36px}",
    ".ppt-metric{padding:30px;border-radius:8px;background:var(--ppt-surface);border:1px solid var(--ppt-line)}",
    ".ppt-metric strong{display:block;color:var(--ppt-accent);font-size:58px;line-height:1;font-weight:900}",
    ".ppt-metric span{display:block;margin-top:14px;color:var(--ppt-strong);font-size:25px;font-weight:760}",
    ".ppt-metric p{margin-top:12px;color:var(--ppt-muted);font-size:20px;line-height:1.35}",
    ".ppt-layout-chart{display:grid;grid-template-rows:auto minmax(0,1fr);gap:24px}",
    ".ppt-layout-chart .ppt-content-stack{max-width:980px}",
    ".ppt-chart-wrap{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:24px;align-items:stretch;min-height:386px}",
    ".ppt-chart{width:100%;height:100%;min-height:360px;border:1px solid var(--ppt-line);border-radius:8px;background:var(--ppt-surface);overflow:visible}",
    ".ppt-chart-grid{stroke:var(--ppt-line);stroke-width:1;opacity:.55}",
    ".ppt-chart-axis{stroke:var(--ppt-line);stroke-width:2}",
    ".ppt-chart-label{fill:var(--ppt-muted);font-size:17px;font-weight:760}",
    ".ppt-chart-value{fill:var(--ppt-strong);font-size:22px;font-weight:840}",
    ".ppt-chart-series-0{--ppt-chart-color:var(--ppt-accent);fill:var(--ppt-chart-color);stroke:var(--ppt-chart-color)}",
    ".ppt-chart-series-1{--ppt-chart-color:var(--ppt-accent-2);fill:var(--ppt-chart-color);stroke:var(--ppt-chart-color)}",
    ".ppt-chart-series-2{--ppt-chart-color:#8f7cf6;fill:var(--ppt-chart-color);stroke:var(--ppt-chart-color)}",
    ".ppt-chart-series-3{--ppt-chart-color:#35a05b;fill:var(--ppt-chart-color);stroke:var(--ppt-chart-color)}",
    ".ppt-chart-line{fill:none;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}",
    ".ppt-chart-point{stroke:var(--ppt-surface);stroke-width:4}",
    ".ppt-chart-ring{fill:none;stroke-width:44}",
    ".ppt-chart-legend{display:flex;flex-direction:column;gap:12px;align-self:center}",
    ".ppt-chart-legend-item{display:grid;grid-template-columns:14px 1fr;gap:10px;align-items:center;min-height:36px}",
    ".ppt-chart-swatch{width:14px;height:14px;border-radius:4px;background:var(--ppt-chart-color)}",
    ".ppt-chart-legend-item strong{display:block;color:var(--ppt-strong);font-size:20px;line-height:1.2}",
    ".ppt-chart-legend-item small{display:block;margin-top:3px;color:var(--ppt-muted);font-size:16px}",
    ".ppt-chart-empty{display:grid;place-items:center;min-height:360px;border:1px dashed var(--ppt-line);border-radius:8px;color:var(--ppt-muted);font-size:24px;background:var(--ppt-surface)}",
    ".ppt-table{width:100%;margin-top:28px;border-collapse:collapse;overflow:hidden;border-radius:8px;background:var(--ppt-surface);font-size:24px}",
    ".ppt-table th,.ppt-table td{padding:18px 20px;border:1px solid var(--ppt-line);text-align:left;vertical-align:top}",
    ".ppt-table th{color:var(--ppt-strong);font-weight:820;background:rgba(0,0,0,.035)}",
    ".ppt-table td{color:var(--ppt-text)}",
    ".ppt-code{margin-top:28px;padding:28px;border-radius:8px;background:#101418;color:#edf2f7;font-family:'SFMono-Regular',Consolas,monospace;font-size:22px;line-height:1.48;white-space:pre-wrap;overflow:hidden}",
    ".ppt-layout-ending{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:28px}",
    ".ppt-layout-ending .ppt-title{font-size:78px}",
    ".ppt-ending-line{width:180px;height:8px;border-radius:4px;background:var(--ppt-accent)}"
  ].join("\n");

  function ensureStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById("ppt-html-renderer-style")) return;
    var style = document.createElement("style");
    style.id = "ppt-html-renderer-style";
    style.textContent = SLIDE_CSS;
    document.head.appendChild(style);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function safeText(value) {
    return value == null ? "" : String(value);
  }

  function normalizeImage(rawImage) {
    var image = rawImage && typeof rawImage === "object" ? clone(rawImage) : {};
    image.src = safeText(image.src);
    image.alt = safeText(image.alt);
    image.caption = safeText(image.caption);
    image.fit = image.fit === "contain" ? "contain" : "cover";
    return image;
  }

  function normalizeVideo(rawVideo) {
    var video = rawVideo && typeof rawVideo === "object" ? clone(rawVideo) : {};
    video.src = safeText(video.src);
    video.poster = safeText(video.poster);
    video.caption = safeText(video.caption);
    video.fit = video.fit === "contain" ? "contain" : "cover";
    video.controls = video.controls !== false;
    video.autoplay = Boolean(video.autoplay);
    video.loop = Boolean(video.loop);
    video.muted = Boolean(video.muted || video.autoplay);
    return video;
  }

  function normalizeAudio(rawAudio) {
    var audio = rawAudio && typeof rawAudio === "object" ? clone(rawAudio) : {};
    audio.src = safeText(audio.src);
    audio.caption = safeText(audio.caption);
    audio.controls = audio.controls !== false;
    audio.autoplay = Boolean(audio.autoplay);
    audio.loop = Boolean(audio.loop);
    audio.muted = Boolean(audio.muted || audio.autoplay);
    return audio;
  }

  function normalizeTextBox(rawTextBox, index) {
    var box = rawTextBox && typeof rawTextBox === "object" ? clone(rawTextBox) : {};
    var x = Number(box.x);
    var y = Number(box.y);
    var w = Number(box.w);
    var h = Number(box.h);
    return {
      id: safeText(box.id || "textbox-" + (index + 1)),
      text: safeText(box.text == null ? "Double-click to edit" : box.text),
      x: isFinite(x) ? x : 730 + index * 28,
      y: isFinite(y) ? y : 430 + index * 30,
      w: isFinite(w) && w > 0 ? w : 380,
      h: isFinite(h) && h > 0 ? h : 96
    };
  }

  function normalizeChart(rawChart) {
    var chart = rawChart && typeof rawChart === "object" ? clone(rawChart) : {};
    chart.kind = CHART_KINDS.indexOf(chart.kind) !== -1 ? chart.kind : "bar";
    chart.labels = asArray(chart.labels).map(function (label) {
      return safeText(label).trim();
    }).filter(Boolean).slice(0, 8);
    chart.series = asArray(chart.series).map(function (series, index) {
      var item = series && typeof series === "object" ? series : {};
      var values = asArray(item.values).map(function (value) {
        var number = Number(value);
        return isFinite(number) ? number : 0;
      }).slice(0, 8);
      return {
        name: safeText(item.name || "系列 " + (index + 1)),
        values: values
      };
    }).filter(function (series) {
      return series.values.length;
    }).slice(0, 4);
    chart.unit = safeText(chart.unit);

    var longest = chart.series.reduce(function (max, series) {
      return Math.max(max, series.values.length);
    }, chart.labels.length);
    while (chart.labels.length < longest) {
      chart.labels.push("Item " + (chart.labels.length + 1));
    }
    chart.labels = chart.labels.slice(0, longest);
    chart.series.forEach(function (series) {
      series.values = series.values.slice(0, chart.labels.length);
      while (series.values.length < chart.labels.length) series.values.push(0);
    });

    return chart;
  }

  function uid(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 8);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== "") node.textContent = text;
    return node;
  }

  function appendText(parent, tag, className, text) {
    if (text == null || text === "") return null;
    var node = el(tag, className, text);
    parent.appendChild(node);
    return node;
  }

  function createMedia(image) {
    var media = normalizeImage(image);
    var box = el("figure", "ppt-media");
    box.setAttribute("data-fit", media.fit);
    var src = media.src;
    if (src) {
      var img = document.createElement("img");
      img.src = media.src;
      img.alt = media.alt || "";
      box.appendChild(img);
    } else {
      box.appendChild(el("div", "ppt-image-placeholder", "Image"));
    }
    appendText(box, "figcaption", "ppt-caption", media.caption);
    return box;
  }

  function createVideo(videoData) {
    var video = normalizeVideo(videoData);
    var box = el("figure", "ppt-video");
    box.setAttribute("data-fit", video.fit);
    if (video.src) {
      var node = document.createElement("video");
      node.src = video.src;
      node.controls = video.controls;
      node.autoplay = video.autoplay;
      node.loop = video.loop;
      node.muted = video.muted;
      node.playsInline = true;
      if (video.poster) node.poster = video.poster;
      box.appendChild(node);
    } else {
      box.appendChild(el("div", "ppt-video-placeholder", "Video"));
    }
    appendText(box, "figcaption", "ppt-caption", video.caption);
    return box;
  }

  function createAudio(audioData) {
    var audio = normalizeAudio(audioData);
    var box = el("figure", "ppt-audio");
    if (audio.src) {
      var node = document.createElement("audio");
      node.src = audio.src;
      node.controls = audio.controls;
      node.autoplay = audio.autoplay;
      node.loop = audio.loop;
      node.muted = audio.muted;
      box.appendChild(node);
    } else {
      box.appendChild(el("div", "ppt-audio-placeholder", "Audio"));
    }
    appendText(box, "figcaption", "ppt-caption", audio.caption);
    return box;
  }

  function createList(items) {
    var list = el("ul", "ppt-list");
    asArray(items).slice(0, 6).forEach(function (item) {
      var text = typeof item === "string" ? item : item.text || item.title || "";
      if (text) list.appendChild(el("li", "", text));
    });
    return list;
  }

  function createContentStack(slide, includeList) {
    var stack = el("div", "ppt-content-stack");
    appendText(stack, "div", "ppt-kicker", slide.kicker);
    appendText(stack, "h1", "ppt-title", slide.title);
    appendText(stack, "p", "ppt-subtitle", slide.subtitle);
    appendText(stack, "p", "ppt-body", slide.body);
    if (includeList && asArray(slide.items).length) stack.appendChild(createList(slide.items));
    return stack;
  }

  function appendTextBoxes(article, slide) {
    asArray(slide.textBoxes).forEach(function (item, index) {
      var box = normalizeTextBox(item, index);
      var node = el("div", "ppt-textbox", box.text);
      node.style.left = box.x + "px";
      node.style.top = box.y + "px";
      node.style.width = box.w + "px";
      node.style.minHeight = box.h + "px";
      node.setAttribute("data-textbox-id", box.id);
      article.appendChild(node);
    });
  }

  function svgEl(tag, attrs) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (attrs[key] != null) node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  function chartSeriesClass(index) {
    return "ppt-chart-series-" + (index % 4);
  }

  function chartMax(chart) {
    var max = 0;
    chart.series.forEach(function (series) {
      series.values.forEach(function (value) {
        max = Math.max(max, Number(value) || 0);
      });
    });
    return max > 0 ? max * 1.15 : 1;
  }

  function shortLabel(value, maxLength) {
    var text = safeText(value);
    return text.length > maxLength ? text.slice(0, Math.max(1, maxLength - 3)) + "..." : text;
  }

  function appendChartAxes(svg, width, height, pad) {
    var plotHeight = height - pad.top - pad.bottom;
    for (var i = 0; i <= 4; i += 1) {
      var y = pad.top + (plotHeight / 4) * i;
      svg.appendChild(svgEl("line", {
        class: "ppt-chart-grid",
        x1: pad.left,
        y1: y,
        x2: width - pad.right,
        y2: y
      }));
    }
    svg.appendChild(svgEl("line", {
      class: "ppt-chart-axis",
      x1: pad.left,
      y1: height - pad.bottom,
      x2: width - pad.right,
      y2: height - pad.bottom
    }));
    svg.appendChild(svgEl("line", {
      class: "ppt-chart-axis",
      x1: pad.left,
      y1: pad.top,
      x2: pad.left,
      y2: height - pad.bottom
    }));
  }

  function createBarChart(chart) {
    var width = 820;
    var height = 360;
    var pad = { left: 56, right: 26, top: 26, bottom: 66 };
    var svg = svgEl("svg", { class: "ppt-chart", viewBox: "0 0 " + width + " " + height, role: "img" });
    appendChartAxes(svg, width, height, pad);

    var labels = chart.labels;
    var plotWidth = width - pad.left - pad.right;
    var plotHeight = height - pad.top - pad.bottom;
    var max = chartMax(chart);
    var groupWidth = labels.length ? plotWidth / labels.length : plotWidth;
    var seriesCount = Math.max(1, chart.series.length);
    var barWidth = Math.max(8, Math.min(38, (groupWidth - 18) / seriesCount - 4));

    labels.forEach(function (label, labelIndex) {
      var center = pad.left + groupWidth * labelIndex + groupWidth / 2;
      chart.series.forEach(function (series, seriesIndex) {
        var value = Math.max(0, Number(series.values[labelIndex]) || 0);
        var barHeight = value / max * plotHeight;
        var x = center - (seriesCount * barWidth + (seriesCount - 1) * 6) / 2 + seriesIndex * (barWidth + 6);
        var y = height - pad.bottom - barHeight;
        svg.appendChild(svgEl("rect", {
          class: chartSeriesClass(seriesIndex),
          x: x,
          y: y,
          width: barWidth,
          height: Math.max(1, barHeight),
          rx: 5
        }));
      });
      svg.appendChild(svgEl("text", {
        class: "ppt-chart-label",
        x: center,
        y: height - 28,
        "text-anchor": "middle"
      })).textContent = shortLabel(label, 11);
    });

    return svg;
  }

  function createLineChart(chart) {
    var width = 820;
    var height = 360;
    var pad = { left: 56, right: 34, top: 30, bottom: 66 };
    var svg = svgEl("svg", { class: "ppt-chart", viewBox: "0 0 " + width + " " + height, role: "img" });
    appendChartAxes(svg, width, height, pad);

    var labels = chart.labels;
    var plotWidth = width - pad.left - pad.right;
    var plotHeight = height - pad.top - pad.bottom;
    var max = chartMax(chart);

    labels.forEach(function (label, labelIndex) {
      var x = pad.left + (labels.length === 1 ? plotWidth / 2 : plotWidth * labelIndex / (labels.length - 1));
      svg.appendChild(svgEl("text", {
        class: "ppt-chart-label",
        x: x,
        y: height - 28,
        "text-anchor": "middle"
      })).textContent = shortLabel(label, 11);
    });

    chart.series.forEach(function (series, seriesIndex) {
      var points = labels.map(function (label, labelIndex) {
        var value = Math.max(0, Number(series.values[labelIndex]) || 0);
        var x = pad.left + (labels.length === 1 ? plotWidth / 2 : plotWidth * labelIndex / (labels.length - 1));
        var y = height - pad.bottom - value / max * plotHeight;
        return { x: x, y: y };
      });
      svg.appendChild(svgEl("polyline", {
        class: "ppt-chart-line " + chartSeriesClass(seriesIndex),
        points: points.map(function (point) { return point.x + "," + point.y; }).join(" ")
      }));
      points.forEach(function (point) {
        svg.appendChild(svgEl("circle", {
          class: "ppt-chart-point " + chartSeriesClass(seriesIndex),
          cx: point.x,
          cy: point.y,
          r: 7
        }));
      });
    });

    return svg;
  }

  function createDonutChart(chart) {
    var width = 820;
    var height = 360;
    var cx = 360;
    var cy = 180;
    var r = 118;
    var svg = svgEl("svg", { class: "ppt-chart", viewBox: "0 0 " + width + " " + height, role: "img" });
    var values = chart.series[0] ? chart.series[0].values : [];
    var total = values.reduce(function (sum, value) {
      return sum + Math.max(0, Number(value) || 0);
    }, 0);
    if (!total) return svg;

    var circumference = 2 * Math.PI * r;
    var offset = 0;
    values.forEach(function (value, index) {
      var size = Math.max(0, Number(value) || 0) / total * circumference;
      var circle = svgEl("circle", {
        class: "ppt-chart-ring " + chartSeriesClass(index),
        cx: cx,
        cy: cy,
        r: r,
        transform: "rotate(-90 " + cx + " " + cy + ")",
        "stroke-dasharray": size + " " + Math.max(0, circumference - size),
        "stroke-dashoffset": -offset
      });
      svg.appendChild(circle);
      offset += size;
    });
    svg.appendChild(svgEl("text", {
      class: "ppt-chart-value",
      x: cx,
      y: cy - 6,
      "text-anchor": "middle"
    })).textContent = String(total);
    svg.appendChild(svgEl("text", {
      class: "ppt-chart-label",
      x: cx,
      y: cy + 28,
      "text-anchor": "middle"
    })).textContent = chart.unit || "Total";
    return svg;
  }

  function createChartLegend(chart) {
    var legend = el("div", "ppt-chart-legend");
    if (chart.kind === "donut") {
      var values = chart.series[0] ? chart.series[0].values : [];
      chart.labels.forEach(function (label, index) {
        appendLegendItem(legend, index, label, values[index], chart.unit);
      });
      return legend;
    }

    chart.series.forEach(function (series, index) {
      appendLegendItem(legend, index, series.name || "系列 " + (index + 1), null, chart.unit);
    });
    return legend;
  }

  function appendLegendItem(legend, index, title, value, unit) {
    var item = el("div", "ppt-chart-legend-item");
    item.appendChild(el("span", "ppt-chart-swatch " + chartSeriesClass(index)));
    var body = el("div", "");
    appendText(body, "strong", "", title);
    if (value != null) appendText(body, "small", "", value + (unit ? " " + unit : ""));
    legend.appendChild(item);
    item.appendChild(body);
  }

  function createChart(rawChart) {
    var chart = normalizeChart(rawChart);
    if (!chart.labels.length || !chart.series.length) {
      return el("div", "ppt-chart-empty", "添加图表标签和数据后预览");
    }

    var wrap = el("div", "ppt-chart-wrap ppt-chart-kind-" + chart.kind);
    if (chart.kind === "line") wrap.appendChild(createLineChart(chart));
    else if (chart.kind === "donut") wrap.appendChild(createDonutChart(chart));
    else wrap.appendChild(createBarChart(chart));
    wrap.appendChild(createChartLegend(chart));
    return wrap;
  }

  function tagPath(node, path) {
    if (node) node.setAttribute("data-ppt-path", path);
  }

  function tagCanvasPaths(article, slide) {
    tagPath(article.querySelector(".ppt-kicker"), "kicker");
    tagPath(article.querySelector(".ppt-title"), "title");
    tagPath(article.querySelector(".ppt-subtitle"), "subtitle");
    tagPath(article.querySelector(".ppt-body"), "body");
    tagPath(article.querySelector(".ppt-media"), "image");
    tagPath(article.querySelector(".ppt-caption"), "image.caption");
    tagPath(article.querySelector(".ppt-video"), "video");
    if (article.querySelector(".ppt-video .ppt-caption")) {
      tagPath(article.querySelector(".ppt-video .ppt-caption"), "video.caption");
    }
    tagPath(article.querySelector(".ppt-audio"), "audio");
    if (article.querySelector(".ppt-audio .ppt-caption")) {
      tagPath(article.querySelector(".ppt-audio .ppt-caption"), "audio.caption");
    }
    tagPath(article.querySelector(".ppt-chart-wrap"), "chart");
    tagPath(article.querySelector(".ppt-table"), "table");
    tagPath(article.querySelector(".ppt-card-grid"), "cards");
    tagPath(article.querySelector(".ppt-metric-grid"), "metrics");
    tagPath(article.querySelector(".ppt-timeline"), "timeline");
    article.querySelectorAll(".ppt-textbox").forEach(function (node, index) {
      tagPath(node, "textBoxes." + index + ".text");
    });

    if (slide.layout === "quote") {
      tagPath(article.querySelector(".ppt-quote"), "quote");
      tagPath(article.querySelector(".ppt-author"), "author");
    }

    article.querySelectorAll(".ppt-list li").forEach(function (node, index) {
      tagPath(node, "items." + index + ".text");
    });
    ["left", "right"].forEach(function (side, index) {
      var card = article.querySelectorAll(".ppt-compare-card")[index];
      if (!card) return;
      tagPath(card.querySelector("h2"), side + ".title");
      tagPath(card.querySelector("p"), side + ".text");
    });
    article.querySelectorAll(".ppt-card").forEach(function (card, index) {
      tagPath(card.querySelector("h2"), "cards." + index + ".title");
      tagPath(card.querySelector("p"), "cards." + index + ".text");
    });
    article.querySelectorAll(".ppt-time-item").forEach(function (item, index) {
      tagPath(item.querySelector("h2"), "items." + index + ".title");
      tagPath(item.querySelector("p"), "items." + index + ".text");
    });
    article.querySelectorAll(".ppt-metric").forEach(function (metric, index) {
      tagPath(metric.querySelector("strong"), "metrics." + index + ".value");
      tagPath(metric.querySelector("span"), "metrics." + index + ".label");
      tagPath(metric.querySelector("p"), "metrics." + index + ".detail");
    });
    article.querySelectorAll(".ppt-table th").forEach(function (cell, index) {
      tagPath(cell, "table.columns." + index);
    });
    article.querySelectorAll(".ppt-table tbody tr").forEach(function (row, rowIndex) {
      row.querySelectorAll("td").forEach(function (cell, cellIndex) {
        tagPath(cell, "table.rows." + rowIndex + "." + cellIndex);
      });
    });
    article.querySelectorAll(".ppt-chart-legend-item strong").forEach(function (node, index) {
      tagPath(node, slide.chart.kind === "donut" ? "chart.labels." + index : "chart.series." + index + ".name");
    });
    if (slide.chart.kind === "donut") {
      article.querySelectorAll(".ppt-chart-legend-item small").forEach(function (node, index) {
        tagPath(node, "chart.series.0.values." + index);
      });
    }
    tagPath(article.querySelector(".ppt-code"), "code");
  }

  function applyCanvasOffsets(article, slide) {
    var canvas = slide.canvas && typeof slide.canvas === "object" ? slide.canvas : {};
    tagCanvasPaths(article, slide);
    article.querySelectorAll("[data-ppt-path]").forEach(function (node) {
      var offset = canvas[node.getAttribute("data-ppt-path")] || {};
      var x = Number(offset.x) || 0;
      var y = Number(offset.y) || 0;
      var w = Math.max(0, Number(offset.w) || 0);
      var h = Math.max(0, Number(offset.h) || 0);
      if (!x && !y && !w && !h) return;
      if (!node.classList.contains("ppt-textbox")) node.style.position = "relative";
      node.style.zIndex = "5";
      if (x || y) node.style.transform = "translate(" + x + "px, " + y + "px)";
      if (w) {
        node.style.width = w + "px";
        node.style.maxWidth = w + "px";
      }
      if (h) node.style.minHeight = h + "px";
    });
  }

  function finalizeSlide(article, slide) {
    appendTextBoxes(article, slide);
    applyCanvasOffsets(article, slide);
    return article;
  }

  function createDemoDeck() {
    return createTemplateDeck("ai-camera");
  }

  function createTemplateDeck(templateId) {
    if (templateId === "product-pitch") {
      return normalizeDeck({
        version: FORMAT_VERSION,
        title: "产品发布演示",
        theme: "studio",
        aspectRatio: "16:9",
        slides: [
          {
            id: "slide-1",
            layout: "hero",
            kicker: "Product Pitch",
            title: "把一句话产品讲清楚",
            subtitle: "用问题、方案、价值和下一步构成一份可演示的发布稿"
          },
          {
            id: "slide-2",
            layout: "compare",
            kicker: "Problem",
            title: "用户现在为什么痛",
            left: { title: "当前做法", text: "流程分散\n表达不统一\n协作成本高" },
            right: { title: "新的机会", text: "结构化内容\n自动排版\nAI 和人类都能继续编辑" }
          },
          {
            id: "slide-3",
            layout: "threeCards",
            kicker: "Solution",
            title: "方案由三件事组成",
            cards: [
              { title: "结构化输入", text: "让内容先有清晰骨架。" },
              { title: "确定性渲染", text: "用模板系统保证页面稳定。" },
              { title: "可逆编辑", text: "AI 生成后，人类还能继续改。" }
            ]
          },
          {
            id: "slide-4",
            layout: "data",
            kicker: "Impact",
            title: "用数字证明价值",
            metrics: [
              { value: "3x", label: "起稿速度", detail: "从空白到可演示初稿。" },
              { value: "50%", label: "沟通减少", detail: "减少反复调整排版。" },
              { value: "1 file", label: "交付形态", detail: "单个 .ppt.html 文件即可分享。" }
            ]
          },
          {
            id: "slide-5",
            layout: "ending",
            title: "下一步",
            subtitle: "把这个演示换成你的产品、用户和数据"
          }
        ]
      });
    }

    if (templateId === "lesson") {
      return normalizeDeck({
        version: FORMAT_VERSION,
        title: "课程课件",
        theme: "paper",
        aspectRatio: "16:9",
        slides: [
          {
            id: "slide-1",
            layout: "hero",
            kicker: "Lesson",
            title: "本节课主题",
            subtitle: "用一个清晰问题带学生进入内容"
          },
          {
            id: "slide-2",
            layout: "section",
            kicker: "Goal",
            title: "学习目标",
            body: "本节课结束后，学生应该能够复述核心概念，并完成一个小练习。"
          },
          {
            id: "slide-3",
            layout: "text",
            kicker: "Concept",
            title: "核心概念",
            body: "先给出定义，再给出一个贴近日常的例子。",
            items: [
              { title: "定义", text: "一句话解释概念。" },
              { title: "例子", text: "展示它在真实场景中的样子。" },
              { title: "误区", text: "指出最容易混淆的地方。" }
            ]
          },
          {
            id: "slide-4",
            layout: "timeline",
            kicker: "Practice",
            title: "课堂练习流程",
            items: [
              { title: "3 min", text: "独立思考并写下答案。" },
              { title: "5 min", text: "小组讨论，补充证据。" },
              { title: "4 min", text: "全班分享，老师点评。" }
            ]
          },
          {
            id: "slide-5",
            layout: "ending",
            title: "课后任务",
            subtitle: "用自己的例子重新讲一遍今天的概念"
          }
        ]
      });
    }

    if (templateId === "project-update") {
      return normalizeDeck({
        version: FORMAT_VERSION,
        title: "项目进展汇报",
        theme: "boardroom",
        aspectRatio: "16:9",
        slides: [
          {
            id: "slide-1",
            layout: "hero",
            kicker: "Project Update",
            title: "项目进展汇报",
            subtitle: "状态、风险、决策和下一步"
          },
          {
            id: "slide-2",
            layout: "data",
            kicker: "Snapshot",
            title: "本周状态",
            metrics: [
              { value: "72%", label: "完成度", detail: "核心流程已打通。" },
              { value: "2", label: "主要风险", detail: "资源与时间窗口。" },
              { value: "1", label: "待决策", detail: "是否扩大试点范围。" }
            ]
          },
          {
            id: "slide-3",
            layout: "table",
            kicker: "Plan",
            title: "里程碑",
            table: {
              columns: ["阶段", "时间", "状态"],
              rows: [
                ["需求确认", "第 1 周", "完成"],
                ["原型验证", "第 2 周", "进行中"],
                ["试点发布", "第 4 周", "待开始"]
              ]
            }
          },
          {
            id: "slide-4",
            layout: "compare",
            kicker: "Risk",
            title: "风险与应对",
            left: { title: "风险", text: "关键资源冲突\n上线窗口收紧\n外部依赖变动" },
            right: { title: "应对", text: "提前锁定负责人\n拆分最小发布范围\n准备替代方案" }
          },
          {
            id: "slide-5",
            layout: "ending",
            title: "需要确认的决策",
            subtitle: "本周是否进入下一阶段试点"
          }
        ]
      });
    }

    return normalizeDeck({
      version: FORMAT_VERSION,
      title: "AI 导演相机发布会",
      theme: "launch",
      aspectRatio: "16:9",
      slides: [
        {
          id: "slide-1",
          layout: "hero",
          kicker: "Product Launch",
          title: "AI 导演相机",
          subtitle: "让普通人像导演一样设计镜头",
          image: { src: "", alt: "产品示意图" },
          notes: "开场用一句话讲清楚产品。"
        },
        {
          id: "slide-2",
          layout: "compare",
          kicker: "Problem",
          title: "传统拍摄 vs AI 导演",
          left: { title: "传统拍摄", text: "不知道怎么构图\n不知道怎么安排镜头\n拍完才发现故事不连贯" },
          right: { title: "AI 导演", text: "实时给出构图建议\n自动生成镜头脚本\n把拍摄过程变成清晰流程" }
        },
        {
          id: "slide-3",
          layout: "threeCards",
          kicker: "Workflow",
          title: "三步完成一次专业拍摄",
          cards: [
            { title: "输入目标", text: "告诉 AI 你要拍什么、给谁看、希望什么风格。" },
            { title: "获得分镜", text: "系统生成镜头顺序、景别、角度和时长建议。" },
            { title: "边拍边改", text: "现场根据画面反馈调整构图和节奏。" }
          ]
        },
        {
          id: "slide-4",
          layout: "data",
          kicker: "Impact",
          title: "把创作门槛降到用户能行动",
          metrics: [
            { value: "5x", label: "脚本生成效率", detail: "从空白想法到可执行分镜。" },
            { value: "60%", label: "重拍减少", detail: "拍摄前明确镜头目标和顺序。" },
            { value: "12min", label: "平均上手时间", detail: "非专业用户也能完成第一版。" }
          ]
        },
        {
          id: "slide-5",
          layout: "ending",
          title: "让每个人都能讲好画面故事",
          subtitle: "PPT.html demo · 可被 AI 生成，也可被人类继续编辑"
        }
      ]
    });
  }

  function normalizeSlide(raw, index) {
    var slide = raw && typeof raw === "object" ? clone(raw) : {};
    slide.id = slide.id || "slide-" + (index + 1);
    slide.layout = slide.layout || "text";
    slide.title = safeText(slide.title || "未命名页面");
    slide.subtitle = safeText(slide.subtitle);
    slide.kicker = safeText(slide.kicker);
    slide.body = safeText(slide.body);
    slide.image = normalizeImage(slide.image);
    slide.video = normalizeVideo(slide.video);
    slide.audio = normalizeAudio(slide.audio);
    slide.textBoxes = asArray(slide.textBoxes).map(normalizeTextBox);
    slide.items = asArray(slide.items);
    slide.cards = asArray(slide.cards);
    slide.metrics = asArray(slide.metrics);
    slide.chart = normalizeChart(slide.chart);
    slide.left = slide.left && typeof slide.left === "object" ? slide.left : { title: "Before", text: "" };
    slide.right = slide.right && typeof slide.right === "object" ? slide.right : { title: "After", text: "" };
    slide.table = slide.table && typeof slide.table === "object" ? slide.table : { columns: [], rows: [] };
    slide.table.columns = asArray(slide.table.columns);
    slide.table.rows = asArray(slide.table.rows);
    slide.quote = safeText(slide.quote);
    slide.author = safeText(slide.author);
    slide.code = safeText(slide.code);
    slide.notes = safeText(slide.notes);
    slide.canvas = slide.canvas && typeof slide.canvas === "object" && !Array.isArray(slide.canvas) ? slide.canvas : {};
    return slide;
  }

  function normalizeDeck(raw) {
    var deck = raw && typeof raw === "object" ? clone(raw) : createDemoDeck();
    deck.version = deck.version || FORMAT_VERSION;
    deck.title = safeText(deck.title || "未命名演示");
    deck.theme = safeText(deck.theme || "paper");
    deck.aspectRatio = deck.aspectRatio || "16:9";
    deck.slides = asArray(deck.slides).map(normalizeSlide);
    if (!deck.slides.length) deck.slides.push(normalizeSlide({ layout: "hero", title: deck.title }, 0));
    return deck;
  }

  function issue(level, path, message, fix) {
    return { level: level, path: path, message: message, fix: fix || "" };
  }

  function validateDeck(rawDeck) {
    var issues = [];
    var deck = rawDeck && typeof rawDeck === "object" ? rawDeck : null;

    if (!deck) {
      issues.push(issue("error", "$", "Deck 必须是一个 JSON 对象。", "输出一个包含 version、title、slides 的对象。"));
      return validationResult(issues);
    }

    if (deck.version !== FORMAT_VERSION) {
      issues.push(issue("error", "version", "version 必须是 \"" + FORMAT_VERSION + "\"。", "把 version 改为 \"" + FORMAT_VERSION + "\"。"));
    }

    if (!safeText(deck.title).trim()) {
      issues.push(issue("warning", "title", "文稿标题为空。", "给 deck.title 写一个清晰标题。"));
    }

    if (deck.theme && THEMES.indexOf(deck.theme) === -1) {
      issues.push(issue("warning", "theme", "未知主题 \"" + deck.theme + "\"。", "使用 paper、launch、studio 或 boardroom。"));
    }

    if (deck.aspectRatio && deck.aspectRatio !== "16:9") {
      issues.push(issue("warning", "aspectRatio", "当前编辑器只稳定支持 16:9。", "把 aspectRatio 改为 \"16:9\"。"));
    }

    if (!Array.isArray(deck.slides) || !deck.slides.length) {
      issues.push(issue("error", "slides", "slides 必须是非空数组。", "至少生成 1 页幻灯片。"));
      return validationResult(issues);
    }

    deck.slides.forEach(function (slide, index) {
      validateSlide(slide, index, issues);
    });

    return validationResult(issues);
  }

  function validateSlide(slide, index, issues) {
    var path = "slides[" + index + "]";
    if (!slide || typeof slide !== "object") {
      issues.push(issue("error", path, "幻灯片必须是对象。", "把这一页改为包含 layout 和 title 的对象。"));
      return;
    }

    var layout = safeText(slide.layout || "text");
    var layoutIds = LAYOUTS.map(function (item) { return item[0]; });
    if (layoutIds.indexOf(layout) === -1) {
      issues.push(issue("error", path + ".layout", "不支持的版式 \"" + layout + "\"。", "改用：" + layoutIds.join(", ") + "。"));
    }

    if (!safeText(slide.title).trim() && layout !== "quote") {
      issues.push(issue("warning", path + ".title", "页面标题为空。", "给这一页增加能被缩略图和演讲者识别的标题。"));
    }

    if (safeText(slide.title).length > 44) {
      issues.push(issue("warning", path + ".title", "标题偏长，可能在 16:9 画布中显得拥挤。", "压缩到 20-36 个汉字或等量英文以内。"));
    }

    if (safeText(slide.subtitle).length > 90) {
      issues.push(issue("warning", path + ".subtitle", "副标题偏长，可能影响版面层级。", "拆成正文或列表。"));
    }

    if (["hero", "imageRight", "imageLeft", "imageFull", "imageBackground"].indexOf(layout) !== -1) {
      if (!slide.image || !slide.image.src) {
        issues.push(issue("warning", path + ".image.src", "图片版式缺少图片。", "提供 image.src，或改用 text 版式。"));
      } else if (!slide.image.alt) {
        issues.push(issue("tip", path + ".image.alt", "图片缺少替代文字。", "为 image.alt 写一句图片说明。"));
      }
      if (slide.image && slide.image.fit && ["cover", "contain"].indexOf(slide.image.fit) === -1) {
        issues.push(issue("warning", path + ".image.fit", "图片适配模式不支持 \"" + slide.image.fit + "\"。", "使用 cover 或 contain。"));
      }
    }

    if (layout === "video") {
      if (!slide.video || !slide.video.src) {
        issues.push(issue("warning", path + ".video.src", "视频页缺少视频。", "提供 video.src，或拖入/选择一个本地视频。"));
      }
      if (slide.video && slide.video.fit && ["cover", "contain"].indexOf(slide.video.fit) === -1) {
        issues.push(issue("warning", path + ".video.fit", "视频适配模式不支持 \"" + slide.video.fit + "\"。", "使用 cover 或 contain。"));
      }
    }

    if (layout === "audio") {
      if (!slide.audio || !slide.audio.src) {
        issues.push(issue("warning", path + ".audio.src", "音频页缺少音频。", "提供 audio.src，或拖入/选择一个本地音频。"));
      }
    }

    if (layout === "compare") {
      if (!slide.left || !safeText(slide.left.text).trim()) {
        issues.push(issue("warning", path + ".left.text", "对比页左侧内容为空。", "补充左侧观点或痛点。"));
      }
      if (!slide.right || !safeText(slide.right.text).trim()) {
        issues.push(issue("warning", path + ".right.text", "对比页右侧内容为空。", "补充右侧方案或收益。"));
      }
    }

    if (layout === "threeCards") {
      var cards = asArray(slide.cards);
      if (!cards.length) {
        issues.push(issue("warning", path + ".cards", "三卡片页没有卡片内容。", "提供 2-3 个 {title,text} 卡片。"));
      }
      if (cards.length > 3) {
        issues.push(issue("tip", path + ".cards", "三卡片页最多显示前 3 张卡片。", "删除多余卡片，或拆成多页。"));
      }
    }

    if (layout === "timeline") {
      var items = asArray(slide.items);
      if (!items.length) {
        issues.push(issue("warning", path + ".items", "时间线页没有条目。", "提供若干 {title,text} 条目。"));
      }
      if (items.length > 5) {
        issues.push(issue("tip", path + ".items", "时间线页最多显示前 5 个条目。", "保留关键节点，其他拆页。"));
      }
    }

    if (layout === "data") {
      var metrics = asArray(slide.metrics);
      if (!metrics.length) {
        issues.push(issue("warning", path + ".metrics", "数据页没有指标。", "提供 1-3 个 {value,label,detail} 指标。"));
      }
      if (metrics.length > 3) {
        issues.push(issue("tip", path + ".metrics", "数据页最多显示前 3 个指标。", "挑选最重要的 3 个。"));
      }
    }

    if (layout === "chart") {
      var rawChart = slide.chart || {};
      var chartLabels = asArray(rawChart.labels);
      var chartSeries = asArray(rawChart.series);
      if (rawChart.kind && CHART_KINDS.indexOf(rawChart.kind) === -1) {
        issues.push(issue("warning", path + ".chart.kind", "图表类型不支持 \"" + rawChart.kind + "\"。", "使用 bar、line 或 donut。"));
      }
      if (!chartLabels.length) {
        issues.push(issue("warning", path + ".chart.labels", "图表缺少标签。", "提供 chart.labels，例如 [\"Q1\",\"Q2\",\"Q3\"]。"));
      }
      if (!chartSeries.length) {
        issues.push(issue("warning", path + ".chart.series", "图表缺少数据系列。", "提供 chart.series，例如 [{\"name\":\"收入\",\"values\":[12,20,31]}]。"));
      }
      var hasNumber = false;
      chartSeries.forEach(function (series, seriesIndex) {
        var values = asArray(series && series.values);
        if (chartLabels.length && values.length && values.length !== chartLabels.length) {
          issues.push(issue("tip", path + ".chart.series[" + seriesIndex + "].values", "图表数据数量和标签数量不一致。", "让 values 的数量与 chart.labels 保持一致。"));
        }
        values.forEach(function (value) {
          if (isFinite(Number(value))) hasNumber = true;
        });
      });
      if (chartSeries.length && !hasNumber) {
        issues.push(issue("warning", path + ".chart.series", "图表没有可用数字。", "把 values 写成数字数组，例如 [12,20,31]。"));
      }
    }

    if (layout === "table") {
      var table = slide.table || {};
      if (!asArray(table.columns).length) {
        issues.push(issue("warning", path + ".table.columns", "表格页缺少表头。", "提供 table.columns。"));
      }
      if (!asArray(table.rows).length) {
        issues.push(issue("warning", path + ".table.rows", "表格页缺少数据行。", "提供 table.rows。"));
      }
    }

    if (layout === "code" && !safeText(slide.code).trim()) {
      issues.push(issue("warning", path + ".code", "代码页没有代码内容。", "填写 code 字段，或换成 text 版式。"));
    }
  }

  function validationResult(issues) {
    var errors = issues.filter(function (item) { return item.level === "error"; });
    var warnings = issues.filter(function (item) { return item.level === "warning"; });
    var tips = issues.filter(function (item) { return item.level === "tip"; });
    return {
      ok: errors.length === 0,
      errors: errors,
      warnings: warnings,
      tips: tips,
      issues: issues
    };
  }

  function formatValidationReport(rawDeck, result) {
    var deck = rawDeck && typeof rawDeck === "object" ? rawDeck : {};
    var validation = result || validateDeck(deck);
    var lines = [
      "PPT.html Validation Report",
      "Deck: " + (deck.title || "(untitled)"),
      "Format: " + (deck.version || "(missing)") + " / expected " + FORMAT_VERSION,
      "Slides: " + (Array.isArray(deck.slides) ? deck.slides.length : 0),
      "Status: " + (validation.ok ? "PASS" : "NEEDS FIXES"),
      "Errors: " + validation.errors.length + " | Warnings: " + validation.warnings.length + " | Tips: " + validation.tips.length,
      ""
    ];

    if (!validation.issues.length) {
      lines.push("No issues found.");
    } else {
      validation.issues.forEach(function (item) {
        lines.push("[" + item.level.toUpperCase() + "] " + item.path + " - " + item.message);
        if (item.fix) lines.push("Fix: " + item.fix);
        lines.push("");
      });
    }

    lines.push("AI repair instruction:");
    lines.push("- Keep version as \"" + FORMAT_VERSION + "\" and preserve the PPT.html deck structure.");
    lines.push("- Fix ERROR items first, then WARNING items.");
    lines.push("- Do not output free-form HTML unless explicitly asked; output corrected deck JSON.");
    return lines.join("\n");
  }

  function renderSlide(rawSlide, rawDeck, options) {
    ensureStyles();
    var deck = normalizeDeck(rawDeck || {});
    var slide = normalizeSlide(rawSlide || {}, 0);
    var index = options && typeof options.index === "number" ? options.index : 0;
    var article = el("article", "ppt-slide ppt-theme-" + deck.theme + " ppt-layout-" + slide.layout);
    article.setAttribute("data-slide-id", slide.id);
    article.setAttribute("aria-label", slide.title || "幻灯片");

    if (slide.layout === "hero") {
      appendText(article, "div", "ppt-kicker", slide.kicker);
      appendText(article, "h1", "ppt-title", slide.title);
      appendText(article, "p", "ppt-subtitle", slide.subtitle);
      if (slide.image && slide.image.src) {
        var heroImage = createMedia(slide.image);
        heroImage.classList.add("ppt-hero-image");
        article.appendChild(heroImage);
      }
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "section") {
      article.appendChild(el("div", "ppt-section-number", String(index + 1).padStart(2, "0")));
      article.appendChild(createContentStack(slide, false));
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "imageRight" || slide.layout === "imageLeft") {
      var content = createContentStack(slide, true);
      var media = createMedia(slide.image);
      if (slide.layout === "imageLeft") {
        article.appendChild(media);
        article.appendChild(content);
      } else {
        article.appendChild(content);
        article.appendChild(media);
      }
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "imageFull") {
      var fullMedia = createMedia(slide.image);
      fullMedia.classList.add("ppt-full-media");
      article.appendChild(fullMedia);
      if (slide.title || slide.subtitle) {
        var imageOverlay = el("div", "ppt-image-overlay");
        appendText(imageOverlay, "h1", "ppt-title", slide.title);
        appendText(imageOverlay, "p", "ppt-subtitle", slide.subtitle);
        article.appendChild(imageOverlay);
      }
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "imageBackground") {
      var backgroundMedia = createMedia(slide.image);
      backgroundMedia.classList.add("ppt-background-media");
      article.appendChild(backgroundMedia);
      article.appendChild(createContentStack(slide, true));
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "compare") {
      article.appendChild(createContentStack(slide, false));
      var grid = el("div", "ppt-compare-grid");
      [["left", slide.left], ["right", slide.right]].forEach(function (entry) {
        var card = el("section", "ppt-compare-card");
        appendText(card, "h2", "", entry[1].title);
        appendText(card, "p", "", entry[1].text);
        grid.appendChild(card);
      });
      article.appendChild(grid);
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "threeCards") {
      article.appendChild(createContentStack(slide, false));
      var cardGrid = el("div", "ppt-card-grid");
      asArray(slide.cards).slice(0, 3).forEach(function (cardData) {
        var card = el("section", "ppt-card");
        appendText(card, "h2", "", cardData.title);
        appendText(card, "p", "", cardData.text);
        cardGrid.appendChild(card);
      });
      article.appendChild(cardGrid);
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "quote") {
      article.appendChild(el("div", "ppt-quote-mark", "“"));
      appendText(article, "p", "ppt-quote", slide.quote || slide.title);
      appendText(article, "p", "ppt-author", slide.author || slide.subtitle);
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "timeline") {
      article.appendChild(createContentStack(slide, false));
      var timeline = el("div", "ppt-timeline");
      asArray(slide.items).slice(0, 5).forEach(function (item) {
        var row = el("section", "ppt-time-item");
        appendText(row, "h2", "", item.title || item.text || "");
        appendText(row, "p", "", item.text && item.title ? item.text : "");
        timeline.appendChild(row);
      });
      article.appendChild(timeline);
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "data") {
      article.appendChild(createContentStack(slide, false));
      var metrics = el("div", "ppt-metric-grid");
      asArray(slide.metrics).slice(0, 3).forEach(function (metric) {
        var box = el("section", "ppt-metric");
        appendText(box, "strong", "", metric.value);
        appendText(box, "span", "", metric.label);
        appendText(box, "p", "", metric.detail);
        metrics.appendChild(box);
      });
      article.appendChild(metrics);
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "chart") {
      article.appendChild(createContentStack(slide, false));
      article.appendChild(createChart(slide.chart));
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "video") {
      article.appendChild(createContentStack(slide, false));
      article.appendChild(createVideo(slide.video));
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "audio") {
      article.appendChild(createContentStack(slide, false));
      article.appendChild(createAudio(slide.audio));
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "table") {
      article.appendChild(createContentStack(slide, false));
      var table = el("table", "ppt-table");
      var thead = document.createElement("thead");
      var headRow = document.createElement("tr");
      asArray(slide.table.columns).forEach(function (column) {
        headRow.appendChild(el("th", "", column));
      });
      thead.appendChild(headRow);
      table.appendChild(thead);
      var tbody = document.createElement("tbody");
      asArray(slide.table.rows).slice(0, 6).forEach(function (row) {
        var tr = document.createElement("tr");
        asArray(row).forEach(function (cell) {
          tr.appendChild(el("td", "", cell));
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      article.appendChild(table);
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "code") {
      article.appendChild(createContentStack(slide, false));
      article.appendChild(el("pre", "ppt-code", slide.code || "const deck = await createPptHtml();"));
      return finalizeSlide(article, slide);
    }

    if (slide.layout === "ending") {
      article.appendChild(el("div", "ppt-ending-line"));
      appendText(article, "h1", "ppt-title", slide.title);
      appendText(article, "p", "ppt-subtitle", slide.subtitle);
      return finalizeSlide(article, slide);
    }

    article.appendChild(createContentStack(slide, true));
    return finalizeSlide(article, slide);
  }

  function parseFileText(text) {
    var trimmed = String(text || "").trim();
    if (!trimmed) throw new Error("文件内容为空");
    var jsonText = extractDeckJsonText(trimmed);
    if (jsonText) return normalizeDeck(JSON.parse(jsonText));

    var parsed = new DOMParser().parseFromString(trimmed, "text/html");
    var dataNode = parsed.getElementById("ppt-html-data");
    if (!dataNode) throw new Error("没有找到 #ppt-html-data");
    return normalizeDeck(JSON.parse(dataNode.textContent));
  }

  function extractDeckJsonText(text) {
    var trimmed = String(text || "").trim();
    var fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenced) return fenced[1].trim();
    if (trimmed[0] === "{") return trimmed;
    if (trimmed[0] === "<") return "";
    if (trimmed.indexOf("\"slides\"") === -1) return "";
    var start = trimmed.indexOf("{");
    var end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) return "";
    return trimmed.slice(start, end + 1);
  }

  function isEmbeddedAsset(src) {
    var value = safeText(src).trim();
    return !value || /^data:/i.test(value);
  }

  function collectExternalAssetReferences(rawDeck) {
    var deck = normalizeDeck(rawDeck);
    var refs = [];

    function add(slideIndex, path, kind, src) {
      var value = safeText(src).trim();
      if (!value || isEmbeddedAsset(value)) return;
      refs.push({
        slideIndex: slideIndex,
        slideNumber: slideIndex + 1,
        path: "slides[" + slideIndex + "]." + path,
        kind: kind,
        src: value
      });
    }

    deck.slides.forEach(function (slide, index) {
      add(index, "image.src", "image", slide.image && slide.image.src);
      add(index, "video.src", "video", slide.video && slide.video.src);
      add(index, "video.poster", "image", slide.video && slide.video.poster);
      add(index, "audio.src", "audio", slide.audio && slide.audio.src);
    });

    return refs;
  }

  function standaloneSource() {
    return "(function(){'use strict';" +
      "var d=JSON.parse(document.getElementById('ppt-html-data').textContent),i=0,w=1280,h=720,t=0;" +
      "function e(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x)n.textContent=x;return n}" +
      "function a(p,t,c,x){if(x==null||x==='')return;var n=e(t,c,x);p.appendChild(n);return n}" +
      "function arr(v){return Array.isArray(v)?v:[]}" +
      "function media(m){m=m||{};var b=e('figure','ppt-media');b.setAttribute('data-fit',m.fit==='contain'?'contain':'cover');if(m.src){var im=document.createElement('img');im.src=m.src;im.alt=m.alt||'';b.appendChild(im)}else b.appendChild(e('div','ppt-image-placeholder','Image'));a(b,'figcaption','ppt-caption',m.caption);return b}" +
      "function vid(v){v=v||{};var b=e('figure','ppt-video');b.setAttribute('data-fit',v.fit==='contain'?'contain':'cover');if(v.src){var n=document.createElement('video');n.src=v.src;n.controls=v.controls!==false;n.autoplay=!!v.autoplay;n.loop=!!v.loop;n.muted=!!(v.muted||v.autoplay);n.playsInline=true;if(v.poster)n.poster=v.poster;b.appendChild(n)}else b.appendChild(e('div','ppt-video-placeholder','Video'));a(b,'figcaption','ppt-caption',v.caption);return b}" +
      "function aud(v){v=v||{};var b=e('figure','ppt-audio');if(v.src){var n=document.createElement('audio');n.src=v.src;n.controls=v.controls!==false;n.autoplay=!!v.autoplay;n.loop=!!v.loop;n.muted=!!(v.muted||v.autoplay);b.appendChild(n)}else b.appendChild(e('div','ppt-audio-placeholder','Audio'));a(b,'figcaption','ppt-caption',v.caption);return b}" +
      "function tbs(n,s){arr(s.textBoxes).forEach(function(o,j){o=o||{};var b=e('div','ppt-textbox',o.text==null?'Double-click to edit':o.text);b.style.left=num(o.x==null?730+j*28:o.x)+'px';b.style.top=num(o.y==null?430+j*30:o.y)+'px';b.style.width=Math.max(80,num(o.w)||380)+'px';b.style.minHeight=Math.max(32,num(o.h)||96)+'px';n.appendChild(b)})}" +
      "function list(items){var u=e('ul','ppt-list');arr(items).slice(0,6).forEach(function(it){var x=typeof it==='string'?it:(it.text||it.title||'');if(x)u.appendChild(e('li','',x))});return u}" +
      "function stack(s,li){var x=e('div','ppt-content-stack');a(x,'div','ppt-kicker',s.kicker);a(x,'h1','ppt-title',s.title);a(x,'p','ppt-subtitle',s.subtitle);a(x,'p','ppt-body',s.body);if(li&&arr(s.items).length)x.appendChild(list(s.items));return x}" +
      "function se(t,o){var n=document.createElementNS('http://www.w3.org/2000/svg',t);Object.keys(o||{}).forEach(function(k){if(o[k]!=null)n.setAttribute(k,o[k])});return n}" +
      "function num(v){var n=Number(v);return isFinite(n)?n:0}" +
      "function ck(k){return k==='line'||k==='donut'?k:'bar'}" +
      "function norm(ch){ch=ch||{};var labs=arr(ch.labels).map(function(x){return String(x||'').trim()}).filter(Boolean).slice(0,8),ser=arr(ch.series).map(function(s,j){s=s||{};return{name:s.name||('系列 '+(j+1)),values:arr(s.values).map(num).slice(0,8)}}).filter(function(s){return s.values.length}).slice(0,4),long=labs.length;ser.forEach(function(s){long=Math.max(long,s.values.length)});while(labs.length<long)labs.push('Item '+(labs.length+1));ser.forEach(function(s){s.values=s.values.slice(0,labs.length);while(s.values.length<labs.length)s.values.push(0)});return{kind:ck(ch.kind),labels:labs,series:ser,unit:ch.unit||''}}" +
      "function cc(j){return 'ppt-chart-series-'+(j%4)}" +
      "function cm(c){var m=0;c.series.forEach(function(s){s.values.forEach(function(v){m=Math.max(m,num(v))})});return m>0?m*1.15:1}" +
      "function sh(x,m){x=String(x||'');return x.length>m?x.slice(0,Math.max(1,m-3))+'...':x}" +
      "function ax(s,w,h,p){var ph=h-p.top-p.bottom;for(var j=0;j<=4;j++){var y=p.top+(ph/4)*j;s.appendChild(se('line',{class:'ppt-chart-grid',x1:p.left,y1:y,x2:w-p.right,y2:y}))}s.appendChild(se('line',{class:'ppt-chart-axis',x1:p.left,y1:h-p.bottom,x2:w-p.right,y2:h-p.bottom}));s.appendChild(se('line',{class:'ppt-chart-axis',x1:p.left,y1:p.top,x2:p.left,y2:h-p.bottom}))}" +
      "function barChart(c){var w=820,h=360,p={left:56,right:26,top:26,bottom:66},s=se('svg',{class:'ppt-chart',viewBox:'0 0 '+w+' '+h,role:'img'});ax(s,w,h,p);var labs=c.labels,pw=w-p.left-p.right,ph=h-p.top-p.bottom,m=cm(c),gw=labs.length?pw/labs.length:pw,sc=Math.max(1,c.series.length),bw=Math.max(8,Math.min(38,(gw-18)/sc-4));labs.forEach(function(l,li){var cen=p.left+gw*li+gw/2;c.series.forEach(function(sr,si){var v=Math.max(0,num(sr.values[li])),bh=v/m*ph,x=cen-(sc*bw+(sc-1)*6)/2+si*(bw+6),y=h-p.bottom-bh;s.appendChild(se('rect',{class:cc(si),x:x,y:y,width:bw,height:Math.max(1,bh),rx:5}))});var tx=se('text',{class:'ppt-chart-label',x:cen,y:h-28,'text-anchor':'middle'});tx.textContent=sh(l,11);s.appendChild(tx)});return s}" +
      "function lineChart(c){var w=820,h=360,p={left:56,right:34,top:30,bottom:66},s=se('svg',{class:'ppt-chart',viewBox:'0 0 '+w+' '+h,role:'img'});ax(s,w,h,p);var labs=c.labels,pw=w-p.left-p.right,ph=h-p.top-p.bottom,m=cm(c);labs.forEach(function(l,li){var x=p.left+(labs.length===1?pw/2:pw*li/(labs.length-1)),tx=se('text',{class:'ppt-chart-label',x:x,y:h-28,'text-anchor':'middle'});tx.textContent=sh(l,11);s.appendChild(tx)});c.series.forEach(function(sr,si){var pts=labs.map(function(l,li){var v=Math.max(0,num(sr.values[li])),x=p.left+(labs.length===1?pw/2:pw*li/(labs.length-1)),y=h-p.bottom-v/m*ph;return{x:x,y:y}});s.appendChild(se('polyline',{class:'ppt-chart-line '+cc(si),points:pts.map(function(p){return p.x+','+p.y}).join(' ')}));pts.forEach(function(p){s.appendChild(se('circle',{class:'ppt-chart-point '+cc(si),cx:p.x,cy:p.y,r:7}))})});return s}" +
      "function donutChart(c){var w=820,h=360,cx=360,cy=180,r=118,s=se('svg',{class:'ppt-chart',viewBox:'0 0 '+w+' '+h,role:'img'}),vals=c.series[0]?c.series[0].values:[],tot=vals.reduce(function(z,v){return z+Math.max(0,num(v))},0);if(!tot)return s;var cir=2*Math.PI*r,off=0;vals.forEach(function(v,j){var sz=Math.max(0,num(v))/tot*cir;s.appendChild(se('circle',{class:'ppt-chart-ring '+cc(j),cx:cx,cy:cy,r:r,transform:'rotate(-90 '+cx+' '+cy+')','stroke-dasharray':sz+' '+Math.max(0,cir-sz),'stroke-dashoffset':-off}));off+=sz});var tv=se('text',{class:'ppt-chart-value',x:cx,y:cy-6,'text-anchor':'middle'});tv.textContent=String(tot);s.appendChild(tv);var tu=se('text',{class:'ppt-chart-label',x:cx,y:cy+28,'text-anchor':'middle'});tu.textContent=c.unit||'Total';s.appendChild(tu);return s}" +
      "function li(l,j,t,v,u){var it=e('div','ppt-chart-legend-item'),sw=e('span','ppt-chart-swatch '+cc(j)),b=e('div','');it.appendChild(sw);a(b,'strong','',t);if(v!=null)a(b,'small','',v+(u?' '+u:''));it.appendChild(b);l.appendChild(it)}" +
      "function leg(c){var l=e('div','ppt-chart-legend');if(c.kind==='donut'){var vals=c.series[0]?c.series[0].values:[];c.labels.forEach(function(x,j){li(l,j,x,vals[j],c.unit)});return l}c.series.forEach(function(s,j){li(l,j,s.name||('系列 '+(j+1)),null,c.unit)});return l}" +
      "function chart(ch){var c=norm(ch);if(!c.labels.length||!c.series.length)return e('div','ppt-chart-empty','添加图表标签和数据后预览');var wr=e('div','ppt-chart-wrap ppt-chart-kind-'+c.kind);wr.appendChild(c.kind==='line'?lineChart(c):c.kind==='donut'?donutChart(c):barChart(c));wr.appendChild(leg(c));return wr}" +
      "function tp(n,p){if(n)n.setAttribute('data-ppt-path',p)}function off(n,s){tp(n.querySelector('.ppt-kicker'),'kicker');tp(n.querySelector('.ppt-title'),'title');tp(n.querySelector('.ppt-subtitle'),'subtitle');tp(n.querySelector('.ppt-body'),'body');tp(n.querySelector('.ppt-media'),'image');tp(n.querySelector('.ppt-caption'),'image.caption');tp(n.querySelector('.ppt-video'),'video');if(n.querySelector('.ppt-video .ppt-caption'))tp(n.querySelector('.ppt-video .ppt-caption'),'video.caption');tp(n.querySelector('.ppt-audio'),'audio');if(n.querySelector('.ppt-audio .ppt-caption'))tp(n.querySelector('.ppt-audio .ppt-caption'),'audio.caption');tp(n.querySelector('.ppt-chart-wrap'),'chart');tp(n.querySelector('.ppt-table'),'table');tp(n.querySelector('.ppt-card-grid'),'cards');tp(n.querySelector('.ppt-metric-grid'),'metrics');tp(n.querySelector('.ppt-timeline'),'timeline');n.querySelectorAll('.ppt-textbox').forEach(function(x,j){tp(x,'textBoxes.'+j+'.text')});if(s.layout==='quote'){tp(n.querySelector('.ppt-quote'),'quote');tp(n.querySelector('.ppt-author'),'author')}n.querySelectorAll('.ppt-list li').forEach(function(x,j){tp(x,'items.'+j+'.text')});['left','right'].forEach(function(side,j){var c=n.querySelectorAll('.ppt-compare-card')[j];if(c){tp(c.querySelector('h2'),side+'.title');tp(c.querySelector('p'),side+'.text')}});n.querySelectorAll('.ppt-card').forEach(function(c,j){tp(c.querySelector('h2'),'cards.'+j+'.title');tp(c.querySelector('p'),'cards.'+j+'.text')});n.querySelectorAll('.ppt-time-item').forEach(function(c,j){tp(c.querySelector('h2'),'items.'+j+'.title');tp(c.querySelector('p'),'items.'+j+'.text')});n.querySelectorAll('.ppt-metric').forEach(function(c,j){tp(c.querySelector('strong'),'metrics.'+j+'.value');tp(c.querySelector('span'),'metrics.'+j+'.label');tp(c.querySelector('p'),'metrics.'+j+'.detail')});n.querySelectorAll('.ppt-table th').forEach(function(c,j){tp(c,'table.columns.'+j)});n.querySelectorAll('.ppt-table tbody tr').forEach(function(r,ri){r.querySelectorAll('td').forEach(function(c,ci){tp(c,'table.rows.'+ri+'.'+ci)})});n.querySelectorAll('.ppt-chart-legend-item strong').forEach(function(x,j){tp(x,s.chart&&s.chart.kind==='donut'?'chart.labels.'+j:'chart.series.'+j+'.name')});if(s.chart&&s.chart.kind==='donut')n.querySelectorAll('.ppt-chart-legend-item small').forEach(function(x,j){tp(x,'chart.series.0.values.'+j)});tp(n.querySelector('.ppt-code'),'code');var cv=s.canvas&&typeof s.canvas==='object'?s.canvas:{};n.querySelectorAll('[data-ppt-path]').forEach(function(x){var o=cv[x.getAttribute('data-ppt-path')]||{},dx=num(o.x),dy=num(o.y),ww=Math.max(0,num(o.w)),hh=Math.max(0,num(o.h));if(!dx&&!dy&&!ww&&!hh)return;if(!x.classList.contains('ppt-textbox'))x.style.position='relative';x.style.zIndex='5';if(dx||dy)x.style.transform='translate('+dx+'px, '+dy+'px)';if(ww){x.style.width=ww+'px';x.style.maxWidth=ww+'px'}if(hh)x.style.minHeight=hh+'px'})}" +
      "function slide(s){s=s||{};var n=e('article','ppt-slide ppt-theme-'+(d.theme||'paper')+' ppt-layout-'+(s.layout||'text'));if(s.layout==='hero'){a(n,'div','ppt-kicker',s.kicker);a(n,'h1','ppt-title',s.title);a(n,'p','ppt-subtitle',s.subtitle);if(s.image&&s.image.src){var hi=media(s.image);hi.classList.add('ppt-hero-image');n.appendChild(hi)}return n}if(s.layout==='section'){n.appendChild(e('div','ppt-section-number',String(i+1).padStart(2,'0')));n.appendChild(stack(s,false));return n}if(s.layout==='imageRight'||s.layout==='imageLeft'){var c=stack(s,true),m=media(s.image);if(s.layout==='imageLeft'){n.appendChild(m);n.appendChild(c)}else{n.appendChild(c);n.appendChild(m)}return n}if(s.layout==='imageFull'){var fm=media(s.image);fm.classList.add('ppt-full-media');n.appendChild(fm);if(s.title||s.subtitle){var ov=e('div','ppt-image-overlay');a(ov,'h1','ppt-title',s.title);a(ov,'p','ppt-subtitle',s.subtitle);n.appendChild(ov)}return n}if(s.layout==='imageBackground'){var bm=media(s.image);bm.classList.add('ppt-background-media');n.appendChild(bm);n.appendChild(stack(s,true));return n}if(s.layout==='compare'){n.appendChild(stack(s,false));var g=e('div','ppt-compare-grid');[s.left||{},s.right||{}].forEach(function(o){var ca=e('section','ppt-compare-card');a(ca,'h2','',o.title);a(ca,'p','',o.text);g.appendChild(ca)});n.appendChild(g);return n}if(s.layout==='threeCards'){n.appendChild(stack(s,false));var cg=e('div','ppt-card-grid');arr(s.cards).slice(0,3).forEach(function(o){var ca=e('section','ppt-card');a(ca,'h2','',o.title);a(ca,'p','',o.text);cg.appendChild(ca)});n.appendChild(cg);return n}if(s.layout==='quote'){n.appendChild(e('div','ppt-quote-mark','“'));a(n,'p','ppt-quote',s.quote||s.title);a(n,'p','ppt-author',s.author||s.subtitle);return n}if(s.layout==='timeline'){n.appendChild(stack(s,false));var tl=e('div','ppt-timeline');arr(s.items).slice(0,5).forEach(function(o){var r=e('section','ppt-time-item');a(r,'h2','',o.title||o.text||'');a(r,'p','',o.text&&o.title?o.text:'');tl.appendChild(r)});n.appendChild(tl);return n}if(s.layout==='data'){n.appendChild(stack(s,false));var mg=e('div','ppt-metric-grid');arr(s.metrics).slice(0,3).forEach(function(o){var b=e('section','ppt-metric');a(b,'strong','',o.value);a(b,'span','',o.label);a(b,'p','',o.detail);mg.appendChild(b)});n.appendChild(mg);return n}if(s.layout==='chart'){n.appendChild(stack(s,false));n.appendChild(chart(s.chart));return n}if(s.layout==='video'){n.appendChild(stack(s,false));n.appendChild(vid(s.video));return n}if(s.layout==='audio'){n.appendChild(stack(s,false));n.appendChild(aud(s.audio));return n}if(s.layout==='table'){n.appendChild(stack(s,false));var tb=e('table','ppt-table'),th=document.createElement('thead'),hr=document.createElement('tr');arr((s.table||{}).columns).forEach(function(c){hr.appendChild(e('th','',c))});th.appendChild(hr);tb.appendChild(th);var bd=document.createElement('tbody');arr((s.table||{}).rows).slice(0,6).forEach(function(r){var tr=document.createElement('tr');arr(r).forEach(function(c){tr.appendChild(e('td','',c))});bd.appendChild(tr)});tb.appendChild(bd);n.appendChild(tb);return n}if(s.layout==='code'){n.appendChild(stack(s,false));n.appendChild(e('pre','ppt-code',s.code||''));return n}if(s.layout==='ending'){n.appendChild(e('div','ppt-ending-line'));a(n,'h1','ppt-title',s.title);a(n,'p','ppt-subtitle',s.subtitle);return n}n.appendChild(stack(s,true));return n}" +
      "var root=document.getElementById('ppt-player-root'),stage=e('div','ppt-player-stage'),bar=e('div','ppt-player-bar'),prev=e('button','','上一页'),count=e('span','',''),next=e('button','','下一页'),full=e('button','','全屏');bar.appendChild(prev);bar.appendChild(count);bar.appendChild(next);bar.appendChild(full);root.appendChild(stage);root.appendChild(bar);" +
      "function fit(){var sc=Math.min(window.innerWidth/w,window.innerHeight/h);stage.style.width=w+'px';stage.style.height=h+'px';stage.style.transform='translate(-50%,-50%) scale('+Math.max(.1,sc)+')'}" +
      "function bg(){var sl=stage.querySelector('.ppt-slide');if(sl)root.style.background=getComputedStyle(sl).backgroundColor||''}" +
      "function chrome(){clearTimeout(t);root.classList.remove('is-ui-hidden');t=setTimeout(function(){root.classList.add('is-ui-hidden')},1800)}" +
      "function show(n){i=Math.max(0,Math.min(arr(d.slides).length-1,n));stage.innerHTML='';var sd=arr(d.slides)[i]||{},sn=slide(sd);tbs(sn,sd);off(sn,sd);stage.appendChild(sn);count.textContent=(i+1)+' / '+arr(d.slides).length;location.hash='slide-'+(i+1);fit();bg();chrome()}" +
      "function fullscreen(){if(!document.documentElement.requestFullscreen)return;var p=document.documentElement.requestFullscreen();if(p&&p.catch)p.catch(function(){})}" +
      "function toggleFullscreen(ev){if(ev&&ev.target&&ev.target.closest('.ppt-player-bar'))return;chrome();if(document.fullscreenElement){document.exitFullscreen&&document.exitFullscreen().catch(function(){})}else fullscreen()}" +
      "prev.onclick=function(){show(i-1)};next.onclick=function(){show(i+1)};full.onclick=fullscreen;root.onpointermove=chrome;root.onpointerdown=chrome;root.ondblclick=toggleFullscreen;" +
      "document.addEventListener('keydown',function(ev){var k=ev.key;if(k==='F5'){ev.preventDefault();if(!ev.shiftKey)show(0);fullscreen();return}if(k==='ArrowRight'||k==='ArrowDown'||k===' '||k==='Enter'||k==='PageDown'||k==='n'||k==='N'){ev.preventDefault();show(i+1);return}if(k==='ArrowLeft'||k==='ArrowUp'||k==='PageUp'||k==='Backspace'||k==='p'||k==='P'){ev.preventDefault();show(i-1);return}if(k==='Home'){ev.preventDefault();show(0);return}if(k==='End'){ev.preventDefault();show(arr(d.slides).length-1)}});" +
      "window.addEventListener('resize',fit);show(parseInt((location.hash||'').replace(/\\D/g,''),10)-1||0);" +
      "})();";
  }

  function exportStandalone(rawDeck) {
    var deck = normalizeDeck(rawDeck);
    var title = deck.title.replace(/[<>&]/g, "");
    var json = JSON.stringify(deck, null, 2).replace(/<\/script/gi, "<\\/script");
    return "<!doctype html>\n" +
      "<html lang=\"zh-CN\" data-format=\"ppt.html\" data-version=\"" + FORMAT_VERSION + "\">\n" +
      "<head>\n" +
      "  <meta charset=\"utf-8\">\n" +
      "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
      "  <meta name=\"ppt-html-packaging\" content=\"single-file-data-uri-assets\">\n" +
      "  <title>" + title + "</title>\n" +
      "  <link rel=\"icon\" href=\"data:,\">\n" +
      "  <style>\n" + SLIDE_CSS + "\n" +
      "    html,body{margin:0;min-height:100%;background:#101214;color:#f4f4f4;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0}\n" +
      "    #ppt-player-root{position:fixed;inset:0;display:grid;place-items:center;overflow:hidden;background:#101214}\n" +
      "    #ppt-player-root.is-ui-hidden{cursor:none}\n" +
      "    .ppt-player-stage{position:absolute;top:50%;left:50%;transform-origin:center center}\n" +
      "    #ppt-player-root .ppt-slide{box-shadow:none}\n" +
      "    .ppt-player-bar{position:fixed;left:50%;bottom:18px;display:flex;align-items:center;gap:10px;transform:translateX(-50%);padding:8px;border:1px solid rgba(255,255,255,.16);border-radius:8px;background:rgba(16,18,20,.82);backdrop-filter:blur(10px);opacity:1;transition:opacity .18s ease,transform .18s ease}\n" +
      "    #ppt-player-root.is-ui-hidden .ppt-player-bar{pointer-events:none;opacity:0;transform:translate(-50%,12px)}\n" +
      "    #ppt-player-root.is-ui-hidden .ppt-player-bar:focus-within{pointer-events:auto;opacity:1;transform:translateX(-50%)}\n" +
      "    .ppt-player-bar button{height:36px;padding:0 14px;border:1px solid rgba(255,255,255,.16);border-radius:6px;background:#f7f7f2;color:#141414;font-weight:760;cursor:pointer}\n" +
      "    .ppt-player-bar span{min-width:70px;text-align:center;color:#f4f4f4;font-size:14px}\n" +
      "  </style>\n" +
      "  <script id=\"ppt-html-data\" type=\"application/vnd.ppt-html+json\">\n" + json + "\n  </script>\n" +
      "</head>\n" +
      "<body>\n" +
      "  <main id=\"ppt-player-root\"></main>\n" +
      "  <script>\n" + standaloneSource().replace(/<\/script/gi, "<\\/script") + "\n  </script>\n" +
      "</body>\n" +
      "</html>\n";
  }

  function download(filename, content, type) {
    var blob = new Blob([content], { type: type || "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  window.PPTHtml = {
    version: FORMAT_VERSION,
    baseWidth: BASE_WIDTH,
    baseHeight: BASE_HEIGHT,
    themes: THEMES,
    layouts: LAYOUTS,
    slideCss: SLIDE_CSS,
    deckTemplates: [
      { id: "ai-camera", name: "AI 导演相机", description: "产品发布 demo，适合展示一个新想法。" },
      { id: "product-pitch", name: "产品发布", description: "问题、方案、价值和下一步。" },
      { id: "lesson", name: "课程课件", description: "学习目标、概念、练习和课后任务。" },
      { id: "project-update", name: "项目汇报", description: "状态、风险、决策和里程碑。" }
    ],
    createDemoDeck: createDemoDeck,
    createTemplateDeck: createTemplateDeck,
    normalizeDeck: normalizeDeck,
    normalizeSlide: normalizeSlide,
    validateDeck: validateDeck,
    formatValidationReport: formatValidationReport,
    renderSlide: renderSlide,
    parseFileText: parseFileText,
    collectExternalAssetReferences: collectExternalAssetReferences,
    exportStandalone: exportStandalone,
    download: download,
    uid: uid
  };
})();
