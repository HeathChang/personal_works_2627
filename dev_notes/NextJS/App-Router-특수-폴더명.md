# Next.js App Router 특수 폴더명

## 개요

Next.js App Router에서는 특수한 기호를 사용하여 라우팅 기능을 확장합니다:
- **`@`**: Parallel Routes (병렬 라우트)
- **`()`**: Route Groups (라우트 그룹)
- **`(.)`, `(..)`, `(...)`**: Intercepting Routes (인터셉팅 라우트)
- **`[]`**: Dynamic Routes (동적 라우트)

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

## 4. `[]` - Dynamic Routes (동적 라우트)

### 개념
**런타임에 결정되는 동적인 URL 세그먼트**를 처리하는 기능입니다. URL 파라미터를 받아서 페이지에서 사용할 수 있습니다.

### 종류

#### 1) `[slug]` - 단일 동적 세그먼트
하나의 동적 세그먼트를 매칭합니다.

```
app/
└── blog/
    └── [slug]/
        └── page.js    → /blog/:slug
```

**예시:**
- `/blog/my-first-post` → `params.slug = "my-first-post"`
- `/blog/hello-world` → `params.slug = "hello-world"`

```jsx
// app/blog/[slug]/page.js
export default function BlogPost({ params }) {
  return <h1>Post: {params.slug}</h1>
}
```

#### 2) `[...slug]` - Catch-all Routes
여러 세그먼트를 배열로 캡처합니다. **반드시 하나 이상의 세그먼트가 필요**합니다.

```
app/
└── docs/
    └── [...slug]/
        └── page.js    → /docs/* (모든 경로)
```

**예시:**
- `/docs/a` → `params.slug = ["a"]`
- `/docs/a/b` → `params.slug = ["a", "b"]`
- `/docs/a/b/c` → `params.slug = ["a", "b", "c"]`
- `/docs` → ❌ 매칭 안 됨 (세그먼트 필요)

```jsx
// app/docs/[...slug]/page.js
export default function DocsPage({ params }) {
  const path = params.slug?.join('/') || ''
  return <h1>Docs: {path}</h1>
}
```

#### 3) `[[...slug]]` - Optional Catch-all Routes
여러 세그먼트를 배열로 캡처하지만, **세그먼트가 없어도 매칭**됩니다.

```
app/
└── shop/
    └── [[...slug]]/
        └── page.js    → /shop, /shop/* (모든 경로)
```

**예시:**
- `/shop` → `params.slug = undefined` 또는 `[]`
- `/shop/category` → `params.slug = ["category"]`
- `/shop/category/product` → `params.slug = ["category", "product"]`

```jsx
// app/shop/[[...slug]]/page.js
export default function ShopPage({ params }) {
  if (!params.slug || params.slug.length === 0) {
    return <h1>Shop Home</h1>
  }
  return <h1>Shop: {params.slug.join('/')}</h1>
}
```

### params 사용법

#### Server Component에서
```jsx
// app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const post = await fetch(`/api/posts/${params.slug}`)
  const data = await post.json()
  
  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>
  )
}
```

#### generateStaticParams (정적 생성)
빌드 타임에 미리 생성할 경로를 지정합니다.

```jsx
// app/blog/[slug]/page.js
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(res => res.json())
  
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPost({ params }) {
  return <h1>{params.slug}</h1>
}
```

#### generateMetadata (동적 메타데이터)
```jsx
// app/blog/[slug]/page.js
export async function generateMetadata({ params }) {
  const post = await fetch(`/api/posts/${params.slug}`).then(res => res.json())
  
  return {
    title: post.title,
    description: post.description,
  }
}
```

### 다중 동적 세그먼트
여러 동적 세그먼트를 조합할 수 있습니다.

```
app/
└── [category]/
    └── [id]/
        └── page.js    → /:category/:id
```

```jsx
// app/[category]/[id]/page.js
export default function ProductPage({ params }) {
  return (
    <div>
      <h1>Category: {params.category}</h1>
      <h2>ID: {params.id}</h2>
    </div>
  )
}
```

**예시:**
- `/electronics/123` → `params.category = "electronics"`, `params.id = "123"`

### 특징
- **URL에 포함됨**: `[slug]`는 실제 URL 경로의 일부
- **타입 안전성**: TypeScript 사용 시 `params` 타입 추론
- **정적 생성 지원**: `generateStaticParams`로 빌드 타임 생성 가능
- **서버 컴포넌트 기본**: 동적 라우트는 기본적으로 서버 컴포넌트

### 사용 사례
- 블로그 포스트: `/blog/[slug]`
- 제품 상세: `/products/[id]`
- 사용자 프로필: `/users/[username]`
- 문서 시스템: `/docs/[...slug]`
- 파일 시스템 라우팅: `/files/[[...path]]`

---

## 비교표

| 기호 | 이름 | URL 영향 | 용도 |
|------|------|----------|------|
| `@folder` | Parallel Routes | 없음 | 동시에 여러 UI 렌더링 |
| `(folder)` | Route Groups | 없음 | 논리적 그룹화, 레이아웃 공유 |
| `(.)folder` | Intercepting Routes | 없음 | 같은 레벨 라우트 모달/오버레이 |
| `(..)folder` | Intercepting Routes | 없음 | 상위 레벨 라우트 모달/오버레이 |
| `(...)folder` | Intercepting Routes | 없음 | 루트 레벨 라우트 모달/오버레이 |
| `[slug]` | Dynamic Routes | 포함됨 | 단일 동적 세그먼트 |
| `[...slug]` | Catch-all Routes | 포함됨 | 여러 세그먼트 배열로 캡처 (필수) |
| `[[...slug]]` | Optional Catch-all | 포함됨 | 여러 세그먼트 배열로 캡처 (선택) |

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

4. **Dynamic Routes는 URL 세그먼트가 됨**
   - `[slug]`는 실제 URL 경로에 포함됨
   - `/blog/[slug]` → `/blog/my-post` (URL)
   - `params` 객체를 통해 값에 접근

5. **Catch-all vs Optional Catch-all**
   - `[...slug]`: 최소 1개 세그먼트 필요 (`/docs` → ❌)
   - `[[...slug]]`: 세그먼트 없어도 됨 (`/shop` → ✅)

6. **모든 특수 폴더는 URL 세그먼트가 아님** (Dynamic Routes 제외)
   - `@`, `()`, `(.)` 등은 실제 URL 경로에 포함되지 않음
   - 라우팅 로직에만 영향을 줌

