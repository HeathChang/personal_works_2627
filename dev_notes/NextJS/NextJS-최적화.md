# Next.js 최적화 가이드

## 1. Image 최적화

### Next.js Image 컴포넌트 사용

Next.js의 `Image` 컴포넌트는 자동으로 이미지를 최적화합니다.

```jsx
import Image from 'next/image';

// 기본 사용법
<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
/>

// fill 속성 사용 (부모 컨테이너에 맞춤)
<div className={classes.image}>
  <Image
    src={imageUrl}
    alt={title}
    fill
  />
</div>
```

### 주요 최적화 기능

1. **자동 포맷 변환**
   - WebP, AVIF 등 최신 포맷으로 자동 변환
   - 브라우저 지원에 따라 최적 포맷 선택

2. **Lazy Loading**
   - 기본적으로 lazy loading 적용
   - 뷰포트에 들어올 때만 로드

3. **반응형 이미지**
   - `sizes` 속성으로 반응형 이미지 제공
   - 디바이스 크기에 맞는 이미지 자동 선택

4. **이미지 크기 최적화**
   - 필요한 크기로만 리사이즈
   - 불필요한 데이터 전송 방지

### 우선순위 설정

```jsx
// Above the fold 이미지는 priority 설정
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // 즉시 로드
/>
```

### 외부 이미지 사용

`next.config.js`에서 외부 도메인 설정 필요:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
    ],
    // 또는 domains 사용 (구버전)
    // domains: ['example.com'],
  },
};

module.exports = nextConfig;
```

### 이미지 최적화 팁

- **로컬 이미지**: `public` 폴더에 저장하고 `/image.jpg` 형식으로 참조
- **외부 이미지**: `remotePatterns`에 도메인 등록 필수
- **동적 이미지**: `loader` 속성으로 커스텀 로더 사용 가능
- **placeholder**: `blur` 또는 `empty` 사용 가능

---

## 2. CSS 최적화

### CSS Modules

CSS Modules는 자동으로 클래스명을 해시하여 스코프를 격리합니다.

```jsx
// page.module.css
.header {
  color: blue;
}

// page.js
import classes from './page.module.css';

export default function Page() {
  return <header className={classes.header}>Content</header>;
}
```

### Global CSS

`globals.css`는 `layout.js`에서만 import:

```jsx
// app/layout.js
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### CSS-in-JS 최적화

- **Styled Components**: `styled-components` 사용 시 `next.config.js` 설정 필요
- **Tailwind CSS**: JIT 컴파일러로 사용하지 않는 CSS 자동 제거
- **CSS Modules**: 기본적으로 최적화됨

### CSS 최적화 팁

1. **Critical CSS**
   - Above the fold CSS는 인라인으로 포함
   - Next.js는 자동으로 최적화

2. **CSS 제거**
   - 사용하지 않는 CSS 자동 제거 (Tree Shaking)
   - CSS Modules는 사용된 클래스만 번들에 포함

3. **CSS 로딩**
   - CSS는 자동으로 코드 스플리팅
   - 페이지별로 필요한 CSS만 로드

4. **Font 최적화**
   ```jsx
   import { Inter } from 'next/font/google';
   
   const inter = Inter({ subsets: ['latin'] });
   
   export default function RootLayout({ children }) {
     return (
       <html className={inter.className}>
         <body>{children}</body>
       </html>
     );
   }
   ```

---

## 3. Metadata 최적화

### 정적 Metadata

```jsx
// app/layout.js 또는 page.js
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
};
```

### 동적 Metadata

```jsx
// app/posts/[slug]/page.js
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}
```

### Metadata 객체 구조

```jsx
export const metadata = {
  // 기본 메타데이터
  title: {
    default: 'Default Title',
    template: '%s | Site Name', // 동적 페이지에서 사용
  },
  description: 'Description',
  
  // Open Graph (소셜 미디어)
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    url: 'https://example.com',
    siteName: 'Site Name',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter Title',
    description: 'Twitter Description',
    images: ['/twitter-image.jpg'],
  },
  
  // 기타
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};
```

### Metadata 최적화 팁

1. **동적 생성**: `generateMetadata`로 페이지별 최적화
2. **템플릿 사용**: `title.template`로 일관된 타이틀 구조
3. **Open Graph**: 소셜 미디어 공유 최적화
4. **로봇 설정**: SEO를 위한 robots 메타데이터 설정

---

## 4. Server Components 최적화

### Server Components 기본

- 기본적으로 모든 컴포넌트는 Server Component
- 클라이언트에서 실행되지 않아 번들 크기 감소
- 데이터베이스 접근, 파일 시스템 등 직접 사용 가능

```jsx
// Server Component (기본)
async function Page() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();
  
  return <div>{json.title}</div>;
}
```

### Client Components

필요한 경우에만 `'use client'` 사용:

```jsx
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 최적화 원칙

- **기본적으로 Server Component 사용**
- **인터랙티브 기능이 필요한 경우만 Client Component**
- **Client Component는 최소한으로 유지**

---

## 5. Data Fetching & Caching 최적화

### Fetch 캐싱

```jsx
// 기본: force-cache (캐시 사용)
const data = await fetch('https://api.example.com/data');

