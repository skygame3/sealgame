<!--
Purpose:        코드 및 문서 품질 표준
Owner:          Reviewer
Update Trigger: 코드 스타일 변경, 도구 추가, 커버리지 기준 변경
Harness Version: 1.1
-->

# standards.md — SEAL 표준

_Last updated: 2026-07-24_

## Code Style

- **Language**: TypeScript (strict mode 필수)
- **Indentation**: 2 spaces
- **Max line length**: 100
- **Naming**: 변수/함수 `camelCase`, 타입/컴포넌트 `PascalCase`, 상수 `UPPER_SNAKE_CASE`
- **Tooling**: ESLint (expo config) + Prettier
- **금지**: `any`, 엔진 레이어 내 `let` 기반 가변 상태 변형

## Engine Layer 규칙 (SEAL 핵심)

`src/engine/` 안의 모든 코드는:

- 순수 함수여야 함 — 동일 입력 → 동일 출력, 부작용 없음
- React, Firebase, 플랫폼 API를 import 하지 않음
- 상태를 제자리 변경하지 않고 새 객체를 반환
- 모든 공개 함수에 단위 테스트 필수

```ts
// 시그니처 예시
applyMove(state: GameState, move: Move): MoveResult
resolveCaptures(state: GameState, placedNode: NodeId): CaptureResult
isTerminal(state: GameState): boolean
scoreBoard(state: GameState): Score
legalMoves(state: GameState): Move[]
```

## Commit Messages

```
<type>(<scope>): <subject>
```
Types: `feat` | `fix` | `docs` | `style` | `refactor` | `test` | `chore` | `security` | `balance`

scope 예: `engine`, `ai`, `board`, `net`, `ui`

`balance` 타입은 게임 수치 변경 전용 — 반드시 근거 데이터를 본문에 포함.

## PR Rules

- 제목은 커밋 메시지 형식을 따름
- 머지 전 Reviewer 에이전트 승인 필요
- `main` 직접 커밋 금지 — 항상 브랜치 → PR
- engine/ 변경 PR은 테스트 결과를 본문에 첨부

## Test Standards

| 대상 | 요구 커버리지 |
|------|-------------|
| `src/engine/` | **100%** — 규칙이 곧 제품 |
| `src/ai/` | 80% (탐색 정확성 + 성능 회귀) |
| `functions/` | 80% |
| UI 컴포넌트 | 스냅샷 + 핵심 인터랙션만 |

- 프레임워크: Jest + jest-expo, React Native Testing Library
- 규칙 버그 발견 시: **먼저 실패하는 테스트를 작성**하고 수정

## Security Standards

- 코드에 시크릿 하드코딩 금지
- Firebase Security Rules는 기본 거부(deny-by-default)
- 온라인 대전: 클라이언트가 보낸 "결과"를 신뢰하지 않음. 서버는 항상 `applyMove`를 재실행해 검증
- 의존성 취약점 정기 스캔 (`npm audit`, GitHub Dependabot)

## Documentation Standards

- 모든 공개 함수·API에 주석
- 복잡 로직(포획 판정, 알파-베타 가지치기)은 인라인 설명 필수
- 주요 결정은 `memory/decisions.md`에 ADR로 기록
- 새 보드 추가 시 `boards/README.md`에 노드/엣지 스펙 기록

## Review Checklist (리뷰 요청 전 자가 점검)

- [ ] 코드 스타일 준수, 타입 에러 없음
- [ ] engine/ 변경 시 커버리지 100% 유지
- [ ] 보안 이슈 없음
- [ ] 문서화 완료
- [ ] AGENTS.md 제약 위반 없음
- [ ] 게임 규칙이 기획서와 일치
