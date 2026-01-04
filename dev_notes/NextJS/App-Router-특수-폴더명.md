# Next.js App Router 특수 폴더명

## 개요

Next.js App Router에서는 특수한 기호를 사용하여 라우팅 기능을 확장합니다:
- **`@`**: Parallel Routes (병렬 라우트)
- **`()`**: Route Groups (라우트 그룹)
- **`(.)`, `(..)`, `(...)`**: Intercepting Routes (인터셉팅 라우트)

---

## 1. `@` - Parallel Routes (병렬 라우트)

### 개념
동일한 URL 경로에서 **여러 개의 독립적인 페이지를 동시에 렌더링**할 수 있게 해주는 기능입니다. 각 슬롯(slot)은 독립적으로 로딩, 에러 처리, Suspense를 가질 수 있습니다.

### 구조
```
app/
├── layout.js
├── page.js
├── @analytics/
│   └── page.js
├── @team/
│   └── page.js
└── @dashboard/
    └── page.js
```

### 사용법

#### 1) Layout에서 슬롯 props 받기
```jsx
// app/dashboard/layout.js
export default function DashboardLayout({
  children,
  analytics,  // @analytics 슬롯
  team,       // @team 슬롯
}) {
  return (
    <div>
      <aside>{analytics}</aside>
      <main>{children}</main>
      <aside>{team}</aside>
    </div>
  )
}
```

#### 2) 각 슬롯에 페이지 생성
```jsx
// app/dashboard/@analytics/page.js
export default function Analytics() {
  return <div>Analytics Dashboard</div>
}

// app/dashboard/@team/page.js
export default function Team() {
  return <div>Team Members</div>
}

// app/dashboard/page.js (children)
export default function Dashboard() {
  return <div>Main Dashboard</div>
}
```

### 특징
- **URL에 영향 없음**: `@analytics`는 URL에 나타나지 않음
- **독립적인 Suspense**: 각 슬롯은 독립적으로 로딩 상태 관리
- **조건부 렌더링**: `default.js`로 fallback 제공 가능
- **동시 렌더링**: 여러 슬롯이 병렬로 렌더링되어 성능 향상

### default.js (Fallback)
슬롯이 매칭되지 않을 때 표시할 기본 UI:

```jsx
// app/dashboard/@analytics/default.js
export default function DefaultAnalytics() {
  return <div>No analytics data</div>
}
```

### 조건부 슬롯
```jsx
// app/dashboard/layout.js
export default function Layout({ children, analytics, team }) {
  return (
    <div>
      {children}
      {analytics || <DefaultAnalytics />}
      {team || <DefaultTeam />}
    </div>
  )
}
```

### 사용 사례
- 대시보드: 메인 콘텐츠 + 사이드바 + 알림 패널
- 모니터링: 메트릭 + 로그 + 차트를 동시에 표시
- 조건부 UI: 사용자 권한에 따라 다른 슬롯 표시

---

## 2. `()` - Route Groups (라우트 그룹)

### 개념
**URL에 영향을 주지 않고** 폴더를 논리적으로 그룹화하는 기능입니다. 같은 레이아웃을 공유하는 라우트들을 묶을 때 사용합니다.

### 구조
```
app/
├── (marketing)/
│   ├── layout.js      # 마케팅 전용 레이아웃
│   ├── about/
│   │   └── page.js    → /about
│   └── contact/
│       └── page.js    → /contact
├── (shop)/
│   ├── layout.js      # 쇼핑 전용 레이아웃
│   ├── products/
│   │   └── page.js    → /products
│   └── cart/
│       └── page.js    → /cart
└── page.js            → /
```

### 특징
- **URL에 포함 안 됨**: `(marketing)`은 URL에 나타나지 않음
- **레이아웃 공유**: 그룹 내 모든 라우트가 같은 레이아웃 사용
- **조직화**: 관련된 라우트를 논리적으로 그룹화

### 사용 예시
```jsx
// app/(marketing)/layout.js
export default function MarketingLayout({ children }) {
  return (
    <div>
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  )
}

// app/(shop)/layout.js
export default function ShopLayout({ children }) {
  return (
    <div>
      <ShopHeader />
      {children}
      <ShopFooter />
    </div>
  )
}
```

---

## 3. `(.)`, `(..)`, `(...)` - Intercepting Routes (인터셉팅 라우트)

### 개념
다른 라우트의 페이지를 **같은 레이아웃 내에서 가로채서(intercept) 모달이나 오버레이로 표시**하는 기능입니다.

### 기호 의미
- **`(.)`**: 같은 레벨의 라우트 인터셉트
- **`(..)`**: 한 단계 위 레벨의 라우트 인터셉트
- **`(...)`**: 루트 `app` 디렉토리 레벨의 라우트 인터셉트

### 구조 예시
```
app/
├── @modal/
│   └── (.)photo/
│       └── [id]/
│           └── page.js    # 모달로 표시
├── photo/
│   └── [id]/
│       └── page.js        # 전체 페이지로 표시
└── feed/
    └── page.js
```

### 사용 예시: 모달 구현

```jsx
// app/photo/[id]/page.js (전체 페이지)
export default function PhotoPage({ params }) {
  return (
    <div>
      <h1>Photo {params.id}</h1>
      <img src={`/photos/${params.id}.jpg`} />
    </div>
  )
}

// app/@modal/(.)photo/[id]/page.js (모달로 인터셉트)
export default function PhotoModal({ params }) {
  return (
    <div className="modal">
      <h1>Photo {params.id}</h1>
      <img src={`/photos/${params.id}.jpg`} />
    </div>
  )
}

// app/layout.js
export default function Layout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

### 동작 방식
1. `/feed`에서 `/photo/123` 링크 클릭
2. `(.)photo/[id]`가 인터셉트하여 모달로 표시
3. 직접 `/photo/123` 접근 시 전체 페이지로 표시

### 사용 사례
- 이미지 갤러리: 썸네일 클릭 시 모달로 확대
- 상세 페이지: 리스트에서 클릭 시 오버레이로 표시
- 빠른 미리보기: 전체 페이지 로드 없이 콘텐츠 확인

---

## 비교표

| 기호 | 이름 | URL 영향 | 용도 |
|------|------|----------|------|
| `@folder` | Parallel Routes | 없음 | 동시에 여러 UI 렌더링 |
| `(folder)` | Route Groups | 없음 | 논리적 그룹화, 레이아웃 공유 |
| `(.)folder` | Intercepting Routes | 없음 | 같은 레벨 라우트 모달/오버레이 |
| `(..)folder` | Intercepting Routes | 없음 | 상위 레벨 라우트 모달/오버레이 |
| `(...)folder` | Intercepting Routes | 없음 | 루트 레벨 라우트 모달/오버레이 |

---

## 주의사항

1. **Parallel Routes는 Layout에서 props로 받아야 함**
   - 슬롯 이름과 props 이름이 일치해야 함
   - `@analytics` → `analytics` prop

2. **Route Groups는 URL에 포함되지 않음**
   - `(marketing)/about` → `/about` (URL)
   - 폴더 구조만 논리적으로 정리

3. **Intercepting Routes는 클라이언트 네비게이션에서만 동작**
   - 직접 URL 접근 시 인터셉트 안 됨
   - `<Link>` 컴포넌트 사용 시에만 동작

4. **모든 특수 폴더는 URL 세그먼트가 아님**
   - 실제 URL 경로에 포함되지 않음
   - 라우팅 로직에만 영향을 줌

