<!--
Purpose:        주요 기술 결정 이력 (ADR 형식)
Owner:          Architect / Researcher
Update Trigger: 중요한 기술 결정 직후 즉시 기록
Harness Version: 1.1
-->

# Decision Log — SEAL

_Last updated: 2026-07-24_

## Template

```
### ADR-NNN: [결정 제목]
- **Date**: YYYY-MM-DD
- **Status**: Proposed | Accepted | Deprecated | Superseded
- **Decided by**: [역할 / 사용자]

**Context**: 왜 이 결정이 필요했나?
**Decision**: 무엇을 선택했나?
**Rationale**: 왜 그것을 선택했나?
**Trade-offs**: 단점은?
**Consequences**: 결과로 무엇이 바뀌나?
```

---

### ADR-001: AI Development Harness v1.1 도입

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: 사용자

**Context**: 1인 + AI 협업 개발에서 세션 간 컨텍스트 유실과 태스크 추적 문제가 예상됨.
**Decision**: AI Development Harness v1.1 (standard tier) 채택.
**Rationale**: 에이전트 역할·워크플로우·메모리를 구조화해 세션 간 컨텍스트 손실 제거.
**Trade-offs**: 초기 문서 작성 비용.
**Consequences**: 모든 에이전트가 동일한 컨텍스트에서 작업.

---

### ADR-002: React Native (Expo)를 크로스플랫폼 프레임워크로 채택

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: 사용자

**Context**: iOS/Android 동시 출시가 목표이나 개발 인력은 1인.
**Decision**: React Native + Expo (Managed workflow, EAS Build).
**Rationale**: 코드베이스 하나로 양 플랫폼 대응. EAS로 맥 없이도 iOS 빌드 가능. TypeScript로 엔진과 UI가 같은 언어 → 규칙 코드 재사용.
**Trade-offs**: 네이티브 대비 렌더링 성능 열위. 다만 SEAL은 노드 20개 내외의 정적 그래프라 병목 가능성 낮음.
**Consequences**: 번들 크기와 Expo SDK 업그레이드 주기를 관리해야 함.

---

### ADR-003: 보드 렌더링에 react-native-svg 사용

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: 사용자

**Context**: 보드가 불규칙 그래프(H형, 별, 미로 등)이며 게임 중 확장·봉인으로 형태가 변함.
**Decision**: react-native-svg로 노드/엣지를 선언적으로 렌더링.
**Rationale**: 그래프 구조를 데이터(JSON)에서 직접 그릴 수 있고, 탭 히트 영역 처리와 확대/축소가 자연스러움. 게임 엔진 라이브러리(Phaser 등)는 턴제 정적 보드에 과함.
**Trade-offs**: 복잡한 파티클·프레임 애니메이션에는 부적합.
**Consequences**: 연출은 Reanimated 조합으로 M2에서 별도 검토.

---

### ADR-004: 규칙 엔진을 순수 함수 레이어로 격리

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: Architect

**Context**: 동일한 게임 규칙이 UI, AI 탐색, 서버 검증 세 곳에서 필요.
**Decision**: `src/engine/`에 React·Firebase 의존이 없는 순수 함수로 규칙을 구현하고, 나머지 레이어가 이를 재사용.
**Rationale**: 규칙 중복 구현은 클라이언트/서버 판정 불일치라는 최악의 버그를 만든다. 순수 함수는 단위 테스트 100%가 현실적이고, AI 탐색이 상태를 자유롭게 시뮬레이션할 수 있으며, 불변 상태 덕에 undo·리플레이가 공짜로 따라온다.
**Trade-offs**: 매 수마다 새 상태 객체 생성 → AI 탐색 시 GC 부하. 필요하면 탐색 전용 경량 표현을 나중에 도입.
**Consequences**: engine/ 커버리지 100%가 표준으로 강제됨.

---

### ADR-005: 백엔드로 Firebase RTDB + Cloud Functions 선택

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: 사용자

**Context**: 실시간 1:1 온라인 대전이 필요하나 서버 운영 인력이 없음.
**Decision**: Firebase Realtime Database로 대전 상태 동기화, Cloud Functions로 수 검증·매칭.
**Rationale**: 턴제 게임 상태는 수 KB 수준의 작은 JSON이라 RTDB가 Firestore보다 지연·비용 면에서 유리. 서버 인프라 관리 불필요. 익명 인증으로 진입 마찰 제거.
**Trade-offs**: 벤더 종속. RTDB 쿼리 능력이 제한적이라 랭킹·매칭 큐는 별도 설계 필요.
**Consequences**: Security Rules를 deny-by-default로 설계하고 보안 리뷰를 M3 필수 게이트로 둠.

---

### ADR-006: AI를 클라이언트에서 실행 (Minimax + Alpha-Beta)

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: 사용자

