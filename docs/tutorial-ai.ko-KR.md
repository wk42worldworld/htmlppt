# AI 작성 가이드

이 가이드는 AI 모델, 에이전트, 스크립트, 개발자를 위한 문서입니다. 목표는 PPT.html Studio가 안정적으로 읽고, 발표하고, 다시 편집할 수 있는 deck JSON을 생성하는 것입니다.

## 목차

1. 출력 계약
2. Deck 구조
3. Slide 구조
4. 테마와 레이아웃 선택
5. 자주 쓰는 필드 형식
6. 권장 생성 흐름
7. 검사 보고서 수정 방법
8. 완전한 예시
9. 재사용 가능한 프롬프트
10. 흔한 실수 체크리스트

## 1. 출력 계약

AI는 자유 형식 HTML이 아니라 구조화된 deck JSON을 출력해야 합니다.

필수 조건:

- `version` 은 `"0.1"` 이어야 합니다.
- 최상위 객체에는 `title` 과 `slides` 가 있어야 합니다.
- `slides` 는 비어 있지 않은 배열이어야 합니다.
- 모든 슬라이드에는 `layout` 과 `title` 이 있어야 합니다.
- `schema/ppt-html-v0.1.schema.json` 을 구조 참고로 사용합니다.
- CSS, 스크립트, 절대 위치 텍스트 박스, PPTX XML을 생성하지 않습니다.
- 사람이 편집하며 만든 `canvas` 위치와 크기 조정이 이미 있다면 보존합니다. 사용자가 위치 미세 조정을 명확히 요청하지 않는 한 많은 `canvas` 좌표를 생성하지 않습니다.

권장 출력:

