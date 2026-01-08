# Next.js SEO 최적화 가이드

## 개요

Next.js는 App Router를 통해 강력한 SEO 기능을 제공합니다. Metadata API를 사용하여 각 페이지의 메타데이터를 쉽게 관리할 수 있으며, 서버 컴포넌트를 통해 SEO에 최적화된 HTML을 생성합니다.

## 주요 SEO 기능

### 1. 정적 메타데이터 (Static Metadata)

#### 기본 사용법

```jsx
// app/layout.js - 루트 레이아웃
export const metadata = {
  title: 'My Website',
  description: 'Welcome to my website',
}

// app/about/page.js - 페이지별 메타데이터
export const metadata = {
  title: 'About Us',
  description: 'Learn more about our company',
}
```

#### 메타데이터 병합

Next.js는 레이아웃과 페이지의 메타데이터를 자동으로 병합합니다.

```jsx
// app/layout.js
export const metadata = {
  title: {
    default: 'My Website',
    template: '%s | My Website', // 하위 페이지 제목에 자동 추가
  },
  description: 'Default description',
}

// app/about/page.js
export const metadata = {
  title: 'About', // 결과: "About | My Website"
  description: 'About page description', // description은 덮어씀
}
```

### 2. 동적 메타데이터 (Dynamic Metadata)

`generateMetadata` 함수를 사용하여 동적으로 메타데이터를 생성할 수 있습니다.

```jsx
// app/blog/[slug]/page.js
export async function generateMetadata({ params, searchParams }) {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
  }
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  return <article>{/* ... */}</article>
}
```

### 3. Open Graph 메타데이터

소셜 미디어 공유를 위한 Open Graph 태그를 설정합니다.

```jsx
export const metadata = {
  openGraph: {
    title: 'My Page Title',
    description: 'My page description',
    url: 'https://example.com',
    siteName: 'My Website',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'My page image',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
}
```

#### 동적 Open Graph

```jsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  
  return {
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
        },
      ],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
  }
}
```

### 4. Twitter Cards

Twitter 공유를 위한 메타데이터를 설정합니다.

```jsx
export const metadata = {
  twitter: {
    card: 'summary_large_image',
    title: 'My Page Title',
    description: 'My page description',
    images: ['https://example.com/twitter-image.jpg'],
    creator: '@username',
  },
}
```

### 5. robots.txt

`app/robots.txt` 파일을 생성하여 검색 엔진 크롤러를 제어합니다.

```jsx
// app/robots.txt
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

또는 정적 파일로 생성:

```txt
# app/robots.txt (정적 파일)
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml
```

### 6. sitemap.xml

동적 사이트맵을 생성할 수 있습니다.

```jsx
// app/sitemap.js
export default async function sitemap() {
  const posts = await getPosts()
  
  const postEntries = posts.map((post) => ({
    url: `https://example.com/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
  
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://example.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...postEntries,
  ]
}
```

### 7. 구조화된 데이터 (Structured Data)

JSON-LD 형식으로 구조화된 데이터를 추가합니다.

```jsx
// app/blog/[slug]/page.js
export default async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.imageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <h1>{post.title}</h1>
        {/* ... */}
      </article>
    </>
  )
}
```

### 8. 이미지 최적화

Next.js의 `Image` 컴포넌트는 자동으로 이미지를 최적화하여 SEO에 도움이 됩니다.

```jsx
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="/hero.jpg"
      alt="Descriptive alt text" // SEO에 중요!
      width={1200}
      height={630}
      priority // Above the fold 이미지에 사용
    />
  )
}
```

**SEO를 위한 이미지 최적화 팁:**
- 항상 의미 있는 `alt` 텍스트 제공
- `width`와 `height` 명시 (CLS 방지)
- Above the fold 이미지는 `priority` 사용
- 적절한 이미지 형식 사용 (WebP, AVIF)

### 9. 메타데이터 전체 예제

```jsx
// app/blog/[slug]/page.js
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    creator: post.author,
    publisher: 'My Website',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://example.com'),
    alternates: {
      canonical: `/blog/${params.slug}`,
      languages: {
        'ko-KR': `/ko/blog/${params.slug}`,
        'en-US': `/en/blog/${params.slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/blog/${params.slug}`,
      siteName: 'My Website',
      images: [
        {
          url: post.ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'ko_KR',
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.twitterImage],
      creator: '@username',
    },
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
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  }
}
```

## App Router vs Page Router SEO 차이

### Page Router (Pages Router)

```jsx
// pages/blog/[slug].js
import Head from 'next/head'

export default function BlogPost({ post }) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
      </Head>
      <article>{/* ... */}</article>
    </>
  )
}
```

### App Router

```jsx
// app/blog/[slug]/page.js
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}
```

**App Router의 장점:**
- 타입 안전성 제공
- 메타데이터 자동 병합
- 서버 컴포넌트에서 직접 데이터 페칭 가능
- 더 깔끔한 코드 구조

## 성능 최적화와 SEO

### 1. 서버 컴포넌트 활용

서버 컴포넌트는 초기 HTML에 콘텐츠를 포함시켜 SEO에 유리합니다.

```jsx
// ✅ 좋은 예: Server Component
async function BlogPost({ params }) {
  const post = await getPost(params.slug)
  return <article>{post.content}</article>
}

// ❌ 나쁜 예: Client Component에서 데이터 페칭
'use client'
function BlogPost({ params }) {
  const [post, setPost] = useState(null)
  useEffect(() => {
    fetch(`/api/posts/${params.slug}`).then(/* ... */)
  }, [])
  // 초기 HTML에 콘텐츠가 없어 SEO에 불리
}
```

### 2. 정적 생성 (Static Generation)

빌드 타임에 페이지를 생성하여 SEO와 성능을 향상시킵니다.

```jsx
// app/blog/[slug]/page.js
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }) {
  // ...
}
```

### 3. 캐싱 전략

```jsx
// ISR (Incremental Static Regeneration)
async function getPost(slug) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 }, // 1시간마다 재검증
  })
  return res.json()
}
```

## SEO 체크리스트

### 필수 항목

- [ ] 각 페이지에 고유한 `title` 설정
- [ ] 각 페이지에 의미 있는 `description` 설정
- [ ] Open Graph 메타데이터 설정
- [ ] Twitter Cards 메타데이터 설정
- [ ] 모든 이미지에 `alt` 텍스트 제공
- [ ] `robots.txt` 설정
- [ ] `sitemap.xml` 생성
- [ ] `lang` 속성 설정 (`<html lang="ko">`)
- [ ] Canonical URL 설정

### 권장 항목

- [ ] 구조화된 데이터 (JSON-LD) 추가
- [ ] 다국어 지원 시 `hreflang` 태그 추가
- [ ] 페이지 로딩 속도 최적화
- [ ] 모바일 친화적 디자인 (반응형)
- [ ] HTTPS 사용
- [ ] 검색 콘솔 등록 (Google Search Console)

## 추가 리소스

- [Next.js Metadata API 문서](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph 프로토콜](https://ogp.me/)
- [Schema.org](https://schema.org/)
