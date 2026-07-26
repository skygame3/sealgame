<!--
Purpose:        하네스 사용 안내
Owner:          프로젝트 리드
Update Trigger: 하네스 구조 변경
Harness Version: 1.1
-->

# AI Development Harness — SEAL

AI 협업 개발을 위한 문서 OS. 모든 AI 세션은 여기서 컨텍스트를 읽고, 여기에 결과를 남깁니다.

## 세션 시작 시 붙여넣을 문구

```
AGENTS.md 를 읽고 규칙을 확인한 뒤,
memory/project.md → memory/session.md → tasks/active.md 순서로 컨텍스트를 로드해.
오늘 역할은 [Implementer]야. prompts/implementation.md 를 적용해.
```

## 구조

하니스 문서는 별도 하위 폴더가 아니라 **레포 루트에 직접** 위치한다 (`app/`, `functions/` 등 향후 앱 코드와 나란히). AGENTS.md/ORCHESTRATOR.md를 에이전트 툴이 루트에서 자동 탐색하는 컨벤션을 따르기 위함.

```
seal/                     # 레포 루트
├── AGENTS.md            # 프로젝트 헌법 — 항상 먼저 읽음
├── ORCHESTRATOR.md      # 워크플로우와 승인 게이트
├── tech-stack.md        # 기술 선택과 근거
├── standards.md         # 코드·테스트 표준
├── commands.md          # 명령어 참조
├── dependencies.md      # 의존성 추적
├── roadmap.md           # M0~M4 마일스톤
├── memory/
│   ├── project.md       # 현재 상태 스냅샷
│   ├── architecture.md  # 시스템 설계
│   ├── decisions.md     # ADR 이력
│   ├── known-issues.md  # 버그 + 미확정 규칙(RQ)
│   ├── glossary.md      # 게임·기술 용어
│   ├── session.md       # 현재 세션 (매번 갱신)
│   └── sessions/        # 세션 아카이브
├── tasks/
│   ├── active.md        # 진행 중
│   ├── backlog.md       # 대기 (M0~M4 전체)
│   └── completed.md     # 완료 아카이브
├── prompts/             # 역할별 시스템 프롬프트 12종
├── reports/             # 리뷰·조사·보안·성능 보고서
└── docs/
    ├── PROJECT-GUIDE.md  # 초보 개발자 온보딩 가이드 ⭐ 여기부터
    ├── design-spec.md    # 통합 기술 설계 명세
    └── game-rules.md     # 구현용 정밀 규칙서
```

## 처음 왔다면

**초보 개발자용 온보딩 가이드**: `docs/PROJECT-GUIDE.md`
게임이 뭔지, 왜 이렇게 설계했는지, 어디부터 코드를 봐야 하는지 쉬운 말로 설명합니다.
`design-spec.md`나 ADR을 읽기 전에 먼저 이걸 읽으세요.

## 지금 해야 할 일

1. `memory/known-issues.md`의 **RQ-001~005 규칙 확정** — 엔진 구현 전 필수
2. `tasks/backlog.md`의 TASK-001부터 순차 진행

## 유지 규칙

- 세션 종료 전 `memory/session.md` 갱신 필수
- 기술 결정은 반드시 `memory/decisions.md`에 ADR로
- 완료 태스크는 삭제하지 말고 `completed.md`로 이동
# sealgame
# sealgame