- 사용자가 편집기에 바로 붙여넣을 때는 순수 JSON을 출력합니다.
- 채팅에서 보여줄 때는 ```json 코드 블록을 써도 됩니다. 편집기가 읽을 수 있습니다.
- 사용자가 요청하지 않으면 JSON 뒤에 설명을 붙이지 않습니다.

## 2. Deck 구조

최소 deck:

```json
{
  "version": "0.1",
  "title": "제품 소개",
  "theme": "launch",
  "aspectRatio": "16:9",
  "slides": []
}
```

필드:

- `version`: 현재 `"0.1"` 고정.
- `title`: 문서 제목이며 기본 파일명에도 사용됩니다.
- `theme`: `paper`, `launch`, `studio`, `boardroom` 중 하나.
- `aspectRatio`: 현재 `"16:9"`.
- `slides`: 슬라이드 배열.

테마 가이드:

| 테마 | 적합한 상황 |
| --- | --- |
| `paper` | 강의, 지식 공유, 문서형 보고 |
| `launch` | 제품 발표, demo, 스토리 중심 발표 |
| `studio` | 제품 계획, 디자인 계획, 도구 소개 |
| `boardroom` | 프로젝트 보고, 사업 계획, 경영진 보고 |

## 3. Slide 구조

일반 slide:

```json
{
  "id": "slide-1",
  "layout": "hero",
  "kicker": "Product",
  "title": "PPT.html",
  "subtitle": "AI는 구조를 쓰고, 사람은 편집하고, 브라우저가 발표합니다",
  "body": "",
  "notes": ""
}
```

필드:

- `id`: `slide-1`, `slide-2` 같은 안정적인 ID.
- `layout`: 슬라이드 레이아웃 이름.
- `kicker`: 짧은 라벨. 비워도 됩니다.
- `title`: 슬라이드 주 제목.
- `subtitle`: 보조 문구.
- `body`: 긴 설명.
- `notes`: 발표자 메모.

작성 가이드:

- 제목은 짧게 유지합니다.
- 부제목을 긴 문단으로 만들지 않습니다.
- 긴 설명은 `body` 나 목록 필드에 넣습니다.
- 한 슬라이드에는 하나의 핵심 아이디어만 담습니다.

## 4. 테마와 레이아웃 선택

지원 layout:

| layout | 용도 | 주요 필드 |
| --- | --- | --- |
| `hero` | 표지, 시작 | `title`, `subtitle`, `image` |
| `section` | 섹션 구분 | `title`, `body` |
| `text` | 본문과 목록 | `title`, `body`, `items` |
| `imageRight` | 왼쪽 텍스트, 오른쪽 이미지 | `title`, `body`, `items`, `image` |
| `imageLeft` | 왼쪽 이미지, 오른쪽 텍스트 | `title`, `body`, `items`, `image` |
| `imageFull` | 전체 슬라이드 이미지 | `title`, `subtitle`, `image` |
| `imageBackground` | 이미지 배경과 텍스트 | `title`, `subtitle`, `body`, `items`, `image` |
| `compare` | 2열 비교 | `left`, `right` |
| `threeCards` | 세 가지 핵심 | `cards` |
| `quote` | 인용, 주장 | `quote`, `author` |
| `timeline` | 과정, 로드맵 | `items` |
| `data` | 핵심 지표 | `metrics` |
| `chart` | 추세, 그룹 값, 구성비 | `chart.kind`, `chart.labels`, `chart.series` |
| `table` | 계획표, 비교표 | `table.columns`, `table.rows` |
| `code` | 코드 표시 | `code` |
| `ending` | 마무리 | `title`, `subtitle` |

선택 규칙:

- 강한 시작이 필요하면 `hero`.
- 설명이 필요하면 `text`.
- 차이를 보여주려면 `compare`.
- 세 가지 장점이나 기능이면 `threeCards`.
- 시간 순서라면 `timeline`.
- 숫자를 강조하려면 `data`.
- 추세, 그룹 값, 구성비라면 `chart`.
- 계획이나 상태를 보여주려면 `table`.

## 5. 자주 쓰는 필드 형식

이미지:

```json
"image": {
  "src": "https://example.com/image.png",
  "alt": "제품 UI 스크린샷",
  "caption": "선택적 이미지 캡션",
  "fit": "cover"
}
```

`src` 는 URL 또는 `data:image/...;base64,...` 값을 사용할 수 있습니다. `fit` 은 채우기 crop에는 `cover`, 전체 표시에는 `contain` 을 사용합니다. 이미지 소스가 확실하지 않으면 비워 두고 사용자가 편집기에서 로컬 이미지를 선택하게 합니다.

목록 또는 타임라인:

```json
"items": [
  { "title": "1주차", "text": "목표와 demo 범위 확인" },
  { "title": "2주차", "text": "프로토타입 완성 및 피드백 수집" }
]
```

카드:

```json
"cards": [
  { "title": "명확한 구조", "text": "AI가 JSON을 생성하고 사람이 계속 편집합니다." },
  { "title": "단일 파일", "text": "하나의 .ppt.html 파일로 발표할 수 있습니다." },
  { "title": "안정적 렌더링", "text": "레이아웃은 렌더러가 처리합니다." }
]
```

지표:

```json
"metrics": [
  { "value": "3x", "label": "초안 속도", "detail": "빈 페이지에서 발표 가능한 초안까지." },
  { "value": "1 file", "label": "결과물", "detail": "별도 리소스 폴더가 필요 없습니다." }
]
```

차트:

```json
"chart": {
  "kind": "bar",
  "labels": ["Q1", "Q2", "Q3", "Q4"],
  "series": [
    { "name": "매출", "values": [12, 20, 31, 42] },
    { "name": "비용", "values": [8, 11, 18, 24] }
  ],
  "unit": "만원"
}
```

`bar` 는 비교, `line` 은 추세, `donut` 은 구성비에 적합합니다. 도넛 차트는 첫 번째 시리즈를 조각으로 사용합니다.

비교:

```json
"left": {
  "title": "기존 PPT",
  "text": "형식이 복잡함\nAI가 안정적으로 만들기 어려움\n다시 편집하기 어려움"
},
"right": {
  "title": "PPT.html",
  "text": "구조가 명확함\nAI가 생성하기 쉬움\n사람이 계속 편집할 수 있음"
}
```

표:

```json
"table": {
  "columns": ["단계", "시간", "상태"],
  "rows": [
    ["요구사항 확인", "1주차", "완료"],
    ["프로토타입", "2주차", "진행 중"]
  ]
}
```

캔버스 오프셋:

```json
"canvas": {
  "title": { "x": 24, "y": 36, "w": 720, "h": 96 },
  "cards.0.title": { "x": -12, "y": 8 }
}
```

`canvas` 는 사람이 캔버스에서 요소를 드래그하거나 크기를 조절했을 때 생기는 가벼운 조정을 저장합니다. 키는 `title`, `subtitle`, `cards.0.title`, `table.rows.1.2` 같은 구조화 필드 경로입니다. `x/y` 는 템플릿 위치 기준 픽셀 오프셋이고, `w/h` 는 선택적 너비와 최소 높이입니다. AI가 문구를 수정할 때는 기존 `canvas` 값을 가능한 한 보존해야 합니다. 사용자가 레이아웃 초기화나 템플릿 위치 복원을 요청할 때만 제거합니다.

## 6. 권장 생성 흐름

1. 사용자의 목표, 청중, 상황, 톤을 이해합니다.
2. 5개에서 10개 슬라이드의 개요를 만듭니다.
3. 각 슬라이드에 layout 하나를 선택합니다.
4. 짧은 제목과 구조화된 필드를 작성합니다.
5. 각 슬라이드가 하나의 핵심만 다루는지 확인합니다.
6. 완성된 deck JSON을 출력합니다.
7. 사용자가 검사 보고서를 보내면 보고서에 따라 수정합니다.

기본 슬라이드 흐름:

1. `hero`: 주제와 한 줄 가치.
2. `section` 또는 `text`: 배경이나 문제.
3. `compare`: 기존 방식과 새로운 방식.
4. `threeCards`: 해결책이나 기능.
5. `data` 또는 `chart`: 핵심 결과.
6. `timeline` 또는 `table`: 계획.
7. `ending`: 요약과 다음 행동.

## 7. 검사 보고서 수정 방법

사용자가 PPT.html Validation Report를 붙여넣으면:

1. `Status` 를 읽습니다.
2. 모든 `ERROR` 를 먼저 수정합니다.
3. 다음으로 `WARNING` 을 수정합니다.
4. 필요하면 `TIP` 을 처리합니다.
5. 사용자의 원래 의도를 유지합니다.
6. 수정된 전체 deck JSON을 반환합니다.

경로 예시:

- `version`: 최상위 `version` 수정.
- `slides[2].layout`: 세 번째 슬라이드 layout 수정.
- `slides[4].metrics`: 다섯 번째 슬라이드 지표 수정.
- `slides[1].image.src`: 이미지 소스 추가 또는 제거.

하지 말아야 할 것:

- HTML 출력.
- 일부 조각만 출력.
- 사용자의 중요한 내용을 삭제.
- `version` 을 다른 값으로 변경.

## 8. 완전한 예시

```json
{
  "version": "0.1",
  "title": "PPT.html Studio 제품 소개",
  "theme": "studio",
  "aspectRatio": "16:9",
  "slides": [
    {
      "id": "slide-1",
      "layout": "hero",
      "kicker": "Product",
      "title": "PPT.html Studio",
      "subtitle": "AI는 구조를 쓰고, 사람은 편집하고, 브라우저가 발표합니다",
      "notes": "이것은 PPTX 복제품이 아니라 AI 시대의 deck 형식이라는 점을 설명합니다."
    },
    {
      "id": "slide-2",
      "layout": "compare",
      "kicker": "Problem",
      "title": "기존 PPT는 AI와 잘 맞지 않습니다",
      "left": {
        "title": "기존 PPT",
        "text": "파일 구조가 복잡함\n좌표와 스타일이 분산됨\nAI가 유지하기 어려움"
      },
      "right": {
        "title": "PPT.html",
        "text": "JSON 구조가 명확함\n템플릿이 배치를 처리함\n사람이 계속 편집 가능"
      }
    },
    {
      "id": "slide-3",
      "layout": "threeCards",
      "kicker": "Workflow",
      "title": "세 단계로 deck 만들기",
      "cards": [
        { "title": "구조 생성", "text": "AI가 deck JSON을 출력합니다." },
        { "title": "시각적 편집", "text": "사람이 내용, 이미지, 순서를 조정합니다." },
        { "title": "한 파일로 공유", "text": "재생 가능한 .ppt.html을 내보냅니다." }
      ]
    },
    {
      "id": "slide-4",
      "layout": "data",
      "kicker": "Value",
      "title": "가치",
      "metrics": [
        { "value": "1 file", "label": "결과물", "detail": "리소스 폴더 없이 재생." },
        { "value": "4", "label": "플랫폼 빌드", "detail": "Linux, macOS arm64, macOS x64, Windows." },
        { "value": "0.1", "label": "안정적 형식", "detail": "AI가 생성하고 수정하기 쉬움." }
      ]
    },
    {
      "id": "slide-5",
      "layout": "ending",
      "title": "AI와 사람이 함께 deck을 편집합니다",
      "subtitle": "다음 단계: 템플릿에서 첫 .ppt.html 만들기"
    }
  ]
}
```

## 9. 재사용 가능한 프롬프트

새 deck 생성:

```text
PPT.html Studio용 완전한 deck JSON을 생성해 주세요.
요구사항:
- version은 반드시 "0.1"
- 6장 생성
- theme은 boardroom
- 모든 슬라이드에는 id, layout, title 포함
- hero, compare, threeCards, data, chart, table, ending 우선 사용
- 자유 형식 HTML 출력 금지
- 설명하지 말고 JSON만 출력

