<!--
Purpose:        현재 진행 중인 태스크 추적
Owner:          Implementer / Planner
Update Trigger: 태스크 시작·완료·블로킹
Harness Version: 1.1
-->

# Active Tasks — SEAL

_Last updated: 2026-07-30_

## In Progress

현재 진행 중인 태스크 없음. TASK-004를 다음으로 시작한다.

## Next Up (M0 잔여)

TASK-002(린트·테스트 설정) → TASK-003(CI) → TASK-005(보드 스키마) → TASK-006(H형 보드)

> **참고**: M1의 TASK-010(GameState/Move/BoardDef/RuleConfig 타입)은 M0 완료 전에 순서를 앞당겨 `app/src/engine/types.ts`로 먼저 확정함(2026-07-26) — Partner가 TASK-017(SVG 렌더러)을 mock 데이터로 조기 착수할 수 있도록. 상세는 `tasks/completed.md` 참조.

## Task Detail Template

```
### TASK-XXX: [제목]
- **Owner**: [에이전트 역할]
- **Human**: Lead | Partner | Pair
- **Priority**: High | Medium | Low
- **Milestone**: M[N]
- **Description**:
- **Definition of Done**:
  - [ ] [조건 1]
```
