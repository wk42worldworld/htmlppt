# AI 작성 가이드

이 문서는 AI 모델, 에이전트, 스크립트, 개발자를 위한 가이드입니다. 목표는 PPT.html Studio가 안정적으로 읽을 수 있는 deck JSON을 생성하는 것입니다.

## 핵심 규칙

- 자유 형식 HTML을 생성하지 마세요.
- `schema/ppt-html-v0.1.schema.json` 을 따르는 JSON을 생성하세요.
- 모든 슬라이드에는 `layout` 과 `title` 이 있어야 합니다.
- 문장은 짧게 쓰고 레이아웃은 렌더러에 맡기세요.
- 이미지는 URL 또는 `data:image/...;base64,...` 를 사용할 수 있습니다.

## 최소 구조

```json
{
  "version": "0.1",
  "title": "제품 소개",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "kicker": "Product",
      "title": "PPT.html",
      "subtitle": "AI는 구조를 쓰고, 사람은 편집하고, 브라우저가 발표합니다"
    }
  ]
}
```

## 권장 생성 흐름

1. 사용자 목표에서 5개에서 10개 슬라이드의 개요를 만듭니다.
2. 각 슬라이드에 layout 하나를 선택합니다.
3. 제목, 짧은 본문, 목록, 데이터를 채웁니다.
4. 완성된 JSON을 출력합니다. 코드 블록 밖 설명은 최소화합니다.
5. 사용자는 `AI JSON` 패널에 붙여넣어 가져올 수 있습니다.

## 자주 쓰는 layout

- `hero`: 표지
- `section`: 섹션 구분
- `text`: 본문과 목록
- `imageRight` / `imageLeft`: 이미지와 텍스트
- `compare`: 좌우 비교
- `threeCards`: 세 가지 핵심 내용
- `timeline`: 과정 또는 로드맵
- `data`: 세 가지 핵심 지표
- `table`: 표
- `code`: 코드
- `ending`: 마무리 슬라이드

## 비교 슬라이드 예시

```json
{
  "id": "slide-2",
  "layout": "compare",
  "kicker": "Why now",
  "title": "기존 PPT vs PPT.html",
  "left": {
    "title": "기존 PPT",
    "text": "형식이 복잡함\nAI가 안정적으로 만들기 어려움\n다시 편집하기 어려움"
  },
  "right": {
    "title": "PPT.html",
    "text": "구조가 명확함\nAI가 생성하기 쉬움\n사람이 계속 편집할 수 있음"
  }
}
```