**Context**: 싱글플레이 AI 상대가 필요. 서버 실행 시 비용과 지연이 발생.
**Decision**: 클라이언트에서 Minimax + 알파-베타 가지치기 실행. engine/ 함수 재사용.
**Rationale**: 서버 비용 0, 오프라인 플레이 가능, 응답 즉시. 보드가 20노드 내외로 작아 탐색 공간이 감당 가능.
**Trade-offs**: 저사양 기기에서 깊은 탐색 시 UI 블로킹 위험. 클라이언트 코드라 리버스 엔지니어링 가능(싱글플레이라 영향 없음).
**Consequences**: 탐색을 비동기로 분할 실행하고, 난이도별 깊이 상한을 실측으로 정해야 함 (M2).

---

### ADR-007: 온라인 대전은 서버 권위 모델

- **Date**: 2026-07-24
- **Status**: Proposed
- **Decided by**: Architect

**Context**: 클라이언트가 게임 결과를 직접 써넣으면 치팅이 자명하게 가능.
**Decision**: 클라이언트는 Move(의도)만 전송. Cloud Function이 저장된 상태에 engine.applyMove를 재실행해 검증 후 커밋.
**Rationale**: 규칙 엔진이 순수 함수라 서버에서 동일 코드를 그대로 실행 가능 — 검증 비용이 거의 0.
**Trade-offs**: 매 수마다 함수 호출 → 지연 및 호출 비용. 턴제라 허용 범위.
**Consequences**: M3에서 함수 콜드스타트 지연 측정 필요. 확정 전 Status는 Proposed 유지.

---

### ADR-008: 게임 규칙 경계 케이스 5건 확정 (RQ-001~005)

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: 사용자

**Context**: 기획서 v1.0은 게임의 의도를 잘 담고 있으나, 구현에 필요한 경계 케이스 5건이 미정의 상태였다. 엔진 구현 전 확정이 필요했다.

**Decision**:
1. RQ-001 봉인 복구(💎2) → 해당 노드는 `EMPTY`. 복구자의 돌이 놓이지 않는다.
2. RQ-002 연쇄 포획 없음. "한 번의 행동에서 발생한 포획만 처리한다."
3. RQ-003 행동 불가 시 강제 패스. 양 플레이어 연속 패스 시 게임 종료.
4. RQ-004 💎3은 보드 정의에 미리 지정된 잠긴 노드(◇) 중 하나를 자유롭게 개방.
5. RQ-005 포획된 돌은 영구 제거. 상대의 손으로 돌아가지 않는다.

**Rationale**:
- RQ-001: 복구자의 돌이 즉시 놓이면 💎2가 "복구 + 배치" 2행동 가치가 되어 과도하게 강력해진다.
- RQ-002: 규칙 단순성(설계 원칙 1)을 지키고 턴 처리를 명확하게 만든다. 연쇄는 예측 불가능성을 키워 "매 턴 의미 있는 선택"(원칙 4)을 오히려 해친다.
- RQ-003: 즉시 종료 방식은 한쪽이 일시적으로 막혔을 뿐인데 게임을 끝내버려 역전 여지를 없앤다.
- RQ-004: 잠긴 노드를 보드 데이터로 미리 지정하면 "보드가 콘텐츠"(원칙 2)라는 철학과 일치하고, 보드 설계자가 확장 시나리오를 의도적으로 배치할 수 있다.
- RQ-005: 돌을 병력으로, 결정을 기술로 만들어 포획의 긴장감을 최대화한다. 체스에서 말을 잃는 감각에 해당하며, 이 게임만의 개성을 만든다.

**Trade-offs**:
- RQ-005가 가장 큰 리스크. 3회 포획당한 플레이어는 돌 2개만 남고, 💎1은 손에 돌이 없으면 쓸 수 없어 결정이 "죽은 자원"이 될 수 있다. 회복 불가능한 스노우볼 구조가 될 위험.
- 사용자와 합의: **MVP에서는 영구 제거를 유지하되 밸런스 검증 1순위(BAL-001)로 지정.**

**Consequences**:
- `docs/game-rules.md` v1.0 확정 → M1 엔진 구현 착수 가능
- `GameState`에 `consecutivePasses` 필드 추가 (RQ-003)
- `Move`에 `pass` 종류 추가
- `GameState`에 `RuleConfig` 추가 — `crystalPlaceMode` 플래그를 M1부터 구현해 BAL-001을 코드 재작성 없이 A/B 검증
- 기획서 v1.1에 반영 필요

---

### ADR-009: 밸런스 대안을 설정 플래그로 선제 구현

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: Architect (사용자 제안 기반)

**Context**: RQ-005의 대안(💎1 = 제거된 돌 회수 후 즉시 배치)이 필요해질 가능성이 상당하다. 플레이테스트 후에 이를 추가하면 엔진·AI 평가함수·테스트를 모두 손봐야 한다.

**Decision**: `RuleConfig.crystalPlaceMode: 'place-from-hand' | 'recover-and-place'`를 M1 엔진에 처음부터 포함한다. 기본값은 `'place-from-hand'`.

**Rationale**: 규칙 엔진이 순수 함수(ADR-004)이므로 설정을 GameState에 실어 자가대전 시뮬레이터가 두 모드를 동시에 돌릴 수 있다. 밸런스 결정이 "코드 변경"에서 "실험 파라미터"로 바뀐다.

