<!--
Purpose:        SEAL 통합 설계 명세서 — 구현 착수 전 확정된 전체 설계
Owner:          Architect
Update Trigger: 설계 결정 변경 시 (해당 ADR와 함께)
Harness Version: 1.1
-->

# SEAL 통합 설계 명세서 (v1.0)

_Last updated: 2026-07-24_
_상태: ✅ 구현 착수 가능_

이 문서는 코드 작성 전 확정된 SEAL의 전체 설계다.
게임 규칙의 정밀 명세는 `game-rules.md`, 이 문서는 그 규칙을 담을 **시스템 구조**를 정의한다.

---

## 0. 설계 원칙 요약

| # | 원칙 | 근거 |
|---|------|------|
| 1 | 규칙 로직은 `engine/` 순수 함수에만 존재 | ADR-004 — UI·AI·서버 재사용, 판정 불일치 방지 |
| 2 | GameState는 완전 불변 | undo·리플레이·AI 탐색이 여기 의존 |
| 3 | 보드는 코드가 아니라 데이터(JSON) | "보드가 콘텐츠" 철학 |
| 4 | 온라인은 서버 권위 | 클라이언트는 의도(Move)만 전송 |
| 5 | 밸런스는 파라미터, 코드 아님 | ADR-009 — RuleConfig 플래그 |

---

## 1. 레이어 아키텍처

```
┌───────────────────────────────────────────────┐
│  UI Layer         React Native + expo-router    │
│                   react-native-svg (보드)        │
│                   Reanimated (연출, M2)           │
├───────────────────────────────────────────────┤
│  Store Layer      Zustand — GameState 보관        │
│                   히스토리/undo, 모드 전환, 셀렉터  │
├───────────────────────────────────────────────┤
│  Engine Layer ★   순수 TypeScript, 의존성 0       │
│                   규칙의 유일한 구현처              │
├──────────────┬────────────────────┬────────────┤
│  AI Layer     │  Net Layer          │            │
│  Minimax      │  Firebase RTDB 구독  │            │
│  (engine 재사용)│  Cloud Functions 호출 │           │
└──────────────┴────────────────────┴────────────┘
                         │
              ┌──────────▼──────────┐
              │ Cloud Functions      │
              │ engine 재사용 서버 검증 │
              └─────────────────────┘
```

**의존 방향**: UI → Store → Engine. 역방향 import 절대 금지.
Engine은 어떤 상위 레이어도, React·Firebase·플랫폼 API도 import하지 않는다.

---

## 2. 데이터 모델 (확정)

```ts
// ============ 식별자 ============
type NodeId = string;              // 보드 정의 내 고유. 예: "n0", "c1"
type PlayerIdx = 0 | 1;            // 0 = 선공(흑), 1 = 후공(백)

// ============ 보드 (정적 데이터) ============
interface BoardDef {
  id: string;                      // "h", "star", "hex", "cross"
  name: string;                    // 표시명
  version: number;                 // 보드 정의 스키마 버전
  nodes: BoardNode[];
  edges: [NodeId, NodeId][];       // 무향. 정규화: a < b 정렬
  lockedNodes: NodeId[];           // ◇ 시작 시 잠김, 💎3 개방 후보 (RQ-004)
  keyNodes: NodeId[];              // 동점 판정 기준
}

interface BoardNode {
  id: NodeId;
  x: number;                       // 0~1 정규화 좌표 (해상도 독립)
  y: number;
}

// ============ 규칙 설정 (밸런스 파라미터) ============
interface RuleConfig {
  stonesPerPlayer: number;         // 기본 5
  crystalPlaceMode: 'place-from-hand' | 'recover-and-place';  // ADR-009
  crystalCost: { place: number; restore: number; unlock: number }; // 기본 1/2/3
}

// ============ 게임 상태 (불변) ============
interface GameState {
  board: BoardDef;
  rules: RuleConfig;
  occupancy: Readonly<Record<NodeId, PlayerIdx | null>>;
  sealed: ReadonlySet<NodeId>;
  locked: ReadonlySet<NodeId>;     // 아직 개방 안 됨 (lockedNodes ∩ 미개방)
  stonesInHand: readonly [number, number];
  stonesLost: readonly [number, number];   // 영구 제거된 수 (recover 모드용)
  crystals: readonly [number, number];
  turn: PlayerIdx;
  consecutivePasses: number;       // 2 → 종료 (RQ-003)
  moveHistory: readonly Move[];
  status: 'playing' | 'ended';
  winner: PlayerIdx | 'draw' | null;
}

// ============ 수 (Move) ============
type Move =
  | { kind: 'place'; node: NodeId }
  | { kind: 'crystal-place'; node: NodeId }
  | { kind: 'crystal-restore'; node: NodeId }
  | { kind: 'crystal-unlock'; node: NodeId }
  | { kind: 'pass' };

// ============ 행동 결과 ============
interface MoveResult {
  state: GameState;                // 새 상태 (불변)
  captured: NodeId[];              // 이번 행동으로 포획된 노드
  crystalsGained: number;
  error?: MoveError;               // 불법 수일 때만
}

type MoveError =
  | 'not-your-turn' | 'illegal-node' | 'node-not-empty'
  | 'no-stones-in-hand' | 'insufficient-crystals'
  | 'node-not-sealed' | 'node-not-locked' | 'game-ended';
```

