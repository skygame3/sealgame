<!--
Purpose:        에이전트 협업 시퀀스와 Human Approval Gate 정의
Owner:          Architect / Planner
Update Trigger: 워크플로우 추가, 역할 변경, 승인 정책 변경
Harness Version: 1.1
-->

# ORCHESTRATOR.md — SEAL 워크플로우 플레이북

_Last updated: 2026-07-24_

---

## Feature Workflow

```
[Planner]     기능 분해 → tasks/backlog.md 등록
    ↓
[Architect]   설계 (엔진/상태/동기화에 영향 있을 때만)
    ↓ ⚠️ HUMAN APPROVAL — 새 의존성 또는 데이터 스키마 변경 시
[Implementer] 구현
    ↓
[Tester]      규칙 로직이면 단위 테스트 필수 작성
    ↓
[Reviewer]    코드 리뷰 → reports/ 저장
    ↓ ⚠️ HUMAN APPROVAL — 머지 전
```

## Game Rule Workflow (SEAL 전용)

```
[Game Designer] 규칙/밸런스 변경 제안 → 근거(플레이테스트·AI 자가대전 통계) 첨부
    ↓ ⚠️ HUMAN APPROVAL — 항상 (기획서가 진실 공급원)
[Architect]     엔진 영향 범위 분석 → memory/decisions.md ADR 기록
    ↓
[Implementer]   engine/ 순수 함수 레이어만 수정
    ↓
[Tester]        기존 규칙 테스트 전부 통과 확인 + 신규 케이스 추가
    ↓
[Game Designer] AI 자가대전 1000판 돌려 밸런스 리그레션 확인
```

## BugFix Workflow

```
[Debugger]    재현 → 근본 원인 → known-issues.md 등록
    ↓ 규칙 판정 버그면: 실패하는 테스트 케이스부터 작성
[Implementer] 수정
    ↓
[Reviewer]    리뷰
    ↓ ⚠️ HUMAN APPROVAL — 스토어 배포 전
```

## Research Workflow

```
[Researcher]  조사 → reports/research-*.md
    ↓
[Architect]   결정 → memory/decisions.md (ADR)
    ↓
[Planner]     필요 시 태스크로 전환
```

## Online Match Workflow (SEAL 전용)

```
[Architect]         동기화 모델 설계 (권위 위치, 재접속 처리, 무결성)
    ↓ ⚠️ HUMAN APPROVAL — RTDB 스키마 / Security Rules 변경
[Implementer]       Cloud Functions 검증 로직 + 클라이언트 연동
    ↓
[Security Reviewer] Security Rules 검토 (치팅·무단 읽기)
    ↓ ⚠️ HUMAN APPROVAL — 항상
[Tester]            2-클라이언트 통합 테스트, 네트워크 단절 시나리오
```

## Release Workflow

```
[Reviewer]        최종 리뷰 → CHANGELOG 작성
[Release Manager] EAS 빌드 → 내부 테스트 배포
    ↓ ⚠️ HUMAN APPROVAL — 스토어 제출
배포 후: memory/project.md 버전 갱신, tasks/completed.md 정리
```

---

## Human Approval Gates Summary

| 상황 | 이유 |
|------|------|
| 새 외부 의존성 | 보안·라이선스·번들 크기 검토 |
| Firebase 스키마 / Security Rules 변경 | 되돌리기 어려움, 치팅 위험 |
| 게임 코어 규칙 및 밸런스 수치 변경 | 기획 의도 훼손 방지 |
| 스토어 배포 (내부 테스트 포함) | 최종 책임은 사람에게 |
| 보안 관련 변경 | 취약점 위험 |

---

## Task Routing Matrix

| 트리거 | 1차 에이전트 | 2차 에이전트 | Human Gate |
|--------|------------|------------|-----------|
| 신규 기능 요청 | Planner | Implementer → Reviewer | 머지 전 |
| 버그 리포트 | Debugger | Implementer → Reviewer | 배포 전 |
| 규칙 판정 오류 | Tester | Implementer | 규칙 해석이 갈릴 때 |
| 밸런스 이슈 | Game Designer | Architect | 항상 |
| 기술 선택 | Researcher | Architect | 외부 의존성 추가 시 |
| 온라인 동기화 이슈 | Architect | Implementer → Security Reviewer | 항상 |
| 성능 저하 (렌더링/AI 탐색) | Debugger | Implementer | 없음 |
| 릴리스 준비 | Release Manager | Reviewer | 항상 |
