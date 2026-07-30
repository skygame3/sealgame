<!--
Purpose:        현재 프로젝트 상태 스냅샷 — 모든 에이전트가 처음 읽는 컨텍스트
Owner:          모든 에이전트(읽기), Planner / Release Manager(쓰기)
Update Trigger: 버전 변경, 마일스톤 완료, 주요 상태 변화
Harness Version: 1.1
-->

# Project: SEAL

_Last updated: 2026-07-26_

## Summary

포획으로 노드를 봉인하고 결정 자원으로 보드를 복구·확장하는 2인 추상 전략 보드게임의 모바일 구현.
"규칙보다 보드가 콘텐츠"라는 설계 철학 — 규칙은 고정, 보드 그래프만 바뀌어도 완전히 새 전략이 생긴다.

## Current State

- **Version**: v0.1.0-dev
- **Phase**: M0 완료 — 기반 구축 및 검증 환경 구성 완료
- **Next milestone**: M1 — 규칙 엔진 & 로컬 플레이
- **Overall health**: 🟢 Good

## Tech Summary

| Field | Value |
|-------|-------|
| Language | TypeScript |
| Framework | React Native (Expo) |
| Rendering | react-native-svg |
| State | Zustand |
| Backend | Firebase RTDB + Cloud Functions |
| AI | 클라이언트 Minimax + Alpha-Beta |
| Infrastructure | Firebase, EAS Build, GitHub Actions |
| Repo Structure | Single Repo |

## Key Paths

```
seal/
├── AGENTS.md / memory/ / tasks/ / prompts/  # 하니스 (레포 루트, 하위 폴더 아님)
├── app/src/engine/      # 게임 규칙 (순수 함수, 최우선 자산)
├── app/src/ai/          # Minimax
├── app/src/components/  # SVG 보드
├── functions/           # Cloud Functions
└── boards/              # 보드 정의 JSON
```

## Team

2인 개발 (Lead + Partner) + AI 에이전트 협업. 모든 역할을 Lead가 최종 승인.

| 구성원 | GitHub | 배경 | 담당 영역 |
|--------|--------|------|-----------|
| **Lead** (본인) | [@internalforces](https://github.com/internalforces) | 경험 있는 개발자 | `engine/`, `ai/`, `net/`(Firebase), 아키텍처 결정, 보안, 배포, Partner PR 리뷰 |
| **Partner** | [@kimsky671](https://github.com/kimsky671) | 게임 개발 입문자 (노베이스) | `components/`, `screens/`(SVG 보드·UI), 애니메이션, i18n 문자열, 콘텐츠(보드 JSON, 스토어 에셋) |

- 원칙: Partner는 `engine/`이 반환한 결과를 그대로 그리기만 함 — 게임 판정 로직을 UI 레이어에서 새로 구현하지 않음(AGENTS.md 절대 금지 사항과 동일)
- 온보딩 경로: Partner는 `docs/PROJECT-GUIDE.md`부터 읽는다
- 태스크별 담당 배정은 `tasks/backlog.md`의 Owner 열, 마일스톤별 요약은 `roadmap.md` 참조
- 근거: `memory/decisions.md`의 ADR-013

## Recent Changes

| Date | Change |
|------|--------|
| 2026-07-30 | M0 완료: Expo 앱, CI, 보드 스키마/H 보드, i18n, MMKV 저장 경계 구성 |
| 2026-07-26 | 1인 개발 → 2인 개발(Lead + Partner) 체제 전환, 마일스톤별 역할 분담 확정 (ADR-013) |
| 2026-07-24 | AI Development Harness v1.1 초기 셋업 (standard tier) |
| 2026-07-24 | 기술 스택 확정: Expo / SVG / Zustand / Firebase / 클라이언트 Minimax |
| 2026-07-24 | 게임 규칙 경계 케이스 5건 확정 (ADR-008) → docs/game-rules.md v1.0 |
| 2026-07-24 | 밸런스 대안을 RuleConfig 플래그로 선제 설계 (ADR-009) |

## Constraints

- 1인 개발 — 범위 관리가 최대 리스크. MVP 스코프를 벗어나는 기능은 backlog로
- 게임 코어 규칙은 기획서가 유일한 진실 공급원. 임의 변경 금지
- 규칙 엔진은 순수 함수로 격리 — AI·온라인 대전·테스트가 모두 이 레이어를 재사용
- 온라인 대전에서 클라이언트를 신뢰하지 않음
- 🔬 BAL-001: 포획 = 돌 영구 제거 규칙이 스노우볼을 만들 위험. M2에서 자가대전으로 최우선 검증