**불변 유지 규칙**: 모든 변경은 새 객체/새 Set을 반환. 스프레드 또는 immer 사용.
`occupancy`는 얕은 복사로 충분(값이 원시). `sealed`/`locked`는 `new Set(prev)` 후 수정.

---

## 3. Engine API (전체 시그니처 — 이대로 구현)

```ts
// engine/index.ts — 공개 API

/** 새 게임 생성 */
function createGame(board: BoardDef, rules: RuleConfig, first: PlayerIdx): GameState;

/** 현재 턴 플레이어의 모든 합법 수. 둘 곳 없으면 [{kind:'pass'}] 반환 */
function legalMoves(state: GameState): Move[];

/** 단일 수 적용. 불법 수면 error 채워서 반환(state는 원본 유지) */
function applyMove(state: GameState, move: Move): MoveResult;

/** 특정 노드 배치 후 포획 판정 (내부용, 비연쇄 — RQ-002) */
function resolveCaptures(state: GameState, placedNode: NodeId, by: PlayerIdx): {
  captured: NodeId[];
};

/** 종료 여부: 양측 consecutivePasses >= 2 */
function isTerminal(state: GameState): boolean;

/** 보드 위 각 플레이어 돌 수 */
function scoreBoard(state: GameState): [number, number];

/** 승자 판정: 돌 수 → 핵심 노드 → 후공 승 (RQ-008 §8) */
function getWinner(state: GameState): PlayerIdx | 'draw';

/** 직렬화 (온라인 전송·저장·리플레이용) */
function serialize(state: GameState): SerializedState;
function deserialize(data: SerializedState): GameState;
```

**포획 알고리즘 (resolveCaptures)**:
```
placedNode를 A 또는 C로 하는 직선 A–B–C 후보를 순회:
  for each 이웃 B of placedNode (B에 상대 돌):
    for each 이웃 C of B (C != placedNode):
      if C에 내 돌 and A(=placedNode)-B 인접 and B-C 인접:
        B를 포획 후보에 추가
포획 후보 전부를 동시에 제거·봉인 (다중 포획).
연쇄 없음: 이 판정은 placedNode 기준 1회만.
```

**성능 메모**: 노드 20개 내외라 인접 순회는 O(degree²)로 무시 가능.
AI 탐색을 위해 `applyMove`는 할당 최소화 버전(`applyMoveFast`)을 M2에서 추가 검토(ADR-004 트레이드오프).

---

## 4. 보드 정의 스키마 & H형 보드

`boards/*.json` — 코드 변경 없이 보드 추가 가능해야 함.

```jsonc
// boards/h.json (MVP 기본 보드)
{
  "id": "h",
  "name": "H",
  "version": 1,
  "nodes": [
    // 좌측 세로 기둥
    {"id":"l0","x":0.2,"y":0.15}, {"id":"l1","x":0.2,"y":0.38},
    {"id":"l2","x":0.2,"y":0.62}, {"id":"l3","x":0.2,"y":0.85},
    // 우측 세로 기둥
    {"id":"r0","x":0.8,"y":0.15}, {"id":"r1","x":0.8,"y":0.38},
    {"id":"r2","x":0.8,"y":0.62}, {"id":"r3","x":0.8,"y":0.85},
    // 가로 다리
    {"id":"m0","x":0.4,"y":0.5}, {"id":"c","x":0.5,"y":0.5},
    {"id":"m1","x":0.6,"y":0.5},
    // 잠긴 확장 노드 ◇
    {"id":"x0","x":0.5,"y":0.2}, {"id":"x1","x":0.5,"y":0.8}
  ],
  "edges": [
    ["l0","l1"],["l1","l2"],["l2","l3"],
    ["r0","r1"],["r1","r2"],["r2","r3"],
    ["l1","m0"],["m0","c"],["c","m1"],["m1","r1"],
    ["l2","m0"],["m1","r2"],
    ["c","x0"],["c","x1"]
  ],
  "lockedNodes": ["x0","x1"],
  "keyNodes": ["c"]
}
```

