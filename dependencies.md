<!--
Purpose:        외부 의존성 추적과 버전 정책
Owner:          Architect / Implementer
Update Trigger: 의존성 추가/제거/버전 변경 (HUMAN APPROVAL 필요)
Harness Version: 1.1
-->

# dependencies.md — SEAL 의존성

_Last updated: 2026-07-24_

## Core Dependencies

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| expo | latest SDK | RN 앱 프레임워크 | MIT |
| react-native | Expo 고정 | 런타임 | MIT |
| react-native-svg | ^15 | 보드 그래프 렌더링 | MIT |
| zustand | ^5 | 클라이언트 상태 관리 | MIT |
| firebase | ^11 | Auth / RTDB 클라이언트 SDK | Apache-2.0 |
| expo-router | latest | 화면 라우팅 | MIT |
| i18next | ^26.3.6 | 국제화 코어 (§6.5) | MIT |
| react-i18next | ^17.0.11 | React 바인딩 | MIT |
| expo-localization | ~57.0.1 | 기기 언어 감지 | MIT |
| react-native-mmkv | ^4.3.2 | 로컬 저장 (게임/설정/리플레이) | MIT |
| react-native-nitro-modules | ^0.36.3 | MMKV v4 네이티브 런타임 | MIT |

## Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5 | 타입 |
| jest-expo | ~57.0.3 | Expo 호환 테스트 러너 |
| @testing-library/react-native | ^14.0.1 | 컴포넌트 테스트 |
| react-test-renderer | 19.2.3 | React Native 테스트 렌더러 |
| eslint / eslint-config-expo | ^9 / ~57.0.1 | Expo 규칙 기반 린트 |
| prettier | ^3.9.6 | 포맷 |
| eas-cli | latest | 빌드·배포 |
| firebase-tools | latest | 에뮬레이터·배포 |

## External Services / APIs

| Service | Purpose | Auth | Notes |
|---------|---------|------|-------|
| Firebase Auth | 익명 + 소셜 로그인 | SDK | 익명 우선, 나중에 계정 연결 |
| Firebase RTDB | 온라인 대전 상태 동기화 | Security Rules | deny-by-default |
| Cloud Functions | 수 검증, 매칭 | Callable | 서버가 권위 |
| EAS Build | iOS/Android 빌드 | 계정 | 무료 티어 한도 확인 필요 |

## 도입 검토 중 (미승인)

| Package | 용도 | 검토 시점 |
|---------|------|----------|
| react-native-reanimated | 봉인/포획 애니메이션 | M2 |
| expo-haptics | 배치·포획 촉각 피드백 | M2 |
| expo-secure-store | 온라인 인증 토큰 저장 | M3 |

## Version Policy

- Major 업그레이드: HUMAN APPROVAL + 전체 테스트 통과 필요
- Minor / patch: Reviewer 승인 후 진행
- 보안 패치: 즉시 적용 후 Reviewer 사후 검토
- **Expo SDK 업그레이드는 항상 별도 PR로 단독 진행**
