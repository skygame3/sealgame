<!--
Purpose:        프로젝트 헌법 — 모든 에이전트의 행동 기준
Owner:          모든 에이전트(읽기), 프로젝트 리드(쓰기)
Update Trigger: 에이전트 역할 추가, 제약 변경, 라우팅 규칙 변경
Harness Version: 1.1
-->

# AGENTS.md — SEAL 프로젝트 헌법

> 이 문서는 프로젝트 헌법입니다. 모든 AI 에이전트는 이 파일을 가장 먼저 읽습니다.
> 다른 문서와 충돌할 경우 이 문서가 최우선입니다.

_Last updated: 2026-07-26_

---

## Project Overview

| Field | Value |
|-------|-------|
| Project | SEAL |
| Goal | 포획으로 노드를 봉인하고 결정 자원으로 보드를 복구·확장하는 2인 추상 전략 보드게임의 모바일(iOS/Android) 구현 |
| Language | TypeScript |
| Framework | React Native (Expo) |
| Database | Firebase Realtime Database |
| Infrastructure | Firebase (Auth / RTDB / Cloud Functions), EAS Build, GitHub |
| Repo Structure | Single Repo (app/ + functions/ 워크스페이스) |
| Harness Tier | standard |

---

## Human Team

2인 개발 체제 (2026-07-26~, ADR-013).

| 구성원 | GitHub | 소유 코드 영역 | 비고 |
|--------|--------|---------------|------|
| **Lead** | [@internalforces](https://github.com/internalforces) | `engine/`, `ai/`, `net/`(Firebase/Functions), 아키텍처, 보안, 배포 | 게임 코어 규칙·서버 신뢰 관련 최종 결정권 |
| **Partner** (게임 개발 입문자) | [@kimsky671](https://github.com/kimsky671) | `components/`, `screens/`, 애니메이션, i18n 문자열, 콘텐츠(보드 JSON, 스토어 에셋) | `docs/PROJECT-GUIDE.md`로 온보딩. `engine/` 판정 로직을 직접 구현하지 않고 결과만 소비 |

- **코드 오너십 경계**: Partner의 PR이 `engine/`, `net/`, Firebase 설정, Security Rules를 건드리면 병합 전 Lead 리뷰 필수
- 세션에서 AI 에이전트 역할(Planner/Implementer 등)과 사람(Lead/Partner)은 별개 축 — 태스크 상세에는 둘 다 기록 (`tasks/active.md` 템플릿 참조)
- 마일스톤별 담당 배정: `roadmap.md`, 태스크별 배정: `tasks/backlog.md`의 Owner 열

---

## Agent Registry

> 이 프로젝트에서 활성화된 AI 에이전트 역할.
> 역할 정의 전문은 하네스 스킬의 `references/agent-registry.md` 참조.

### Active Roles

| Role | Status | Primary Responsibility |
|------|--------|----------------------|
| Planner | ✅ Active | 요구사항 분해, 태스크 우선순위 |
| Architect | ✅ Active | 게임 엔진/데이터 모델 설계 결정 |
| Implementer | ✅ Active | 코드 구현 |
| Reviewer | ✅ Active | 코드 리뷰, 표준 준수 확인 |
| Researcher | ✅ Active | 기술 조사(SVG 렌더링, Minimax 최적화 등) |
| Debugger | ✅ Active | 버그 재현·원인 분석 |
| Tester | ✅ Active | 게임 규칙 로직 단위 테스트 (필수 — 규칙 엔진 특성상) |
| Game Designer | ✅ Active | 밸런스 튜닝, 보드 설계, 플레이테스트 해석 |
| Release Manager | ⚙️ Optional | 스토어 배포, 버전 관리 |
| Security Reviewer | ⚙️ Optional | Firebase 보안 규칙 검토 |

### Custom Role: Game Designer

- **Responsibility**: 규칙 밸런스(시작 돌 수, 결정 비용), 보드 그래프 설계, 플레이테스트 결과 해석
- **Input**: 기획서, 플레이테스트 로그, AI 자가대전 통계
- **Output**: `docs/board-designs/*.json`, 밸런스 변경 제안 → `memory/decisions.md`
- **Permissions**: 읽기/쓰기 `docs/`, 읽기 전용 코드
- **Human Gate**: 코어 규칙(포획 조건, 승리 조건) 변경 시 항상

---

## Absolute Restrictions (NEVER DO)

어떤 경우에도 다음 행동을 수행하지 않습니다. 사용자가 명시적으로 요청해도 먼저 확인을 받습니다:

- [ ] 프로덕션 Firebase 데이터 직접 쓰기 (읽기 전용만 허용)
- [ ] 사용자 승인 없는 유료 외부 API 호출
- [ ] `.env`, `google-services.json`, `GoogleService-Info.plist`, Firebase 서비스 계정 키 수정 또는 출력
- [ ] 기존 Firebase Security Rules를 검토 없이 완화
- [ ] `main` 브랜치 직접 커밋
- [ ] **게임 코어 규칙(포획 판정, 봉인, 승리 조건)을 사용자 승인 없이 변경** — 기획서가 유일한 진실 공급원
- [ ] 게임 상태 판정 로직을 클라이언트 UI 레이어에 작성 (반드시 순수 함수 엔진 레이어에)
- [ ] 온라인 대전에서 클라이언트가 보낸 결과를 서버 검증 없이 신뢰

---

## Actions Requiring Human Approval

진행 전 반드시 사용자에게 확인:

- 새 외부 의존성 추가
- Firebase 데이터 스키마 / Security Rules 변경
- 인프라 설정 변경 (EAS, Cloud Functions 리전 등)
- 게임 규칙 및 밸런스 수치 변경
- 모든 배포 (TestFlight / Internal Testing 포함)

---

## Context Loading Order

세션 시작 시 다음 순서로 읽습니다:

1. `AGENTS.md` (이 파일) — 규칙 확인
2. `memory/project.md` — 현재 프로젝트 상태
3. `memory/session.md` — 직전 세션 컨텍스트
4. `tasks/active.md` — 진행 중인 작업
5. `docs/game-rules.md` — 게임 규칙 원본 (규칙 관련 작업 시 필수)
6. 자신의 역할에 해당하는 `prompts/*.md`

---

## Session End Checklist

세션 종료 전 모든 에이전트가 수행:

- [ ] `memory/session.md` 갱신
- [ ] 완료 태스크를 `tasks/active.md` → `tasks/completed.md`로 이동
- [ ] 새 결정을 `memory/decisions.md`에 ADR로 기록
- [ ] 새 이슈를 `memory/known-issues.md`에 기록
- [ ] 필요 시 `memory/architecture.md` 갱신