- 노드 13개(잠긴 2 제외 시 11 시작 가능), 잠긴 2, 핵심 1 → 기획서 MVP 범위 충족
- `x`,`y`는 0~1 정규화 → SVG viewBox에 곱해 렌더 (해상도 독립)
- **유효성 검사기**(`validateBoard`)가 CI에서 검증:
  - 모든 edge의 양 끝 노드 존재
  - 그래프 연결성(고립 노드 없음)
  - lockedNodes ⊆ nodes, keyNodes ⊆ nodes
  - 포획 가능한 직선(길이 3 경로)이 1개 이상 존재

> ⚠️ 위 H 보드 좌표·엣지는 **초안**. TASK-006에서 Game Designer가 포획 라인 밀도와
> 선공 밸런스를 보고 확정. 스키마 자체는 확정.

---

## 5. AI 설계 (M2)

```ts
// ai/index.ts
interface AiConfig {
  depth: number;                   // 탐색 깊이
  noise: number;                   // 0~1, 하위 난이도에서 최적수 이탈 확률
}

function chooseMove(state: GameState, config: AiConfig): Move;
```

- **알고리즘**: Minimax + 알파-베타 가지치기. `engine.legalMoves`/`applyMove`/`scoreBoard` 재사용
- **평가 함수** (튜닝 대상):
  ```
  eval(state, me) =
      w1 * (내 보드 돌수 - 상대 보드 돌수)
    + w2 * (내 손+보드 총 병력 - 상대 총 병력)   // RQ-005 영구제거 반영
    + w3 * (내 결정 - 상대 결정)
    + w4 * (핵심노드 점유 ? +1 : 상대 점유 ? -1 : 0)
    + w5 * (내 잠재 포획 라인 수 - 상대)
  ```
- **난이도 3단계**: depth 2 / 3 / 4 + noise 0.3 / 0.1 / 0
- **UI 블로킹 방지 (RISK-001)**: `InteractionManager.runAfterInteractions` +
  깊은 탐색은 반복 심화(iterative deepening)로 분할, 예산 초과 시 중단. 저사양 실측 후 depth 상한 확정
- **AI는 게임 규칙을 절대 자체 구현하지 않는다** — 전부 engine 경유

---

## 6. 온라인 대전 설계 (M3)

### 6.1 RTDB 스키마
```
/matches/{matchId}
  ├── players: { "0": uid, "1": uid }
  ├── boardId: "h"
  ├── rules: {...}                    # RuleConfig
  ├── moves: [ Move, Move, ... ]      # 권위 있는 수의 로그 (append-only)
  ├── turn: 0 | 1                     # 파생값(캐시), 서버가 씀
  ├── status: "waiting"|"playing"|"ended"
  ├── winner: 0|1|"draw"|null
  └── lastActivity: <timestamp>       # 타임아웃 판정

/queue/{uid}: { boardId, ts }         # 랜덤 매칭 대기열
/rooms/{code}: { host: uid, matchId } # 방 코드 매칭
```

**상태 저장 방식**: 전체 GameState가 아니라 **Move 로그**를 저장(§4 리플레이와 통일).
클라이언트는 `moves`를 구독 → `engine`으로 재생 → 현재 상태 도출.
장점: 페이로드 최소(수 하나), 리플레이 무료, 서버 검증이 자연스러움.

### 6.2 수 검증 흐름 (서버 권위 — ADR-007)
```
클라이언트 → submitMove(matchId, move)  [Callable Function]
  서버:
    1. auth.uid가 이 매치의 현재 turn 플레이어인가?
    2. moves 로그를 engine으로 재생 → 현재 state 복원
    3. engine.applyMove(state, move) → 합법인가?
    4. 합법이면 moves에 append + turn/status/winner 갱신 (트랜잭션)
    5. 불법이면 거부 (클라이언트 버그/치팅)
```
클라이언트는 낙관적 업데이트(즉시 렌더) 후 서버 확정으로 교정 가능.

