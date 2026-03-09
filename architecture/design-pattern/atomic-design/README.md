## Atomic Design + Next.js 예제

이 디렉터리는 **Atomic Design** 패턴을 Next.js(App Router) 위에 적용한 작은 예제 프로젝트입니다.  
목표는 **atoms → molecules → organisms → templates → pages** 계층이 실제 코드 구조와 어떻게 연결되는지, 그리고 각 컴포넌트가 **단일 책임 원칙(SRP)** 을 어떻게 지키는지 보여주는 것입니다.

---

### 1. 폴더 구조 개요

루트 구조는 다음과 같습니다.

```text
atomic-design/
  app/                 # Next.js App Router (라우팅 root)
  src/
    components/
      atoms/           # 가장 작은 UI 단위 (버튼, 텍스트, 뱃지 등)
      molecules/       # 여러 Atom이 모인 작은 조합
      organisms/       # 페이지의 섹션 단위
    templates/         # 페이지 레이아웃/구조
    styles/            # 전역 스타일
```

- `app/` 디렉터리는 Next.js 가 요구하는 라우팅 전용 디렉터리입니다.
- 실제 Atomic Design 계층은 `src/components` 와 `src/templates` 아래에서 구성합니다.

---

### 2. Atomic Design 계층과 코드 매핑

Atomic Design 의 다섯 계층을 이 프로젝트에 그대로 매핑했습니다.

- **Atoms (`src/components/atoms`)**
  - **역할**: 더 이상 쪼개기 어려운, 문맥에 독립적인 UI 요소
  - 이 예제에서는:
    - `Text`: 텍스트 출력용 컴포넌트 (`p`, `span`, `small` 등)
    - `Button`: 스타일이 캡슐화된 공통 버튼
    - `Badge`: 상태/타입을 표시하는 작은 라벨
  - **SRP**:
    - 각 Atom 은 “자기 자신의 스타일/표현” 만 책임지고, 비즈니스 의미나 레이아웃은 알지 못합니다.

- **Molecules (`src/components/molecules`)**
  - **역할**: 여러 Atom 이 모여 하나의 “단일 목적” 블록을 이루는 구성 요소
  - 이 예제에서는:
    - `CardHeader`:
      - 타이틀, 서브타이틀, 우측 액션 영역을 가진 카드 상단 구조
      - 내부에서 `Text` 등의 Atom 을 조합
    - `StatItem`:
      - 라벨/값/설명을 함께 보여주는 작은 정보 블록
      - `Badge`, `Text` Atom 을 조합해서 하나의 “통계 아이템” 역할 수행
  - **SRP**:
    - 각각 “카드 헤더”, “통계 아이템”이라는 구체적인 UI 패턴 하나만 책임집니다.

- **Organisms (`src/components/organisms`)**
  - **역할**: 여러 Molecule과 Atom을 조합해 **페이지의 뚜렷한 섹션**을 구성
  - 이 예제에서는:
    - `PageHeader`:
      - 페이지 상단의 제목, 서브 설명, 액션 버튼을 포함한 영역
      - 내부에서 `Badge`, `Button`, `Text` 등을 조합
    - `AtomicSummaryCard`:
      - Atomic Design 다섯 계층을 요약해서 보여주는 카드
      - `CardHeader`(molecule) 와 여러 `StatItem`(molecule)을 사용
  - **SRP**:
    - 각 Organism 은 “페이지 상단 헤더”, “Atomic Design 요약 카드” 같은 특정 섹션만을 담당합니다.

- **Templates (`src/templates`)**
  - **역할**: 페이지의 **레이아웃/구조** 를 정의
  - 이 예제에서는:
    - `HomePageTemplate`:
      - 위/아래, 좌/우 컬럼 등 레이아웃과 어떤 Organism 이 어디에 배치될지 결정
      - `PageHeader`, `AtomicSummaryCard` 등 organism 을 배치
  - **SRP**:
    - 템플릿은 “어떤 블록들이 어떤 그리드/레이아웃에 배치되는지” 만 책임집니다.
    - 실제 콘텐츠/데이터의 의미는 Organism 이하 계층이 담당합니다.

