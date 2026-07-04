(function () {
  "use strict";

  var STORAGE_KEY = "ppt-html-studio-draft-v01";
  var APP_VERSION_LABEL = "v0.2";
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
      if (presenting) fitFrame(els.presenterStage, els.presenter);
    });
  }

  function cacheElements() {
    [
      "newDeckBtn", "templatesBtn", "openDeckBtn", "downloadDeckBtn", "saveAsDeckBtn", "jsonBtn", "validateBtn", "presentBtn",
      "fileInput", "imageFileInput", "fileStatus",
      "addSlideBtn", "slideList", "duplicateSlideBtn", "moveSlideUpBtn", "moveSlideDownBtn", "deleteSlideBtn",
      "currentSlideLabel", "currentSlideTitle", "undoBtn", "redoBtn", "stageViewport", "stageFrame",
      "deckTitleInput", "deckThemeInput", "slideLayoutInput", "kickerInput", "titleInput", "subtitleInput", "bodyInput",
      "imageFileBtn", "imageSrcInput", "imageAltInput", "itemsInput", "leftTitleInput", "leftTextInput", "rightTitleInput", "rightTextInput",
      "cardsInput", "metricsInput", "tableColumnsInput", "tableRowsInput", "quoteInput", "authorInput", "codeInput", "notesInput",
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
    bindSlideInput(els.imageSrcInput, function (slide, value) { slide.image.src = value; });
    bindSlideInput(els.imageAltInput, function (slide, value) { slide.image.alt = value; });
    bindSlideInput(els.itemsInput, function (slide, value) { slide.items = parseRows(value); });
    bindSlideInput(els.leftTitleInput, function (slide, value) { slide.left.title = value; });
    bindSlideInput(els.leftTextInput, function (slide, value) { slide.left.text = value; });
    bindSlideInput(els.rightTitleInput, function (slide, value) { slide.right.title = value; });
    bindSlideInput(els.rightTextInput, function (slide, value) { slide.right.text = value; });
    bindSlideInput(els.cardsInput, function (slide, value) { slide.cards = parseRows(value); });
    bindSlideInput(els.metricsInput, function (slide, value) { slide.metrics = parseMetrics(value); });
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

    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveDeck(event.shiftKey);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "o") {
        event.preventDefault();
        openDeck();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        createNewDeck();
        return;
      }
      if (event.target && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
      if (presenting) {
        if (event.key === "Escape") closePresenter();
        if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") showPresentationSlide(presentIndex + 1);
        if (event.key === "ArrowLeft" || event.key === "PageUp") showPresentationSlide(presentIndex - 1);
      }
    });
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
      button.querySelector("strong").textContent = slide.title || "未命名页面";
      button.querySelector("small").textContent = layoutLabel(slide.layout);
      button.addEventListener("pointerdown", function (event) {
        event.preventDefault();
        selectSlide(index);
      });
      button.addEventListener("click", function () {
        selectSlide(index);
      });
      els.slideList.appendChild(button);
    });
  }

  function selectSlide(index) {
    if (index === currentIndex) return;
    currentIndex = index;
    renderAll();
  }

  function renderCanvas() {
    els.stageFrame.innerHTML = "";
    els.stageFrame.appendChild(PPTHtml.renderSlide(currentSlide(), deck, { index: currentIndex }));
    els.currentSlideLabel.textContent = "第 " + (currentIndex + 1) + " 页";
    els.currentSlideTitle.textContent = currentSlide().title || "未命名页面";
    fitFrame(els.stageFrame, els.stageViewport);
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
    els.imageSrcInput.value = slide.image.src || "";
    els.imageAltInput.value = slide.image.alt || "";
    els.itemsInput.value = stringifyRows(slide.items);
    els.leftTitleInput.value = slide.left.title || "";
    els.leftTextInput.value = slide.left.text || "";
    els.rightTitleInput.value = slide.right.title || "";
    els.rightTextInput.value = slide.right.text || "";
    els.cardsInput.value = stringifyRows(slide.cards);
    els.metricsInput.value = stringifyMetrics(slide.metrics);
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

  function openPresenter(index) {
    presenting = true;
    presentIndex = index || 0;
    els.presenter.hidden = false;
    showPresentationSlide(presentIndex);
    document.body.classList.add("is-presenting");
  }

  function showPresentationSlide(index) {
    presentIndex = clamp(index, 0, deck.slides.length - 1);
    els.presenterStage.innerHTML = "";
    els.presenterStage.appendChild(PPTHtml.renderSlide(deck.slides[presentIndex], deck, { index: presentIndex }));
    els.presentCounter.textContent = (presentIndex + 1) + " / " + deck.slides.length;
    fitFrame(els.presenterStage, els.presenter);
  }

  function closePresenter() {
    presenting = false;
    els.presenter.hidden = true;
    document.body.classList.remove("is-presenting");
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
