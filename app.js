(function () {
  "use strict";

  var STORAGE_KEY = "ppt-html-studio-draft-v01";
  var LANG_STORAGE_KEY = "ppt-html-studio-lang-v01";
  var APP_VERSION_LABEL = "v0.2.6";
  var desktop = window.htmlpptDesktop || null;
  var deck = PPTHtml.normalizeDeck(loadInitialDeck());
  var uiLang = loadLanguage();
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
      "insert.text.title": "插入文本页面",
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
      "canvas.reset": "重置",
      "canvas.resetTitle": "重置这个元素的位置和尺寸",
      "canvas.resize": "拖拽调整尺寸",
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
    "insert.text.title": "Insert a text slide",
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
    "canvas.reset": "Reset",
    "canvas.resetTitle": "Reset this element position and size",
    "canvas.resize": "Drag to resize",
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
    "insert.text.title": "テキストスライドを挿入",
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
    "insert.text.title": "텍스트 슬라이드 삽입",
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

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindEvents();
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
      "languageInput", "fileInput", "imageFileInput", "videoFileInput", "fileStatus",
      "addSlideBtn", "slideList", "duplicateSlideBtn", "moveSlideUpBtn", "moveSlideDownBtn", "deleteSlideBtn",
      "currentSlideLabel", "currentSlideTitle", "undoBtn", "redoBtn", "stageViewport", "stageFrame",
      "deckTitleInput", "deckThemeInput", "slideLayoutInput", "kickerInput", "titleInput", "subtitleInput", "bodyInput",
      "imageFileBtn", "imageFitInput", "imageSrcInput", "imageAltInput", "imageCaptionInput", "itemsInput", "leftTitleInput", "leftTextInput", "rightTitleInput", "rightTextInput",
      "videoFileBtn", "videoFitInput", "videoSrcInput", "videoPosterInput", "videoCaptionInput",
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
      node.setAttribute("title", value);
      node.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
    });

    populateLayoutSelect();
    if (!settings.skipRender) renderAll();
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
      els.jsonTextarea.value = JSON.stringify(deck, null, 2);
      els.jsonDialog.showModal();
      els.jsonTextarea.focus();
    });

    els.copyJsonBtn.addEventListener("click", function () {
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

    els.validateBtn.addEventListener("click", showValidationDialog);

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
        insertComponent(button.getAttribute("data-insert"), { source: "click" });
      });
      button.addEventListener("dragstart", function (event) {
        var type = button.getAttribute("data-insert");
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("application/x-htmlppt-component", type);
        event.dataTransfer.setData("text/plain", type);
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
      openImagePicker();
    });

    els.imageFileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      readImageFile(file);
      event.target.value = "";
    });

    els.videoFileBtn.addEventListener("click", function () {
      openVideoPicker();
    });

    els.videoFileInput.addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      readVideoFile(file);
      event.target.value = "";
    });

    bindSlideInput(els.videoFitInput, function (slide, value) { slide.video.fit = value; });
    bindSlideInput(els.videoSrcInput, function (slide, value) { slide.video.src = value; });
    bindSlideInput(els.videoPosterInput, function (slide, value) { slide.video.poster = value; });
    bindSlideInput(els.videoCaptionInput, function (slide, value) { slide.video.caption = value; });

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
      commit(function () {
        var slide = currentSlide();
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
      commit(function () {
        var slide = currentSlide();
        slide.layout = "video";
        slide.video.src = reader.result;
        if (!slide.video.caption) slide.video.caption = file.name.replace(/\.[^.]+$/, "");
      });
      toast(t("toast.videoAdded"));
    };
    reader.readAsDataURL(file);
  }

  function openImagePicker() {
    els.imageFileInput.click();
  }

  function openVideoPicker() {
    els.videoFileInput.click();
  }

  function insertComponent(type, options) {
    var settings = options || {};
    if (type === "image" && settings.source === "click") {
      openImagePicker();
      return;
    }
    if (type === "video" && settings.source === "click") {
      openVideoPicker();
      return;
    }

    commit(function () {
      applyComponentToSlide(currentSlide(), type);
      selectedCanvasPath = "";
    });
    toast(formatText(t("toast.componentInserted"), { name: insertLabel(type) }));
  }

  function applyComponentToSlide(slide, type) {
    if (type === "text") {
      slide.layout = "text";
      if (!slide.title) slide.title = t("sample.textTitle");
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
      if (!slide.title) slide.title = t("sample.imageTitle");
      slide.image = slide.image || {};
      slide.image.caption = slide.image.caption || t("sample.imageCaption");
      return;
    }
    if (type === "video") {
      slide.layout = "video";
      if (!slide.title) slide.title = t("sample.videoTitle");
      slide.video = slide.video || {};
      slide.video.caption = slide.video.caption || t("sample.videoCaption");
      slide.video.fit = slide.video.fit || "cover";
      return;
    }
    if (type === "chart") {
      slide.layout = "chart";
      slide.title = slide.title || t("sample.chartTitle");
      slide.chart = {
        kind: "bar",
        labels: [t("sample.q1"), t("sample.q2"), t("sample.q3"), t("sample.q4")],
        series: [
          { name: t("sample.revenue"), values: [12, 20, 31, 42] },
          { name: t("sample.cost"), values: [8, 11, 18, 24] }
        ],
        unit: t("sample.unit")
      };
      return;
    }
    if (type === "table") {
      slide.layout = "table";
      slide.title = slide.title || t("sample.tableTitle");
      slide.table = {
        columns: [t("sample.phase"), t("sample.owner"), t("sample.status")],
        rows: [
          [t("sample.plan"), t("sample.team"), t("sample.done")],
          [t("sample.prototype"), t("sample.design"), t("sample.progress")]
        ]
      };
      return;
    }
    if (type === "cards") {
      slide.layout = "threeCards";
      slide.title = slide.title || t("sample.cardsTitle");
      slide.cards = [
        { title: t("sample.card1Title"), text: t("sample.card1Text") },
        { title: t("sample.card2Title"), text: t("sample.card2Text") },
        { title: t("sample.card3Title"), text: t("sample.card3Text") }
      ];
      return;
    }
    if (type === "metrics") {
      slide.layout = "data";
      slide.title = slide.title || t("sample.metricsTitle");
      slide.metrics = [
        { value: "3x", label: t("sample.speed"), detail: t("sample.speedDetail") },
        { value: "42%", label: t("sample.growth"), detail: t("sample.growthDetail") },
        { value: "1 file", label: "PPT.html", detail: t("sample.fileDetail") }
      ];
      return;
    }
    if (type === "timeline") {
      slide.layout = "timeline";
      slide.title = slide.title || t("sample.timelineTitle");
      slide.items = [
        { title: t("sample.step1"), text: t("sample.step1Text") },
        { title: t("sample.step2"), text: t("sample.step2Text") },
        { title: t("sample.step3"), text: t("sample.step3Text") }
      ];
      return;
    }
    if (type === "quote") {
      slide.layout = "quote";
      slide.quote = slide.quote || t("sample.quoteText");
      slide.author = slide.author || t("sample.quoteAuthor");
      return;
    }
    if (type === "code") {
      slide.layout = "code";
      slide.title = slide.title || t("sample.codeTitle");
      slide.code = slide.code || "const deck = await createPptHtml();\nawait deck.present();";
    }
  }

  function insertLabel(type) {
    return t("insert." + type) || type;
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
      button.querySelector("strong").textContent = slide.title || t("slide.untitled");
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
    bindCanvasComponent(".ppt-media", "image", { labelKey: "canvas.image", fileAction: "image" });
    bindCanvasComponent(".ppt-video", "video", { labelKey: "canvas.video", fileAction: "video" });
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
    label.textContent = canvasSelectionLabel(node, selectedCanvasPath);
    box.appendChild(label);

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "canvas-reset-button";
    reset.title = t("canvas.resetTitle");
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
      control.setAttribute("title", t("canvas.resize"));
      control.addEventListener("pointerdown", handleCanvasResizePointerDown);
      box.appendChild(control);
    });

    els.stageFrame.appendChild(box);
    positionCanvasSelectionBox(node, box);
  }

  function canvasSelectionLabel(node, path) {
    var options = node ? parseCanvasOptions(node) : {};
    return canvasLabel(options, path);
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
    if (options.draggableOnly) {
      selectCanvasTarget(node);
      if (options.fileAction === "image") openImagePicker();
      else if (options.fileAction === "video") openVideoPicker();
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
    var componentType = event.dataTransfer.getData("application/x-htmlppt-component");
    if (componentType) {
      insertComponent(componentType, { source: "drop" });
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
    }
  }

  function hasImageFile(dataTransfer) {
    return hasFileType(dataTransfer, "image/");
  }

  function hasVideoFile(dataTransfer) {
    return hasFileType(dataTransfer, "video/");
  }

  function hasComponentPayload(dataTransfer) {
    if (!dataTransfer || !dataTransfer.types) return false;
    return Array.prototype.indexOf.call(dataTransfer.types, "application/x-htmlppt-component") !== -1;
  }

  function hasCanvasDropPayload(dataTransfer) {
    return hasComponentPayload(dataTransfer) || hasImageFile(dataTransfer) || hasVideoFile(dataTransfer);
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
    els.slideLayoutInput.value = slide.layout;
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
    toast(t("toast.newDeck"));
  }

  function createFromTemplate(templateId) {
    if (!confirmDiscard()) return;
    replaceDeck(PPTHtml.createTemplateDeck(templateId), { filePath: "", dirty: true, keepHistory: false });
    els.templateDialog.close();
    toast(t("toast.templateCreated"));
  }

  function openDeck() {
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
    var html = PPTHtml.exportStandalone(deck);
    var name = filenameFromTitle(deck.title);
    if (desktop && desktop.isDesktop) {
      var action = forceDialog ? desktop.saveDeckAs : desktop.saveDeck;
      action({ filePath: currentFilePath, defaultName: name, content: html }).then(function (result) {
        if (!result || result.canceled) return;
        currentFilePath = result.filePath || currentFilePath;
        dirty = false;
        updateFileStatus();
        toast(formatText(t("toast.saved"), { name: basename(currentFilePath) }));
      }).catch(function (error) {
        alert(formatText(t("alert.saveFailed"), { message: error.message }));
      });
      return;
    }
    PPTHtml.download(name, html);
    dirty = false;
    updateFileStatus();
    toast(t("toast.downloaded"));
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
