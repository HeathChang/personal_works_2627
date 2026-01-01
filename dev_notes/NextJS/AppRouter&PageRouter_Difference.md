# Next.js App Router vs Page Router 차이점

## 개요

Next.js는 두 가지 라우팅 시스템을 제공합니다:
- **Page Router** (Pages Router): Next.js 12 이하의 전통적인 라우팅 방식
- **App Router** (App Router): Next.js 13+ 에서 도입된 새로운 라우팅 방식

## 주요 차이점

### 1. 디렉토리 구조

#### Page Router
```
pages/
  ├── index.js          → /
  ├── about.js          → /about
  ├── blog/
  │   └── [id].js       → /blog/:id
  └── api/
      └── users.js      → /api/users
```

#### App Router
```
app/
  ├── page.js           → /
  ├── about/
  │   └── page.js       → /about
  ├── blog/
  │   └── [id]/
  │       └── page.js   → /blog/:id
  └── api/
      └── users/
          └── route.js  → /api/users
```

### 2. 파일 네이밍

| 기능 | Page Router | App Router |
|------|-------------|------------|
| 페이지 | `pages/about.js` | `app/about/page.js` |
| 레이아웃 | `pages/_app.js`, `pages/_document.js` | `app/layout.js` |
| 로딩 상태 | 커스텀 구현 필요 | `app/loading.js` |
| 에러 처리 | 커스텀 구현 필요 | `app/error.js` |
| 404 페이지 | `pages/404.js` | `app/not-found.js` |
| API 라우트 | `pages/api/route.js` | `app/api/route/route.js` |

### 3. 레이아웃 시스템

#### Page Router
- `_app.js`: 모든 페이지를 감싸는 루트 컴포넌트
- `_document.js`: HTML 문서 구조 커스터마이징
- 중첩 레이아웃을 구현하려면 커스텀 로직 필요

```jsx
// pages/_app.js
function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
```

#### App Router
- `layout.js`: 각 세그먼트별로 레이아웃 정의 가능
- 중첩 레이아웃이 자동으로 지원됨
- 레이아웃은 상태를 유지하면서 하위 페이지가 변경됨

```jsx
// app/layout.js (루트 레이아웃)
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

// app/dashboard/layout.js (중첩 레이아웃)
export default function DashboardLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

### 4. 데이터 페칭

#### Page Router
- `getServerSideProps`: 서버 사이드 렌더링 (SSR)
- `getStaticProps`: 정적 생성 (SSG)
- `getStaticPaths`: 동적 경로 생성
- 클라이언트 사이드: `useEffect` + `fetch`

```jsx
// pages/blog/[id].js
export async function getServerSideProps(context) {
  const { id } = context.params
  const res = await fetch(`https://api.example.com/posts/${id}`)
  const post = await res.json()
  
  return {
    props: { post }
  }
}
```

#### App Router
- **Server Components** (기본값): 서버에서 자동으로 실행
- `async/await` 직접 사용 가능
- `fetch`는 자동으로 캐싱됨
- 클라이언트 컴포넌트: `'use client'` + `useEffect`

```jsx
// app/blog/[id]/page.js
async function getPost(id) {
  const res = await fetch(`https://api.example.com/posts/${id}`, {
    cache: 'no-store' // 또는 'force-cache'
  })
  return res.json()
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.id)
  return <article>{post.title}</article>
}
```

### 5. 서버 컴포넌트 vs 클라이언트 컴포넌트

#### Page Router
- 모든 컴포넌트가 기본적으로 클라이언트 컴포넌트
- 서버 사이드 로직은 `getServerSideProps`에서만

#### App Router
- **Server Components** (기본): 서버에서만 실행, 번들 크기 감소
- **Client Components**: `'use client'` 지시어 사용
- 인터랙티브 기능이 필요한 경우에만 클라이언트 컴포넌트 사용

```jsx
// app/components/ServerComponent.js (서버 컴포넌트)
export default async function ServerComponent() {
  const data = await fetch('...') // 서버에서만 실행
  return <div>{data}</div>
}

