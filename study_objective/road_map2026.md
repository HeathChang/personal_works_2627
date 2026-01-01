=# 2026 Frontend Developer Roadmap (React 중심)

> **목표**: 단순히 기능/기술을 아는 개발자가 아닌, *웹과 프론트엔드가 어떻게 작동하는지*를 깊이 이해하는 개발자
>
> **정량 목표**: **연간 300+ 커밋** (≈ 주 6~7회)

---

## 1. React를 "잘 쓰는 수준" → "설명할 수 있는 수준"으로

### 핵심 목표

* React의 **설계 철학과 내부 동작 원리**를 이해하고, 상황에 맞는 선택을 할 수 있는 상태

### 학습/실천 항목

* React 렌더링 흐름

  * JSX → React Element → Fiber → Commit Phase
  * Reconciliation 과정과 key의 의미
* Hooks 내부 동작

  * useState, useEffect, useMemo, useCallback의 동작 시점
  * 클로저 문제, stale state 발생 원인
* 상태 관리 철학

  * Local State vs Global State
  * 서버 상태와 클라이언트 상태의 분리 (React Query / TanStack Query)
* 성능 최적화

  * 불필요한 리렌더링 원인 추적
  * React DevTools Profiler 활용

### 커밋 아이디어
* React 동작 원리를 설명하는 예제 repo
* 동일한 UI를 서로 다른 상태 구조로 구현해 비교

---

## 2. Next.js: "프레임워크 사용자" → "아키텍처 이해자"

### 핵심 목표

* Next.js를 단순히 사용하는 것이 아니라, **왜 이런 구조인지 설명 가능**

### 학습/실천 항목

* Rendering 전략

  * SSR / SSG / ISR / CSR의 내부 동작 차이
  * Hydration 과정과 실패 시 문제
* App Router 심화

  * Server Component vs Client Component
  * RSC가 필요한 이유와 한계
* 데이터 패칭 전략

  * fetch 캐싱 계층
  * 서버 액션(Server Actions)의 장단점
* 배포 관점

  * Edge Runtime vs Node Runtime
  * Vercel 환경에서의 성능 특성

### 커밋 아이디어
* RSC와 Client Component 비교 실험
* Toy Project 진행

---

## 3. SOLID를 "이론" → "프론트엔드 설계 기준"으로

### 핵심 목표

* SOLID 원칙을 **React 컴포넌트 설계 기준**으로 체화

### 학습/실천 항목

* SRP (단일 책임 원칙)

  * Container / Presentational 분리
  * UI 로직과 비즈니스 로직 분리
* OCP (개방-폐쇄 원칙)

  * 컴포넌트 확장 포인트 설계 (children, render props)
* ISP / DIP

  * props 인터페이스 최소화
  * 의존성 주입 패턴 (hook 기반)

### 커밋 아이디어
* 리팩토링 전/후 비교 커밋
* "안 좋은 컴포넌트" → "좋은 컴포넌트" 사례 모음

---

## 4. 테스트 & 품질: "돌아간다" → "신뢰할 수 있다"

### 핵심 목표

* 테스트를 개발 속도를 늦추는 것이 아닌 **설계 도구**로 활용

### 학습/실천 항목

* 테스트 전략

  * Unit / Integration / E2E 역할 분리
* 프론트 테스트

  * Testing Library 철학
  * 사용자 관점 테스트 작성
* 품질 지표

  * Lighthouse, Web Vitals 이해

### 커밋 아이디어
* 테스트 없는 컴포넌트 → 테스트 추가
* 버그 재현 테스트 작성

---

## 5. 아키텍처 & 확장성

### 핵심 목표

* 혼자 만드는 앱이 아닌 **성장 가능한 서비스 구조** 설계

### 학습/실천 항목

* 폴더 구조

  * Feature-based vs Layer-based
* 상태/도메인 분리

  * UI / Domain / Infra 개념 도입
* 모노레포 기초

  * Turborepo / pnpm workspace

### 커밋 아이디어
* 작은 서비스라도 아키텍처 문서 작성
* 구조 변경 히스토리 남기기

---

## 6. 기록 & 설명 능력 (시니어로 가는 핵심)

### 핵심 목표

* "알고 있다" → "남에게 설명할 수 있다"

### 실천 항목

* Markdown 기반 기록

  * 개념 정리 노트
  * 의사결정 로그 (왜 이렇게 했는지)
* 기술 블로그 또는 README 중심 개발

### 커밋 전략
* 학습 → 정리 → 커밋
* 작은 커밋을 자주 (실험 단위)

---

## 7. 300+ 커밋 전략

* **원칙**: 작은 단위, 실험 위주
* 코드 + 문서 커밋 모두 인정
* 예시

  * 개념 정리 md
  * 실험 코드
  * 리팩토링
  * 테스트 추가

---

* "UI 구현자" → "제품 문제 해결자"
* 비즈니스 요구 → 기술 선택 근거 설명 연습
* 성능, 접근성, 유지보수성을 동시에 고려

---



> *책임 소재와 이유가 분명한 컴포넌트를 설계하는 개발자가 되자.*
