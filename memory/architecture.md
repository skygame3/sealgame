<!--
Purpose:        시스템 설계 결정과 아키텍처 구조
Owner:          Architect
Update Trigger: 컴포넌트 추가, 설계 결정 변경, 의존 구조 변경
Harness Version: 1.1
-->

# Architecture — SEAL

_Last updated: 2026-07-24_

> 📐 **전체 설계 명세는 `docs/design-spec.md`가 정본**입니다. 이 파일은 요약과 변경 이력을 담습니다.
> 데이터 모델·엔진 API·보드 스키마·AI·온라인 구조의 확정본은 design-spec을 참조하세요.

## System Overview

iOS/Android 모바일 턴제 보드게임. 순수 함수 규칙 엔진을 중심에 두고,
UI·AI·네트워크가 모두 같은 엔진을 재사용하는 구조.

**Pattern**: Layered + Pure Core

## Component Structure

```
┌─────────────────────────────────────────────┐
│  UI Layer (React Native + SVG)              │
│  화면, 보드 렌더러, 애니메이션, 입력 처리        │
└──────────────────┬──────────────────────────┘
                   │ 액션 dispatch / 상태 구독
┌──────────────────▼──────────────────────────┐
│  Store Layer (Zustand)                      │
│  현재 GameState 보관, 히스토리, undo, 모드 전환  │
└──────────────────┬──────────────────────────┘
                   │ 순수 함수 호출
┌──────────────────▼──────────────────────────┐
│  Engine Layer (순수 TypeScript)  ★ 핵심 자산   │
│  applyMove / resolveCaptures / legalMoves    │
│  isTerminal / scoreBoard / applyCrystal      │
│  React·Firebase 의존 0                        │
└──────┬───────────────────────────┬──────────┘
       │                           │
┌──────▼──────────┐        ┌───────▼──────────┐
│  AI Layer       │        │  Net Layer       │
│  Minimax +      │        │  Firebase RTDB   │
│  Alpha-Beta     │        │  구독 / 전송       │
└─────────────────┘        └───────┬──────────┘
                                   │
                        ┌──────────▼──────────┐
                        │ Cloud Functions      │
                        │ 같은 engine 코드로    │
                        │ 서버 측 수 검증        │
                        └─────────────────────┘
```

## Core Data Model (초안)

```ts
type NodeId = string;
type PlayerIdx = 0 | 1;

interface BoardDef {
  id: string;              // "h", "star", ...
  nodes: { id: NodeId; x: number; y: number }[];
  edges: [NodeId, NodeId][];
  lockedNodes: NodeId[];   // ◇ 미리 지정된 개방 후보 (RQ-004)
  keyNodes: NodeId[];      // 동점 시 판정 기준
}

interface RuleConfig {
  // ADR-009 — BAL-001 A/B 검증용 플래그
  crystalPlaceMode: 'place-from-hand' | 'recover-and-place';
}

interface GameState {
  board: BoardDef;
  rules: RuleConfig;
  occupancy: Record<NodeId, PlayerIdx | null>;
  sealed: ReadonlySet<NodeId>;
  locked: ReadonlySet<NodeId>;      // 아직 개방 안 된 노드
  stonesInHand: [number, number];   // 손의 돌 (포획당하면 회복 불가 — RQ-005)
  stonesLost: [number, number];     // 영구 제거된 돌 수 (recover 모드에서 사용)
  crystals: [number, number];
  turn: PlayerIdx;
  consecutivePasses: number;        // 2 이상이면 종료 (RQ-003)
  moveHistory: Move[];
}

type Move =
  | { kind: 'place'; node: NodeId }
  | { kind: 'crystal-place'; node: NodeId }      // 💎1
  | { kind: 'crystal-restore'; node: NodeId }    // 💎2
  | { kind: 'crystal-unlock'; node: NodeId }     // 💎3
  | { kind: 'pass' };                            // 강제 패스 (RQ-003)
```

**설계 메모**
- `stonesInHand`는 감소만 하고 증가하지 않는다 (`place-from-hand` 모드). `recover-and-place` 모드에서만 💎1이 `stonesLost`를 1 줄이고 `stonesInHand`를 1 늘린다.
- `consecutivePasses`는 패스 외 모든 행동에서 0으로 리셋.
- `sealed`/`locked`를 Set으로 두되 상태 변경 시 새 Set을 만든다 (불변 유지).

## Data Flow

**로컬 플레이**
```
탭 → UI가 Move 생성 → store.dispatch → engine.applyMove
  → 포획 판정 → 새 GameState → 스토어 갱신 → UI 리렌더 + 애니메이션
```

**AI 대전**
```
사람 수 적용 → AI 턴 감지 → ai.search(state, depth)
  → 내부에서 engine.legalMoves / applyMove / scoreBoard 반복 호출
  → 최선 수 반환 → engine.applyMove
※ 탐색은 InteractionManager/워커로 UI 스레드 블로킹 방지
```

**온라인 대전 (서버 권위)**
```
클라이언트 → Move만 전송 (결과 아님)
Cloud Function → 저장된 state에 engine.applyMove 재실행 → 검증 → RTDB 커밋
양쪽 클라이언트 → RTDB 구독으로 새 state 수신 → 렌더
```

## Design Decision Summary

> 상세는 memory/decisions.md 참조

| Decision | Choice | Date |
|----------|--------|------|
| 크로스플랫폼 프레임워크 | React Native (Expo) | 2026-07-24 |
| 보드 렌더링 | react-native-svg | 2026-07-24 |
| 상태 관리 | Zustand | 2026-07-24 |
| 백엔드 | Firebase RTDB + Cloud Functions | 2026-07-24 |
| AI 실행 위치 | 클라이언트 (Minimax) | 2026-07-24 |
| 규칙 엔진 격리 | 순수 함수 레이어 | 2026-07-24 |

## Architecture Constraints

- Engine 레이어는 React / Firebase / 플랫폼 API를 절대 import 하지 않는다
- 규칙 로직은 단 한 곳(engine/)에만 존재. AI·서버가 중복 구현하지 않는다
- 보드는 코드가 아니라 데이터(JSON). 새 보드 추가에 코드 변경이 필요하면 설계 실패
- GameState는 불변. 모든 변경은 새 객체 반환 (undo·리플레이·AI 탐색이 여기 의존)
- 온라인에서 클라이언트는 "의도(Move)"만 보내고 "결과"는 보내지 않는다

## Open Questions (구현과 병행 결정 — 설계를 막지 않음)

전부 파라미터이거나 후속 마일스톤 사항. 상세는 `docs/design-spec.md` §11.

| ID | 사항 | 결정 시점 |
|----|------|----------|
| OPEN-1 | H보드 최종 좌표·엣지 (밸런스) | TASK-006 |
| OPEN-2 | AI 평가 가중치 w1~w5 | M2 |
| OPEN-3 | crystalPlaceMode 기본값 (BAL-001) | M2 자가대전 후 |
| OPEN-4 | 저사양 depth 상한 | M2 실측 |
| OPEN-5 | 패키지 매니저 npm 확정 | TASK-001 |
| OPEN-6 | 온라인 타임아웃 시간 | M3 |
