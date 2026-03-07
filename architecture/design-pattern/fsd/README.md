## Feature-Sliced Design + Next.js 예제

이 디렉터리는 **Feature-Sliced Design(FSD)** 를 Next.js(App Router) 위에 적용한 작은 예제 프로젝트입니다.  
목표는 **작은 규모의 기능**만으로도 FSD 레이어 구조와 **단일 책임 원칙(SRP)** 을 최대한 명확하게 보여주는 것입니다.

---

### 1. 폴더 구조 개요

루트 구조는 다음과 같습니다.

```text
fsd/
  app/                  # Next.js App Router (라우팅 root)
  src/
    app/                # FSD app 레이어 (전역 설정, Provider, 스타일)
    pages/              # FSD pages 레이어 (라우트별 페이지 조합)
    widgets/            # widgets 레이어 (화면의 독립 블록)
    features/           # features 레이어 (사용자 기능 단위)
    entities/           # entities 레이어 (비즈니스 엔티티)
    shared/             # shared 레이어 (전역 재사용 코드)
```

각 레이어의 책임은 아래에서 자세히 설명합니다.

---

### 2. 레이어별 역할과 의존성 규칙

- **app 레이어 (`src/app`)**
  - **역할**: 애플리케이션 전역 설정과 Provider, 글로벌 스타일을 초기화.
  - 이 예제에서는:
    - `src/app/providers/theme-context.tsx`: 전역 다크/라이트 테마 컨텍스트
    - `src/app/providers/app-providers.tsx`: 모든 전역 Provider를 한 곳에서 감싸는 컴포넌트
    - `src/app/styles/globals.css`: 전역 레이아웃/타이포/버튼 스타일
  - **Next.js와의 연결**
    - `app/layout.tsx` 에서 위 Provider와 CSS만 가져와서 children 을 감쌉니다.
    - 비즈니스 도메인(entities, features 등)을 직접 사용하지 않고 **전역 설정만 담당**합니다.

- **pages 레이어 (`src/pages`)**
  - **역할**: 라우트별로 화면을 조합하는 최상위 React 컴포넌트.
  - 이 예제에서는:
    - `src/pages/home/ui/home-page.tsx`: 홈 페이지. 헤더/설명/위젯들을 조합.
    - Next.js의 `app/page.tsx` 는 이 `HomePage`만 import 해서 렌더링합니다.
  - **규칙**
    - `widgets`, `features`, `entities`, `shared` 에는 의존할 수 있지만, `app` 레이어의 내부 구현을 건드리지 않습니다.

- **widgets 레이어 (`src/widgets`)**
  - **역할**: 여러 `features`와 `entities`를 조합해 **재사용 가능한 화면 블록**을 만든다.
  - 이 예제에서는:
    - `src/widgets/task-board/ui/task-board.tsx`
      - 작업 목록, 필터, 통계를 하나의 보드로 묶은 UI 블록.
      - 내부에서만 `useState`, `useMemo`를 사용해 상태를 관리.
      - `entities/task` 와 `features/task-filters` 를 조합.
  - **규칙**
    - `features`, `entities`, `shared`에 의존 가능.
    - 비즈니스 프로세스가 복잡해지면 `processes` 레이어로 올릴 수 있지만, 이 예제에서는 간단하므로 `widgets` 에서 끝냅니다.

- **features 레이어 (`src/features`)**
  - **역할**: 사용자의 **하나의 기능(use-case)** 을 캡슐화.
  - 이 예제에서는:
    - `src/features/task-filters/model/task-filter.ts`
      - `TaskFilter` 타입 정의: `'all' | 'active' | 'completed'`
      - `applyTaskFilter` 함수: 필터 값에 따라 작업 목록을 필터링 (순수 함수)
    - `src/features/task-filters/ui/task-filters.tsx`
      - 상태 필터 버튼 UI.
      - 필터 변경 이벤트(`onChange`)만 상위로 올리고, 나머지 렌더링은 이 컴포넌트에서 책임집니다.
  - **규칙**
    - `entities`, `shared` 에 의존 가능.
    - 상위 레이어(pages, widgets)는 사용할 수 있지만, 거꾸로 의존해서는 안 됩니다.

- **entities 레이어 (`src/entities`)**
  - **역할**: 비즈니스 **엔티티(도메인 모델)** 를 표현.
  - 이 예제에서는:
    - `src/entities/task/model/task.ts`
      - `Task`, `TaskStatus` 타입 정의
      - `createInitialTasks()` : 초기 작업 목록을 생성하는 순수 함수
    - `src/entities/task/ui/task-item.tsx`
      - 개별 Task 를 렌더링하는 UI 컴포넌트
      - 상태 변경 자체를 하지 않고, `onToggleStatus` 콜백만 받아서 UI 이벤트를 위로 올림
  - **규칙 (SRP 강조)**
    - Task 엔티티는 **Task 자체**만 책임집니다.
    - 필터링, 정렬, 페이지 조합 등은 다른 레이어의 책임입니다.