**Trade-offs**: 엔진에 분기 하나가 늘어 테스트 케이스가 두 배가 되는 구간이 생긴다. 💎1 관련 테스트에 한정되므로 감당 가능.

**Consequences**: `npm run sim`은 모드별 통계를 분리 출력해야 한다. M2 종료 시 기본 모드를 확정하고 별도 ADR로 기록한다.

---

### ADR-010: 온라인 대전 상태를 Move 로그로 저장 (전체 state 스냅샷 대신)

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: Architect

**Context**: RTDB에 대전 상태를 어떻게 저장할지 두 방식이 있었다 — 매 수마다 전체 GameState를 덮어쓰기 vs Move 로그를 append.

**Decision**: `moves: Move[]` append-only 로그를 저장하고, 클라이언트는 로그를 engine으로 재생해 현재 상태를 도출한다.

**Rationale**:
- 전송 페이로드가 수 하나로 최소화 (전체 state는 보드+점유+결정 전부 → 큼)
- 재접속 시 로그 재생만으로 완전 복원 → 클라이언트 무상태
- 리플레이(§4)가 공짜로 따라옴 — 저장 포맷이 곧 리플레이 포맷
- 서버 검증이 자연스러움: 서버도 같은 로그를 재생해 검증(ADR-007과 결합)
- engine이 순수 함수(ADR-004)라 재생 비용이 결정적이고 저렴

**Trade-offs**: 로그가 길어지면 재생 비용 증가(단 SEAL은 한 게임 수십 수 규모라 무시 가능). 스키마 진화 시 과거 로그 호환성 관리 필요 → BoardDef/RuleConfig에 version 필드 포함.

**Consequences**: `serialize`/`deserialize`가 상태와 로그 양쪽을 지원해야 함. `turn`은 로그에서 파생되지만 쿼리 편의를 위해 서버가 캐시로 함께 씀.

---

### ADR-011: 통합 설계 명세서(design-spec.md) 확정, 구현 착수 승인

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: 사용자 ("설계를 모두 끝내고 진행해")

**Context**: 코드 작성 전 전체 설계를 완결하기로 함.

**Decision**: `docs/design-spec.md` v1.0을 정본 설계 명세로 확정. 데이터 모델, 엔진 API 전체 시그니처, 보드 스키마, AI 구조, 온라인 동기화, 폴더 구조, 구현 순서를 모두 포함. 미결 6건(OPEN-1~6)은 전부 파라미터/후속 마일스톤 사항으로 설계를 막지 않음을 확인.

**Rationale**: 규칙(game-rules.md)과 구조(design-spec.md)가 모두 확정되어 구현은 명세를 코드로 옮기는 작업만 남음. 1인+AI 개발에서 설계 공백은 세션 간 표류를 만들므로 선확정이 유리.

**Trade-offs**: 초안 보드 좌표 등 일부는 구현 중 조정 필요. 스키마는 확정이므로 조정이 구조에 영향 없음.

**Consequences**: TASK-001부터 순차 구현. 각 태스크는 design-spec의 해당 섹션을 명세로 참조.

---

### ADR-012: i18n과 저장·생명주기를 설계 단계에서 선반영

- **Date**: 2026-07-24
- **Status**: Accepted
- **Decided by**: 사용자

**Context**: 앱이 KR + 글로벌 양쪽을 대상으로 하고, 로컬 이어하기와 온라인 재접속이 필요하다. 두 가지(i18n, 저장/생명주기) 모두 나중에 추가하면 전체 컴포넌트/스토어를 훑어야 하는 레트로핏 비용이 크다.

**Decision**:
1. i18n(§6.5): i18next + react-i18next + expo-localization. 첫날부터 모든 UI 문자열을 `t('key')`로 작성, ko/en 동시 등록. engine은 문자열을 반환하지 않아(MoveError 코드값) i18n과 완전 분리.
2. 저장·생명주기(§6.6): MMKV로 로컬 게임/설정/리플레이 저장, serialize 포맷을 저장=전송=리플레이로 통일. AppState 전이를 store가 구독해 모드별 처리(로컬=자동저장, 온라인=재구독/유예). MMKV 접근은 lib/storage.ts로 격리, 인증 토큰은 secure-store(M3).

**Rationale**: 둘 다 지금 넣으면 구조에 몇 줄이지만 나중엔 전면 수정. i18n 문자열 하드코딩과 "저장 없음"은 되돌리기가 특히 비싼 대표적 항목. engine 순수성(ADR-004)을 지키는 방향과도 일치.

**Trade-offs**: 초기 태스크가 4개(TASK-008/009/019b + 문자열 키화) 늘어난다. 추상 게임이라 문자열이 적어 i18n 비용은 낮은 편.

**Consequences**: design-spec §6.5/§6.6 추가. 폴더에 locales/·src/lib/ 추가. GameStore에 persist/restore/handleAppState, SettingsStore 신설. dependencies에 i18next·react-i18next·expo-localization·react-native-mmkv 추가.
