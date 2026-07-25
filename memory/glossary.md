<!--
Purpose:        프로젝트 고유 용어와 약어
Owner:          모든 에이전트(기여), Documenter(유지)
Update Trigger: 새 도메인 용어 등장, 기존 용어 의미 변경
Harness Version: 1.1
-->

# Glossary — SEAL

_Last updated: 2026-07-24_

## Domain Terms (게임 용어)

| 용어 | 영문/코드 | 정의 |
|------|----------|------|
| 노드 | Node | 보드에서 돌을 놓을 수 있는 지점 |
| 엣지 | Edge | 두 노드를 잇는 연결선. 인접 관계를 정의 |
| 돌 | Stone | 플레이어의 말. 플레이어당 5개로 시작 |
| 포획 | Capture | `내 돌 – 상대 돌 – 내 돌` 형태가 성립해 상대 돌을 제거하는 것 |
| 봉인 | Seal | 포획이 일어난 노드가 영구적으로 사용 불가 상태가 되는 것. X 토큰으로 표시 |
| 결정 | Crystal (💎) | 포획 1회당 1개 획득하는 자원. 3종 효과에 소비 |
| 추가 배치 | crystal-place | 💎1 — 즉시 돌 하나를 추가로 놓음 |
| 봉인 복구 | crystal-restore | 💎2 — 봉인된 노드를 다시 사용 가능하게 함 |
| 노드 개방 | crystal-unlock | 💎3 — 잠긴 노드를 열어 보드를 확장 |
| 잠긴 노드 | Locked Node | 게임 시작 시 사용 불가. 💎3으로 개방 가능 |
| 핵심 노드 | Key Node | 동점 시 승패를 가르는 특별 노드 |
| 핫시트 | Hot-seat | 한 기기에서 두 사람이 번갈아 플레이하는 로컬 모드 |

## Technical Terms

| 용어 | 정의 |
|------|------|
| Engine | `src/engine/` — 규칙을 담은 순수 함수 레이어. 프로젝트의 핵심 자산 |
| GameState | 현재 게임의 전체 상태를 담은 불변 객체 |
| Move | 플레이어의 한 수를 나타내는 값. `place` / `crystal-*` 4종 |
| Legal Moves | 현재 상태에서 규칙상 가능한 모든 Move 목록 |
| Terminal | 양 플레이어 모두 둘 수 없어 게임이 끝난 상태 |
| Authoritative Server | 서버가 게임 상태의 최종 권위를 갖는 모델. 클라이언트는 의도만 전송 |
| Self-play | AI끼리 자동 대전시켜 밸런스 데이터를 수집하는 시뮬레이션 |

## Abbreviations

| 약어 | 정식 명칭 | 설명 |
|------|----------|------|
| ADR | Architecture Decision Record | 기술 결정 기록 |
| MVP | Minimum Viable Product | 최소 검증 가능 제품 |
| Gate | Human Approval Gate | 사용자 승인이 필요한 체크포인트 |
| RTDB | Realtime Database | Firebase 실시간 데이터베이스 |
| EAS | Expo Application Services | Expo 빌드·배포 서비스 |
| RQ | Rule Question | 미확정 규칙 질문 (known-issues.md) |

## Harness Terms

| 용어 | 정의 |
|------|------|
| Harness | AI 개발 OS 문서 구조 전체 |
| Session | 에이전트의 단위 작업 세션 |
| Active Task | `tasks/active.md`에 있는 진행 중 작업 |
| Registry | 활성 에이전트 역할 목록 |
