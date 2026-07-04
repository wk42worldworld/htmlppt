# AI 向け生成ガイド

このガイドは AI モデル、エージェント、スクリプト、開発者向けです。PPT.html Studio が安定して読み込み、再生し、再編集できる deck JSON を生成することが目的です。

## 目次

1. 出力契約
2. Deck 構造
3. Slide 構造
4. テーマとレイアウト選択
5. よく使うフィールド形式
6. 推奨生成フロー
7. 検証レポートの修正方法
8. 完全な例
9. 再利用できるプロンプト
10. よくあるミスのチェックリスト

## 1. 出力契約

AI は自由な HTML ではなく、構造化された deck JSON を出力します。

必須条件：

- `version` は `"0.1"`。
- ルートオブジェクトに `title` と `slides` を含める。
- `slides` は空でない配列。
- すべてのスライドに `layout` と `title` を含める。
- `schema/ppt-html-v0.1.schema.json` を構造の参考にする。
- CSS、スクリプト、絶対配置テキストボックス、PPTX XML を生成しない。
- 人間が編集して作成した `canvas` の位置とサイズ調整は、既に存在する場合は保持します。ユーザーが位置調整を明示的に求めない限り、大量の `canvas` 座標を生成しないでください。

推奨出力：

- ユーザーがエディタに貼り付ける場合は純粋な JSON を出力する。
- チャット内で見せる場合は ```json コードブロックを使ってもよい。エディタは読み込める。
- ユーザーが求めない限り、JSON の後に説明を追加しない。

## 2. Deck 構造

最小 deck：

```json
{
  "version": "0.1",
  "title": "製品紹介",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": []
}
```

フィールド：

- `version`：現在は `"0.1"` 固定。
- `title`：デッキタイトル。既定ファイル名にも使われる。
- `theme`：`paper`、`launch`、`studio`、`boardroom` のいずれか。
- `aspectRatio`：現在は `"16:9"`。
- `slides`：スライド配列。

テーマの目安：

| テーマ | 適した場面 |
| --- | --- |
| `paper` | 授業、知識共有、文書型レポート |
| `launch` | 製品発表、demo、ストーリー性の強い発表 |
| `studio` | 製品案、デザイン案、ツール紹介 |
| `boardroom` | プロジェクト報告、事業計画、経営層向け報告 |

## 3. Slide 構造

汎用 slide：

```json
{
  "id": "slide-1",
  "layout": "hero",
  "kicker": "Product",
  "title": "PPT.html",
  "subtitle": "AI が構造を書き、人間が編集し、ブラウザで再生する",
  "body": "",
  "notes": ""
}
```

フィールド：

- `id`：`slide-1`、`slide-2` のような安定 ID。
- `layout`：スライドのレイアウト名。
- `kicker`：短いラベル。空でもよい。
- `title`：スライドの主タイトル。
- `subtitle`：補足コピー。
- `body`：長めの説明。
- `notes`：発表者用メモ。

文章の目安：

- タイトルは短くする。
- サブタイトルを長い段落にしない。
- 長い説明は `body` またはリストに入れる。
- 1 枚につき主題は 1 つ。

## 4. テーマとレイアウト選択

対応 layout：

| layout | 用途 | 主なフィールド |
| --- | --- | --- |
| `hero` | 表紙、導入 | `title`、`subtitle`、`image` |
| `section` | 章区切り | `title`、`body` |
| `text` | 本文とリスト | `title`、`body`、`items` |
| `imageRight` | 左に文章、右に画像 | `title`、`body`、`items`、`image` |
| `imageLeft` | 左に画像、右に文章 | `title`、`body`、`items`、`image` |
| `imageFull` | 全画面画像 | `title`、`subtitle`、`image` |
| `imageBackground` | 背景画像とテキスト | `title`、`subtitle`、`body`、`items`、`image` |
| `compare` | 2 列比較 | `left`、`right` |
| `threeCards` | 3 つの要点 | `cards` |
| `quote` | 引用、主張 | `quote`、`author` |
| `timeline` | 工程、ロードマップ | `items` |
| `data` | 主要指標 | `metrics` |
| `chart` | 推移、グループ値、構成比 | `chart.kind`、`chart.labels`、`chart.series` |
| `video` | 製品 demo、インタビュー、画面録画 | `video.src`、`video.poster`、`video.caption` |
| `audio` | ナレーション、インタビュー音声、ポッドキャスト | `audio.src`、`audio.caption` |
| `table` | 計画表、比較表 | `table.columns`、`table.rows` |
| `code` | コード表示 | `code` |
| `ending` | 終了スライド | `title`、`subtitle` |

選択ルール：

- 強い導入が必要：`hero`。
- 説明が必要：`text`。
- 違いを見せたい：`compare`。
- 3 つの売りや能力：`threeCards`。
- 時系列：`timeline`。
- 数字を強調：`data`。
- 推移、グループ値、構成比：`chart`。
- demo、インタビュー、画面録画を見せる：`video`。
- ナレーション、インタビュー音声、ポッドキャストを再生する：`audio`。
- 計画や状態を示す：`table`。

## 5. よく使うフィールド形式

画像：

```json
"image": {
  "src": "https://example.com/image.png",
  "alt": "製品 UI スクリーンショット",
  "caption": "任意の画像キャプション",
  "fit": "cover"
}
```

`src` は URL または `data:image/...;base64,...` を使えます。`fit` は塗りつぶし裁切なら `cover`、全体表示なら `contain` を使います。画像が未確定の場合は空にして、人間がエディタでローカル画像を選べるようにします。

動画：

```json
"video": {
  "src": "https://example.com/demo.mp4",
  "poster": "https://example.com/poster.png",
  "caption": "製品 demo クリップ",
  "fit": "cover",
  "controls": true
}
```

`src` は URL または `data:video/...;base64,...` を使えます。動画ソースが未確定の場合は空にして、人間がエディタでローカル動画を選べるようにします。

音声：

```json
"audio": {
  "src": "https://example.com/narration.mp3",
  "caption": "冒頭ナレーション",
  "controls": true
}
```

`src` は URL または `data:audio/...;base64,...` を使えます。音声ソースが未確定の場合は空にして、人間がエディタでローカル音声を選べるようにします。

アセットのパッケージ規則：

- 最終的な `.ppt.html` は単一ファイルであるべきです。保存またはダウンロード時、アプリは外部 `image.src`、`video.src`、`video.poster`、`audio.src` を Data URI として同梱します。
- AI はアクセス可能な URL、または直接 Data URI を書けます。
- 自分の環境にしか存在しない一時ローカルパスを書かないでください。ソースが不明な場合は `src` を空にして、ユーザーがエディタでファイルを選べるようにします。

リストまたはタイムライン：

```json
"items": [
  { "title": "第 1 週", "text": "目標と demo 範囲を確認" },
  { "title": "第 2 週", "text": "プロトタイプを完成し、フィードバックを集める" }
]
```

カード：

```json
"cards": [
  { "title": "明確な構造", "text": "AI が JSON を生成し、人間が編集を続ける。" },
  { "title": "単一ファイル", "text": "1 つの .ppt.html ファイルで再生できる。" },
  { "title": "安定した描画", "text": "レイアウトはレンダラーが処理する。" }
]
```

指標：

```json
"metrics": [
  { "value": "3x", "label": "下書き速度", "detail": "空白から発表可能な下書きへ。" },
  { "value": "1 file", "label": "成果物", "detail": "別の素材フォルダは不要。" }
]
```

グラフ：

```json
"chart": {
  "kind": "bar",
  "labels": ["Q1", "Q2", "Q3", "Q4"],
  "series": [
    { "name": "売上", "values": [12, 20, 31, 42] },
    { "name": "コスト", "values": [8, 11, 18, 24] }
  ],
  "unit": "万円"
}
```

`bar` は比較、`line` は推移、`donut` は構成比に向いています。ドーナツグラフでは最初の系列が分割として使われます。

比較：

```json
"left": {
  "title": "従来の PPT",
  "text": "形式が複雑\nAI が安定生成しにくい\n再編集コストが高い"
},
"right": {
  "title": "PPT.html",
  "text": "構造が明確\nAI が生成しやすい\n人間が続けて編集できる"
}
```

表：

```json
"table": {
  "columns": ["段階", "時期", "状態"],
  "rows": [
    ["要件確認", "第 1 週", "完了"],
    ["プロトタイプ", "第 2 週", "進行中"]
  ]
}
```

キャンバスオフセット：

```json
"canvas": {
  "title": { "x": 24, "y": 36, "w": 720, "h": 96 },
  "cards.0.title": { "x": -12, "y": 8 }
}
```

`canvas` は、人間がキャンバス上で要素をドラッグまたはサイズ変更したときの軽い調整を保存します。キーは `title`、`subtitle`、`cards.0.title`、`table.rows.1.2` のような構造化フィールドパスです。`x/y` はテンプレート位置からのピクセル単位のずれ、`w/h` は任意の幅と最小高さです。AI が文言を修正する場合は既存の `canvas` をできるだけ保持してください。ユーザーが「レイアウトをリセット」「テンプレート位置に戻す」と求めた場合だけ削除します。

## 6. 推奨生成フロー

1. ユーザーの目的、受け手、場面、語調を理解する。
2. 5 から 10 枚の構成を作る。
3. 各スライドに layout を 1 つ選ぶ。
4. 短いタイトルと構造化フィールドを書く。
5. 各スライドが 1 つの主題だけを扱っているか確認する。
6. 完全な deck JSON を出力する。
7. ユーザーが検証レポートを返したら、それに従って修正する。

既定の流れ：

1. `hero`：テーマと一文の価値。
2. `section` または `text`：背景や問題。
3. `compare`：従来方式と新方式。
4. `threeCards`：解決策や能力。
5. `data` または `chart`：主要結果。
6. `timeline` または `table`：計画。
7. `ending`：まとめと次の行動。

## 7. 検証レポートの修正方法

ユーザーが PPT.html Validation Report を貼り付けた場合：

1. `Status` を読む。
2. すべての `ERROR` を最初に修正する。
3. 次に `WARNING` を修正する。
4. 必要に応じて `TIP` を処理する。
5. 元の deck の意図を保つ。
6. 修正後の完全な deck JSON を返す。

パスの例：

- `version`：ルートの `version` を編集。
- `slides[2].layout`：3 枚目の layout を編集。
- `slides[4].metrics`：5 枚目の指標を編集。
- `slides[1].image.src`：画像ソースを追加または削除。

してはいけないこと：

- HTML を出力する。
- 部分的な断片だけを出力する。
- ユーザーの重要な内容を削除する。
- `version` を別の値に変える。

## 8. 完全な例

```json
{
  "version": "0.1",
  "title": "PPT.html Studio 製品紹介",
  "theme": "studio",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "kicker": "Product",
      "title": "PPT.html Studio",
      "subtitle": "AI が構造を書き、人間が編集し、ブラウザで再生する",
      "notes": "これは PPTX クローンではなく、AI 時代の deck 形式だと説明する。"
    },
    {
      "id": "slide-2",
      "layout": "compare",
      "kicker": "Problem",
      "title": "従来の PPT は AI と相性が悪い",
      "left": {
        "title": "従来の PPT",
        "text": "ファイル構造が複雑\n座標とスタイルが分散\nAI が維持しにくい"
      },
      "right": {
        "title": "PPT.html",
        "text": "JSON 構造が明確\nテンプレートが配置を処理\n人間が編集を続けられる"
      }
    },
    {
      "id": "slide-3",
      "layout": "threeCards",
      "kicker": "Workflow",
      "title": "3 ステップで作成",
      "cards": [
        { "title": "構造を生成", "text": "AI が deck JSON を出力。" },
        { "title": "視覚的に編集", "text": "人間が内容、画像、順序を調整。" },
        { "title": "1 ファイルで共有", "text": "再生可能な .ppt.html を書き出し。" }
      ]
    },
    {
      "id": "slide-4",
      "layout": "data",
      "kicker": "Value",
      "title": "価値",
      "metrics": [
        { "value": "1 file", "label": "成果物", "detail": "素材フォルダなしで再生。" },
        { "value": "4", "label": "対応ビルド", "detail": "Linux、macOS arm64、macOS x64、Windows。" },
        { "value": "0.1", "label": "安定形式", "detail": "AI が生成し修正しやすい。" }
      ]
    },
    {
      "id": "slide-5",
      "layout": "ending",
      "title": "AI と人間が一緒に deck を編集する",
      "subtitle": "次はテンプレートから最初の .ppt.html を作る"
    }
  ]
}
```

## 9. 再利用できるプロンプト

新しい deck を生成：

```text
PPT.html Studio 用の完全な deck JSON を生成してください。
要件：
- version は必ず "0.1"
- 6 枚作成
- theme は boardroom
- すべてのスライドに id、layout、title を含める
- hero、compare、threeCards、data、chart、table、ending を優先
- 自由な HTML は出力しない
- 説明せず JSON だけ出力

テーマ：
{ここにテーマ}

受け手：
{ここに受け手}

語調：
{正式 / カジュアル / 製品発表 / 教学}
```

検証レポートから修正：

```text
以下は PPT.html Validation Report です。
deck JSON を修正してください：
- 先に ERROR を修正
- 次に WARNING を修正
- version は "0.1" のまま
- HTML は出力しない
- 修正後の完全な deck JSON を返す
```

## 10. よくあるミスのチェックリスト

出力前に確認：

- `version` は正確に `"0.1"` か。
- `theme` は `paper`、`launch`、`studio`、`boardroom` のいずれか。
- `slides` は 1 枚以上あるか。
- すべてのスライドに有効な `layout` があるか。
- すべてのスライドに `title` があるか。
- `threeCards` は 3 カード以下か。
- `data` は 3 指標以下か。
- `chart` にラベルと数値系列があるか。
- `timeline` は 5 項目以下か。
- 画像に `alt` があるか。
- 自由な HTML を出力していないか。

レイアウト選択に迷う場合は、最も汎用的な `text` を使います。
