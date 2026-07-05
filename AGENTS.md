# Agent Guide For htmlppt

This repository builds PPT.html Studio, an AI-friendly and human-editable presentation editor. The product promise is a single `.ppt.html` file that can be played in a browser, reopened in the app, and edited by both humans and AI agents.

## Product Contract

- The editable source is deck JSON embedded in `#ppt-html-data`.
- AI agents should generate or repair deck JSON, not free-form HTML.
- Human edits may live in `canvas`, `styles`, `textBoxes`, `objects`, media fields, and `notes`; preserve them unless the task says otherwise.
- Final shared `.ppt.html` files should embed image, video, audio, poster, renderer, CSS, and deck data in one file.
- The UI should feel close to Keynote / PowerPoint: direct manipulation first, JSON only as an advanced escape hatch.

## Important Files

- `renderer.js`: format normalization, validation, rendering, standalone export.
- `app.js`: editor state and UI behavior.
- `index.html`: editor shell and controls.
- `styles.css`: editor visual design.
- `schema/ppt-html-v0.1.schema.json`: machine-readable deck contract.
- `spec/ppt-html-v0.1.md`: human-readable deck contract.
- `docs/tutorial-ai.*.md`: AI authoring guides.
- `docs/tutorial-human.*.md`: user guides.
- `scripts/agent-deck.js`: agent CLI for validate/extract/build.
- `skills/htmlppt/`: reusable Codex skill for deck authoring and repair.

## Agent Workflow

1. Read the relevant product/docs/schema context before changing behavior.
2. For deck work, use the `htmlppt` skill when available.
3. Validate deck inputs and outputs with:

```bash
npm run deck:validate -- path/to/deck.json
npm run deck:validate -- path/to/deck.ppt.html --json
```

4. Extract or build standalone files with:

```bash
npm run deck:extract -- path/to/deck.ppt.html path/to/deck.json
npm run deck:build -- path/to/deck.json path/to/deck.ppt.html
```

5. Prefer structured fields and object data over raw positioned HTML-like content.
6. Keep changes scoped. Do not refactor unrelated UI or renderer code while fixing a narrow issue.

## Multi-Agent Coordination

When several agents work in parallel, split ownership by file or product surface:

- Product/docs agent: `README.md`, `docs/**`, `AGENTS.md`.
- Format agent: `schema/**`, `spec/**`, `renderer.js` validation.
- UI agent: `index.html`, `app.js`, `styles.css`.
- QA agent: `scripts/**`, examples, smoke coverage, manual acceptance checklist.
- Release agent: `.github/workflows/**`, package metadata, release notes.

Agents are not alone in the codebase. Do not revert changes made by others. If a file has unrelated edits, read them and integrate with them.

## Verification

Use the read-only gate during exploration and most agent handoffs:

```bash
npm run test:readonly
```

Use the full gate before final delivery:

```bash
npm test
```

`npm test` runs `npm run build:sample`, which rewrites `examples/ai-camera.ppt.html`. After running it, check:

```bash
git diff -- examples/ai-camera.ppt.html
```

Keep that diff only when renderer output intentionally changed.

## Common Failure Modes

- Validating after normalization and hiding bad AI output.
- Returning only a slide fragment when the user or editor expects a full deck.
- Dropping `canvas`, `styles`, `objects`, `textBoxes`, or media `src` during repair.
- Adding a UI label without updating i18n strings and smoke tests.
- Creating an external media reference in a final file instead of embedding assets.
- Letting editor-only helper text appear in standalone presentation mode.
- Breaking mobile portrait playback by assuming a desktop 16:9 viewport.

## Product Priorities

Immediate priorities:

1. Agent CLI, skill, and documentation.
2. Object-level validation for inserted modules.
3. Typed inspectors for image/video/audio, chart, and table objects.
4. One-click AI repair prompt and JSON report export.

Next priorities:

1. Field-level AI patch review.
2. PDF/PNG export.
3. Layer list, lock/group, snapping guides, and master/theme tokens.
4. Optional MCP or local service mode for external agents.
