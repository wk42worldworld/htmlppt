(function () {
  "use strict";

  var STORAGE_KEY = "ppt-html-studio-draft-v01";
  var LANG_STORAGE_KEY = "ppt-html-studio-lang-v01";
  var APP_VERSION_LABEL = "v0.2.10";
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
  var presenterUiTimer = 0;
  var presenterTransitionTimer = 0;
  var presenterFullscreenActive = false;
  var pendingMediaInsertType = "";
  var liveRenderFrame = 0;
  var pendingLiveCanvas = false;
  var pendingLiveSlideList = false;
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
      "action.present": "演示",
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
      "rail.pages": "页面",
      "rail.addSlide": "添加页面",
      "rail.duplicate": "复制页面",
      "rail.moveUp": "上移",
      "rail.moveDown": "下移",
      "rail.delete": "删除",
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
      "insert.image.title": "插入图片，或拖到画布创建图片页",
      "insert.video.title": "插入视频，或拖到画布创建视频页",
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
      "dialog.validation": "质量检查",
      "dialog.close": "关闭",
      "dialog.cancel": "取消",
      "dialog.copyJson": "复制当前 JSON",
      "dialog.loadJson": "从文本载入",
      "dialog.copyReport": "复制报告",
      "template.aiCamera.name": "AI 导演相机",
      "template.aiCamera.desc": "产品发布 demo，适合展示一个新想法。",
      "template.productPitch.name": "产品发布",
      "template.productPitch.desc": "问题、方案、价值和下一步。",
      "template.lesson.name": "课程课件",
      "template.lesson.desc": "学习目标、概念、练习和课后任务。",
      "template.projectUpdate.name": "项目汇报",
      "template.projectUpdate.desc": "状态、风险、决策和里程碑。",
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
      "canvas.image": "图片",
      "canvas.video": "视频",
      "canvas.chart": "图表",
      "canvas.table": "表格",
      "canvas.cards": "卡片组",
      "canvas.metrics": "数据组",
      "canvas.timeline": "时间线",
      "canvas.textBox": "文本框",
      "canvas.reset": "重置",
      "canvas.resetTitle": "重置这个元素的位置和尺寸",
      "canvas.resize": "拖拽调整尺寸",
      "tooltip.slideThumb": "第 {number} 页：{title} · {layout}",
      "toast.languageChanged": "语言已切换",
      "toast.imageAdded": "图片已加入当前页面",
      "toast.videoAdded": "视频已加入当前页面",
      "toast.componentInserted": "已插入{name}",
      "toast.componentSelected": "已选中{name}，可以拖拽或调整尺寸",
      "toast.jsonCopied": "JSON 已复制",
      "toast.jsonLoaded": "JSON 已载入",
      "toast.reportCopied": "检查报告已复制",
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
      "confirm.deleteSlide": "删除当前页面？",
      "confirm.discard": "当前文稿有未保存修改。继续会丢失这些修改。",
      "validation.pass": "检查通过：{count} 页，可正常分享。",
      "validation.needsFix": "需要修复：{errors} 个错误，{warnings} 个警告。",
      "sample.newSlideTitle": "新页面",
      "sample.newSlideSubtitle": "在右侧面板编辑内容",
      "sample.textTitle": "新的文本页",
      "sample.textBody": "双击文字可以直接编辑；拖拽文字块可以移动位置。",
      "sample.textBox": "新文本框",
      "sample.point1": "第一个要点",
      "sample.point2": "第二个要点",
      "sample.imageTitle": "图片展示",
      "sample.imageCaption": "双击图片可替换本地文件",
      "sample.videoTitle": "视频展示",
      "sample.videoCaption": "双击视频可替换本地文件",
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
      "sample.card3Title": "可编辑",
      "sample.card3Text": "AI 和人类都能继续修改。",
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
    "action.present": "Present",
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
    "rail.moveUp": "Move up",
    "rail.moveDown": "Move down",
    "rail.delete": "Delete",
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
    "insert.image.title": "Insert an image, or drag to the canvas",
    "insert.video.title": "Insert a video, or drag to the canvas",
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
    "dialog.validation": "Quality Check",
    "dialog.close": "Close",
    "dialog.cancel": "Cancel",
    "dialog.copyJson": "Copy JSON",
    "dialog.loadJson": "Load From Text",
    "dialog.copyReport": "Copy Report",
    "template.aiCamera.name": "AI Director Camera",
    "template.aiCamera.desc": "Product launch demo for presenting a new idea.",
    "template.productPitch.name": "Product Pitch",
    "template.productPitch.desc": "Problem, solution, value, and next step.",
    "template.lesson.name": "Lesson Deck",
    "template.lesson.desc": "Goals, concepts, practice, and homework.",
    "template.projectUpdate.name": "Project Update",
    "template.projectUpdate.desc": "Status, risks, decisions, and milestones.",
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
    "canvas.image": "Image",
    "canvas.video": "Video",
    "canvas.chart": "Chart",
    "canvas.table": "Table",
    "canvas.cards": "Cards",
    "canvas.metrics": "Metrics",
    "canvas.timeline": "Timeline",
    "canvas.textBox": "Text box",
    "canvas.reset": "Reset",
    "canvas.resetTitle": "Reset this element position and size",
    "canvas.resize": "Drag to resize",
    "tooltip.slideThumb": "Slide {number}: {title} · {layout}",
    "toast.languageChanged": "Language changed",
    "toast.imageAdded": "Image added to this slide",
    "toast.videoAdded": "Video added to this slide",
    "toast.componentInserted": "Inserted {name}",
    "toast.componentSelected": "{name} selected. Drag or resize it.",
    "toast.jsonCopied": "JSON copied",
    "toast.jsonLoaded": "JSON loaded",
    "toast.reportCopied": "Report copied",
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
    "sample.newSlideSubtitle": "Edit content in the right panel",
    "sample.textTitle": "New Text Slide",
    "sample.textBody": "Double-click text to edit it directly; drag text blocks to move them.",
    "sample.textBox": "New text box",
    "sample.point1": "First point",
    "sample.point2": "Second point",
    "sample.imageTitle": "Image Showcase",
    "sample.imageCaption": "Double-click the image to replace it",
    "sample.videoTitle": "Video Showcase",
    "sample.videoCaption": "Double-click the video to replace it",
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
    "sample.card3Title": "Editable",
    "sample.card3Text": "Both AI and humans can keep editing.",
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
    "action.present": "発表",
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
    "rail.moveUp": "上へ",
    "rail.moveDown": "下へ",
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
    "insert.image.title": "画像を挿入、またはキャンバスへドラッグ",
    "insert.video.title": "動画を挿入、またはキャンバスへドラッグ",
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
    "dialog.validation": "品質チェック",
    "dialog.close": "閉じる",
    "dialog.cancel": "キャンセル",
    "dialog.copyJson": "JSON をコピー",
    "dialog.loadJson": "テキストから読み込み",
    "dialog.copyReport": "レポートをコピー",
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
    "canvas.reset": "リセット",
    "canvas.resetTitle": "この要素の位置とサイズをリセット",
    "canvas.resize": "ドラッグしてサイズ変更",
    "tooltip.slideThumb": "{number} 枚目: {title} · {layout}",
    "toast.languageChanged": "言語を変更しました",
    "toast.imageAdded": "画像を追加しました",
    "toast.videoAdded": "動画を追加しました",
    "toast.componentInserted": "{name}を挿入しました",
    "toast.componentSelected": "{name}を選択しました。ドラッグやサイズ変更ができます。",
    "toast.jsonCopied": "JSON をコピーしました",
    "toast.jsonLoaded": "JSON を読み込みました",
    "toast.reportCopied": "レポートをコピーしました",
    "confirm.keepOneSlide": "少なくとも1枚のスライドが必要です。",
    "confirm.deleteSlide": "現在のスライドを削除しますか？",
    "confirm.discard": "未保存の変更があります。続行すると破棄されます。",
    "validation.pass": "チェック完了: {count} 枚、共有できます。",
    "validation.needsFix": "修正が必要: エラー {errors} 件、警告 {warnings} 件。",
    "sample.newSlideTitle": "新しいスライド",
    "sample.newSlideSubtitle": "右側パネルで内容を編集",
    "sample.textTitle": "新しいテキストスライド",
    "sample.textBody": "文字をダブルクリックして編集し、ドラッグして位置を調整できます。",
    "sample.imageTitle": "画像表示",
    "sample.imageCaption": "画像をダブルクリックして差し替え",
    "sample.videoTitle": "動画表示",
    "sample.videoCaption": "動画をダブルクリックして差し替え",
    "sample.chartTitle": "四半期成長",
    "sample.revenue": "売上",
    "sample.cost": "コスト",
    "sample.tableTitle": "プロジェクト表",
    "sample.cardsTitle": "3つの要点",
    "sample.metricsTitle": "主要指標",
    "sample.timelineTitle": "実行手順",
    "sample.quoteText": "良いプレゼンは情報を詰め込むのではなく、聞き手が考えを追えるようにします。",
    "sample.codeTitle": "コード例"
  });

  extendLang("ko-KR", {
    "action.new": "새로 만들기",
    "action.templates": "템플릿",
    "action.open": "열기",
    "action.save": "저장 / 다운로드",
    "action.saveDesktop": "저장",
    "action.saveAs": "다른 이름 저장",
    "action.validate": "검사",
    "action.present": "발표",
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
    "rail.moveUp": "위로",
    "rail.moveDown": "아래로",
    "rail.delete": "삭제",
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
    "insert.image.title": "이미지를 삽입하거나 캔버스로 드래그",
    "insert.video.title": "비디오를 삽입하거나 캔버스로 드래그",
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
    "dialog.validation": "품질 검사",
    "dialog.close": "닫기",
    "dialog.cancel": "취소",
    "dialog.copyJson": "JSON 복사",
    "dialog.loadJson": "텍스트에서 불러오기",
    "dialog.copyReport": "보고서 복사",
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
    "canvas.reset": "초기화",
    "canvas.resetTitle": "이 요소의 위치와 크기를 초기화",
    "canvas.resize": "드래그하여 크기 조절",
    "tooltip.slideThumb": "{number}번 슬라이드: {title} · {layout}",
    "toast.languageChanged": "언어가 변경되었습니다",
    "toast.imageAdded": "이미지가 추가되었습니다",
    "toast.videoAdded": "비디오가 추가되었습니다",
    "toast.componentInserted": "{name} 삽입됨",
    "toast.componentSelected": "{name} 선택됨. 드래그하거나 크기를 조절하세요.",
    "toast.jsonCopied": "JSON 복사됨",
    "toast.jsonLoaded": "JSON 불러옴",
    "toast.reportCopied": "보고서 복사됨",
    "confirm.keepOneSlide": "슬라이드는 최소 1장이 필요합니다.",
    "confirm.deleteSlide": "현재 슬라이드를 삭제할까요?",
    "confirm.discard": "저장하지 않은 변경 사항이 있습니다. 계속하면 버려집니다.",
    "validation.pass": "검사 통과: {count}장, 공유할 수 있습니다.",
    "validation.needsFix": "수정 필요: 오류 {errors}개, 경고 {warnings}개.",
    "sample.newSlideTitle": "새 슬라이드",
    "sample.newSlideSubtitle": "오른쪽 패널에서 내용을 편집하세요",
    "sample.textTitle": "새 텍스트 슬라이드",
    "sample.textBody": "텍스트를 더블 클릭해 직접 편집하고 드래그해 위치를 옮길 수 있습니다.",
    "sample.imageTitle": "이미지 쇼케이스",
    "sample.imageCaption": "이미지를 더블 클릭해 교체",
    "sample.videoTitle": "비디오 쇼케이스",
    "sample.videoCaption": "비디오를 더블 클릭해 교체",
    "sample.chartTitle": "분기 성장",
    "sample.revenue": "매출",
    "sample.cost": "비용",
    "sample.tableTitle": "프로젝트 표",
    "sample.cardsTitle": "세 가지 핵심",
    "sample.metricsTitle": "핵심 지표",
    "sample.timelineTitle": "실행 단계",
    "sample.quoteText": "좋은 발표는 내용을 가득 채우는 것이 아니라 청중이 생각을 따라오게 합니다.",
    "sample.codeTitle": "코드 예시"
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
    "insert.audio.title": "插入音频，或拖到画布创建音频页",
    "panel.audio": "音频",
    "field.audioSrc": "音频 URL 或 Data URI",
    "layout.audio": "音频",
    "canvas.audio": "音频",
    "toast.audioAdded": "音频已加入当前页面",
    "toast.assetsEmbedded": "已将 {count} 个外部资源打包进单文件",
    "alert.assetPackageFailed": "保存前需要把所有资源打包进单文件，但以下资源读取失败：\n{details}\n请选择本地文件，或换成可访问的 URL。",
    "asset.failureLine": "第 {slide} 页 {path}: {src} ({message})",
    "sample.audioTitle": "音频播放",
    "sample.audioCaption": "双击音频可替换本地文件"
  });

  Object.assign(I18N["en-US"], {
    "action.pickAudio": "Choose Audio",
    "insert.audio": "Audio",
    "insert.audio.title": "Insert audio, or drag to the canvas",
    "panel.audio": "Audio",
    "field.audioSrc": "Audio URL or Data URI",
    "layout.audio": "Audio",
    "canvas.audio": "Audio",
    "toast.audioAdded": "Audio added to this slide",
    "toast.assetsEmbedded": "{count} external assets embedded into the single file",
    "alert.assetPackageFailed": "Saving requires every asset to be embedded in the single file, but these assets could not be read:\n{details}\nChoose local files or use reachable URLs.",
    "asset.failureLine": "Slide {slide} {path}: {src} ({message})",
    "sample.audioTitle": "Audio Playback",
    "sample.audioCaption": "Double-click the audio block to replace it"
  });

  Object.assign(I18N["ja-JP"], {
    "action.pickAudio": "音声を選択",
    "insert.audio": "音声",
    "insert.audio.title": "音声を挿入、またはキャンバスへドラッグ",
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
    "sample.audioCaption": "音声をダブルクリックして差し替え",
    "sample.textBox": "新しいテキストボックス"
  });

  Object.assign(I18N["ko-KR"], {
    "action.pickAudio": "오디오 선택",
    "insert.audio": "오디오",
    "insert.audio.title": "오디오를 삽입하거나 캔버스로 드래그",
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
    "sample.audioCaption": "오디오 블록을 더블 클릭해 교체",
    "sample.textBox": "새 텍스트 상자"
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
    "sample.feature3Text": "用户可以直接双击、拖拽、缩放常见元素。",
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
    "sample.feature3Text": "Double-click, drag, and resize common slide elements.",
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
    "sample.feature3Text": "文字や要素を直接編集、移動、サイズ変更できます。",
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
    "sample.feature3Text": "요소를 직접 편집하고 이동하며 크기를 조절합니다.",
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
      "stylePanel", "styleTargetLabel", "styleFontSizeInput", "styleAlignInput", "styleBoldBtn", "styleItalicBtn", "styleColorInput", "styleColorResetBtn",
      "styleBackgroundInput", "styleBackgroundResetBtn", "styleBorderColorInput", "styleBorderColorResetBtn", "styleBorderWidthInput", "styleRadiusInput", "styleOpacityInput", "styleResetBtn",
      "imageFileBtn", "imageFitInput", "imageSrcInput", "imageAltInput", "imageCaptionInput", "itemsInput", "leftTitleInput", "leftTextInput", "rightTitleInput", "rightTextInput",
      "videoFileBtn", "videoFitInput", "videoSrcInput", "videoPosterInput", "videoCaptionInput",
      "audioFileBtn", "audioSrcInput", "audioCaptionInput",
      "cardsInput", "metricsInput", "chartKindInput", "chartLabelsInput", "chartSeriesInput", "chartUnitInput", "tableColumnsInput", "tableRowsInput", "quoteInput", "authorInput", "codeInput", "notesInput",
      "presenter", "presenterStage", "presentPrevBtn", "presentCounter", "presentNextBtn", "presentExitBtn",
      "jsonDialog", "jsonTextarea", "copyJsonBtn", "loadJsonBtn",
      "templateDialog", "validationDialog", "validationSummary", "validationReport", "copyValidationBtn", "toast"
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
    return (I18N[lang] && I18N[lang][key]) || I18N["zh-CN"][key] || key;
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

    populateLayoutSelect();
    refreshTooltips();
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
        if (command === "presentFromStart") openPresenter(0);
        if (command === "present") openPresenter(currentIndex);
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

    els.stageFrame.addEventListener("pointerdown", handleCanvasPointerDown);
    els.stageFrame.addEventListener("dblclick", handleCanvasDblClick);
    els.stageViewport.addEventListener("pointerdown", handleCanvasViewportPointerDown);
    els.stageViewport.addEventListener("dragover", handleCanvasDragOver);
    els.stageViewport.addEventListener("dragenter", handleCanvasDragEnter);
    els.stageViewport.addEventListener("dragleave", handleCanvasDragLeave);
    els.stageViewport.addEventListener("drop", handleCanvasDrop);

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

    els.addSlideBtn.addEventListener("click", function () {
      commit(function () {
        deck.slides.splice(currentIndex + 1, 0, PPTHtml.normalizeSlide({
          id: PPTHtml.uid("slide"),
          layout: "text",
          kicker: "New Slide",
          title: t("sample.newSlideTitle"),
          subtitle: t("sample.newSlideSubtitle")
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
        alert(t("confirm.keepOneSlide"));
        return;
      }
      if (!confirm(t("confirm.deleteSlide"))) return;
      commit(function () {
        deck.slides.splice(currentIndex, 1);
        currentIndex = Math.max(0, currentIndex - 1);
      });
    });

    els.undoBtn.addEventListener("click", undo);
    els.redoBtn.addEventListener("click", redo);

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
    bindSlideInput(els.tableColumnsInput, function (slide, value) { slide.table.columns = splitCells(value); });
    bindSlideInput(els.tableRowsInput, function (slide, value) { slide.table.rows = parseTableRows(value); });
    bindSlideInput(els.quoteInput, function (slide, value) { slide.quote = value; });
    bindSlideInput(els.authorInput, function (slide, value) { slide.author = value; });
    bindSlideInput(els.codeInput, function (slide, value) { slide.code = value; });
    bindSlideInput(els.notesInput, function (slide, value) { slide.notes = value; });

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

    els.imageFileBtn.addEventListener("click", function () {
      openImagePicker();
    });

    els.imageFileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        pendingMediaInsertType = "";
        return;
      }
      readImageFile(file);
      event.target.value = "";
    });

    els.videoFileBtn.addEventListener("click", function () {
      openVideoPicker();
    });

    els.videoFileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) {
        pendingMediaInsertType = "";
        return;
      }
      readVideoFile(file);
      event.target.value = "";
    });

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
        pendingMediaInsertType = "";
        return;
      }
      readAudioFile(file);
      event.target.value = "";
    });

    bindSlideInput(els.audioSrcInput, function (slide, value) { slide.audio.src = value; });
    bindSlideInput(els.audioCaptionInput, function (slide, value) { slide.audio.caption = value; });

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

  function readImageFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var createSlide = pendingMediaInsertType === "image";
      pendingMediaInsertType = "";
      commit(function () {
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
      var createSlide = pendingMediaInsertType === "video";
      pendingMediaInsertType = "";
      commit(function () {
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
      var createSlide = pendingMediaInsertType === "audio";
      pendingMediaInsertType = "";
      commit(function () {
        var slide = createSlide ? createComponentSlide() : currentSlide();
        slide.layout = "audio";
        slide.audio.src = reader.result;
        if (!slide.audio.caption) slide.audio.caption = file.name.replace(/\.[^.]+$/, "");
      });
      toast(t("toast.audioAdded"));
    };
    reader.readAsDataURL(file);
  }

  function openImagePicker(insertType) {
    pendingMediaInsertType = insertType === "component" ? "image" : "";
    els.imageFileInput.click();
  }

  function openVideoPicker(insertType) {
    pendingMediaInsertType = insertType === "component" ? "video" : "";
    els.videoFileInput.click();
  }

  function openAudioPicker(insertType) {
    pendingMediaInsertType = insertType === "component" ? "audio" : "";
    els.audioFileInput.click();
  }

  function insertComponent(type, options) {
    var settings = options || {};
    var variant = settings.variant || "";
    if (type === "text") {
      var nextPath = "";
      commit(function () {
        nextPath = addTextBoxToSlide(currentSlide(), settings.point);
        selectedCanvasPath = nextPath;
      });
      toast(formatText(t("toast.componentInserted"), { name: insertLabel(type, variant) }));
      window.setTimeout(function () {
        var node = canvasNodeByPath(nextPath);
        if (node) startCanvasEdit(node);
      }, 0);
      return;
    }
    if (type === "image" && settings.source === "click") {
      insertMediaPlaceholder("image");
      openImagePicker();
      return;
    }
    if (type === "video" && settings.source === "click") {
      insertMediaPlaceholder("video");
      openVideoPicker();
      return;
    }
    if (type === "audio" && settings.source === "click") {
      insertMediaPlaceholder("audio");
      openAudioPicker();
      return;
    }

    commit(function () {
      var targetSlide = currentSlide();
      if (shouldCreateComponentSlide(type)) {
        targetSlide = createComponentSlide();
      }
      applyComponentToSlide(targetSlide, type, variant);
      selectedCanvasPath = "";
    });
    toast(formatText(t("toast.componentInserted"), { name: insertLabel(type, variant) }));
  }

  function shouldCreateComponentSlide(type) {
    return ["image", "video", "audio", "compare", "chart", "table", "cards", "metrics", "timeline", "quote", "code"].indexOf(type) !== -1;
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
      selectedCanvasPath = "";
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
      slide.image.caption = slide.image.caption || t("sample.imageCaption");
      return;
    }
    if (type === "video") {
      slide.layout = "video";
      if (shouldUseSampleTitle(slide)) slide.title = t("sample.videoTitle");
      slide.video = slide.video || {};
      slide.video.caption = slide.video.caption || t("sample.videoCaption");
      slide.video.fit = slide.video.fit || "cover";
      return;
    }
    if (type === "audio") {
      slide.layout = "audio";
      if (shouldUseSampleTitle(slide)) slide.title = t("sample.audioTitle");
      slide.audio = slide.audio || {};
      slide.audio.caption = slide.audio.caption || t("sample.audioCaption");
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

  function addTextBoxToSlide(slide, point) {
    slide.textBoxes = Array.isArray(slide.textBoxes) ? slide.textBoxes : [];
    var index = slide.textBoxes.length;
    var width = 380;
    var height = 96;
    var x = point && isFinite(point.x) ? point.x - 190 : 730 + (index % 3) * 28;
    var y = point && isFinite(point.y) ? point.y - 48 : 430 + (index % 4) * 30;
    x = clamp(x, 40, PPTHtml.baseWidth - width - 40);
    y = clamp(y, 40, PPTHtml.baseHeight - height - 40);
    slide.textBoxes.push({
      id: PPTHtml.uid("textbox"),
      text: t("sample.textBox"),
      x: Math.round(x),
      y: Math.round(y),
      w: width,
      h: height
    });
    return "textBoxes." + index + ".text";
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

    if (key === "F5") {
      event.preventDefault();
      commitActiveCanvasEdit();
      openPresenter(event.shiftKey ? currentIndex : 0);
      return;
    }

    if (commandKey && key === "Enter") {
      event.preventDefault();
      commitActiveCanvasEdit();
      openPresenter(currentIndex);
      return;
    }

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
    if (prop === "textAlign") return ["left", "center", "right", "justify"].indexOf(rawValue) !== -1 ? rawValue : "";
    if (options.number) {
      if (rawValue === "") return null;
      var number = Number(rawValue);
      if (!isFinite(number)) return null;
      return Math.round(clamp(number, options.min, options.max) * 100) / 100;
    }
    return normalizeStyleColor(rawValue);
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
    selectedCanvasPath = "";
    markDirty();
    renderAll();
    persist();
  }

  function redo() {
    if (!future.length) return;
    history.push(JSON.stringify(deck));
    deck = PPTHtml.normalizeDeck(JSON.parse(future.pop()));
    currentIndex = clamp(currentIndex, 0, deck.slides.length - 1);
    selectedCanvasPath = "";
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
      button.innerHTML = "<span>" + (index + 1) + "</span><strong></strong><small></small>";
      button.draggable = true;
      button.querySelector("strong").textContent = slide.title || t("slide.untitled");
      button.querySelector("small").textContent = layoutLabel(slide.layout);
      setTooltip(button, formatText(t("tooltip.slideThumb"), {
        number: index + 1,
        title: slide.title || t("slide.untitled"),
        layout: layoutLabel(slide.layout)
      }));
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
    bindCanvasComponent(".ppt-chart-wrap", "chart", { labelKey: "canvas.chart" });
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
    bindCanvasText(".ppt-code", "code", { multiline: true, preserveWhitespace: true });
    applyCanvasOffsets();
  }

  function bindCanvasText(selector, path, options) {
    var node = els.stageFrame.querySelector(selector);
    if (!node) return;
    registerCanvasEdit(node, path, options);
  }

  function bindCanvasComponent(selector, path, options) {
    var node = els.stageFrame.querySelector(selector);
    if (!node) return;
    var settings = Object.assign({ draggableOnly: true }, options || {});
    registerCanvasEdit(node, path, settings);
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

  function bindCanvasTextBoxes() {
    els.stageFrame.querySelectorAll(".ppt-textbox").forEach(function (node, index) {
      registerCanvasEdit(node, "textBoxes." + index + ".text", { labelKey: "canvas.textBox" });
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
    var foldedTextBox = foldTextBoxGeometry(drag.path, offset);
    if (!foldedTextBox) setCanvasOffset(drag.path, offset);
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    if (foldedTextBox) renderCanvas();
    else renderCanvasControls();
    updateButtons();
    updateFileStatus();
    schedulePersist();
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
      syncStylePanel();
      return;
    }

    var box = document.createElement("div");
    box.className = "canvas-selection-box";
    box.setAttribute("data-canvas-selection", selectedCanvasPath);

    var label = document.createElement("span");
    label.className = "canvas-selection-label";
    label.textContent = canvasSelectionLabel(node, selectedCanvasPath);
    box.appendChild(label);

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "canvas-reset-button";
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

    ["nw", "n", "ne", "e", "se", "s", "sw", "w"].forEach(function (handle) {
      var control = document.createElement("span");
      control.className = "canvas-resize-handle canvas-resize-" + handle;
      control.setAttribute("data-canvas-handle", handle);
      setTooltip(control, t("canvas.resize"));
      control.addEventListener("pointerdown", handleCanvasResizePointerDown);
      box.appendChild(control);
    });

    els.stageFrame.appendChild(box);
    positionCanvasSelectionBox(node, box);
    syncStylePanel();
  }

  function canvasSelectionLabel(node, path) {
    var options = node ? parseCanvasOptions(node) : {};
    return canvasLabel(options, path);
  }

  function syncStylePanel() {
    if (!els.stylePanel) return;
    var node = canvasNodeByPath(selectedCanvasPath);
    var hasSelection = Boolean(node && !activeCanvasEdit);
    var previousSyncing = syncing;
    syncing = true;

    els.stylePanel.classList.toggle("is-disabled", !hasSelection);
    els.stylePanel.querySelectorAll("[data-style-control]").forEach(function (control) {
      control.disabled = !hasSelection;
    });

    if (!hasSelection) {
      els.styleTargetLabel.textContent = t("style.noSelection");
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
      syncing = previousSyncing;
      return;
    }

    var style = currentStyleOverride(selectedCanvasPath);
    var computed = window.getComputedStyle(node);
    els.styleTargetLabel.textContent = formatText(t("style.target"), {
      name: canvasSelectionLabel(node, selectedCanvasPath)
    });
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
    syncing = previousSyncing;
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
      "fontSize", "color", "backgroundColor", "textAlign", "fontWeight", "fontStyle",
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
    var foldedTextBox = foldTextBoxGeometry(resize.path, offset);
    if (!foldedTextBox) setCanvasOffset(resize.path, offset);
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    if (foldedTextBox) renderCanvas();
    else renderCanvasControls();
    updateButtons();
    updateFileStatus();
    schedulePersist();
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
      if (!deleteSelectedTextBox()) resetSelectedCanvasOffset();
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

  function resetSelectedCanvasOffset() {
    if (!selectedCanvasPath) return;
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
    selectedCanvasPath = "";
    deck = PPTHtml.normalizeDeck(deck);
    markDirty();
    renderAll();
    schedulePersist();
    return true;
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

  function textBoxIndexFromPath(path) {
    var match = String(path || "").match(/^textBoxes\.(\d+)\.text$/);
    return match ? Number(match[1]) : -1;
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
      readImageFile(imageFile);
      return;
    }

    var videoFile = droppedFile(event.dataTransfer, "video/");
    if (videoFile) {
      readVideoFile(videoFile);
      return;
    }

    var audioFile = droppedFile(event.dataTransfer, "audio/");
    if (audioFile) {
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
    replaceDeck(PPTHtml.createDemoDeck(), { filePath: "", dirty: true, keepHistory: false });
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
    commitActiveCanvasEdit();
    presenting = true;
    presentIndex = index || 0;
    els.presenter.hidden = false;
    showPresentationSlide(presentIndex, { instant: true });
    document.body.classList.add("is-presenting");
    showPresenterChrome();
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
    els.presenter.hidden = true;
    els.presenter.classList.remove("is-ui-hidden");
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
    return PPTHtml.normalizeDeck(PPTHtml.createDemoDeck());
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
