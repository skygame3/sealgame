<!--
Purpose:        알려진 버그, 기술 부채, 임시 우회책 추적
Owner:          Debugger / Reviewer
Update Trigger: 버그 발견, 이슈 해결, 기술 부채 식별
Harness Version: 1.1
-->

# Known Issues — SEAL

_Last updated: 2026-07-30_

## Active Bugs

| ID | Severity | Description | Found | Owner |
|----|----------|-------------|-------|-------|
| — | — | (없음) | — | — |

## Resolved Rule Questions ✅

RQ-001~005 모두 2026-07-24 확정. 상세는 `docs/game-rules.md` §확정 이력 참조.

| ID | 질문 | 확정 |
|----|------|------|
| RQ-001 | 봉인 복구 후 상태 | `EMPTY` — 복구자 돌 놓이지 않음 |
| RQ-002 | 연쇄 포획 | 없음 — 한 행동에서 발생한 포획만 처리 |
| RQ-003 | 한쪽만 막힌 경우 | 강제 패스, 양측 연속 패스 시 종료 |
| RQ-004 | 💎3 개방 대상 | 보드에 미리 지정된 잠긴 노드 중 자유 선택 |
| RQ-005 | 포획된 돌의 행방 | 영구 제거 (조건부 — BAL-001 참조) |

## Balance Watch List (플레이테스트 검증 대상)

| ID | 항목 | 우려 | 검증 시점 |
|----|------|------|----------|
| **BAL-001** | **RQ-005 영구 제거** | 3회 포획당하면 돌 2개. 💎1이 손에 돌 없으면 사용 불가 → 결정이 죽은 자원이 되고 회복 불가 스노우볼 | **M2 최우선** |
| BAL-002 | 선공 유리 | 선공 승률 55% 초과 시 조정 | M2 |
| BAL-003 | 💎 비용 밸런스 (1/2/3) | 특정 효과만 쓰이거나 아예 안 쓰이는 편향 | M2 |
| BAL-004 | 시작 돌 5개 | 게임 길이가 목표(모바일 5~8분) 대비 짧거나 김 | M2 |

### BAL-001 대응 설계 (선제 반영)

engine에 `RuleConfig.crystalPlaceMode` 플래그를 M1부터 구현해 재작성 없이 A/B 비교:

- `'place-from-hand'` (기본, MVP) — 💎1 = 손의 돌을 추가 배치
- `'recover-and-place'` (대안) — 💎1 = 제거된 돌 1개를 손으로 되돌린 후 즉시 배치

측정 지표와 임계값은 `docs/game-rules.md` §10 참조.

## Technical Debt

| ID | Description | Impact | Target Resolution |
|----|-------------|--------|-------------------|
| SEC-001 | Expo SDK 57 및 Jest 전이 의존성의 `npm audit` 결과에 high 취약점이 보고됨. 호환 가능한 자동 수정이 없고, `npm audit fix --force`는 Expo SDK를 46으로 내리므로 적용하지 않음. | 개발 도구 공급망 점검 필요. 앱 코드의 런타임 동작에는 현재 영향 확인되지 않음. | Expo SDK/Jest 호환 보안 업데이트가 나오면 별도 의존성 업데이트 PR에서 재검토 |

## Anticipated Risks (사전 식별)

| ID | 리스크 | 대응 방향 |
|----|--------|----------|
| RISK-001 | AI 탐색이 저사양 기기 UI를 블로킹 | 탐색 분할 실행 + 깊이 상한 실측 (M2) |
| RISK-002 | Cloud Function 콜드스타트로 대전 응답 지연 | min instances 또는 Move 로그 방식 재검토 (M3) |
| RISK-003 | 1인 개발 범위 확산 | roadmap의 Out of Scope를 매 마일스톤 시작 시 재확인 |
| RISK-004 | 밸런스 검증 부족 (플레이테스터 없음) | AI 자가대전 시뮬레이터로 선공 승률·평균 턴 수 측정 |

## Open Design Parameters (구현 병행 결정)

설계를 막지 않는 파라미터/후속 결정. 상세는 `docs/design-spec.md` §11.

| ID | 사항 | 결정 시점 |
|----|------|----------|
| OPEN-1 | H보드 최종 좌표·엣지 | TASK-006 |
| OPEN-2 | AI 평가 가중치 w1~w5 | M2 |
| OPEN-3 | crystalPlaceMode 기본값 (=BAL-001) | M2 |
| OPEN-4 | 저사양 AI depth 상한 | M2 |
| OPEN-5 | 패키지 매니저 npm 확정 | TASK-001 |
| OPEN-6 | 온라인 타임아웃 시간 | M3 |

## Issue Template

```
### ISS-XXX: [제목]
- **Severity**: Critical | High | Medium | Low
- **Found**: YYYY-MM-DD
- **재현 절차**:
- **근본 원인**:
- **우회책**:
- **영구 수정 방향**:
```
