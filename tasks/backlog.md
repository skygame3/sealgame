<!--
Purpose:        아직 착수하지 않은 태스크의 우선순위 목록
Owner:          Planner
Update Trigger: 태스크 추가, 우선순위 변경, 마일스톤 조정
Harness Version: 1.1
-->

# Backlog — SEAL

_Last updated: 2026-07-26_

## M0 — 기반

_Owner 범례: **Lead** = [@internalforces](https://github.com/internalforces)(본인), **Partner** = [@kimsky671](https://github.com/kimsky671)(입문자), **Pair** = 온보딩 목적으로 같이 진행_

| ID | Task | Priority | Milestone | Size | Owner | Notes |
|----|------|----------|-----------|------|-------|-------|
| TASK-001 | Expo + TypeScript 프로젝트 초기화, GitHub 저장소 생성 | High | M0 | S | Pair | strict mode. 툴체인 온보딩 겸함 |
| TASK-002 | ESLint / Prettier / Jest 설정 | High | M0 | S | Pair | jest-expo. 린트/테스트 개념 온보딩 |
| TASK-003 | GitHub Actions CI (lint + typecheck + test) | High | M0 | S | Lead | PR 트리거 |
| TASK-004 | 폴더 구조 확정 (engine/ai/store/ui/net) | High | M0 | XS | Lead | ADR-004 준수. 오너십 경계 설명 겸함 |
| TASK-005 | 보드 정의 JSON 스키마 설계 + 유효성 검사기 | High | M0 | M | Lead | 그래프 연결성 검증 |
| TASK-006 | H형 보드 작성 (노드 12~16, 잠긴 2, 핵심 1) | High | M0 | S | Partner | MVP 기본 보드. 스키마만 따르면 되는 콘텐츠 작업 |
| TASK-008 | i18n 구조 셋업 (i18next + ko/en + expo-localization) | High | M0 | S | Partner | §6.5, 첫날부터. Lead 리뷰 |
| TASK-009 | MMKV storage 래퍼 + serialize 연동 | High | M0 | S | Lead | §6.6, lib/storage.ts |
| ~~TASK-007~~ | ~~docs/game-rules.md 작성~~ | — | M0 | — | Lead | ✅ 2026-07-24 완료 |

## M1 — 규칙 엔진 & 로컬 플레이

| ID | Task | Priority | Milestone | Size | Owner | Notes |
|----|------|----------|-----------|------|-------|-------|
| ~~TASK-010~~ | ~~GameState / Move / BoardDef / RuleConfig 타입 정의~~ | — | M1 | S | Lead | ✅ 2026-07-26 완료 → `tasks/completed.md` |
| TASK-011 | engine: 돌 놓기 + 합법수 생성 | High | M1 | M | Lead | |
| TASK-012 | engine: 포획 판정 (다중 동시 포획 포함) | High | M1 | L | Lead | 핵심 난이도 |
| TASK-013 | engine: 봉인 처리 및 배치 제한 | High | M1 | S | Lead | |
| TASK-014 | engine: 결정 획득/소비 3종 효과 | High | M1 | M | Lead | 💎1은 손에 돌 필요 |
| TASK-014b | engine: RuleConfig.crystalPlaceMode 분기 구현 | High | M1 | S | Lead | ADR-009 — BAL-001 A/B용 |
| TASK-015 | engine: 패스·종료 조건 + 승패 + 동점 규칙 | High | M1 | M | Lead | 연속 패스 2회 종료, 핵심 노드 → 후공 승 |
| TASK-016 | engine 단위 테스트 커버리지 100% | High | M1 | L | Lead | 규칙별 케이스 테이블. Partner는 케이스 몇 개 페어 작성으로 테스트 감각 학습(선택) |
| TASK-017 | SVG 보드 렌더러 (노드/엣지/돌/봉인) | High | M1 | L | Partner | 탭 히트 영역 포함. TASK-010 확정 전엔 mock GameState로 선착수 |
| TASK-018 | Zustand 스토어 + undo 히스토리 | Medium | M1 | M | Pair | engine 출력↔UI 사이 계약이라 처음엔 같이, 이후 Partner가 확장 주도 |
| TASK-019 | 로컬 핫시트 2인 플레이 화면 | High | M1 | M | Partner | MVP 완성 지점. Lead 리뷰로 규칙 표현 정확성 확인 |
| TASK-019b | 자동저장 + 이어하기 + AppState 생명주기 | High | M1 | M | Lead | §6.6, store.persist/restore |

## M2 — AI & 게임 느낌

| ID | Task | Priority | Milestone | Size | Owner | Notes |
|----|------|----------|-----------|------|-------|-------|
| TASK-020 | Minimax + 알파-베타 탐색기 | High | M2 | L | Lead | engine 재사용 |
| TASK-021 | 평가 함수 설계 (돌 수·공간·결정·핵심 노드) | High | M2 | M | Lead | 튜닝 반복 예상 |
| TASK-022 | 난이도 3단계 (깊이 + 노이즈) | Medium | M2 | S | Lead | |
| TASK-023 | AI 자가대전 시뮬레이터 (npm run sim) | High | M2 | M | Lead | 모드별 통계 분리 출력 |
| TASK-023b | 🔬 BAL-001 검증: 두 모드 1000판 비교 리포트 | High | M2 | M | Lead | 기본 모드 확정 → ADR |
| TASK-024 | 탐색 비동기화 (UI 블로킹 방지) | High | M2 | M | Lead | RISK-001 |
| TASK-025 | 봉인/포획/개방 애니메이션 + 햅틱 | Medium | M2 | M | Partner | Reanimated 검토. 시각 연출 — 학습 동기부여 큰 구간 |
| TASK-026 | 인터랙티브 튜토리얼 4단계 | Medium | M2 | L | Partner | 규칙 텍스트는 Lead 리뷰로 정확성 확인 |
| TASK-027 | 로컬 저장 / 이어하기 | Low | M2 | S | Lead | TASK-019b와 통합 검토 |

## M3 — 온라인 대전

| ID | Task | Priority | Milestone | Size | Owner | Notes |
|----|------|----------|-----------|------|-------|-------|
| TASK-030 | Firebase 프로젝트 셋업 + 익명 Auth | High | M3 | S | Lead | staging/prod 분리 |
| TASK-031 | RTDB 대전 스키마 설계 | High | M3 | M | Lead | state vs move-log 결정 |
| TASK-032 | Cloud Functions 수 검증 (서버 권위) | High | M3 | L | Lead | ADR-007 |
| TASK-033 | 매칭: 방 코드 → 랜덤 큐 | High | M3 | L | Lead | 매칭 로직 자체는 Lead. 대기실/매칭 화면 UI는 별도 세부 태스크로 쪼개 Partner 배정 검토 |
| TASK-034 | Security Rules (deny-by-default) + 보안 리뷰 | High | M3 | M | Lead | ⚠️ Gate |
| TASK-035 | 재접속 / 타임아웃 / 항복 처리 | High | M3 | M | Lead | 재접속/항복 UI는 세부 태스크 분리 시 Partner 배정 검토 |
| TASK-036 | 대전 기록 저장 & 리플레이 | Low | M3 | M | Lead | 리플레이 재생 화면은 Partner와 분담 검토 |

## M4 — 출시

| ID | Task | Priority | Milestone | Size | Owner | Notes |
|----|------|----------|-----------|------|-------|-------|
| TASK-040 | 보드 3종 추가 (별/육각형/십자가) | Medium | M4 | M | Partner | 데이터만 추가. TASK-006과 같은 콘텐츠 작업 |
| TASK-041 | 아이콘 / 스플래시 / 스토어 에셋 | High | M4 | M | Partner | Lead 최종 확인 |
| TASK-042 | 설정 화면 (사운드/언어/접근성) | Medium | M4 | S | Partner | |
| TASK-043 | TestFlight / Internal Testing 배포 | High | M4 | M | Lead | ⚠️ Gate. 계정 권한 필요 |
| TASK-044 | 스토어 심사 제출 | High | M4 | M | Lead | ⚠️ Gate. 계정 권한 필요 |

## Size Reference

| Size | 예상 소요 |
|------|----------|
| XS | 1시간 미만 |
| S | 1~4시간 |
| M | 반나절~하루 |
| L | 1~3일 |
| XL | 3일 초과 → 반드시 분해 |
