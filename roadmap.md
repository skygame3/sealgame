<!--
Purpose:        프로젝트 마일스톤과 기능 계획
Owner:          Planner
Update Trigger: 마일스톤 완료, 기능 추가, 우선순위 변경
Harness Version: 1.1
-->

# roadmap.md — SEAL 로드맵

_Last updated: 2026-07-26_

## Goal

포획으로 노드를 봉인하고 결정 자원으로 보드를 복구·확장하는 2인 추상 전략 보드게임을 iOS/Android 앱으로 구현한다.

---

## 팀 역할 분담 (ADR-013)

2인 개발 체제: **Lead** [@internalforces](https://github.com/internalforces)(본인) + **Partner** [@kimsky671](https://github.com/kimsky671)(게임 개발 입문자). 원칙은 기존 레이어 분리(ADR-004)를 그대로 인적 경계로 사용 — Lead가 `engine/ai/net`, Partner가 `components/screens`(UI)를 담당. 태스크 단위 배정은 `tasks/backlog.md`의 Owner 열이 정본이며, 아래는 마일스톤별 요약이다.

| Milestone | Lead 담당 | Partner 담당 | 비고 |
|-----------|-----------|--------------|------|
| **M0 — 기반** | CI, 폴더 구조, 보드 스키마 설계, MMKV 래퍼 | H형 보드 데이터 작성, i18n 구조 셋업 | 프로젝트 초기화·린트 설정은 Pair로 온보딩 겸 진행 |
| **M1 — 규칙 엔진 & 로컬 플레이** | `engine/` 전체(합법수·포획·봉인·결정·종료 판정), 단위 테스트 100%, 자동저장/생명주기 | SVG 보드 렌더러, 로컬 핫시트 화면 | `GameState`/`Move` 타입(TASK-010)을 최우선 확정해야 Partner가 병렬 착수 가능. Zustand 스토어 연결은 Pair |
| **M2 — AI & 게임 느낌** | Minimax/평가함수/시뮬레이터/BAL-001 검증, 탐색 비동기화 | 봉인·포획 애니메이션, 햅틱, 인터랙티브 튜토리얼 | 튜토리얼 규칙 텍스트는 Lead 리뷰 |
| **M3 — 온라인 대전** | Firebase/RTDB/Cloud Functions/매칭/Security Rules 전체 | (세부 태스크 분리 시 검토) 대기실·재접속·리플레이 재생 화면 | 서버 신뢰·보안이 걸린 영역이라 기본적으로 Lead 소유. Partner 참여는 UI 서브태스크로 명확히 분리한 뒤 배정 |
| **M4 — 출시** | 스토어 배포(TestFlight/심사 제출, 계정 권한 필요) | 보드 3종 콘텐츠, 아이콘/스플래시/스토어 에셋, 설정 화면 | 스토어 에셋은 Partner 작업 + Lead 최종 확인 |

---

## M0 — 기반 (1주)

- [ ] Expo + TypeScript 프로젝트 초기화, GitHub 저장소 생성
- [ ] ESLint / Prettier / Jest 설정
- [ ] GitHub Actions CI (lint + typecheck + test)
- [ ] 폴더 구조 확정 (engine / ai / store / ui / net)
- [ ] 보드 정의 JSON 스키마 설계 + H형 보드 1종 작성

## M1 — 규칙 엔진 & 로컬 플레이 (MVP 핵심)

**목표: 기획서의 MVP 범위를 전부 검증 가능한 상태로 만든다**

- [ ] `engine/`: GameState 타입, 돌 놓기, 합법수 생성
- [ ] `engine/`: 포획 판정 (내 돌–상대 돌–내 돌, 다중 동시 포획 포함)
- [ ] `engine/`: 봉인 처리 및 봉인 노드 배치 제한
- [ ] `engine/`: 결정 획득/소비 3종 (추가 배치 / 봉인 복구 / 잠긴 노드 개방)
- [ ] `engine/`: 종료 조건 + 승패 + 동점 규칙(핵심 노드 → 후공 승)
- [ ] 엔진 단위 테스트 커버리지 100%
- [ ] SVG 보드 렌더러 (노드/엣지/돌/봉인 X 표시)
- [ ] 로컬 2인 핫시트 플레이 (한 기기에서 번갈아)
- [ ] Zustand 스토어 연결, 되돌리기(undo) 지원
- [ ] i18n 구조 셋업 (ko/en) + 문자열 키화 (§6.5)
- [ ] MMKV 저장 + 이어하기 + AppState 생명주기 (§6.6)

## M2 — AI 상대 & 게임 느낌

- [ ] Minimax + 알파-베타 탐색기 (엔진 재사용)
- [ ] 평가 함수: 돌 수 + 공간 지배 + 결정 보유 + 핵심 노드
- [ ] 난이도 3단계 (탐색 깊이 + 노이즈)
- [ ] AI 자가대전 시뮬레이터 (`npm run sim`) → 밸런스 데이터 수집
- [ ] 봉인/포획/개방 애니메이션, 햅틱 피드백
- [ ] 튜토리얼 (규칙 4단계 인터랙티브)
- [ ] 로컬 저장 (진행 중 게임 이어하기)

## M3 — 온라인 대전

- [ ] Firebase Auth 익명 로그인
- [ ] RTDB 대전 상태 스키마 설계
- [ ] Cloud Functions 수 검증 (서버 권위)
- [ ] 매칭: 방 코드 → 랜덤 큐
- [ ] Security Rules (deny-by-default) + 보안 리뷰
- [ ] 재접속 / 타임아웃 / 항복 처리
- [ ] 대전 기록 저장 & 리플레이

## M4 — v1.0 출시

- [ ] 보드 3종 추가 (별, 육각형, 십자가)
- [ ] 앱 아이콘 / 스플래시 / 스토어 스크린샷
- [ ] 설정 (사운드, 언어, 접근성)
- [ ] TestFlight / Internal Testing 배포
- [ ] 스토어 심사 제출

---

## Backlog Ideas

- 대회 모드 (동일 보드 2판, 선후공 교대, 승점 합산)
- 보드 에디터 (사용자 제작 보드 공유)
- 특수 노드 규칙 (순간이동, 양방향 문, 일회용, 회전 보드)
- 일일 퍼즐 (정해진 수 안에 승리)
- 관전 모드

## Out of Scope (v1.0)

- 3인 이상 플레이
- 실물 보드게임 제작·유통
- 수익화 (광고/IAP) — 출시 후 검토
- 웹 버전