### 6.3 Security Rules (deny-by-default)
- `/matches/{id}/moves`: 클라이언트 직접 쓰기 **금지**. Cloud Function(admin)만 씀
- `/matches/{id}` 읽기: 해당 매치의 두 player uid만
- `/queue/{uid}`: 본인만 쓰기
- 검증: Security Reviewer 필수 게이트

### 6.4 엣지 케이스
| 상황 | 처리 |
|------|------|
| 재접속 | moves 재생으로 상태 완전 복원(무상태 클라이언트) |
| 상대 이탈 | lastActivity 타임아웃(예: 60s) → 이탈자 패배 처리(서버) |
| 항복 | resign Callable → status=ended, winner=상대 |
| 동시 제출 | 서버 트랜잭션 + turn 체크로 한쪽만 성공 |

---

## 6.5 국제화 (i18n) — 첫날부터 적용

**원칙**: UI 문자열을 코드에 하드코딩하지 않는다. 처음부터 키 기반으로 작성한다.
나중에 언어를 추가할 때 컴포넌트를 한 줄도 고치지 않는 것이 목표.

```
locales/
├── ko.json          # 기본 (개발 기준 언어)
├── en.json
└── index.ts         # i18n 초기화 + t() export
```

- **라이브러리**: `i18next` + `react-i18next` (RN 표준, 복수형·보간 지원)
- **기기 언어 감지**: `expo-localization`의 `getLocales()[0].languageCode`
- **폴백 체인**: 기기 언어 → `en` → 키 자체
- **사용**:
  ```tsx
  const { t } = useTranslation();
  <Text>{t('menu.playAi')}</Text>          // "AI와 대전"
  <Text>{t('result.winner', { name })}</Text>
  ```
- **키 네임스페이스**: `menu.*` `game.*` `crystal.*` `result.*` `tutorial.*` `settings.*` `error.*`
- **설정 연동**: `settingsStore.language`가 'system' | 'ko' | 'en'. 'system'이면 기기 언어 따름.
  변경 시 `i18n.changeLanguage()` 호출 후 MMKV에 저장
- **엔진은 i18n과 무관** — engine은 문자열을 반환하지 않는다(에러도 코드값 `MoveError`).
  코드값 → 문자열 변환은 UI 레이어에서만. 이 분리가 engine 순수성(ADR-004)을 지킨다
- **숫자·복수형**: "결정 {{count}}개"는 언어별 복수 규칙을 i18next가 처리
- **주의**: 게임 규칙상 텍스트가 적은 편(추상 게임) → 초기 비용 낮고 이득 큼

### 문자열 작성 규칙 (Implementer)
- 새 `<Text>`에 리터럴 한국어를 쓰지 않는다. 반드시 `t('key')`
- 키는 추가 즉시 `ko.json`과 `en.json` **양쪽**에 등록 (누락 키는 CI에서 경고)
- 보드 이름(H, 별 등)은 `board.h.name` 형태로 locale에 둠

---

## 6.6 저장 & 앱 생명주기

로컬 이어하기(TASK-027)와 온라인 재접속·백그라운드 처리를 하나의 설계로 통합한다.

### 저장 계층
| 데이터 | 저장소 | 이유 |
|--------|--------|------|
| 진행 중 로컬 게임 | MMKV (`game:current`) | 빠른 동기 read/write, 이어하기 |
| 설정(언어/사운드/색맹모드) | MMKV (`settings`) | 소량·빈번 |
| 완료 게임 리플레이(로컬) | MMKV (`replays:*`) | Move 로그만 저장(작음) |
| 온라인 매치 상태 | 저장 안 함 | RTDB가 정본, 재생으로 복원 |
| 인증 토큰(온라인, M3) | expo-secure-store | 민감정보는 MMKV 금지 |

- **직렬화**: `engine.serialize()`(§3) 사용 — 저장 포맷 = 전송 포맷 = 리플레이 포맷 통일
- **자동 저장**: 로컬/AI 모드에서 매 수(store.play) 후 `game:current` 갱신.
  게임 종료 시 `replays:{ts}`로 이관하고 `game:current` 삭제
- **이어하기**: 앱 시작 시 `game:current` 존재하면 메인 메뉴에 "이어하기" 노출

### 앱 생명주기 (AppState)

`AppState`(active / background / inactive) 전이를 store가 구독해 모드별로 다르게 처리:

