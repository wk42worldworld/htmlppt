---
name: htmlppt
description: Create, edit, validate, repair, and export PPT.html Studio deck JSON and .ppt.html files. Use when an AI agent needs to generate a presentation, repair a PPT.html Validation Report, preserve human canvas/style/object edits, or maintain the htmlppt format contract.
---

# HTMLPPT

Use this skill for PPT.html Studio decks. A `.ppt.html` file is shareable HTML with structured deck JSON embedded in `#ppt-html-data`; the JSON is the source of truth for AI edits.

## First Rules

- Output deck JSON by default, not free-form HTML, CSS, JavaScript, PPTX XML, or partial fragments.
- Keep `version` exactly `"0.1"` and `aspectRatio` `"16:9"`.
- Preserve existing `id`, `notes`, `canvas`, `styles`, `textBoxes`, `objects`, and media `src` values unless the user asks to reset them.
- Prefer structured layouts and object `data` over arbitrary positioned text boxes.
- Never invent temporary local media paths. Use Data URI, reachable URL, or leave `src` empty for the human editor.
- Validate before returning a file or a repaired deck.

## Read As Needed

- For the format and authoring contract, read `references/authoring-contract.md`.
- For validation reports and repair work, read `references/validation-and-repair.md`.
- For maintaining schema, docs, tests, and product behavior together, read `references/maintainer-sync.md`.

## Workflow

1. Identify whether the input is a topic brief, deck JSON, fenced `json`, `.ppt.html`, or validation report.
2. If a file is provided, extract the deck JSON with `npm run deck:extract -- <file>`.
3. Generate or edit the full deck JSON. Keep existing human edits unless explicitly asked otherwise.
4. Validate with `npm run deck:validate -- <file-or-json>`.
5. Fix all errors, then important warnings. Use `--json` when an automated agent needs a machine-readable report.
6. Export with `npm run deck:build -- <deck.json> <out.ppt.html>` only when the user asks for a standalone file.

## Verification Commands

```bash
npm run deck:validate -- path/to/deck.json
npm run deck:validate -- path/to/deck.ppt.html --json
npm run deck:extract -- path/to/deck.ppt.html path/to/deck.json
npm run deck:build -- path/to/deck.json path/to/deck.ppt.html
npm run test:readonly
```

Run `npm test` before a final repository change, but remember it rebuilds `examples/ai-camera.ppt.html`.
