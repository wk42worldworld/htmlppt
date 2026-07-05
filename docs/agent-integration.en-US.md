# AI Agent Integration

This guide explains how Codex, content agents, test agents, scripts, and external tools should work with PPT.html Studio. The goal is stable generation, repair, validation, and export without destroying human canvas edits.

## Product Model

PPT.html Studio is not free-form HTML generation and not PPTX internals. The stable contract is:

- AI agents edit structured deck JSON.
- Humans edit visually on a Keynote / PowerPoint-like canvas.
- The app packages JSON, assets, renderer, and player into one `.ppt.html` file.

Agents should work on deck JSON, not on the final HTML DOM.

## Integration Levels

Lightweight:

- Read `docs/tutorial-ai.en-US.md`.
- Read `schema/ppt-html-v0.1.schema.json`.
- Read `spec/ppt-html-v0.1.md`.

Recommended:

- Use `skills/htmlppt/SKILL.md`.
- Use `skills/htmlppt/references/*.md`.
- Use `scripts/agent-deck.js`.

Install the Codex skill locally:

```bash
npm run skill:install -- --force
```

## CLI

```bash
npm run deck:validate -- path/to/deck.json
npm run deck:validate -- path/to/deck.ppt.html --json
npm run deck:extract -- path/to/deck.ppt.html path/to/deck.json
npm run deck:build -- path/to/deck.json path/to/deck.ppt.html
```

Use text validation reports for humans and `--json` for automated agents.

## Standard Workflows

Create a new deck:

1. Read the topic, audience, language, and desired slide count.
2. Output complete deck JSON.
3. Validate with `npm run deck:validate -- draft.json`.
4. Fix every `ERROR`.
5. Build with `npm run deck:build -- draft.json output.ppt.html` when a standalone file is needed.

Edit an existing `.ppt.html`:

1. Extract JSON with `npm run deck:extract -- old.ppt.html old.deck.json`.
2. Modify the JSON.
3. Preserve existing `id`, `canvas`, `styles`, `textBoxes`, `objects`, media `src`, and `notes`.
4. Validate and rebuild.

Repair a validation report:

1. Fix `ERROR` items first.
2. Fix important `WARNING` items next.
3. Treat `TIP` items as optional quality guidance.
4. Return complete repaired deck JSON, not a fragment.

## Rules Agents Must Follow

- Keep `version` as `"0.1"`.
- Keep `aspectRatio` as `"16:9"`.
- Use `paper`, `launch`, `studio`, or `boardroom` for `theme`.
- Every deck needs a non-empty `slides` array.
- Every slide needs `layout` and `title`.
- Do not output free-form HTML/CSS/JS/PPTX XML.
- Do not invent local temporary paths for media.
- Preserve human-authored `canvas`, `styles`, `textBoxes`, `objects`, media `src`, and `notes`.

## Multi-Agent Plan

P0 now:

- Agent CLI for validate, extract, and build.
- Codex skill for generation, repair, and maintenance.
- Repository `AGENTS.md`.
- Integration docs.

P0 next:

- Object-level validation for `slide.objects[]`.
- Typed inspectors for image/video/audio, charts, and tables.
- One-click AI repair prompt.
- Export deck JSON and validation report files.

P1:

- AI patch review.
- PDF/PNG export.
- Layer list, lock/group, snapping guides.
- Module registry shared by UI, schema, docs, and tests.

P2:

- Local MCP or service mode.
- PPTX/ODP compatibility.
- Brand templates, masters, page numbers, font and theme tokens.

## Verification

Use this read-only gate while exploring:

```bash
npm run test:readonly
```

Use the full gate before final delivery:

```bash
npm test
git diff -- examples/ai-camera.ppt.html
```

`npm test` rebuilds the sample file. Keep that diff only when renderer output intentionally changed.
