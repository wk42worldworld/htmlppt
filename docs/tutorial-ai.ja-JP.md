# AI 向け生成ガイド

このガイドは AI モデル、エージェント、スクリプト、開発者向けです。PPT.html Studio が安定して読み込める deck JSON を生成することが目的です。

## 基本ルール

- 自由な HTML を生成しない。
- `schema/ppt-html-v0.1.schema.json` に従う JSON を生成する。
- すべてのスライドに `layout` と `title` を入れる。
- 文章は短くし、配置はレンダラーに任せる。
- 画像は URL または `data:image/...;base64,...` を使える。

## 最小構造

```json
{
  "version": "0.1",
  "title": "製品紹介",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "kicker": "Product",
      "title": "PPT.html",
      "subtitle": "AI が構造を書き、人間が編集し、ブラウザで再生する"
    }
  ]
}
```

## 推奨フロー

1. ユーザーの目的から 5 から 10 枚の構成を作る。
2. 各スライドに layout を 1 つ選ぶ。
3. タイトル、短い本文、リスト、データを入れる。
4. 完全な JSON を出力する。コードブロック外の説明は最小限にする。
5. ユーザーは `AI JSON` パネルに貼り付けて読み込む。
6. ユーザーが `检查` を実行した後、レポートがあれば `ERROR`、`WARNING`、`TIP` の順に修正する。

## よく使う layout

- `hero`：表紙
- `section`：章区切り
- `text`：本文とリスト
- `imageRight` / `imageLeft`：画像とテキスト
- `compare`：左右比較
- `threeCards`：3 つの要点
- `timeline`：工程またはロードマップ
- `data`：3 つの主要指標
- `table`：表
- `code`：コード
- `ending`：終了スライド

## 比較スライド例

```json
{
  "id": "slide-2",
  "layout": "compare",
  "kicker": "Why now",
  "title": "従来の PPT vs PPT.html",
  "left": {
    "title": "従来の PPT",
    "text": "形式が複雑\nAI が安定生成しにくい\n再編集コストが高い"
  },
  "right": {
    "title": "PPT.html",
    "text": "構造が明確\nAI が生成しやすい\n人間が続けて編集できる"
  }
}
```

## 検証レポートから修正する

ユーザーが PPT.html Validation Report を貼り付けた場合：

- `version` は `"0.1"` のままにする。
- 自由な HTML に変換しない。
- `slides[2].layout` や `slides[4].metrics` のようなパスに従って修正する。
- 修正後は完全な deck JSON を返す。
