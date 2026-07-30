<!--
Purpose:        완료 태스크 아카이브 (누적, 삭제하지 않음)
Owner:          Implementer / Planner
Update Trigger: 태스크 완료 시
Harness Version: 1.1
-->

# Completed Tasks — SEAL

_Last updated: 2026-07-26_

| ID | Task | Completed | Owner | Notes |
|----|------|-----------|-------|-------|
| TASK-004 | 폴더 구조 확정 (engine/ai/store/ui/net) | 2026-07-30 | Implementer | `app/src` 레이어, `boards/`, `functions/src/` 구조를 Git 추적 마커로 확정. 리뷰: `reports/review-2026-07-30-task-004.md` |
| TASK-003 | GitHub Actions CI (lint + typecheck + test) | 2026-07-30 | Implementer | `main` 대상 PR CI에 format·lint·typecheck·test를 구성하고, `CI / quality`를 필수 보호 검사로 지정. 리뷰: `reports/review-2026-07-30-task-003.md` |
| TASK-002 | ESLint / Prettier / Jest 설정 | 2026-07-30 | Implementer | Expo 호환 린트·포맷·테스트 스크립트와 smoke test 구성. 리뷰: `reports/review-2026-07-30-task-002.md` |
| TASK-001 | Expo + TypeScript 프로젝트 초기화, GitHub 저장소 생성 | 2026-07-30 | Implementer | Expo Router + strict TypeScript 앱을 `app/`에 구성하고 빈 앱 실행을 확인. GitHub 원격은 기존 연결을 재사용. `main`은 PR 1인 승인·대화 해결·선형 이력·강제 푸시/삭제 금지로 보호. 리뷰: `reports/review-2026-07-30-task-001.md` |
| — | AI Development Harness v1.1 초기 셋업 | 2026-07-24 | Architect | standard tier |
| TASK-000 | 미확정 규칙 5건(RQ-001~005) 확정 | 2026-07-24 | 사용자 + Game Designer | ADR-008. game-rules.md v1.0 확정. BAL-001 밸런스 감시 항목 등록 |
| TASK-010 | GameState / Move / BoardDef / RuleConfig 타입 정의 | 2026-07-26 | Implementer (Lead) | `app/src/engine/types.ts` 작성. design-spec.md §2를 그대로 코드화. engine↔UI 계약 확정 — Partner가 TASK-017/018을 mock 데이터로 병행 착수 가능 |
