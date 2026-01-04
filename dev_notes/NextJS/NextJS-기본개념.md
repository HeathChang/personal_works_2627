## Q. NextJS 기본 

### 1. Next.js란?

Next.js는 React 기반의 **풀스택 웹 프레임워크**입니다.

**주요 특징:**
- **서버 사이드 렌더링 (SSR)**: 서버에서 HTML을 생성하여 초기 로딩 속도 향상
- **정적 사이트 생성 (SSG)**: 빌드 타임에 HTML 생성
- **자동 코드 스플리팅**: 필요한 코드만 로드하여 성능 최적화
- **파일 기반 라우팅**: 폴더 구조로 자동 라우팅 설정
- **API Routes**: 백엔드 API 엔드포인트 생성 가능
- **이미지 최적화**: 자동 이미지 최적화 및 lazy loading
- **폰트 최적화**: 웹 폰트 자동 최적화

### 2. App Router vs Pages Router

#### App Router (Next.js 13+)
- `app/` 디렉토리 사용
- React Server Components 기본 지원
- 더 나은 성능과 개발자 경험
- 중첩 레이아웃 지원
- Streaming SSR 지원

#### Pages Router (전통적인 방식)
- `pages/` 디렉토리 사용
- 파일 기반 라우팅
- `getServerSideProps`, `getStaticProps` 사용

### 3. Server Components vs Client Components

#### Server Components (기본)
- **서버에서만 실행** (브라우저로 JavaScript 전송 안 됨)
- 데이터베이스 직접 접근 가능
- API 키 등 민감한 정보 안전하게 사용
- 번들 크기 감소
- 제한사항: 이벤트 핸들러, useState, useEffect 등 사용 불가

```jsx
// Server Component (기본)
async function ServerComponent() {
  const data = await fetch('...') // 서버에서만 실행
  return <div>{data}</div>
}
```

#### Client Components
- **브라우저에서 실행**
- 인터랙티브 기능 사용 가능
- React Hooks 사용 가능
- `'use client'` 지시어 필요

```jsx
'use client'
function ClientComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 4. 라우팅 (Routing)

#### 파일 기반 라우팅
```
app/
  page.js              → /
  about/
    page.js            → /about
  blog/
    page.js            → /blog
    [slug]/
      page.js          → /blog/:slug (동적 라우트)
```

#### 동적 라우트
- `[slug]` - 단일 세그먼트
- `[...slug]` - catch-all (모든 경로)
- `[[...slug]]` - optional catch-all

#### 라우트 그룹
- `(groupName)` - URL에 영향을 주지 않는 그룹화
- 예: `(marketing)/about`, `(shop)/products`

### 5. 데이터 페칭 (Data Fetching)

#### Server Components에서
```jsx
// async/await 사용
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store' // 또는 'force-cache', 'revalidate'
  })
  const json = await data.json()
  return <div>{json.title}</div>
}
```

#### 캐싱 옵션
- `cache: 'force-cache'` - 기본값, 캐시 사용
- `cache: 'no-store'` - 캐시 사용 안 함
- `next: { revalidate: 60 }` - 60초마다 재검증

### 6. 레이아웃 (Layout)

```jsx
// app/layout.js - 루트 레이아웃
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header>Navigation</header>
        {children}
        <footer>Footer</footer>
      </body>
    </html>
  )
}
```

- 레이아웃은 중첩 가능
- 레이아웃은 상태를 유지 (페이지 전환 시에도 유지)
- 공통 UI를 레이아웃에 배치

### 7. 메타데이터 (Metadata)

```jsx
// page.js 또는 layout.js
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
}

// 또는 동적 메타데이터
export async function generateMetadata({ params }) {
  return {
    title: `Post ${params.id}`,
  }
}
```

### 8. 이미지 최적화

```jsx
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // 우선 로딩
/>
```

**특징:**
- 자동 이미지 최적화
- WebP/AVIF 형식 자동 변환
- Lazy loading 기본 적용
- 반응형 이미지 지원

### 9. 링크 (Link)

```jsx
import Link from 'next/link'

<Link href="/about">About</Link>
<Link href="/blog/[slug]" as="/blog/my-post">Post</Link>
```

**특징:**
- 클라이언트 사이드 네비게이션 (페이지 새로고침 없음)
- 자동 코드 스플리팅
- 프리페칭 (hover 시 미리 로드)

### 10. API Routes

```jsx
// app/api/hello/route.js
export async function GET(request) {
  return Response.json({ message: 'Hello' })
}

export async function POST(request) {
  const body = await request.json()
  return Response.json({ received: body })
}
```

### 11. 환경 변수

```bash
# .env.local
DATABASE_URL=...
API_KEY=...
```

```jsx
// Server Component에서
const apiKey = process.env.API_KEY

// Client Component에서 (NEXT_PUBLIC_ 접두사 필요)
const publicKey = process.env.NEXT_PUBLIC_API_KEY
```

### 12. 빌드 및 배포

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

**빌드 결과:**
- `.next/` 폴더에 최적화된 파일 생성
- 정적 페이지는 HTML로 생성
- 동적 페이지는 서버에서 렌더링

