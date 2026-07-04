# PPT.html Studio / htmlppt

PPT.html Studio is an AI-friendly, human-editable presentation editor. It turns structured deck data into a single `.ppt.html` file that can be opened in a browser, edited again in the app, and shared like an ordinary HTML file.

## New in v0.2.0

PPT.html Studio now has a more complete creation workflow. Start from a template, edit the deck visually, paste AI-generated JSON directly from a code block, run a validation report, then save a single `.ppt.html` file from the desktop app.

The key idea stays the same: AI writes clean structure, humans make judgment calls, and the renderer keeps layout deterministic.

## Languages

- [中文首页](docs/home.zh-CN.md)
- [English Home](docs/home.en-US.md)
- [日本語ホーム](docs/home.ja-JP.md)
- [한국어 홈](docs/home.ko-KR.md)

## Tutorials

Human-friendly tutorials:

- [中文教程](docs/tutorial-human.zh-CN.md)
- [English Tutorial](docs/tutorial-human.en-US.md)
- [日本語チュートリアル](docs/tutorial-human.ja-JP.md)
- [한국어 튜토리얼](docs/tutorial-human.ko-KR.md)

AI-friendly authoring guides:

- [中文 AI 指南](docs/tutorial-ai.zh-CN.md)
- [English AI Guide](docs/tutorial-ai.en-US.md)
- [日本語 AI ガイド](docs/tutorial-ai.ja-JP.md)
- [한국어 AI 가이드](docs/tutorial-ai.ko-KR.md)

Product roadmap:

- [中文路线图](docs/roadmap.zh-CN.md)

## Quick Start

Run the browser editor:

```bash
npm install
npm run serve
```

Open:

```text
http://localhost:5173
```

Run the desktop app:

```bash
npm start
```

## Five-Minute Tutorial

1. Open PPT.html Studio.
2. Click `Templates` and choose Product Pitch, Lesson, Project Update, or the demo deck.
3. Edit the title, subtitle, metrics, table rows, or slide order in the visual editor.
4. Click `AI JSON` to paste a deck from an AI model. Fenced `json` code blocks are accepted.
5. Click `Check` and copy the validation report back to AI if anything needs repair.
6. Click `Present` to preview the deck.
7. Use `Save / Download`, or desktop `Save As`, to create one shareable `.ppt.html` file.

Build the desktop app locally:

```bash
npm run dist
```

## What Is PPT.html?

A `.ppt.html` file is normal HTML with structured presentation data embedded inside:

```html
<script id="ppt-html-data" type="application/vnd.ppt-html+json">
{
  "version": "0.1",
  "title": "Demo",
  "theme": "launch",
  "slides": []
}
</script>
```

AI writes the JSON. The renderer turns it into slides. Humans can edit it in PPT.html Studio.

## Current Product Focus

- Start from built-in templates for product pitches, lessons, project updates, or the demo deck.
- Open, save, and save as `.ppt.html` files in the desktop app.
- Import local images into image slides as embedded data URIs.
- Run `Check` to get a human-readable and AI-readable validation report.

## Release Builds

GitHub Actions builds release packages for:

- Linux x64
- macOS Apple Silicon arm64
- macOS Intel x64
- Windows x64

Release builds are triggered by tags such as:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```
