(function () {
  "use strict";

  var STORAGE_KEY = "ppt-html-studio-draft-v01";
  var LANG_STORAGE_KEY = "ppt-html-studio-lang-v01";
  var APP_VERSION_LABEL = "v0.2.15";
  var desktop = window.htmlpptDesktop || null;
  var deck = PPTHtml.normalizeDeck(loadInitialDeck());
  var uiLang = loadLanguage();
  var currentIndex = 0;
  var currentFilePath = "";
  var dirty = false;
  var saving = false;
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
  var selectedCanvasPaths = [];
  var canvasClipboard = null;
  var canvasContextPoint = null;
  var slideClipboard = null;
  var slideContextIndex = -1;
  var presenterUiTimer = 0;
  var presenterTransitionTimer = 0;
  var presenterFullscreenActive = false;
  var presenterScaleMode = "fit";
  var presenterBlankMode = "";
  var presenterJumpBuffer = "";
  var presenterJumpTimer = 0;
  var presenterClickTimer = 0;
  var suppressNextPresenterClick = false;
  var pendingMediaInsertType = "";
  var pendingMediaObjectPath = "";
  var pendingMediaPlaceholderPath = "";
  var liveRenderFrame = 0;
  var pendingLiveCanvas = false;
  var pendingLiveSlideList = false;
  var canvasZoomMode = "fit";
  var canvasZoom = 1;
  var canvasFitScale = 1;
  var canvasPanX = 0;
  var canvasPanY = 0;
  var canvasSpacePanning = false;
  var activeCanvasPan = null;
  var persistTimer = 0;
  var tooltipEl = null;
  var tooltipTarget = null;
  var tooltipTimer = 0;

  var els = {};
  var I18N = {
    "zh-CN": {
      "action.new": "新建",
      "action.templates": "模板",
      "action.open": "打开",
      "action.save": "保存 / 下载",
      "action.saveDesktop": "保存",
      "action.saveAs": "另存为",
      "action.aiJson": "AI JSON",
      "action.validate": "检查",
      "action.present": "从当前页演示",
      "action.undo": "撤销",
      "action.redo": "重做",
      "action.pickImage": "选择本地图片",
      "action.pickVideo": "选择本地视频",
      "aria.fileActions": "文件操作",
      "aria.slideList": "幻灯片列表",
      "aria.insertComponents": "插入组件",
      "aria.workspace": "编辑画布",
      "aria.inspector": "属性面板",
      "language.label": "界面语言",
      "rail.pages": "幻灯片",
      "rail.addSlide": "新建幻灯片",
      "rail.duplicate": "复制幻灯片",
      "rail.duplicateShort": "复制",
      "rail.moveUp": "上移幻灯片",
      "rail.moveUpShort": "上移",
      "rail.moveDown": "下移幻灯片",
      "rail.moveDownShort": "下移",
      "rail.delete": "删除幻灯片",
      "rail.deleteShort": "删除",
      "insert.title": "插入",
      "insert.text": "文本",
      "insert.image": "图片",
      "insert.video": "视频",
      "insert.chart": "图表",
      "insert.table": "表格",
      "insert.cards": "卡片",
      "insert.metrics": "数据",
      "insert.timeline": "时间线",
      "insert.quote": "引用",
      "insert.code": "代码",
      "insert.text.title": "新增可编辑文本框",
      "insert.image.title": "插入图片到当前页，或拖到画布定位",
      "insert.video.title": "插入视频到当前页，或拖到画布定位",
      "insert.chart.title": "插入可编辑图表",
      "insert.table.title": "插入表格",
      "insert.cards.title": "插入三卡片组件",
      "insert.metrics.title": "插入数据指标组件",
      "insert.timeline.title": "插入时间线组件",
      "insert.quote.title": "插入引用页",
      "insert.code.title": "插入代码页",
      "panel.deck": "文稿",
      "panel.slide": "页面",
      "panel.image": "图片",
      "panel.video": "视频",
      "panel.list": "列表",
      "panel.compare": "对比",
      "panel.cards": "卡片",
      "panel.metrics": "数据",
      "panel.chart": "图表",
      "panel.table": "表格",
      "panel.quote": "引用",
      "panel.code": "代码",
      "panel.notes": "备注",
      "field.deckName": "名称",
      "field.theme": "主题",
      "field.layout": "版式",
      "field.kicker": "眉标",
      "field.title": "标题",
      "field.subtitle": "副标题",
      "field.body": "正文",
      "field.fit": "适配",
      "field.imageSrc": "图片 URL 或 Data URI",
      "field.videoSrc": "视频 URL 或 Data URI",
      "field.poster": "封面 URL",
      "field.alt": "替代文字",
      "field.caption": "说明",
      "field.listRows": "每行一条；时间线可用 “标题 | 内容”",
      "field.leftTitle": "左侧标题",
      "field.leftText": "左侧内容",
      "field.rightTitle": "右侧标题",
      "field.rightText": "右侧内容",
      "field.cardsRows": "每行一张卡片：标题 | 内容",
      "field.metricsRows": "每行一个指标：数值 | 标签 | 说明",
      "field.chartKind": "图表类型",
      "field.chartLabels": "标签，用 | 分隔",
      "field.chartSeries": "数据系列：每行一个系列，名称 | 数值 | 数值",
      "field.unit": "单位",
      "field.tableColumns": "表头，用 | 分隔",
      "field.tableRows": "每行一组单元格，用 | 分隔",
      "field.quote": "引文",
      "field.author": "作者",
      "field.code": "代码内容",
      "field.notes": "演讲备注",
      "option.cover": "填充裁切",
      "option.contain": "完整显示",
      "option.bar": "柱状图",
      "option.line": "折线图",
      "option.donut": "环形图",
      "placeholder.chartLabels": "Q1 | Q2 | Q3 | Q4",
      "placeholder.chartSeries": "收入 | 12 | 20 | 31\n成本 | 8 | 11 | 18",
      "placeholder.unit": "万元",
      "present.prev": "上一页",
      "present.next": "下一页",
      "present.exit": "退出",
      "dialog.aiJson": "AI JSON",
      "dialog.templates": "选择模板",
      "dialog.templatesHint": "从模板开始时会替换当前文稿；空白文稿请点顶部的新建。",
      "dialog.validation": "质量检查",
      "dialog.close": "关闭",
      "dialog.cancel": "取消",
      "dialog.copyJson": "复制当前 JSON",
      "dialog.loadJson": "从文本载入",
      "dialog.copyReport": "复制报告",
      "dialog.copyRepairPrompt": "复制 AI 修复 Prompt",
      "field.mediaSrc": "媒体 URL 或 Data URI",
      "object.typedMedia": "媒体内容",
      "object.typedChart": "图表内容",
      "object.typedTable": "表格内容",
      "template.aiCamera.name": "AI 导演相机",
      "template.aiCamera.desc": "硬件发布 demo：问题、流程、数据和产品主张。",
      "template.productPitch.name": "产品发布",
      "template.productPitch.desc": "知识库 AI 助手发布稿，含痛点、证据、发布计划。",
      "template.investorPitch.name": "融资路演",
      "template.investorPitch.desc": "种子轮融资范例，含市场压力、牵引力、资金用途。",
      "template.enterpriseProposal.name": "企业销售方案",
      "template.enterpriseProposal.desc": "面向客户的解决方案、ROI 和试点成功计划。",
      "template.researchBrief.name": "研究决策简报",
      "template.researchBrief.desc": "用访谈、数据和竞品证据支持一个产品决策。",
      "template.productReview.name": "产品评审",
      "template.productReview.desc": "评审流程改版，含问题、路径、取舍和实验指标。",
      "template.projectUpdate.name": "QBR 业务复盘",
      "template.projectUpdate.desc": "季度业务复盘，含漏斗、学习、下季度下注。",
      "template.lesson.name": "实战工作坊",
      "template.lesson.desc": "90 分钟培训课，含目标、流程、练习材料和作业。",
      "template.incidentReview.name": "事故复盘",
      "template.incidentReview.desc": "线上事故复盘，含影响、时间线、根因和行动项。",
      "template.marketingCampaign.name": "营销战役",
      "template.marketingCampaign.desc": "会员增长活动，含人群洞察、渠道预算和 21 天节奏。",
      "layout.hero": "封面",
      "layout.section": "章节",
      "layout.text": "文本",
      "layout.imageRight": "左文右图",
      "layout.imageLeft": "左图右文",
      "layout.imageFull": "全屏图片",
      "layout.imageBackground": "背景图文",
      "layout.compare": "对比",
      "layout.threeCards": "三卡片",
      "layout.quote": "引用",
      "layout.timeline": "时间线",
      "layout.data": "数据",
      "layout.chart": "图表",
      "layout.video": "视频",
      "layout.table": "表格",
      "layout.code": "代码",
      "layout.ending": "结束",
      "status.untitled": "未命名",
      "status.browserDraft": "浏览器草稿",
      "status.unsaved": "未保存",
      "slide.untitled": "未命名页面",
      "slide.current": "第 {number} 页",
      "slide.copySuffix": "副本",
      "canvas.image": "图片",
      "canvas.video": "视频",
      "canvas.chart": "图表",
      "canvas.table": "表格",
      "canvas.cards": "卡片组",
      "canvas.metrics": "数据组",
      "canvas.timeline": "时间线",
      "canvas.textBox": "文本框",
      "canvas.object": "对象",
      "canvas.reset": "重置",
      "canvas.resetTitle": "重置这个元素的位置和尺寸",
      "canvas.resize": "拖拽调整尺寸",
      "canvas.delete": "删除",
      "canvas.deleteTitle": "删除选中的画布元素",
      "tooltip.slideThumb": "第 {number} 张幻灯片：{title} · {layout}。拖动可调整顺序。",
      "toast.languageChanged": "语言已切换",
      "toast.imageAdded": "图片已加入当前页面",
      "toast.videoAdded": "视频已加入当前页面",
      "toast.componentInserted": "已插入{name}",
      "toast.componentSelected": "已选中{name}，可以拖拽或调整尺寸",
      "toast.deleted": "已删除选中元素",
      "toast.jsonCopied": "JSON 已复制",
      "toast.jsonLoaded": "JSON 已载入",
      "toast.reportCopied": "检查报告已复制",
      "toast.repairPromptCopied": "AI 修复 Prompt 已复制",
      "toast.newDeck": "已新建演示文稿",
      "toast.templateCreated": "已从模板创建",
      "toast.opened": "已打开 {name}",
      "toast.saved": "已保存 {name}",
      "toast.downloaded": "已生成单文件 PPT.html",
      "toast.validationErrors": "{prefix} · 有 {count} 个错误",
      "toast.validationWarnings": "{prefix} · 有 {count} 个建议",
      "toast.validationPassed": "{prefix} · 检查通过",
      "alert.openFailed": "打开失败：{message}",
      "alert.loadFailed": "载入失败：{message}",
      "alert.saveFailed": "保存失败：{message}",
      "confirm.keepOneSlide": "至少保留一页。",
      "confirm.deleteSlide": "删除当前幻灯片？",
      "confirm.discard": "当前文稿有未保存修改。继续会丢失这些修改。",
      "validation.pass": "检查通过：{count} 页，可正常分享。",
      "validation.needsFix": "需要修复：{errors} 个错误，{warnings} 个警告。",
      "sample.newSlideTitle": "新页面",
      "sample.newSlideSubtitle": "把核心信息整理成一页清晰的演示内容。",
      "sample.textTitle": "新的文本页",
      "sample.textBody": "用一段清晰正文说明观点，再用要点承接下一页。",
      "sample.textBox": "双击输入文本",
      "sample.textTitleBox": "点击输入标题",
      "sample.textSubtitleBox": "点击输入副标题",
      "sample.textBodyBox": "用一段正文说明关键观点。",
      "sample.textBulletBox": "• 第一个要点\n• 第二个要点\n• 第三个要点",
      "sample.textLabelBox": "标签",
      "sample.point1": "第一个要点",
      "sample.point2": "第二个要点",
      "sample.imageTitle": "图片展示",
      "sample.imageCaption": "",
      "sample.videoTitle": "视频展示",
      "sample.videoCaption": "",
      "sample.chartTitle": "季度增长",
      "sample.q1": "Q1",
      "sample.q2": "Q2",
      "sample.q3": "Q3",
      "sample.q4": "Q4",
      "sample.revenue": "收入",
      "sample.cost": "成本",
      "sample.unit": "万元",
      "sample.tableTitle": "项目表格",
      "sample.phase": "阶段",
      "sample.owner": "负责人",
      "sample.status": "状态",
      "sample.plan": "计划",
      "sample.team": "团队",
      "sample.done": "完成",
      "sample.prototype": "原型",
      "sample.design": "设计",
      "sample.progress": "进行中",
      "sample.cardsTitle": "三个核心点",
      "sample.card1Title": "清晰",
      "sample.card1Text": "把复杂内容拆成可理解的结构。",
      "sample.card2Title": "稳定",
      "sample.card2Text": "用模板保证每页都能正常展示。",
      "sample.card3Title": "可复用",
      "sample.card3Text": "结构和素材可以沉淀为后续项目资产。",
      "sample.metricsTitle": "关键数据",
      "sample.speed": "速度",
      "sample.speedDetail": "从想法到演示更快。",
      "sample.growth": "增长",
      "sample.growthDetail": "用于展示核心趋势。",
      "sample.fileDetail": "单文件便于分享。",
      "sample.timelineTitle": "执行步骤",
      "sample.step1": "第一步",
      "sample.step1Text": "确定主题和受众。",
      "sample.step2": "第二步",
      "sample.step2Text": "生成内容结构。",
      "sample.step3": "第三步",
      "sample.step3Text": "演示并继续修改。",
      "sample.quoteText": "好的演示不是堆满内容，而是让观众跟上你的思路。",
      "sample.quoteAuthor": "PPT.html Studio",
      "sample.codeTitle": "代码示例"
    }
  };

  extendLang("en-US", {
    "action.new": "New",
    "action.templates": "Templates",
    "action.open": "Open",
    "action.save": "Save / Download",
    "action.saveDesktop": "Save",
    "action.saveAs": "Save As",
    "action.validate": "Check",
    "action.present": "Present current slide",
    "action.undo": "Undo",
    "action.redo": "Redo",
    "action.pickImage": "Choose Image",
    "action.pickVideo": "Choose Video",
    "aria.fileActions": "File actions",
    "aria.slideList": "Slide list",
    "aria.insertComponents": "Insert components",
    "aria.workspace": "Editing canvas",
    "aria.inspector": "Inspector",
    "language.label": "Interface language",
    "rail.pages": "Slides",
    "rail.addSlide": "Add slide",
    "rail.duplicate": "Duplicate slide",
    "rail.duplicateShort": "Duplicate",
    "rail.moveUp": "Move up",
    "rail.moveUpShort": "Up",
    "rail.moveDown": "Move down",
    "rail.moveDownShort": "Down",
    "rail.delete": "Delete",
    "rail.deleteShort": "Delete",
    "insert.title": "Insert",
    "insert.text": "Text",
    "insert.image": "Image",
    "insert.video": "Video",
    "insert.chart": "Chart",
    "insert.table": "Table",
    "insert.cards": "Cards",
    "insert.metrics": "Data",
    "insert.timeline": "Timeline",
    "insert.quote": "Quote",
    "insert.code": "Code",
    "insert.text.title": "Add editable text box",
    "insert.image.title": "Insert an image on this slide, or drag to position it",
    "insert.video.title": "Insert a video on this slide, or drag to position it",
    "insert.chart.title": "Insert an editable chart",
    "insert.table.title": "Insert a table",
    "insert.cards.title": "Insert a three-card section",
    "insert.metrics.title": "Insert metric cards",
    "insert.timeline.title": "Insert a timeline",
    "insert.quote.title": "Insert a quote slide",
    "insert.code.title": "Insert a code slide",
    "panel.deck": "Deck",
    "panel.slide": "Slide",
    "panel.image": "Image",
    "panel.video": "Video",
    "panel.list": "List",
    "panel.compare": "Compare",
    "panel.cards": "Cards",
    "panel.metrics": "Data",
    "panel.chart": "Chart",
    "panel.table": "Table",
    "panel.quote": "Quote",
    "panel.code": "Code",
    "panel.notes": "Notes",
    "field.deckName": "Name",
    "field.theme": "Theme",
    "field.layout": "Layout",
    "field.kicker": "Kicker",
    "field.title": "Title",
    "field.subtitle": "Subtitle",
    "field.body": "Body",
    "field.fit": "Fit",
    "field.imageSrc": "Image URL or Data URI",
    "field.videoSrc": "Video URL or Data URI",
    "field.poster": "Poster URL",
    "field.alt": "Alt text",
    "field.caption": "Caption",
    "field.listRows": "One item per line; timeline supports Title | Text",
    "field.leftTitle": "Left title",
    "field.leftText": "Left text",
    "field.rightTitle": "Right title",
    "field.rightText": "Right text",
    "field.cardsRows": "One card per line: Title | Text",
    "field.metricsRows": "One metric per line: Value | Label | Detail",
    "field.chartKind": "Chart type",
    "field.chartLabels": "Labels, separated by |",
    "field.chartSeries": "Series: one per line, Name | Value | Value",
    "field.unit": "Unit",
    "field.tableColumns": "Headers, separated by |",
    "field.tableRows": "Rows, cells separated by |",
    "field.quote": "Quote",
    "field.author": "Author",
    "field.code": "Code",
    "field.notes": "Speaker notes",
    "option.cover": "Cover",
    "option.contain": "Contain",
    "option.bar": "Bar",
    "option.line": "Line",
    "option.donut": "Donut",
    "placeholder.chartSeries": "Revenue | 12 | 20 | 31\nCost | 8 | 11 | 18",
    "placeholder.unit": "k",
    "present.prev": "Previous",
    "present.next": "Next",
    "present.exit": "Exit",
    "dialog.templates": "Choose Template",
    "dialog.templatesHint": "Templates replace the current deck. Use New for a blank deck.",
    "dialog.validation": "Quality Check",
    "dialog.close": "Close",
    "dialog.cancel": "Cancel",
    "dialog.copyJson": "Copy JSON",
    "dialog.loadJson": "Load From Text",
    "dialog.copyReport": "Copy Report",
    "dialog.copyRepairPrompt": "Copy AI Repair Prompt",
    "field.mediaSrc": "Media URL or Data URI",
    "template.aiCamera.name": "AI Director Camera",
    "template.aiCamera.desc": "Hardware launch demo with problem, workflow, data, and positioning.",
    "template.productPitch.name": "Product Pitch",
    "template.productPitch.desc": "Knowledge-base AI assistant launch with pain, evidence, and rollout plan.",
    "template.investorPitch.name": "Investor Pitch",
    "template.investorPitch.desc": "Seed round example with market pressure, traction, and use of funds.",
    "template.enterpriseProposal.name": "Enterprise Proposal",
    "template.enterpriseProposal.desc": "Client-facing solution, ROI, and pilot success plan.",
    "template.researchBrief.name": "Research Brief",
    "template.researchBrief.desc": "Use interviews, data, and competitors to support one product decision.",
    "template.productReview.name": "Product Review",
    "template.productReview.desc": "Review a flow redesign with problem, journey, tradeoffs, and experiment metrics.",
    "template.projectUpdate.name": "QBR Business Review",
    "template.projectUpdate.desc": "Quarterly review with funnel, learnings, and next-quarter bets.",
    "template.lesson.name": "Workshop Deck",
    "template.lesson.desc": "90-minute training with outcomes, agenda, exercise materials, and homework.",
    "template.incidentReview.name": "Incident Review",
    "template.incidentReview.desc": "Production incident review with impact, timeline, root cause, and actions.",
    "template.marketingCampaign.name": "Marketing Campaign",
    "template.marketingCampaign.desc": "Membership growth campaign with audience insight, channel budget, and 21-day calendar.",
    "layout.hero": "Hero",
    "layout.section": "Section",
    "layout.text": "Text",
    "layout.imageRight": "Text + Image",
    "layout.imageLeft": "Image + Text",
    "layout.imageFull": "Full Image",
    "layout.imageBackground": "Image Background",
    "layout.compare": "Compare",
    "layout.threeCards": "Three Cards",
    "layout.quote": "Quote",
    "layout.timeline": "Timeline",
    "layout.data": "Data",
    "layout.chart": "Chart",
    "layout.video": "Video",
    "layout.table": "Table",
    "layout.code": "Code",
    "layout.ending": "Ending",
    "status.untitled": "Untitled",
    "status.browserDraft": "Browser Draft",
    "status.unsaved": "Unsaved",
    "slide.untitled": "Untitled Slide",
    "slide.current": "Slide {number}",
    "slide.copySuffix": "Copy",
    "canvas.image": "Image",
    "canvas.video": "Video",
    "canvas.chart": "Chart",
    "canvas.table": "Table",
    "canvas.cards": "Cards",
    "canvas.metrics": "Metrics",
    "canvas.timeline": "Timeline",
    "canvas.textBox": "Text box",
    "canvas.object": "Object",
    "canvas.reset": "Reset",
    "canvas.resetTitle": "Reset this element position and size",
    "canvas.resize": "Drag to resize",
    "canvas.delete": "Delete",
    "canvas.deleteTitle": "Delete the selected canvas element",
    "tooltip.slideThumb": "Slide {number}: {title} · {layout}. Drag to reorder.",
    "toast.languageChanged": "Language changed",
    "toast.imageAdded": "Image added to this slide",
    "toast.videoAdded": "Video added to this slide",
    "toast.componentInserted": "Inserted {name}",
    "toast.componentSelected": "{name} selected. Drag or resize it.",
    "toast.deleted": "Deleted selected element",
    "toast.jsonCopied": "JSON copied",
    "toast.jsonLoaded": "JSON loaded",
    "toast.reportCopied": "Report copied",
    "toast.repairPromptCopied": "AI repair prompt copied",
    "toast.newDeck": "New deck created",
    "toast.templateCreated": "Created from template",
    "toast.opened": "Opened {name}",
    "toast.saved": "Saved {name}",
    "toast.downloaded": "Standalone PPT.html generated",
    "toast.validationErrors": "{prefix} · {count} errors",
    "toast.validationWarnings": "{prefix} · {count} suggestions",
    "toast.validationPassed": "{prefix} · Passed",
    "alert.openFailed": "Open failed: {message}",
    "alert.loadFailed": "Load failed: {message}",
    "alert.saveFailed": "Save failed: {message}",
    "confirm.keepOneSlide": "Keep at least one slide.",
    "confirm.deleteSlide": "Delete the current slide?",
    "confirm.discard": "This deck has unsaved changes. Continue and discard them?",
    "validation.pass": "Passed: {count} slides, ready to share.",
    "validation.needsFix": "Needs fixes: {errors} errors, {warnings} warnings.",
    "sample.newSlideTitle": "New Slide",
    "sample.newSlideSubtitle": "A clear slide placeholder for the next part of the story.",
    "sample.textTitle": "New Text Slide",
    "sample.textBody": "Use this body copy to frame the idea before the supporting points.",
    "sample.textBox": "Click to type",
    "sample.textTitleBox": "Click to add title",
    "sample.textSubtitleBox": "Click to add subtitle",
    "sample.textBodyBox": "Use a body paragraph to explain the key idea.",
    "sample.textBulletBox": "• First point\n• Second point\n• Third point",
    "sample.textLabelBox": "Label",
    "sample.point1": "First point",
    "sample.point2": "Second point",
    "sample.imageTitle": "Image Showcase",
    "sample.imageCaption": "",
    "sample.videoTitle": "Video Showcase",
    "sample.videoCaption": "",
    "sample.chartTitle": "Quarterly Growth",
    "sample.revenue": "Revenue",
    "sample.cost": "Cost",
    "sample.unit": "k",
    "sample.tableTitle": "Project Table",
    "sample.phase": "Phase",
    "sample.owner": "Owner",
    "sample.status": "Status",
    "sample.plan": "Plan",
    "sample.team": "Team",
    "sample.done": "Done",
    "sample.prototype": "Prototype",
    "sample.design": "Design",
    "sample.progress": "In Progress",
    "sample.cardsTitle": "Three Key Points",
    "sample.card1Title": "Clear",
    "sample.card1Text": "Break complex content into understandable structure.",
    "sample.card2Title": "Stable",
    "sample.card2Text": "Templates keep every slide presentable.",
    "sample.card3Title": "Reusable",
    "sample.card3Text": "Structure and assets can become a starting point for the next deck.",
    "sample.metricsTitle": "Key Metrics",
    "sample.speed": "Speed",
    "sample.speedDetail": "Faster from idea to presentation.",
    "sample.growth": "Growth",
    "sample.growthDetail": "Show the main trend.",
    "sample.fileDetail": "A single file is easy to share.",
    "sample.timelineTitle": "Execution Steps",
    "sample.step1": "Step 1",
    "sample.step1Text": "Define the topic and audience.",
    "sample.step2": "Step 2",
    "sample.step2Text": "Generate the content structure.",
    "sample.step3": "Step 3",
    "sample.step3Text": "Present and keep refining.",
    "sample.quoteText": "A good presentation does not fill the slide; it helps the audience follow your thinking.",
    "sample.quoteAuthor": "PPT.html Studio",
    "sample.codeTitle": "Code Example"
  });

  extendLang("ja-JP", {
    "action.new": "新規",
    "action.templates": "テンプレート",
    "action.open": "開く",
    "action.save": "保存 / ダウンロード",
    "action.saveDesktop": "保存",
    "action.saveAs": "別名で保存",
    "action.validate": "チェック",
    "action.present": "現在のスライドから発表",
    "action.undo": "元に戻す",
    "action.redo": "やり直す",
    "action.pickImage": "画像を選択",
    "action.pickVideo": "動画を選択",
    "aria.fileActions": "ファイル操作",
    "aria.slideList": "スライド一覧",
    "aria.insertComponents": "コンポーネント挿入",
    "aria.workspace": "編集キャンバス",
    "aria.inspector": "プロパティパネル",
    "language.label": "表示言語",
    "rail.pages": "スライド",
    "rail.addSlide": "スライドを追加",
    "rail.duplicate": "複製",
    "rail.duplicateShort": "複製",
    "rail.moveUp": "上へ",
    "rail.moveUpShort": "上へ",
    "rail.moveDown": "下へ",
    "rail.moveDownShort": "下へ",
    "rail.deleteShort": "削除",
    "rail.delete": "削除",
    "insert.title": "挿入",
    "insert.text": "テキスト",
    "insert.image": "画像",
    "insert.video": "動画",
    "insert.chart": "グラフ",
    "insert.table": "表",
    "insert.cards": "カード",
    "insert.metrics": "データ",
    "insert.timeline": "タイムライン",
    "insert.quote": "引用",
    "insert.code": "コード",
    "insert.text.title": "編集可能なテキストボックスを追加",
    "insert.image.title": "現在のスライドに画像を挿入、またはドラッグして配置",
    "insert.video.title": "現在のスライドに動画を挿入、またはドラッグして配置",
    "insert.chart.title": "編集可能なグラフを挿入",
    "insert.table.title": "表を挿入",
    "insert.cards.title": "3カードを挿入",
    "insert.metrics.title": "指標カードを挿入",
    "insert.timeline.title": "タイムラインを挿入",
    "insert.quote.title": "引用スライドを挿入",
    "insert.code.title": "コードスライドを挿入",
    "panel.deck": "文書",
    "panel.slide": "スライド",
    "panel.image": "画像",
    "panel.video": "動画",
    "panel.list": "リスト",
    "panel.compare": "比較",
    "panel.cards": "カード",
    "panel.metrics": "データ",
    "panel.chart": "グラフ",
    "panel.table": "表",
    "panel.quote": "引用",
    "panel.code": "コード",
    "panel.notes": "ノート",
    "field.deckName": "名前",
    "field.theme": "テーマ",
    "field.layout": "レイアウト",
    "field.kicker": "ラベル",
    "field.title": "タイトル",
    "field.subtitle": "サブタイトル",
    "field.body": "本文",
    "field.fit": "表示方法",
    "field.imageSrc": "画像 URL または Data URI",
    "field.videoSrc": "動画 URL または Data URI",
    "field.poster": "ポスター URL",
    "field.alt": "代替テキスト",
    "field.caption": "キャプション",
    "field.listRows": "1行に1項目。タイムラインは タイトル | 本文",
    "field.chartKind": "グラフ種類",
    "field.chartLabels": "ラベル。| で区切る",
    "field.chartSeries": "系列: 1行ずつ 名前 | 値 | 値",
    "field.unit": "単位",
    "option.cover": "カバー",
    "option.contain": "全体表示",
    "option.bar": "棒",
    "option.line": "折れ線",
    "option.donut": "ドーナツ",
    "present.prev": "前へ",
    "present.next": "次へ",
    "present.exit": "終了",
    "dialog.templates": "テンプレートを選択",
    "dialog.templatesHint": "テンプレートは現在の文書を置き換えます。空白文書は「新規」を使ってください。",
    "dialog.validation": "品質チェック",
    "dialog.close": "閉じる",
    "dialog.cancel": "キャンセル",
    "dialog.copyJson": "JSON をコピー",
    "dialog.loadJson": "テキストから読み込み",
    "dialog.copyReport": "レポートをコピー",
    "dialog.copyRepairPrompt": "AI 修復 Prompt をコピー",
    "field.mediaSrc": "メディア URL または Data URI",
    "template.aiCamera.name": "AI ディレクターカメラ",
    "template.aiCamera.desc": "ハードウェア発表 demo。課題、流れ、データ、製品メッセージを含みます。",
    "template.productPitch.name": "製品発表",
    "template.productPitch.desc": "ナレッジベース AI アシスタントの発表。課題、証拠、展開計画付き。",
    "template.investorPitch.name": "投資家向けピッチ",
    "template.investorPitch.desc": "シードラウンド例。市場圧力、トラクション、資金用途を含みます。",
    "template.enterpriseProposal.name": "法人提案",
    "template.enterpriseProposal.desc": "顧客向けの解決策、ROI、試験導入の成功計画。",
    "template.researchBrief.name": "調査意思決定メモ",
    "template.researchBrief.desc": "インタビュー、データ、競合証拠で製品判断を支えます。",
    "template.productReview.name": "製品レビュー",
    "template.productReview.desc": "導線改善のレビュー。課題、経路、取捨選択、実験指標付き。",
    "template.projectUpdate.name": "QBR 事業レビュー",
    "template.projectUpdate.desc": "四半期レビュー。ファネル、学び、次期の重点施策付き。",
    "template.lesson.name": "実践ワークショップ",
    "template.lesson.desc": "90分研修。目標、進行、演習材料、宿題を含みます。",
    "template.incidentReview.name": "インシデント振り返り",
    "template.incidentReview.desc": "本番障害の振り返り。影響、時系列、根因、対策付き。",
    "template.marketingCampaign.name": "マーケティング施策",
    "template.marketingCampaign.desc": "会員成長施策。顧客洞察、チャネル予算、21日計画付き。",
    "layout.hero": "表紙",
    "layout.section": "章",
    "layout.text": "テキスト",
    "layout.imageRight": "左文右図",
    "layout.imageLeft": "左図右文",
    "layout.imageFull": "全画面画像",
    "layout.imageBackground": "背景画像",
    "layout.compare": "比較",
    "layout.threeCards": "3カード",
    "layout.quote": "引用",
    "layout.timeline": "タイムライン",
    "layout.data": "データ",
    "layout.chart": "グラフ",
    "layout.video": "動画",
    "layout.table": "表",
    "layout.code": "コード",
    "layout.ending": "終了",
    "status.untitled": "無題",
    "status.browserDraft": "ブラウザ下書き",
    "status.unsaved": "未保存",
    "slide.untitled": "無題のスライド",
    "slide.current": "{number} 枚目",
    "slide.copySuffix": "コピー",
    "canvas.delete": "削除",
    "canvas.deleteTitle": "選択したキャンバス要素を削除",
    "canvas.object": "オブジェクト",
    "canvas.reset": "リセット",
    "canvas.resetTitle": "この要素の位置とサイズをリセット",
    "canvas.resize": "ドラッグしてサイズ変更",
    "tooltip.slideThumb": "{number} 枚目: {title} · {layout}",
    "toast.languageChanged": "言語を変更しました",
    "toast.imageAdded": "画像を追加しました",
    "toast.videoAdded": "動画を追加しました",
    "toast.componentInserted": "{name}を挿入しました",
    "toast.componentSelected": "{name}を選択しました。ドラッグやサイズ変更ができます。",
    "toast.deleted": "選択した要素を削除しました",
    "toast.jsonCopied": "JSON をコピーしました",
    "toast.jsonLoaded": "JSON を読み込みました",
    "toast.reportCopied": "レポートをコピーしました",
    "toast.repairPromptCopied": "AI 修復 Prompt をコピーしました",
    "confirm.keepOneSlide": "少なくとも1枚のスライドが必要です。",
    "confirm.deleteSlide": "現在のスライドを削除しますか？",
    "confirm.discard": "未保存の変更があります。続行すると破棄されます。",
    "validation.pass": "チェック完了: {count} 枚、共有できます。",
    "validation.needsFix": "修正が必要: エラー {errors} 件、警告 {warnings} 件。",
    "sample.newSlideTitle": "新しいスライド",
    "sample.newSlideSubtitle": "次の内容を整理するためのシンプルなスライドです。",
    "sample.textTitle": "新しいテキストスライド",
    "sample.textBody": "本文で主張を簡潔に示し、下の要点につなげます。",
    "sample.imageTitle": "画像表示",
    "sample.imageCaption": "",
    "sample.videoTitle": "動画表示",
    "sample.videoCaption": "",
    "sample.chartTitle": "四半期成長",
    "sample.revenue": "売上",
    "sample.cost": "コスト",
    "sample.tableTitle": "プロジェクト表",
    "sample.cardsTitle": "3つの要点",
    "sample.metricsTitle": "主要指標",
    "sample.timelineTitle": "実行手順",
    "sample.quoteText": "良いプレゼンは情報を詰め込むのではなく、聞き手が考えを追えるようにします。",
    "sample.codeTitle": "コード例",
    "sample.card3Title": "再利用可能",
    "sample.card3Text": "構造と素材を次の資料づくりの起点にできます。"
  });

  extendLang("ko-KR", {
    "action.new": "새로 만들기",
    "action.templates": "템플릿",
    "action.open": "열기",
    "action.save": "저장 / 다운로드",
    "action.saveDesktop": "저장",
    "action.saveAs": "다른 이름 저장",
    "action.validate": "검사",
    "action.present": "현재 슬라이드부터 발표",
    "action.undo": "실행 취소",
    "action.redo": "다시 실행",
    "action.pickImage": "이미지 선택",
    "action.pickVideo": "비디오 선택",
    "aria.fileActions": "파일 작업",
    "aria.slideList": "슬라이드 목록",
    "aria.insertComponents": "컴포넌트 삽입",
    "aria.workspace": "편집 캔버스",
    "aria.inspector": "속성 패널",
    "language.label": "인터페이스 언어",
    "rail.pages": "슬라이드",
    "rail.addSlide": "슬라이드 추가",
    "rail.duplicate": "복제",
    "rail.duplicateShort": "복제",
    "rail.moveUp": "위로",
    "rail.moveUpShort": "위로",
    "rail.moveDown": "아래로",
    "rail.moveDownShort": "아래",
    "rail.delete": "삭제",
    "rail.deleteShort": "삭제",
    "insert.title": "삽입",
    "insert.text": "텍스트",
    "insert.image": "이미지",
    "insert.video": "비디오",
    "insert.chart": "차트",
    "insert.table": "표",
    "insert.cards": "카드",
    "insert.metrics": "데이터",
    "insert.timeline": "타임라인",
    "insert.quote": "인용",
    "insert.code": "코드",
    "insert.text.title": "편집 가능한 텍스트 상자 추가",
    "insert.image.title": "현재 슬라이드에 이미지를 삽입하거나 드래그해 배치",
    "insert.video.title": "현재 슬라이드에 비디오를 삽입하거나 드래그해 배치",
    "insert.chart.title": "편집 가능한 차트 삽입",
    "insert.table.title": "표 삽입",
    "insert.cards.title": "세 카드 컴포넌트 삽입",
    "insert.metrics.title": "지표 카드 삽입",
    "insert.timeline.title": "타임라인 삽입",
    "insert.quote.title": "인용 슬라이드 삽입",
    "insert.code.title": "코드 슬라이드 삽입",
    "panel.deck": "문서",
    "panel.slide": "슬라이드",
    "panel.image": "이미지",
    "panel.video": "비디오",
    "panel.list": "목록",
    "panel.compare": "비교",
    "panel.cards": "카드",
    "panel.metrics": "데이터",
    "panel.chart": "차트",
    "panel.table": "표",
    "panel.quote": "인용",
    "panel.code": "코드",
    "panel.notes": "노트",
    "field.deckName": "이름",
    "field.theme": "테마",
    "field.layout": "레이아웃",
    "field.kicker": "라벨",
    "field.title": "제목",
    "field.subtitle": "부제목",
    "field.body": "본문",
    "field.fit": "맞춤",
    "field.imageSrc": "이미지 URL 또는 Data URI",
    "field.videoSrc": "비디오 URL 또는 Data URI",
    "field.poster": "포스터 URL",
    "field.alt": "대체 텍스트",
    "field.caption": "캡션",
    "field.listRows": "한 줄에 한 항목. 타임라인은 제목 | 내용",
    "field.chartKind": "차트 유형",
    "field.chartLabels": "라벨, | 로 구분",
    "field.chartSeries": "시리즈: 한 줄에 이름 | 값 | 값",
    "field.unit": "단위",
    "option.cover": "채우기",
    "option.contain": "전체 표시",
    "option.bar": "막대",
    "option.line": "선",
    "option.donut": "도넛",
    "present.prev": "이전",
    "present.next": "다음",
    "present.exit": "종료",
    "dialog.templates": "템플릿 선택",
    "dialog.templatesHint": "템플릿은 현재 문서를 대체합니다. 빈 문서는 새로 만들기를 사용하세요.",
    "dialog.validation": "품질 검사",
    "dialog.close": "닫기",
    "dialog.cancel": "취소",
    "dialog.copyJson": "JSON 복사",
    "dialog.loadJson": "텍스트에서 불러오기",
    "dialog.copyReport": "보고서 복사",
    "dialog.copyRepairPrompt": "AI 수정 Prompt 복사",
    "field.mediaSrc": "미디어 URL 또는 Data URI",
    "template.aiCamera.name": "AI 디렉터 카메라",
    "template.aiCamera.desc": "하드웨어 출시 demo. 문제, 흐름, 데이터, 제품 메시지를 포함합니다.",
    "template.productPitch.name": "제품 출시",
    "template.productPitch.desc": "지식베이스 AI 어시스턴트 출시 자료. 문제, 근거, 출시 계획 포함.",
    "template.investorPitch.name": "투자자 피치",
    "template.investorPitch.desc": "시드 라운드 예시. 시장 압력, 트랙션, 자금 사용 계획 포함.",
    "template.enterpriseProposal.name": "기업 제안서",
    "template.enterpriseProposal.desc": "고객용 솔루션, ROI, 파일럿 성공 계획.",
    "template.researchBrief.name": "리서치 의사결정 브리프",
    "template.researchBrief.desc": "인터뷰, 데이터, 경쟁사 근거로 제품 결정을 지원합니다.",
    "template.productReview.name": "제품 리뷰",
    "template.productReview.desc": "플로우 개선 리뷰. 문제, 여정, 트레이드오프, 실험 지표 포함.",
    "template.projectUpdate.name": "QBR 비즈니스 리뷰",
    "template.projectUpdate.desc": "분기 리뷰. 퍼널, 배운 점, 다음 분기 집중 과제 포함.",
    "template.lesson.name": "실전 워크숍",
    "template.lesson.desc": "90분 교육. 목표, 진행, 실습 자료, 과제 포함.",
    "template.incidentReview.name": "장애 회고",
    "template.incidentReview.desc": "운영 장애 회고. 영향, 타임라인, 원인, 조치 항목 포함.",
    "template.marketingCampaign.name": "마케팅 캠페인",
    "template.marketingCampaign.desc": "회원 성장 캠페인. 고객 인사이트, 채널 예산, 21일 일정 포함.",
    "layout.hero": "표지",
    "layout.section": "섹션",
    "layout.text": "텍스트",
    "layout.imageRight": "텍스트+이미지",
    "layout.imageLeft": "이미지+텍스트",
    "layout.imageFull": "전체 이미지",
    "layout.imageBackground": "배경 이미지",
    "layout.compare": "비교",
    "layout.threeCards": "세 카드",
    "layout.quote": "인용",
    "layout.timeline": "타임라인",
    "layout.data": "데이터",
    "layout.chart": "차트",
    "layout.video": "비디오",
    "layout.table": "표",
    "layout.code": "코드",
    "layout.ending": "마무리",
    "status.untitled": "제목 없음",
    "status.browserDraft": "브라우저 초안",
    "status.unsaved": "저장 안 됨",
    "slide.untitled": "제목 없는 슬라이드",
    "slide.current": "{number}번 슬라이드",
    "slide.copySuffix": "복사본",
    "canvas.delete": "삭제",
    "canvas.deleteTitle": "선택한 캔버스 요소 삭제",
    "canvas.object": "개체",
    "canvas.reset": "초기화",
    "canvas.resetTitle": "이 요소의 위치와 크기를 초기화",
    "canvas.resize": "드래그하여 크기 조절",
    "tooltip.slideThumb": "{number}번 슬라이드: {title} · {layout}",
    "toast.languageChanged": "언어가 변경되었습니다",
    "toast.imageAdded": "이미지가 추가되었습니다",
    "toast.videoAdded": "비디오가 추가되었습니다",
    "toast.componentInserted": "{name} 삽입됨",
    "toast.componentSelected": "{name} 선택됨. 드래그하거나 크기를 조절하세요.",
    "toast.deleted": "선택한 요소를 삭제했습니다",
    "toast.jsonCopied": "JSON 복사됨",
    "toast.jsonLoaded": "JSON 불러옴",
    "toast.reportCopied": "보고서 복사됨",
    "toast.repairPromptCopied": "AI 수정 Prompt 복사됨",
    "confirm.keepOneSlide": "슬라이드는 최소 1장이 필요합니다.",
    "confirm.deleteSlide": "현재 슬라이드를 삭제할까요?",
    "confirm.discard": "저장하지 않은 변경 사항이 있습니다. 계속하면 버려집니다.",
    "validation.pass": "검사 통과: {count}장, 공유할 수 있습니다.",
    "validation.needsFix": "수정 필요: 오류 {errors}개, 경고 {warnings}개.",
    "sample.newSlideTitle": "새 슬라이드",
    "sample.newSlideSubtitle": "다음 내용을 정리하기 위한 간결한 슬라이드입니다.",
    "sample.textTitle": "새 텍스트 슬라이드",
    "sample.textBody": "본문으로 핵심 메시지를 정리하고 아래 요점으로 이어갑니다.",
    "sample.imageTitle": "이미지 쇼케이스",
    "sample.imageCaption": "",
    "sample.videoTitle": "비디오 쇼케이스",
    "sample.videoCaption": "",
    "sample.chartTitle": "분기 성장",
    "sample.revenue": "매출",
    "sample.cost": "비용",
    "sample.tableTitle": "프로젝트 표",
    "sample.cardsTitle": "세 가지 핵심",
    "sample.metricsTitle": "핵심 지표",
    "sample.timelineTitle": "실행 단계",
    "sample.quoteText": "좋은 발표는 내용을 가득 채우는 것이 아니라 청중이 생각을 따라오게 합니다.",
    "sample.codeTitle": "코드 예시",
    "sample.card3Title": "재사용 가능",
    "sample.card3Text": "구조와 소재를 다음 발표 자료의 출발점으로 삼을 수 있습니다."
  });

  Object.assign(I18N["en-US"], {
    "field.leftTitle": "Left title",
    "field.leftText": "Left text",
    "field.rightTitle": "Right title",
    "field.rightText": "Right text",
    "field.cardsRows": "One card per line: Title | Text",
    "field.metricsRows": "One metric per line: Value | Label | Detail",
    "field.tableColumns": "Headers, separated by |",
    "field.tableRows": "Rows, cells separated by |",
    "field.quote": "Quote",
    "field.author": "Author",
    "field.code": "Code",
    "field.notes": "Speaker notes",
    "canvas.image": "Image",
    "canvas.video": "Video",
    "canvas.chart": "Chart",
    "canvas.table": "Table",
    "canvas.cards": "Cards",
    "canvas.metrics": "Metrics",
    "canvas.timeline": "Timeline"
  });

  Object.assign(I18N["ja-JP"], {
    "field.leftTitle": "左タイトル",
    "field.leftText": "左テキスト",
    "field.rightTitle": "右タイトル",
    "field.rightText": "右テキスト",
    "field.cardsRows": "1行に1カード: タイトル | 本文",
    "field.metricsRows": "1行に1指標: 値 | ラベル | 詳細",
    "field.tableColumns": "ヘッダー。| で区切る",
    "field.tableRows": "行。セルは | で区切る",
    "field.quote": "引用文",
    "field.author": "著者",
    "field.code": "コード",
    "field.notes": "発表者ノート",
    "canvas.image": "画像",
    "canvas.video": "動画",
    "canvas.chart": "グラフ",
    "canvas.table": "表",
    "canvas.cards": "カード",
    "canvas.metrics": "指標",
    "canvas.timeline": "タイムライン"
  });

  Object.assign(I18N["ko-KR"], {
    "field.leftTitle": "왼쪽 제목",
    "field.leftText": "왼쪽 내용",
    "field.rightTitle": "오른쪽 제목",
    "field.rightText": "오른쪽 내용",
    "field.cardsRows": "한 줄에 카드 하나: 제목 | 내용",
    "field.metricsRows": "한 줄에 지표 하나: 값 | 라벨 | 설명",
    "field.tableColumns": "헤더, | 로 구분",
    "field.tableRows": "행, 셀은 | 로 구분",
    "field.quote": "인용문",
    "field.author": "작성자",
    "field.code": "코드",
    "field.notes": "발표자 노트",
    "canvas.image": "이미지",
    "canvas.video": "비디오",
    "canvas.chart": "차트",
    "canvas.table": "표",
    "canvas.cards": "카드",
    "canvas.metrics": "지표",
    "canvas.timeline": "타임라인"
  });

  Object.assign(I18N["zh-CN"], {
    "action.pickAudio": "选择本地音频",
    "insert.audio": "音频",
    "insert.audio.title": "插入音频到当前页，或拖到画布定位",
    "panel.audio": "音频",
    "field.audioSrc": "音频 URL 或 Data URI",
    "layout.audio": "音频",
    "canvas.audio": "音频",
    "toast.audioAdded": "音频已加入当前页面",
    "toast.assetsEmbedded": "已将 {count} 个外部资源打包进单文件",
    "alert.assetPackageFailed": "保存前需要把所有资源打包进单文件，但以下资源读取失败：\n{details}\n请选择本地文件，或换成可访问的 URL。",
    "asset.failureLine": "第 {slide} 页 {path}: {src} ({message})",
    "sample.audioTitle": "音频播放",
    "sample.audioCaption": ""
  });

  Object.assign(I18N["en-US"], {
    "action.pickAudio": "Choose Audio",
    "insert.audio": "Audio",
    "insert.audio.title": "Insert audio on this slide, or drag to position it",
    "panel.audio": "Audio",
    "field.audioSrc": "Audio URL or Data URI",
    "layout.audio": "Audio",
    "canvas.audio": "Audio",
    "toast.audioAdded": "Audio added to this slide",
    "toast.assetsEmbedded": "{count} external assets embedded into the single file",
    "alert.assetPackageFailed": "Saving requires every asset to be embedded in the single file, but these assets could not be read:\n{details}\nChoose local files or use reachable URLs.",
    "asset.failureLine": "Slide {slide} {path}: {src} ({message})",
    "sample.audioTitle": "Audio Playback",
    "sample.audioCaption": ""
  });

  Object.assign(I18N["ja-JP"], {
    "action.pickAudio": "音声を選択",
    "insert.audio": "音声",
    "insert.audio.title": "現在のスライドに音声を挿入、またはドラッグして配置",
    "panel.audio": "音声",
    "field.audioSrc": "音声 URL または Data URI",
    "layout.audio": "音声",
    "canvas.audio": "音声",
    "canvas.textBox": "テキストボックス",
    "toast.audioAdded": "音声を追加しました",
    "toast.assetsEmbedded": "{count} 個の外部アセットを単一ファイルに埋め込みました",
    "alert.assetPackageFailed": "保存前にすべてのアセットを単一ファイルへ埋め込む必要がありますが、次のアセットを読み込めませんでした:\n{details}\nローカルファイルを選ぶか、アクセス可能な URL に変更してください。",
    "asset.failureLine": "{slide} 枚目 {path}: {src} ({message})",
    "sample.audioTitle": "音声再生",
    "sample.audioCaption": "",
    "sample.textBox": "タップして入力",
    "sample.textTitleBox": "タイトルを入力",
    "sample.textSubtitleBox": "サブタイトルを入力",
    "sample.textBodyBox": "本文で重要な考えを説明します。",
    "sample.textBulletBox": "• 1つ目の要点\n• 2つ目の要点\n• 3つ目の要点",
    "sample.textLabelBox": "ラベル"
  });

  Object.assign(I18N["ko-KR"], {
    "action.pickAudio": "오디오 선택",
    "insert.audio": "오디오",
    "insert.audio.title": "현재 슬라이드에 오디오를 삽입하거나 드래그해 배치",
    "panel.audio": "오디오",
    "field.audioSrc": "오디오 URL 또는 Data URI",
    "layout.audio": "오디오",
    "canvas.audio": "오디오",
    "canvas.textBox": "텍스트 상자",
    "toast.audioAdded": "오디오가 추가되었습니다",
    "toast.assetsEmbedded": "외부 자산 {count}개를 단일 파일에 포함했습니다",
    "alert.assetPackageFailed": "저장하려면 모든 자산을 단일 파일에 포함해야 하지만 다음 자산을 읽을 수 없습니다:\n{details}\n로컬 파일을 선택하거나 접근 가능한 URL로 바꾸세요.",
    "asset.failureLine": "{slide}번 슬라이드 {path}: {src} ({message})",
    "sample.audioTitle": "오디오 재생",
    "sample.audioCaption": "",
    "sample.textBox": "클릭해 입력",
    "sample.textTitleBox": "제목 입력",
    "sample.textSubtitleBox": "부제 입력",
    "sample.textBodyBox": "본문으로 핵심 아이디어를 설명합니다.",
    "sample.textBulletBox": "• 첫 번째 요점\n• 두 번째 요점\n• 세 번째 요점",
    "sample.textLabelBox": "라벨"
  });

  Object.assign(I18N["zh-CN"], {
    "insert.group.basic": "基础",
    "insert.group.compare": "对比",
    "insert.group.chart": "图表",
    "insert.group.table": "表格",
    "insert.group.cards": "卡片",
    "insert.group.metrics": "数据",
    "insert.group.timeline": "流程",
    "insert.group.other": "其他",
    "insert.text.title": "标题",
    "insert.text.titleLabel": "标题",
    "insert.text.title.title": "插入大标题文本",
    "insert.text.subtitle": "副标题",
    "insert.text.subtitle.title": "插入副标题文本",
    "insert.text.body": "正文",
    "insert.text.body.title": "插入正文段落",
    "insert.text.bullet": "列表",
    "insert.text.bullet.title": "插入项目符号列表",
    "insert.text.label": "标签",
    "insert.text.label.title": "插入小标签文本",
    "insert.text.box": "文本框",
    "insert.text.box.title": "插入普通文本框",
    "insert.compare": "对比",
    "insert.compare.beforeAfter": "前后",
    "insert.compare.beforeAfter.title": "插入前后对比页，适合展示改版、优化、转型效果",
    "insert.compare.decision": "决策",
    "insert.compare.decision.title": "插入决策对比页，适合比较两个方案",
    "insert.chart.bar": "柱状",
    "insert.chart.bar.title": "插入柱状图，适合季度、类别、团队对比",
    "insert.chart.line": "趋势",
    "insert.chart.line.title": "插入趋势折线图，适合增长、留存、进度变化",
    "insert.chart.donut": "占比",
    "insert.chart.donut.title": "插入占比环形图，适合预算、渠道、结构比例",
    "insert.table.plan": "项目表",
    "insert.table.plan.title": "插入项目计划表",
    "insert.table.compare": "对比表",
    "insert.table.compare.title": "插入方案对比表",
    "insert.table.checklist": "检查表",
    "insert.table.checklist.title": "插入上线或交付检查表",
    "insert.cards.core": "三要点",
    "insert.cards.core.title": "插入三个核心观点卡片",
    "insert.cards.features": "功能",
    "insert.cards.features.title": "插入三个功能卡片",
    "insert.cards.prosCons": "优劣",
    "insert.cards.prosCons.title": "插入优点、限制和下一步卡片",
    "insert.metrics.kpi": "KPI",
    "insert.metrics.kpi.title": "插入关键指标页",
    "insert.metrics.progress": "进度",
    "insert.metrics.progress.title": "插入项目进度数据页",
    "insert.metrics.beforeAfter": "前后",
    "insert.metrics.beforeAfter.title": "插入优化前后数据页",
    "insert.timeline.roadmap": "路线图",
    "insert.timeline.roadmap.title": "插入路线图时间线",
    "insert.timeline.process": "流程",
    "insert.timeline.process.title": "插入流程步骤时间线",
    "insert.timeline.milestones": "里程碑",
    "insert.timeline.milestones.title": "插入里程碑时间线",
    "sample.compareBeforeAfterTitle": "优化前后对比",
    "sample.beforeTitle": "优化前",
    "sample.beforeText": "流程分散，信息需要人工整理，交付结果不稳定。",
    "sample.afterTitle": "优化后",
    "sample.afterText": "结构统一，内容可复用，团队可以更快完成高质量输出。",
    "sample.compareDecisionTitle": "方案选择",
    "sample.optionATitle": "方案 A",
    "sample.optionAText": "上线快、成本低，适合作为第一阶段验证。",
    "sample.optionBTitle": "方案 B",
    "sample.optionBText": "能力完整、扩展性更强，适合第二阶段建设。",
    "sample.chartLineTitle": "增长趋势",
    "sample.chartDonutTitle": "资源占比",
    "sample.month1": "1 月",
    "sample.month2": "2 月",
    "sample.month3": "3 月",
    "sample.month4": "4 月",
    "sample.activeUsers": "活跃用户",
    "sample.retention": "留存",
    "sample.channelProduct": "产品",
    "sample.channelContent": "内容",
    "sample.channelSales": "销售",
    "sample.channelOps": "运营",
    "sample.share": "占比",
    "sample.tableCompareTitle": "方案对比表",
    "sample.dimension": "维度",
    "sample.optionA": "方案 A",
    "sample.optionB": "方案 B",
    "sample.recommendation": "建议",
    "sample.low": "低",
    "sample.fast": "快",
    "sample.medium": "中",
    "sample.high": "高",
    "sample.scale": "扩展性",
    "sample.tableChecklistTitle": "上线检查清单",
    "sample.item": "事项",
    "sample.due": "时间",
    "sample.contentReview": "内容确认",
    "sample.product": "产品",
    "sample.thisWeek": "本周",
    "sample.assetReady": "素材就绪",
    "sample.releaseReview": "发布复核",
    "sample.nextWeek": "下周",
    "sample.cardsFeaturesTitle": "核心功能",
    "sample.feature1Title": "自动结构",
    "sample.feature1Text": "把零散内容整理成适合演示的页面结构。",
    "sample.feature2Title": "单文件分享",
    "sample.feature2Text": "图片、视频、音频可以打包进一个 ppt.html 文件。",
    "sample.feature3Title": "画布编辑",
    "sample.feature3Text": "文字、图表、媒体和版式可以在同一画布中统一管理。",
    "sample.cardsProsConsTitle": "优劣与下一步",
    "sample.proTitle": "优势",
    "sample.proText": "生成快、结构清楚、便于 AI 和人类继续修改。",
    "sample.conTitle": "限制",
    "sample.conText": "复杂自由排版仍需要更多控件和图层管理。",
    "sample.nextTitle": "下一步",
    "sample.nextText": "补齐更多组件变体，并持续打磨编辑体验。",
    "sample.metricsProgressTitle": "项目进度",
    "sample.completed": "已完成",
    "sample.completedDetail": "核心能力已进入可用状态。",
    "sample.openTasks": "待处理",
    "sample.openTasksDetail": "集中在体验、文档和边界情况。",
    "sample.risks": "风险",
    "sample.risksDetail": "需要持续测试真实用户工作流。",
    "sample.metricsBeforeAfterTitle": "优化效果",
    "sample.timeCost": "时间成本",
    "sample.timeCostDetail": "从准备到演示显著缩短。",
    "sample.quality": "表达质量",
    "sample.qualityDetail": "模板约束让页面更稳定。",
    "sample.output": "产出效率",
    "sample.outputDetail": "同样时间可以完成更多版本。",
    "sample.timelineProcessTitle": "工作流程",
    "sample.process1": "收集",
    "sample.process1Text": "整理目标、受众、素材和关键观点。",
    "sample.process2": "生成",
    "sample.process2Text": "让 AI 生成结构化 ppt.html 初稿。",
    "sample.process3": "编辑",
    "sample.process3Text": "在画布上直接修改文字、图表和媒体。",
    "sample.process4": "分享",
    "sample.process4Text": "保存为单文件并交给其他人继续打开。",
    "sample.timelineMilestonesTitle": "关键里程碑",
    "sample.milestone1": "M1",
    "sample.milestone1Text": "完成核心格式和渲染器。",
    "sample.milestone2": "M2",
    "sample.milestone2Text": "补齐可视化编辑和媒体插入。",
    "sample.milestone3": "M3",
    "sample.milestone3Text": "发布跨平台桌面端版本。"
  });

  Object.assign(I18N["en-US"], {
    "insert.group.basic": "Basic",
    "insert.group.compare": "Compare",
    "insert.group.chart": "Charts",
    "insert.group.table": "Tables",
    "insert.group.cards": "Cards",
    "insert.group.metrics": "Data",
    "insert.group.timeline": "Flow",
    "insert.group.other": "Other",
    "insert.text.title": "Title",
    "insert.text.titleLabel": "Title",
    "insert.text.title.title": "Insert a large title text block",
    "insert.text.subtitle": "Subtitle",
    "insert.text.subtitle.title": "Insert a subtitle text block",
    "insert.text.body": "Body",
    "insert.text.body.title": "Insert a body paragraph",
    "insert.text.bullet": "Bullets",
    "insert.text.bullet.title": "Insert a bullet list",
    "insert.text.label": "Label",
    "insert.text.label.title": "Insert a small label",
    "insert.text.box": "Text box",
    "insert.text.box.title": "Insert a plain text box",
    "insert.compare": "Compare",
    "insert.compare.beforeAfter": "Before",
    "insert.compare.beforeAfter.title": "Insert a before/after comparison slide",
    "insert.compare.decision": "Decision",
    "insert.compare.decision.title": "Insert a decision comparison slide",
    "insert.chart.bar": "Bars",
    "insert.chart.bar.title": "Insert a bar chart for category or quarterly comparison",
    "insert.chart.line": "Trend",
    "insert.chart.line.title": "Insert a line chart for growth or trend changes",
    "insert.chart.donut": "Share",
    "insert.chart.donut.title": "Insert a donut chart for composition or share",
    "insert.table.plan": "Plan",
    "insert.table.plan.title": "Insert a project plan table",
    "insert.table.compare": "Compare",
    "insert.table.compare.title": "Insert an option comparison table",
    "insert.table.checklist": "Checklist",
    "insert.table.checklist.title": "Insert a launch or delivery checklist",
    "insert.cards.core": "3 Points",
    "insert.cards.core.title": "Insert three core idea cards",
    "insert.cards.features": "Features",
    "insert.cards.features.title": "Insert three feature cards",
    "insert.cards.prosCons": "Pros",
    "insert.cards.prosCons.title": "Insert pros, limits, and next-step cards",
    "insert.metrics.kpi": "KPI",
    "insert.metrics.kpi.title": "Insert key metric cards",
    "insert.metrics.progress": "Progress",
    "insert.metrics.progress.title": "Insert project progress metrics",
    "insert.metrics.beforeAfter": "Before",
    "insert.metrics.beforeAfter.title": "Insert before/after improvement metrics",
    "insert.timeline.roadmap": "Roadmap",
    "insert.timeline.roadmap.title": "Insert a roadmap timeline",
    "insert.timeline.process": "Process",
    "insert.timeline.process.title": "Insert a process timeline",
    "insert.timeline.milestones": "Milestones",
    "insert.timeline.milestones.title": "Insert a milestone timeline",
    "sample.compareBeforeAfterTitle": "Before and After",
    "sample.beforeTitle": "Before",
    "sample.beforeText": "Work was scattered, information was organized by hand, and delivery quality varied.",
    "sample.afterTitle": "After",
    "sample.afterText": "The structure is unified, content is reusable, and the team can deliver faster.",
    "sample.compareDecisionTitle": "Decision Options",
    "sample.optionATitle": "Option A",
    "sample.optionAText": "Fast to launch and low cost. Best for first-stage validation.",
    "sample.optionBTitle": "Option B",
    "sample.optionBText": "More complete and scalable. Best for the second build stage.",
    "sample.chartLineTitle": "Growth Trend",
    "sample.chartDonutTitle": "Resource Share",
    "sample.month1": "Jan",
    "sample.month2": "Feb",
    "sample.month3": "Mar",
    "sample.month4": "Apr",
    "sample.activeUsers": "Active users",
    "sample.retention": "Retention",
    "sample.channelProduct": "Product",
    "sample.channelContent": "Content",
    "sample.channelSales": "Sales",
    "sample.channelOps": "Ops",
    "sample.share": "Share",
    "sample.tableCompareTitle": "Option Comparison",
    "sample.dimension": "Dimension",
    "sample.optionA": "Option A",
    "sample.optionB": "Option B",
    "sample.recommendation": "Recommendation",
    "sample.low": "Low",
    "sample.fast": "Fast",
    "sample.medium": "Medium",
    "sample.high": "High",
    "sample.scale": "Scale",
    "sample.tableChecklistTitle": "Launch Checklist",
    "sample.item": "Item",
    "sample.due": "Due",
    "sample.contentReview": "Content review",
    "sample.product": "Product",
    "sample.thisWeek": "This week",
    "sample.assetReady": "Assets ready",
    "sample.releaseReview": "Release review",
    "sample.nextWeek": "Next week",
    "sample.cardsFeaturesTitle": "Core Features",
    "sample.feature1Title": "Auto structure",
    "sample.feature1Text": "Turn rough material into presentation-ready structure.",
    "sample.feature2Title": "Single file",
    "sample.feature2Text": "Package images, video, and audio into one ppt.html file.",
    "sample.feature3Title": "Canvas editing",
    "sample.feature3Text": "Manage text, charts, media, and layout on one shared canvas.",
    "sample.cardsProsConsTitle": "Pros and Next Step",
    "sample.proTitle": "Strength",
    "sample.proText": "Fast generation, clear structure, and easy follow-up editing.",
    "sample.conTitle": "Limit",
    "sample.conText": "Advanced freeform layout still needs more controls and layers.",
    "sample.nextTitle": "Next",
    "sample.nextText": "Add more component variants and keep polishing the editor.",
    "sample.metricsProgressTitle": "Project Progress",
    "sample.completed": "Complete",
    "sample.completedDetail": "Core capabilities are usable.",
    "sample.openTasks": "Open tasks",
    "sample.openTasksDetail": "Mostly experience, docs, and edge cases.",
    "sample.risks": "Risks",
    "sample.risksDetail": "Real user workflows still need testing.",
    "sample.metricsBeforeAfterTitle": "Improvement Impact",
    "sample.timeCost": "Time cost",
    "sample.timeCostDetail": "Preparation to presentation is shorter.",
    "sample.quality": "Quality",
    "sample.qualityDetail": "Template constraints make slides stable.",
    "sample.output": "Output",
    "sample.outputDetail": "More versions in the same amount of time.",
    "sample.timelineProcessTitle": "Workflow",
    "sample.process1": "Collect",
    "sample.process1Text": "Gather goals, audience, assets, and key ideas.",
    "sample.process2": "Generate",
    "sample.process2Text": "Let AI create a structured ppt.html draft.",
    "sample.process3": "Edit",
    "sample.process3Text": "Directly edit text, charts, and media on the canvas.",
    "sample.process4": "Share",
    "sample.process4Text": "Save one file and let others open it again.",
    "sample.timelineMilestonesTitle": "Key Milestones",
    "sample.milestone1": "M1",
    "sample.milestone1Text": "Complete the core format and renderer.",
    "sample.milestone2": "M2",
    "sample.milestone2Text": "Add visual editing and media insertion.",
    "sample.milestone3": "M3",
    "sample.milestone3Text": "Release cross-platform desktop builds."
  });

  Object.assign(I18N["ja-JP"], {
    "insert.group.basic": "基本",
    "insert.group.compare": "比較",
    "insert.group.chart": "グラフ",
    "insert.group.table": "表",
    "insert.group.cards": "カード",
    "insert.group.metrics": "データ",
    "insert.group.timeline": "流れ",
    "insert.group.other": "その他",
    "insert.text.title": "タイトル",
    "insert.text.titleLabel": "タイトル",
    "insert.text.title.title": "大きなタイトル文字を挿入",
    "insert.text.subtitle": "サブタイトル",
    "insert.text.subtitle.title": "サブタイトル文字を挿入",
    "insert.text.body": "本文",
    "insert.text.body.title": "本文段落を挿入",
    "insert.text.bullet": "リスト",
    "insert.text.bullet.title": "箇条書きを挿入",
    "insert.text.label": "ラベル",
    "insert.text.label.title": "小さなラベルを挿入",
    "insert.text.box": "テキスト枠",
    "insert.text.box.title": "通常のテキスト枠を挿入",
    "insert.compare": "比較",
    "insert.compare.beforeAfter": "前後",
    "insert.compare.beforeAfter.title": "改善前後の比較スライドを挿入",
    "insert.compare.decision": "判断",
    "insert.compare.decision.title": "2つの案を比較するスライドを挿入",
    "insert.chart.bar": "棒",
    "insert.chart.bar.title": "カテゴリや四半期比較の棒グラフを挿入",
    "insert.chart.line": "推移",
    "insert.chart.line.title": "成長や変化を示す折れ線グラフを挿入",
    "insert.chart.donut": "比率",
    "insert.chart.donut.title": "構成比を示すドーナツグラフを挿入",
    "insert.table.plan": "計画表",
    "insert.table.plan.title": "プロジェクト計画表を挿入",
    "insert.table.compare": "比較表",
    "insert.table.compare.title": "案の比較表を挿入",
    "insert.table.checklist": "チェック",
    "insert.table.checklist.title": "公開や納品のチェック表を挿入",
    "insert.cards.core": "3要点",
    "insert.cards.core.title": "3つの要点カードを挿入",
    "insert.cards.features": "機能",
    "insert.cards.features.title": "3つの機能カードを挿入",
    "insert.cards.prosCons": "利点",
    "insert.cards.prosCons.title": "利点、制約、次の一手のカードを挿入",
    "insert.metrics.kpi": "KPI",
    "insert.metrics.kpi.title": "主要指標カードを挿入",
    "insert.metrics.progress": "進捗",
    "insert.metrics.progress.title": "プロジェクト進捗指標を挿入",
    "insert.metrics.beforeAfter": "前後",
    "insert.metrics.beforeAfter.title": "改善前後の指標を挿入",
    "insert.timeline.roadmap": "ロードマップ",
    "insert.timeline.roadmap.title": "ロードマップのタイムラインを挿入",
    "insert.timeline.process": "工程",
    "insert.timeline.process.title": "工程タイムラインを挿入",
    "insert.timeline.milestones": "節目",
    "insert.timeline.milestones.title": "マイルストーンのタイムラインを挿入",
    "sample.compareBeforeAfterTitle": "改善前後の比較",
    "sample.beforeTitle": "改善前",
    "sample.beforeText": "作業が分散し、情報整理が手作業で、品質が安定しませんでした。",
    "sample.afterTitle": "改善後",
    "sample.afterText": "構造が統一され、内容を再利用でき、より速く届けられます。",
    "sample.compareDecisionTitle": "案の比較",
    "sample.optionATitle": "案 A",
    "sample.optionAText": "公開が速く低コスト。初期検証に向いています。",
    "sample.optionBTitle": "案 B",
    "sample.optionBText": "機能が充実し拡張性が高い。次段階の構築に向いています。",
    "sample.chartLineTitle": "成長推移",
    "sample.chartDonutTitle": "リソース比率",
    "sample.month1": "1月",
    "sample.month2": "2月",
    "sample.month3": "3月",
    "sample.month4": "4月",
    "sample.activeUsers": "アクティブ",
    "sample.retention": "継続率",
    "sample.channelProduct": "製品",
    "sample.channelContent": "コンテンツ",
    "sample.channelSales": "営業",
    "sample.channelOps": "運用",
    "sample.share": "比率",
    "sample.tableCompareTitle": "案の比較表",
    "sample.dimension": "観点",
    "sample.optionA": "案 A",
    "sample.optionB": "案 B",
    "sample.recommendation": "推奨",
    "sample.low": "低",
    "sample.fast": "速い",
    "sample.medium": "中",
    "sample.high": "高",
    "sample.scale": "拡張性",
    "sample.tableChecklistTitle": "公開チェック表",
    "sample.item": "項目",
    "sample.due": "期限",
    "sample.contentReview": "内容確認",
    "sample.product": "製品",
    "sample.thisWeek": "今週",
    "sample.assetReady": "素材準備",
    "sample.releaseReview": "公開確認",
    "sample.nextWeek": "来週",
    "sample.cardsFeaturesTitle": "主要機能",
    "sample.feature1Title": "自動構造化",
    "sample.feature1Text": "素材を発表向けの構造に整理します。",
    "sample.feature2Title": "単一ファイル",
    "sample.feature2Text": "画像、動画、音声を1つの ppt.html にまとめます。",
    "sample.feature3Title": "キャンバス編集",
    "sample.feature3Text": "文字、グラフ、メディア、レイアウトを同じキャンバスで管理します。",
    "sample.cardsProsConsTitle": "利点と次の一手",
    "sample.proTitle": "強み",
    "sample.proText": "生成が速く、構造が明確で、続けて編集しやすい。",
    "sample.conTitle": "制約",
    "sample.conText": "自由配置にはさらに多くのコントロールとレイヤーが必要です。",
    "sample.nextTitle": "次",
    "sample.nextText": "部品バリエーションを増やし、編集体験を磨きます。",
    "sample.metricsProgressTitle": "プロジェクト進捗",
    "sample.completed": "完了",
    "sample.completedDetail": "主要機能は利用可能です。",
    "sample.openTasks": "未完了",
    "sample.openTasksDetail": "体験、文書、例外対応が中心です。",
    "sample.risks": "リスク",
    "sample.risksDetail": "実ユーザーの流れで継続検証が必要です。",
    "sample.metricsBeforeAfterTitle": "改善効果",
    "sample.timeCost": "時間コスト",
    "sample.timeCostDetail": "準備から発表までが短くなります。",
    "sample.quality": "品質",
    "sample.qualityDetail": "テンプレート制約でページが安定します。",
    "sample.output": "生産性",
    "sample.outputDetail": "同じ時間でより多くの版を作れます。",
    "sample.timelineProcessTitle": "作業工程",
    "sample.process1": "収集",
    "sample.process1Text": "目的、受け手、素材、要点を集めます。",
    "sample.process2": "生成",
    "sample.process2Text": "AI が構造化された ppt.html 初稿を作ります。",
    "sample.process3": "編集",
    "sample.process3Text": "キャンバスで文字、グラフ、メディアを編集します。",
    "sample.process4": "共有",
    "sample.process4Text": "単一ファイルとして保存し、他の人も開けます。",
    "sample.timelineMilestonesTitle": "主要マイルストーン",
    "sample.milestone1": "M1",
    "sample.milestone1Text": "形式とレンダラーを完成。",
    "sample.milestone2": "M2",
    "sample.milestone2Text": "視覚編集とメディア挿入を追加。",
    "sample.milestone3": "M3",
    "sample.milestone3Text": "クロスプラットフォーム版を公開。"
  });

  Object.assign(I18N["ko-KR"], {
    "insert.group.basic": "기본",
    "insert.group.compare": "비교",
    "insert.group.chart": "차트",
    "insert.group.table": "표",
    "insert.group.cards": "카드",
    "insert.group.metrics": "데이터",
    "insert.group.timeline": "흐름",
    "insert.group.other": "기타",
    "insert.text.title": "제목",
    "insert.text.titleLabel": "제목",
    "insert.text.title.title": "큰 제목 텍스트 삽입",
    "insert.text.subtitle": "부제",
    "insert.text.subtitle.title": "부제 텍스트 삽입",
    "insert.text.body": "본문",
    "insert.text.body.title": "본문 단락 삽입",
    "insert.text.bullet": "목록",
    "insert.text.bullet.title": "글머리 목록 삽입",
    "insert.text.label": "라벨",
    "insert.text.label.title": "작은 라벨 텍스트 삽입",
    "insert.text.box": "텍스트 상자",
    "insert.text.box.title": "일반 텍스트 상자 삽입",
    "insert.compare": "비교",
    "insert.compare.beforeAfter": "전후",
    "insert.compare.beforeAfter.title": "개선 전후 비교 슬라이드 삽입",
    "insert.compare.decision": "결정",
    "insert.compare.decision.title": "두 방안을 비교하는 슬라이드 삽입",
    "insert.chart.bar": "막대",
    "insert.chart.bar.title": "분기나 카테고리 비교용 막대 차트 삽입",
    "insert.chart.line": "추세",
    "insert.chart.line.title": "성장이나 변화 추세용 선 차트 삽입",
    "insert.chart.donut": "비중",
    "insert.chart.donut.title": "구성 비율용 도넛 차트 삽입",
    "insert.table.plan": "계획표",
    "insert.table.plan.title": "프로젝트 계획표 삽입",
    "insert.table.compare": "비교표",
    "insert.table.compare.title": "방안 비교표 삽입",
    "insert.table.checklist": "체크",
    "insert.table.checklist.title": "출시 또는 납품 체크리스트 삽입",
    "insert.cards.core": "3요점",
    "insert.cards.core.title": "세 가지 핵심 카드 삽입",
    "insert.cards.features": "기능",
    "insert.cards.features.title": "세 가지 기능 카드 삽입",
    "insert.cards.prosCons": "장단",
    "insert.cards.prosCons.title": "장점, 한계, 다음 단계 카드 삽입",
    "insert.metrics.kpi": "KPI",
    "insert.metrics.kpi.title": "핵심 지표 카드 삽입",
    "insert.metrics.progress": "진행",
    "insert.metrics.progress.title": "프로젝트 진행 지표 삽입",
    "insert.metrics.beforeAfter": "전후",
    "insert.metrics.beforeAfter.title": "개선 전후 지표 삽입",
    "insert.timeline.roadmap": "로드맵",
    "insert.timeline.roadmap.title": "로드맵 타임라인 삽입",
    "insert.timeline.process": "프로세스",
    "insert.timeline.process.title": "프로세스 타임라인 삽입",
    "insert.timeline.milestones": "마일스톤",
    "insert.timeline.milestones.title": "마일스톤 타임라인 삽입",
    "sample.compareBeforeAfterTitle": "개선 전후 비교",
    "sample.beforeTitle": "이전",
    "sample.beforeText": "작업이 흩어지고 정보 정리가 수작업이라 품질이 흔들렸습니다.",
    "sample.afterTitle": "이후",
    "sample.afterText": "구조가 통일되고 콘텐츠를 재사용해 더 빠르게 전달합니다.",
    "sample.compareDecisionTitle": "방안 선택",
    "sample.optionATitle": "방안 A",
    "sample.optionAText": "빠르게 출시하고 비용이 낮아 1단계 검증에 적합합니다.",
    "sample.optionBTitle": "방안 B",
    "sample.optionBText": "기능이 완성도 높고 확장성이 좋아 2단계 구축에 적합합니다.",
    "sample.chartLineTitle": "성장 추세",
    "sample.chartDonutTitle": "리소스 비중",
    "sample.month1": "1월",
    "sample.month2": "2월",
    "sample.month3": "3월",
    "sample.month4": "4월",
    "sample.activeUsers": "활성 사용자",
    "sample.retention": "유지율",
    "sample.channelProduct": "제품",
    "sample.channelContent": "콘텐츠",
    "sample.channelSales": "영업",
    "sample.channelOps": "운영",
    "sample.share": "비중",
    "sample.tableCompareTitle": "방안 비교표",
    "sample.dimension": "기준",
    "sample.optionA": "방안 A",
    "sample.optionB": "방안 B",
    "sample.recommendation": "추천",
    "sample.low": "낮음",
    "sample.fast": "빠름",
    "sample.medium": "중간",
    "sample.high": "높음",
    "sample.scale": "확장성",
    "sample.tableChecklistTitle": "출시 체크리스트",
    "sample.item": "항목",
    "sample.due": "기한",
    "sample.contentReview": "콘텐츠 확인",
    "sample.product": "제품",
    "sample.thisWeek": "이번 주",
    "sample.assetReady": "소재 준비",
    "sample.releaseReview": "출시 검토",
    "sample.nextWeek": "다음 주",
    "sample.cardsFeaturesTitle": "핵심 기능",
    "sample.feature1Title": "자동 구조화",
    "sample.feature1Text": "자료를 발표에 맞는 구조로 정리합니다.",
    "sample.feature2Title": "단일 파일",
    "sample.feature2Text": "이미지, 비디오, 오디오를 하나의 ppt.html에 담습니다.",
    "sample.feature3Title": "캔버스 편집",
    "sample.feature3Text": "텍스트, 차트, 미디어, 레이아웃을 하나의 캔버스에서 관리합니다.",
    "sample.cardsProsConsTitle": "장점과 다음 단계",
    "sample.proTitle": "강점",
    "sample.proText": "생성이 빠르고 구조가 명확하며 계속 편집하기 쉽습니다.",
    "sample.conTitle": "한계",
    "sample.conText": "자유 배치에는 더 많은 컨트롤과 레이어가 필요합니다.",
    "sample.nextTitle": "다음",
    "sample.nextText": "컴포넌트 변형을 늘리고 편집 경험을 다듬습니다.",
    "sample.metricsProgressTitle": "프로젝트 진행",
    "sample.completed": "완료",
    "sample.completedDetail": "핵심 기능은 사용할 수 있습니다.",
    "sample.openTasks": "남은 작업",
    "sample.openTasksDetail": "경험, 문서, 예외 처리가 중심입니다.",
    "sample.risks": "위험",
    "sample.risksDetail": "실제 사용자 흐름에서 계속 검증해야 합니다.",
    "sample.metricsBeforeAfterTitle": "개선 효과",
    "sample.timeCost": "시간 비용",
    "sample.timeCostDetail": "준비부터 발표까지 시간이 줄었습니다.",
    "sample.quality": "품질",
    "sample.qualityDetail": "템플릿 제약으로 페이지가 안정됩니다.",
    "sample.output": "산출",
    "sample.outputDetail": "같은 시간에 더 많은 버전을 만들 수 있습니다.",
    "sample.timelineProcessTitle": "작업 프로세스",
    "sample.process1": "수집",
    "sample.process1Text": "목표, 청중, 자료, 핵심 메시지를 모읍니다.",
    "sample.process2": "생성",
    "sample.process2Text": "AI가 구조화된 ppt.html 초안을 만듭니다.",
    "sample.process3": "편집",
    "sample.process3Text": "캔버스에서 텍스트, 차트, 미디어를 편집합니다.",
    "sample.process4": "공유",
    "sample.process4Text": "단일 파일로 저장하고 다른 사람도 열 수 있게 합니다.",
    "sample.timelineMilestonesTitle": "주요 마일스톤",
    "sample.milestone1": "M1",
    "sample.milestone1Text": "핵심 형식과 렌더러 완성.",
    "sample.milestone2": "M2",
    "sample.milestone2Text": "시각 편집과 미디어 삽입 추가.",
    "sample.milestone3": "M3",
    "sample.milestone3Text": "크로스 플랫폼 데스크톱 버전 출시."
  });

  Object.assign(I18N["zh-CN"], {
    "field.deckTransition": "默认切换",
    "field.slideTransition": "本页切换",
    "transition.inherit": "跟随全局",
    "transition.none": "无",
    "transition.fade": "淡入",
    "transition.slide": "滑入",
    "transition.push": "推入",
    "transition.zoom": "缩放"
  });

  Object.assign(I18N["en-US"], {
    "field.deckTransition": "Default transition",
    "field.slideTransition": "Slide transition",
    "transition.inherit": "Use deck default",
    "transition.none": "None",
    "transition.fade": "Fade",
    "transition.slide": "Slide",
    "transition.push": "Push",
    "transition.zoom": "Zoom"
  });

  Object.assign(I18N["ja-JP"], {
    "field.deckTransition": "既定の切替",
    "field.slideTransition": "このスライドの切替",
    "transition.inherit": "全体設定に従う",
    "transition.none": "なし",
    "transition.fade": "フェード",
    "transition.slide": "スライド",
    "transition.push": "プッシュ",
    "transition.zoom": "ズーム"
  });

  Object.assign(I18N["ko-KR"], {
    "field.deckTransition": "기본 전환",
    "field.slideTransition": "슬라이드 전환",
    "transition.inherit": "전체 설정 사용",
    "transition.none": "없음",
    "transition.fade": "페이드",
    "transition.slide": "슬라이드",
    "transition.push": "밀기",
    "transition.zoom": "줌"
  });

  Object.assign(I18N["zh-CN"], {
    "panel.style": "元素样式",
    "style.noSelection": "选中画布上的文字或组件后，可调整样式。",
    "style.target": "对象：{name}",
    "style.bold": "加粗",
    "style.italic": "斜体",
    "style.reset": "清除样式",
    "style.clearColor": "恢复默认文字色",
    "style.clearBackground": "清除背景色",
    "style.clearBorder": "清除边框色",
    "field.fontFamily": "字体",
    "font.default": "默认",
    "font.system": "系统无衬线",
    "font.display": "演示标题",
    "font.arial": "Arial",
    "font.helvetica": "Helvetica",
    "font.aptos": "Aptos",
    "font.calibri": "Calibri",
    "font.verdana": "Verdana",
    "font.tahoma": "Tahoma",
    "font.avenir": "Avenir",
    "font.serif": "衬线",
    "font.georgia": "Georgia",
    "font.times": "Times",
    "font.cambria": "Cambria",
    "font.cjkSans": "中文黑体",
    "font.pingfang": "苹方",
    "font.yahei": "微软雅黑",
    "font.dengxian": "等线",
    "font.simhei": "黑体",
    "font.stheiti": "华文黑体",
    "font.hiraginoSans": "冬青黑体",
    "font.notoSansCjk": "思源黑体 / Noto Sans CJK",
    "font.cjkSerif": "宋体 / 明朝",
    "font.songti": "宋体",
    "font.simsun": "中易宋体",
    "font.fangsong": "仿宋",
    "font.kaiti": "楷体",
    "font.yuMincho": "游明朝",
    "font.notoSerifCjk": "思源宋体 / Noto Serif CJK",
    "font.yuGothic": "游ゴシック",
    "font.meiryo": "Meiryo",
    "font.malgun": "Malgun Gothic",
    "font.mono": "等宽",
    "font.menlo": "Menlo",
    "font.consolas": "Consolas",
    "font.courier": "Courier New",
    "font.handwriting": "手写感",
    "field.fontSize": "字号",
    "field.textColor": "文字颜色",
    "field.backgroundColor": "背景色",
    "field.borderColor": "边框色",
    "field.borderWidth": "边框粗细",
    "field.cornerRadius": "圆角",
    "field.opacity": "透明度",
    "field.textAlign": "对齐",
    "align.default": "默认",
    "align.left": "左对齐",
    "align.center": "居中",
    "align.right": "右对齐",
    "align.justify": "两端对齐"
  });

  Object.assign(I18N["en-US"], {
    "panel.style": "Element Style",
    "style.noSelection": "Select text or a component on the canvas to edit its style.",
    "style.target": "Target: {name}",
    "style.bold": "Bold",
    "style.italic": "Italic",
    "style.reset": "Clear style",
    "style.clearColor": "Restore default text color",
    "style.clearBackground": "Clear background",
    "style.clearBorder": "Clear border color",
    "field.fontFamily": "Font",
    "font.default": "Default",
    "font.system": "System sans",
    "font.display": "Presentation title",
    "font.arial": "Arial",
    "font.helvetica": "Helvetica",
    "font.aptos": "Aptos",
    "font.calibri": "Calibri",
    "font.verdana": "Verdana",
    "font.tahoma": "Tahoma",
    "font.avenir": "Avenir",
    "font.serif": "Serif",
    "font.georgia": "Georgia",
    "font.times": "Times",
    "font.cambria": "Cambria",
    "font.cjkSans": "CJK sans",
    "font.pingfang": "PingFang",
    "font.yahei": "Microsoft YaHei",
    "font.dengxian": "DengXian",
    "font.simhei": "SimHei",
    "font.stheiti": "STHeiti",
    "font.hiraginoSans": "Hiragino Sans",
    "font.notoSansCjk": "Noto Sans CJK",
    "font.cjkSerif": "CJK serif",
    "font.songti": "Songti",
    "font.simsun": "SimSun",
    "font.fangsong": "FangSong",
    "font.kaiti": "Kaiti",
    "font.yuMincho": "Yu Mincho",
    "font.notoSerifCjk": "Noto Serif CJK",
    "font.yuGothic": "Yu Gothic",
    "font.meiryo": "Meiryo",
    "font.malgun": "Malgun Gothic",
    "font.mono": "Monospace",
    "font.menlo": "Menlo",
    "font.consolas": "Consolas",
    "font.courier": "Courier New",
    "font.handwriting": "Handwriting",
    "field.fontSize": "Font size",
    "field.textColor": "Text color",
    "field.backgroundColor": "Background",
    "field.borderColor": "Border color",
    "field.borderWidth": "Border width",
    "field.cornerRadius": "Radius",
    "field.opacity": "Opacity",
    "field.textAlign": "Align",
    "align.default": "Default",
    "align.left": "Left",
    "align.center": "Center",
    "align.right": "Right",
    "align.justify": "Justify"
  });

  Object.assign(I18N["ja-JP"], {
    "panel.style": "要素スタイル",
    "style.noSelection": "キャンバス上の文字やコンポーネントを選択するとスタイルを編集できます。",
    "style.target": "対象: {name}",
    "style.bold": "太字",
    "style.italic": "斜体",
    "style.reset": "スタイルをクリア",
    "style.clearColor": "文字色を既定に戻す",
    "style.clearBackground": "背景をクリア",
    "style.clearBorder": "枠線色をクリア",
    "field.fontFamily": "フォント",
    "font.default": "既定",
    "font.system": "システム角ゴシック",
    "font.display": "プレゼン見出し",
    "font.arial": "Arial",
    "font.helvetica": "Helvetica",
    "font.aptos": "Aptos",
    "font.calibri": "Calibri",
    "font.verdana": "Verdana",
    "font.tahoma": "Tahoma",
    "font.avenir": "Avenir",
    "font.serif": "セリフ",
    "font.georgia": "Georgia",
    "font.times": "Times",
    "font.cambria": "Cambria",
    "font.cjkSans": "CJK ゴシック",
    "font.pingfang": "PingFang",
    "font.yahei": "Microsoft YaHei",
    "font.dengxian": "DengXian",
    "font.simhei": "SimHei",
    "font.stheiti": "華文黒体",
    "font.hiraginoSans": "ヒラギノ角ゴ",
    "font.notoSansCjk": "Noto Sans CJK",
    "font.cjkSerif": "CJK 明朝",
    "font.songti": "Songti",
    "font.simsun": "SimSun",
    "font.fangsong": "FangSong",
    "font.kaiti": "Kaiti",
    "font.yuMincho": "游明朝",
    "font.notoSerifCjk": "Noto Serif CJK",
    "font.yuGothic": "游ゴシック",
    "font.meiryo": "メイリオ",
    "font.malgun": "Malgun Gothic",
    "font.mono": "等幅",
    "font.menlo": "Menlo",
    "font.consolas": "Consolas",
    "font.courier": "Courier New",
    "font.handwriting": "手書き風",
    "field.fontSize": "文字サイズ",
    "field.textColor": "文字色",
    "field.backgroundColor": "背景色",
    "field.borderColor": "枠線色",
    "field.borderWidth": "枠線幅",
    "field.cornerRadius": "角丸",
    "field.opacity": "不透明度",
    "field.textAlign": "揃え",
    "align.default": "既定",
    "align.left": "左",
    "align.center": "中央",
    "align.right": "右",
    "align.justify": "両端"
  });

  Object.assign(I18N["ko-KR"], {
    "panel.style": "요소 스타일",
    "style.noSelection": "캔버스의 텍스트나 컴포넌트를 선택하면 스타일을 편집할 수 있습니다.",
    "style.target": "대상: {name}",
    "style.bold": "굵게",
    "style.italic": "기울임",
    "style.reset": "스타일 지우기",
    "style.clearColor": "기본 글자색으로 복원",
    "style.clearBackground": "배경 지우기",
    "style.clearBorder": "테두리 색 지우기",
    "field.fontFamily": "글꼴",
    "font.default": "기본",
    "font.system": "시스템 산세리프",
    "font.display": "발표 제목",
    "font.arial": "Arial",
    "font.helvetica": "Helvetica",
    "font.aptos": "Aptos",
    "font.calibri": "Calibri",
    "font.verdana": "Verdana",
    "font.tahoma": "Tahoma",
    "font.avenir": "Avenir",
    "font.serif": "세리프",
    "font.georgia": "Georgia",
    "font.times": "Times",
    "font.cambria": "Cambria",
    "font.cjkSans": "CJK 산세리프",
    "font.pingfang": "PingFang",
    "font.yahei": "Microsoft YaHei",
    "font.dengxian": "DengXian",
    "font.simhei": "SimHei",
    "font.stheiti": "STHeiti",
    "font.hiraginoSans": "Hiragino Sans",
    "font.notoSansCjk": "Noto Sans CJK",
    "font.cjkSerif": "CJK 세리프",
    "font.songti": "Songti",
    "font.simsun": "SimSun",
    "font.fangsong": "FangSong",
    "font.kaiti": "Kaiti",
    "font.yuMincho": "Yu Mincho",
    "font.notoSerifCjk": "Noto Serif CJK",
    "font.yuGothic": "Yu Gothic",
    "font.meiryo": "Meiryo",
    "font.malgun": "맑은 고딕",
    "font.mono": "고정폭",
    "font.menlo": "Menlo",
    "font.consolas": "Consolas",
    "font.courier": "Courier New",
    "font.handwriting": "손글씨 느낌",
    "field.fontSize": "글자 크기",
    "field.textColor": "글자색",
    "field.backgroundColor": "배경색",
    "field.borderColor": "테두리 색",
    "field.borderWidth": "테두리 두께",
    "field.cornerRadius": "모서리",
    "field.opacity": "불투명도",
    "field.textAlign": "정렬",
    "align.default": "기본",
    "align.left": "왼쪽",
    "align.center": "가운데",
    "align.right": "오른쪽",
    "align.justify": "양쪽"
  });

  Object.assign(I18N["zh-CN"], {
    "insert.group.shapes": "形状",
    "insert.shape.rectangle": "矩形",
    "insert.shape.rectangle.title": "插入矩形",
    "insert.shape.ellipse": "圆形",
    "insert.shape.ellipse.title": "插入圆形或椭圆",
    "insert.shape.line": "线条",
    "insert.shape.line.title": "插入线条",
    "insert.shape.arrow": "箭头",
    "insert.shape.arrow.title": "插入箭头",
    "insert.shape.callout": "标注",
    "insert.shape.callout.title": "插入标注框",
    "panel.object": "对象",
    "object.noSelection": "选中画布对象后，可调整位置、尺寸、图层和数据。",
    "object.target": "{name} · ID {id}",
    "object.duplicate": "重复",
    "object.forward": "上移一层",
    "object.backward": "下移一层",
    "object.front": "置顶",
    "object.back": "置底",
    "object.align": "对齐",
    "object.alignLeft": "左对齐",
    "object.alignCenter": "水平居中",
    "object.alignRight": "右对齐",
    "object.alignTop": "顶对齐",
    "object.alignMiddle": "垂直居中",
    "object.alignBottom": "底对齐",
    "object.distributeH": "横向分布",
    "object.distributeV": "纵向分布",
    "object.delete": "删除",
    "selection.multiple": "已选 {count} 个对象",
    "field.objectX": "X",
    "field.objectY": "Y",
    "field.objectW": "宽",
    "field.objectH": "高",
    "field.rotation": "旋转",
    "field.layer": "层级",
    "field.objectData": "对象数据 JSON（高级）",
    "object.typedMedia": "媒体内容",
    "object.typedChart": "图表内容",
    "object.typedTable": "表格内容",
    "context.copy": "复制",
    "context.paste": "粘贴",
    "context.duplicate": "重复",
    "context.delete": "删除",
    "canvas.shape": "形状",
    "toast.objectCopied": "对象已复制",
    "toast.objectPasted": "对象已粘贴",
    "toast.layerChanged": "图层已调整",
    "toast.objectDataInvalid": "对象数据不是有效 JSON"
  });

  Object.assign(I18N["en-US"], {
    "insert.group.shapes": "Shapes",
    "insert.shape.rectangle": "Rect",
    "insert.shape.rectangle.title": "Insert rectangle",
    "insert.shape.ellipse": "Oval",
    "insert.shape.ellipse.title": "Insert oval or circle",
    "insert.shape.line": "Line",
    "insert.shape.line.title": "Insert line",
    "insert.shape.arrow": "Arrow",
    "insert.shape.arrow.title": "Insert arrow",
    "insert.shape.callout": "Callout",
    "insert.shape.callout.title": "Insert callout",
    "panel.object": "Object",
    "object.noSelection": "Select a canvas object to edit position, size, layer, and data.",
    "object.target": "{name} · ID {id}",
    "object.duplicate": "Duplicate",
    "object.forward": "Bring forward",
    "object.backward": "Send backward",
    "object.front": "Bring to front",
    "object.back": "Send to back",
    "object.align": "Align",
    "object.alignLeft": "Align left",
    "object.alignCenter": "Align center",
    "object.alignRight": "Align right",
    "object.alignTop": "Align top",
    "object.alignMiddle": "Align middle",
    "object.alignBottom": "Align bottom",
    "object.distributeH": "Distribute horizontally",
    "object.distributeV": "Distribute vertically",
    "object.delete": "Delete",
    "selection.multiple": "{count} objects selected",
    "field.objectX": "X",
    "field.objectY": "Y",
    "field.objectW": "W",
    "field.objectH": "H",
    "field.rotation": "Rotation",
    "field.layer": "Layer",
    "field.objectData": "Object data JSON (advanced)",
    "object.typedMedia": "Media content",
    "object.typedChart": "Chart content",
    "object.typedTable": "Table content",
    "context.copy": "Copy",
    "context.paste": "Paste",
    "context.duplicate": "Duplicate",
    "context.delete": "Delete",
    "canvas.shape": "Shape",
    "toast.objectCopied": "Object copied",
    "toast.objectPasted": "Object pasted",
    "toast.layerChanged": "Layer changed",
    "toast.objectDataInvalid": "Object data is not valid JSON"
  });

  Object.assign(I18N["ja-JP"], {
    "insert.group.shapes": "図形",
    "insert.shape.rectangle": "四角",
    "insert.shape.rectangle.title": "四角形を挿入",
    "insert.shape.ellipse": "円",
    "insert.shape.ellipse.title": "円または楕円を挿入",
    "insert.shape.line": "線",
    "insert.shape.line.title": "線を挿入",
    "insert.shape.arrow": "矢印",
    "insert.shape.arrow.title": "矢印を挿入",
    "insert.shape.callout": "吹き出し",
    "insert.shape.callout.title": "吹き出しを挿入",
    "panel.object": "オブジェクト",
    "object.noSelection": "キャンバス上のオブジェクトを選択すると、位置、サイズ、レイヤー、データを編集できます。",
    "object.target": "{name} · ID {id}",
    "object.duplicate": "複製",
    "object.forward": "前面へ",
    "object.backward": "背面へ",
    "object.front": "最前面",
    "object.back": "最背面",
    "object.align": "整列",
    "object.alignLeft": "左揃え",
    "object.alignCenter": "左右中央",
    "object.alignRight": "右揃え",
    "object.alignTop": "上揃え",
    "object.alignMiddle": "上下中央",
    "object.alignBottom": "下揃え",
    "object.distributeH": "左右に分布",
    "object.distributeV": "上下に分布",
    "object.delete": "削除",
    "selection.multiple": "{count} 個を選択中",
    "field.objectX": "X",
    "field.objectY": "Y",
    "field.objectW": "幅",
    "field.objectH": "高さ",
    "field.rotation": "回転",
    "field.layer": "階層",
    "field.objectData": "オブジェクトデータ JSON（詳細）",
    "object.typedMedia": "メディア内容",
    "object.typedChart": "グラフ内容",
    "object.typedTable": "表の内容",
    "context.copy": "コピー",
    "context.paste": "貼り付け",
    "context.duplicate": "複製",
    "context.delete": "削除",
    "canvas.shape": "図形",
    "toast.objectCopied": "コピーしました",
    "toast.objectPasted": "貼り付けました",
    "toast.layerChanged": "レイヤーを変更しました",
    "toast.objectDataInvalid": "オブジェクトデータが有効な JSON ではありません"
  });

  Object.assign(I18N["ko-KR"], {
    "insert.group.shapes": "도형",
    "insert.shape.rectangle": "사각형",
    "insert.shape.rectangle.title": "사각형 삽입",
    "insert.shape.ellipse": "원",
    "insert.shape.ellipse.title": "원 또는 타원 삽입",
    "insert.shape.line": "선",
    "insert.shape.line.title": "선 삽입",
    "insert.shape.arrow": "화살표",
    "insert.shape.arrow.title": "화살표 삽입",
    "insert.shape.callout": "말풍선",
    "insert.shape.callout.title": "말풍선 삽입",
    "panel.object": "개체",
    "object.noSelection": "캔버스 개체를 선택하면 위치, 크기, 레이어, 데이터를 편집할 수 있습니다.",
    "object.target": "{name} · ID {id}",
    "object.duplicate": "복제",
    "object.forward": "앞으로",
    "object.backward": "뒤로",
    "object.front": "맨 앞으로",
    "object.back": "맨 뒤로",
    "object.align": "정렬",
    "object.alignLeft": "왼쪽 정렬",
    "object.alignCenter": "가로 가운데",
    "object.alignRight": "오른쪽 정렬",
    "object.alignTop": "위 정렬",
    "object.alignMiddle": "세로 가운데",
    "object.alignBottom": "아래 정렬",
    "object.distributeH": "가로 분배",
    "object.distributeV": "세로 분배",
    "object.delete": "삭제",
    "selection.multiple": "{count}개 선택됨",
    "field.objectX": "X",
    "field.objectY": "Y",
    "field.objectW": "너비",
    "field.objectH": "높이",
    "field.rotation": "회전",
    "field.layer": "레이어",
    "field.objectData": "개체 데이터 JSON (고급)",
    "object.typedMedia": "미디어 내용",
    "object.typedChart": "차트 내용",
    "object.typedTable": "표 내용",
    "context.copy": "복사",
    "context.paste": "붙여넣기",
    "context.duplicate": "복제",
    "context.delete": "삭제",
    "canvas.shape": "도형",
    "toast.objectCopied": "개체를 복사했습니다",
    "toast.objectPasted": "개체를 붙여넣었습니다",
    "toast.layerChanged": "레이어를 변경했습니다",
    "toast.objectDataInvalid": "개체 데이터가 올바른 JSON이 아닙니다"
  });

  Object.assign(I18N["zh-CN"], {
    "dialog.shortcuts": "快捷键",
    "present.fullscreen": "全屏",
    "present.fitMode": "切换适合 / 填满（M）",
    "present.fitContain": "适合",
    "present.fitFill": "填满",
    "present.shortcuts": "快捷键",
    "present.shortcutsTitle": "查看演示快捷键（?）",
    "shortcut.presentStart": "从第一页播放",
    "shortcut.presentCurrent": "从当前页播放",
    "shortcut.next": "下一页",
    "shortcut.prev": "上一页",
    "shortcut.fitMode": "切换适合 / 填满",
    "shortcut.fullscreen": "切换全屏",
    "shortcut.blank": "黑屏 / 白屏",
    "shortcut.jump": "输入页码后跳转",
    "shortcut.help": "显示快捷键",
    "shortcut.exit": "退出演示",
    "table.commands": "表格操作",
    "table.addRow": "加行",
    "table.insertRowAbove": "上方插入行",
    "table.insertRowBelow": "下方插入行",
    "table.deleteRow": "删行",
    "table.addColumn": "加列",
    "table.insertColumnLeft": "左侧插入列",
    "table.insertColumnRight": "右侧插入列",
    "table.deleteColumn": "删列",
    "table.clearCell": "清空单元格",
    "canvas.tableHeader": "表格表头",
    "canvas.tableCell": "表格单元格",
    "toast.tableChanged": "表格已更新"
  });

  Object.assign(I18N["en-US"], {
    "dialog.shortcuts": "Keyboard Shortcuts",
    "present.fullscreen": "Full screen",
    "present.fitMode": "Toggle fit / fill (M)",
    "present.fitContain": "Fit",
    "present.fitFill": "Fill",
    "present.shortcuts": "Shortcuts",
    "present.shortcutsTitle": "View presentation shortcuts (?)",
    "shortcut.presentStart": "Present from first slide",
    "shortcut.presentCurrent": "Present from current slide",
    "shortcut.next": "Next slide",
    "shortcut.prev": "Previous slide",
    "shortcut.fitMode": "Toggle fit / fill",
    "shortcut.fullscreen": "Toggle full screen",
    "shortcut.blank": "Black / white screen",
    "shortcut.jump": "Type a page number, then jump",
    "shortcut.help": "Show shortcuts",
    "shortcut.exit": "Exit presentation",
    "table.commands": "Table actions",
    "table.addRow": "Add row",
    "table.insertRowAbove": "Insert row above",
    "table.insertRowBelow": "Insert row below",
    "table.deleteRow": "Delete row",
    "table.addColumn": "Add column",
    "table.insertColumnLeft": "Insert column left",
    "table.insertColumnRight": "Insert column right",
    "table.deleteColumn": "Delete column",
    "table.clearCell": "Clear cell",
    "canvas.tableHeader": "Table header",
    "canvas.tableCell": "Table cell",
    "toast.tableChanged": "Table updated"
  });

  Object.assign(I18N["ja-JP"], {
    "dialog.shortcuts": "ショートカット",
    "present.fullscreen": "全画面",
    "present.fitMode": "自動調整 / 塗りつぶしを切替（M）",
    "present.fitContain": "自動",
    "present.fitFill": "塗りつぶし",
    "present.shortcuts": "キー",
    "present.shortcutsTitle": "発表ショートカットを表示（?）",
    "shortcut.presentStart": "最初のスライドから発表",
    "shortcut.presentCurrent": "現在のスライドから発表",
    "shortcut.next": "次のスライド",
    "shortcut.prev": "前のスライド",
    "shortcut.fitMode": "自動調整 / 塗りつぶしを切替",
    "shortcut.fullscreen": "全画面を切替",
    "shortcut.blank": "黒画面 / 白画面",
    "shortcut.jump": "ページ番号を入力して移動",
    "shortcut.help": "ショートカットを表示",
    "shortcut.exit": "発表を終了",
    "table.commands": "表の操作",
    "table.addRow": "行を追加",
    "table.insertRowAbove": "上に行を挿入",
    "table.insertRowBelow": "下に行を挿入",
    "table.deleteRow": "行を削除",
    "table.addColumn": "列を追加",
    "table.insertColumnLeft": "左に列を挿入",
    "table.insertColumnRight": "右に列を挿入",
    "table.deleteColumn": "列を削除",
    "table.clearCell": "セルをクリア",
    "canvas.tableHeader": "表の見出し",
    "canvas.tableCell": "表のセル",
    "toast.tableChanged": "表を更新しました"
  });

  Object.assign(I18N["ko-KR"], {
    "dialog.shortcuts": "단축키",
    "present.fullscreen": "전체 화면",
    "present.fitMode": "맞춤 / 채우기 전환 (M)",
    "present.fitContain": "맞춤",
    "present.fitFill": "채우기",
    "present.shortcuts": "단축키",
    "present.shortcutsTitle": "발표 단축키 보기 (?)",
    "shortcut.presentStart": "첫 슬라이드부터 발표",
    "shortcut.presentCurrent": "현재 슬라이드부터 발표",
    "shortcut.next": "다음 슬라이드",
    "shortcut.prev": "이전 슬라이드",
    "shortcut.fitMode": "맞춤 / 채우기 전환",
    "shortcut.fullscreen": "전체 화면 전환",
    "shortcut.blank": "검은 화면 / 흰 화면",
    "shortcut.jump": "페이지 번호 입력 후 이동",
    "shortcut.help": "단축키 보기",
    "shortcut.exit": "발표 종료",
    "table.commands": "표 작업",
    "table.addRow": "행 추가",
    "table.insertRowAbove": "위에 행 삽입",
    "table.insertRowBelow": "아래에 행 삽입",
    "table.deleteRow": "행 삭제",
    "table.addColumn": "열 추가",
    "table.insertColumnLeft": "왼쪽에 열 삽입",
    "table.insertColumnRight": "오른쪽에 열 삽입",
    "table.deleteColumn": "열 삭제",
    "table.clearCell": "셀 비우기",
    "canvas.tableHeader": "표 머리글",
    "canvas.tableCell": "표 셀",
    "toast.tableChanged": "표가 업데이트되었습니다"
  });

  Object.assign(I18N["zh-CN"], {
    "action.new": "新建演示文稿",
    "action.newShort": "新建",
    "action.templates": "从模板新建",
    "action.templatesShort": "模板",
    "action.open": "打开 PPT.html 或 JSON",
    "action.save": "下载单文件 PPT.html",
    "action.saveDesktop": "保存当前文件",
    "action.aiJson": "打开 AI JSON 数据面板",
    "action.validate": "质量检查当前文稿",
    "toolbar.file": "文件操作",
    "toolbar.edit": "编辑操作",
    "toolbar.review": "检查与数据",
    "toolbar.present": "播放",
    "object.geometry": "位置和尺寸",
    "object.layer": "图层",
    "object.data": "对象数据",
    "zoom.controls": "画布缩放",
    "zoom.in": "放大画布",
    "zoom.out": "缩小画布",
    "zoom.fit": "适合窗口",
    "zoom.fitLabel": "适合",
    "zoom.level": "{percent}%"
  });

  Object.assign(I18N["en-US"], {
    "action.new": "New presentation",
    "action.newShort": "New",
    "action.templates": "New from template",
    "action.templatesShort": "Templates",
    "action.open": "Open PPT.html or JSON",
    "action.save": "Download single-file PPT.html",
    "action.saveDesktop": "Save current file",
    "action.aiJson": "Open AI JSON data panel",
    "action.validate": "Check this deck",
    "toolbar.file": "File actions",
    "toolbar.edit": "Edit actions",
    "toolbar.review": "Check and data",
    "toolbar.present": "Presentation",
    "object.geometry": "Position and size",
    "object.layer": "Layer",
    "object.data": "Object data",
    "zoom.controls": "Canvas zoom",
    "zoom.in": "Zoom in",
    "zoom.out": "Zoom out",
    "zoom.fit": "Fit to window",
    "zoom.fitLabel": "Fit",
    "zoom.level": "{percent}%"
  });

  Object.assign(I18N["ja-JP"], {
    "action.new": "新しいプレゼンを作成",
    "action.newShort": "新規",
    "action.templates": "テンプレートから作成",
    "action.templatesShort": "テンプレート",
    "action.open": "PPT.html または JSON を開く",
    "action.save": "単一ファイルの PPT.html をダウンロード",
    "action.saveDesktop": "現在のファイルを保存",
    "action.aiJson": "AI JSON データパネルを開く",
    "action.validate": "この文書をチェック",
    "toolbar.file": "ファイル操作",
    "toolbar.edit": "編集操作",
    "toolbar.review": "チェックとデータ",
    "toolbar.present": "発表",
    "object.geometry": "位置とサイズ",
    "object.layer": "レイヤー",
    "object.data": "オブジェクトデータ",
    "zoom.controls": "キャンバスのズーム",
    "zoom.in": "拡大",
    "zoom.out": "縮小",
    "zoom.fit": "ウィンドウに合わせる",
    "zoom.fitLabel": "自動",
    "zoom.level": "{percent}%"
  });

  Object.assign(I18N["ko-KR"], {
    "action.new": "새 프레젠테이션",
    "action.newShort": "새로 만들기",
    "action.templates": "템플릿으로 새로 만들기",
    "action.templatesShort": "템플릿",
    "action.open": "PPT.html 또는 JSON 열기",
    "action.save": "단일 파일 PPT.html 다운로드",
    "action.saveDesktop": "현재 파일 저장",
    "action.aiJson": "AI JSON 데이터 패널 열기",
    "action.validate": "현재 문서 검사",
    "toolbar.file": "파일 작업",
    "toolbar.edit": "편집 작업",
    "toolbar.review": "검사 및 데이터",
    "toolbar.present": "발표",
    "object.geometry": "위치와 크기",
    "object.layer": "레이어",
    "object.data": "개체 데이터",
    "zoom.controls": "캔버스 확대/축소",
    "zoom.in": "확대",
    "zoom.out": "축소",
    "zoom.fit": "창에 맞춤",
    "zoom.fitLabel": "맞춤",
    "zoom.level": "{percent}%"
  });

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindEvents();
    bindTooltipEvents();
    configureRuntime();
    applyLanguage({ skipRender: true });
    renderAll();
    window.addEventListener("resize", function () {
      fitFrame(els.stageFrame, els.stageViewport);
      fitSlideThumbPreviews();
      renderCanvasControls();
      if (presenting) fitPresentationFrame(els.presenterStage, els.presenter);
    });
  }

  function cacheElements() {
    [
      "newDeckBtn", "templatesBtn", "openDeckBtn", "downloadDeckBtn", "saveAsDeckBtn", "jsonBtn", "validateBtn", "presentBtn",
      "languageInput", "fileInput", "imageFileInput", "videoFileInput", "audioFileInput", "fileStatus",
      "addSlideBtn", "slideList", "duplicateSlideBtn", "moveSlideUpBtn", "moveSlideDownBtn", "deleteSlideBtn",
      "currentSlideLabel", "currentSlideTitle", "undoBtn", "redoBtn", "stageViewport", "stageFrame",
      "deckTitleInput", "deckThemeInput", "deckTransitionInput", "slideLayoutInput", "slideTransitionInput", "kickerInput", "titleInput", "subtitleInput", "bodyInput",
      "stylePanel", "styleTargetLabel", "styleFontFamilyInput", "styleFontSizeInput", "styleAlignInput", "styleBoldBtn", "styleItalicBtn", "styleColorInput", "styleColorResetBtn",
      "styleBackgroundInput", "styleBackgroundResetBtn", "styleBorderColorInput", "styleBorderColorResetBtn", "styleBorderWidthInput", "styleRadiusInput", "styleOpacityInput", "styleResetBtn",
      "objectPanel", "objectTargetLabel", "objectXInput", "objectYInput", "objectWInput", "objectHInput", "objectRotationInput", "objectZInput",
      "objectDuplicateBtn", "objectDeleteBtn", "objectBringForwardBtn", "objectSendBackwardBtn", "objectBringFrontBtn", "objectSendBackBtn", "objectDataInput",
      "objectAlignLeftBtn", "objectAlignCenterBtn", "objectAlignRightBtn", "objectAlignTopBtn", "objectAlignMiddleBtn", "objectAlignBottomBtn", "objectDistributeHBtn", "objectDistributeVBtn",
      "objectTableTools", "objectTableAddRowBtn", "objectTableDeleteRowBtn", "objectTableAddColumnBtn", "objectTableDeleteColumnBtn",
      "objectMediaEditor", "objectMediaSrcInput", "objectMediaPosterField", "objectMediaPosterInput", "objectMediaCaptionInput", "objectMediaAltField", "objectMediaAltInput", "objectMediaFitField", "objectMediaFitInput",
      "objectChartEditor", "objectChartKindInput", "objectChartUnitInput", "objectChartLabelsInput", "objectChartSeriesInput",
      "objectTableEditor", "objectTableColumnsInput", "objectTableRowsInput",
      "zoomOutBtn", "zoomFitBtn", "zoomInBtn", "zoomLabel",
      "imageFileBtn", "imageFitInput", "imageSrcInput", "imageAltInput", "imageCaptionInput", "itemsInput", "leftTitleInput", "leftTextInput", "rightTitleInput", "rightTextInput",
      "videoFileBtn", "videoFitInput", "videoSrcInput", "videoPosterInput", "videoCaptionInput",
      "audioFileBtn", "audioSrcInput", "audioCaptionInput",
      "cardsInput", "metricsInput", "chartKindInput", "chartLabelsInput", "chartSeriesInput", "chartUnitInput", "tableAddRowBtn", "tableDeleteRowBtn", "tableAddColumnBtn", "tableDeleteColumnBtn", "tableColumnsInput", "tableRowsInput", "quoteInput", "authorInput", "codeInput", "notesInput",
      "presenter", "presenterStage", "presentPrevBtn", "presentCounter", "presentNextBtn", "presentFitBtn", "presentFitLabel", "presentShortcutsBtn", "presentFullscreenBtn", "presentExitBtn",
      "jsonDialog", "jsonTextarea", "copyJsonBtn", "loadJsonBtn",
      "templateDialog", "shortcutDialog", "validationDialog", "validationSummary", "validationReport", "copyValidationBtn", "copyRepairPromptBtn", "canvasContextMenu", "slideContextMenu", "toast"
    ].forEach(function (id) {
      els[id] = document.getElementById(id);
    });
  }

  function extendLang(lang, overrides) {
    I18N[lang] = Object.assign({}, I18N["zh-CN"], overrides || {});
  }

  function loadLanguage() {
    try {
      var saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (["zh-CN", "en-US", "ja-JP", "ko-KR"].indexOf(saved) !== -1) return saved;
    } catch (error) {
      // Ignore storage failures; the UI can still run in Chinese.
    }
    return "zh-CN";
  }

  function t(key) {
    var lang = I18N[uiLang] ? uiLang : "zh-CN";
    if (I18N[lang] && Object.prototype.hasOwnProperty.call(I18N[lang], key)) return I18N[lang][key];
    if (I18N["zh-CN"] && Object.prototype.hasOwnProperty.call(I18N["zh-CN"], key)) return I18N["zh-CN"][key];
    return key;
  }

  function formatText(template, values) {
    return String(template || "").replace(/\{(\w+)\}/g, function (match, name) {
      return values && values[name] != null ? values[name] : match;
    });
  }

  function applyLanguage(options) {
    var settings = options || {};
    if (!I18N[uiLang]) uiLang = "zh-CN";
    document.documentElement.lang = uiLang;
    if (els.languageInput) els.languageInput.value = uiLang;

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (node) {
      var value = t(node.getAttribute("data-i18n-title"));
      setTooltip(node, value);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-i18n-group]").forEach(function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-group")));
    });

    populateLayoutSelect();
    refreshTooltips();
    updateZoomLabel();
    updatePresenterFitButton();
    if (!settings.skipRender) renderAll();
  }

  function setTooltip(node, value) {
    var text = normalizeTooltipText(value);
    if (!node || !text) return;
    node.setAttribute("title", text);
    node.setAttribute("aria-label", text);
    node.setAttribute("data-tooltip", text);
  }

  function normalizeTooltipText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function tooltipTextFromNode(node) {
    if (!node) return "";
    return normalizeTooltipText(
      node.getAttribute("data-tooltip") ||
      node.getAttribute("title") ||
      node.getAttribute("aria-label") ||
      node.textContent
    );
  }

  function refreshTooltips() {
    document.querySelectorAll("[data-i18n-title]").forEach(function (node) {
      setTooltip(node, t(node.getAttribute("data-i18n-title")));
    });

    document.querySelectorAll("button, [role='button']").forEach(function (node) {
      if (node.hasAttribute("data-tooltip")) return;
      var text = tooltipTextFromNode(node);
      if (text) setTooltip(node, text);
    });

    document.querySelectorAll("select").forEach(function (node) {
      if (node.hasAttribute("data-tooltip")) return;
      var label = node.closest("label");
      var text = tooltipTextFromNode(label) || tooltipTextFromNode(node);
      if (text) setTooltip(node, text);
    });
  }

  function bindTooltipEvents() {
    document.addEventListener("pointerover", function (event) {
      var target = tooltipTargetFromEvent(event);
      if (target) scheduleTooltip(target);
    });
    document.addEventListener("pointerout", function (event) {
      if (tooltipTarget && (!event.relatedTarget || !tooltipTarget.contains(event.relatedTarget))) hideTooltip();
    });
    document.addEventListener("focusin", function (event) {
      var target = tooltipTargetFromEvent(event);
      if (target) showTooltip(target);
    });
    document.addEventListener("focusout", function () {
      hideTooltip();
    });
    document.addEventListener("pointermove", function () {
      if (tooltipTarget && tooltipEl && !tooltipEl.hidden) positionTooltip(tooltipTarget);
    });
    window.addEventListener("scroll", hideTooltip, true);
    window.addEventListener("resize", hideTooltip);
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hideTooltip();
    });
  }

  function tooltipTargetFromEvent(event) {
    var node = event.target && event.target.closest && event.target.closest("[data-tooltip], [title]");
    if (!node || node.closest(".app-tooltip")) return null;
    return tooltipTextFromNode(node) ? node : null;
  }

  function ensureTooltipEl() {
    if (tooltipEl) return tooltipEl;
    tooltipEl = document.createElement("div");
    tooltipEl.className = "app-tooltip";
    tooltipEl.hidden = true;
    document.body.appendChild(tooltipEl);
    return tooltipEl;
  }

  function scheduleTooltip(target) {
    window.clearTimeout(tooltipTimer);
    tooltipTarget = target;
    tooltipTimer = window.setTimeout(function () {
      showTooltip(target);
    }, 120);
  }

  function showTooltip(target) {
    var text = tooltipTextFromNode(target);
    if (!target || !text) return;
    var tip = ensureTooltipEl();
    tooltipTarget = target;
    tip.textContent = text;
    tip.hidden = false;
    tip.classList.remove("above");
    positionTooltip(target);
  }

  function hideTooltip() {
    window.clearTimeout(tooltipTimer);
    tooltipTimer = 0;
    tooltipTarget = null;
    if (tooltipEl) tooltipEl.hidden = true;
  }

  function positionTooltip(target) {
    var tip = ensureTooltipEl();
    if (!target || tip.hidden) return;
    var rect = target.getBoundingClientRect();
    var tipRect = tip.getBoundingClientRect();
    var gap = 8;
    var left = rect.left + rect.width / 2 - tipRect.width / 2;
    var top = rect.bottom + gap;

    left = clamp(left, 8, Math.max(8, window.innerWidth - tipRect.width - 8));
    if (top + tipRect.height + 8 > window.innerHeight) {
      top = rect.top - tipRect.height - gap;
      tip.classList.add("above");
    } else {
      tip.classList.remove("above");
    }
    top = clamp(top, 8, Math.max(8, window.innerHeight - tipRect.height - 8));
    tip.style.left = Math.round(left) + "px";
    tip.style.top = Math.round(top) + "px";
  }

  function configureRuntime() {
    if (desktop && desktop.isDesktop) {
      els.downloadDeckBtn.setAttribute("data-i18n-title", "action.saveDesktop");
      els.saveAsDeckBtn.hidden = false;
      desktop.onMenuCommand(function (command) {
        if (command === "new") createNewDeck();
        if (command === "templates") els.templateDialog.showModal();
        if (command === "open") openDeck();
        if (command === "save") saveDeck(false);
        if (command === "saveAs") saveDeck(true);
        if (command === "validate") showValidationDialog();
        if (command === "presentFromStart" && !isTextEditingTarget(document.activeElement)) openPresenter(0);
        if (command === "present" && !isTextEditingTarget(document.activeElement)) openPresenter(presenting ? presentIndex : currentIndex);
        if (command === "shortcuts") showShortcutDialog();
        if (command === "canvasZoomIn") stepCanvasZoom(1);
        if (command === "canvasZoomOut") stepCanvasZoom(-1);
        if (command === "canvasZoomFit") fitCanvasToViewport();
        if (command === "canvasZoomActual") setCanvasZoom(1, { mode: "manual" });
      });
    }
    updateFileStatus();
  }

  function populateLayoutSelect() {
    var currentValue = els.slideLayoutInput.value;
    els.slideLayoutInput.innerHTML = "";
    PPTHtml.layouts.forEach(function (layout) {
      var option = document.createElement("option");
      option.value = layout[0];
      option.textContent = layoutLabel(layout[0]);
      els.slideLayoutInput.appendChild(option);
    });
    if (currentValue) els.slideLayoutInput.value = currentValue;
  }

  function bindEvents() {
    els.newDeckBtn.addEventListener("click", function () {
      createNewDeck();
    });

    els.templatesBtn.addEventListener("click", function () {
      els.templateDialog.showModal();
    });

    els.languageInput.addEventListener("change", function () {
      uiLang = els.languageInput.value || "zh-CN";
      localStorage.setItem(LANG_STORAGE_KEY, uiLang);
      applyLanguage();
      toast(t("toast.languageChanged"));
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
          alert(formatText(t("alert.openFailed"), { message: error.message }));
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
      commitActiveCanvasEdit();
      els.jsonTextarea.value = JSON.stringify(deck, null, 2);
      els.jsonDialog.showModal();
      els.jsonTextarea.focus();
    });

    els.copyJsonBtn.addEventListener("click", function () {
      commitActiveCanvasEdit();
      els.jsonTextarea.value = JSON.stringify(deck, null, 2);
      navigator.clipboard.writeText(els.jsonTextarea.value).then(function () {
        toast(t("toast.jsonCopied"));
      }).catch(function () {
        els.jsonTextarea.select();
        document.execCommand("copy");
        toast(t("toast.jsonCopied"));
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
        toastWithValidation(t("toast.jsonLoaded"));
      } catch (error) {
        alert(formatText(t("alert.loadFailed"), { message: error.message }));
      }
    });

    els.validateBtn.addEventListener("click", function () {
      commitActiveCanvasEdit();
      showValidationDialog();
    });

    els.copyValidationBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(els.validationReport.value).then(function () {
        toast(t("toast.reportCopied"));
      }).catch(function () {
        els.validationReport.select();
        document.execCommand("copy");
        toast(t("toast.reportCopied"));
      });
    });

    els.copyRepairPromptBtn.addEventListener("click", function () {
      commitActiveCanvasEdit();
      var prompt = buildRepairPrompt();
      navigator.clipboard.writeText(prompt).then(function () {
        toast(t("toast.repairPromptCopied"));
      }).catch(function () {
        els.validationReport.value = prompt;
        els.validationReport.select();
        document.execCommand("copy");
        toast(t("toast.repairPromptCopied"));
      });
    });

    els.stageFrame.addEventListener("pointerdown", handleCanvasPointerDown);
    els.stageFrame.addEventListener("dblclick", handleCanvasDblClick);
    els.stageFrame.addEventListener("contextmenu", handleCanvasContextMenu);
    els.stageFrame.addEventListener("dragstart", handleCanvasNativeDragStart);
    els.stageViewport.addEventListener("pointerdown", handleCanvasViewportPointerDown, true);
    els.stageViewport.addEventListener("wheel", handleCanvasWheel, { passive: false });
    els.stageViewport.addEventListener("dragover", handleCanvasDragOver);
    els.stageViewport.addEventListener("dragenter", handleCanvasDragEnter);
    els.stageViewport.addEventListener("dragleave", handleCanvasDragLeave);
    els.stageViewport.addEventListener("drop", handleCanvasDrop);
    els.slideList.addEventListener("contextmenu", handleSlideListContextMenu);

    document.querySelectorAll("[data-insert]").forEach(function (button) {
      button.addEventListener("click", function () {
        insertComponent(button.getAttribute("data-insert"), {
          source: "click",
          variant: button.getAttribute("data-variant") || ""
        });
      });
      button.addEventListener("dragstart", function (event) {
        var type = button.getAttribute("data-insert");
        var variant = button.getAttribute("data-variant") || "";
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("application/x-htmlppt-component", encodeComponentPayload(type, variant));
        event.dataTransfer.setData("text/plain", variant ? type + ":" + variant : type);
      });
    });

    els.templateDialog.querySelectorAll("[data-template]").forEach(function (button) {
      button.addEventListener("click", function () {
        createFromTemplate(button.getAttribute("data-template"));
      });
    });

    els.addSlideBtn.addEventListener("click", function () { addSlideAfter(currentIndex, { focusThumb: true }); });
    els.duplicateSlideBtn.addEventListener("click", function () { duplicateSlideAt(currentIndex, { focusThumb: true }); });
    els.moveSlideUpBtn.addEventListener("click", function () { moveSlideRelative(currentIndex, -1, { focusThumb: true }); });
    els.moveSlideDownBtn.addEventListener("click", function () { moveSlideRelative(currentIndex, 1, { focusThumb: true }); });
    els.deleteSlideBtn.addEventListener("click", function () { deleteSlideAt(currentIndex, { confirm: true, focusThumb: true }); });

    els.undoBtn.addEventListener("click", undo);
    els.redoBtn.addEventListener("click", redo);
    els.zoomOutBtn.addEventListener("click", function () { stepCanvasZoom(-1); });
    els.zoomInBtn.addEventListener("click", function () { stepCanvasZoom(1); });
    els.zoomFitBtn.addEventListener("click", fitCanvasToViewport);

    bindDeckInput(els.deckTitleInput, function (value) { deck.title = value; });
    bindDeckInput(els.deckThemeInput, function (value) { deck.theme = value; });
    bindDeckInput(els.deckTransitionInput, function (value) { deck.transition = value; });

    bindSlideInput(els.slideLayoutInput, function (slide, value) { slide.layout = value; updateFieldVisibility(); });
    bindSlideInput(els.slideTransitionInput, function (slide, value) { slide.transition = value; });
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
    bindSlideInput(els.tableColumnsInput, function (slide, value) { slide.table.columns = splitTableCells(value); });
    bindSlideInput(els.tableRowsInput, function (slide, value) { slide.table.rows = parseTableRows(value); });
    els.tableAddRowBtn.addEventListener("click", function () { mutateSelectedTable("addRow"); });
    els.tableDeleteRowBtn.addEventListener("click", function () { mutateSelectedTable("deleteRow"); });
    els.tableAddColumnBtn.addEventListener("click", function () { mutateSelectedTable("addColumn"); });
    els.tableDeleteColumnBtn.addEventListener("click", function () { mutateSelectedTable("deleteColumn"); });
    bindSlideInput(els.quoteInput, function (slide, value) { slide.quote = value; });
    bindSlideInput(els.authorInput, function (slide, value) { slide.author = value; });
    bindSlideInput(els.codeInput, function (slide, value) { slide.code = value; });
    bindSlideInput(els.notesInput, function (slide, value) { slide.notes = value; });

    bindStyleInput(els.styleFontFamilyInput, "fontFamily");
    bindStyleInput(els.styleFontSizeInput, "fontSize", { number: true, min: 8, max: 180 });
    bindStyleInput(els.styleAlignInput, "textAlign");
    bindStyleInput(els.styleColorInput, "color");
    bindStyleInput(els.styleBackgroundInput, "backgroundColor");
    bindStyleInput(els.styleBorderColorInput, "borderColor");
    bindStyleInput(els.styleBorderWidthInput, "borderWidth", { number: true, min: 0, max: 24 });
    bindStyleInput(els.styleRadiusInput, "borderRadius", { number: true, min: 0, max: 96 });
    bindStyleInput(els.styleOpacityInput, "opacity", { number: true, min: 0.1, max: 1 });
    bindStyleButton(els.styleBoldBtn, "fontWeight", "800");
    bindStyleButton(els.styleItalicBtn, "fontStyle", "italic");
    bindStyleReset(els.styleColorResetBtn, "color");
    bindStyleReset(els.styleBackgroundResetBtn, "backgroundColor");
    bindStyleReset(els.styleBorderColorResetBtn, "borderColor");
    els.styleResetBtn.addEventListener("click", function () {
      resetSelectedStyle();
    });

    bindObjectGeometryInput(els.objectXInput, "x", { min: -900, max: PPTHtml.baseWidth });
    bindObjectGeometryInput(els.objectYInput, "y", { min: -600, max: PPTHtml.baseHeight });
    bindObjectGeometryInput(els.objectWInput, "w", { min: 24, max: PPTHtml.baseWidth * 2 });
    bindObjectGeometryInput(els.objectHInput, "h", { min: 24, max: PPTHtml.baseHeight * 2 });
    bindObjectGeometryInput(els.objectRotationInput, "rotation", { min: -360, max: 360 });
    bindObjectGeometryInput(els.objectZInput, "zIndex", { min: 0, max: 999 });
    els.objectDataInput.addEventListener("focus", captureEditStart);
    els.objectDataInput.addEventListener("change", commitObjectDataFromPanel);
    bindObjectDataInput(els.objectMediaSrcInput, function (object, value) { ensureObjectData(object).src = value; });
    bindObjectDataInput(els.objectMediaPosterInput, function (object, value) { ensureObjectData(object).poster = value; });
    bindObjectDataInput(els.objectMediaCaptionInput, function (object, value) { ensureObjectData(object).caption = value; });
    bindObjectDataInput(els.objectMediaAltInput, function (object, value) { ensureObjectData(object).alt = value; });
    bindObjectDataInput(els.objectMediaFitInput, function (object, value) { ensureObjectData(object).fit = value; });
    bindObjectDataInput(els.objectChartKindInput, function (object, value) { ensureObjectData(object).kind = value; });
    bindObjectDataInput(els.objectChartUnitInput, function (object, value) { ensureObjectData(object).unit = value; });
    bindObjectDataInput(els.objectChartLabelsInput, function (object, value) { ensureObjectData(object).labels = splitCells(value); });
    bindObjectDataInput(els.objectChartSeriesInput, function (object, value) { ensureObjectData(object).series = parseChartSeries(value); });
    bindObjectDataInput(els.objectTableColumnsInput, function (object, value) { ensureObjectData(object).columns = splitTableCells(value); }, { fitTable: true });
    bindObjectDataInput(els.objectTableRowsInput, function (object, value) { ensureObjectData(object).rows = parseTableRows(value); }, { fitTable: true });
    els.objectDuplicateBtn.addEventListener("click", duplicateSelectedCanvas);
    els.objectDeleteBtn.addEventListener("click", function () {
      deleteSelectedCanvasContent(currentCanvasSelectionPaths());
    });
    els.objectBringForwardBtn.addEventListener("click", function () { moveSelectedObjectLayer("forward"); });
    els.objectSendBackwardBtn.addEventListener("click", function () { moveSelectedObjectLayer("backward"); });
    els.objectBringFrontBtn.addEventListener("click", function () { moveSelectedObjectLayer("front"); });
    els.objectSendBackBtn.addEventListener("click", function () { moveSelectedObjectLayer("back"); });
    els.objectAlignLeftBtn.addEventListener("click", function () { alignSelectedCanvasTargets("left"); });
    els.objectAlignCenterBtn.addEventListener("click", function () { alignSelectedCanvasTargets("center"); });
    els.objectAlignRightBtn.addEventListener("click", function () { alignSelectedCanvasTargets("right"); });
    els.objectAlignTopBtn.addEventListener("click", function () { alignSelectedCanvasTargets("top"); });
    els.objectAlignMiddleBtn.addEventListener("click", function () { alignSelectedCanvasTargets("middle"); });
    els.objectAlignBottomBtn.addEventListener("click", function () { alignSelectedCanvasTargets("bottom"); });
    els.objectDistributeHBtn.addEventListener("click", function () { distributeSelectedCanvasTargets("horizontal"); });
    els.objectDistributeVBtn.addEventListener("click", function () { distributeSelectedCanvasTargets("vertical"); });
    els.objectTableAddRowBtn.addEventListener("click", function () { mutateSelectedTable("addRow"); });
    els.objectTableDeleteRowBtn.addEventListener("click", function () { mutateSelectedTable("deleteRow"); });
    els.objectTableAddColumnBtn.addEventListener("click", function () { mutateSelectedTable("addColumn"); });
    els.objectTableDeleteColumnBtn.addEventListener("click", function () { mutateSelectedTable("deleteColumn"); });

    els.imageFileBtn.addEventListener("click", function () {
      openImagePicker();
    });

    els.imageFileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        cancelPendingMediaInsert();
        return;
      }
      readImageFile(file);
      event.target.value = "";
    });
    els.imageFileInput.addEventListener("cancel", cancelPendingMediaInsert);

    els.videoFileBtn.addEventListener("click", function () {
      openVideoPicker();
    });

    els.videoFileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        cancelPendingMediaInsert();
        return;
      }
      readVideoFile(file);
      event.target.value = "";
    });
    els.videoFileInput.addEventListener("cancel", cancelPendingMediaInsert);

    bindSlideInput(els.videoFitInput, function (slide, value) { slide.video.fit = value; });
    bindSlideInput(els.videoSrcInput, function (slide, value) { slide.video.src = value; });
    bindSlideInput(els.videoPosterInput, function (slide, value) { slide.video.poster = value; });
    bindSlideInput(els.videoCaptionInput, function (slide, value) { slide.video.caption = value; });

    els.audioFileBtn.addEventListener("click", function () {
      openAudioPicker();
    });

    els.audioFileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        cancelPendingMediaInsert();
        return;
      }
      readAudioFile(file);
      event.target.value = "";
    });
    els.audioFileInput.addEventListener("cancel", cancelPendingMediaInsert);

    bindSlideInput(els.audioSrcInput, function (slide, value) { slide.audio.src = value; });
    bindSlideInput(els.audioCaptionInput, function (slide, value) { slide.audio.caption = value; });

    els.presentBtn.addEventListener("click", function () { openPresenter(currentIndex); });
    els.presentPrevBtn.addEventListener("click", function () { showPresentationSlide(presentIndex - 1); });
    els.presentNextBtn.addEventListener("click", function () { showPresentationSlide(presentIndex + 1); });
    els.presentFitBtn.addEventListener("click", togglePresenterScaleMode);
    els.presentShortcutsBtn.addEventListener("click", showShortcutDialog);
    els.presentFullscreenBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      togglePresenterFullscreen();
    });
    els.presentExitBtn.addEventListener("click", closePresenter);
    els.presenter.addEventListener("pointermove", handlePresenterPointerMove);
    els.presenter.addEventListener("pointerdown", handlePresenterPointerDown);
    els.presenter.addEventListener("click", handlePresenterClick);
    els.presenter.addEventListener("focusin", showPresenterChrome);
    els.presenter.addEventListener("dblclick", togglePresenterFullscreen);
    document.addEventListener("fullscreenchange", handleDocumentFullscreenChange);

    if (els.canvasContextMenu) {
      els.canvasContextMenu.addEventListener("pointerdown", function (event) {
        event.stopPropagation();
      });
      els.canvasContextMenu.addEventListener("click", handleCanvasContextMenuAction);
    }
    if (els.slideContextMenu) {
      els.slideContextMenu.addEventListener("pointerdown", function (event) {
        event.stopPropagation();
      });
      els.slideContextMenu.addEventListener("click", handleSlideContextMenuAction);
    }
    document.addEventListener("pointerdown", function (event) {
      if (els.canvasContextMenu && !event.target.closest("#canvasContextMenu")) hideCanvasContextMenu();
      if (els.slideContextMenu && !event.target.closest("#slideContextMenu")) hideSlideContextMenu();
    });
    window.addEventListener("resize", hideCanvasContextMenu);
    window.addEventListener("scroll", hideCanvasContextMenu, true);
    document.addEventListener("keydown", handleGlobalKeydown);
    document.addEventListener("keyup", handleGlobalKeyup);
  }

  function readImageFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var objectPath = pendingMediaObjectPath;
      var createSlide = pendingMediaInsertType === "image";
      pendingMediaInsertType = "";
      pendingMediaObjectPath = "";
      pendingMediaPlaceholderPath = "";
      commit(function () {
        if (objectPath && setObjectMediaSource(objectPath, "image", reader.result, file)) return;
        var slide = createSlide ? createComponentSlide() : currentSlide();
        if (["hero", "imageRight", "imageLeft", "imageFull", "imageBackground"].indexOf(slide.layout) === -1) {
          slide.layout = "imageRight";
        }
        slide.image.src = reader.result;
        if (!slide.image.alt) slide.image.alt = file.name.replace(/\.[^.]+$/, "");
      });
      toast(t("toast.imageAdded"));
    };
    reader.readAsDataURL(file);
  }

  function readVideoFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var objectPath = pendingMediaObjectPath;
      var createSlide = pendingMediaInsertType === "video";
      pendingMediaInsertType = "";
      pendingMediaObjectPath = "";
      pendingMediaPlaceholderPath = "";
      commit(function () {
        if (objectPath && setObjectMediaSource(objectPath, "video", reader.result, file)) return;
        var slide = createSlide ? createComponentSlide() : currentSlide();
        slide.layout = "video";
        slide.video.src = reader.result;
        if (!slide.video.caption) slide.video.caption = file.name.replace(/\.[^.]+$/, "");
      });
      toast(t("toast.videoAdded"));
    };
    reader.readAsDataURL(file);
  }

  function readAudioFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var objectPath = pendingMediaObjectPath;
      var createSlide = pendingMediaInsertType === "audio";
      pendingMediaInsertType = "";
      pendingMediaObjectPath = "";
      pendingMediaPlaceholderPath = "";
      commit(function () {
        if (objectPath && setObjectMediaSource(objectPath, "audio", reader.result, file)) return;
        var slide = createSlide ? createComponentSlide() : currentSlide();
        slide.layout = "audio";
        slide.audio.src = reader.result;
        if (!slide.audio.caption) slide.audio.caption = file.name.replace(/\.[^.]+$/, "");
      });
      toast(t("toast.audioAdded"));
    };
    reader.readAsDataURL(file);
  }

  function cancelPendingMediaInsert() {
    var placeholderPath = pendingMediaPlaceholderPath;
    pendingMediaInsertType = "";
    pendingMediaObjectPath = "";
    pendingMediaPlaceholderPath = "";
    if (!placeholderPath) return;

    var index = objectIndexFromPath(placeholderPath);
    var slide = currentSlide();
    if (index < 0 || !Array.isArray(slide.objects) || !slide.objects[index]) return;
    commit(function () {
      slide.objects.splice(index, 1);
      remapObjectCanvasPaths(slide, index);
      clearCanvasSelection();
    });
  }

  function openImagePicker(insertType) {
    pendingMediaPlaceholderPath = "";
    if (!insertType && selectedCanvasPath && objectTypeFromPath(selectedCanvasPath) === "image") {
      pendingMediaObjectPath = selectedCanvasPath;
    }
    pendingMediaInsertType = insertType === "component" ? "image" : "";
    els.imageFileInput.value = "";
    els.imageFileInput.click();
  }

  function openVideoPicker(insertType) {
    pendingMediaPlaceholderPath = "";
    if (!insertType && selectedCanvasPath && objectTypeFromPath(selectedCanvasPath) === "video") {
      pendingMediaObjectPath = selectedCanvasPath;
    }
    pendingMediaInsertType = insertType === "component" ? "video" : "";
    els.videoFileInput.value = "";
    els.videoFileInput.click();
  }

  function openAudioPicker(insertType) {
    pendingMediaPlaceholderPath = "";
    if (!insertType && selectedCanvasPath && objectTypeFromPath(selectedCanvasPath) === "audio") {
      pendingMediaObjectPath = selectedCanvasPath;
    }
    pendingMediaInsertType = insertType === "component" ? "audio" : "";
    els.audioFileInput.value = "";
    els.audioFileInput.click();
  }

  function insertComponent(type, options) {
    var settings = options || {};
    var variant = settings.variant || "";
    if (type === "text") {
      var nextPath = "";
      commit(function () {
        nextPath = addTextBoxToSlide(currentSlide(), settings.point, variant);
        setCanvasSelection([nextPath]);
      });
      toast(formatText(t("toast.componentInserted"), { name: insertLabel(type, variant) }));
      window.setTimeout(function () {
        var node = canvasNodeByPath(nextPath);
        if (node) startCanvasEdit(node);
      }, 0);
      return;
    }
    if (type === "image" && settings.source === "click") {
      pendingMediaObjectPath = insertObjectToCurrentSlide("image", variant, settings.point);
      pendingMediaPlaceholderPath = pendingMediaObjectPath;
      pendingMediaInsertType = "";
      els.imageFileInput.value = "";
      els.imageFileInput.click();
      return;
    }
    if (type === "video" && settings.source === "click") {
      pendingMediaObjectPath = insertObjectToCurrentSlide("video", variant, settings.point);
      pendingMediaPlaceholderPath = pendingMediaObjectPath;
      pendingMediaInsertType = "";
      els.videoFileInput.value = "";
      els.videoFileInput.click();
      return;
    }
    if (type === "audio" && settings.source === "click") {
      pendingMediaObjectPath = insertObjectToCurrentSlide("audio", variant, settings.point);
      pendingMediaPlaceholderPath = pendingMediaObjectPath;
      pendingMediaInsertType = "";
      els.audioFileInput.value = "";
      els.audioFileInput.click();
      return;
    }

    insertObjectToCurrentSlide(type, variant, settings.point);
    toast(formatText(t("toast.componentInserted"), { name: insertLabel(type, variant) }));
  }

  function shouldCreateComponentSlide(type) {
    return ["image", "video", "audio", "compare", "chart", "table", "cards", "metrics", "timeline", "quote", "code", "shape"].indexOf(type) !== -1;
  }

  function insertObjectToCurrentSlide(type, variant, point) {
    var nextPath = "";
    commit(function () {
      nextPath = addObjectToSlide(currentSlide(), type, variant, point);
      setCanvasSelection([nextPath]);
    });
    window.setTimeout(function () {
      var node = canvasNodeByPath(nextPath);
      if (node) selectCanvasTarget(node);
    }, 0);
    return nextPath;
  }

  function addObjectToSlide(slide, type, variant, point) {
    slide.objects = Array.isArray(slide.objects) ? slide.objects : [];
    var index = slide.objects.length;
    var object = createSlideObject(slide, type, variant, point, index);
    slide.objects.push(object);
    return "objects." + index;
  }

  function createSlideObject(slide, type, variant, point, index) {
    var objectType = normalizeInsertObjectType(type);
    var data = createObjectData(objectType, variant);
    var size = defaultObjectSize(objectType, variant, data);
    var origin = point
      ? objectOriginFromPoint(point, size)
      : findObjectPlacement(slide, size, index, objectType);
    return {
      id: PPTHtml.uid("object"),
      type: objectType,
      x: Math.round(origin.x),
      y: Math.round(origin.y),
      w: size.w,
      h: size.h,
      rotation: 0,
      zIndex: nextObjectZIndex(),
      data: data
    };
  }

  function objectOriginFromPoint(point, size) {
    return {
      x: clamp(point.x - size.w / 2, 32, PPTHtml.baseWidth - size.w - 32),
      y: clamp(point.y - size.h / 2, 36, PPTHtml.baseHeight - size.h - 36)
    };
  }

  function findObjectPlacement(slide, size, index, objectType) {
    var margin = 40;
    var center = defaultObjectCenter(index);
    var candidates = [
      { x: PPTHtml.baseWidth - size.w - margin, y: PPTHtml.baseHeight - size.h - margin },
      { x: margin, y: PPTHtml.baseHeight - size.h - margin },
      { x: PPTHtml.baseWidth - size.w - margin, y: margin },
      { x: margin, y: margin },
      { x: center.x - size.w / 2, y: center.y - size.h / 2 },
      { x: (PPTHtml.baseWidth - size.w) / 2, y: PPTHtml.baseHeight - size.h - 56 },
      { x: (PPTHtml.baseWidth - size.w) / 2, y: 76 }
    ].map(function (candidate) {
      return {
        x: clamp(candidate.x, margin, PPTHtml.baseWidth - size.w - margin),
        y: clamp(candidate.y, margin, PPTHtml.baseHeight - size.h - margin)
      };
    });
    var occupied = occupiedSlideBounds(slide, objectType);
    var best = candidates[0];
    var bestScore = Infinity;
    candidates.forEach(function (candidate, candidateIndex) {
      var bounds = { x: candidate.x, y: candidate.y, w: size.w, h: size.h };
      var overlap = occupied.reduce(function (sum, item) {
        return sum + rectOverlapArea(bounds, item);
      }, 0);
      var centerPenalty = Math.abs(candidate.x + size.w / 2 - center.x) * 0.08 + Math.abs(candidate.y + size.h / 2 - center.y) * 0.08;
      var score = overlap * 12 + centerPenalty + candidateIndex;
      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }
    });
    return best;
  }

  function occupiedSlideBounds(slide, objectType) {
    var bounds = layoutOccupiedBounds(slide || {});
    (Array.isArray(slide && slide.objects) ? slide.objects : []).forEach(function (object) {
      bounds.push({
        x: Number(object.x) || 0,
        y: Number(object.y) || 0,
        w: Math.max(0, Number(object.w) || 0),
        h: Math.max(0, Number(object.h) || 0)
      });
    });
    (Array.isArray(slide && slide.textBoxes) ? slide.textBoxes : []).forEach(function (box) {
      bounds.push({
        x: Number(box.x) || 0,
        y: Number(box.y) || 0,
        w: Math.max(0, Number(box.w) || 0),
        h: Math.max(0, Number(box.h) || 0)
      });
    });
    if (objectType === "table") {
      bounds = bounds.map(function (item) {
        return {
          x: item.x - 12,
          y: item.y - 12,
          w: item.w + 24,
          h: item.h + 24
        };
      });
    }
    return bounds.filter(function (item) {
      return item.w > 0 && item.h > 0;
    });
  }

  function layoutOccupiedBounds(slide) {
    var layout = slide.layout || "text";
    var titleHeight = slide.title ? 94 : 0;
    var subtitleHeight = slide.subtitle ? 54 : 0;
    var bodyHeight = slide.body ? 170 : 0;
    if (layout === "hero") {
      return [{ x: 72, y: 230, w: 770, h: 250 + subtitleHeight }];
    }
    if (layout === "imageRight") {
      return [
        { x: 72, y: 96, w: 560, h: 500 },
        { x: 702, y: 120, w: 506, h: 470 }
      ];
    }
    if (layout === "imageLeft") {
      return [
        { x: 72, y: 120, w: 506, h: 470 },
        { x: 652, y: 96, w: 560, h: 500 }
      ];
    }
    if (layout === "compare" || layout === "threeCards" || layout === "chart" || layout === "table" || layout === "timeline" || layout === "data") {
      return [{ x: 72, y: 72, w: 1136, h: 570 }];
    }
    if (layout === "video" || layout === "audio" || layout === "code") {
      return [{ x: 72, y: 72, w: 1136, h: 560 }];
    }
    if (layout === "imageFull" || layout === "imageBackground") {
      return [{ x: 72, y: 390, w: 780, h: 250 }];
    }
    if (layout === "section" || layout === "quote" || layout === "ending") {
      return [{ x: 72, y: 170, w: 980, h: 360 }];
    }
    return [{ x: 72, y: 78, w: 850, h: Math.max(180, titleHeight + subtitleHeight + bodyHeight + 120) }];
  }

  function rectOverlapArea(a, b) {
    var left = Math.max(a.x, b.x);
    var top = Math.max(a.y, b.y);
    var right = Math.min(a.x + a.w, b.x + b.w);
    var bottom = Math.min(a.y + a.h, b.y + b.h);
    return Math.max(0, right - left) * Math.max(0, bottom - top);
  }

  function normalizeInsertObjectType(type) {
    if (["image", "video", "audio", "compare", "chart", "table", "cards", "metrics", "timeline", "quote", "code", "shape"].indexOf(type) !== -1) {
      return type;
    }
    return "shape";
  }

  function defaultObjectSize(type, variant, data) {
    if (type === "table") return tableObjectSize(data);
    if (type === "chart") return chartObjectSize(data);
    if (type === "cards") return groupObjectSize(data && data.cards, 800, 300, 3);
    if (type === "metrics") return groupObjectSize(data && data.metrics, 800, 270, 3);
    if (type === "timeline") return timelineObjectSize(data);
    if (type === "compare") return compareObjectSize(data);
    if (type === "code") return codeObjectSize(data);
    var sizes = {
      image: { w: 520, h: 300 },
      video: { w: 560, h: 320 },
      audio: { w: 520, h: 150 },
      quote: { w: 560, h: 220 },
    };
    if (type === "shape") {
      if (variant === "line" || variant === "arrow") return { w: 420, h: 72 };
      if (variant === "ellipse") return { w: 240, h: 240 };
      if (variant === "callout") return { w: 360, h: 180 };
    }
    return sizes[type] || { w: 320, h: 180 };
  }

  function boundedObjectSize(width, height, minWidth, minHeight) {
    return {
      w: Math.round(clamp(width, minWidth || 240, PPTHtml.baseWidth - 96)),
      h: Math.round(clamp(height, minHeight || 120, PPTHtml.baseHeight - 96))
    };
  }

  function tableObjectSize(data) {
    var source = data && typeof data === "object" ? data : {};
    var columns = Array.isArray(source.columns) ? source.columns : [];
    var rows = Array.isArray(source.rows) ? source.rows : [];
    var colCount = Math.max(1, columns.length);
    var longest = columns.reduce(function (max, value) {
      return Math.max(max, String(value || "").length);
    }, 0);
    rows.forEach(function (row) {
      if (!Array.isArray(row)) return;
      colCount = Math.max(colCount, row.length);
      row.forEach(function (value) {
        longest = Math.max(longest, String(value || "").length);
      });
    });
    var rowCount = rows.length + (columns.length ? 1 : 0);
    var width = 104 + colCount * 150 + Math.min(150, longest * 4);
    var cellBudget = Math.max(8, Math.floor((width - 48) / colCount / 9));
    var rowLineCount = 0;
    if (columns.length) {
      rowLineCount += columns.reduce(function (max, value) {
        return Math.max(max, Math.ceil(String(value || "").length / cellBudget) || 1);
      }, 1);
    }
    rows.forEach(function (row) {
      var cells = Array.isArray(row) ? row : [];
      rowLineCount += cells.reduce(function (max, value) {
        return Math.max(max, Math.ceil(String(value || "").length / cellBudget) || 1);
      }, 1);
    });
    var height = 32 + Math.max(2, rowLineCount) * 42 + Math.max(0, rowCount - 1) * 4;
    return boundedObjectSize(width, height, Math.min(620, 150 + colCount * 135), 190);
  }

  function chartObjectSize(data) {
    var kind = data && data.kind === "donut" ? "donut" : data && data.kind === "line" ? "line" : "bar";
    var labels = data && Array.isArray(data.labels) ? data.labels.length : 0;
    var series = data && Array.isArray(data.series) ? data.series.length : 0;
    var legendCount = kind === "donut" ? labels : series;
    return boundedObjectSize(760 + Math.max(0, legendCount - 3) * 24, kind === "donut" ? 390 : 380, 700, 340);
  }

  function groupObjectSize(items, baseWidth, baseHeight, expectedCount) {
    var count = Math.max(expectedCount || 1, Array.isArray(items) ? items.length : 0);
    return boundedObjectSize(baseWidth + Math.max(0, count - 3) * 120, baseHeight, baseWidth, baseHeight);
  }

  function timelineObjectSize(data) {
    var items = data && Array.isArray(data.items) ? data.items : [];
    var count = Math.max(3, Math.min(5, items.length || 3));
    return boundedObjectSize(780, 112 + count * 62, 700, 300);
  }

  function compareObjectSize(data) {
    var left = data && data.left ? data.left : {};
    var right = data && data.right ? data.right : {};
    var textLength = String(left.text || "").length + String(right.text || "").length;
    return boundedObjectSize(780, 300 + Math.min(90, textLength * 0.8), 700, 300);
  }

  function codeObjectSize(data) {
    var lines = String(data && data.code || "").split(/\r?\n/).length;
    return boundedObjectSize(720, 120 + Math.max(3, lines) * 30, 600, 240);
  }

  function defaultObjectCenter(index) {
    return {
      x: 640 + (index % 3) * 28,
      y: 388 + (index % 4) * 24
    };
  }

  function nextObjectZIndex() {
    return (currentSlide().objects || []).reduce(function (max, object) {
      return Math.max(max, Number(object.zIndex) || 8);
    }, 8) + 1;
  }

  function createObjectData(type, variant) {
    var slide = { layout: "text", title: "" };
    applyComponentToSlide(slide, type, variant);
    if (type === "image") return Object.assign({}, slide.image || {});
    if (type === "video") return Object.assign({}, slide.video || {});
    if (type === "audio") return Object.assign({}, slide.audio || {});
    if (type === "chart") return JSON.parse(JSON.stringify(slide.chart || {}));
    if (type === "table") return JSON.parse(JSON.stringify(slide.table || {}));
    if (type === "cards") return { cards: JSON.parse(JSON.stringify(slide.cards || [])) };
    if (type === "metrics") return { metrics: JSON.parse(JSON.stringify(slide.metrics || [])) };
    if (type === "timeline") return { items: JSON.parse(JSON.stringify(slide.items || [])) };
    if (type === "quote") return { quote: slide.quote || "", author: slide.author || "" };
    if (type === "code") return { code: slide.code || "" };
    if (type === "compare") return {
      left: JSON.parse(JSON.stringify(slide.left || {})),
      right: JSON.parse(JSON.stringify(slide.right || {}))
    };
    if (type === "shape") return createShapeData(variant);
    return { label: insertLabel(type, variant) };
  }

  function createShapeData(variant) {
    var kind = ["rectangle", "roundedRectangle", "ellipse", "line", "arrow", "callout"].indexOf(variant) !== -1 ? variant : "rectangle";
    var lineLike = kind === "line" || kind === "arrow";
    return {
      kind: kind,
      text: kind === "callout" ? t("insert.shape.callout") : "",
      fill: lineLike ? "none" : "rgba(15,139,141,.14)",
      stroke: "#0f8b8d",
      strokeWidth: lineLike ? 4 : 3
    };
  }

  function createComponentSlide() {
    var slide = PPTHtml.normalizeSlide({
      id: PPTHtml.uid("slide"),
      layout: "text",
      title: ""
    }, currentIndex + 1);
    deck.slides.splice(currentIndex + 1, 0, slide);
    currentIndex += 1;
    return slide;
  }

  function insertMediaPlaceholder(type) {
    commit(function () {
      var slide = createComponentSlide();
      applyComponentToSlide(slide, type);
      clearCanvasSelection();
    });
    toast(formatText(t("toast.componentInserted"), { name: insertLabel(type) }));
  }

  function applyComponentToSlide(slide, type, variant) {
    var preset = variant || "";
    if (type === "text") {
      slide.layout = "text";
      if (shouldUseSampleTitle(slide)) slide.title = t("sample.textTitle");
      if (!slide.body) slide.body = t("sample.textBody");
      if (!slide.items || !slide.items.length) {
        slide.items = [
          { title: t("sample.point1"), text: t("sample.point1") },
          { title: t("sample.point2"), text: t("sample.point2") }
        ];
      }
      return;
    }
    if (type === "image") {
      slide.layout = "imageRight";
      if (shouldUseSampleTitle(slide)) slide.title = t("sample.imageTitle");
      slide.image = slide.image || {};
      slide.image.caption = slide.image.caption || "";
      return;
    }
    if (type === "video") {
      slide.layout = "video";
      if (shouldUseSampleTitle(slide)) slide.title = t("sample.videoTitle");
      slide.video = slide.video || {};
      slide.video.caption = slide.video.caption || "";
      slide.video.fit = slide.video.fit || "cover";
      return;
    }
    if (type === "audio") {
      slide.layout = "audio";
      if (shouldUseSampleTitle(slide)) slide.title = t("sample.audioTitle");
      slide.audio = slide.audio || {};
      slide.audio.caption = slide.audio.caption || "";
      return;
    }
    if (type === "compare") {
      slide.layout = "compare";
      if (preset === "decision") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.compareDecisionTitle");
        slide.left = { title: t("sample.optionATitle"), text: t("sample.optionAText") };
        slide.right = { title: t("sample.optionBTitle"), text: t("sample.optionBText") };
      } else {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.compareBeforeAfterTitle");
        slide.left = { title: t("sample.beforeTitle"), text: t("sample.beforeText") };
        slide.right = { title: t("sample.afterTitle"), text: t("sample.afterText") };
      }
      return;
    }
    if (type === "chart") {
      slide.layout = "chart";
      if (preset === "line") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.chartLineTitle");
        slide.chart = {
          kind: "line",
          labels: [t("sample.month1"), t("sample.month2"), t("sample.month3"), t("sample.month4")],
          series: [
            { name: t("sample.activeUsers"), values: [12, 18, 30, 46] },
            { name: t("sample.retention"), values: [8, 13, 21, 33] }
          ],
          unit: t("sample.unit")
        };
      } else if (preset === "donut") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.chartDonutTitle");
        slide.chart = {
          kind: "donut",
          labels: [t("sample.channelProduct"), t("sample.channelContent"), t("sample.channelSales"), t("sample.channelOps")],
          series: [{ name: t("sample.share"), values: [42, 28, 18, 12] }],
          unit: "%"
        };
      } else {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.chartTitle");
        slide.chart = {
          kind: "bar",
          labels: [t("sample.q1"), t("sample.q2"), t("sample.q3"), t("sample.q4")],
          series: [
            { name: t("sample.revenue"), values: [12, 20, 31, 42] },
            { name: t("sample.cost"), values: [8, 11, 18, 24] }
          ],
          unit: t("sample.unit")
        };
      }
      return;
    }
    if (type === "table") {
      slide.layout = "table";
      if (preset === "compare") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.tableCompareTitle");
        slide.table = {
          columns: [t("sample.dimension"), t("sample.optionA"), t("sample.optionB"), t("sample.recommendation")],
          rows: [
            [t("sample.cost"), t("sample.low"), t("sample.medium"), t("sample.optionA")],
            [t("sample.speed"), t("sample.fast"), t("sample.medium"), t("sample.optionA")],
            [t("sample.scale"), t("sample.medium"), t("sample.high"), t("sample.optionB")]
          ]
        };
      } else if (preset === "checklist") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.tableChecklistTitle");
        slide.table = {
          columns: [t("sample.item"), t("sample.owner"), t("sample.due"), t("sample.status")],
          rows: [
            [t("sample.contentReview"), t("sample.product"), t("sample.thisWeek"), t("sample.done")],
            [t("sample.assetReady"), t("sample.design"), t("sample.thisWeek"), t("sample.progress")],
            [t("sample.releaseReview"), t("sample.team"), t("sample.nextWeek"), t("sample.plan")]
          ]
        };
      } else {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.tableTitle");
        slide.table = {
          columns: [t("sample.phase"), t("sample.owner"), t("sample.status")],
          rows: [
            [t("sample.plan"), t("sample.team"), t("sample.done")],
            [t("sample.prototype"), t("sample.design"), t("sample.progress")]
          ]
        };
      }
      return;
    }
    if (type === "cards") {
      slide.layout = "threeCards";
      if (preset === "features") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.cardsFeaturesTitle");
        slide.cards = [
          { title: t("sample.feature1Title"), text: t("sample.feature1Text") },
          { title: t("sample.feature2Title"), text: t("sample.feature2Text") },
          { title: t("sample.feature3Title"), text: t("sample.feature3Text") }
        ];
      } else if (preset === "prosCons") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.cardsProsConsTitle");
        slide.cards = [
          { title: t("sample.proTitle"), text: t("sample.proText") },
          { title: t("sample.conTitle"), text: t("sample.conText") },
          { title: t("sample.nextTitle"), text: t("sample.nextText") }
        ];
      } else {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.cardsTitle");
        slide.cards = [
          { title: t("sample.card1Title"), text: t("sample.card1Text") },
          { title: t("sample.card2Title"), text: t("sample.card2Text") },
          { title: t("sample.card3Title"), text: t("sample.card3Text") }
        ];
      }
      return;
    }
    if (type === "metrics") {
      slide.layout = "data";
      if (preset === "progress") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.metricsProgressTitle");
        slide.metrics = [
          { value: "68%", label: t("sample.completed"), detail: t("sample.completedDetail") },
          { value: "12", label: t("sample.openTasks"), detail: t("sample.openTasksDetail") },
          { value: "4", label: t("sample.risks"), detail: t("sample.risksDetail") }
        ];
      } else if (preset === "beforeAfter") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.metricsBeforeAfterTitle");
        slide.metrics = [
          { value: "-42%", label: t("sample.timeCost"), detail: t("sample.timeCostDetail") },
          { value: "+31%", label: t("sample.quality"), detail: t("sample.qualityDetail") },
          { value: "2.4x", label: t("sample.output"), detail: t("sample.outputDetail") }
        ];
      } else {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.metricsTitle");
        slide.metrics = [
          { value: "3x", label: t("sample.speed"), detail: t("sample.speedDetail") },
          { value: "42%", label: t("sample.growth"), detail: t("sample.growthDetail") },
          { value: "1 file", label: "PPT.html", detail: t("sample.fileDetail") }
        ];
      }
      return;
    }
    if (type === "timeline") {
      slide.layout = "timeline";
      if (preset === "process") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.timelineProcessTitle");
        slide.items = [
          { title: t("sample.process1"), text: t("sample.process1Text") },
          { title: t("sample.process2"), text: t("sample.process2Text") },
          { title: t("sample.process3"), text: t("sample.process3Text") },
          { title: t("sample.process4"), text: t("sample.process4Text") }
        ];
      } else if (preset === "milestones") {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.timelineMilestonesTitle");
        slide.items = [
          { title: t("sample.milestone1"), text: t("sample.milestone1Text") },
          { title: t("sample.milestone2"), text: t("sample.milestone2Text") },
          { title: t("sample.milestone3"), text: t("sample.milestone3Text") }
        ];
      } else {
        if (shouldUseSampleTitle(slide)) slide.title = t("sample.timelineTitle");
        slide.items = [
          { title: t("sample.step1"), text: t("sample.step1Text") },
          { title: t("sample.step2"), text: t("sample.step2Text") },
          { title: t("sample.step3"), text: t("sample.step3Text") }
        ];
      }
      return;
    }
    if (type === "quote") {
      slide.layout = "quote";
      if (shouldUseSampleTitle(slide)) slide.title = t("insert.quote");
      slide.quote = slide.quote || t("sample.quoteText");
      slide.author = slide.author || t("sample.quoteAuthor");
      return;
    }
    if (type === "code") {
      slide.layout = "code";
      if (shouldUseSampleTitle(slide)) slide.title = t("sample.codeTitle");
      slide.code = slide.code || "const deck = await createPptHtml();\nawait deck.present();";
    }
  }

  function shouldUseSampleTitle(slide) {
    return !slide.title || slide.title === t("slide.untitled") || slide.title === "Untitled";
  }

  function addTextBoxToSlide(slide, point, variant) {
    slide.textBoxes = Array.isArray(slide.textBoxes) ? slide.textBoxes : [];
    var index = slide.textBoxes.length;
    var preset = textBoxPreset(variant);
    var width = preset.w;
    var height = preset.h;
    var x = point && isFinite(point.x) ? point.x - width / 2 : preset.x + (index % 3) * 28;
    var y = point && isFinite(point.y) ? point.y - height / 2 : preset.y + (index % 4) * 30;
    x = clamp(x, 40, PPTHtml.baseWidth - width - 40);
    y = clamp(y, 40, PPTHtml.baseHeight - height - 40);
    slide.textBoxes.push({
      id: PPTHtml.uid("textbox"),
      text: preset.text,
      x: Math.round(x),
      y: Math.round(y),
      w: width,
      h: height
    });
    var path = "textBoxes." + index + ".text";
    applyPathStyle(slide, path, preset.style);
    return path;
  }

  function textBoxPreset(variant) {
    var kind = ["title", "subtitle", "body", "bullet", "label", "box"].indexOf(variant) !== -1 ? variant : "box";
    var presets = {
      title: {
        text: t("sample.textTitleBox"),
        x: 160,
        y: 140,
        w: 820,
        h: 120,
        style: { fontSize: 68, fontWeight: "800", fontFamily: "display", color: "#111827" }
      },
      subtitle: {
        text: t("sample.textSubtitleBox"),
        x: 180,
        y: 280,
        w: 760,
        h: 92,
        style: { fontSize: 34, fontWeight: "500", fontFamily: "system", color: "#475569" }
      },
      body: {
        text: t("sample.textBodyBox"),
        x: 220,
        y: 340,
        w: 680,
        h: 150,
        style: { fontSize: 28, fontWeight: "400", fontFamily: "system", color: "#1f2937" }
      },
      bullet: {
        text: t("sample.textBulletBox"),
        x: 230,
        y: 330,
        w: 660,
        h: 170,
        style: { fontSize: 28, fontWeight: "500", fontFamily: "system", color: "#111827" }
      },
      label: {
        text: t("sample.textLabelBox"),
        x: 190,
        y: 150,
        w: 300,
        h: 54,
        style: { fontSize: 20, fontWeight: "800", fontFamily: "system", color: "#0f766e", backgroundColor: "#ccfbf1", borderRadius: 18, textAlign: "center" }
      },
      box: {
        text: t("sample.textBox"),
        x: 730,
        y: 430,
        w: 380,
        h: 96,
        style: { fontSize: 28, fontFamily: "system", color: "#111827" }
      }
    };
    return presets[kind];
  }

  function insertLabel(type, variant) {
    return t(componentLabelKey(type, variant)) || t("insert." + type) || type;
  }

  function componentLabelKey(type, variant) {
    return variant ? "insert." + type + "." + variant : "insert." + type;
  }

  function encodeComponentPayload(type, variant) {
    return JSON.stringify({ type: type || "", variant: variant || "" });
  }

  function decodeComponentPayload(raw) {
    var value = String(raw || "").trim();
    if (!value) return null;
    if (value[0] === "{") {
      try {
        var parsed = JSON.parse(value);
        return { type: parsed.type || "", variant: parsed.variant || "" };
      } catch (error) {
        return null;
      }
    }
    var parts = value.split(":");
    return { type: parts[0] || "", variant: parts[1] || "" };
  }

  function handleGlobalKeydown(event) {
    var key = event.key;
    var lowerKey = key.toLowerCase();
    var commandKey = event.metaKey || event.ctrlKey;

    if (key === "Escape") {
      hideCanvasContextMenu();
      hideSlideContextMenu();
    }

    if (event.target && event.target.closest && event.target.closest("dialog")) return;

    if (!presenting && isTextEditingTarget(event.target) && key === "F5") {
      event.preventDefault();
      return;
    }

    if (key === "F5") {
      event.preventDefault();
      commitActiveCanvasEdit();
      openPresenter(event.shiftKey ? (presenting ? presentIndex : currentIndex) : 0);
      return;
    }

    if (commandKey && key === "Enter") {
      event.preventDefault();
      commitActiveCanvasEdit();
      openPresenter(currentIndex);
      return;
    }

    if (!isTextEditingTarget(event.target) && (key === "?" || (commandKey && key === "/"))) {
      event.preventDefault();
      showShortcutDialog();
      return;
    }

    if (!presenting && handleCanvasZoomShortcut(event, commandKey, lowerKey)) return;

    if (commandKey && lowerKey === "s") {
      event.preventDefault();
      commitActiveCanvasEdit();
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

    if (presenting) {
      showPresenterChrome();
      if (handlePresenterShortcut(event)) return;
    }
    if (isTextEditingTarget(event.target)) return;
    if (handleCanvasPanShortcut(event)) return;
    if (handleCanvasClipboardShortcut(event, commandKey, lowerKey)) return;
    if (handleCanvasShortcut(event)) return;
    if (handleSlideShortcut(event, commandKey, lowerKey)) return;

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

  function handleGlobalKeyup(event) {
    if (event.key === " " && canvasSpacePanning) {
      event.preventDefault();
      canvasSpacePanning = false;
      if (els.stageViewport) els.stageViewport.classList.remove("is-pan-ready");
    }
  }

  function handleCanvasZoomShortcut(event, commandKey, lowerKey) {
    if (!commandKey || activeCanvasEdit || activeCanvasDrag || activeCanvasResize) return false;
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      stepCanvasZoom(1);
      return true;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      stepCanvasZoom(-1);
      return true;
    }
    if (lowerKey === "0") {
      event.preventDefault();
      fitCanvasToViewport();
      return true;
    }
    if (lowerKey === "1") {
      event.preventDefault();
      setCanvasZoom(1, { mode: "manual" });
      return true;
    }
    return false;
  }

  function handleCanvasPanShortcut(event) {
    if (presenting || activeCanvasEdit || activeCanvasDrag || activeCanvasResize) return false;
    if (event.key !== " ") return false;
    if (event.target && event.target.closest && event.target.closest("button, [role='button'], input, textarea, select, dialog")) return false;
    if (event.type === "keydown") {
      if (canvasSpacePanning) return true;
      event.preventDefault();
      canvasSpacePanning = true;
      els.stageViewport.classList.add("is-pan-ready");
      return true;
    }
    if (event.type === "keyup") {
      canvasSpacePanning = false;
      els.stageViewport.classList.remove("is-pan-ready");
      return true;
    }
    return false;
  }

  function handleSlideShortcut(event, commandKey, lowerKey) {
    if (!isSlideShortcutTarget(event.target)) return false;
    if (presenting || activeCanvasEdit || activeCanvasDrag || activeCanvasResize) return false;
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSlideAt(currentIndex, { focusThumb: true });
      return true;
    }
    if (commandKey && lowerKey === "d") {
      event.preventDefault();
      duplicateSlideAt(currentIndex, { focusThumb: true });
      return true;
    }
    if (commandKey && lowerKey === "m") {
      event.preventDefault();
      addSlideAfter(currentIndex, { focusThumb: true });
      return true;
    }
    if (commandKey && lowerKey === "c") {
      event.preventDefault();
      copySlideAt(currentIndex);
      return true;
    }
    if (commandKey && lowerKey === "v") {
      if (!slideClipboard) return false;
      event.preventDefault();
      pasteSlideAfter(currentIndex, { focusThumb: true });
      return true;
    }
    if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      moveSlideRelative(currentIndex, event.key === "ArrowUp" ? -1 : 1, { focusThumb: true });
      return true;
    }
    return false;
  }

  function isSlideShortcutTarget(target) {
    return Boolean(target && target.closest && target.closest(".slide-rail"));
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
    if (/^\d$/.test(key)) {
      event.preventDefault();
      appendPresenterJumpDigit(key);
      return true;
    }
    if (presenterJumpBuffer && key === "Backspace") {
      event.preventDefault();
      presenterJumpBuffer = presenterJumpBuffer.slice(0, -1);
      return true;
    }
    if (presenterJumpBuffer && key === "Enter") {
      event.preventDefault();
      return jumpPresenterFromBuffer();
    }
    if (key === "b" || key === "B" || key === ".") {
      event.preventDefault();
      setPresenterBlankMode("black");
      return true;
    }
    if (key === "w" || key === "W" || key === ",") {
      event.preventDefault();
      setPresenterBlankMode("white");
      return true;
    }
    if (key === "f" || key === "F") {
      event.preventDefault();
      togglePresenterFullscreen();
      return true;
    }
    if (key === "m" || key === "M") {
      event.preventDefault();
      togglePresenterScaleMode();
      return true;
    }
    if (key === "?" || key === "h" || key === "H") {
      event.preventDefault();
      showShortcutDialog();
      return true;
    }
    if (nextKeys.indexOf(key) !== -1) {
      event.preventDefault();
      clearPresenterJumpBuffer();
      showPresentationSlide(presentIndex + 1);
      return true;
    }
    if (previousKeys.indexOf(key) !== -1) {
      event.preventDefault();
      clearPresenterJumpBuffer();
      showPresentationSlide(presentIndex - 1);
      return true;
    }
    if (key === "Home") {
      event.preventDefault();
      clearPresenterJumpBuffer();
      showPresentationSlide(0);
      return true;
    }
    if (key === "End") {
      event.preventDefault();
      clearPresenterJumpBuffer();
      showPresentationSlide(deck.slides.length - 1);
      return true;
    }

    return false;
  }

  function isTextEditingTarget(target) {
    return target && (/INPUT|TEXTAREA|SELECT/.test(target.tagName)
      || target.isContentEditable
      || Boolean(target.closest && target.closest("[contenteditable='true']")));
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
      updateButtons();
      updateFileStatus();
      schedulePersist();
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
      scheduleLiveRender({
        canvas: input !== els.notesInput,
        slideList: input === els.titleInput
      });
      schedulePersist();
    });
  }

  function bindStyleInput(input, prop, options) {
    input.addEventListener("focus", captureEditStart);
    input.addEventListener("input", function () {
      if (syncing || input.tagName === "SELECT") return;
      updateSelectedStyleLive(prop, input.value, options || {});
    });
    input.addEventListener("change", function () {
      if (syncing) return;
      updateSelectedStyleCommit(prop, input.value, options || {});
    });
  }

  function bindObjectGeometryInput(input, prop, options) {
    input.addEventListener("focus", captureEditStart);
    input.addEventListener("change", function () {
      if (syncing) return;
      var value = normalizeObjectNumberInput(input.value, options || {});
      if (value == null) {
        syncObjectPanel();
        return;
      }
      commitSelectedObjectMutation(function (object) {
        if (prop === "x" || prop === "y" || prop === "w" || prop === "h") {
          var next = clampObjectGeometry({
            x: prop === "x" ? value : object.x,
            y: prop === "y" ? value : object.y,
            w: prop === "w" ? value : object.w,
            h: prop === "h" ? value : object.h
          });
          object.x = Math.round(next.x);
          object.y = Math.round(next.y);
          object.w = Math.round(next.w);
          object.h = Math.round(next.h);
          return;
        }
        object[prop] = prop === "zIndex" ? Math.round(value) : value;
      });
    });
  }

  function bindObjectDataInput(input, mutator, options) {
    input.addEventListener("focus", captureEditStart);
    input.addEventListener("change", function () {
      if (syncing) return;
      commitSelectedObjectMutation(function (object) {
        mutator(object, input.value);
        if ((options && options.fitTable) || object.type === "table") {
          fitTableObjectToData(object, { growOnly: true });
        }
      });
    });
  }

  function ensureObjectData(object) {
    object.data = object.data && typeof object.data === "object" && !Array.isArray(object.data) ? object.data : {};
    return object.data;
  }

  function normalizeObjectNumberInput(rawValue, options) {
    if (rawValue === "") return null;
    var value = Number(rawValue);
    if (!isFinite(value)) return null;
    if (options.min != null || options.max != null) {
      value = clamp(value, options.min != null ? options.min : value, options.max != null ? options.max : value);
    }
    return Math.round(value * 100) / 100;
  }

  function bindStyleButton(button, prop, activeValue) {
    button.addEventListener("click", function () {
      if (!selectedCanvasPath) return;
      commitStyleMutation(function (style) {
        if (String(style[prop] || "") === String(activeValue)) delete style[prop];
        else style[prop] = activeValue;
      });
    });
  }

  function bindStyleReset(button, prop) {
    button.addEventListener("click", function () {
      if (!selectedCanvasPath) return;
      commitStyleMutation(function (style) {
        delete style[prop];
      });
    });
  }

  function updateSelectedStyleLive(prop, rawValue, options) {
    if (!selectedCanvasPath) return;
    pushLiveHistory();
    setSelectedStyleProperty(prop, rawValue, options || {});
    markDirty();
    applySelectedStyleLive();
    updateButtons();
    updateFileStatus();
    schedulePersist();
  }

  function updateSelectedStyleCommit(prop, rawValue, options) {
    if (!selectedCanvasPath) return;
    var before = JSON.stringify(deck);
    setSelectedStyleProperty(prop, rawValue, options || {});
    if (!activeEditPushed && before !== JSON.stringify(deck)) pushLiveHistory(before);
    deck = PPTHtml.normalizeDeck(deck);
    activeEditSnapshot = "";
    activeEditPushed = false;
    if (before !== JSON.stringify(deck)) markDirty();
    renderCanvas();
    syncInspector();
    updateButtons();
    updateFileStatus();
    persist();
  }

  function commitStyleMutation(mutator) {
    if (!selectedCanvasPath) return;
    var before = JSON.stringify(deck);
    var style = ensureStyleOverride(selectedCanvasPath);
    mutator(style);
    cleanupStyleOverride(selectedCanvasPath);
    if (before === JSON.stringify(deck)) {
      syncStylePanel();
      return;
    }
    history.push(before);
    if (history.length > 80) history.shift();
    future = [];
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderCanvas();
    syncInspector();
    updateButtons();
    updateFileStatus();
    persist();
  }

  function resetSelectedStyle() {
    if (!selectedCanvasPath) return;
    var slide = currentSlide();
    if (!slide.styles || !slide.styles[selectedCanvasPath]) return;
    var before = JSON.stringify(deck);
    delete slide.styles[selectedCanvasPath];
    if (!Object.keys(slide.styles).length) delete slide.styles;
    history.push(before);
    if (history.length > 80) history.shift();
    future = [];
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderCanvas();
    syncInspector();
    updateButtons();
    updateFileStatus();
    persist();
  }

  function setSelectedStyleProperty(prop, rawValue, options) {
    var value = normalizeStyleInputValue(prop, rawValue, options || {});
    var style = ensureStyleOverride(selectedCanvasPath);
    if (value == null || value === "") delete style[prop];
    else style[prop] = value;
    cleanupStyleOverride(selectedCanvasPath);
  }

  function normalizeStyleInputValue(prop, rawValue, options) {
    if (prop === "fontFamily") return normalizeFontFamilyToken(rawValue);
    if (prop === "textAlign") return ["left", "center", "right", "justify"].indexOf(rawValue) !== -1 ? rawValue : "";
    if (options.number) {
      if (rawValue === "") return null;
      var number = Number(rawValue);
      if (!isFinite(number)) return null;
      return Math.round(clamp(number, options.min, options.max) * 100) / 100;
    }
    return normalizeStyleColor(rawValue);
  }

  function normalizeFontFamilyToken(value) {
    return [
      "system", "display", "arial", "helvetica", "aptos", "calibri", "verdana", "tahoma", "avenir",
      "serif", "georgia", "times", "cambria",
      "cjk-sans", "pingfang", "yahei", "dengxian", "simhei", "stheiti", "hiragino-sans", "noto-sans-cjk",
      "cjk-serif", "songti", "simsun", "fangsong", "kaiti", "yu-mincho", "noto-serif-cjk",
      "yu-gothic", "meiryo", "malgun",
      "mono", "menlo", "consolas", "courier", "handwriting"
    ].indexOf(value) !== -1 ? value : "";
  }

  function fontFamilyStack(token) {
    var stacks = {
      system: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
      display: "\"Avenir Next\", \"SF Pro Display\", Inter, ui-sans-serif, system-ui, sans-serif",
      arial: "Arial, Helvetica, ui-sans-serif, sans-serif",
      helvetica: "\"Helvetica Neue\", Helvetica, Arial, ui-sans-serif, sans-serif",
      aptos: "Aptos, Calibri, \"Segoe UI\", Arial, ui-sans-serif, sans-serif",
      calibri: "Calibri, Aptos, \"Segoe UI\", Arial, ui-sans-serif, sans-serif",
      verdana: "Verdana, Geneva, Tahoma, Arial, ui-sans-serif, sans-serif",
      tahoma: "Tahoma, Verdana, \"Segoe UI\", Arial, ui-sans-serif, sans-serif",
      avenir: "\"Avenir Next\", Avenir, \"SF Pro Display\", Inter, ui-sans-serif, sans-serif",
      serif: "Georgia, \"Times New Roman\", \"Songti SC\", \"Noto Serif CJK SC\", serif",
      georgia: "Georgia, \"Times New Roman\", \"Songti SC\", \"Noto Serif CJK SC\", serif",
      times: "\"Times New Roman\", Times, \"Songti SC\", \"Noto Serif CJK SC\", serif",
      cambria: "Cambria, Georgia, \"Times New Roman\", \"Songti SC\", \"Noto Serif CJK SC\", serif",
      "cjk-sans": "\"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Microsoft JhengHei\", DengXian, SimHei, \"Noto Sans CJK SC\", sans-serif",
      pingfang: "\"PingFang SC\", \"Hiragino Sans\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Noto Sans CJK SC\", sans-serif",
      yahei: "\"Microsoft YaHei\", \"Microsoft JhengHei\", DengXian, \"PingFang SC\", \"Noto Sans CJK SC\", sans-serif",
      dengxian: "DengXian, \"Microsoft YaHei\", \"PingFang SC\", \"Noto Sans CJK SC\", sans-serif",
      simhei: "SimHei, \"Microsoft YaHei\", \"PingFang SC\", \"Noto Sans CJK SC\", sans-serif",
      stheiti: "\"STHeiti\", \"Heiti SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif",
      "hiragino-sans": "\"Hiragino Sans\", \"Hiragino Kaku Gothic ProN\", \"Yu Gothic\", \"Meiryo\", sans-serif",
      "noto-sans-cjk": "\"Noto Sans CJK SC\", \"Noto Sans CJK JP\", \"Noto Sans CJK KR\", \"Source Han Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif",
      "cjk-serif": "\"Songti SC\", SimSun, FangSong, \"Noto Serif CJK SC\", \"Yu Mincho\", serif",
      songti: "\"Songti SC\", SimSun, \"Noto Serif CJK SC\", serif",
      simsun: "SimSun, \"Songti SC\", \"Noto Serif CJK SC\", serif",
      fangsong: "FangSong, STFangsong, \"Songti SC\", \"Noto Serif CJK SC\", serif",
      kaiti: "\"Kaiti SC\", KaiTi, \"STKaiti\", \"Yu Kyokasho\", cursive",
      "yu-mincho": "\"Yu Mincho\", \"Hiragino Mincho ProN\", \"Songti SC\", \"Noto Serif CJK SC\", serif",
      "noto-serif-cjk": "\"Noto Serif CJK SC\", \"Noto Serif CJK JP\", \"Noto Serif CJK KR\", \"Source Han Serif SC\", \"Songti SC\", SimSun, serif",
      "yu-gothic": "\"Yu Gothic\", \"Yu Gothic UI\", \"Hiragino Sans\", Meiryo, sans-serif",
      meiryo: "Meiryo, \"Yu Gothic\", \"Hiragino Sans\", sans-serif",
      malgun: "\"Malgun Gothic\", \"Apple SD Gothic Neo\", \"Noto Sans CJK KR\", sans-serif",
      mono: "\"SFMono-Regular\", Consolas, \"Liberation Mono\", Menlo, monospace",
      menlo: "Menlo, \"SFMono-Regular\", Consolas, \"Liberation Mono\", monospace",
      consolas: "Consolas, \"SFMono-Regular\", Menlo, \"Liberation Mono\", monospace",
      courier: "\"Courier New\", Courier, Consolas, Menlo, monospace",
      handwriting: "\"Comic Sans MS\", \"Segoe Print\", \"Kaiti SC\", cursive"
    };
    return stacks[token] || "";
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

  function scheduleLiveRender(options) {
    var settings = options || {};
    pendingLiveCanvas = pendingLiveCanvas || Boolean(settings.canvas);
    pendingLiveSlideList = pendingLiveSlideList || Boolean(settings.slideList);
    if (liveRenderFrame) return;
    liveRenderFrame = window.requestAnimationFrame(function () {
      liveRenderFrame = 0;
      if (pendingLiveCanvas) renderCanvas();
      if (pendingLiveSlideList) renderSlideList();
      pendingLiveCanvas = false;
      pendingLiveSlideList = false;
      updateButtons();
      updateFileStatus();
    });
  }

  function cancelLiveRender() {
    if (liveRenderFrame) {
      window.cancelAnimationFrame(liveRenderFrame);
      liveRenderFrame = 0;
    }
    pendingLiveCanvas = false;
    pendingLiveSlideList = false;
  }

  function schedulePersist() {
    window.clearTimeout(persistTimer);
    persistTimer = window.setTimeout(function () {
      persistTimer = 0;
      persist();
    }, 220);
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
    clearCanvasSelection();
    markDirty();
    renderAll();
    persist();
  }

  function redo() {
    if (!future.length) return;
    history.push(JSON.stringify(deck));
    deck = PPTHtml.normalizeDeck(JSON.parse(future.pop()));
    currentIndex = clamp(currentIndex, 0, deck.slides.length - 1);
    clearCanvasSelection();
    markDirty();
    renderAll();
    persist();
  }

  function renderAll() {
    cancelLiveRender();
    renderSlideList();
    renderCanvas();
    syncInspector();
    updateButtons();
    updateFileStatus();
    refreshTooltips();
  }

  function renderSlideList() {
    els.slideList.innerHTML = "";
    deck.slides.forEach(function (slide, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "slide-thumb" + (index === currentIndex ? " active" : "");
      button.draggable = true;
      button.dataset.slideIndex = String(index);
      button.setAttribute("aria-current", index === currentIndex ? "true" : "false");

      var number = document.createElement("span");
      number.className = "slide-thumb-number";
      number.textContent = String(index + 1);
      button.appendChild(number);

      var preview = createSlideThumbPreview(slide, index);
      button.appendChild(preview);

      var meta = document.createElement("div");
      meta.className = "slide-thumb-meta";
      var title = document.createElement("strong");
      title.textContent = slide.title || t("slide.untitled");
      var layout = document.createElement("small");
      layout.textContent = layoutLabel(slide.layout);
      meta.appendChild(title);
      meta.appendChild(layout);
      button.appendChild(meta);

      setTooltip(button, formatText(t("tooltip.slideThumb"), {
        number: index + 1,
        title: slide.title || t("slide.untitled"),
        layout: layoutLabel(slide.layout)
      }));
      button.addEventListener("click", function () {
        selectSlide(index, { focusThumb: true });
      });
      button.addEventListener("keydown", function (event) {
        if (handleSlideThumbKeydown(event, index)) return;
      });
      button.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        event.stopPropagation();
        selectSlide(index, { focusThumb: true });
        showSlideContextMenu(event.clientX, event.clientY, index);
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
      fitSlideThumbPreview(preview, preview.querySelector(".slide-thumb-frame"));
    });
  }

  function createSlideThumbPreview(slide, index) {
    var preview = document.createElement("div");
    preview.className = "slide-thumb-preview";
    preview.setAttribute("aria-hidden", "true");
    var frame = document.createElement("div");
    frame.className = "slide-thumb-frame";
    var thumbDeck = {
      version: deck.version,
      title: deck.title,
      theme: deck.theme,
      transition: deck.transition,
      slides: [slide]
    };
    var slideNode = PPTHtml.renderSlide(slide, thumbDeck, { index: index, thumbnail: true });
    slideNode.classList.add("is-slide-thumbnail");
    slideNode.setAttribute("data-thumbnail", "true");
    slideNode.removeAttribute("data-ppt-path");
    prepareSlideThumbnailMedia(slideNode);
    frame.appendChild(slideNode);
    preview.appendChild(frame);
    window.requestAnimationFrame(function () {
      fitSlideThumbPreview(preview, frame);
    });
    return preview;
  }

  function fitSlideThumbPreview(preview, frame) {
    if (!preview || !frame) return;
    var width = Math.max(1, preview.clientWidth);
    frame.style.setProperty("--thumb-scale", String(width / PPTHtml.baseWidth));
  }

  function fitSlideThumbPreviews() {
    if (!els.slideList) return;
    els.slideList.querySelectorAll(".slide-thumb-preview").forEach(function (preview) {
      fitSlideThumbPreview(preview, preview.querySelector(".slide-thumb-frame"));
    });
  }

  function prepareSlideThumbnailMedia(slideNode) {
    slideNode.querySelectorAll("img").forEach(function (image) {
      image.loading = "lazy";
      image.decoding = "async";
      image.draggable = false;
    });
    slideNode.querySelectorAll("video, audio").forEach(function (media) {
      media.autoplay = false;
      media.controls = false;
      media.muted = true;
      media.preload = "none";
      media.removeAttribute("controls");
      media.setAttribute("tabindex", "-1");
      if (typeof media.pause === "function") media.pause();
    });
  }

  function updateSlideListSelection() {
    if (!els.slideList) return;
    els.slideList.querySelectorAll(".slide-thumb").forEach(function (thumb) {
      var index = Number(thumb.dataset.slideIndex);
      var active = index === currentIndex;
      thumb.classList.toggle("active", active);
      thumb.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function selectSlide(index, options) {
    var nextIndex = clamp(Number(index) || 0, 0, deck.slides.length - 1);
    if (nextIndex === currentIndex) {
      if (options && options.focusThumb) focusCurrentSlideThumb();
      return;
    }
    clearCanvasSelection();
    currentIndex = nextIndex;
    updateSlideListSelection();
    renderCanvas();
    syncInspector();
    updateButtons();
    updateFileStatus();
    refreshTooltips();
    if (options && options.focusThumb) focusCurrentSlideThumb();
  }

  function focusCurrentSlideThumb() {
    var thumb = els.slideList && els.slideList.querySelector("[data-slide-index=\"" + currentIndex + "\"]");
    if (thumb && document.contains(thumb)) thumb.focus();
    window.setTimeout(function () {
      var nextThumb = els.slideList && els.slideList.querySelector("[data-slide-index=\"" + currentIndex + "\"]");
      if (nextThumb && document.contains(nextThumb)) nextThumb.focus();
    }, 0);
  }

  function handleSlideThumbKeydown(event, index) {
    var key = event.key;
    var nextIndex = index;
    if (key === "ArrowUp" || key === "ArrowLeft" || key === "PageUp") nextIndex = Math.max(0, index - 1);
    else if (key === "ArrowDown" || key === "ArrowRight" || key === "PageDown") nextIndex = Math.min(deck.slides.length - 1, index + 1);
    else if (key === "Home") nextIndex = 0;
    else if (key === "End") nextIndex = deck.slides.length - 1;
    else if (key === "Delete" || key === "Backspace") {
      event.preventDefault();
      event.stopPropagation();
      if (index !== currentIndex) currentIndex = index;
      deleteSlideAt(index, { focusThumb: true });
      return true;
    } else {
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    selectSlide(nextIndex, { focusThumb: true });
    return true;
  }

  function addSlideAfter(index, options) {
    commitActiveCanvasEdit();
    var insertIndex = clamp(Number(index) || 0, 0, deck.slides.length - 1) + 1;
    commit(function () {
      deck.slides.splice(insertIndex, 0, PPTHtml.normalizeSlide({
        id: PPTHtml.uid("slide"),
        layout: "text",
        kicker: "New Slide",
        title: t("sample.newSlideTitle"),
        subtitle: t("sample.newSlideSubtitle")
      }, insertIndex));
      currentIndex = insertIndex;
      clearCanvasSelection();
    });
    if (options && options.focusThumb) focusCurrentSlideThumb();
  }

  function duplicateSlideAt(index, options) {
    commitActiveCanvasEdit();
    var sourceIndex = clamp(Number(index) || 0, 0, deck.slides.length - 1);
    commit(function () {
      var copy = cloneSlideForInsert(deck.slides[sourceIndex]);
      copy.title = [copy.title || t("slide.untitled"), t("slide.copySuffix")].join(" ");
      deck.slides.splice(sourceIndex + 1, 0, copy);
      currentIndex = sourceIndex + 1;
      clearCanvasSelection();
    });
    if (options && options.focusThumb) focusCurrentSlideThumb();
  }

  function copySlideAt(index) {
    var sourceIndex = clamp(Number(index) || 0, 0, deck.slides.length - 1);
    slideClipboard = JSON.parse(JSON.stringify(deck.slides[sourceIndex]));
    toast(t("context.copy"));
    updateSlideContextMenuState();
    return true;
  }

  function pasteSlideAfter(index, options) {
    if (!slideClipboard) return false;
    commitActiveCanvasEdit();
    var targetIndex = clamp(Number(index) || 0, 0, deck.slides.length - 1);
    commit(function () {
      var copy = cloneSlideForInsert(slideClipboard);
      copy.title = [copy.title || t("slide.untitled"), t("slide.copySuffix")].join(" ");
      deck.slides.splice(targetIndex + 1, 0, copy);
      currentIndex = targetIndex + 1;
      clearCanvasSelection();
    });
    if (options && options.focusThumb) focusCurrentSlideThumb();
    return true;
  }

  function cloneSlideForInsert(slide) {
    var copy = JSON.parse(JSON.stringify(slide || {}));
    copy.id = PPTHtml.uid("slide");
    if (Array.isArray(copy.textBoxes)) {
      copy.textBoxes.forEach(function (box) { box.id = PPTHtml.uid("textbox"); });
    }
    if (Array.isArray(copy.objects)) {
      copy.objects.forEach(function (object) { object.id = PPTHtml.uid("object"); });
    }
    return copy;
  }

  function moveSlideRelative(index, delta, options) {
    var fromIndex = clamp(Number(index) || 0, 0, deck.slides.length - 1);
    var toIndex = fromIndex + delta;
    if (toIndex < 0 || toIndex >= deck.slides.length) return false;
    moveSlideByDrag(fromIndex, toIndex);
    if (options && options.focusThumb) focusCurrentSlideThumb();
    return true;
  }

  function deleteSlideAt(index, options) {
    var settings = options || {};
    if (deck.slides.length <= 1) {
      alert(t("confirm.keepOneSlide"));
      return false;
    }
    var targetIndex = clamp(Number(index) || 0, 0, deck.slides.length - 1);
    if (settings.confirm && !confirm(t("confirm.deleteSlide"))) return false;
    commitActiveCanvasEdit();
    commit(function () {
      deck.slides.splice(targetIndex, 1);
      if (currentIndex > targetIndex) currentIndex -= 1;
      else if (currentIndex >= deck.slides.length) currentIndex = deck.slides.length - 1;
      currentIndex = clamp(currentIndex, 0, deck.slides.length - 1);
      clearCanvasSelection();
    });
    if (settings.focusThumb) focusCurrentSlideThumb();
    return true;
  }

  function handleCanvasWheel(event) {
    if (presenting || activeCanvasEdit || activeCanvasDrag || activeCanvasResize) return;
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      var delta = event.deltaY < 0 ? 1 : -1;
      var factor = delta > 0 ? 1.08 : 1 / 1.08;
      setCanvasZoom(canvasZoom * factor, {
        mode: "manual",
        clientX: event.clientX,
        clientY: event.clientY
      });
      return;
    }
    if (canvasZoomMode !== "fit") {
      event.preventDefault();
      panCanvasBy(-event.deltaX, -event.deltaY);
    }
  }

  function stepCanvasZoom(direction) {
    setCanvasZoom(canvasZoom * (direction > 0 ? 1.18 : 1 / 1.18), { mode: "manual" });
  }

  function fitCanvasToViewport() {
    canvasZoomMode = "fit";
    canvasPanX = 0;
    canvasPanY = 0;
    fitFrame(els.stageFrame, els.stageViewport);
    renderCanvasControls();
  }

  function setCanvasZoom(nextZoom, options) {
    var settings = options || {};
    var previousZoom = canvasZoom || canvasFitScale || 1;
    nextZoom = clamp(Number(nextZoom) || previousZoom, 0.18, 2.5);
    if (Math.abs(nextZoom - previousZoom) < 0.001 && settings.mode !== "manual") return;

    if (settings.clientX != null && settings.clientY != null && previousZoom) {
      var rect = els.stageViewport.getBoundingClientRect();
      var beforeX = (settings.clientX - rect.left - rect.width / 2 - canvasPanX) / previousZoom;
      var beforeY = (settings.clientY - rect.top - rect.height / 2 - canvasPanY) / previousZoom;
      canvasPanX += beforeX * previousZoom - beforeX * nextZoom;
      canvasPanY += beforeY * previousZoom - beforeY * nextZoom;
    }

    canvasZoomMode = settings.mode || "manual";
    canvasZoom = nextZoom;
    clampCanvasPan();
    applyCanvasFrameTransform();
    renderCanvasControls();
  }

  function panCanvasBy(dx, dy) {
    canvasPanX += Number(dx) || 0;
    canvasPanY += Number(dy) || 0;
    clampCanvasPan();
    applyCanvasFrameTransform();
    renderCanvasControls();
  }

  function clampCanvasPan() {
    if (!els.stageViewport) return;
    var scale = canvasZoom || canvasFitScale || 1;
    var extraX = Math.max(0, PPTHtml.baseWidth * scale - els.stageViewport.clientWidth) / 2 + 160;
    var extraY = Math.max(0, PPTHtml.baseHeight * scale - els.stageViewport.clientHeight) / 2 + 120;
    canvasPanX = clamp(canvasPanX, -extraX, extraX);
    canvasPanY = clamp(canvasPanY, -extraY, extraY);
  }

  function shouldTopAlignCanvas() {
    return canvasZoomMode === "fit"
      && window.matchMedia
      && window.matchMedia("(max-width: 720px)").matches;
  }

  function applyCanvasFrameTransform() {
    if (!els.stageFrame) return;
    var scale = canvasZoom || canvasFitScale || 1;
    var topAligned = shouldTopAlignCanvas();
    els.stageFrame.style.width = PPTHtml.baseWidth + "px";
    els.stageFrame.style.height = PPTHtml.baseHeight + "px";
    els.stageFrame.style.left = "50%";
    els.stageFrame.style.top = topAligned ? "10px" : "50%";
    els.stageFrame.style.transformOrigin = topAligned ? "top center" : "center center";
    var originTransform = topAligned ? "translate(-50%, 0)" : "translate(-50%, -50%)";
    els.stageFrame.style.transform = originTransform + " translate(" + Math.round(canvasPanX) + "px, " + Math.round(canvasPanY) + "px) scale(" + scale + ")";
    updateZoomLabel();
  }

  function updateZoomLabel() {
    if (!els.zoomLabel) return;
    setButtonUnavailable(els.zoomOutBtn, (canvasZoom || 1) <= 0.181);
    setButtonUnavailable(els.zoomInBtn, (canvasZoom || 1) >= 2.49);
    if (canvasZoomMode === "fit") {
      els.zoomLabel.textContent = t("zoom.fitLabel");
      setTooltip(els.zoomFitBtn, formatText(t("zoom.level"), { percent: Math.round((canvasFitScale || 1) * 100) }) + " · " + t("zoom.fit"));
      return;
    }
    els.zoomLabel.textContent = formatText(t("zoom.level"), { percent: Math.round((canvasZoom || 1) * 100) });
    setTooltip(els.zoomFitBtn, t("zoom.fit"));
  }

  function renderCanvas() {
    els.stageFrame.innerHTML = "";
    els.stageFrame.appendChild(PPTHtml.renderSlide(currentSlide(), deck, { index: currentIndex, editable: true }));
    enhanceCanvasEditing();
    els.currentSlideLabel.textContent = formatText(t("slide.current"), { number: currentIndex + 1 });
    els.currentSlideTitle.textContent = currentSlide().title || t("slide.untitled");
    fitFrame(els.stageFrame, els.stageViewport);
    renderCanvasControls();
  }

  function enhanceCanvasEditing() {
    var slide = currentSlide();
    bindCanvasText(".ppt-kicker", "kicker", { singleLine: true });
    bindCanvasText(".ppt-title", "title", { singleLine: true });
    bindCanvasText(".ppt-subtitle", "subtitle");
    bindCanvasText(".ppt-body", "body");
    bindCanvasText(".ppt-media .ppt-caption", "image.caption", { singleLine: true });
    bindCanvasText(".ppt-video .ppt-caption", "video.caption", { singleLine: true });
    bindCanvasText(".ppt-audio .ppt-caption", "audio.caption", { singleLine: true });
    bindCanvasComponent(".ppt-media", "image", { labelKey: "canvas.image", fileAction: "image" });
    bindCanvasComponent(".ppt-video", "video", { labelKey: "canvas.video", fileAction: "video" });
    bindCanvasComponent(".ppt-audio", "audio", { labelKey: "canvas.audio", fileAction: "audio" });
    bindCanvasComponent(".ppt-chart-wrap, .ppt-chart-empty", "chart", { labelKey: "canvas.chart" });
    bindCanvasComponent(".ppt-table", "table", { labelKey: "canvas.table" });
    bindCanvasComponent(".ppt-card-grid", "cards", { labelKey: "canvas.cards" });
    bindCanvasComponent(".ppt-metric-grid", "metrics", { labelKey: "canvas.metrics" });
    bindCanvasComponent(".ppt-timeline", "timeline", { labelKey: "canvas.timeline" });

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
    bindCanvasTextBoxes();
    bindCanvasObjects();
    bindCanvasText(".ppt-code", "code", { multiline: true, preserveWhitespace: true });
    applyCanvasOffsets();
  }

  function editableNodes(selector) {
    return Array.prototype.filter.call(els.stageFrame.querySelectorAll(selector), function (node) {
      return !node.closest(".ppt-object");
    });
  }

  function firstEditableNode(selector) {
    return editableNodes(selector)[0] || null;
  }

  function bindCanvasText(selector, path, options) {
    var node = firstEditableNode(selector);
    if (!node) return;
    registerCanvasEdit(node, path, options);
  }

  function bindCanvasComponent(selector, path, options) {
    var node = firstEditableNode(selector);
    if (!node) return;
    var settings = Object.assign({ draggableOnly: true }, options || {});
    registerCanvasEdit(node, path, settings);
  }

  function bindCanvasListItems() {
    editableNodes(".ppt-list li").forEach(function (node, index) {
      registerCanvasEdit(node, "items." + index + ".text");
    });
  }

  function bindCanvasCompare() {
    ["left", "right"].forEach(function (side, index) {
      var card = editableNodes(".ppt-compare-grid .ppt-compare-card")[index];
      if (!card) return;
      registerCanvasEdit(card.querySelector("h2"), side + ".title", { singleLine: true });
      registerCanvasEdit(card.querySelector("p"), side + ".text");
    });
  }

  function bindCanvasCards() {
    editableNodes(".ppt-card").forEach(function (card, index) {
      registerCanvasEdit(card.querySelector("h2"), "cards." + index + ".title", { singleLine: true });
      registerCanvasEdit(card.querySelector("p"), "cards." + index + ".text");
    });
  }

  function bindCanvasTimeline() {
    editableNodes(".ppt-time-item").forEach(function (item, index) {
      registerCanvasEdit(item.querySelector("h2"), "items." + index + ".title", { singleLine: true });
      registerCanvasEdit(item.querySelector("p"), "items." + index + ".text");
    });
  }

  function bindCanvasMetrics() {
    editableNodes(".ppt-metric").forEach(function (metric, index) {
      registerCanvasEdit(metric.querySelector("strong"), "metrics." + index + ".value", { singleLine: true });
      registerCanvasEdit(metric.querySelector("span"), "metrics." + index + ".label", { singleLine: true });
      registerCanvasEdit(metric.querySelector("p"), "metrics." + index + ".detail");
    });
  }

  function bindCanvasTable() {
    editableNodes(".ppt-table th").forEach(function (cell, index) {
      registerCanvasEdit(cell, "table.columns." + index, { singleLine: true, noDrag: true, labelKey: "canvas.tableCell" });
    });
    editableNodes(".ppt-table tbody tr").forEach(function (row, rowIndex) {
      row.querySelectorAll("td").forEach(function (cell, cellIndex) {
        registerCanvasEdit(cell, "table.rows." + rowIndex + "." + cellIndex, { singleLine: true, noDrag: true, labelKey: "canvas.tableCell" });
      });
    });
  }

  function bindCanvasChartLegend() {
    var slide = currentSlide();
    editableNodes(".ppt-chart-legend-item strong").forEach(function (node, index) {
      var path = slide.chart.kind === "donut" ? "chart.labels." + index : "chart.series." + index + ".name";
      registerCanvasEdit(node, path, { singleLine: true });
    });
    if (slide.chart.kind !== "donut") return;
    editableNodes(".ppt-chart-legend-item small").forEach(function (node, index) {
      registerCanvasEdit(node, "chart.series.0.values." + index, { singleLine: true, numberValue: true });
    });
  }

  function bindCanvasTextBoxes() {
    els.stageFrame.querySelectorAll(".ppt-textbox").forEach(function (node, index) {
      registerCanvasEdit(node, "textBoxes." + index + ".text", { labelKey: "canvas.textBox" });
    });
  }

  function bindCanvasObjects() {
    var labelKeys = {
      image: "canvas.image",
      video: "canvas.video",
      audio: "canvas.audio",
      chart: "canvas.chart",
      table: "canvas.table",
      cards: "canvas.cards",
      metrics: "canvas.metrics",
      timeline: "canvas.timeline",
      quote: "insert.quote",
      code: "insert.code",
      compare: "insert.compare",
      shape: "canvas.shape"
    };
    els.stageFrame.querySelectorAll(".ppt-object").forEach(function (node, index) {
      var type = node.dataset.objectType || objectTypeFromPath("objects." + index);
      var options = {
        draggableOnly: true,
        labelKey: labelKeys[type] || "canvas.object"
      };
      if (type === "image" || type === "video" || type === "audio") options.fileAction = type;
      registerCanvasEdit(node, "objects." + index, options);
      if (type === "table") bindObjectTableCells(node, index);
    });
  }

  function bindObjectTableCells(objectNode, objectIndex) {
    objectNode.querySelectorAll(".ppt-table th").forEach(function (cell, columnIndex) {
      registerCanvasEdit(cell, "objects." + objectIndex + ".data.columns." + columnIndex, {
        singleLine: true,
        noDrag: true,
        labelKey: "canvas.tableCell"
      });
    });
    objectNode.querySelectorAll(".ppt-table tbody tr").forEach(function (row, rowIndex) {
      row.querySelectorAll("td").forEach(function (cell, columnIndex) {
        registerCanvasEdit(cell, "objects." + objectIndex + ".data.rows." + rowIndex + "." + columnIndex, {
          singleLine: true,
          noDrag: true,
          labelKey: "canvas.tableCell"
        });
      });
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
    node.draggable = false;
    node.querySelectorAll("img, video, audio").forEach(function (child) {
      child.draggable = false;
    });
    setTooltip(node, canvasLabel(options || {}, path));
  }

  function handleCanvasPointerDown(event) {
    if (presenting || event.button !== 0) return;
    if (event.target.closest(".canvas-selection-box")) return;
    var target = event.target.closest("[data-canvas-edit]");
    if (!target || !els.stageFrame.contains(target)) return;
    if (activeCanvasEdit) {
      if (target === activeCanvasEdit.node || activeCanvasEdit.node.contains(event.target)) return;
      var nextTargetPath = target.getAttribute("data-canvas-edit");
      finishCanvasEdit(true);
      target = canvasNodeByPath(nextTargetPath);
      if (!target) return;
    }
    var targetOptions = parseCanvasOptions(target);
    selectCanvasTarget(target, { toggle: event.shiftKey });
    if (targetOptions.noDrag) return;
    if (!selectedCanvasPath) return;
    var dragPaths = currentCanvasSelectionPaths();
    var targetPath = target.getAttribute("data-canvas-edit");
    if (dragPaths.indexOf(targetPath) === -1) dragPaths = [targetPath];
    var dragNodes = dragPaths.map(canvasNodeByPath);
    var dragOrigins = dragPaths.map(function (path) { return getCanvasOffset(path); });
    var dragObjectFlags = dragPaths.map(function (path) { return Boolean(getObjectByPath(path)); });
    activeCanvasDrag = {
      node: target,
      path: targetPath,
      paths: dragPaths,
      nodes: dragNodes,
      origins: dragOrigins,
      objectFlags: dragObjectFlags,
      previewOffsets: dragOrigins.map(function (origin) { return Object.assign({}, origin); }),
      before: JSON.stringify(deck),
      startX: event.clientX,
      startY: event.clientY,
      origin: getCanvasOffset(target.getAttribute("data-canvas-edit")),
      startBox: getNodeFrameBounds(target),
      startSelectionBounds: dragPaths.length > 1 ? getSelectionBounds(dragPaths) : null,
      selectionBox: els.stageFrame.querySelector(".canvas-selection-box"),
      isObject: Boolean(getObjectByPath(targetPath)),
      scale: currentFrameScale(),
      pointerId: event.pointerId,
      frame: 0,
      pendingDx: 0,
      pendingDy: 0,
      moved: false
    };
    if (target.setPointerCapture && event.pointerId != null) {
      try {
        target.setPointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture is best-effort; window listeners still keep the drag working.
      }
    }
    window.addEventListener("pointermove", handleCanvasPointerMove);
    window.addEventListener("pointerup", handleCanvasPointerEnd);
    window.addEventListener("pointercancel", handleCanvasPointerEnd);
  }

  function handleCanvasNativeDragStart(event) {
    if (event.target.closest("[data-canvas-edit]")) event.preventDefault();
  }

  function handleCanvasPointerMove(event) {
    if (!activeCanvasDrag) return;
    var drag = activeCanvasDrag;
    var dx = (event.clientX - drag.startX) / drag.scale;
    var dy = (event.clientY - drag.startY) / drag.scale;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    if (!drag.moved) {
      drag.moved = true;
      startCanvasDragPreview(drag);
    }
    event.preventDefault();
    drag.pendingDx = dx;
    drag.pendingDy = dy;
    if (!drag.frame) {
      drag.frame = window.requestAnimationFrame(function () {
        drag.frame = 0;
        applyCanvasDragPreview(drag);
      });
    }
  }

  function applyCanvasDragPreview(drag) {
    if (!drag || !drag.node) return;
    if (drag.paths && drag.paths.length > 1) {
      applyMultiCanvasDragPreview(drag);
      return;
    }
    var nextOffset = {
      x: clamp(drag.origin.x + drag.pendingDx, -420, 420),
      y: clamp(drag.origin.y + drag.pendingDy, -240, 240),
      w: drag.origin.w,
      h: drag.origin.h
    };
    if (drag.isObject) {
      nextOffset = clampObjectGeometry({
        x: drag.origin.x + drag.pendingDx,
        y: drag.origin.y + drag.pendingDy,
        w: drag.origin.w,
        h: drag.origin.h
      });
      drag.previewOffset = nextOffset;
      setObjectDragPreviewStyle(drag.node, drag.origin, nextOffset);
      previewCanvasSelectionBox(drag.selectionBox, nextOffset.x - drag.origin.x, nextOffset.y - drag.origin.y);
      return;
    }
    drag.previewOffset = nextOffset;
    setCanvasOffsetStyle(drag.node, nextOffset);
    previewCanvasSelectionBox(drag.selectionBox, nextOffset.x - drag.origin.x, nextOffset.y - drag.origin.y);
  }

  function setObjectDragPreviewStyle(node, origin, nextOffset) {
    var dx = Math.round((Number(nextOffset.x) || 0) - (Number(origin.x) || 0));
    var dy = Math.round((Number(nextOffset.y) || 0) - (Number(origin.y) || 0));
    node.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0)";
  }

  function applyMultiCanvasDragPreview(drag) {
    var dx = drag.pendingDx;
    var dy = drag.pendingDy;
    drag.paths.forEach(function (path, index) {
      var node = drag.nodes[index];
      var origin = drag.origins[index];
      if (!node || !origin) return;
      var nextOffset = drag.objectFlags[index]
        ? clampObjectGeometry({ x: origin.x + dx, y: origin.y + dy, w: origin.w, h: origin.h })
        : { x: clamp(origin.x + dx, -420, 420), y: clamp(origin.y + dy, -240, 240), w: origin.w, h: origin.h };
      drag.previewOffsets[index] = nextOffset;
      if (drag.objectFlags[index]) setObjectDragPreviewStyle(node, origin, nextOffset);
      else setCanvasOffsetStyle(node, nextOffset);
    });
    var bounds = drag.startSelectionBounds;
    if (bounds) {
      previewCanvasSelectionBox(drag.selectionBox, dx, dy);
    }
  }

  function previewCanvasSelectionBox(box, dx, dy, width, height) {
    if (!box) return;
    box.style.transform = "translate3d(" + Math.round(Number(dx) || 0) + "px, " + Math.round(Number(dy) || 0) + "px, 0)";
    if (width != null) box.style.width = Math.max(8, Number(width) || 8) + "px";
    if (height != null) box.style.height = Math.max(8, Number(height) || 8) + "px";
  }

  function startCanvasDragPreview(drag) {
    els.stageFrame.classList.add("is-canvas-moving");
    (drag.nodes || [drag.node]).forEach(function (node) {
      if (!node) return;
      node.classList.add("is-canvas-dragging");
      node.style.willChange = "transform";
    });
  }

  function finishCanvasDragPreview(drag) {
    (drag.nodes || [drag.node]).forEach(function (node) {
      if (!node) return;
      node.classList.remove("is-canvas-dragging");
      node.style.willChange = "";
    });
    els.stageFrame.classList.remove("is-canvas-moving");
  }

  function flushCanvasDragPreview(drag) {
    if (!drag || !drag.moved) return;
    if (drag.frame) {
      window.cancelAnimationFrame(drag.frame);
      drag.frame = 0;
    }
    applyCanvasDragPreview(drag);
  }

  function handleCanvasPointerEnd(event) {
    if (!activeCanvasDrag) return;
    var drag = activeCanvasDrag;
    flushCanvasDragPreview(drag);
    activeCanvasDrag = null;
    window.removeEventListener("pointermove", handleCanvasPointerMove);
    window.removeEventListener("pointerup", handleCanvasPointerEnd);
    window.removeEventListener("pointercancel", handleCanvasPointerEnd);
    finishCanvasDragPreview(drag);
    if (drag.node.releasePointerCapture && drag.pointerId != null) {
      try {
        drag.node.releasePointerCapture(drag.pointerId);
      } catch (error) {
        // The pointer may already be released by the browser.
      }
    }
    if (!drag.moved) return;
    event.preventDefault();

    if (drag.paths && drag.paths.length > 1) {
      commitMultiCanvasDrag(drag);
      return;
    }

    var offset = drag.previewOffset || parseCanvasOffsetStyle(drag.node);
    if (sameOffset(drag.origin, offset)) {
      setCanvasOffsetStyle(drag.node, drag.origin);
      renderCanvasControls();
      return;
    }
    history.push(drag.before);
    if (history.length > 80) history.shift();
    future = [];
    var foldedTextBox = foldTextBoxGeometry(drag.path, offset);
    if (!foldedTextBox) {
      setCanvasOffset(drag.path, offset);
      setCanvasOffsetStyle(drag.node, getCanvasOffset(drag.path));
    }
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    if (foldedTextBox) renderCanvas();
    else renderCanvasControls();
    updateButtons();
    updateFileStatus();
    schedulePersist();
  }

  function commitMultiCanvasDrag(drag) {
    history.push(drag.before);
    if (history.length > 80) history.shift();
    future = [];
    var dx = drag.pendingDx;
    var dy = drag.pendingDy;
    drag.paths.forEach(function (path, index) {
      var origin = drag.origins[index];
      if (!origin) return;
      var next = drag.previewOffsets[index] || (drag.objectFlags[index]
        ? clampObjectGeometry({ x: origin.x + dx, y: origin.y + dy, w: origin.w, h: origin.h })
        : { x: clamp(origin.x + dx, -420, 420), y: clamp(origin.y + dy, -240, 240), w: origin.w, h: origin.h });
      if (foldTextBoxGeometry(path, drag.objectFlags[index] ? next : { x: dx, y: dy, w: next.w, h: next.h })) return;
      setCanvasOffset(path, next);
    });
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderCanvas();
    updateButtons();
    updateFileStatus();
    schedulePersist();
  }

  function handleCanvasViewportPointerDown(event) {
    if (shouldStartCanvasPan(event)) {
      startCanvasPan(event);
      return;
    }
    if (event.target.closest("[data-canvas-edit]") || event.target.closest(".canvas-selection-box")) return;
    if (!selectedCanvasPath) return;
    clearCanvasSelection();
    renderCanvasControls();
  }

  function shouldStartCanvasPan(event) {
    if (presenting || activeCanvasEdit || activeCanvasDrag || activeCanvasResize) return false;
    if (event.target.closest("button, input, textarea, select, dialog, .canvas-selection-box")) return false;
    return event.button === 1 || (event.button === 0 && canvasSpacePanning);
  }

  function startCanvasPan(event) {
    event.preventDefault();
    event.stopPropagation();
    hideTooltip();
    activeCanvasPan = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: canvasPanX,
      panY: canvasPanY
    };
    els.stageViewport.classList.add("is-panning");
    if (els.stageViewport.setPointerCapture && event.pointerId != null) {
      try {
        els.stageViewport.setPointerCapture(event.pointerId);
      } catch (error) {
        // Window listeners below keep panning available if capture is refused.
      }
    }
    window.addEventListener("pointermove", handleCanvasPanPointerMove);
    window.addEventListener("pointerup", handleCanvasPanPointerEnd);
    window.addEventListener("pointercancel", handleCanvasPanPointerEnd);
  }

  function handleCanvasPanPointerMove(event) {
    if (!activeCanvasPan) return;
    event.preventDefault();
    canvasPanX = activeCanvasPan.panX + event.clientX - activeCanvasPan.startX;
    canvasPanY = activeCanvasPan.panY + event.clientY - activeCanvasPan.startY;
    clampCanvasPan();
    applyCanvasFrameTransform();
    renderCanvasControls();
  }

  function handleCanvasPanPointerEnd(event) {
    if (!activeCanvasPan) return;
    window.removeEventListener("pointermove", handleCanvasPanPointerMove);
    window.removeEventListener("pointerup", handleCanvasPanPointerEnd);
    window.removeEventListener("pointercancel", handleCanvasPanPointerEnd);
    if (els.stageViewport.releasePointerCapture && activeCanvasPan.pointerId != null) {
      try {
        els.stageViewport.releasePointerCapture(activeCanvasPan.pointerId);
      } catch (error) {
        // The pointer may already be released.
      }
    }
    activeCanvasPan = null;
    els.stageViewport.classList.remove("is-panning");
  }

  function selectCanvasTarget(node, options) {
    var path = node.getAttribute("data-canvas-edit");
    if (!path) return;
    var settings = options || {};
    if (settings.toggle) {
      var paths = currentCanvasSelectionPaths();
      var index = paths.indexOf(path);
      if (index === -1) {
        paths.push(path);
        setCanvasSelection(paths, path);
      } else {
        paths.splice(index, 1);
        setCanvasSelection(paths, paths[paths.length - 1] || "");
      }
    } else {
      setCanvasSelection([path], path);
    }
    renderCanvasControls();
  }

  function setCanvasSelection(paths, primaryPath) {
    var unique = [];
    (paths || []).forEach(function (path) {
      if (path && unique.indexOf(path) === -1) unique.push(path);
    });
    selectedCanvasPaths = unique;
    selectedCanvasPath = primaryPath && unique.indexOf(primaryPath) !== -1 ? primaryPath : (unique[unique.length - 1] || "");
  }

  function clearCanvasSelection() {
    selectedCanvasPath = "";
    selectedCanvasPaths = [];
  }

  function currentCanvasSelectionPaths() {
    var paths = selectedCanvasPaths.length ? selectedCanvasPaths.slice() : (selectedCanvasPath ? [selectedCanvasPath] : []);
    if (selectedCanvasPath && paths.indexOf(selectedCanvasPath) === -1) paths.push(selectedCanvasPath);
    var unique = [];
    paths.forEach(function (path) {
      if (path && unique.indexOf(path) === -1 && canvasNodeByPath(path)) unique.push(path);
    });
    selectedCanvasPaths = unique;
    if (!unique.length) selectedCanvasPath = "";
    else if (unique.indexOf(selectedCanvasPath) === -1) selectedCanvasPath = unique[unique.length - 1];
    return unique;
  }

  function canvasNodeByPath(path) {
    if (!path) return null;
    var nodes = els.stageFrame.querySelectorAll("[data-canvas-edit]");
    for (var index = 0; index < nodes.length; index += 1) {
      if (nodes[index].getAttribute("data-canvas-edit") === path) return nodes[index];
    }
    return null;
  }

  function createCanvasDeleteButton() {
    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "canvas-delete-button";
    setTooltip(remove, t("canvas.deleteTitle"));
    remove.textContent = t("canvas.delete");
    remove.addEventListener("pointerdown", function (event) {
      event.stopPropagation();
    });
    remove.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      deleteSelectedCanvasContent();
    });
    return remove;
  }

  function renderCanvasControls() {
    els.stageFrame.querySelectorAll(".canvas-selection-box").forEach(function (box) {
      box.remove();
    });

    var paths = currentCanvasSelectionPaths();
    var node = canvasNodeByPath(selectedCanvasPath);
    if (!node || activeCanvasEdit) {
      if (!node) clearCanvasSelection();
      syncStylePanel();
      return;
    }

    if (paths.length > 1) {
      renderMultiCanvasSelection(paths);
      syncStylePanel();
      return;
    }

    var box = document.createElement("div");
    box.className = "canvas-selection-box";
    box.setAttribute("data-canvas-selection", selectedCanvasPath);
    var selectionOptions = parseCanvasOptions(node);

    var label = document.createElement("span");
    label.className = "canvas-selection-label";
    label.textContent = canvasSelectionLabel(node, selectedCanvasPath);
    box.appendChild(label);

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "canvas-reset-button";
    reset.hidden = Boolean(getObjectByPath(selectedCanvasPath) || selectionOptions.noDrag);
    setTooltip(reset, t("canvas.resetTitle"));
    reset.textContent = t("canvas.reset");
    reset.addEventListener("pointerdown", function (event) {
      event.stopPropagation();
    });
    reset.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      resetSelectedCanvasOffset();
    });
    box.appendChild(reset);
    box.appendChild(createCanvasDeleteButton());

    if (!selectionOptions.noDrag) {
      ["nw", "n", "ne", "e", "se", "s", "sw", "w"].forEach(function (handle) {
        var control = document.createElement("span");
        control.className = "canvas-resize-handle canvas-resize-" + handle;
        control.setAttribute("data-canvas-handle", handle);
        setTooltip(control, t("canvas.resize"));
        control.addEventListener("pointerdown", handleCanvasResizePointerDown);
        box.appendChild(control);
      });
    }

    els.stageFrame.appendChild(box);
    positionCanvasSelectionBox(node, box);
    syncStylePanel();
  }

  function renderMultiCanvasSelection(paths) {
    var bounds = getSelectionBounds(paths);
    if (!bounds) return;
    var box = document.createElement("div");
    box.className = "canvas-selection-box is-multi";
    box.setAttribute("data-canvas-selection", paths.join(","));

    var label = document.createElement("span");
    label.className = "canvas-selection-label";
    label.textContent = formatText(t("selection.multiple"), { count: paths.length });
    box.appendChild(label);
    box.appendChild(createCanvasDeleteButton());

    els.stageFrame.appendChild(box);
    positionCanvasSelectionBoxFromBounds(bounds, box);
  }

  function getSelectionBounds(paths) {
    var bounds = (paths || []).map(function (path) {
      var node = canvasNodeByPath(path);
      return node ? getNodeFrameBounds(node) : null;
    }).filter(Boolean);
    if (!bounds.length) return null;
    var left = Math.min.apply(null, bounds.map(function (box) { return box.x; }));
    var top = Math.min.apply(null, bounds.map(function (box) { return box.y; }));
    var right = Math.max.apply(null, bounds.map(function (box) { return box.x + box.w; }));
    var bottom = Math.max.apply(null, bounds.map(function (box) { return box.y + box.h; }));
    return {
      x: left,
      y: top,
      w: right - left,
      h: bottom - top
    };
  }

  function canvasSelectionLabel(node, path) {
    var options = node ? parseCanvasOptions(node) : {};
    return canvasLabel(options, path);
  }

  function syncStylePanel() {
    if (!els.stylePanel) return;
    var node = canvasNodeByPath(selectedCanvasPath);
    var hasSelection = Boolean(node);
    var previousSyncing = syncing;
    syncing = true;

    els.stylePanel.classList.toggle("is-disabled", !hasSelection);
    els.stylePanel.querySelectorAll("[data-style-control]").forEach(function (control) {
      control.disabled = !hasSelection;
    });

    if (!hasSelection) {
      els.styleTargetLabel.textContent = t("style.noSelection");
      els.styleFontFamilyInput.value = "";
      els.styleFontSizeInput.value = "";
      els.styleAlignInput.value = "";
      els.styleColorInput.value = "#111827";
      els.styleBackgroundInput.value = "#ffffff";
      els.styleBorderColorInput.value = "#d1d5db";
      els.styleBorderWidthInput.value = "";
      els.styleRadiusInput.value = "";
      els.styleOpacityInput.value = "1";
      setStyleToggleState(els.styleBoldBtn, false);
      setStyleToggleState(els.styleItalicBtn, false);
      syncObjectPanel();
      syncing = previousSyncing;
      return;
    }

    var style = currentStyleOverride(selectedCanvasPath);
    var computed = window.getComputedStyle(node);
    els.styleTargetLabel.textContent = formatText(t("style.target"), {
      name: canvasSelectionLabel(node, selectedCanvasPath)
    });
    els.styleFontFamilyInput.value = style.fontFamily || "";
    els.styleFontSizeInput.value = style.fontSize != null ? style.fontSize : "";
    els.styleAlignInput.value = style.textAlign || "";
    els.styleColorInput.value = colorInputValue(style.color, computed.color, "#111827");
    els.styleBackgroundInput.value = colorInputValue(style.backgroundColor, computed.backgroundColor, "#ffffff");
    els.styleBorderColorInput.value = colorInputValue(style.borderColor, computed.borderColor, "#d1d5db");
    els.styleBorderWidthInput.value = style.borderWidth != null ? style.borderWidth : "";
    els.styleRadiusInput.value = style.borderRadius != null ? style.borderRadius : "";
    els.styleOpacityInput.value = style.opacity != null ? style.opacity : "1";
    setStyleToggleState(els.styleBoldBtn, String(style.fontWeight || "") === "800");
    setStyleToggleState(els.styleItalicBtn, style.fontStyle === "italic");
    syncObjectPanel();
    syncing = previousSyncing;
  }

  function syncObjectPanel() {
    if (!els.objectPanel) return;
    var info = selectedObjectInfo();
    var object = info && info.object;
    var hasObject = Boolean(object && !activeCanvasEdit);
    var tableInfo = selectedCanvasPath ? selectedExplicitTableInfo() : null;
    var hasTableContext = Boolean(tableInfo && tableInfo.kind === "object" && !activeCanvasEdit);
    els.objectPanel.classList.toggle("is-disabled", !hasObject && !hasTableContext);
    els.objectPanel.querySelectorAll("[data-object-control]").forEach(function (control) {
      control.disabled = !hasObject;
    });
    if (els.objectTableTools) {
      var showTableTools = hasTableContext;
      els.objectTableTools.hidden = !showTableTools;
      els.objectTableTools.querySelectorAll("button").forEach(function (control) {
        control.disabled = !showTableTools;
      });
    }
    updateObjectCommandControlState();

    if (!hasObject) {
      els.objectTargetLabel.textContent = hasTableContext ? tableContextLabel(tableInfo) : t("object.noSelection");
      els.objectXInput.value = "";
      els.objectYInput.value = "";
      els.objectWInput.value = "";
      els.objectHInput.value = "";
      els.objectRotationInput.value = "";
      els.objectZInput.value = "";
      els.objectDataInput.value = "";
      syncTypedObjectPanel(null);
      return;
    }

    var node = canvasNodeByPath(selectedCanvasPath);
    var paths = currentCanvasSelectionPaths();
    els.objectTargetLabel.textContent = paths.length > 1
      ? formatText(t("selection.multiple"), { count: paths.length })
      : formatText(t("object.target"), {
        name: canvasSelectionLabel(node, selectedCanvasPath),
        id: object.id || "-"
      });
    els.objectXInput.value = Math.round(Number(object.x) || 0);
    els.objectYInput.value = Math.round(Number(object.y) || 0);
    els.objectWInput.value = Math.round(Number(object.w) || 0);
    els.objectHInput.value = Math.round(Number(object.h) || 0);
    els.objectRotationInput.value = Math.round(Number(object.rotation) || 0);
    els.objectZInput.value = Math.round(Number(object.zIndex) || 0);
    syncTypedObjectPanel(object);
    els.objectDataInput.value = JSON.stringify(object.data || {}, null, 2);
    updateObjectCommandControlState();
  }

  function syncTypedObjectPanel(object) {
    var type = object && object.type;
    var data = object && object.data && typeof object.data === "object" ? object.data : {};
    var mediaType = type === "image" || type === "video" || type === "audio";

    if (els.objectMediaEditor) {
      els.objectMediaEditor.hidden = !mediaType;
      els.objectMediaSrcInput.value = mediaType ? data.src || "" : "";
      els.objectMediaPosterInput.value = type === "video" ? data.poster || "" : "";
      els.objectMediaCaptionInput.value = mediaType ? data.caption || "" : "";
      els.objectMediaAltInput.value = type === "image" ? data.alt || "" : "";
      els.objectMediaFitInput.value = data.fit === "contain" ? "contain" : "cover";
      els.objectMediaPosterField.hidden = type !== "video";
      els.objectMediaAltField.hidden = type !== "image";
      els.objectMediaFitField.hidden = !(type === "image" || type === "video");
    }

    if (els.objectChartEditor) {
      var isChart = type === "chart";
      els.objectChartEditor.hidden = !isChart;
      els.objectChartKindInput.value = isChart && data.kind === "line" ? "line" : isChart && data.kind === "donut" ? "donut" : "bar";
      els.objectChartUnitInput.value = isChart ? data.unit || "" : "";
      els.objectChartLabelsInput.value = isChart ? asTextCells(data.labels).join(" | ") : "";
      els.objectChartSeriesInput.value = isChart ? stringifyChartSeries(data.series || []) : "";
    }

    if (els.objectTableEditor) {
      var isTable = type === "table";
      els.objectTableEditor.hidden = !isTable;
      els.objectTableColumnsInput.value = isTable ? asTextCells(data.columns).join(" | ") : "";
      els.objectTableRowsInput.value = isTable ? stringifyTableRows(data.rows || []) : "";
    }
  }

  function tableContextLabel(info) {
    if (!info) return t("canvas.table");
    if (info.rowIndex < 0 && info.columnIndex >= 0) return t("canvas.tableHeader");
    if (info.rowIndex >= 0 && info.columnIndex >= 0) return t("canvas.tableCell");
    return t("canvas.table");
  }

  function updateObjectCommandControlState() {
    if (!els.objectPanel) return;
    var geometryCount = selectedGeometryInfos().length;
    els.objectPanel.querySelectorAll("[data-align-control]").forEach(function (control) {
      control.disabled = geometryCount < 2;
    });
    els.objectPanel.querySelectorAll("[data-distribute-control]").forEach(function (control) {
      control.disabled = geometryCount < 3;
    });
  }

  function setStyleToggleState(button, active) {
    button.setAttribute("aria-pressed", active ? "true" : "false");
  }

  function currentStyleOverride(path) {
    var styles = currentSlide().styles || {};
    return styles[path] && typeof styles[path] === "object" ? styles[path] : {};
  }

  function ensureStyleOverride(path) {
    var slide = currentSlide();
    slide.styles = slide.styles && typeof slide.styles === "object" && !Array.isArray(slide.styles) ? slide.styles : {};
    slide.styles[path] = slide.styles[path] && typeof slide.styles[path] === "object" && !Array.isArray(slide.styles[path]) ? slide.styles[path] : {};
    return slide.styles[path];
  }

  function cleanupStyleOverride(path) {
    var slide = currentSlide();
    if (!slide.styles || typeof slide.styles !== "object") return;
    if (slide.styles[path] && !Object.keys(slide.styles[path]).length) delete slide.styles[path];
    if (!Object.keys(slide.styles).length) delete slide.styles;
  }

  function applySelectedStyleLive() {
    var node = canvasNodeByPath(selectedCanvasPath);
    if (!node) return;
    applyStyleOverrideToElement(node, currentStyleOverride(selectedCanvasPath));
    positionCanvasSelectionBox(node);
    syncStylePanel();
  }

  function applyStyleOverrideToElement(node, style) {
    clearElementStyleOverride(node);
    if (!style || typeof style !== "object") return;
    if (style.fontFamily) node.style.fontFamily = fontFamilyStack(style.fontFamily);
    if (style.fontSize) node.style.fontSize = style.fontSize + "px";
    if (style.color) node.style.color = style.color;
    if (style.backgroundColor) node.style.backgroundColor = style.backgroundColor;
    if (style.textAlign) node.style.textAlign = style.textAlign;
    if (style.fontWeight) node.style.fontWeight = style.fontWeight;
    if (style.fontStyle) node.style.fontStyle = style.fontStyle;
    if (style.borderColor) {
      node.style.borderColor = style.borderColor;
      node.style.borderStyle = "solid";
      if (style.borderWidth == null) node.style.borderWidth = "1px";
    }
    if (style.borderWidth != null) {
      node.style.borderWidth = style.borderWidth + "px";
      node.style.borderStyle = style.borderWidth ? "solid" : "";
    }
    if (style.borderRadius != null) node.style.borderRadius = style.borderRadius + "px";
    if (style.opacity != null) node.style.opacity = style.opacity;
  }

  function clearElementStyleOverride(node) {
    [
      "fontFamily", "fontSize", "color", "backgroundColor", "textAlign", "fontWeight", "fontStyle",
      "borderColor", "borderStyle", "borderWidth", "borderRadius", "opacity"
    ].forEach(function (prop) {
      node.style[prop] = "";
    });
  }

  function normalizeStyleColor(value) {
    var color = String(value || "").trim();
    if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) return color;
    if (/^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.test(color)) return color;
    return "";
  }

  function colorInputValue(styleValue, computedValue, fallback) {
    return cssColorToHex(styleValue) || cssColorToHex(computedValue) || fallback;
  }

  function cssColorToHex(value) {
    var color = String(value || "").trim();
    var hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
    if (hex) {
      var body = hex[1];
      if (body.length === 3) {
        return "#" + body.split("").map(function (part) { return part + part; }).join("").toLowerCase();
      }
      return "#" + body.slice(0, 6).toLowerCase();
    }
    var rgb = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)$/i);
    if (!rgb || (rgb[4] != null && Number(rgb[4]) === 0)) return "";
    return "#" + [rgb[1], rgb[2], rgb[3]].map(function (part) {
      return Math.round(clamp(Number(part), 0, 255)).toString(16).padStart(2, "0");
    }).join("");
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
    positionCanvasSelectionBoxFromBounds(getNodeFrameBounds(node), box);
  }

  function positionCanvasSelectionBoxFromBounds(bounds, existingBox) {
    var box = existingBox || els.stageFrame.querySelector(".canvas-selection-box");
    if (!box || !bounds) return;
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
      selectionBox: els.stageFrame.querySelector(".canvas-selection-box"),
      isObject: Boolean(getObjectByPath(path)),
      pointerId: event.pointerId,
      frame: 0,
      pendingDx: 0,
      pendingDy: 0,
      moved: false
    };
    node.classList.add("is-canvas-dragging");
    els.stageFrame.classList.add("is-canvas-moving");
    node.style.willChange = "transform";
    if (node.setPointerCapture && event.pointerId != null) {
      try {
        node.setPointerCapture(event.pointerId);
      } catch (error) {
        // Pointer capture is best-effort; window listeners still keep the resize working.
      }
    }
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
    resize.pendingDx = dx;
    resize.pendingDy = dy;
    if (!resize.frame) {
      resize.frame = window.requestAnimationFrame(function () {
        resize.frame = 0;
        applyCanvasResizePreview(resize);
      });
    }
  }

  function applyCanvasResizePreview(resize) {
    if (!resize || !resize.node) return;
    var next = {
      x: resize.origin.x,
      y: resize.origin.y,
      w: resize.origin.w || resize.startBox.w,
      h: resize.origin.h || resize.startBox.h
    };
    var handle = resize.handle;
    var minW = 44;
    var minH = 24;
    var dx = resize.pendingDx;
    var dy = resize.pendingDy;

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

    if (resize.isObject) {
      next = clampObjectGeometry(next);
      resize.previewOffset = next;
      setObjectResizePreviewStyle(resize.node, resize.origin, resize.startBox, next);
      previewCanvasSelectionBox(
        resize.selectionBox,
        next.x - resize.origin.x,
        next.y - resize.origin.y,
        next.w,
        next.h
      );
      return;
    } else {
      next.x = clamp(next.x, -420, 420);
      next.y = clamp(next.y, -240, 240);
    }
    resize.previewOffset = next;
    setCanvasOffsetStyle(resize.node, next);
    previewCanvasSelectionBox(
      resize.selectionBox,
      next.x - resize.origin.x,
      next.y - resize.origin.y,
      next.w || resize.startBox.w,
      next.h || resize.startBox.h
    );
  }

  function setObjectResizePreviewStyle(node, origin, startBox, nextOffset) {
    var baseW = Math.max(1, Number(origin.w) || Number(startBox.w) || 1);
    var baseH = Math.max(1, Number(origin.h) || Number(startBox.h) || 1);
    var dx = Math.round((Number(nextOffset.x) || 0) - (Number(origin.x) || 0));
    var dy = Math.round((Number(nextOffset.y) || 0) - (Number(origin.y) || 0));
    var sx = Math.max(0.01, (Number(nextOffset.w) || baseW) / baseW);
    var sy = Math.max(0.01, (Number(nextOffset.h) || baseH) / baseH);
    node.style.transformOrigin = "0 0";
    node.style.transform = "translate3d(" + dx + "px, " + dy + "px, 0) scale(" + sx + ", " + sy + ")";
  }

  function flushCanvasResizePreview(resize) {
    if (!resize || !resize.moved) return;
    if (resize.frame) {
      window.cancelAnimationFrame(resize.frame);
      resize.frame = 0;
    }
    applyCanvasResizePreview(resize);
  }

  function handleCanvasResizePointerEnd(event) {
    if (!activeCanvasResize) return;
    var resize = activeCanvasResize;
    flushCanvasResizePreview(resize);
    activeCanvasResize = null;
    window.removeEventListener("pointermove", handleCanvasResizePointerMove);
    window.removeEventListener("pointerup", handleCanvasResizePointerEnd);
    window.removeEventListener("pointercancel", handleCanvasResizePointerEnd);
    resize.node.classList.remove("is-canvas-dragging");
    els.stageFrame.classList.remove("is-canvas-moving");
    resize.node.style.willChange = "";
    resize.node.style.transformOrigin = "";
    if (resize.node.releasePointerCapture && resize.pointerId != null) {
      try {
        resize.node.releasePointerCapture(resize.pointerId);
      } catch (error) {
        // The pointer may already be released by the browser.
      }
    }
    if (!resize.moved) return;
    event.preventDefault();

    var offset = resize.previewOffset || parseCanvasOffsetStyle(resize.node);
    if (sameOffset(resize.origin, offset)) {
      setCanvasOffsetStyle(resize.node, resize.origin);
      renderCanvasControls();
      return;
    }
    history.push(resize.before);
    if (history.length > 80) history.shift();
    future = [];
    var foldedTextBox = foldTextBoxGeometry(resize.path, offset);
    if (!foldedTextBox) {
      setCanvasOffset(resize.path, offset);
      setCanvasOffsetStyle(resize.node, getCanvasOffset(resize.path));
    }
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    if (foldedTextBox) renderCanvas();
    else renderCanvasControls();
    updateButtons();
    updateFileStatus();
    schedulePersist();
  }

  function handleCanvasClipboardShortcut(event, commandKey, lowerKey) {
    if (presenting || activeCanvasEdit || activeCanvasDrag || activeCanvasResize) return false;
    if (commandKey && lowerKey === "c") {
      if (!selectedCanvasPath) return false;
      event.preventDefault();
      return copySelectedCanvas();
    }
    if (commandKey && lowerKey === "v") {
      if (!canvasClipboard) return false;
      event.preventDefault();
      return pasteCanvasClipboard();
    }
    if (commandKey && lowerKey === "d") {
      if (!selectedCanvasPath) return false;
      event.preventDefault();
      return duplicateSelectedCanvas();
    }
    return false;
  }

  function handleCanvasShortcut(event) {
    if (!selectedCanvasPath || presenting || activeCanvasEdit || activeCanvasDrag || activeCanvasResize) return false;
    var node = canvasNodeByPath(selectedCanvasPath);
    if (!node) {
      clearCanvasSelection();
      return false;
    }

    var selectedPaths = currentCanvasSelectionPaths();

    if (event.key === "Escape") {
      event.preventDefault();
      clearCanvasSelection();
      renderCanvasControls();
      return true;
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSelectedCanvasContent(selectedPaths);
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
    if (selectedPaths.length > 1) {
      nudgeSelectedCanvasTargets(selectedPaths, arrowDelta[0] * step, arrowDelta[1] * step);
      return true;
    }
    var origin = getCanvasOffset(selectedCanvasPath);
    var next = {
      x: clamp(origin.x + arrowDelta[0] * step, -420, 420),
      y: clamp(origin.y + arrowDelta[1] * step, -240, 240),
      w: origin.w,
      h: origin.h
    };
    if (getObjectByPath(selectedCanvasPath)) {
      next = clampObjectGeometry({
        x: origin.x + arrowDelta[0] * step,
        y: origin.y + arrowDelta[1] * step,
        w: origin.w,
        h: origin.h
      });
    }
    history.push(JSON.stringify(deck));
    if (history.length > 80) history.shift();
    future = [];
    if (foldTextBoxGeometry(selectedCanvasPath, {
      x: arrowDelta[0] * step,
      y: arrowDelta[1] * step
    })) {
      applyTextBoxGeometryStyle(node, getTextBoxByPath(selectedCanvasPath));
      positionCanvasSelectionBox(node);
    } else {
      setCanvasOffset(selectedCanvasPath, next);
      setCanvasOffsetStyle(node, next);
      positionCanvasSelectionBox(node);
    }
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    updateButtons();
    updateFileStatus();
    schedulePersist();
    return true;
  }

  function nudgeSelectedCanvasTargets(paths, dx, dy) {
    history.push(JSON.stringify(deck));
    if (history.length > 80) history.shift();
    future = [];
    paths.forEach(function (path) {
      if (foldTextBoxGeometry(path, { x: dx, y: dy })) return;
      var origin = getCanvasOffset(path);
      var next = getObjectByPath(path)
        ? clampObjectGeometry({ x: origin.x + dx, y: origin.y + dy, w: origin.w, h: origin.h })
        : { x: clamp(origin.x + dx, -420, 420), y: clamp(origin.y + dy, -240, 240), w: origin.w, h: origin.h };
      setCanvasOffset(path, next);
    });
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderCanvas();
    updateButtons();
    updateFileStatus();
    schedulePersist();
  }

  function deleteSelectedCanvasTargets(paths) {
    return deleteSelectedCanvasContent(paths);
  }

  function deleteSelectedCanvasContent(paths) {
    if (presenting || activeCanvasEdit || activeCanvasDrag || activeCanvasResize) return false;
    var targets = uniqueStrings((paths && paths.length ? paths : currentCanvasSelectionPaths()).filter(Boolean));
    if (!targets.length) return false;

    var slide = currentSlide();
    var before = JSON.stringify(deck);
    var changed = deleteCanvasPathsFromSlide(slide, targets);
    if (!changed) return false;

    history.push(before);
    if (history.length > 80) history.shift();
    future = [];
    clearCanvasSelection();
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    updateFileStatus();
    schedulePersist();
    toast(t("toast.deleted"));
    return true;
  }

  function deleteCanvasPathsFromSlide(slide, paths) {
    var changed = false;
    var removedObjectIndexes = uniqueNumbers(paths.map(objectIndexFromPath)).sort(function (a, b) { return b - a; });
    var removedTextBoxIndexes = uniqueNumbers(paths.map(textBoxIndexFromPath)).sort(function (a, b) { return b - a; });

    removedObjectIndexes.forEach(function (index) {
      if (Array.isArray(slide.objects) && slide.objects[index]) {
        slide.objects.splice(index, 1);
        remapObjectCanvasPaths(slide, index);
        changed = true;
      }
    });

    removedTextBoxIndexes.forEach(function (index) {
      if (Array.isArray(slide.textBoxes) && slide.textBoxes[index]) {
        slide.textBoxes.splice(index, 1);
        remapTextBoxCanvasPaths(slide, index);
        changed = true;
      }
    });

    paths.forEach(function (path) {
      if (objectIndexFromPath(path) >= 0 || textBoxIndexFromPath(path) >= 0) return;
      if (removedObjectIndexes.length && objectIndexFromAnyPath(path) >= 0) return;
      if (removedTextBoxIndexes.length && String(path).indexOf("textBoxes.") === 0) return;
      if (deleteSlideValueByPath(slide, path)) changed = true;
    });

    cleanupPathMap(slide, "canvas");
    cleanupPathMap(slide, "styles");
    return changed;
  }

  function deleteSlideValueByPath(slide, path) {
    var before = JSON.stringify(slide);
    var objectIndex = objectIndexFromAnyPath(path);
    if (objectIndex >= 0) {
      deleteNestedPathValue(slide, path);
      clearPathDecoration(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (path === "image" || path === "image.caption") {
      if (path === "image.caption") setPath(slide, "image.caption", "");
      else {
        slide.image = {};
        fallbackLayout(slide, ["hero", "imageRight", "imageLeft", "imageFull", "imageBackground"]);
        clearPathDecorationPrefix(slide, "image");
      }
      clearPathDecoration(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (path === "video" || path === "video.caption") {
      if (path === "video.caption") setPath(slide, "video.caption", "");
      else {
        slide.video = {};
        fallbackLayout(slide, ["video"]);
        clearPathDecorationPrefix(slide, "video");
      }
      clearPathDecoration(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (path === "audio" || path === "audio.caption") {
      if (path === "audio.caption") setPath(slide, "audio.caption", "");
      else {
        slide.audio = {};
        fallbackLayout(slide, ["audio"]);
        clearPathDecorationPrefix(slide, "audio");
      }
      clearPathDecoration(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (path === "chart" || path.indexOf("chart.") === 0) {
      deleteChartPath(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (path === "table" || path.indexOf("table.") === 0) {
      deleteTablePath(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (path === "cards") {
      slide.cards = [];
      fallbackLayout(slide, ["threeCards"]);
      clearPathDecorationPrefix(slide, "cards");
      return JSON.stringify(slide) !== before;
    }

    if (path.indexOf("cards.") === 0) {
      deleteNestedPathValue(slide, path);
      clearPathDecoration(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (path === "metrics") {
      slide.metrics = [];
      fallbackLayout(slide, ["data"]);
      clearPathDecorationPrefix(slide, "metrics");
      return JSON.stringify(slide) !== before;
    }

    if (path.indexOf("metrics.") === 0) {
      deleteNestedPathValue(slide, path);
      clearPathDecoration(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (path === "timeline") {
      slide.items = [];
      fallbackLayout(slide, ["timeline"]);
      clearPathDecorationPrefix(slide, "timeline");
      clearPathDecorationPrefix(slide, "items");
      return JSON.stringify(slide) !== before;
    }

    if (path.indexOf("items.") === 0) {
      deleteNestedPathValue(slide, path);
      clearPathDecoration(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (["kicker", "title", "subtitle", "body", "quote", "author", "code"].indexOf(path) !== -1) {
      slide[path] = "";
      if (path === "code") fallbackLayout(slide, ["code"]);
      clearPathDecoration(slide, path);
      return JSON.stringify(slide) !== before;
    }

    if (path === "left.title" || path === "left.text" || path === "right.title" || path === "right.text") {
      deleteNestedPathValue(slide, path);
      clearPathDecoration(slide, path);
      return JSON.stringify(slide) !== before;
    }

    deleteNestedPathValue(slide, path);
    clearPathDecoration(slide, path);
    return JSON.stringify(slide) !== before;
  }

  function deleteChartPath(slide, path) {
    slide.chart = slide.chart && typeof slide.chart === "object" ? slide.chart : {};
    var chart = slide.chart;
    if (path === "chart") {
      slide.chart = { labels: [], series: [], unit: "" };
      fallbackLayout(slide, ["chart"]);
      clearPathDecorationPrefix(slide, "chart");
      return;
    }

    var labelMatch = path.match(/^chart\.labels\.(\d+)$/);
    if (labelMatch) {
      var labelIndex = Number(labelMatch[1]);
      if (Array.isArray(chart.labels)) chart.labels.splice(labelIndex, 1);
      if (Array.isArray(chart.series)) {
        chart.series.forEach(function (series) {
          if (Array.isArray(series.values)) series.values.splice(labelIndex, 1);
        });
      }
      clearPathDecorationPrefix(slide, "chart");
      return;
    }

    var seriesMatch = path.match(/^chart\.series\.(\d+)(?:\.name)?$/);
    if (seriesMatch && Array.isArray(chart.series)) {
      chart.series.splice(Number(seriesMatch[1]), 1);
      clearPathDecorationPrefix(slide, "chart");
      return;
    }

    var valueMatch = path.match(/^chart\.series\.(\d+)\.values\.(\d+)$/);
    if (valueMatch) {
      var valueIndex = Number(valueMatch[2]);
      if (Array.isArray(chart.labels)) chart.labels.splice(valueIndex, 1);
      if (Array.isArray(chart.series)) {
        chart.series.forEach(function (series) {
          if (Array.isArray(series.values)) series.values.splice(valueIndex, 1);
        });
      }
      clearPathDecorationPrefix(slide, "chart");
      return;
    }

    deleteNestedPathValue(slide, path);
    clearPathDecoration(slide, path);
  }

  function deleteTablePath(slide, path) {
    slide.table = slide.table && typeof slide.table === "object" ? slide.table : {};
    var table = slide.table;
    if (path === "table") {
      slide.table = { columns: [], rows: [] };
      fallbackLayout(slide, ["table"]);
      clearPathDecorationPrefix(slide, "table");
      return;
    }
    deleteNestedPathValue(slide, path);
    clearPathDecoration(slide, path);
    if (Array.isArray(table.columns) && table.columns.every(function (column) { return !String(column || "").trim(); })) {
      table.columns = [];
    }
    if (Array.isArray(table.rows) && table.rows.every(function (row) {
      return Array.isArray(row) && row.every(function (cell) { return !String(cell || "").trim(); });
    })) {
      table.rows = [];
    }
  }

  function deleteNestedPathValue(root, path) {
    setPath(root, path, "");
  }

  function fallbackLayout(slide, layouts) {
    if (layouts.indexOf(slide.layout) !== -1) slide.layout = "text";
  }

  function clearPathDecoration(slide, path) {
    var changed = false;
    ["canvas", "styles"].forEach(function (key) {
      var map = slide[key] && typeof slide[key] === "object" ? slide[key] : {};
      if (Object.prototype.hasOwnProperty.call(map, path)) {
        delete map[path];
        changed = true;
      }
      if (!Object.keys(map).length) delete slide[key];
    });
    return changed;
  }

  function clearPathDecorationPrefix(slide, prefix) {
    var changed = false;
    ["canvas", "styles"].forEach(function (key) {
      var map = slide[key] && typeof slide[key] === "object" ? slide[key] : {};
      Object.keys(map).forEach(function (path) {
        if (path === prefix || path.indexOf(prefix + ".") === 0) {
          delete map[path];
          changed = true;
        }
      });
      if (!Object.keys(map).length) delete slide[key];
    });
    return changed;
  }

  function cleanupPathMap(slide, key) {
    if (slide[key] && typeof slide[key] === "object" && !Object.keys(slide[key]).length) delete slide[key];
  }

  function uniqueNumbers(values) {
    var unique = [];
    values.forEach(function (value) {
      if (value >= 0 && unique.indexOf(value) === -1) unique.push(value);
    });
    return unique;
  }

  function uniqueStrings(values) {
    var unique = [];
    values.forEach(function (value) {
      var text = String(value || "");
      if (text && unique.indexOf(text) === -1) unique.push(text);
    });
    return unique;
  }

  function selectedGeometryInfos() {
    return currentCanvasSelectionPaths().map(geometryInfoForPath).filter(Boolean);
  }

  function geometryInfoForPath(path) {
    var object = getObjectByPath(path);
    if (object) {
      return {
        path: path,
        kind: "object",
        target: object,
        geometry: {
          x: Number(object.x) || 0,
          y: Number(object.y) || 0,
          w: Math.max(44, Number(object.w) || 44),
          h: Math.max(24, Number(object.h) || 24)
        }
      };
    }
    var box = getTextBoxByPath(path);
    if (box) {
      return {
        path: path,
        kind: "textBox",
        target: box,
        geometry: {
          x: Number(box.x) || 0,
          y: Number(box.y) || 0,
          w: Math.max(44, Number(box.w) || 380),
          h: Math.max(24, Number(box.h) || 96)
        }
      };
    }
    return null;
  }

  function alignSelectedCanvasTargets(action) {
    var infos = selectedGeometryInfos();
    if (infos.length < 2) return false;
    return commitGeometryInfos(infos, function () {
      var bounds = geometryBounds(infos);
      infos.forEach(function (info) {
        var geometry = Object.assign({}, info.geometry);
        if (action === "left") geometry.x = bounds.left;
        if (action === "center") geometry.x = bounds.left + bounds.w / 2 - geometry.w / 2;
        if (action === "right") geometry.x = bounds.right - geometry.w;
        if (action === "top") geometry.y = bounds.top;
        if (action === "middle") geometry.y = bounds.top + bounds.h / 2 - geometry.h / 2;
        if (action === "bottom") geometry.y = bounds.bottom - geometry.h;
        setGeometryInfo(info, geometry);
      });
    });
  }

  function distributeSelectedCanvasTargets(axis) {
    var infos = selectedGeometryInfos();
    if (infos.length < 3) return false;
    return commitGeometryInfos(infos, function () {
      var horizontal = axis === "horizontal";
      var sorted = infos.slice().sort(function (a, b) {
        return horizontal ? a.geometry.x - b.geometry.x : a.geometry.y - b.geometry.y;
      });
      var first = sorted[0].geometry;
      var last = sorted[sorted.length - 1].geometry;
      var start = horizontal ? first.x : first.y;
      var end = horizontal ? last.x + last.w : last.y + last.h;
      var total = sorted.reduce(function (sum, info) {
        return sum + (horizontal ? info.geometry.w : info.geometry.h);
      }, 0);
      var gap = Math.max(0, (end - start - total) / (sorted.length - 1));
      var cursor = start;
      sorted.forEach(function (info) {
        var geometry = Object.assign({}, info.geometry);
        if (horizontal) {
          geometry.x = cursor;
          cursor += geometry.w + gap;
        } else {
          geometry.y = cursor;
          cursor += geometry.h + gap;
        }
        setGeometryInfo(info, geometry);
      });
    });
  }

  function commitGeometryInfos(infos, mutator) {
    var before = JSON.stringify(deck);
    mutator();
    if (before === JSON.stringify(deck)) return false;
    history.push(before);
    if (history.length > 80) history.shift();
    future = [];
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderCanvas();
    syncInspector();
    updateButtons();
    updateFileStatus();
    persist();
    return true;
  }

  function geometryBounds(infos) {
    var left = Math.min.apply(null, infos.map(function (info) { return info.geometry.x; }));
    var top = Math.min.apply(null, infos.map(function (info) { return info.geometry.y; }));
    var right = Math.max.apply(null, infos.map(function (info) { return info.geometry.x + info.geometry.w; }));
    var bottom = Math.max.apply(null, infos.map(function (info) { return info.geometry.y + info.geometry.h; }));
    return { left: left, top: top, right: right, bottom: bottom, w: right - left, h: bottom - top };
  }

  function setGeometryInfo(info, geometry) {
    if (info.kind === "object") {
      var nextObject = clampObjectGeometry(geometry);
      info.target.x = Math.round(nextObject.x);
      info.target.y = Math.round(nextObject.y);
      info.target.w = Math.round(nextObject.w);
      info.target.h = Math.round(nextObject.h);
      info.geometry = nextObject;
      return;
    }
    info.target.x = Math.round(clamp(Number(geometry.x) || 0, 0, PPTHtml.baseWidth - 40));
    info.target.y = Math.round(clamp(Number(geometry.y) || 0, 0, PPTHtml.baseHeight - 24));
    info.target.w = Math.round(Math.max(44, Number(geometry.w) || 44));
    info.target.h = Math.round(Math.max(24, Number(geometry.h) || 24));
    info.geometry = {
      x: info.target.x,
      y: info.target.y,
      w: info.target.w,
      h: info.target.h
    };
  }

  function selectedObjectInfo() {
    var index = objectIndexFromPath(selectedCanvasPath);
    var slide = currentSlide();
    if (index < 0 || !Array.isArray(slide.objects) || !slide.objects[index]) return null;
    return {
      slide: slide,
      index: index,
      path: "objects." + index,
      object: slide.objects[index]
    };
  }

  function selectedTextBoxInfo() {
    var index = textBoxIndexFromPath(selectedCanvasPath);
    var slide = currentSlide();
    if (index < 0 || !Array.isArray(slide.textBoxes) || !slide.textBoxes[index]) return null;
    return {
      slide: slide,
      index: index,
      path: "textBoxes." + index + ".text",
      textBox: slide.textBoxes[index]
    };
  }

  function createSelectionClipboard() {
    var objectInfo = selectedObjectInfo();
    if (objectInfo) {
      return {
        kind: "object",
        value: clonePlain(objectInfo.object),
        style: clonePathStyle(objectInfo.slide, objectInfo.path)
      };
    }
    var textInfo = selectedTextBoxInfo();
    if (textInfo) {
      return {
        kind: "textBox",
        value: clonePlain(textInfo.textBox),
        style: clonePathStyle(textInfo.slide, textInfo.path)
      };
    }
    return null;
  }

  function copySelectedCanvas() {
    var payload = createSelectionClipboard();
    if (!payload) return false;
    canvasClipboard = payload;
    toast(t("toast.objectCopied"));
    return true;
  }

  function pasteCanvasClipboard(point) {
    if (!canvasClipboard) return false;
    return pasteCanvasPayload(canvasClipboard, point || canvasContextPoint);
  }

  function duplicateSelectedCanvas() {
    var payload = createSelectionClipboard();
    if (!payload) return false;
    return pasteCanvasPayload(payload);
  }

  function pasteCanvasPayload(payload, point) {
    var nextPath = "";
    commit(function () {
      if (payload.kind === "object") nextPath = pasteObjectPayload(payload, point);
      if (payload.kind === "textBox") nextPath = pasteTextBoxPayload(payload, point);
      setCanvasSelection(nextPath ? [nextPath] : []);
    });
    if (!nextPath) return false;
    toast(t("toast.objectPasted"));
    window.setTimeout(function () {
      var node = canvasNodeByPath(nextPath);
      if (node) selectCanvasTarget(node);
    }, 0);
    return true;
  }

  function pasteObjectPayload(payload, point) {
    var slide = currentSlide();
    slide.objects = Array.isArray(slide.objects) ? slide.objects : [];
    var object = clonePlain(payload.value);
    object.id = PPTHtml.uid("object");
    object.zIndex = nextObjectZIndex();
    object.rotation = Number(object.rotation) || 0;
    var geometry = offsetPastedGeometry(object, point, { w: 320, h: 180 });
    object.x = geometry.x;
    object.y = geometry.y;
    object.w = geometry.w;
    object.h = geometry.h;
    slide.objects.push(object);
    var path = "objects." + (slide.objects.length - 1);
    applyPathStyle(slide, path, payload.style);
    return path;
  }

  function pasteTextBoxPayload(payload, point) {
    var slide = currentSlide();
    slide.textBoxes = Array.isArray(slide.textBoxes) ? slide.textBoxes : [];
    var box = clonePlain(payload.value);
    box.id = PPTHtml.uid("textbox");
    var width = Math.max(44, Number(box.w) || 380);
    var height = Math.max(24, Number(box.h) || 96);
    if (point && isFinite(point.x) && isFinite(point.y)) {
      box.x = Math.round(clamp(point.x - width / 2, 0, PPTHtml.baseWidth - 40));
      box.y = Math.round(clamp(point.y - height / 2, 0, PPTHtml.baseHeight - 24));
    } else {
      box.x = Math.round(clamp((Number(box.x) || 0) + 24, 0, PPTHtml.baseWidth - 40));
      box.y = Math.round(clamp((Number(box.y) || 0) + 24, 0, PPTHtml.baseHeight - 24));
    }
    box.w = Math.round(width);
    box.h = Math.round(height);
    slide.textBoxes.push(box);
    var path = "textBoxes." + (slide.textBoxes.length - 1) + ".text";
    applyPathStyle(slide, path, payload.style);
    return path;
  }

  function offsetPastedGeometry(object, point, fallbackSize) {
    var width = Math.max(44, Number(object.w) || fallbackSize.w);
    var height = Math.max(24, Number(object.h) || fallbackSize.h);
    var x = Number(object.x) || 0;
    var y = Number(object.y) || 0;
    if (point && isFinite(point.x) && isFinite(point.y)) {
      x = point.x - width / 2;
      y = point.y - height / 2;
    } else {
      x += 24;
      y += 24;
    }
    var next = clampObjectGeometry({ x: x, y: y, w: width, h: height });
    return {
      x: Math.round(next.x),
      y: Math.round(next.y),
      w: Math.round(next.w),
      h: Math.round(next.h)
    };
  }

  function clonePathStyle(slide, path) {
    if (!slide.styles || typeof slide.styles !== "object" || !slide.styles[path]) return {};
    return clonePlain(slide.styles[path]);
  }

  function applyPathStyle(slide, path, style) {
    if (!style || !Object.keys(style).length) return;
    slide.styles = slide.styles && typeof slide.styles === "object" && !Array.isArray(slide.styles) ? slide.styles : {};
    slide.styles[path] = clonePlain(style);
  }

  function clonePlain(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  function commitSelectedObjectMutation(mutator) {
    var info = selectedObjectInfo();
    if (!info) return false;
    var before = activeEditSnapshot || JSON.stringify(deck);
    mutator(info.object, info.index, info.slide);
    if (before === JSON.stringify(deck)) {
      syncObjectPanel();
      return false;
    }
    history.push(before);
    if (history.length > 80) history.shift();
    future = [];
    activeEditSnapshot = "";
    activeEditPushed = false;
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderCanvas();
    syncInspector();
    updateButtons();
    updateFileStatus();
    persist();
    return true;
  }

  function commitObjectDataFromPanel() {
    if (syncing) return;
    var parsed;
    try {
      parsed = JSON.parse(els.objectDataInput.value || "{}");
    } catch (error) {
      toast(t("toast.objectDataInvalid"));
      syncObjectPanel();
      return;
    }
    commitSelectedObjectMutation(function (object) {
      object.data = parsed && typeof parsed === "object" ? parsed : {};
      if (object.type === "table") fitTableObjectToData(object, { growOnly: true });
    });
  }

  function selectedTableInfo() {
    var slide = currentSlide();
    var parsed = parseTablePath(selectedCanvasPath);

    if (parsed && parsed.kind === "object") {
      var objects = Array.isArray(slide.objects) ? slide.objects : [];
      var object = objects[parsed.objectIndex];
      if (object && object.type === "table") {
        object.data = object.data && typeof object.data === "object" ? object.data : {};
        return Object.assign(parsed, {
          table: object.data,
          object: object,
          path: "objects." + parsed.objectIndex + ".data"
        });
      }
    }

    var objectInfo = selectedObjectInfo();
    if (objectInfo && objectInfo.object && objectInfo.object.type === "table") {
      objectInfo.object.data = objectInfo.object.data && typeof objectInfo.object.data === "object" ? objectInfo.object.data : {};
      return {
        kind: "object",
        objectIndex: objectInfo.index,
        rowIndex: -1,
        columnIndex: -1,
        table: objectInfo.object.data,
        object: objectInfo.object,
        path: objectInfo.path + ".data"
      };
    }

    if ((parsed && parsed.kind === "slide") || slide.layout === "table") {
      slide.table = slide.table && typeof slide.table === "object" ? slide.table : { columns: [], rows: [] };
      return Object.assign(parsed || {
        kind: "slide",
        rowIndex: -1,
        columnIndex: -1
      }, {
        table: slide.table,
        path: "table"
      });
    }

    return null;
  }

  function selectedExplicitTableInfo() {
    var parsed = parseTablePath(selectedCanvasPath);
    if (parsed) return selectedTableInfo();
    var objectInfo = selectedObjectInfo();
    if (objectInfo && objectInfo.object && objectInfo.object.type === "table") return selectedTableInfo();
    return null;
  }

  function parseTablePath(path) {
    var value = String(path || "");
    var objectColumn = value.match(/^objects\.(\d+)\.data\.columns\.(\d+)$/);
    if (objectColumn) {
      return {
        kind: "object",
        objectIndex: Number(objectColumn[1]),
        rowIndex: -1,
        columnIndex: Number(objectColumn[2])
      };
    }
    var objectCell = value.match(/^objects\.(\d+)\.data\.rows\.(\d+)\.(\d+)$/);
    if (objectCell) {
      return {
        kind: "object",
        objectIndex: Number(objectCell[1]),
        rowIndex: Number(objectCell[2]),
        columnIndex: Number(objectCell[3])
      };
    }
    var slideColumn = value.match(/^table\.columns\.(\d+)$/);
    if (slideColumn) {
      return {
        kind: "slide",
        rowIndex: -1,
        columnIndex: Number(slideColumn[1])
      };
    }
    var slideCell = value.match(/^table\.rows\.(\d+)\.(\d+)$/);
    if (slideCell) {
      return {
        kind: "slide",
        rowIndex: Number(slideCell[1]),
        columnIndex: Number(slideCell[2])
      };
    }
    if (value === "table") {
      return {
        kind: "slide",
        rowIndex: -1,
        columnIndex: -1
      };
    }
    return null;
  }

  function isTableCellPath(path) {
    return /^(?:table\.(?:columns\.\d+|rows\.\d+\.\d+)|objects\.\d+\.data\.(?:columns\.\d+|rows\.\d+\.\d+))$/.test(String(path || ""));
  }

  function tableScopeKey(info) {
    if (!info) return "";
    return info.kind === "object" ? "object:" + info.objectIndex : "slide";
  }

  function sameTableScope(path, candidatePath) {
    var source = parseTablePath(path);
    var candidate = parseTablePath(candidatePath);
    return Boolean(source && candidate && tableScopeKey(source) === tableScopeKey(candidate));
  }

  function normalizeEditableTable(table) {
    table.columns = Array.isArray(table.columns) ? table.columns.map(function (cell) {
      return String(cell == null ? "" : cell);
    }) : [];
    table.rows = Array.isArray(table.rows) ? table.rows.map(function (row) {
      return Array.isArray(row) ? row.map(function (cell) {
        return String(cell == null ? "" : cell);
      }) : [];
    }) : [];

    var columnCount = table.columns.length;
    table.rows.forEach(function (row) {
      columnCount = Math.max(columnCount, row.length);
    });
    columnCount = Math.max(1, columnCount);

    while (table.columns.length < columnCount) table.columns.push("");
    table.rows.forEach(function (row) {
      while (row.length < columnCount) row.push("");
      if (row.length > columnCount) row.length = columnCount;
    });
    if (!table.rows.length) table.rows.push(new Array(columnCount).fill(""));
    return columnCount;
  }

  function mutateSelectedTable(action) {
    var info = selectedTableInfo();
    if (!info) return false;
    var before = JSON.stringify(deck);
    var table = info.table;
    var columnCount = normalizeEditableTable(table);
    var rowIndex = info.rowIndex >= 0 ? info.rowIndex : (info.columnIndex >= 0 ? 0 : table.rows.length - 1);
    var columnIndex = info.columnIndex >= 0 ? info.columnIndex : (info.rowIndex >= 0 ? 0 : columnCount - 1);
    var nextPath = "";

    if (action === "addRow" || action === "addRowAfter" || action === "addRowBefore") {
      var insertRow = action === "addRowBefore" ? rowIndex : rowIndex + 1;
      if (info.rowIndex < 0 && info.columnIndex >= 0 && action !== "addRowBefore") insertRow = 0;
      insertRow = clamp(insertRow, 0, table.rows.length);
      table.rows.splice(insertRow, 0, new Array(columnCount).fill(""));
      nextPath = tableCellPath(info, insertRow, Math.max(0, columnIndex));
    }

    if (action === "deleteRow") {
      if (table.rows.length <= 1) {
        table.rows[0] = new Array(columnCount).fill("");
        nextPath = tableCellPath(info, 0, Math.max(0, columnIndex));
      } else {
        var removeRow = clamp(rowIndex, 0, table.rows.length - 1);
        table.rows.splice(removeRow, 1);
        nextPath = tableCellPath(info, Math.min(removeRow, table.rows.length - 1), Math.max(0, columnIndex));
      }
    }

    if (action === "addColumn" || action === "addColumnAfter" || action === "addColumnBefore") {
      var insertColumn = action === "addColumnBefore" ? columnIndex : columnIndex + 1;
      insertColumn = clamp(insertColumn, 0, columnCount);
      table.columns.splice(insertColumn, 0, "");
      table.rows.forEach(function (row) {
        row.splice(insertColumn, 0, "");
      });
      nextPath = tableCellPath(info, Math.max(0, rowIndex), insertColumn);
    }

    if (action === "deleteColumn") {
      if (columnCount <= 1) {
        table.columns[0] = "";
        table.rows.forEach(function (row) { row[0] = ""; });
        nextPath = tableCellPath(info, Math.max(0, rowIndex), 0);
      } else {
        var removeColumn = clamp(columnIndex, 0, columnCount - 1);
        table.columns.splice(removeColumn, 1);
        table.rows.forEach(function (row) {
          row.splice(removeColumn, 1);
        });
        nextPath = tableCellPath(info, Math.max(0, rowIndex), Math.min(removeColumn, columnCount - 2));
      }
    }

    if (action === "clearCell" && isTableCellPath(selectedCanvasPath)) {
      setPath(currentSlide(), selectedCanvasPath, "");
      nextPath = selectedCanvasPath;
    }

    normalizeEditableTable(table);
    if (info.kind === "object" && info.object) {
      fitTableObjectToData(info.object, { growOnly: action.indexOf("delete") !== 0 });
    }
    if (before === JSON.stringify(deck)) return false;
    history.push(before);
    if (history.length > 80) history.shift();
    future = [];
    deck = PPTHtml.normalizeDeck(deck);
    if (nextPath) setCanvasSelection([nextPath]);
    markDirty();
    renderAll();
    updateFileStatus();
    persist();
    toast(t("toast.tableChanged"));
    return true;
  }

  function tableCellPath(info, rowIndex, columnIndex) {
    var prefix = info.kind === "object" ? "objects." + info.objectIndex + ".data." : "table.";
    if (rowIndex < 0) return prefix + "columns." + Math.max(0, columnIndex);
    return prefix + "rows." + Math.max(0, rowIndex) + "." + Math.max(0, columnIndex);
  }

  function fitTableObjectToData(object, options) {
    if (!object || object.type !== "table") return false;
    var size = tableObjectSize(object.data);
    var growOnly = !options || options.growOnly !== false;
    var next = clampObjectInsideSlide({
      x: Number(object.x) || 0,
      y: Number(object.y) || 0,
      w: growOnly ? Math.max(Number(object.w) || 0, size.w) : size.w,
      h: growOnly ? Math.max(Number(object.h) || 0, size.h) : size.h
    });
    var changed = Math.round(object.x) !== Math.round(next.x)
      || Math.round(object.y) !== Math.round(next.y)
      || Math.round(object.w) !== Math.round(next.w)
      || Math.round(object.h) !== Math.round(next.h);
    object.x = Math.round(next.x);
    object.y = Math.round(next.y);
    object.w = Math.round(next.w);
    object.h = Math.round(next.h);
    return changed;
  }

  function fitTableObjectForPath(path, options) {
    var index = objectIndexFromAnyPath(path);
    if (index < 0) return false;
    var object = (currentSlide().objects || [])[index];
    return fitTableObjectToData(object, options);
  }

  function clearSelectedTableCell() {
    if (!isTableCellPath(selectedCanvasPath)) return false;
    var before = JSON.stringify(deck);
    setPath(currentSlide(), selectedCanvasPath, "");
    if (before === JSON.stringify(deck)) return false;
    history.push(before);
    if (history.length > 80) history.shift();
    future = [];
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    persist();
    return true;
  }

  function moveSelectedObjectLayer(action) {
    var changed = commitSelectedObjectMutation(function (object, index, slide) {
      var objects = Array.isArray(slide.objects) ? slide.objects : [];
      var current = Number(object.zIndex) || 0;
      if (action === "front") {
        object.zIndex = objects.reduce(function (max, item) {
          return Math.max(max, Number(item.zIndex) || 0);
        }, current) + 1;
        return;
      }
      if (action === "back") {
        var lowest = objects.reduce(function (min, item) {
          return Math.min(min, Number(item.zIndex) || 0);
        }, current) - 1;
        if (lowest < 1) {
          objects.forEach(function (item, itemIndex) {
            if (itemIndex !== index) item.zIndex = (Number(item.zIndex) || 0) + 1;
          });
          object.zIndex = 1;
        } else {
          object.zIndex = lowest;
        }
        return;
      }

      var candidates = objects.map(function (item, itemIndex) {
        return { object: item, index: itemIndex, z: Number(item.zIndex) || 0 };
      }).filter(function (item) {
        if (item.index === index) return false;
        return action === "forward" ? item.z > current : item.z < current;
      }).sort(function (a, b) {
        return action === "forward" ? a.z - b.z : b.z - a.z;
      });
      if (!candidates.length) return;
      var target = candidates[0];
      object.zIndex = target.z;
      target.object.zIndex = current;
    });
    if (changed) toast(t("toast.layerChanged"));
    return changed;
  }

  function handleSlideListContextMenu(event) {
    var thumb = event.target.closest(".slide-thumb");
    if (!thumb || !els.slideList.contains(thumb)) return;
    event.preventDefault();
    event.stopPropagation();
    hideTooltip();
    var index = Number(thumb.dataset.slideIndex);
    if (!isFinite(index)) return;
    selectSlide(index, { focusThumb: true });
    showSlideContextMenu(event.clientX, event.clientY, index);
  }

  function showSlideContextMenu(x, y, index) {
    if (!els.slideContextMenu) return;
    hideCanvasContextMenu();
    slideContextIndex = clamp(Number(index), 0, deck.slides.length - 1);
    updateSlideContextMenuState();
    els.slideContextMenu.hidden = false;
    els.slideContextMenu.style.left = "0px";
    els.slideContextMenu.style.top = "0px";
    var rect = els.slideContextMenu.getBoundingClientRect();
    var left = clamp(x, 8, Math.max(8, window.innerWidth - rect.width - 8));
    var top = clamp(y, 8, Math.max(8, window.innerHeight - rect.height - 8));
    els.slideContextMenu.style.left = Math.round(left) + "px";
    els.slideContextMenu.style.top = Math.round(top) + "px";
  }

  function hideSlideContextMenu() {
    slideContextIndex = -1;
    if (els.slideContextMenu) els.slideContextMenu.hidden = true;
  }

  function updateSlideContextMenuState() {
    if (!els.slideContextMenu) return;
    var index = slideContextIndex >= 0 ? slideContextIndex : currentIndex;
    Array.prototype.forEach.call(els.slideContextMenu.querySelectorAll("[data-slide-action]"), function (button) {
      var action = button.getAttribute("data-slide-action");
      var enabled = true;
      if (action === "paste") enabled = Boolean(slideClipboard);
      if (action === "moveUp") enabled = index > 0;
      if (action === "moveDown") enabled = index < deck.slides.length - 1;
      if (action === "delete") enabled = deck.slides.length > 1;
      button.disabled = !enabled;
    });
  }

  function handleSlideContextMenuAction(event) {
    var button = event.target.closest("[data-slide-action]");
    if (!button || button.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    var action = button.getAttribute("data-slide-action");
    var index = slideContextIndex >= 0 ? slideContextIndex : currentIndex;
    if (action === "new") addSlideAfter(index, { focusThumb: true });
    if (action === "duplicate") duplicateSlideAt(index, { focusThumb: true });
    if (action === "copy") copySlideAt(index);
    if (action === "paste") pasteSlideAfter(index, { focusThumb: true });
    if (action === "moveUp") moveSlideRelative(index, -1, { focusThumb: true });
    if (action === "moveDown") moveSlideRelative(index, 1, { focusThumb: true });
    if (action === "delete") deleteSlideAt(index, { focusThumb: true });
    hideSlideContextMenu();
  }

  function handleCanvasContextMenu(event) {
    if (presenting || activeCanvasEdit) return;
    event.preventDefault();
    event.stopPropagation();
    hideTooltip();
    canvasContextPoint = canvasPointFromEvent(event);
    var target = event.target.closest("[data-canvas-edit]");
    if (target && els.stageFrame.contains(target)) {
      setCanvasSelection([target.getAttribute("data-canvas-edit")]);
      renderCanvasControls();
    } else if (!event.target.closest(".canvas-selection-box")) {
      clearCanvasSelection();
      renderCanvasControls();
    }
    showCanvasContextMenu(event.clientX, event.clientY);
  }

  function showCanvasContextMenu(x, y) {
    if (!els.canvasContextMenu) return;
    hideSlideContextMenu();
    updateCanvasContextMenuState();
    els.canvasContextMenu.hidden = false;
    els.canvasContextMenu.style.left = "0px";
    els.canvasContextMenu.style.top = "0px";
    var rect = els.canvasContextMenu.getBoundingClientRect();
    var left = clamp(x, 8, Math.max(8, window.innerWidth - rect.width - 8));
    var top = clamp(y, 8, Math.max(8, window.innerHeight - rect.height - 8));
    els.canvasContextMenu.style.left = Math.round(left) + "px";
    els.canvasContextMenu.style.top = Math.round(top) + "px";
  }

  function hideCanvasContextMenu() {
    canvasContextPoint = null;
    if (els.canvasContextMenu) els.canvasContextMenu.hidden = true;
  }

  function updateCanvasContextMenuState() {
    if (!els.canvasContextMenu) return;
    var hasSelection = Boolean(selectedCanvasPath);
    var hasObject = Boolean(selectedObjectInfo());
    var hasClipboardSource = Boolean(selectedObjectInfo() || selectedTextBoxInfo());
    var tableInfo = selectedCanvasPath ? selectedExplicitTableInfo() : null;
    var hasTable = Boolean(tableInfo);
    var tableActions = [
      "tableInsertRowAbove",
      "tableInsertRowBelow",
      "tableInsertColumnLeft",
      "tableInsertColumnRight",
      "tableDeleteRow",
      "tableDeleteColumn",
      "tableClearCell"
    ];
    Array.prototype.forEach.call(els.canvasContextMenu.querySelectorAll("[data-context-table]"), function (item) {
      item.hidden = !hasTable;
    });
    Array.prototype.forEach.call(els.canvasContextMenu.querySelectorAll("[data-context-action]"), function (button) {
      var action = button.getAttribute("data-context-action");
      var enabled = true;
      if (action === "paste") enabled = Boolean(canvasClipboard);
      if (action === "copy" || action === "duplicate") enabled = hasClipboardSource;
      if (action === "delete") enabled = hasSelection;
      if (["bringForward", "sendBackward", "bringFront", "sendBack"].indexOf(action) !== -1) enabled = hasObject;
      if (tableActions.indexOf(action) !== -1) enabled = hasTable;
      if (action === "tableClearCell") enabled = hasTable && isTableCellPath(selectedCanvasPath);
      button.disabled = !enabled;
    });
  }

  function handleCanvasContextMenuAction(event) {
    var button = event.target.closest("[data-context-action]");
    if (!button || button.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    var action = button.getAttribute("data-context-action");
    if (action === "copy") copySelectedCanvas();
    if (action === "paste") pasteCanvasClipboard(canvasContextPoint);
    if (action === "duplicate") duplicateSelectedCanvas();
    if (action === "bringForward") moveSelectedObjectLayer("forward");
    if (action === "sendBackward") moveSelectedObjectLayer("backward");
    if (action === "bringFront") moveSelectedObjectLayer("front");
    if (action === "sendBack") moveSelectedObjectLayer("back");
    if (action === "tableInsertRowAbove") mutateSelectedTable("addRowBefore");
    if (action === "tableInsertRowBelow") mutateSelectedTable("addRowAfter");
    if (action === "tableInsertColumnLeft") mutateSelectedTable("addColumnBefore");
    if (action === "tableInsertColumnRight") mutateSelectedTable("addColumnAfter");
    if (action === "tableDeleteRow") mutateSelectedTable("deleteRow");
    if (action === "tableDeleteColumn") mutateSelectedTable("deleteColumn");
    if (action === "tableClearCell") mutateSelectedTable("clearCell");
    if (action === "delete") {
      deleteSelectedCanvasContent();
    }
    hideCanvasContextMenu();
  }

  function resetSelectedCanvasOffset() {
    if (!selectedCanvasPath) return;
    if (getObjectByPath(selectedCanvasPath)) return;
    var node = canvasNodeByPath(selectedCanvasPath);
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
    if (node) {
      setCanvasOffsetStyle(node, getCanvasOffset(selectedCanvasPath));
      positionCanvasSelectionBox(node);
    }
    renderCanvasControls();
    updateButtons();
    updateFileStatus();
    schedulePersist();
  }

  function deleteSelectedTextBox() {
    var match = String(selectedCanvasPath || "").match(/^textBoxes\.(\d+)\.text$/);
    if (!match) return false;
    var slide = currentSlide();
    var index = Number(match[1]);
    if (!Array.isArray(slide.textBoxes) || !slide.textBoxes[index]) return false;

    history.push(JSON.stringify(deck));
    if (history.length > 80) history.shift();
    future = [];
    slide.textBoxes.splice(index, 1);
    remapTextBoxCanvasPaths(slide, index);
    clearCanvasSelection();
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    schedulePersist();
    return true;
  }

  function deleteSelectedObject() {
    var index = objectIndexFromPath(selectedCanvasPath);
    if (index < 0) return false;
    var slide = currentSlide();
    if (!Array.isArray(slide.objects) || !slide.objects[index]) return false;

    history.push(JSON.stringify(deck));
    if (history.length > 80) history.shift();
    future = [];
    slide.objects.splice(index, 1);
    remapObjectCanvasPaths(slide, index);
    clearCanvasSelection();
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    schedulePersist();
    return true;
  }

  function remapObjectCanvasPaths(slide, removedIndex) {
    remapObjectPathMap(slide, "canvas", removedIndex);
    remapObjectPathMap(slide, "styles", removedIndex);
  }

  function remapObjectPathMap(slide, key, removedIndex) {
    var map = slide[key] && typeof slide[key] === "object" ? slide[key] : {};
    var nextMap = {};
    Object.keys(map).forEach(function (path) {
      var match = path.match(/^objects\.(\d+)(.*)$/);
      if (!match) {
        nextMap[path] = map[path];
        return;
      }
      var index = Number(match[1]);
      if (index === removedIndex) return;
      var suffix = match[2] || "";
      var nextPath = index > removedIndex ? "objects." + (index - 1) + suffix : path;
      nextMap[nextPath] = map[path];
    });
    if (Object.keys(nextMap).length) slide[key] = nextMap;
    else delete slide[key];
  }

  function remapTextBoxCanvasPaths(slide, removedIndex) {
    remapTextBoxPathMap(slide, "canvas", removedIndex);
    remapTextBoxPathMap(slide, "styles", removedIndex);
  }

  function remapTextBoxPathMap(slide, key, removedIndex) {
    var map = slide[key] && typeof slide[key] === "object" ? slide[key] : {};
    var nextMap = {};
    Object.keys(map).forEach(function (path) {
      var match = path.match(/^textBoxes\.(\d+)\.text$/);
      if (!match) {
        nextMap[path] = map[path];
        return;
      }
      var index = Number(match[1]);
      if (index === removedIndex) return;
      var nextPath = index > removedIndex ? "textBoxes." + (index - 1) + ".text" : path;
      nextMap[nextPath] = map[path];
    });
    if (Object.keys(nextMap).length) slide[key] = nextMap;
    else delete slide[key];
  }

  function currentFrameScale() {
    if (els.stageFrame) return canvasZoom || canvasFitScale || 1;
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
    var object = getObjectByPath(path);
    if (object) {
      return {
        x: Number(object.x) || 0,
        y: Number(object.y) || 0,
        w: Math.max(0, Number(object.w) || 0),
        h: Math.max(0, Number(object.h) || 0)
      };
    }
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
    var object = getObjectByPath(path);
    if (object) {
      var nextObject = clampObjectGeometry({
        x: Number(offset.x) || 0,
        y: Number(offset.y) || 0,
        w: Math.max(44, Number(offset.w) || Number(object.w) || 44),
        h: Math.max(24, Number(offset.h) || Number(object.h) || 24)
      });
      object.x = Math.round(nextObject.x);
      object.y = Math.round(nextObject.y);
      object.w = Math.round(nextObject.w);
      object.h = Math.round(nextObject.h);
      return;
    }
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

  function clampObjectGeometry(geometry) {
    var w = Math.max(44, Number(geometry.w) || 44);
    var h = Math.max(24, Number(geometry.h) || 24);
    return {
      x: clamp(Number(geometry.x) || 0, -w + 24, PPTHtml.baseWidth - 24),
      y: clamp(Number(geometry.y) || 0, -h + 24, PPTHtml.baseHeight - 24),
      w: w,
      h: h
    };
  }

  function clampObjectInsideSlide(geometry) {
    var w = Math.min(PPTHtml.baseWidth - 64, Math.max(44, Number(geometry.w) || 44));
    var h = Math.min(PPTHtml.baseHeight - 72, Math.max(24, Number(geometry.h) || 24));
    return {
      x: clamp(Number(geometry.x) || 0, 32, PPTHtml.baseWidth - w - 32),
      y: clamp(Number(geometry.y) || 0, 36, PPTHtml.baseHeight - h - 36),
      w: w,
      h: h
    };
  }

  function textBoxIndexFromPath(path) {
    var match = String(path || "").match(/^textBoxes\.(\d+)\.text$/);
    return match ? Number(match[1]) : -1;
  }

  function objectIndexFromPath(path) {
    var match = String(path || "").match(/^objects\.(\d+)$/);
    return match ? Number(match[1]) : -1;
  }

  function objectIndexFromAnyPath(path) {
    var match = String(path || "").match(/^objects\.(\d+)(?:\.|$)/);
    return match ? Number(match[1]) : -1;
  }

  function getObjectByPath(path) {
    var index = objectIndexFromPath(path);
    var objects = currentSlide().objects;
    return index >= 0 && Array.isArray(objects) ? objects[index] : null;
  }

  function objectTypeFromPath(path) {
    var object = getObjectByPath(path);
    return object ? object.type : "";
  }

  function setObjectMediaSource(path, type, src, file) {
    var object = getObjectByPath(path);
    if (!object || object.type !== type) return false;
    object.data = object.data && typeof object.data === "object" ? object.data : {};
    object.data.src = src;
    if (type === "image" && !object.data.alt) object.data.alt = file.name.replace(/\.[^.]+$/, "");
    if ((type === "video" || type === "audio") && !object.data.caption) object.data.caption = file.name.replace(/\.[^.]+$/, "");
    setCanvasSelection([path]);
    return true;
  }

  function getTextBoxByPath(path) {
    var index = textBoxIndexFromPath(path);
    var boxes = currentSlide().textBoxes;
    return index >= 0 && Array.isArray(boxes) ? boxes[index] : null;
  }

  function foldTextBoxGeometry(path, offset) {
    var box = getTextBoxByPath(path);
    if (!box) return false;
    var dx = Number(offset && offset.x) || 0;
    var dy = Number(offset && offset.y) || 0;
    var w = Math.max(0, Number(offset && offset.w) || 0);
    var h = Math.max(0, Number(offset && offset.h) || 0);
    var width = w || Number(box.w) || 380;
    var height = h || Number(box.h) || 96;
    box.x = Math.round(clamp((Number(box.x) || 0) + dx, 0, PPTHtml.baseWidth - 40));
    box.y = Math.round(clamp((Number(box.y) || 0) + dy, 0, PPTHtml.baseHeight - 24));
    if (w) box.w = Math.round(Math.max(44, width));
    if (h) box.h = Math.round(Math.max(24, height));
    clearCanvasOffset(path);
    return true;
  }

  function clearCanvasOffset(path) {
    var slide = currentSlide();
    if (!slide.canvas || typeof slide.canvas !== "object") return;
    delete slide.canvas[path];
    if (!Object.keys(slide.canvas).length) delete slide.canvas;
  }

  function applyTextBoxGeometryStyle(node, box) {
    if (!node || !box) return;
    node.style.left = (Number(box.x) || 0) + "px";
    node.style.top = (Number(box.y) || 0) + "px";
    node.style.width = Math.max(44, Number(box.w) || 380) + "px";
    node.style.maxWidth = "";
    node.style.minHeight = Math.max(24, Number(box.h) || 96) + "px";
    node.style.transform = "";
    node.dataset.canvasX = "0";
    node.dataset.canvasY = "0";
    node.dataset.canvasW = "0";
    node.dataset.canvasH = "0";
  }

  function setCanvasOffsetStyle(node, offset) {
    var isTextBox = node.classList.contains("ppt-textbox");
    var isObject = node.classList.contains("ppt-object");
    if (isTextBox && !node.dataset.canvasBaseWidth) {
      node.dataset.canvasBaseWidth = node.style.width || "";
      node.dataset.canvasBaseMinHeight = node.style.minHeight || "";
    }
    var x = Number(offset && offset.x) || 0;
    var y = Number(offset && offset.y) || 0;
    var w = Math.max(0, Number(offset && offset.w) || 0);
    var h = Math.max(0, Number(offset && offset.h) || 0);
    node.dataset.canvasX = String(x);
    node.dataset.canvasY = String(y);
    node.dataset.canvasW = String(w);
    node.dataset.canvasH = String(h);
    if (isObject) {
      var objectGeometry = clampObjectGeometry({ x: x, y: y, w: w, h: h });
      node.style.left = Math.round(objectGeometry.x) + "px";
      node.style.top = Math.round(objectGeometry.y) + "px";
      node.style.width = Math.round(objectGeometry.w) + "px";
      node.style.height = Math.round(objectGeometry.h) + "px";
      node.style.maxWidth = "";
      node.style.minHeight = "";
      node.style.transform = "";
      node.dataset.canvasX = String(objectGeometry.x);
      node.dataset.canvasY = String(objectGeometry.y);
      node.dataset.canvasW = String(objectGeometry.w);
      node.dataset.canvasH = String(objectGeometry.h);
      return;
    }
    if (w) {
      node.style.width = w + "px";
      node.style.maxWidth = w + "px";
    } else {
      node.style.width = isTextBox ? node.dataset.canvasBaseWidth || "" : "";
      node.style.maxWidth = "";
    }
    if (h) {
      node.style.minHeight = h + "px";
    } else {
      node.style.minHeight = isTextBox ? node.dataset.canvasBaseMinHeight || "" : "";
    }
    if (!x && !y) {
      node.style.transform = "";
      if (!w && !h) {
        restoreCanvasOffsetPosition(node, isTextBox);
        node.style.zIndex = "";
      } else {
        ensureCanvasOffsetPosition(node, isTextBox);
        node.style.zIndex = "5";
      }
      return;
    }
    ensureCanvasOffsetPosition(node, isTextBox);
    node.style.zIndex = "5";
    node.style.transform = "translate(" + x + "px, " + y + "px)";
  }

  function ensureCanvasOffsetPosition(node, isTextBox) {
    if (isTextBox) return;
    if (node.dataset.canvasPositionWasStatic === "true" || window.getComputedStyle(node).position === "static") {
      node.style.position = "relative";
      node.dataset.canvasPositionWasStatic = "true";
    }
  }

  function restoreCanvasOffsetPosition(node, isTextBox) {
    if (isTextBox) return;
    if (node.dataset.canvasPositionWasStatic === "true") {
      node.style.position = "";
      delete node.dataset.canvasPositionWasStatic;
    }
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
    if (options.draggableOnly) {
      selectCanvasTarget(node);
      if (options.fileAction === "image") openImagePicker();
      else if (options.fileAction === "video") openVideoPicker();
      else if (options.fileAction === "audio") openAudioPicker();
      else toast(formatText(t("toast.componentSelected"), { name: canvasLabel(options, node.getAttribute("data-canvas-edit")) }));
      return;
    }
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

  function canvasLabel(options, path) {
    if (options && options.labelKey) return t(options.labelKey);
    return path || "";
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
    if (isTableCellPath(activeCanvasEdit.path)) {
      if (event.key === "Tab") {
        var tabPath = activeCanvasEdit.path;
        event.preventDefault();
        event.stopPropagation();
        finishCanvasEdit(true);
        focusAdjacentTableCell(tabPath, event.shiftKey ? -1 : 1);
        return;
      }
      if (event.key === "Enter" && !event.metaKey && !event.ctrlKey) {
        var enterPath = activeCanvasEdit.path;
        event.preventDefault();
        event.stopPropagation();
        finishCanvasEdit(true);
        focusVerticalTableCell(enterPath, event.shiftKey ? -1 : 1);
        return;
      }
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      finishCanvasEdit(false);
      return;
    }
    if (event.key === "Enter" && (activeCanvasEdit.options.singleLine || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.stopPropagation();
      finishCanvasEdit(true);
    }
  }

  function focusAdjacentTableCell(path, step) {
    focusTableCellAfterRender(function () {
      var nodes = tableCellEditNodes(path);
      var index = nodes.findIndex(function (node) {
        return node.getAttribute("data-canvas-edit") === path;
      });
      if (index === -1 || !nodes.length) return null;
      return nodes[clamp(index + step, 0, nodes.length - 1)];
    });
  }

  function focusVerticalTableCell(path, rowStep) {
    var parsed = parseTablePath(path);
    if (!parsed || parsed.rowIndex < 0) {
      focusAdjacentTableCell(path, rowStep > 0 ? 1 : -1);
      return;
    }
    var nextPath = tableCellPath(parsed, parsed.rowIndex + rowStep, parsed.columnIndex);
    focusTableCellAfterRender(function () {
      return canvasNodeByPath(nextPath) || canvasNodeByPath(path);
    });
  }

  function focusTableCellAfterRender(resolver) {
    window.setTimeout(function () {
      var node = resolver();
      if (!node) return;
      selectCanvasTarget(node);
      startCanvasEdit(node);
    }, 0);
  }

  function tableCellEditNodes(scopePath) {
    return Array.prototype.filter.call(els.stageFrame.querySelectorAll("[data-canvas-edit]"), function (node) {
      var path = node.getAttribute("data-canvas-edit");
      return isTableCellPath(path) && (!scopePath || sameTableScope(scopePath, path));
    });
  }

  function handleCanvasEditBlur() {
    if (activeCanvasEdit) finishCanvasEdit(true);
  }

  function commitActiveCanvasEdit() {
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
      renderCanvasControls();
      return;
    }

    var value = canvasTextValue(edit.node, edit.options);
    if (edit.options.numberValue) {
      value = numberFromText(value);
    }

    var beforeValue = getPath(currentSlide(), edit.path);
    if (String(beforeValue == null ? "" : beforeValue) === String(value == null ? "" : value)) {
      renderCanvasControls();
      return;
    }

    history.push(edit.before);
    if (history.length > 80) history.shift();
    future = [];
    setPath(currentSlide(), edit.path, value);
    if (isTableCellPath(edit.path)) fitTableObjectForPath(edit.path, { growOnly: true });
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
    if (hasCanvasDropPayload(event.dataTransfer)) els.stageViewport.classList.add("is-drop-target");
  }

  function handleCanvasDragOver(event) {
    if (!hasCanvasDropPayload(event.dataTransfer)) return;
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
    if (!hasCanvasDropPayload(event.dataTransfer)) return;
    event.preventDefault();
    els.stageViewport.classList.remove("is-drop-target");
    var componentPayload = decodeComponentPayload(event.dataTransfer.getData("application/x-htmlppt-component"));
    if (componentPayload && componentPayload.type) {
      insertComponent(componentPayload.type, {
        source: "drop",
        point: canvasPointFromEvent(event),
        variant: componentPayload.variant
      });
      return;
    }

    var imageFile = droppedFile(event.dataTransfer, "image/");
    if (imageFile) {
      pendingMediaObjectPath = insertObjectToCurrentSlide("image", "", canvasPointFromEvent(event));
      readImageFile(imageFile);
      return;
    }

    var videoFile = droppedFile(event.dataTransfer, "video/");
    if (videoFile) {
      pendingMediaObjectPath = insertObjectToCurrentSlide("video", "", canvasPointFromEvent(event));
      readVideoFile(videoFile);
      return;
    }

    var audioFile = droppedFile(event.dataTransfer, "audio/");
    if (audioFile) {
      pendingMediaObjectPath = insertObjectToCurrentSlide("audio", "", canvasPointFromEvent(event));
      readAudioFile(audioFile);
    }
  }

  function canvasPointFromEvent(event) {
    var frameRect = els.stageFrame.getBoundingClientRect();
    var scale = currentFrameScale();
    return {
      x: clamp((event.clientX - frameRect.left) / scale, 0, PPTHtml.baseWidth),
      y: clamp((event.clientY - frameRect.top) / scale, 0, PPTHtml.baseHeight)
    };
  }

  function hasImageFile(dataTransfer) {
    return hasFileType(dataTransfer, "image/");
  }

  function hasVideoFile(dataTransfer) {
    return hasFileType(dataTransfer, "video/");
  }

  function hasAudioFile(dataTransfer) {
    return hasFileType(dataTransfer, "audio/");
  }

  function hasComponentPayload(dataTransfer) {
    if (!dataTransfer || !dataTransfer.types) return false;
    return Array.prototype.indexOf.call(dataTransfer.types, "application/x-htmlppt-component") !== -1;
  }

  function hasCanvasDropPayload(dataTransfer) {
    return hasComponentPayload(dataTransfer) || hasImageFile(dataTransfer) || hasVideoFile(dataTransfer) || hasAudioFile(dataTransfer);
  }

  function hasFileType(dataTransfer, prefix) {
    if (!dataTransfer || !dataTransfer.types) return false;
    if (Array.prototype.some.call(dataTransfer.items || [], function (item) {
      return item.kind === "file" && item.type.indexOf(prefix) === 0;
    })) return true;
    return Array.prototype.some.call(dataTransfer.files || [], function (file) {
      return file.type && file.type.indexOf(prefix) === 0;
    });
  }

  function droppedFile(dataTransfer, prefix) {
    return Array.prototype.find.call(dataTransfer.files || [], function (item) {
      return item.type && item.type.indexOf(prefix) === 0;
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
    els.deckTransitionInput.value = deck.transition || "fade";
    els.slideLayoutInput.value = slide.layout;
    els.slideTransitionInput.value = slide.transition || "inherit";
    els.kickerInput.value = slide.kicker;
    els.titleInput.value = slide.title;
    els.subtitleInput.value = slide.subtitle;
    els.bodyInput.value = slide.body;
    els.imageFitInput.value = slide.image.fit || "cover";
    els.imageSrcInput.value = slide.image.src || "";
    els.imageAltInput.value = slide.image.alt || "";
    els.imageCaptionInput.value = slide.image.caption || "";
    els.videoFitInput.value = slide.video.fit || "cover";
    els.videoSrcInput.value = slide.video.src || "";
    els.videoPosterInput.value = slide.video.poster || "";
    els.videoCaptionInput.value = slide.video.caption || "";
    els.audioSrcInput.value = slide.audio.src || "";
    els.audioCaptionInput.value = slide.audio.caption || "";
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
    syncStylePanel();
    syncing = false;
  }

  function updateButtons() {
    setButtonUnavailable(els.undoBtn, !history.length);
    setButtonUnavailable(els.redoBtn, !future.length);
    setButtonUnavailable(els.downloadDeckBtn, saving);
    setButtonUnavailable(els.saveAsDeckBtn, saving);
    setButtonUnavailable(els.moveSlideUpBtn, currentIndex <= 0);
    setButtonUnavailable(els.moveSlideDownBtn, currentIndex >= deck.slides.length - 1);
    setButtonUnavailable(els.deleteSlideBtn, deck.slides.length <= 1);
  }

  function createNewDeck() {
    commitActiveCanvasEdit();
    if (!confirmDiscard()) return;
    replaceDeck(PPTHtml.createBlankDeck(), { filePath: "", dirty: true, keepHistory: false });
    toast(t("toast.newDeck"));
  }

  function createFromTemplate(templateId) {
    commitActiveCanvasEdit();
    if (!confirmDiscard()) return;
    replaceDeck(PPTHtml.createTemplateDeck(templateId), { filePath: "", dirty: true, keepHistory: false });
    els.templateDialog.close();
    toast(t("toast.templateCreated"));
  }

  function openDeck() {
    commitActiveCanvasEdit();
    if (!confirmDiscard()) return;
    if (desktop && desktop.isDesktop) {
      desktop.openDeck().then(function (result) {
        if (!result || result.canceled) return;
        loadDeckText(result.content, basename(result.filePath), result.filePath);
      }).catch(function (error) {
        alert(formatText(t("alert.openFailed"), { message: error.message }));
      });
      return;
    }
    els.fileInput.click();
  }

  function loadDeckText(text, label, filePath) {
    var nextDeck = PPTHtml.parseFileText(text);
    replaceDeck(nextDeck, { filePath: filePath || "", dirty: false, keepHistory: false });
    toastWithValidation(formatText(t("toast.opened"), { name: label || t("panel.deck") }));
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
    if (saving) return;
    commitActiveCanvasEdit();
    saving = true;
    setSaveButtonsDisabled(true);

    packageDeckAssets(deck).then(function (result) {
      deck = result.deck;
      if (result.count) {
        renderAll();
        persist();
        toast(formatText(t("toast.assetsEmbedded"), { count: result.count }));
      }

      var html = PPTHtml.exportStandalone(deck);
      var name = filenameFromTitle(deck.title);
      if (desktop && desktop.isDesktop) {
        var action = forceDialog ? desktop.saveDeckAs : desktop.saveDeck;
        return action({ filePath: currentFilePath, defaultName: name, content: html }).then(function (saveResult) {
          if (!saveResult || saveResult.canceled) {
            if (result.count) {
              dirty = true;
              updateFileStatus();
            }
            return;
          }
          currentFilePath = saveResult.filePath || currentFilePath;
          dirty = false;
          updateFileStatus();
          toast(formatText(t("toast.saved"), { name: basename(currentFilePath) }));
        });
      }

      PPTHtml.download(name, html);
      dirty = false;
      updateFileStatus();
      toast(t("toast.downloaded"));
    }).catch(function (error) {
      if (error && error.assetFailures) {
        alert(formatText(t("alert.assetPackageFailed"), { details: formatAssetFailureDetails(error.assetFailures) }));
      } else {
        alert(formatText(t("alert.saveFailed"), { message: error.message }));
      }
    }).finally(function () {
      saving = false;
      setSaveButtonsDisabled(false);
    });
  }

  function setSaveButtonsDisabled(disabled) {
    setButtonUnavailable(els.downloadDeckBtn, disabled);
    setButtonUnavailable(els.saveAsDeckBtn, disabled);
  }

  function setButtonUnavailable(button, unavailable) {
    if (!button) return;
    button.disabled = Boolean(unavailable);
    button.classList.toggle("is-disabled", Boolean(unavailable));
    button.setAttribute("aria-disabled", unavailable ? "true" : "false");
  }

  function packageDeckAssets(sourceDeck) {
    var nextDeck = PPTHtml.normalizeDeck(sourceDeck);
    var refs = PPTHtml.collectExternalAssetReferences(nextDeck);
    if (!refs.length) return Promise.resolve({ deck: nextDeck, count: 0 });

    var failures = [];
    var completed = 0;
    var chain = Promise.resolve();
    refs.forEach(function (ref) {
      chain = chain.then(function () {
        return embedAssetReference(ref).then(function (dataUrl) {
          setAssetReference(nextDeck, ref, dataUrl);
          completed += 1;
        }).catch(function (error) {
          failures.push({ ref: ref, error: error });
        });
      });
    });

    return chain.then(function () {
      if (failures.length) {
        var error = new Error("Asset packaging failed");
        error.assetFailures = failures;
        throw error;
      }
      return { deck: PPTHtml.normalizeDeck(nextDeck), count: completed };
    });
  }

  function embedAssetReference(ref) {
    if (desktop && desktop.isDesktop && typeof desktop.embedAsset === "function") {
      return desktop.embedAsset({
        src: ref.src,
        kind: ref.kind,
        path: ref.path,
        basePath: currentFilePath
      }).then(function (result) {
        if (!result || !result.src) throw new Error("Empty embedded asset");
        return result.src;
      });
    }

    return fetch(ref.src).then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.blob();
    }).then(blobToDataUrl);
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error || new Error("Unable to read asset")); };
      reader.readAsDataURL(blob);
    });
  }

  function setAssetReference(targetDeck, ref, dataUrl) {
    var slide = targetDeck.slides[ref.slideIndex];
    if (!slide) return;
    var objectMatch = ref.path.match(/\.objects\.(\d+)\.data\.(src|poster)$/);
    if (objectMatch) {
      var object = slide.objects && slide.objects[Number(objectMatch[1])];
      if (object && object.data && typeof object.data === "object") object.data[objectMatch[2]] = dataUrl;
      return;
    }
    if (ref.path.indexOf(".image.src") !== -1) slide.image.src = dataUrl;
    if (ref.path.indexOf(".video.src") !== -1) slide.video.src = dataUrl;
    if (ref.path.indexOf(".video.poster") !== -1) slide.video.poster = dataUrl;
    if (ref.path.indexOf(".audio.src") !== -1) slide.audio.src = dataUrl;
  }

  function formatAssetFailureDetails(failures) {
    return failures.map(function (failure) {
      var ref = failure.ref;
      var message = failure.error && failure.error.message ? failure.error.message : String(failure.error || "");
      return formatText(t("asset.failureLine"), {
        slide: ref.slideNumber,
        path: ref.path,
        src: compactSource(ref.src),
        message: message
      });
    }).join("\n");
  }

  function compactSource(src) {
    var value = String(src || "");
    if (value.length <= 96) return value;
    return value.slice(0, 48) + "..." + value.slice(-24);
  }

  function confirmDiscard() {
    if (!dirty) return true;
    return confirm(t("confirm.discard"));
  }

  function markDirty() {
    dirty = true;
    updateFileStatus();
  }

  function updateFileStatus() {
    if (!els.fileStatus) return;
    var source = currentFilePath ? basename(currentFilePath) : (desktop && desktop.isDesktop ? t("status.untitled") : t("status.browserDraft"));
    els.fileStatus.textContent = APP_VERSION_LABEL + " · " + source + (dirty ? " · " + t("status.unsaved") : "");
  }

  function showValidationDialog() {
    var result = PPTHtml.validateDeck(deck);
    els.validationSummary.textContent = result.ok
      ? formatText(t("validation.pass"), { count: deck.slides.length })
      : formatText(t("validation.needsFix"), { errors: result.errors.length, warnings: result.warnings.length });
    els.validationReport.value = PPTHtml.formatValidationReport(deck, result);
    els.validationDialog.showModal();
  }

  function buildRepairPrompt() {
    var result = PPTHtml.validateDeck(deck);
    var report = PPTHtml.formatValidationReport(deck, result);
    return [
      "请修复下面这份 PPT.html Studio deck。",
      "",
      "要求：",
      "- 只输出完整 deck JSON，不输出 HTML/CSS/解释文字。",
      "- 保持 version 为 \"0.1\"，aspectRatio 为 \"16:9\"。",
      "- 先修复 ERROR，再修复 WARNING。",
      "- 保留已有 id、canvas、styles、textBoxes、objects、media src 和 notes，除非它们本身就是错误来源。",
      "- 不要写临时本地文件路径；不确定的媒体 src 留空。",
      "",
      report,
      "",
      "Current deck JSON:",
      JSON.stringify(deck, null, 2)
    ].join("\n");
  }

  function toastWithValidation(prefix) {
    var result = PPTHtml.validateDeck(deck);
    if (result.errors.length) {
      toast(formatText(t("toast.validationErrors"), { prefix: prefix, count: result.errors.length }));
    } else if (result.warnings.length) {
      toast(formatText(t("toast.validationWarnings"), { prefix: prefix, count: result.warnings.length }));
    } else {
      toast(formatText(t("toast.validationPassed"), { prefix: prefix }));
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
    var availableWidth = viewport.clientWidth - 16;
    var availableHeight = viewport.clientHeight - 16;
    var scale = Math.min(availableWidth / PPTHtml.baseWidth, availableHeight / PPTHtml.baseHeight);
    scale = Math.max(0.1, Math.min(scale, 1.3));
    canvasFitScale = scale;
    if (canvasZoomMode === "fit") {
      canvasZoom = scale;
      canvasPanX = 0;
      canvasPanY = 0;
    } else {
      canvasZoom = clamp(canvasZoom || scale, 0.18, 2.5);
      clampCanvasPan();
    }
    applyCanvasFrameTransform();
  }

  function fitPresentationFrame(frame, viewport) {
    if (!frame || !viewport) return;
    var portraitTouch = viewport.clientWidth <= 720 && viewport.clientHeight > viewport.clientWidth;
    var fill = presenterScaleMode === "fill" && !portraitTouch;
    var scale = (fill ? Math.max : Math.min)(viewport.clientWidth / PPTHtml.baseWidth, viewport.clientHeight / PPTHtml.baseHeight);
    scale = Math.max(0.1, scale);
    frame.style.width = PPTHtml.baseWidth + "px";
    frame.style.height = PPTHtml.baseHeight + "px";
    frame.style.transform = "translate(-50%, -50%) scale(" + scale + ")";
    frame.dataset.scaleMode = fill ? "fill" : "fit";
    if (els.presenter) els.presenter.classList.toggle("is-fill-mode", fill);
    updatePresenterFitButton();
  }

  function togglePresenterScaleMode() {
    presenterScaleMode = presenterScaleMode === "fill" ? "fit" : "fill";
    fitPresentationFrame(els.presenterStage, els.presenter);
    showPresenterChrome();
  }

  function updatePresenterFitButton() {
    if (!els.presentFitLabel || !els.presentFitBtn) return;
    var isFill = presenterScaleMode === "fill";
    els.presentFitLabel.textContent = isFill ? t("present.fitFill") : t("present.fitContain");
    els.presentFitBtn.setAttribute("aria-pressed", isFill ? "true" : "false");
    setTooltip(els.presentFitBtn, t("present.fitMode"));
  }

  function showShortcutDialog() {
    if (!els.shortcutDialog) return;
    hideCanvasContextMenu();
    hideSlideContextMenu();
    hideTooltip();
    els.shortcutDialog.showModal();
  }

  function syncPresenterBackdrop() {
    var slideNode = els.presenterStage && (
      els.presenterStage.querySelector(".ppt-slide.is-entering")
      || els.presenterStage.querySelector(".ppt-slide.is-current")
      || els.presenterStage.querySelector(".ppt-slide")
    );
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
    window.clearTimeout(presenterClickTimer);
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

  function handlePresenterPointerMove(event) {
    if (isTouchPortraitPresenterEvent(event)) return;
    showPresenterChrome();
  }

  function handlePresenterPointerDown(event) {
    if (!presenting) return;
    if (event && event.target && event.target.closest(".presenter-controls")) {
      showPresenterChrome();
      return;
    }
    if (isTouchPortraitPresenterEvent(event)) {
      suppressNextPresenterClick = true;
      togglePresenterChrome();
      return;
    }
    showPresenterChrome();
  }

  function handlePresenterClick(event) {
    if (!presenting) return;
    if (event.target.closest(".presenter-controls, video, audio, a, button")) return;
    if (suppressNextPresenterClick) {
      suppressNextPresenterClick = false;
      return;
    }
    window.clearTimeout(presenterClickTimer);
    presenterClickTimer = window.setTimeout(function () {
      if (presenting) showPresentationSlide(presentIndex + 1);
    }, 180);
  }

  function isTouchPortraitPresenterEvent(event) {
    return event
      && event.pointerType === "touch"
      && (window.matchMedia
        ? window.matchMedia("(orientation: portrait)").matches
        : window.innerHeight >= window.innerWidth);
  }

  function togglePresenterChrome() {
    if (!presenting) return;
    if (els.presenter.classList.contains("is-ui-hidden")) showPresenterChrome();
    else hidePresenterChrome();
  }

  function hidePresenterChrome() {
    if (!presenting) return;
    window.clearTimeout(presenterUiTimer);
    els.presenter.classList.add("is-ui-hidden");
  }

  function showPresenterChrome() {
    if (!presenting) return;
    window.clearTimeout(presenterUiTimer);
    els.presenter.classList.remove("is-ui-hidden");
    presenterUiTimer = window.setTimeout(function () {
      if (presenting) els.presenter.classList.add("is-ui-hidden");
    }, 1800);
  }

  function setPresenterBlankMode(mode) {
    presenterBlankMode = presenterBlankMode === mode ? "" : mode;
    els.presenter.classList.toggle("is-blank-black", presenterBlankMode === "black");
    els.presenter.classList.toggle("is-blank-white", presenterBlankMode === "white");
  }

  function clearPresenterJumpBuffer() {
    presenterJumpBuffer = "";
    window.clearTimeout(presenterJumpTimer);
  }

  function appendPresenterJumpDigit(digit) {
    presenterJumpBuffer = (presenterJumpBuffer + digit).slice(-3);
    window.clearTimeout(presenterJumpTimer);
    presenterJumpTimer = window.setTimeout(clearPresenterJumpBuffer, 1800);
  }

  function jumpPresenterFromBuffer() {
    var page = Number(presenterJumpBuffer);
    clearPresenterJumpBuffer();
    if (!isFinite(page) || page < 1) return false;
    showPresentationSlide(page - 1);
    return true;
  }

  function handleDocumentFullscreenChange() {
    if (!presenting) return;
    if (!document.fullscreenElement && presenterFullscreenActive) {
      closePresenter({ skipFullscreenExit: true });
    }
  }

  function openPresenter(index) {
    commitActiveCanvasEdit();
    presenting = true;
    presentIndex = index || 0;
    presenterBlankMode = "";
    clearPresenterJumpBuffer();
    els.presenter.classList.remove("is-blank-black", "is-blank-white");
    els.presenter.hidden = false;
    showPresentationSlide(presentIndex, { instant: true });
    document.body.classList.add("is-presenting");
    hidePresenterChrome();
    requestPresenterFullscreen();
  }

  function showPresentationSlide(index, options) {
    var settings = options || {};
    var previousIndex = presentIndex;
    var nextIndex = clamp(index, 0, deck.slides.length - 1);
    var oldSlide = els.presenterStage.querySelector(".ppt-slide.is-current") || els.presenterStage.querySelector(".ppt-slide");
    var direction = nextIndex >= previousIndex ? "forward" : "backward";
    var transition = effectiveSlideTransition(deck.slides[nextIndex]);
    var shouldAnimate = !settings.instant && oldSlide && nextIndex !== previousIndex && transition !== "none" && !prefersReducedMotion();

    window.clearTimeout(presenterTransitionTimer);
    presentIndex = nextIndex;
    els.presenterStage.classList.remove("is-transitioning", "is-animating");
    els.presenterStage.removeAttribute("data-transition");
    els.presenterStage.removeAttribute("data-direction");

    var newSlide = PPTHtml.renderSlide(deck.slides[presentIndex], deck, { index: presentIndex });
    newSlide.classList.add("is-current");

    if (!shouldAnimate) {
      els.presenterStage.innerHTML = "";
      els.presenterStage.appendChild(newSlide);
    } else {
      oldSlide.classList.remove("is-current", "is-entering");
      oldSlide.classList.add("is-exiting");
      newSlide.classList.add("is-entering");
      els.presenterStage.dataset.transition = transition;
      els.presenterStage.dataset.direction = direction;
      els.presenterStage.classList.add("is-transitioning");
      els.presenterStage.appendChild(newSlide);
      window.requestAnimationFrame(function () {
        els.presenterStage.classList.add("is-animating");
      });
      presenterTransitionTimer = window.setTimeout(function () {
        els.presenterStage.innerHTML = "";
        newSlide.classList.remove("is-entering", "is-exiting");
        newSlide.classList.add("is-current");
        els.presenterStage.appendChild(newSlide);
        els.presenterStage.classList.remove("is-transitioning", "is-animating");
        els.presenterStage.removeAttribute("data-transition");
        els.presenterStage.removeAttribute("data-direction");
      }, 420);
    }

    els.presentCounter.textContent = (presentIndex + 1) + " / " + deck.slides.length;
    fitPresentationFrame(els.presenterStage, els.presenter);
    syncPresenterBackdrop();
  }

  function effectiveSlideTransition(slide) {
    var transition = slide && slide.transition && slide.transition !== "inherit" ? slide.transition : deck.transition;
    return PPTHtml.transitions.indexOf(transition) !== -1 ? transition : "fade";
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function closePresenter(options) {
    var settings = options || {};
    presenting = false;
    window.clearTimeout(presenterUiTimer);
    window.clearTimeout(presenterTransitionTimer);
    window.clearTimeout(presenterClickTimer);
    suppressNextPresenterClick = false;
    clearPresenterJumpBuffer();
    els.presenter.hidden = true;
    presenterBlankMode = "";
    els.presenter.classList.remove("is-ui-hidden", "is-blank-black", "is-blank-white");
    els.presenterStage.classList.remove("is-transitioning", "is-animating");
    els.presenterStage.innerHTML = "";
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
    return PPTHtml.normalizeDeck(PPTHtml.createBlankDeck());
  }

  function persist() {
    if (persistTimer) {
      window.clearTimeout(persistTimer);
      persistTimer = 0;
    }
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
    return String(text || "").split(/\n+/).map(splitTableCells).filter(function (row) {
      return row.some(function (cell) { return cell !== ""; });
    });
  }

  function stringifyTableRows(rows) {
    return (rows || []).map(function (row) {
      return row.join(" | ");
    }).join("\n");
  }

  function asTextCells(values) {
    return Array.isArray(values) ? values.map(function (value) { return String(value == null ? "" : value); }) : [];
  }

  function splitCells(line) {
    return String(line || "").split("|").map(function (cell) {
      return cell.trim();
    }).filter(Boolean);
  }

  function splitTableCells(line) {
    var value = String(line || "");
    var delimiter = value.indexOf("\t") !== -1 ? "\t" : "|";
    return value.split(delimiter).map(function (cell) {
      return cell.trim();
    });
  }

  function layoutLabel(value) {
    var found = PPTHtml.layouts.find(function (item) { return item[0] === value; });
    return found ? t("layout." + found[0]) : value;
  }

  function filenameFromTitle(title) {
    var safe = String(title || "deck").trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-");
    return (safe || "deck") + ".ppt.html";
  }

  function basename(filePath) {
    return String(filePath || "").split(/[\\/]/).pop() || t("status.untitled");
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
