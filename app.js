(function () {
  "use strict";

  var STORAGE_KEY = "ppt-html-studio-draft-v01";
  var APP_VERSION_LABEL = "v0.2.4";
  var desktop = window.htmlpptDesktop || null;
  var deck = PPTHtml.normalizeDeck(loadInitialDeck());
  var currentIndex = 0;
  var currentFilePath = "";
  var dirty = false;
  var history = [];
  var future = [];
  var syncing = false;
  var presenting = false;
  var presentIndex = 0;
  var toastTimer = 0;
  var activeEditSnapshot = "";
  var activeEditPushed = false;
  var activeCanvasEdit = null;
  var activeCanvasDrag = null;
  var activeCanvasResize = null;
  var selectedCanvasPath = "";
  var presenterUiTimer = 0;
  var presenterFullscreenActive = false;

  var els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    populateLayoutSelect();
    bindEvents();
    configureRuntime();
    renderAll();
    window.addEventListener("resize", function () {
      fitFrame(els.stageFrame, els.stageViewport);
      renderCanvasControls();
      if (presenting) fitPresentationFrame(els.presenterStage, els.presenter);
    });
  }

  function cacheElements() {
    [
      "newDeckBtn", "templatesBtn", "openDeckBtn", "downloadDeckBtn", "saveAsDeckBtn", "jsonBtn", "validateBtn", "presentBtn",
      "fileInput", "imageFileInput", "fileStatus",
      "addSlideBtn", "slideList", "duplicateSlideBtn", "moveSlideUpBtn", "moveSlideDownBtn", "deleteSlideBtn",
      "currentSlideLabel", "currentSlideTitle", "undoBtn", "redoBtn", "stageViewport", "stageFrame",
      "deckTitleInput", "deckThemeInput", "slideLayoutInput", "kickerInput", "titleInput", "subtitleInput", "bodyInput",
      "imageFileBtn", "imageFitInput", "imageSrcInput", "imageAltInput", "imageCaptionInput", "itemsInput", "leftTitleInput", "leftTextInput", "rightTitleInput", "rightTextInput",
      "cardsInput", "metricsInput", "chartKindInput", "chartLabelsInput", "chartSeriesInput", "chartUnitInput", "tableColumnsInput", "tableRowsInput", "quoteInput", "authorInput", "codeInput", "notesInput",
      "presenter", "presenterStage", "presentPrevBtn", "presentCounter", "presentNextBtn", "presentExitBtn",
      "jsonDialog", "jsonTextarea", "copyJsonBtn", "loadJsonBtn",
      "templateDialog", "validationDialog", "validationSummary", "validationReport", "copyValidationBtn", "toast"
    ].forEach(function (id) {
      els[id] = document.getElementById(id);
    });
  }

  function configureRuntime() {
    if (desktop && desktop.isDesktop) {
      els.downloadDeckBtn.textContent = "保存";
      els.saveAsDeckBtn.hidden = false;
      desktop.onMenuCommand(function (command) {
        if (command === "new") createNewDeck();
        if (command === "templates") els.templateDialog.showModal();
        if (command === "open") openDeck();
        if (command === "save") saveDeck(false);
        if (command === "saveAs") saveDeck(true);
        if (command === "validate") showValidationDialog();
        if (command === "presentFromStart") openPresenter(0);
        if (command === "present") openPresenter(currentIndex);
      });
    }
    updateFileStatus();
  }

  function populateLayoutSelect() {
    PPTHtml.layouts.forEach(function (layout) {
      var option = document.createElement("option");
      option.value = layout[0];
      option.textContent = layout[1];
      els.slideLayoutInput.appendChild(option);
    });
  }

  function bindEvents() {
    els.newDeckBtn.addEventListener("click", function () {
      createNewDeck();
    });

    els.templatesBtn.addEventListener("click", function () {
      els.templateDialog.showModal();
    });

    els.openDeckBtn.addEventListener("click", function () {
      openDeck();
    });

    els.fileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          loadDeckText(reader.result, file.name, "");
        } catch (error) {
          alert("打开失败：" + error.message);
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    });

    els.downloadDeckBtn.addEventListener("click", function () {
      saveDeck(false);
    });

    els.saveAsDeckBtn.addEventListener("click", function () {
      saveDeck(true);
    });

    els.jsonBtn.addEventListener("click", function () {
      els.jsonTextarea.value = JSON.stringify(deck, null, 2);
      els.jsonDialog.showModal();
      els.jsonTextarea.focus();
    });

    els.copyJsonBtn.addEventListener("click", function () {
      els.jsonTextarea.value = JSON.stringify(deck, null, 2);
      navigator.clipboard.writeText(els.jsonTextarea.value).then(function () {
        toast("JSON 已复制");
      }).catch(function () {
        els.jsonTextarea.select();
        document.execCommand("copy");
        toast("JSON 已复制");
      });
    });

    els.loadJsonBtn.addEventListener("click", function () {
      try {
        var parsed = PPTHtml.parseFileText(els.jsonTextarea.value);
        commit(function () {
          deck = parsed;
          currentIndex = 0;
        });
        currentFilePath = "";
        markDirty();
        els.jsonDialog.close();
        toastWithValidation("JSON 已载入");
      } catch (error) {
        alert("载入失败：" + error.message);
      }
    });

    els.validateBtn.addEventListener("click", showValidationDialog);

    els.copyValidationBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(els.validationReport.value).then(function () {
        toast("检查报告已复制");
      }).catch(function () {
        els.validationReport.select();
        document.execCommand("copy");
        toast("检查报告已复制");
      });
    });

    els.stageFrame.addEventListener("pointerdown", handleCanvasPointerDown);
    els.stageFrame.addEventListener("dblclick", handleCanvasDblClick);
    els.stageViewport.addEventListener("pointerdown", handleCanvasViewportPointerDown);
    els.stageViewport.addEventListener("dragover", handleCanvasDragOver);
    els.stageViewport.addEventListener("dragenter", handleCanvasDragEnter);
    els.stageViewport.addEventListener("dragleave", handleCanvasDragLeave);
    els.stageViewport.addEventListener("drop", handleCanvasDrop);

    els.templateDialog.querySelectorAll("[data-template]").forEach(function (button) {
      button.addEventListener("click", function () {
        createFromTemplate(button.getAttribute("data-template"));
      });
    });

    els.addSlideBtn.addEventListener("click", function () {
      commit(function () {
        deck.slides.splice(currentIndex + 1, 0, PPTHtml.normalizeSlide({
          id: PPTHtml.uid("slide"),
          layout: "text",
          kicker: "New Slide",
          title: "新页面",
          subtitle: "在右侧面板编辑内容"
        }, currentIndex + 1));
        currentIndex += 1;
      });
    });

    els.duplicateSlideBtn.addEventListener("click", function () {
      commit(function () {
        var copy = JSON.parse(JSON.stringify(currentSlide()));
        copy.id = PPTHtml.uid("slide");
        copy.title = copy.title + " Copy";
        deck.slides.splice(currentIndex + 1, 0, copy);
        currentIndex += 1;
      });
    });

    els.moveSlideUpBtn.addEventListener("click", function () {
      if (currentIndex <= 0) return;
      commit(function () {
        var slide = deck.slides.splice(currentIndex, 1)[0];
        currentIndex -= 1;
        deck.slides.splice(currentIndex, 0, slide);
      });
    });

    els.moveSlideDownBtn.addEventListener("click", function () {
      if (currentIndex >= deck.slides.length - 1) return;
      commit(function () {
        var slide = deck.slides.splice(currentIndex, 1)[0];
        currentIndex += 1;
        deck.slides.splice(currentIndex, 0, slide);
      });
    });

    els.deleteSlideBtn.addEventListener("click", function () {
      if (deck.slides.length <= 1) {
        alert("至少保留一页。");
        return;
      }
      if (!confirm("删除当前页面？")) return;
      commit(function () {
        deck.slides.splice(currentIndex, 1);
        currentIndex = Math.max(0, currentIndex - 1);
      });
    });

    els.undoBtn.addEventListener("click", undo);
    els.redoBtn.addEventListener("click", redo);

    bindDeckInput(els.deckTitleInput, function (value) { deck.title = value; });
    bindDeckInput(els.deckThemeInput, function (value) { deck.theme = value; });

    bindSlideInput(els.slideLayoutInput, function (slide, value) { slide.layout = value; updateFieldVisibility(); });
    bindSlideInput(els.kickerInput, function (slide, value) { slide.kicker = value; });
    bindSlideInput(els.titleInput, function (slide, value) { slide.title = value; });
    bindSlideInput(els.subtitleInput, function (slide, value) { slide.subtitle = value; });
    bindSlideInput(els.bodyInput, function (slide, value) { slide.body = value; });
    bindSlideInput(els.imageFitInput, function (slide, value) { slide.image.fit = value; });
    bindSlideInput(els.imageSrcInput, function (slide, value) { slide.image.src = value; });
    bindSlideInput(els.imageAltInput, function (slide, value) { slide.image.alt = value; });
    bindSlideInput(els.imageCaptionInput, function (slide, value) { slide.image.caption = value; });
    bindSlideInput(els.itemsInput, function (slide, value) { slide.items = parseRows(value); });
    bindSlideInput(els.leftTitleInput, function (slide, value) { slide.left.title = value; });
    bindSlideInput(els.leftTextInput, function (slide, value) { slide.left.text = value; });
    bindSlideInput(els.rightTitleInput, function (slide, value) { slide.right.title = value; });
    bindSlideInput(els.rightTextInput, function (slide, value) { slide.right.text = value; });
    bindSlideInput(els.cardsInput, function (slide, value) { slide.cards = parseRows(value); });
    bindSlideInput(els.metricsInput, function (slide, value) { slide.metrics = parseMetrics(value); });
    bindSlideInput(els.chartKindInput, function (slide, value) { ensureChart(slide).kind = value; });
    bindSlideInput(els.chartLabelsInput, function (slide, value) { ensureChart(slide).labels = splitCells(value); });
    bindSlideInput(els.chartSeriesInput, function (slide, value) { ensureChart(slide).series = parseChartSeries(value); });
    bindSlideInput(els.chartUnitInput, function (slide, value) { ensureChart(slide).unit = value; });
    bindSlideInput(els.tableColumnsInput, function (slide, value) { slide.table.columns = splitCells(value); });
    bindSlideInput(els.tableRowsInput, function (slide, value) { slide.table.rows = parseTableRows(value); });
    bindSlideInput(els.quoteInput, function (slide, value) { slide.quote = value; });
    bindSlideInput(els.authorInput, function (slide, value) { slide.author = value; });
    bindSlideInput(els.codeInput, function (slide, value) { slide.code = value; });
    bindSlideInput(els.notesInput, function (slide, value) { slide.notes = value; });

    els.imageFileBtn.addEventListener("click", function () {
      els.imageFileInput.click();
    });

    els.imageFileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        commit(function () {
          var slide = currentSlide();
          slide.image.src = reader.result;
          if (!slide.image.alt) slide.image.alt = file.name.replace(/\.[^.]+$/, "");
        });
        toast("图片已加入当前页面");
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    });

    els.presentBtn.addEventListener("click", function () { openPresenter(currentIndex); });
    els.presentPrevBtn.addEventListener("click", function () { showPresentationSlide(presentIndex - 1); });
    els.presentNextBtn.addEventListener("click", function () { showPresentationSlide(presentIndex + 1); });
    els.presentExitBtn.addEventListener("click", closePresenter);
    els.presenter.addEventListener("pointermove", showPresenterChrome);
    els.presenter.addEventListener("pointerdown", showPresenterChrome);
    els.presenter.addEventListener("focusin", showPresenterChrome);
    els.presenter.addEventListener("dblclick", togglePresenterFullscreen);
    document.addEventListener("fullscreenchange", handleDocumentFullscreenChange);

    document.addEventListener("keydown", handleGlobalKeydown);
  }

  function handleGlobalKeydown(event) {
    var key = event.key;
    var lowerKey = key.toLowerCase();
    var commandKey = event.metaKey || event.ctrlKey;

    if (key === "F5") {
      event.preventDefault();
      openPresenter(event.shiftKey ? currentIndex : 0);
      return;
    }

    if (commandKey && key === "Enter") {
      event.preventDefault();
      openPresenter(currentIndex);
      return;
    }

    if (commandKey && lowerKey === "s") {
      event.preventDefault();
      saveDeck(event.shiftKey);
      return;
    }
    if (commandKey && lowerKey === "o") {
      event.preventDefault();
      openDeck();
      return;
    }
    if (commandKey && lowerKey === "n") {
      event.preventDefault();
      createNewDeck();
      return;
    }

    if (presenting && handlePresenterShortcut(event)) return;
    if (isTextEditingTarget(event.target)) return;
    if (handleCanvasShortcut(event)) return;

    if (commandKey && lowerKey === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    }
    if (commandKey && lowerKey === "y") {
      event.preventDefault();
      redo();
    }
  }

  function handlePresenterShortcut(event) {
    var key = event.key;
    var nextKeys = ["ArrowRight", "ArrowDown", " ", "Enter", "PageDown", "n", "N"];
    var previousKeys = ["ArrowLeft", "ArrowUp", "PageUp", "Backspace", "p", "P"];

    if (key === "Escape") {
      event.preventDefault();
      closePresenter();
      return true;
    }
    if (nextKeys.indexOf(key) !== -1) {
      event.preventDefault();
      showPresentationSlide(presentIndex + 1);
      return true;
    }
    if (previousKeys.indexOf(key) !== -1) {
      event.preventDefault();
      showPresentationSlide(presentIndex - 1);
      return true;
    }
    if (key === "Home") {
      event.preventDefault();
      showPresentationSlide(0);
      return true;
    }
    if (key === "End") {
      event.preventDefault();
      showPresentationSlide(deck.slides.length - 1);
      return true;
    }

    return false;
  }

  function isTextEditingTarget(target) {
    return target && /INPUT|TEXTAREA|SELECT/.test(target.tagName);
  }

  function bindDeckInput(input, setter) {
    input.addEventListener("focus", captureEditStart);
    input.addEventListener("change", function () {
      if (syncing) return;
      var before = JSON.stringify(deck);
      setter(input.value);
      if (!activeEditPushed && before !== JSON.stringify(deck)) pushLiveHistory(before);
      deck = PPTHtml.normalizeDeck(deck);
      activeEditSnapshot = "";
      activeEditPushed = false;
      if (before !== JSON.stringify(deck)) markDirty();
      renderAll();
      persist();
    });
    input.addEventListener("input", function () {
      if (syncing || input.tagName === "SELECT") return;
      pushLiveHistory();
      setter(input.value);
      markDirty();
      renderCanvas();
      renderSlideList();
      updateButtons();
      persist();
    });
  }

  function bindSlideInput(input, setter) {
    input.addEventListener("focus", captureEditStart);
    input.addEventListener("change", function () {
      if (syncing) return;
      var before = JSON.stringify(deck);
      setter(currentSlide(), input.value);
      if (!activeEditPushed && before !== JSON.stringify(deck)) pushLiveHistory(before);
      deck = PPTHtml.normalizeDeck(deck);
      activeEditSnapshot = "";
      activeEditPushed = false;
      if (before !== JSON.stringify(deck)) markDirty();
      renderAll();
      persist();
    });
    input.addEventListener("input", function () {
      if (syncing || input.tagName === "SELECT") return;
      pushLiveHistory();
      setter(currentSlide(), input.value);
      markDirty();
      renderCanvas();
      renderSlideList();
      updateButtons();
      persist();
    });
  }

  function captureEditStart() {
    if (syncing) return;
    activeEditSnapshot = JSON.stringify(deck);
    activeEditPushed = false;
  }

  function pushLiveHistory(snapshot) {
    if (activeEditPushed) return;
    history.push(snapshot || activeEditSnapshot || JSON.stringify(deck));
    if (history.length > 80) history.shift();
    future = [];
    activeEditPushed = true;
  }

  function commit(mutator) {
    history.push(JSON.stringify(deck));
    if (history.length > 80) history.shift();
    future = [];
    mutator();
    deck = PPTHtml.normalizeDeck(deck);
    currentIndex = clamp(currentIndex, 0, deck.slides.length - 1);
    markDirty();
    renderAll();
    persist();
  }

  function undo() {
    if (!history.length) return;
    future.push(JSON.stringify(deck));
    deck = PPTHtml.normalizeDeck(JSON.parse(history.pop()));
    currentIndex = clamp(currentIndex, 0, deck.slides.length - 1);
    renderAll();
    persist();
  }

  function redo() {
    if (!future.length) return;
    history.push(JSON.stringify(deck));
    deck = PPTHtml.normalizeDeck(JSON.parse(future.pop()));
    currentIndex = clamp(currentIndex, 0, deck.slides.length - 1);
    renderAll();
    persist();
  }

  function renderAll() {
    renderSlideList();
    renderCanvas();
    syncInspector();
    updateButtons();
    updateFileStatus();
  }

  function renderSlideList() {
    els.slideList.innerHTML = "";
    deck.slides.forEach(function (slide, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "slide-thumb" + (index === currentIndex ? " active" : "");
      button.innerHTML = "<span>" + (index + 1) + "</span><strong></strong><small></small>";
      button.draggable = true;
      button.querySelector("strong").textContent = slide.title || "未命名页面";
      button.querySelector("small").textContent = layoutLabel(slide.layout);
      button.addEventListener("click", function () {
        selectSlide(index);
      });
      button.addEventListener("dragstart", function (event) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("application/x-htmlppt-slide-index", String(index));
        event.dataTransfer.setData("text/plain", String(index));
        button.classList.add("dragging");
      });
      button.addEventListener("dragend", function () {
        button.classList.remove("dragging");
      });
      button.addEventListener("dragover", function (event) {
        if (!event.dataTransfer.types || !Array.prototype.includes.call(event.dataTransfer.types, "application/x-htmlppt-slide-index")) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        button.classList.add("drag-over");
      });
      button.addEventListener("dragleave", function () {
        button.classList.remove("drag-over");
      });
      button.addEventListener("drop", function (event) {
        var sourceIndex = event.dataTransfer.getData("application/x-htmlppt-slide-index");
        if (sourceIndex === "") return;
        event.preventDefault();
        button.classList.remove("drag-over");
        moveSlideByDrag(Number(sourceIndex), index);
      });
      els.slideList.appendChild(button);
    });
  }

  function selectSlide(index) {
    if (index === currentIndex) return;
    selectedCanvasPath = "";
    currentIndex = index;
    renderAll();
  }

  function renderCanvas() {
    els.stageFrame.innerHTML = "";
    els.stageFrame.appendChild(PPTHtml.renderSlide(currentSlide(), deck, { index: currentIndex }));
    enhanceCanvasEditing();
    els.currentSlideLabel.textContent = "第 " + (currentIndex + 1) + " 页";
    els.currentSlideTitle.textContent = currentSlide().title || "未命名页面";
    fitFrame(els.stageFrame, els.stageViewport);
    renderCanvasControls();
  }

  function enhanceCanvasEditing() {
    var slide = currentSlide();
    bindCanvasText(".ppt-kicker", "kicker", { singleLine: true });
    bindCanvasText(".ppt-title", "title", { singleLine: true });
    bindCanvasText(".ppt-subtitle", "subtitle");
    bindCanvasText(".ppt-body", "body");
    bindCanvasText(".ppt-caption", "image.caption", { singleLine: true });

    if (slide.layout === "quote") {
      bindCanvasText(".ppt-quote", "quote");
      bindCanvasText(".ppt-author", "author", { singleLine: true });
    }

    bindCanvasListItems();
    bindCanvasCompare();
    bindCanvasCards();
    bindCanvasTimeline();
    bindCanvasMetrics();
    bindCanvasTable();
    bindCanvasChartLegend();
    bindCanvasText(".ppt-code", "code", { multiline: true, preserveWhitespace: true });
    applyCanvasOffsets();
  }

  function bindCanvasText(selector, path, options) {
    var node = els.stageFrame.querySelector(selector);
    if (!node) return;
    registerCanvasEdit(node, path, options);
  }

  function bindCanvasListItems() {
    els.stageFrame.querySelectorAll(".ppt-list li").forEach(function (node, index) {
      registerCanvasEdit(node, "items." + index + ".text");
    });
  }

  function bindCanvasCompare() {
    ["left", "right"].forEach(function (side, index) {
      var card = els.stageFrame.querySelectorAll(".ppt-compare-card")[index];
      if (!card) return;
      registerCanvasEdit(card.querySelector("h2"), side + ".title", { singleLine: true });
      registerCanvasEdit(card.querySelector("p"), side + ".text");
    });
  }

  function bindCanvasCards() {
    els.stageFrame.querySelectorAll(".ppt-card").forEach(function (card, index) {
      registerCanvasEdit(card.querySelector("h2"), "cards." + index + ".title", { singleLine: true });
      registerCanvasEdit(card.querySelector("p"), "cards." + index + ".text");
    });
  }

  function bindCanvasTimeline() {
    els.stageFrame.querySelectorAll(".ppt-time-item").forEach(function (item, index) {
      registerCanvasEdit(item.querySelector("h2"), "items." + index + ".title", { singleLine: true });
      registerCanvasEdit(item.querySelector("p"), "items." + index + ".text");
    });
  }

  function bindCanvasMetrics() {
    els.stageFrame.querySelectorAll(".ppt-metric").forEach(function (metric, index) {
      registerCanvasEdit(metric.querySelector("strong"), "metrics." + index + ".value", { singleLine: true });
      registerCanvasEdit(metric.querySelector("span"), "metrics." + index + ".label", { singleLine: true });
      registerCanvasEdit(metric.querySelector("p"), "metrics." + index + ".detail");
    });
  }

  function bindCanvasTable() {
    els.stageFrame.querySelectorAll(".ppt-table th").forEach(function (cell, index) {
      registerCanvasEdit(cell, "table.columns." + index, { singleLine: true });
    });
    els.stageFrame.querySelectorAll(".ppt-table tbody tr").forEach(function (row, rowIndex) {
      row.querySelectorAll("td").forEach(function (cell, cellIndex) {
        registerCanvasEdit(cell, "table.rows." + rowIndex + "." + cellIndex, { singleLine: true });
      });
    });
  }

  function bindCanvasChartLegend() {
    var slide = currentSlide();
    els.stageFrame.querySelectorAll(".ppt-chart-legend-item strong").forEach(function (node, index) {
      var path = slide.chart.kind === "donut" ? "chart.labels." + index : "chart.series." + index + ".name";
      registerCanvasEdit(node, path, { singleLine: true });
    });
    if (slide.chart.kind !== "donut") return;
    els.stageFrame.querySelectorAll(".ppt-chart-legend-item small").forEach(function (node, index) {
      registerCanvasEdit(node, "chart.series.0.values." + index, { singleLine: true, numberValue: true });
    });
  }

  function applyCanvasOffsets() {
    els.stageFrame.querySelectorAll("[data-canvas-edit]").forEach(function (node) {
      setCanvasOffsetStyle(node, getCanvasOffset(node.getAttribute("data-canvas-edit")));
    });
  }

  function registerCanvasEdit(node, path, options) {
    if (!node) return;
    node.setAttribute("data-canvas-edit", path);
    node.setAttribute("tabindex", "0");
    node.dataset.canvasOptions = JSON.stringify(options || {});
  }

  function handleCanvasPointerDown(event) {
    if (presenting || activeCanvasEdit || event.button !== 0) return;
    if (event.target.closest(".canvas-selection-box")) return;
    var target = event.target.closest("[data-canvas-edit]");
    if (!target || !els.stageFrame.contains(target)) return;
    selectCanvasTarget(target);
    activeCanvasDrag = {
      node: target,
      path: target.getAttribute("data-canvas-edit"),
      before: JSON.stringify(deck),
      startX: event.clientX,
      startY: event.clientY,
      origin: getCanvasOffset(target.getAttribute("data-canvas-edit")),
      scale: currentFrameScale(),
      moved: false
    };
    window.addEventListener("pointermove", handleCanvasPointerMove);
    window.addEventListener("pointerup", handleCanvasPointerEnd);
    window.addEventListener("pointercancel", handleCanvasPointerEnd);
  }

  function handleCanvasPointerMove(event) {
    if (!activeCanvasDrag) return;
    var drag = activeCanvasDrag;
    var dx = (event.clientX - drag.startX) / drag.scale;
    var dy = (event.clientY - drag.startY) / drag.scale;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      drag.node.classList.add("is-canvas-dragging");
    }
    event.preventDefault();
    setCanvasOffsetStyle(drag.node, {
      x: clamp(drag.origin.x + dx, -420, 420),
      y: clamp(drag.origin.y + dy, -240, 240),
      w: drag.origin.w,
      h: drag.origin.h
    });
    positionCanvasSelectionBox(drag.node);
  }

  function handleCanvasPointerEnd(event) {
    if (!activeCanvasDrag) return;
    var drag = activeCanvasDrag;
    activeCanvasDrag = null;
    window.removeEventListener("pointermove", handleCanvasPointerMove);
    window.removeEventListener("pointerup", handleCanvasPointerEnd);
    window.removeEventListener("pointercancel", handleCanvasPointerEnd);
    drag.node.classList.remove("is-canvas-dragging");
    if (!drag.moved) return;
    event.preventDefault();

    var offset = parseCanvasOffsetStyle(drag.node);
    if (sameOffset(drag.origin, offset)) return;
    history.push(drag.before);
    if (history.length > 80) history.shift();
    future = [];
    setCanvasOffset(drag.path, offset);
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    persist();
  }

  function handleCanvasViewportPointerDown(event) {
    if (event.target.closest("[data-canvas-edit]") || event.target.closest(".canvas-selection-box")) return;
    if (!selectedCanvasPath) return;
    selectedCanvasPath = "";
    renderCanvasControls();
  }

  function selectCanvasTarget(node) {
    var path = node.getAttribute("data-canvas-edit");
    if (!path) return;
    selectedCanvasPath = path;
    renderCanvasControls();
  }

  function canvasNodeByPath(path) {
    if (!path) return null;
    var nodes = els.stageFrame.querySelectorAll("[data-canvas-edit]");
    for (var index = 0; index < nodes.length; index += 1) {
      if (nodes[index].getAttribute("data-canvas-edit") === path) return nodes[index];
    }
    return null;
  }

  function renderCanvasControls() {
    els.stageFrame.querySelectorAll(".canvas-selection-box").forEach(function (box) {
      box.remove();
    });

    var node = canvasNodeByPath(selectedCanvasPath);
    if (!node || activeCanvasEdit) {
      if (!node) selectedCanvasPath = "";
      return;
    }

    var box = document.createElement("div");
    box.className = "canvas-selection-box";
    box.setAttribute("data-canvas-selection", selectedCanvasPath);

    var label = document.createElement("span");
    label.className = "canvas-selection-label";
    label.textContent = selectedCanvasPath;
    box.appendChild(label);

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "canvas-reset-button";
    reset.title = "重置这个元素的位置和尺寸";
    reset.textContent = "重置";
    reset.addEventListener("pointerdown", function (event) {
      event.stopPropagation();
    });
    reset.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      resetSelectedCanvasOffset();
    });
    box.appendChild(reset);

    ["nw", "n", "ne", "e", "se", "s", "sw", "w"].forEach(function (handle) {
      var control = document.createElement("span");
      control.className = "canvas-resize-handle canvas-resize-" + handle;
      control.setAttribute("data-canvas-handle", handle);
      control.setAttribute("title", "拖拽调整尺寸");
      control.addEventListener("pointerdown", handleCanvasResizePointerDown);
      box.appendChild(control);
    });

    els.stageFrame.appendChild(box);
    positionCanvasSelectionBox(node, box);
  }

  function getNodeFrameBounds(node) {
    var scale = currentFrameScale();
    var nodeRect = node.getBoundingClientRect();
    var frameRect = els.stageFrame.getBoundingClientRect();
    return {
      x: (nodeRect.left - frameRect.left) / scale,
      y: (nodeRect.top - frameRect.top) / scale,
      w: nodeRect.width / scale,
      h: nodeRect.height / scale
    };
  }

  function positionCanvasSelectionBox(node, existingBox) {
    var box = existingBox || els.stageFrame.querySelector(".canvas-selection-box");
    if (!box || !node) return;
    var bounds = getNodeFrameBounds(node);
    box.style.left = bounds.x + "px";
    box.style.top = bounds.y + "px";
    box.style.width = Math.max(8, bounds.w) + "px";
    box.style.height = Math.max(8, bounds.h) + "px";
  }

  function handleCanvasResizePointerDown(event) {
    if (presenting || activeCanvasEdit || event.button !== 0) return;
    var handle = event.currentTarget.getAttribute("data-canvas-handle");
    var path = selectedCanvasPath;
    var node = canvasNodeByPath(path);
    if (!handle || !node) return;
    event.preventDefault();
    event.stopPropagation();
    activeCanvasResize = {
      node: node,
      path: path,
      handle: handle,
      before: JSON.stringify(deck),
      startX: event.clientX,
      startY: event.clientY,
      scale: currentFrameScale(),
      origin: getCanvasOffset(path),
      startBox: getNodeFrameBounds(node),
      moved: false
    };
    node.classList.add("is-canvas-dragging");
    window.addEventListener("pointermove", handleCanvasResizePointerMove);
    window.addEventListener("pointerup", handleCanvasResizePointerEnd);
    window.addEventListener("pointercancel", handleCanvasResizePointerEnd);
  }

  function handleCanvasResizePointerMove(event) {
    if (!activeCanvasResize) return;
    var resize = activeCanvasResize;
    var dx = (event.clientX - resize.startX) / resize.scale;
    var dy = (event.clientY - resize.startY) / resize.scale;
    if (!resize.moved && Math.hypot(dx, dy) < 3) return;
    resize.moved = true;
    event.preventDefault();

    var next = {
      x: resize.origin.x,
      y: resize.origin.y,
      w: resize.origin.w || resize.startBox.w,
      h: resize.origin.h || resize.startBox.h
    };
    var handle = resize.handle;
    var minW = 44;
    var minH = 24;

    if (handle.indexOf("e") !== -1) next.w = Math.max(minW, resize.startBox.w + dx);
    if (handle.indexOf("s") !== -1) next.h = Math.max(minH, resize.startBox.h + dy);
    if (handle.indexOf("w") !== -1) {
      next.w = Math.max(minW, resize.startBox.w - dx);
      next.x = resize.origin.x + resize.startBox.w - next.w;
    }
    if (handle.indexOf("n") !== -1) {
      next.h = Math.max(minH, resize.startBox.h - dy);
      next.y = resize.origin.y + resize.startBox.h - next.h;
    }

    next.x = clamp(next.x, -420, 420);
    next.y = clamp(next.y, -240, 240);
    setCanvasOffsetStyle(resize.node, next);
    positionCanvasSelectionBox(resize.node);
  }

  function handleCanvasResizePointerEnd(event) {
    if (!activeCanvasResize) return;
    var resize = activeCanvasResize;
    activeCanvasResize = null;
    window.removeEventListener("pointermove", handleCanvasResizePointerMove);
    window.removeEventListener("pointerup", handleCanvasResizePointerEnd);
    window.removeEventListener("pointercancel", handleCanvasResizePointerEnd);
    resize.node.classList.remove("is-canvas-dragging");
    if (!resize.moved) return;
    event.preventDefault();

    var offset = parseCanvasOffsetStyle(resize.node);
    if (sameOffset(resize.origin, offset)) return;
    history.push(resize.before);
    if (history.length > 80) history.shift();
    future = [];
    setCanvasOffset(resize.path, offset);
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    persist();
  }

  function handleCanvasShortcut(event) {
    if (!selectedCanvasPath || presenting || activeCanvasEdit || activeCanvasDrag || activeCanvasResize) return false;
    var node = canvasNodeByPath(selectedCanvasPath);
    if (!node) {
      selectedCanvasPath = "";
      return false;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      selectedCanvasPath = "";
      renderCanvasControls();
      return true;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      resetSelectedCanvasOffset();
      return true;
    }

    var arrowDelta = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    }[event.key];
    if (!arrowDelta) return false;

    event.preventDefault();
    var step = event.shiftKey ? 10 : 1;
    var origin = getCanvasOffset(selectedCanvasPath);
    var next = {
      x: clamp(origin.x + arrowDelta[0] * step, -420, 420),
      y: clamp(origin.y + arrowDelta[1] * step, -240, 240),
      w: origin.w,
      h: origin.h
    };
    history.push(JSON.stringify(deck));
    if (history.length > 80) history.shift();
    future = [];
    setCanvasOffset(selectedCanvasPath, next);
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    persist();
    return true;
  }

  function resetSelectedCanvasOffset() {
    if (!selectedCanvasPath) return;
    var slide = currentSlide();
    var canvas = slide.canvas && typeof slide.canvas === "object" ? slide.canvas : {};
    if (!canvas[selectedCanvasPath]) return;
    history.push(JSON.stringify(deck));
    if (history.length > 80) history.shift();
    future = [];
    delete canvas[selectedCanvasPath];
    if (!Object.keys(canvas).length) delete slide.canvas;
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    persist();
  }

  function currentFrameScale() {
    var transform = window.getComputedStyle(els.stageFrame).transform;
    if (!transform || transform === "none") return 1;
    try {
      var matrix = new DOMMatrixReadOnly(transform);
      return matrix.a || 1;
    } catch (error) {
      var match = transform.match(/matrix\(([^,]+)/);
      return match ? Number(match[1]) || 1 : 1;
    }
  }

  function getCanvasOffset(path) {
    var canvas = currentSlide().canvas || {};
    var offset = canvas[path] || {};
    return {
      x: Number(offset.x) || 0,
      y: Number(offset.y) || 0,
      w: Number(offset.w) || 0,
      h: Number(offset.h) || 0
    };
  }

  function setCanvasOffset(path, offset) {
    var slide = currentSlide();
    slide.canvas = slide.canvas && typeof slide.canvas === "object" ? slide.canvas : {};
    var next = {
      x: Math.round(Number(offset.x) || 0),
      y: Math.round(Number(offset.y) || 0),
      w: Math.max(0, Math.round(Number(offset.w) || 0)),
      h: Math.max(0, Math.round(Number(offset.h) || 0))
    };
    if (Math.abs(next.x) < 1 && Math.abs(next.y) < 1 && next.w < 1 && next.h < 1) {
      delete slide.canvas[path];
    } else {
      slide.canvas[path] = {};
      if (next.x) slide.canvas[path].x = next.x;
      if (next.y) slide.canvas[path].y = next.y;
      if (next.w) slide.canvas[path].w = next.w;
      if (next.h) slide.canvas[path].h = next.h;
    }
    if (!Object.keys(slide.canvas).length) delete slide.canvas;
  }

  function setCanvasOffsetStyle(node, offset) {
    var x = Number(offset && offset.x) || 0;
    var y = Number(offset && offset.y) || 0;
    var w = Math.max(0, Number(offset && offset.w) || 0);
    var h = Math.max(0, Number(offset && offset.h) || 0);
    node.dataset.canvasX = String(x);
    node.dataset.canvasY = String(y);
    node.dataset.canvasW = String(w);
    node.dataset.canvasH = String(h);
    if (w) {
      node.style.width = w + "px";
      node.style.maxWidth = w + "px";
    } else {
      node.style.width = "";
      node.style.maxWidth = "";
    }
    if (h) {
      node.style.minHeight = h + "px";
    } else {
      node.style.minHeight = "";
    }
    if (!x && !y) {
      node.style.transform = "";
      if (!w && !h) {
        node.style.position = "";
        node.style.zIndex = "";
      } else {
        node.style.position = "relative";
        node.style.zIndex = "5";
      }
      return;
    }
    node.style.position = "relative";
    node.style.zIndex = "5";
    node.style.transform = "translate(" + x + "px, " + y + "px)";
  }

  function parseCanvasOffsetStyle(node) {
    return {
      x: Number(node.dataset.canvasX) || 0,
      y: Number(node.dataset.canvasY) || 0,
      w: Number(node.dataset.canvasW) || 0,
      h: Number(node.dataset.canvasH) || 0
    };
  }

  function sameOffset(left, right) {
    return Math.round(left.x) === Math.round(right.x)
      && Math.round(left.y) === Math.round(right.y)
      && Math.round(left.w) === Math.round(right.w)
      && Math.round(left.h) === Math.round(right.h);
  }

  function handleCanvasDblClick(event) {
    if (presenting) return;
    var target = event.target.closest("[data-canvas-edit]");
    if (!target || !els.stageFrame.contains(target)) return;
    event.preventDefault();
    event.stopPropagation();
    startCanvasEdit(target);
  }

  function startCanvasEdit(node) {
    if (activeCanvasEdit) finishCanvasEdit(true);
    var options = parseCanvasOptions(node);
    activeCanvasEdit = {
      node: node,
      path: node.getAttribute("data-canvas-edit"),
      options: options,
      before: JSON.stringify(deck),
      originalText: node.innerText
    };
    renderCanvasControls();
    node.classList.add("is-canvas-editing");
    node.contentEditable = "true";
    node.spellcheck = false;
    node.addEventListener("keydown", handleCanvasEditKeydown);
    node.addEventListener("blur", handleCanvasEditBlur);
    node.focus();
    selectEditableContents(node);
  }

  function parseCanvasOptions(node) {
    try {
      return JSON.parse(node.dataset.canvasOptions || "{}");
    } catch (error) {
      return {};
    }
  }

  function selectEditableContents(node) {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function handleCanvasEditKeydown(event) {
    if (!activeCanvasEdit) return;
    if (event.key === "Escape") {
      event.preventDefault();
      finishCanvasEdit(false);
      return;
    }
    if (event.key === "Enter" && (activeCanvasEdit.options.singleLine || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      finishCanvasEdit(true);
    }
  }

  function handleCanvasEditBlur() {
    if (activeCanvasEdit) finishCanvasEdit(true);
  }

  function finishCanvasEdit(shouldCommit) {
    if (!activeCanvasEdit) return;
    var edit = activeCanvasEdit;
    activeCanvasEdit = null;
    edit.node.removeEventListener("keydown", handleCanvasEditKeydown);
    edit.node.removeEventListener("blur", handleCanvasEditBlur);
    edit.node.contentEditable = "false";
    edit.node.classList.remove("is-canvas-editing");

    if (!shouldCommit) {
      edit.node.innerText = edit.originalText;
      return;
    }

    var value = canvasTextValue(edit.node, edit.options);
    if (edit.options.numberValue) {
      value = numberFromText(value);
    }

    var beforeValue = getPath(currentSlide(), edit.path);
    if (String(beforeValue == null ? "" : beforeValue) === String(value == null ? "" : value)) return;

    history.push(edit.before);
    if (history.length > 80) history.shift();
    future = [];
    setPath(currentSlide(), edit.path, value);
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    persist();
  }

  function canvasTextValue(node, options) {
    var text = node.innerText == null ? node.textContent : node.innerText;
    text = String(text || "").replace(/\u00a0/g, " ");
    if (options.singleLine) return text.replace(/\s+/g, " ").trim();
    if (options.preserveWhitespace) return text.replace(/\n$/, "");
    return text.replace(/\n{3,}/g, "\n\n").trim();
  }

  function numberFromText(text) {
    var number = Number(String(text || "").replace(/[^0-9.+-]/g, ""));
    return isFinite(number) ? number : 0;
  }

  function pathParts(path) {
    return String(path || "").split(".").filter(Boolean).map(function (part) {
      return /^\d+$/.test(part) ? Number(part) : part;
    });
  }

  function getPath(root, path) {
    return pathParts(path).reduce(function (value, part) {
      return value == null ? undefined : value[part];
    }, root);
  }

  function setPath(root, path, value) {
    var parts = pathParts(path);
    var target = root;
    for (var index = 0; index < parts.length - 1; index += 1) {
      var part = parts[index];
      var nextPart = parts[index + 1];
      if (target[part] == null || typeof target[part] !== "object") {
        target[part] = typeof nextPart === "number" ? [] : {};
      }
      target = target[part];
    }
    target[parts[parts.length - 1]] = value;
  }

  function handleCanvasDragEnter(event) {
    if (hasImageFile(event.dataTransfer)) els.stageViewport.classList.add("is-drop-target");
  }

  function handleCanvasDragOver(event) {
    if (!hasImageFile(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    els.stageViewport.classList.add("is-drop-target");
  }

  function handleCanvasDragLeave(event) {
    if (!els.stageViewport.contains(event.relatedTarget)) {
      els.stageViewport.classList.remove("is-drop-target");
    }
  }

  function handleCanvasDrop(event) {
    if (!hasImageFile(event.dataTransfer)) return;
    event.preventDefault();
    els.stageViewport.classList.remove("is-drop-target");
    var file = Array.prototype.find.call(event.dataTransfer.files || [], function (item) {
      return item.type && item.type.indexOf("image/") === 0;
    });
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      commit(function () {
        var slide = currentSlide();
        if (["hero", "imageRight", "imageLeft", "imageFull", "imageBackground"].indexOf(slide.layout) === -1) {
          slide.layout = "imageRight";
        }
        slide.image.src = reader.result;
        if (!slide.image.alt) slide.image.alt = file.name.replace(/\.[^.]+$/, "");
      });
      toast("图片已拖入当前页面");
    };
    reader.readAsDataURL(file);
  }

  function hasImageFile(dataTransfer) {
    if (!dataTransfer || !dataTransfer.types) return false;
    if (Array.prototype.some.call(dataTransfer.items || [], function (item) {
      return item.kind === "file" && item.type.indexOf("image/") === 0;
    })) return true;
    return Array.prototype.some.call(dataTransfer.files || [], function (file) {
      return file.type && file.type.indexOf("image/") === 0;
    });
  }

  function moveSlideByDrag(fromIndex, toIndex) {
    if (!isFinite(fromIndex) || fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= deck.slides.length || toIndex < 0 || toIndex >= deck.slides.length) return;
    commit(function () {
      var moved = deck.slides.splice(fromIndex, 1)[0];
      deck.slides.splice(toIndex, 0, moved);
      if (currentIndex === fromIndex) {
        currentIndex = toIndex;
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        currentIndex -= 1;
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        currentIndex += 1;
      }
    });
  }

  function syncInspector() {
    syncing = true;
    var slide = currentSlide();
    els.deckTitleInput.value = deck.title;
    els.deckThemeInput.value = deck.theme;
    els.slideLayoutInput.value = slide.layout;
    els.kickerInput.value = slide.kicker;
    els.titleInput.value = slide.title;
    els.subtitleInput.value = slide.subtitle;
    els.bodyInput.value = slide.body;
    els.imageFitInput.value = slide.image.fit || "cover";
    els.imageSrcInput.value = slide.image.src || "";
    els.imageAltInput.value = slide.image.alt || "";
    els.imageCaptionInput.value = slide.image.caption || "";
    els.itemsInput.value = stringifyRows(slide.items);
    els.leftTitleInput.value = slide.left.title || "";
    els.leftTextInput.value = slide.left.text || "";
    els.rightTitleInput.value = slide.right.title || "";
    els.rightTextInput.value = slide.right.text || "";
    els.cardsInput.value = stringifyRows(slide.cards);
    els.metricsInput.value = stringifyMetrics(slide.metrics);
    els.chartKindInput.value = slide.chart.kind || "bar";
    els.chartLabelsInput.value = slide.chart.labels.join(" | ");
    els.chartSeriesInput.value = stringifyChartSeries(slide.chart.series);
    els.chartUnitInput.value = slide.chart.unit || "";
    els.tableColumnsInput.value = slide.table.columns.join(" | ");
    els.tableRowsInput.value = stringifyTableRows(slide.table.rows);
    els.quoteInput.value = slide.quote || "";
    els.authorInput.value = slide.author || "";
    els.codeInput.value = slide.code || "";
    els.notesInput.value = slide.notes || "";
    updateFieldVisibility();
    syncing = false;
  }

  function updateButtons() {
    els.undoBtn.disabled = !history.length;
    els.redoBtn.disabled = !future.length;
    els.moveSlideUpBtn.disabled = currentIndex <= 0;
    els.moveSlideDownBtn.disabled = currentIndex >= deck.slides.length - 1;
    els.deleteSlideBtn.disabled = deck.slides.length <= 1;
  }

  function createNewDeck() {
    if (!confirmDiscard()) return;
    replaceDeck(PPTHtml.createDemoDeck(), { filePath: "", dirty: true, keepHistory: false });
    toast("已新建演示文稿");
  }

  function createFromTemplate(templateId) {
    if (!confirmDiscard()) return;
    replaceDeck(PPTHtml.createTemplateDeck(templateId), { filePath: "", dirty: true, keepHistory: false });
    els.templateDialog.close();
    toast("已从模板创建");
  }

  function openDeck() {
    if (!confirmDiscard()) return;
    if (desktop && desktop.isDesktop) {
      desktop.openDeck().then(function (result) {
        if (!result || result.canceled) return;
        loadDeckText(result.content, basename(result.filePath), result.filePath);
      }).catch(function (error) {
        alert("打开失败：" + error.message);
      });
      return;
    }
    els.fileInput.click();
  }

  function loadDeckText(text, label, filePath) {
    var nextDeck = PPTHtml.parseFileText(text);
    replaceDeck(nextDeck, { filePath: filePath || "", dirty: false, keepHistory: false });
    toastWithValidation("已打开 " + (label || "文稿"));
  }

  function replaceDeck(nextDeck, options) {
    var settings = options || {};
    deck = PPTHtml.normalizeDeck(nextDeck);
    currentIndex = 0;
    currentFilePath = settings.filePath || "";
    dirty = Boolean(settings.dirty);
    if (!settings.keepHistory) {
      history = [];
      future = [];
    }
    renderAll();
    persist();
  }

  function saveDeck(forceDialog) {
    var html = PPTHtml.exportStandalone(deck);
    var name = filenameFromTitle(deck.title);
    if (desktop && desktop.isDesktop) {
      var action = forceDialog ? desktop.saveDeckAs : desktop.saveDeck;
      action({ filePath: currentFilePath, defaultName: name, content: html }).then(function (result) {
        if (!result || result.canceled) return;
        currentFilePath = result.filePath || currentFilePath;
        dirty = false;
        updateFileStatus();
        toast("已保存 " + basename(currentFilePath));
      }).catch(function (error) {
        alert("保存失败：" + error.message);
      });
      return;
    }
    PPTHtml.download(name, html);
    dirty = false;
    updateFileStatus();
    toast("已生成单文件 PPT.html");
  }

  function confirmDiscard() {
    if (!dirty) return true;
    return confirm("当前文稿有未保存修改。继续会丢失这些修改。");
  }

  function markDirty() {
    dirty = true;
    updateFileStatus();
  }

  function updateFileStatus() {
    if (!els.fileStatus) return;
    var source = currentFilePath ? basename(currentFilePath) : (desktop && desktop.isDesktop ? "未命名" : "浏览器草稿");
    els.fileStatus.textContent = APP_VERSION_LABEL + " · " + source + (dirty ? " · 未保存" : "");
  }

  function showValidationDialog() {
    var result = PPTHtml.validateDeck(deck);
    els.validationSummary.textContent = result.ok
      ? "检查通过：" + deck.slides.length + " 页，可正常分享。"
      : "需要修复：" + result.errors.length + " 个错误，" + result.warnings.length + " 个警告。";
    els.validationReport.value = PPTHtml.formatValidationReport(deck, result);
    els.validationDialog.showModal();
  }

  function toastWithValidation(prefix) {
    var result = PPTHtml.validateDeck(deck);
    if (result.errors.length) {
      toast(prefix + " · 有 " + result.errors.length + " 个错误");
    } else if (result.warnings.length) {
      toast(prefix + " · 有 " + result.warnings.length + " 个建议");
    } else {
      toast(prefix + " · 检查通过");
    }
  }

  function updateFieldVisibility() {
    var layout = els.slideLayoutInput.value || currentSlide().layout;
    document.querySelectorAll(".field-group[data-layouts]").forEach(function (group) {
      var layouts = group.getAttribute("data-layouts").split(",");
      group.hidden = layouts.indexOf(layout) === -1;
    });
  }

  function currentSlide() {
    return deck.slides[currentIndex];
  }

  function fitFrame(frame, viewport) {
    if (!frame || !viewport) return;
    var availableWidth = viewport.clientWidth - 24;
    var availableHeight = viewport.clientHeight - 24;
    var scale = Math.min(availableWidth / PPTHtml.baseWidth, availableHeight / PPTHtml.baseHeight);
    scale = Math.max(0.1, Math.min(scale, 1.3));
    frame.style.width = PPTHtml.baseWidth + "px";
    frame.style.height = PPTHtml.baseHeight + "px";
    frame.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
  }

  function fitPresentationFrame(frame, viewport) {
    if (!frame || !viewport) return;
    var scale = Math.min(viewport.clientWidth / PPTHtml.baseWidth, viewport.clientHeight / PPTHtml.baseHeight);
    scale = Math.max(0.1, scale);
    frame.style.width = PPTHtml.baseWidth + "px";
    frame.style.height = PPTHtml.baseHeight + "px";
    frame.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
  }

  function syncPresenterBackdrop() {
    var slideNode = els.presenterStage && els.presenterStage.querySelector(".ppt-slide");
    if (!slideNode) return;
    var background = window.getComputedStyle(slideNode).backgroundColor;
    if (background) els.presenter.style.background = background;
  }

  function requestPresenterFullscreen() {
    presenterFullscreenActive = false;

    if (desktop && desktop.isDesktop && typeof desktop.setFullScreen === "function") {
      desktop.setFullScreen(true).then(function () {
        presenterFullscreenActive = true;
      }).catch(function () {
        requestBrowserFullscreen();
      });
      return;
    }

    requestBrowserFullscreen();
  }

  function requestBrowserFullscreen() {
    if (!els.presenter.requestFullscreen) return;
    var result = els.presenter.requestFullscreen();
    if (result && result.then) {
      result.then(function () {
        presenterFullscreenActive = true;
      }).catch(function () {
        presenterFullscreenActive = false;
      });
    }
  }

  function exitPresenterFullscreen() {
    presenterFullscreenActive = false;

    if (desktop && desktop.isDesktop && typeof desktop.setFullScreen === "function") {
      desktop.setFullScreen(false).catch(function () {});
    }

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }
  }

  function togglePresenterFullscreen(event) {
    if (!presenting) return;
    if (event && event.target && event.target.closest(".presenter-controls")) return;
    showPresenterChrome();

    if (desktop && desktop.isDesktop) {
      if (presenterFullscreenActive) exitPresenterFullscreen();
      else requestPresenterFullscreen();
      return;
    }

    if (!document.fullscreenElement) {
      requestPresenterFullscreen();
      return;
    }

    exitPresenterFullscreen();
  }

  function showPresenterChrome() {
    if (!presenting) return;
    window.clearTimeout(presenterUiTimer);
    els.presenter.classList.remove("is-ui-hidden");
    presenterUiTimer = window.setTimeout(function () {
      if (presenting) els.presenter.classList.add("is-ui-hidden");
    }, 1800);
  }

  function handleDocumentFullscreenChange() {
    if (!presenting) return;
    if (!document.fullscreenElement && presenterFullscreenActive) {
      closePresenter({ skipFullscreenExit: true });
    }
  }

  function openPresenter(index) {
    presenting = true;
    presentIndex = index || 0;
    els.presenter.hidden = false;
    showPresentationSlide(presentIndex);
    document.body.classList.add("is-presenting");
    showPresenterChrome();
    requestPresenterFullscreen();
  }

  function showPresentationSlide(index) {
    presentIndex = clamp(index, 0, deck.slides.length - 1);
    els.presenterStage.innerHTML = "";
    els.presenterStage.appendChild(PPTHtml.renderSlide(deck.slides[presentIndex], deck, { index: presentIndex }));
    els.presentCounter.textContent = (presentIndex + 1) + " / " + deck.slides.length;
    fitPresentationFrame(els.presenterStage, els.presenter);
    syncPresenterBackdrop();
  }

  function closePresenter(options) {
    var settings = options || {};
    presenting = false;
    window.clearTimeout(presenterUiTimer);
    els.presenter.hidden = true;
    els.presenter.classList.remove("is-ui-hidden");
    els.presenter.style.background = "";
    document.body.classList.remove("is-presenting");
    if (!settings.skipFullscreenExit) exitPresenterFullscreen();
    currentIndex = clamp(presentIndex, 0, deck.slides.length - 1);
    renderAll();
  }

  function loadInitialDeck() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return PPTHtml.normalizeDeck(JSON.parse(saved));
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
    return PPTHtml.normalizeDeck(PPTHtml.createDemoDeck());
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    } catch (error) {
      // Local storage can fail in private windows; editing still works.
    }
  }

  function parseRows(text) {
    return String(text || "").split(/\n+/).map(function (line) {
      var cells = splitCells(line);
      if (!cells.length) return null;
      if (cells.length === 1) return { title: cells[0], text: cells[0] };
      return { title: cells[0], text: cells.slice(1).join(" | ") };
    }).filter(Boolean);
  }

  function stringifyRows(rows) {
    return (rows || []).map(function (row) {
      if (typeof row === "string") return row;
      if (row.title && row.text && row.title !== row.text) return row.title + " | " + row.text;
      return row.text || row.title || "";
    }).join("\n");
  }

  function parseMetrics(text) {
    return String(text || "").split(/\n+/).map(function (line) {
      var cells = splitCells(line);
      if (!cells.length) return null;
      return {
        value: cells[0] || "",
        label: cells[1] || "",
        detail: cells.slice(2).join(" | ")
      };
    }).filter(Boolean);
  }

  function stringifyMetrics(metrics) {
    return (metrics || []).map(function (metric) {
      return [metric.value, metric.label, metric.detail].filter(function (value) {
        return value != null && value !== "";
      }).join(" | ");
    }).join("\n");
  }

  function ensureChart(slide) {
    if (!slide.chart || typeof slide.chart !== "object") {
      slide.chart = { kind: "bar", labels: [], series: [], unit: "" };
    }
    if (!Array.isArray(slide.chart.labels)) slide.chart.labels = [];
    if (!Array.isArray(slide.chart.series)) slide.chart.series = [];
    return slide.chart;
  }

  function parseChartSeries(text) {
    return String(text || "").split(/\n+/).map(function (line) {
      var cells = splitCells(line);
      if (!cells.length) return null;
      return {
        name: cells[0] || "",
        values: cells.slice(1).map(function (value) {
          var number = Number(value);
          return isFinite(number) ? number : 0;
        })
      };
    }).filter(function (series) {
      return series && series.values.length;
    });
  }

  function stringifyChartSeries(seriesList) {
    return (seriesList || []).map(function (series) {
      return [series.name || ""].concat(series.values || []).join(" | ");
    }).join("\n");
  }

  function parseTableRows(text) {
    return String(text || "").split(/\n+/).map(splitCells).filter(function (row) {
      return row.length;
    });
  }

  function stringifyTableRows(rows) {
    return (rows || []).map(function (row) {
      return row.join(" | ");
    }).join("\n");
  }

  function splitCells(line) {
    return String(line || "").split("|").map(function (cell) {
      return cell.trim();
    }).filter(Boolean);
  }

  function layoutLabel(value) {
    var found = PPTHtml.layouts.find(function (item) { return item[0] === value; });
    return found ? found[1] : value;
  }

  function filenameFromTitle(title) {
    var safe = String(title || "deck").trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-");
    return (safe || "deck") + ".ppt.html";
  }

  function basename(filePath) {
    return String(filePath || "").split(/[\\/]/).pop() || "未命名";
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function toast(message) {
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("show");
    toastTimer = window.setTimeout(function () {
      els.toast.classList.remove("show");
    }, 2200);
  }
})();
