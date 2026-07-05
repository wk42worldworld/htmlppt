# AI Agent 連携ガイド

この文書は、Codex、コンテンツ生成 agent、テスト agent、自動化スクリプト、外部ツールが PPT.html Studio と安全に連携するためのガイドです。目的は、生成、修正、検証、書き出しを安定させ、人間がキャンバス上で編集した内容を壊さないことです。

## 製品モデル

PPT.html Studio の編集元は自由な HTML ではありません。安定した契約は次の通りです。

- AI agent は構造化された deck JSON を編集します。
- 人間は Keynote / PowerPoint に近いキャンバスで視覚的に編集します。
- アプリは JSON、アセット、レンダラー、プレイヤーを 1 つの `.ppt.html` ファイルにまとめます。

agent は最終 HTML の DOM ではなく、deck JSON を扱ってください。

## 接続レベル

最小構成:

- `docs/tutorial-ai.ja-JP.md`
- `schema/ppt-html-v0.1.schema.json`
- `spec/ppt-html-v0.1.md`

推奨構成:

- `skills/htmlppt/SKILL.md`
- `skills/htmlppt/references/*.md`
- `scripts/agent-deck.js`

Codex skill をローカルにインストール:

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

人間にはテキストレポート、agent には `--json` を使います。

## 基本ワークフロー

新規 deck 作成:

1. テーマ、対象読者、言語、ページ数を確認します。
2. 完全な deck JSON を出力します。
3. `npm run deck:validate -- draft.json` で検証します。
4. すべての `ERROR` を修正します。
5. standalone が必要な場合は `npm run deck:build -- draft.json output.ppt.html` を実行します。

既存 `.ppt.html` の編集:

1. `npm run deck:extract -- old.ppt.html old.deck.json` で JSON を抽出します。
2. JSON を編集します。
3. 既存の `id`、`canvas`、`styles`、`textBoxes`、`objects`、media `src`、`notes` を保持します。
4. 検証して再構築します。

## Agent の必須ルール

- `version` は `"0.1"`。
- `aspectRatio` は `"16:9"`。
- `theme` は `paper`、`launch`、`studio`、`boardroom`。
- deck には空でない `slides` が必要です。
- 各 slide には `layout` と `title` が必要です。
- 自由な HTML/CSS/JS/PPTX XML を出力しないでください。
- 一時的なローカル media パスを作らないでください。
- 人間が編集した `canvas`、`styles`、`textBoxes`、`objects`、media `src`、`notes` を保持してください。

## 今後の実装計画

P0:

- validate / extract / build 用 Agent CLI。
- 生成、修正、保守用 Codex skill。
- `AGENTS.md` と接続ドキュメント。
- `slide.objects[]` のオブジェクト単位検証。
- 画像、動画、音声、チャート、テーブルの Typed Inspector。
- 品質チェックから AI 修復 Prompt をコピー。

P1:

- AI patch レビュー。
- PDF/PNG 書き出し。
- レイヤー一覧、ロック、グループ化、スナップガイド。

P2:

- ローカル MCP または service mode。
- PPTX/ODP 互換。
- ブランドテンプレート、マスター、ページ番号、テーマ token。

## 検証

探索中は読み取り中心の gate を使います。

```bash
npm run test:readonly
```

最終提出前:

```bash
npm test
git diff -- examples/ai-camera.ppt.html
```

`npm test` はサンプルを再生成します。意図したレンダリング変更の場合だけ diff を残してください。
