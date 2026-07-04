# PPT.html Studio

PPT.html Studio is a presentation tool for the AI era. AI does not need to write fragile PPTX files, and humans do not need to write HTML. A `.ppt.html` file stores structured JSON data, renders as browser-ready slides, and can be edited again in the app.

## What Is New

Since v0.2.0, PPT.html Studio is no longer just a format prototype. It has a complete creation workflow: start from a template, edit visually, paste AI-generated JSON directly, run a validation report, and save a single `.ppt.html` file that can be shared and edited again.

The product principle is simple: AI writes structure, humans make decisions, and the renderer keeps layout stable.

## Who It Is For

- People who use AI to draft reports, lessons, pitch decks, and product stories
- Teams that need files that can be shared, opened offline, and edited again
- Users who want clean layout without moving dozens of text boxes by hand

## Core Features

- Single-file `.ppt.html` playback and sharing
- Open, save, and save as `.ppt.html` files in the desktop app
- Starter templates for product pitches, lessons, and project updates
- Visual editing for titles, text, images, comparisons, cards, data, tables, and code
- Images support local embedding, cover/contain fit, captions, full-image slides, and image-background slides
- AI JSON import
- Validation reports that humans can read and AI can repair from
- 12 starter layouts and 4 themes
- GitHub Actions builds for Linux, macOS arm64, macOS x64, and Windows, with optional macOS signing and notarization

## Quick Start

```bash
npm install
npm run serve
```

Open `http://localhost:5173`.

## Five-Minute Tutorial

1. Open PPT.html Studio.
2. Click `Templates` and choose Product Pitch, Lesson, Project Update, or the demo deck.
3. Edit titles, subtitles, metrics, table rows, images, and notes in the right panel.
4. Click `AI JSON` when you want an AI-generated draft. Raw JSON and fenced `json` code blocks both work.
5. Click `Check`; copy the validation report back to AI when it needs to repair errors or warnings.
6. Click `Present` to preview the deck.
7. Use `Save / Download` in the browser, or `Save` / `Save As` in the desktop app, to create one shareable `.ppt.html` file.

More guides:

- [Human Tutorial](tutorial-human.en-US.md)
- [AI Authoring Guide](tutorial-ai.en-US.md)
- [macOS Signing and Notarization Guide](macos-notarization.en-US.md)
