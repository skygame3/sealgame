<!--
Purpose:        현재 세션 상태 — 에이전트 간 컨텍스트 인계
Owner:          현재 활성 에이전트
Update Trigger: 세션 시작 시 읽고, 종료 전 반드시 갱신
Harness Version: 1.1
-->

# Current Session — SEAL

> 세션 종료 후 이 파일을 `memory/sessions/YYYY-MM-DD-[ROLE].md`로 복사할 것.

---

## Session Info

- **Date**: 2026-07-24
- **Agent Role**: Architect
- **Session Goal**: 구현 착수 전 전체 설계 완결

## Completed This Session

- [x] 하네스 v1.1 초기 셋업
- [x] 게임 규칙 5건 확정 (ADR-008), game-rules.md v1.0
- [x] 밸런스 대안 플래그 설계 (ADR-009)
- [x] **통합 설계 명세서 docs/design-spec.md v1.0 확정 (ADR-011)**
- [x] 온라인 상태 저장을 Move 로그 방식으로 결정 (ADR-010)
- [x] i18n + 저장/생명주기 설계 선반영 (ADR-012, design-spec §6.5/§6.6)
- [x] 초보 개발자용 온보딩 가이드 작성 (docs/PROJECT-GUIDE.md)

## design-spec.md에 확정된 것

1. 레이어 아키텍처 (UI→Store→Engine, 역방향 import 금지)
2. 데이터 모델 전체 (GameState, Move, BoardDef, RuleConfig, MoveResult)
3. Engine 공개 API 전체 시그니처 + 포획 알고리즘
4. 보드 JSON 스키마 + H보드 초안 + validateBoard 규칙
5. AI 설계 (Minimax+αβ, 평가함수, 난이도 3단계, 블로킹 방지)
6. 온라인 (RTDB Move 로그, 서버 검증 흐름, Security Rules, 엣지케이스)
7. 폴더 구조 확정
8. Zustand store 인터페이스
9. UI/렌더링 (SVG, 히트영역, 접근성)
10. 구현 순서 (설계→코드 매핑)

## Decisions Made

- ADR-010: 온라인은 전체 state가 아닌 Move 로그 저장 (페이로드 최소 + 리플레이 무료 + 서버검증 자연)
- ADR-011: design-spec v1.0 확정, 구현 착수 승인

## Open (설계를 막지 않음)

OPEN-1~6: 전부 파라미터/후속 마일스톤. 특히 OPEN-3(crystalPlaceMode 기본값)=BAL-001은 M2 자가대전으로 데이터 판단.

## Next Session: To-Do

1. **TASK-001** — Expo(TS strict) 초기화 + GitHub 저장소 + 폴더 구조 (design-spec §7)
   - app.config.ts scheme/bundleId 필수, npx expo install 사용, EXPO_PUBLIC_ prefix
2. TASK-002 — ESLint/Prettier/Jest(jest-expo)
3. TASK-003 — GitHub Actions CI
4. TASK-005/006 — validateBoard + h.json (design-spec §4)
5. TASK-010 — engine/types.ts (design-spec §2)

## Important Context

- **명세 이원화**: game-rules.md = 규칙(무엇), design-spec.md = 구조(어떻게). 구현 시 둘 다 참조.
- 규칙 로직은 engine/에만. functions/도 src/engine을 import해 동일 코드로 검증.
- BAL-001(영구 제거 스노우볼) M2 검증 최우선. crystalPlaceMode 플래그로 A/B.
- 구현은 design-spec §10 순서대로. 순서 6 완료 = MVP 플레이 가능.
