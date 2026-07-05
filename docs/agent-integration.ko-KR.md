# AI Agent 연동 가이드

이 문서는 Codex, 콘텐츠 생성 agent, 테스트 agent, 자동화 스크립트, 외부 도구가 PPT.html Studio 와 안정적으로 연동하기 위한 가이드입니다. 목표는 생성, 수정, 검증, 내보내기를 안정화하고 사람이 캔버스에서 편집한 내용을 보존하는 것입니다.

## 제품 모델

PPT.html Studio 의 원본은 자유 HTML 이 아닙니다. 안정적인 계약은 다음과 같습니다.

- AI agent 는 구조화된 deck JSON 을 편집합니다.
- 사용자는 Keynote / PowerPoint 와 비슷한 캔버스에서 시각적으로 편집합니다.
- 앱은 JSON, asset, renderer, player 를 하나의 `.ppt.html` 파일로 패키징합니다.

agent 는 최종 HTML DOM 이 아니라 deck JSON 을 다뤄야 합니다.

## 연동 수준

가벼운 연동:

- `docs/tutorial-ai.ko-KR.md`
- `schema/ppt-html-v0.1.schema.json`
- `spec/ppt-html-v0.1.md`

권장 연동:

- `skills/htmlppt/SKILL.md`
- `skills/htmlppt/references/*.md`
- `scripts/agent-deck.js`

Codex skill 로컬 설치:

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

사람에게는 텍스트 리포트를, 자동화 agent 에게는 `--json` 을 사용합니다.

## 기본 워크플로

새 deck 생성:

1. 주제, 대상, 언어, 슬라이드 수를 확인합니다.
2. 완전한 deck JSON 을 출력합니다.
3. `npm run deck:validate -- draft.json` 으로 검증합니다.
4. 모든 `ERROR` 를 수정합니다.
5. standalone 파일이 필요하면 `npm run deck:build -- draft.json output.ppt.html` 을 실행합니다.

기존 `.ppt.html` 편집:

1. `npm run deck:extract -- old.ppt.html old.deck.json` 으로 JSON 을 추출합니다.
2. JSON 을 수정합니다.
3. 기존 `id`, `canvas`, `styles`, `textBoxes`, `objects`, media `src`, `notes` 를 보존합니다.
4. 검증하고 다시 빌드합니다.

## Agent 필수 규칙

- `version` 은 `"0.1"` 입니다.
- `aspectRatio` 는 `"16:9"` 입니다.
- `theme` 은 `paper`, `launch`, `studio`, `boardroom` 중 하나입니다.
- deck 에는 비어 있지 않은 `slides` 배열이 필요합니다.
- 각 slide 에는 `layout` 과 `title` 이 필요합니다.
- 자유 HTML/CSS/JS/PPTX XML 을 출력하지 마세요.
- 임시 로컬 media 경로를 만들지 마세요.
- 사용자가 편집한 `canvas`, `styles`, `textBoxes`, `objects`, media `src`, `notes` 를 보존하세요.

## 구현 계획

P0:

- validate / extract / build 용 Agent CLI.
- 생성, 수정, 유지보수용 Codex skill.
- `AGENTS.md` 와 연동 문서.
- `slide.objects[]` 객체 단위 검증.
- 이미지, 비디오, 오디오, 차트, 테이블용 Typed Inspector.
- 품질 검사에서 AI 수정 Prompt 복사.

P1:

- AI patch 리뷰.
- PDF/PNG 내보내기.
- 레이어 목록, 잠금, 그룹, 스냅 가이드.

P2:

- 로컬 MCP 또는 service mode.
- PPTX/ODP 호환.
- 브랜드 템플릿, 마스터, 페이지 번호, 테마 token.

## 검증

탐색 중에는 읽기 중심 gate 를 사용합니다.

```bash
npm run test:readonly
```

최종 제출 전:

```bash
npm test
git diff -- examples/ai-camera.ppt.html
```

`npm test` 는 샘플을 다시 생성합니다. 의도한 렌더링 변경일 때만 diff 를 유지하세요.
