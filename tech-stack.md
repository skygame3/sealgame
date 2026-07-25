<!--
Purpose:        기술 선택과 그 근거
Owner:          Architect
Update Trigger: 새 기술 도입, 기존 기술 교체
Harness Version: 1.1
-->

# tech-stack.md — SEAL 기술 스택

_Last updated: 2026-07-24_

## Stack Overview

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Language | TypeScript | 5.x | 게임 상태 타입 안전성이 규칙 버그를 컴파일 타임에 잡아줌 |
| Framework | React Native (Expo) | SDK 최신 | 1인 개발, iOS/Android 동시 대응, EAS로 빌드 인프라 불필요 |
| Rendering | react-native-svg | 15.x | 불규칙 그래프 보드는 SVG가 자연스러움. 노드/엣지가 20개 내외라 성능 충분 |
| State | Zustand | 5.x | 보일러플레이트 최소. 게임 상태는 순수 엔진이 계산하고 스토어는 보관만 |
| Database | Firebase Realtime Database | — | 턴제 대전은 저지연 소규모 상태 동기화 → RTDB가 Firestore보다 적합·저렴 |
| Server Logic | Firebase Cloud Functions | Node 20 | 온라인 대전 수 검증(치팅 방지), 매칭 큐 |
| Auth | Firebase Auth (익명 + 소셜) | — | 익명 로그인으로 진입 마찰 제거 |
| AI | 클라이언트 Minimax + Alpha-Beta | 자체 구현 | 서버 비용 0, 오프라인 플레이 가능 |
| Package Manager | npm | 10.x | Expo 기본값. ⚠️ pnpm 선호 시 초기에 확정 필요 |
| CI/CD | GitHub Actions | — | GitHub 기반 클라우드 개발 환경. lint/test/EAS 빌드 트리거 |

## Architecture Patterns

- **Structure**: Layered — `engine/`(순수 함수) → `store/`(Zustand) → `ui/`(React Native)
- **핵심 원칙**: 게임 규칙은 전부 `engine/`의 순수 함수. React·Firebase·플랫폼 API를 일절 import 하지 않음
- **API style**: Firebase SDK 직접 호출 + Cloud Functions Callable (검증 필요한 동작만)
- **State management**: Zustand (로컬) + RTDB 구독(온라인). 온라인은 서버가 권위(authoritative)
- **AI**: 동일한 `engine/` 함수를 사용하는 탐색기. 규칙 중복 구현 금지

## Repo Layout (예정)

```
seal/
├── AGENTS.md, ORCHESTRATOR.md, tech-stack.md, ...  # 하니스 루트 문서
├── memory/ tasks/ prompts/ reports/ docs/          # 하니스 디렉터리
├── app/                    # Expo 앱
│   └── src/
│       ├── engine/         # 순수 게임 엔진 (테스트 100% 대상)
│       ├── ai/             # Minimax 탐색기
│       ├── store/          # Zustand
│       ├── screens/
│       ├── components/     # SVG 보드 렌더러 포함
│       └── net/            # Firebase 연동
├── functions/              # Cloud Functions
├── boards/                 # 보드 정의 JSON (콘텐츠)
└── .github/workflows/
```

> 하니스 문서는 별도 하위 폴더가 아니라 레포 루트에 직접 위치한다. AGENTS.md/ORCHESTRATOR.md는 에이전트 툴이 루트에서 자동 탐색하는 컨벤션을 따르기 위함.

## Environments

| Environment | Purpose | Access |
|-------------|---------|--------|
| Local | 로컬 개발 | Expo Dev Client + Firebase Emulator Suite |
| Staging | 내부 테스트 | Firebase 프로젝트 `seal-staging` / TestFlight·Internal Testing |
| Production | 라이브 | Firebase 프로젝트 `seal-prod` / App Store·Play Store |

## 미확정 사항

- [ ] 패키지 매니저 최종 확정 (npm vs pnpm)
- [ ] 온라인 대전 매칭 방식 (랜덤 큐 / 방 코드 / 둘 다)
- [ ] 애니메이션 라이브러리 (Reanimated 도입 여부 — 봉인/포획 연출 시점에 결정)
