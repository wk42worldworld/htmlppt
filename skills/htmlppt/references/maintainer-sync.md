# Maintainer Sync

When changing the PPT.html format or editor behavior, keep these surfaces aligned:

- `renderer.js`: normalization, validation, rendering, standalone export.
- `schema/ppt-html-v0.1.schema.json`: machine-readable format contract.
- `spec/ppt-html-v0.1.md`: human-readable format contract.
- `docs/tutorial-ai.*.md`: AI generation rules in all supported languages.
- `docs/tutorial-human.*.md`: user-facing workflow docs when UI changes.
- `scripts/agent-deck.js`: CLI extraction, validation, and build behavior.
- `scripts/smoke-test.js` and `scripts/object-smoke-test.js`: regression coverage.
- `README.md`: public positioning and entry points.

## Before Finishing

Run:

```bash
npm run test:readonly
npm run deck:validate -- examples/ai-camera.ppt.html
```

Run full tests before committing:

```bash
npm test
git diff -- examples/ai-camera.ppt.html
```

`npm test` rebuilds the sample deck. Review the diff and keep it only when the renderer output intentionally changed.

## Current Product Gaps To Prioritize

1. JSON report file export and richer repair hints for object-level validation.
2. AI patch review: accept field-level or object-level changes instead of replacing the whole deck.
3. PDF/PNG export based on the standalone renderer.
4. Optional local MCP/service mode exposing `create_deck`, `validate_deck`, `export_deck`, and `patch_slide_object`.
5. Broader typed inspectors for cards, metrics, timeline, quote, code, compare, and shape objects.