| 전이 | 로컬·AI 모드 | 온라인 모드 (M3) |
|------|-------------|-----------------|
| → background | MMKV에 상태 저장(이미 매수 저장돼 안전), AI 탐색 중단 | RTDB `presence` 갱신, 타임아웃 유예 타이머 시작 |
| → active | `game:current` 복원(필요 시) | RTDB moves 재구독 → 재생으로 최신 상태 복원 |
| 앱 종료 후 재실행 | "이어하기"로 복원 | matchId 유효하면 재접속, 아니면 결과 표시 |

- **온라인 백그라운드**: 백그라운드 진입 즉시 패배가 아니라 **유예 시간(§11 OPEN-6)** 을 둔다.
  서버 `lastActivity` + presence로 판정. 유예 초과 시 서버가 이탈 처리(§6.4)
- **AI 탐색 안전**: 백그라운드 전환 시 진행 중 탐색을 취소(AbortSignal 패턴)해 좀비 연산 방지
- **navigation 연동**: expo-router. 게임 화면에서 하드웨어 뒤로가기(Android)는
  즉시 이탈이 아니라 "나가기 확인" 모달 → 로컬은 저장 후 이탈, 온라인은 항복 경고

### store 반영
```ts
interface GameStore {
  // ...(§8 기존)
  persist(): void;          // game:current에 저장
  restore(): boolean;       // 있으면 복원, 없으면 false
  handleAppState(next: AppStateStatus): void;  // AppState 구독 핸들러
}
```

---

## 7. 폴더 구조 (확정)

```
seal/
├── app/                          # expo-router 라우트
│   ├── _layout.tsx               # 루트, 폰트/테마
│   ├── index.tsx                 # 메인 메뉴
│   ├── (game)/
│   │   ├── local.tsx             # 핫시트
│   │   ├── ai.tsx                # AI 대전
│   │   └── online/[matchId].tsx  # 온라인 (M3)
│   ├── tutorial.tsx
│   └── settings.tsx
├── src/
│   ├── engine/                   # ★ 순수 규칙 (의존성 0)
│   │   ├── index.ts              # 공개 API
│   │   ├── types.ts              # GameState, Move, BoardDef...
│   │   ├── moves.ts              # applyMove, legalMoves
│   │   ├── capture.ts            # resolveCaptures
│   │   ├── crystals.ts           # applyCrystal (mode 분기)
│   │   ├── terminal.ts           # isTerminal, scoreBoard, getWinner
│   │   ├── serialize.ts
│   │   └── __tests__/            # 커버리지 100%
│   ├── ai/                       # M2 — engine 재사용
│   │   ├── index.ts              # chooseMove
│   │   ├── minimax.ts
│   │   └── evaluate.ts
│   ├── store/                    # Zustand
│   │   ├── gameStore.ts          # GameState + undo 히스토리
│   │   └── settingsStore.ts
│   ├── net/                      # M3 — Firebase
│   │   ├── firebase.ts           # 클라이언트 싱글톤
│   │   ├── match.ts              # submitMove, subscribe
│   │   └── matchmaking.ts
│   ├── components/
│   │   ├── Board.tsx             # SVG 렌더러
│   │   ├── BoardNode.tsx
│   │   ├── Stone.tsx
│   │   ├── SealMark.tsx
│   │   └── CrystalBar.tsx        # 결정 보유/사용 UI
│   ├── boards/                   # 보드 로더 + validateBoard
│   │   └── index.ts
│   └── lib/
│       ├── storage.ts            # MMKV 래퍼 (game:current, settings, replays)
│       ├── lifecycle.ts          # AppState 구독 → store.handleAppState
│       └── i18n.ts               # locales/index.ts 재노출 + changeLanguage
├── boards/                       # 보드 정의 JSON (콘텐츠)
│   └── h.json
├── locales/                      # i18n (§6.5)
│   ├── ko.json
│   ├── en.json
│   └── index.ts
├── functions/                    # Cloud Functions (M3)
│   └── src/
│       ├── submitMove.ts         # src/engine을 import해 서버 검증
│       └── matchmaking.ts
├── .github/workflows/ci.yml
├── app.config.ts                 # scheme, bundleId 필수
├── eas.json
└── (레포 루트에 AGENTS.md/ORCHESTRATOR.md/memory//tasks//prompts/ 등 하니스 문서 — 하위 폴더 아님)
```

**engine 공유**: `functions/`가 `src/engine`을 import(모노레포 경로 또는 심볼릭).
규칙 코드가 앱·서버에서 물리적으로 동일해야 판정이 일치(ADR-004).

---

## 8. 상태 관리 (Zustand)

