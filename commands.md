<!--
Purpose:        역할별 명령어 빠른 참조
Owner:          Implementer / Release Manager
Update Trigger: 명령어 추가, 환경 변경
Harness Version: 1.1
-->

# commands.md — SEAL 빠른 참조

_Last updated: 2026-07-24_

## Setup

```bash
npm install                       # 의존성 설치
cp .env.example .env              # 환경 변수 설정
npx expo prebuild                 # 네이티브 프로젝트 생성 (필요 시)
```

## Development

```bash
npx expo start                    # 개발 서버
npx expo start --ios              # iOS 시뮬레이터
npx expo start --android          # Android 에뮬레이터

npm test                          # 테스트 실행
npm test -- --watch               # 워치 모드
npm test -- src/engine            # 엔진 테스트만
npm run test:coverage             # 커버리지 리포트

npm run lint                      # 린트
npm run format                    # 포맷
npx tsc --noEmit                  # 타입 체크
```

## Firebase

```bash
firebase emulators:start          # 로컬 에뮬레이터 (RTDB + Functions + Auth)
firebase deploy --only functions  # ⚠️ HUMAN APPROVAL 필요
firebase deploy --only database   # ⚠️ Security Rules 배포 — HUMAN APPROVAL 필요
```

## Build & Deploy

```bash
eas build --profile development --platform ios
eas build --profile preview --platform all      # 내부 테스트 빌드
eas build --profile production --platform all   # ⚠️ HUMAN APPROVAL 필요
eas submit --platform ios                       # ⚠️ HUMAN APPROVAL 필요
```

## Game-specific (SEAL 전용)

```bash
npm run sim -- --games 1000       # AI 자가대전 시뮬레이션 (밸런스 검증)
npm run sim -- --board h --p1 minimax:3 --p2 random
npm run validate:boards           # boards/*.json 그래프 유효성 검사
npm run replay -- <matchId>       # 저장된 대전 기록 재생
```

> `sim` / `validate:boards` / `replay`는 M1 중반에 구축 예정인 개발 도구입니다.

## Git (GitHub 클라우드 환경)

```bash
git switch -c feat/engine-capture     # 브랜치 생성 (main 직접 커밋 금지)
gh pr create --fill                   # PR 생성
gh pr checks                          # CI 상태 확인
```