- **shared 레이어 (`src/shared`)**
  - **역할**: 어느 도메인에도 속하지 않는 **전역 재사용 코드**.
  - 이 예제에서는:
    - `src/shared/lib/class-names.ts`: `classNames` 유틸
    - `src/shared/ui/card/card.tsx`: Card UI 컴포넌트
    - `src/shared/ui/theme-toggle/theme-toggle-button.tsx`: 전역 테마 토글 버튼 (app 레이어의 ThemeContext를 활용)
  - **규칙**
    - 어떤 레이어에서도 사용할 수 있지만, 도메인에 특화된 로직을 넣지 않습니다.

---

### 3. 단일 책임 원칙(SRP)을 지키기 위한 분리 전략

이 예제에서는 다음과 같이 **SRP** 를 의식해서 컴포넌트를 분리했습니다.

- **`entities/task/model/task.ts`**
  - 책임: Task 도메인의 타입과 초기 데이터 정의.
  - UI, 필터링, 페이지 라우팅 등은 전혀 알지 못합니다.

- **`entities/task/ui/task-item.tsx`**
  - 책임: Task 하나를 화면에 어떻게 보여줄지.
  - 상태 변경 방법은 알지 못하고, `onToggleStatus` 콜백만 받아서 버튼 클릭 시 호출합니다.

- **`features/task-filters/*`**
  - 책임: Task 목록을 필터링하는 기능과 이에 대한 UI 제공.
  - 실제 Task 데이터가 어디서 오는지, 페이지가 어떻게 생겼는지 모릅니다.

- **`widgets/task-board/ui/task-board.tsx`**
  - 책임: Task 목록/필터/통계를 하나의 보드로 묶어 보여주기.
  - 상태(`useState`)와 도메인 조합을 여기서 처리하지만,
    - Task 도메인 정의는 `entities` 에 위임
    - 필터 로직은 `features` 에 위임

- **`pages/home/ui/home-page.tsx`**
  - 책임: 홈 라우트에서 어떤 위젯을 어떤 레이아웃으로 보여줄지 결정.
  - 비즈니스 로직, 상태 관리를 직접 하지 않고 `TaskBoard` 위젯을 조합하는 역할에 집중합니다.

이렇게 하면:

- 기능이 늘어나도 **엔티티/피처/위젯/페이지** 별로 책임이 나뉘어 있어, 어디를 수정해야 할지 명확합니다.
- 테스트를 작성할 때도 **도메인 단위**, **기능 단위**, **UI 조합 단위**로 쪼개서 접근할 수 있습니다.

---

### 4. Next.js App Router와의 연결

- `app/layout.tsx`
  - Next.js 가 요구하는 루트 레이아웃 컴포넌트입니다.
  - 여기서는 **전역 Provider (`AppProviders`)와 전역 CSS** 만 연결합니다.

- `app/page.tsx`
  - Next.js 의 루트 라우트(`/`) 페이지입니다.
  - 실제 UI는 `src/pages/home/ui/home-page.tsx` 의 `HomePage` 컴포넌트가 담당하고,
    - 이 컴포넌트 내부에서 `widgets/task-board` 를 사용해 화면을 구성합니다.

이렇게 구성하면:

- Next.js 라우팅 규칙은 그대로 따르면서
- **도메인 구조(FSD)** 는 `src` 아래에서 깔끔하게 유지할 수 있습니다.

---

### 5. 실행 방법

이 디렉터리에서 다음 명령을 실행하면 됩니다.

```bash
cd architecture/design-pattern/fsd

# 의존성 설치
pnpm install      # 또는 npm install, yarn install 등

# 개발 서버 실행
pnpm dev          # 또는 npm run dev, yarn dev
```

브라우저에서 `http://localhost:3000` 에 접속하면,

- FSD 레이어 설명과 함께
- `widgets/task-board` 가 렌더링된 간단한 작업 보드를 확인할 수 있습니다.

---

### 6. 이 예제를 어떻게 확장할 수 있을까?

예제를 확장하면서도 **FSD + SRP** 를 유지하려면 다음과 같이 생각해 볼 수 있습니다.

- 새로운 도메인 추가
  - 예: `entities/user`, `entities/project` 등을 추가하고
  - 각 엔티티의 타입/모델/UI를 별도로 정의합니다.

- 새로운 기능(feature) 추가
  - 예: `features/task-create`, `features/task-priority` 등
  - 각각의 기능이 **하나의 명확한 행동**만 책임지도록 만듭니다.

- 새로운 위젯(widget) 추가
  - 예: `widgets/project-summary`, `widgets/user-activity`
  - 여러 엔티티/피처를 조합해서 독립적인 화면 블록을 구성합니다.

이렇게 작은 예제를 기반으로 실제 프로젝트에서도

- **레이어 규칙을 강하게 지키는 구조**
- **단일 책임에 충실한 컴포넌트/함수**

를 유지하면, 규모가 커져도 유지보수가 훨씬 편한 FSD 구조를 만들 수 있습니다.

