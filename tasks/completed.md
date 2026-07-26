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
| — | AI Development Harness v1.1 초기 셋업 | 2026-07-24 | Architect | standard tier |
| TASK-000 | 미확정 규칙 5건(RQ-001~005) 확정 | 2026-07-24 | 사용자 + Game Designer | ADR-008. game-rules.md v1.0 확정. BAL-001 밸런스 감시 항목 등록 |
| TASK-010 | GameState / Move / BoardDef / RuleConfig 타입 정의 | 2026-07-26 | Implementer (Lead) | `app/src/engine/types.ts` 작성. design-spec.md §2를 그대로 코드화. engine↔UI 계약 확정 — Partner가 TASK-017/018을 mock 데이터로 병행 착수 가능 |