- **Pages (Next.js `app/page.tsx`)**
  - **역할**: 템플릿에 실제 데이터를 주입해 최종 페이지를 구성
  - 이 예제에서는:
    - `app/page.tsx`:
      - 단순히 `HomePageTemplate` 를 렌더링합니다.
      - 별도의 데이터 주입 없이 구조 설명에 집중하는 데모입니다.
  - **SRP**:
    - Page 컴포넌트는 “어떤 템플릿을 어떤 라우트에서 보여줄지” 만 책임집니다.

---

### 3. 단일 책임 원칙(SRP)을 의식한 분리

이 프로젝트는 Atomic Design 계층 뿐만 아니라 **SRP** 에도 초점을 맞추어 설계했습니다.

- **`Button` / `Badge` / `Text` (atoms)**
  - 각각 “버튼 스타일, 배지 스타일, 텍스트 스타일” 만 책임집니다.
  - 특정 페이지나 도메인 지식(예: 어떤 통계인지, 어떤 상태인지)을 포함하지 않습니다.

- **`StatItem` (molecule)**
  - “라벨 + 값 + 설명” 이라는 패턴 하나만 책임집니다.
  - 어떤 도메인의 통계인지(예: 주문 수, 방문자 수)는 알지 못합니다.

- **`PageHeader` / `AtomicSummaryCard` (organisms)**
  - 페이지 상단 영역, Atomic Design 설명 카드라는 **섹션 단위**의 책임을 가집니다.
  - 전역 라우팅이나 앱 전체 상태는 신경 쓰지 않습니다.

- **`HomePageTemplate` (template)**
  - 어떤 organism 이 어떤 레이아웃으로 배치될지만 책임집니다.
  - 통계 수치나 API 호출 로직은 포함하지 않습니다.

이렇게 계층과 책임을 나누면:

- 새로운 UI 섹션을 추가할 때, 어느 계층에 어떤 코드를 넣어야 할지 명확해집니다.
- 컴포넌트를 재사용하거나 변경할 때, 영향 범위를 쉽게 예측할 수 있습니다.

---

### 4. Next.js App Router 와의 연결

이 예제는 Next.js App Router 구조를 그대로 활용하면서 Atomic Design 계층을 `src` 아래에서 유지합니다.

- `app/layout.tsx`
  - Next.js 루트 레이아웃
  - 전역 스타일(`src/styles/globals.css`) 만 import 하고 children 을 감쌉니다.

- `app/page.tsx`
  - 루트 라우트(`/`) 의 페이지 컴포넌트
  - 여기서는 `HomePageTemplate` 만 렌더링해서 “Pages → Templates” 연결을 보여줍니다.

앱이 복잡해지더라도:

- 라우팅/SEO/메타데이터는 `app/` 아래에서 관리하고
- UI 구조/디자인 시스템은 `src/components`, `src/templates` 아래에서 관리할 수 있습니다.

---

### 5. 실행 방법

이 디렉터리에서 다음 명령을 실행합니다.

```bash
cd architecture/design-pattern/atomic-design

# 의존성 설치
pnpm install      # 또는 npm install, yarn install 등

# 개발 서버 실행
pnpm dev          # 또는 npm run dev, yarn dev
```

브라우저에서 `http://localhost:3000` 에 접속하면,

- 상단 `PageHeader` organism 과
- 좌측 `AtomicSummaryCard` organism,
- 우측 설명 카드가 `HomePageTemplate` 에 의해 배치된 화면을 확인할 수 있습니다.

---

### 6. 어떻게 확장할 수 있을까?

이 예제는 디자인 시스템의 구조를 설명하는 수준이지만, 실제 프로젝트에 적용할 때는 다음과 같이 확장할 수 있습니다.

- **Atoms 추가**
  - 입력 필드, 토글 스위치, 아이콘 등 공통 UI 요소들을 atoms 로 분리

- **Molecules 추가**
  - 검색 바, 입력 + 버튼 조합, 필터 칩 리스트 등 반복되는 UI 패턴 정의

- **Organisms 추가**
  - 네비게이션 바, 사이드바, 카드 리스트 등 큰 섹션 단위 구성

- **Templates 확장**
  - 대시보드 레이아웃, 상세 페이지 레이아웃 등 여러 페이지에서 재사용되는 레이아웃 정의

중요한 것은:

- 디자인과 코드 모두에서 **일관성과 재사용성** 을 유지하기 위해
- Atomic Design 계층과 **SRP** 를 항상 함께 고려하는 것입니다.