```ts
interface GameStore {
  state: GameState;
  history: GameState[];            // undo 스택 (로컬 모드만)
  mode: 'local' | 'ai' | 'online';
  // 액션
  init(board: BoardDef, rules: RuleConfig, first: PlayerIdx): void;
  play(move: Move): void;          // engine.applyMove 호출 후 반영
  undo(): void;                    // history pop (online 불가)
  // 저장·생명주기 (§6.6)
  persist(): void;                 // game:current에 serialize 저장
  restore(): boolean;              // 있으면 복원
  handleAppState(next: AppStateStatus): void;
  // 셀렉터
  legalMoves(): Move[];            // engine.legalMoves(state) 위임
}

interface SettingsStore {
  language: 'system' | 'ko' | 'en';   // §6.5
  colorBlindMode: boolean;             // §9 접근성
  sound: boolean;                      // M2
  setLanguage(l: SettingsStore['language']): void;  // i18n.changeLanguage + MMKV
}
```

- Store는 **규칙을 계산하지 않는다** — 전부 engine에 위임하고 결과만 보관
- AI 모드: 사람 수 → play → turn이 AI면 `ai.chooseMove`를 비동기 실행 → play
- Online 모드: play가 로컬 반영 대신 `net.submitMove` 호출, RTDB 구독이 state 갱신
- 서버 상태(온라인 매치 구독)는 단순 실시간 구독이라 TanStack Query 대신 RTDB 리스너 직접 사용
- 저장/복원/생명주기는 store 메서드로(§6.6). MMKV 직접 접근은 `lib/storage.ts`로 격리

---

## 9. UI/렌더링 설계

- **보드**: `react-native-svg`. `<Svg viewBox="0 0 100 100">`에 정규화 좌표 × 100
- **입력**: 각 노드는 투명 히트 서클(반경 넉넉히) + 시각 서클 분리 → 탭 정확도
- **상태 표현**: 빈 노드(외곽선) / 돌(플레이어 색) / 봉인(X 마크) / 잠김(◇ 점선) / 합법수 하이라이트
- **결정 UI**: 하단 `CrystalBar` — 보유 💎 수 + 3개 액션 버튼(비용 부족 시 비활성)
- **연출(M2)**: Reanimated로 배치 팝·포획 페이드·봉인 X 스탬프·개방 확장. 없어도 플레이 가능하게 분리
- **접근성**: 색맹 대비 위해 돌을 색+모양(●/■)으로 구분
- ❌ HTML `<form>` 금지(RN), 긴 목록은 FlatList, 이미지는 expo-image

---

## 10. 구현 순서 (설계 → 코드 매핑)

| 순서 | 태스크 | 산출물 | 검증 |
|------|--------|--------|------|
| 1 | TASK-001~004 | 프로젝트·CI·폴더 | 빈 앱 실행 |
| 2 | TASK-005/006 | 보드 스키마 + validateBoard + h.json | 보드 유효성 테스트 통과 |
| 3 | TASK-010 | engine/types.ts | 컴파일 |
| 4 | TASK-011~015 | engine 전체 | — |
| 5 | TASK-016 | engine 테스트 100% | **여기서 규칙이 코드로 고정됨** |
| 6 | TASK-017~019 | SVG 보드 + 핫시트 | **MVP 플레이 가능** |
| 7 | M2 | AI + sim + BAL-001 검증 | 밸런스 데이터 |
| 8 | M3 | 온라인 | 2클라 통합 테스트 |

**핵심 마일스톤**: 순서 6 완료 = 기획서 MVP("공간 장악·봉인·복구·확장" 검증 가능) 달성.

---

## 11. 미결 사항 (구현과 병행 결정)

| ID | 사항 | 결정 시점 |
|----|------|----------|
| OPEN-1 | H보드 최종 좌표·엣지 (밸런스) | TASK-006, Game Designer |
| OPEN-2 | AI 평가 가중치 w1~w5 | M2 튜닝 |
| OPEN-3 | crystalPlaceMode 기본값 (BAL-001) | M2 자가대전 후 |
| OPEN-4 | 저사양 depth 상한 | M2 실측 |
| OPEN-5 | 패키지 매니저 npm 확정 | TASK-001 |
| OPEN-6 | 온라인 타임아웃 + 백그라운드 유예 시간 | M3 |

이 6개는 **설계를 막지 않는다** — 전부 파라미터이거나 후속 마일스톤 사항.
엔진·구조 설계는 완결됐으므로 구현 착수 가능.