주제:
{여기에 주제 입력}

청중:
{여기에 청중 입력}

톤:
{공식 / 캐주얼 / 제품 발표 / 교육}
```

검사 보고서로 수정:

```text
아래는 PPT.html Validation Report입니다.
deck JSON을 수정해 주세요:
- ERROR를 먼저 수정
- 그다음 WARNING 수정
- version은 "0.1" 유지
- HTML 출력 금지
- 수정된 전체 deck JSON 반환
```

## 10. 흔한 실수 체크리스트

출력 전 확인:

- `version` 이 정확히 `"0.1"` 인가?
- `theme` 이 `paper`, `launch`, `studio`, `boardroom` 중 하나인가?
- `slides` 에 슬라이드가 최소 1장 있는가?
- 모든 슬라이드에 유효한 `layout` 이 있는가?
- 모든 슬라이드에 `title` 이 있는가?
- `threeCards` 는 3개 이하인가?
- `data` 는 지표 3개 이하인가?
- `chart` 에 라벨과 숫자 시리즈 값이 있는가?
- `timeline` 은 항목 5개 이하인가?
- 이미지에 `alt` 텍스트가 있는가?
- 자유 형식 HTML을 출력하지 않았는가?

레이아웃 선택이 애매하면 가장 범용적인 `text` 를 사용합니다.
