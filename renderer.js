(function () {
  "use strict";

  var FORMAT_VERSION = "0.1";
  var BASE_WIDTH = 1280;
  var BASE_HEIGHT = 720;
  var THEMES = ["paper", "launch", "studio", "boardroom"];

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
    ".ppt-media{position:relative;overflow:hidden;margin:0;border-radius:8px;background:var(--ppt-surface);border:1px solid var(--ppt-line);min-height:260px}",
    ".ppt-media img{display:block;width:100%;height:100%;object-fit:cover}",
    ".ppt-media[data-fit='contain'] img{object-fit:contain;background:var(--ppt-surface)}",
    ".ppt-caption{position:absolute;left:18px;right:18px;bottom:14px;padding:8px 10px;border-radius:6px;background:rgba(0,0,0,.48);color:#fff;font-size:17px;line-height:1.3}",
    ".ppt-image-placeholder{display:grid;place-items:center;width:100%;height:100%;min-height:360px;color:var(--ppt-muted);font-size:22px;background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(0,0,0,.04))}",
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
    slide.items = asArray(slide.items);
    slide.cards = asArray(slide.cards);
    slide.metrics = asArray(slide.metrics);
    slide.left = slide.left && typeof slide.left === "object" ? slide.left : { title: "Before", text: "" };
    slide.right = slide.right && typeof slide.right === "object" ? slide.right : { title: "After", text: "" };
    slide.table = slide.table && typeof slide.table === "object" ? slide.table : { columns: [], rows: [] };
    slide.table.columns = asArray(slide.table.columns);
    slide.table.rows = asArray(slide.table.rows);
    slide.quote = safeText(slide.quote);
    slide.author = safeText(slide.author);
    slide.code = safeText(slide.code);
    slide.notes = safeText(slide.notes);
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
      return article;
    }

    if (slide.layout === "section") {
      article.appendChild(el("div", "ppt-section-number", String(index + 1).padStart(2, "0")));
      article.appendChild(createContentStack(slide, false));
      return article;
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
      return article;
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
      return article;
    }

    if (slide.layout === "imageBackground") {
      var backgroundMedia = createMedia(slide.image);
      backgroundMedia.classList.add("ppt-background-media");
      article.appendChild(backgroundMedia);
      article.appendChild(createContentStack(slide, true));
      return article;
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
      return article;
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
      return article;
    }

    if (slide.layout === "quote") {
      article.appendChild(el("div", "ppt-quote-mark", "“"));
      appendText(article, "p", "ppt-quote", slide.quote || slide.title);
      appendText(article, "p", "ppt-author", slide.author || slide.subtitle);
      return article;
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
      return article;
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
      return article;
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
      return article;
    }

    if (slide.layout === "code") {
      article.appendChild(createContentStack(slide, false));
      article.appendChild(el("pre", "ppt-code", slide.code || "const deck = await createPptHtml();"));
      return article;
    }

    if (slide.layout === "ending") {
      article.appendChild(el("div", "ppt-ending-line"));
      appendText(article, "h1", "ppt-title", slide.title);
      appendText(article, "p", "ppt-subtitle", slide.subtitle);
      return article;
    }

    article.appendChild(createContentStack(slide, true));
    return article;
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

  function standaloneSource() {
    return "(function(){'use strict';" +
      "var d=JSON.parse(document.getElementById('ppt-html-data').textContent),i=0,w=1280,h=720,t=0;" +
      "function e(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x)n.textContent=x;return n}" +
      "function a(p,t,c,x){if(x==null||x==='')return;var n=e(t,c,x);p.appendChild(n);return n}" +
      "function arr(v){return Array.isArray(v)?v:[]}" +
      "function media(m){m=m||{};var b=e('figure','ppt-media');b.setAttribute('data-fit',m.fit==='contain'?'contain':'cover');if(m.src){var im=document.createElement('img');im.src=m.src;im.alt=m.alt||'';b.appendChild(im)}else b.appendChild(e('div','ppt-image-placeholder','Image'));a(b,'figcaption','ppt-caption',m.caption);return b}" +
      "function list(items){var u=e('ul','ppt-list');arr(items).slice(0,6).forEach(function(it){var x=typeof it==='string'?it:(it.text||it.title||'');if(x)u.appendChild(e('li','',x))});return u}" +
      "function stack(s,li){var x=e('div','ppt-content-stack');a(x,'div','ppt-kicker',s.kicker);a(x,'h1','ppt-title',s.title);a(x,'p','ppt-subtitle',s.subtitle);a(x,'p','ppt-body',s.body);if(li&&arr(s.items).length)x.appendChild(list(s.items));return x}" +
      "function slide(s){s=s||{};var n=e('article','ppt-slide ppt-theme-'+(d.theme||'paper')+' ppt-layout-'+(s.layout||'text'));if(s.layout==='hero'){a(n,'div','ppt-kicker',s.kicker);a(n,'h1','ppt-title',s.title);a(n,'p','ppt-subtitle',s.subtitle);if(s.image&&s.image.src){var hi=media(s.image);hi.classList.add('ppt-hero-image');n.appendChild(hi)}return n}if(s.layout==='section'){n.appendChild(e('div','ppt-section-number',String(i+1).padStart(2,'0')));n.appendChild(stack(s,false));return n}if(s.layout==='imageRight'||s.layout==='imageLeft'){var c=stack(s,true),m=media(s.image);if(s.layout==='imageLeft'){n.appendChild(m);n.appendChild(c)}else{n.appendChild(c);n.appendChild(m)}return n}if(s.layout==='imageFull'){var fm=media(s.image);fm.classList.add('ppt-full-media');n.appendChild(fm);if(s.title||s.subtitle){var ov=e('div','ppt-image-overlay');a(ov,'h1','ppt-title',s.title);a(ov,'p','ppt-subtitle',s.subtitle);n.appendChild(ov)}return n}if(s.layout==='imageBackground'){var bm=media(s.image);bm.classList.add('ppt-background-media');n.appendChild(bm);n.appendChild(stack(s,true));return n}if(s.layout==='compare'){n.appendChild(stack(s,false));var g=e('div','ppt-compare-grid');[s.left||{},s.right||{}].forEach(function(o){var ca=e('section','ppt-compare-card');a(ca,'h2','',o.title);a(ca,'p','',o.text);g.appendChild(ca)});n.appendChild(g);return n}if(s.layout==='threeCards'){n.appendChild(stack(s,false));var cg=e('div','ppt-card-grid');arr(s.cards).slice(0,3).forEach(function(o){var ca=e('section','ppt-card');a(ca,'h2','',o.title);a(ca,'p','',o.text);cg.appendChild(ca)});n.appendChild(cg);return n}if(s.layout==='quote'){n.appendChild(e('div','ppt-quote-mark','“'));a(n,'p','ppt-quote',s.quote||s.title);a(n,'p','ppt-author',s.author||s.subtitle);return n}if(s.layout==='timeline'){n.appendChild(stack(s,false));var tl=e('div','ppt-timeline');arr(s.items).slice(0,5).forEach(function(o){var r=e('section','ppt-time-item');a(r,'h2','',o.title||o.text||'');a(r,'p','',o.text&&o.title?o.text:'');tl.appendChild(r)});n.appendChild(tl);return n}if(s.layout==='data'){n.appendChild(stack(s,false));var mg=e('div','ppt-metric-grid');arr(s.metrics).slice(0,3).forEach(function(o){var b=e('section','ppt-metric');a(b,'strong','',o.value);a(b,'span','',o.label);a(b,'p','',o.detail);mg.appendChild(b)});n.appendChild(mg);return n}if(s.layout==='table'){n.appendChild(stack(s,false));var tb=e('table','ppt-table'),th=document.createElement('thead'),hr=document.createElement('tr');arr((s.table||{}).columns).forEach(function(c){hr.appendChild(e('th','',c))});th.appendChild(hr);tb.appendChild(th);var bd=document.createElement('tbody');arr((s.table||{}).rows).slice(0,6).forEach(function(r){var tr=document.createElement('tr');arr(r).forEach(function(c){tr.appendChild(e('td','',c))});bd.appendChild(tr)});tb.appendChild(bd);n.appendChild(tb);return n}if(s.layout==='code'){n.appendChild(stack(s,false));n.appendChild(e('pre','ppt-code',s.code||''));return n}if(s.layout==='ending'){n.appendChild(e('div','ppt-ending-line'));a(n,'h1','ppt-title',s.title);a(n,'p','ppt-subtitle',s.subtitle);return n}n.appendChild(stack(s,true));return n}" +
      "var root=document.getElementById('ppt-player-root'),stage=e('div','ppt-player-stage'),bar=e('div','ppt-player-bar'),prev=e('button','','上一页'),count=e('span','',''),next=e('button','','下一页'),full=e('button','','全屏');bar.appendChild(prev);bar.appendChild(count);bar.appendChild(next);bar.appendChild(full);root.appendChild(stage);root.appendChild(bar);" +
      "function fit(){var sc=Math.min(window.innerWidth/w,(window.innerHeight-72)/h);stage.style.width=w+'px';stage.style.height=h+'px';stage.style.transform='translate(-50%,-50%) scale('+Math.max(.1,sc)+')'}" +
      "function chrome(){clearTimeout(t);root.classList.remove('is-ui-hidden');t=setTimeout(function(){root.classList.add('is-ui-hidden')},1800)}" +
      "function show(n){i=Math.max(0,Math.min(arr(d.slides).length-1,n));stage.innerHTML='';stage.appendChild(slide(arr(d.slides)[i]||{}));count.textContent=(i+1)+' / '+arr(d.slides).length;location.hash='slide-'+(i+1);fit();chrome()}" +
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
      "  <title>" + title + "</title>\n" +
      "  <link rel=\"icon\" href=\"data:,\">\n" +
      "  <style>\n" + SLIDE_CSS + "\n" +
      "    html,body{margin:0;min-height:100%;background:#101214;color:#f4f4f4;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0}\n" +
      "    #ppt-player-root{position:fixed;inset:0;display:grid;place-items:center;overflow:hidden;background:#101214}\n" +
      "    #ppt-player-root.is-ui-hidden{cursor:none}\n" +
      "    .ppt-player-stage{position:absolute;top:50%;left:50%;transform-origin:center center}\n" +
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
    exportStandalone: exportStandalone,
    download: download,
    uid: uid
  };
})();