// app/components/ClientComponent.js (클라이언트 컴포넌트)
'use client'
import { useState } from 'react'

export default function ClientComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 6. 로딩 및 에러 처리

#### Page Router
- 커스텀 로딩 상태 구현 필요
- 에러 바운더리 수동 설정

#### App Router
- `loading.js`: 자동 로딩 UI
- `error.js`: 자동 에러 처리
- `not-found.js`: 404 페이지

```jsx
// app/blog/loading.js
export default function Loading() {
  return <div>Loading blog posts...</div>
}

// app/blog/error.js
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### 7. 라우트 그룹 및 병렬 라우트

#### Page Router
- 라우트 그룹 지원 안 함
- 병렬 라우트 지원 안 함

#### App Router
- **라우트 그룹**: `(marketing)`, `(shop)` 같은 폴더로 그룹화 (URL에 영향 없음)
- **병렬 라우트**: `@analytics`, `@team` 같은 슬롯으로 동시에 여러 페이지 렌더링

```
app/
  ├── (marketing)/
  │   ├── about/
  │   └── contact/
  └── (shop)/
      ├── products/
      └── cart/
```

### 8. 스트리밍 및 Suspense

#### Page Router
- Suspense 지원 제한적
- 전체 페이지가 로드될 때까지 대기

#### App Router
- **Streaming SSR**: 페이지를 청크 단위로 스트리밍
- **Suspense**: 컴포넌트별로 로딩 상태 관리
- 부분적으로 렌더링된 콘텐츠를 먼저 표시 가능

```jsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div>Loading posts...</div>}>
        <Posts />
      </Suspense>
      <Suspense fallback={<div>Loading comments...</div>}>
        <Comments />
      </Suspense>
    </div>
  )
}
```

### 9. 메타데이터 관리

#### Page Router
- `next/head` 또는 `Head` 컴포넌트 사용
- 각 페이지에서 수동으로 설정

```jsx
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>My Page</title>
        <meta name="description" content="..." />
      </Head>
      <div>Content</div>
    </>
  )
}
```

#### App Router
- `metadata` 객체 또는 `generateMetadata` 함수 사용
- 타입 안전성 제공
- 중첩된 메타데이터 자동 병합

```jsx
// app/about/page.js
export const metadata = {
  title: 'About Us',
  description: 'Learn more about our company',
}

// 또는 동적 메타데이터
export async function generateMetadata({ params }) {
  const post = await getPost(params.id)
  return {
    title: post.title,
    description: post.description,
  }
}
```

### 10. API 라우트

#### Page Router
```jsx
// pages/api/users.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ users: [] })
  }
}
```

#### App Router
```jsx
// app/api/users/route.js
export async function GET() {
  return Response.json({ users: [] })
}

export async function POST(request) {
  const body = await request.json()
  return Response.json({ created: true })
}
```

### 11. 미들웨어

#### Page Router
- `middleware.js` 지원 (Next.js 12+)
- 제한적인 기능

#### App Router
- 향상된 미들웨어 지원
- 더 세밀한 라우트 제어
- Edge Runtime 최적화


## 성능 비교

### App Router의 장점
- **서버 컴포넌트**: JavaScript 번들 크기 감소
- **스트리밍**: 초기 로딩 시간 단축
- **자동 코드 스플리팅**: 더 효율적인 번들링
- **병렬 데이터 페칭**: 더 빠른 데이터 로딩

### Page Router의 장점
- **안정성**: 오래 사용된 검증된 시스템
- **호환성**: 더 많은 라이브러리 지원
- **단순성**: 학습 곡선이 낮음

## 결론

App Router는 Next.js의 미래이며, 새로운 프로젝트에서는 App Router를 사용하는 것을 강력히 권장합니다. 하지만 기존 프로젝트를 급하게 마이그레이션할 필요는 없으며, 점진적으로 전환하는 것이 좋습니다.

