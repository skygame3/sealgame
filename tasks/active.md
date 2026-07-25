<!--
Purpose:        현재 진행 중인 태스크 추적
Owner:          Implementer / Planner
Update Trigger: 태스크 시작·완료·블로킹
Harness Version: 1.1
-->

# Active Tasks — SEAL

_Last updated: 2026-07-24_

## In Progress

| ID | Task | Owner | Started | Due |
|----|------|-------|---------|-----|
| TASK-001 | Expo + TypeScript 프로젝트 초기화, GitHub 저장소 생성 | Implementer | 2026-07-24 | — |

### TASK-001: 프로젝트 초기화

- **Owner**: Implementer
- **Priority**: High
- **Milestone**: M0
- **Description**: Expo(TypeScript strict) 프로젝트 생성, GitHub 저장소 연결, ADR-004에 맞는 폴더 구조 확립.
- **Definition of Done**:
  - [ ] `npx create-expo-app` + TypeScript strict mode
  - [ ] GitHub 저장소 생성, main 브랜치 보호 규칙 설정
  - [ ] `src/{engine,ai,store,screens,components,net}` 구조 생성
  - [ ] 하니스 문서(AGENTS.md 등 루트 파일 + memory/·tasks/·prompts/)를 저장소에 커밋
  - [ ] `npx expo start`로 빈 앱 실행 확인

## Next Up (M0 잔여)

TASK-002(린트·테스트 설정) → TASK-003(CI) → TASK-005(보드 스키마) → TASK-006(H형 보드)

## Task Detail Template

```
### TASK-XXX: [제목]
- **Owner**: [에이전트 역할]
- **Priority**: High | Medium | Low
- **Milestone**: M[N]
- **Description**:
- **Definition of Done**:
  - [ ] [조건 1]
```