// 캐시 사용 안 함
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store',
});

// 재검증 설정 (ISR)
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }, // 60초마다 재검증
});
```

### 캐싱 전략

1. **Static Generation (SSG)**
   - 빌드 시점에 페이지 생성
   - 가장 빠른 성능

2. **Incremental Static Regeneration (ISR)**
   - 정적 페이지를 주기적으로 재생성
   - `revalidate` 옵션 사용

3. **Server-Side Rendering (SSR)**
   - 요청마다 서버에서 렌더링
   - `cache: 'no-store'` 사용

### React Cache

```jsx
import { cache } from 'react';

const getData = cache(async (id) => {
  const res = await fetch(`https://api.example.com/data/${id}`);
  return res.json();
});

// 같은 요청은 캐시된 결과 반환
const data1 = await getData(1);
const data2 = await getData(1); // 캐시 사용
```

---

## 6. Code Splitting & Bundle 최적화

### 자동 Code Splitting

- Next.js는 자동으로 페이지별 코드 스플리팅
- 각 페이지는 필요한 코드만 로드

### Dynamic Imports

```jsx
import dynamic from 'next/dynamic';

// 기본 로딩
const DynamicComponent = dynamic(() => import('../components/Heavy'));

// 로딩 상태 표시
const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>,
});

// SSR 비활성화 (클라이언트에서만 로드)
const DynamicComponent = dynamic(
  () => import('../components/Heavy'),
  { ssr: false }
);
```

### Bundle 분석

```bash
# Bundle Analyzer 설치
npm install @next/bundle-analyzer

# next.config.js 설정
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // 기타 설정
});
```

---

## 7. Font 최적화

### Google Fonts

```jsx
import { Inter, Roboto } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // 폰트 로딩 전략
  variable: '--font-inter',
});

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  return (
    <html className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 로컬 Fonts

```jsx
import localFont from 'next/font/local';

const myFont = localFont({
  src: './my-font.woff2',
  display: 'swap',
});
```

### Font 최적화 효과

- 자동으로 폰트 파일 최적화
- 폰트 로딩 전략 설정 가능
- 레이아웃 시프트 방지

---

## 8. Performance 모니터링

### Web Vitals

Next.js는 자동으로 Web Vitals를 측정합니다:

- **LCP (Largest Contentful Paint)**: 최대 콘텐츠 페인트
- **FID (First Input Delay)**: 첫 입력 지연
- **CLS (Cumulative Layout Shift)**: 누적 레이아웃 시프트

### 성능 측정

```jsx
// app/layout.js
export function reportWebVitals(metric) {
  console.log(metric);
  // Analytics로 전송
}
```

### Lighthouse 점수 개선

1. **Image 최적화**: Next.js Image 컴포넌트 사용
2. **Font 최적화**: next/font 사용
3. **Code Splitting**: Dynamic imports 활용
4. **Caching**: 적절한 캐싱 전략 사용
5. **Server Components**: 클라이언트 번들 최소화

---

## 9. 추가 최적화 기법

### 1. Suspense 활용

```jsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <AsyncComponent />
      </Suspense>
    </div>
  );
}
```

### 2. Streaming

- Server Components는 자동으로 스트리밍
- 페이지의 일부가 준비되면 즉시 전송

### 3. Prefetching

```jsx
// Link 컴포넌트는 자동으로 prefetch
<Link href="/about">About</Link>

// prefetch 비활성화
<Link href="/about" prefetch={false}>About</Link>
```

### 4. Middleware 최적화

```jsx
// middleware.js
export function middleware(request) {
  // 필요한 경우에만 실행
  // 성능에 영향을 주지 않도록 최소화
}
```

### 5. 환경 변수 최적화

```jsx
// .env.local
NEXT_PUBLIC_API_URL=https://api.example.com

// 서버에서만 접근 가능한 변수는 NEXT_PUBLIC_ 접두사 제거
DATABASE_URL=postgresql://...
```

---

## 10. 체크리스트

### 이미지
- [ ] Next.js Image 컴포넌트 사용
- [ ] `priority` 속성으로 중요한 이미지 우선 로드
- [ ] 외부 이미지 도메인 설정
- [ ] 적절한 `alt` 텍스트 제공

### CSS
- [ ] CSS Modules 사용
- [ ] Global CSS는 layout.js에서만 import
- [ ] 사용하지 않는 CSS 제거

### Metadata
- [ ] 각 페이지에 적절한 metadata 설정
- [ ] 동적 페이지는 `generateMetadata` 사용
- [ ] Open Graph 설정
- [ ] Twitter Card 설정

### 성능
- [ ] Server Components 기본 사용
- [ ] Client Components 최소화
- [ ] 적절한 캐싱 전략 사용
- [ ] Dynamic imports로 큰 컴포넌트 지연 로드
- [ ] Font 최적화 (next/font 사용)

### 모니터링
- [ ] Web Vitals 측정
- [ ] Bundle 크기 모니터링
- [ ] Lighthouse 점수 확인

---

## 참고 자료

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

