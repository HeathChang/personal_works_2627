# React Server Components는 정말 성능을 개선할까?

> 원문: [React Server Components Performance](https://www.developerway.com/posts/react-server-components-performance)  
> 번역 및 정리: handhand.tistory.com

## 📋 목차

1. [들어가며](#들어가며)
2. [렌더링 방식 이해하기](#렌더링-방식-이해하기)
3. [실제 성능 비교](#실제-성능-비교)
4. [구현 예제](#구현-예제)
5. [마이그레이션 시 주의사항](#마이그레이션-시-주의사항)
6. [결론 및 권장사항](#결론-및-권장사항)

---

## 들어가며

안녕하세요! 여러분이 React Server Components(RSC)에 대해 들어보셨을 거라고 생각합니다. 지난 몇 년간 React 커뮤니티에서 가장 화제가 된 개념 중 하나죠. 하지만 솔직히 말하면, 이것은 가장 오해받는 개념 중 하나이기도 합니다.

저도 한동안 이 개념을 제대로 이해하지 못했습니다. "서버에서 데이터를 가져오는 건 Next.js나 `getServerSideProps`로도 할 수 있었는데, 뭐가 다른 거지?"라는 생각이 들었거든요.

이 문서에서는 **실제 데이터 기반으로** CSR, SSR, RSC를 비교하고, 각 방식이 성능에 미치는 영향을 구체적인 예제와 함께 설명하겠습니다.

### 이 문서를 읽기 전에

다음 개념들에 대한 기본적인 이해가 있다고 가정합니다:
- Initial Load Performance
- CSR (Client-Side Rendering)
- SSR (Server-Side Rendering)
- Chrome DevTools Performance 탭 사용법

만약 복습이 필요하다면, 다음 순서로 읽어보시길 권장합니다:
1. [Initial load performance for React developers](https://www.developerway.com/posts/initial-load-performance)
2. [Client-Side Rendering in Flame Graphs](https://www.developerway.com/posts/client-side-rendering-flame-graph)
3. [SSR Deep Dive for React Developers](https://www.developerway.com/posts/ssr-deep-dive-for-react-developers)

---

## 렌더링 방식 이해하기

### 1. CSR (Client-Side Rendering)

**CSR은 브라우저에서 모든 것을 처리합니다.**

#### 동작 방식
1. 브라우저가 빈 HTML을 받습니다
2. JavaScript 번들을 다운로드합니다
3. JavaScript가 실행되면서 React 앱을 렌더링합니다
4. 컴포넌트가 마운트된 후 API를 호출합니다
5. 데이터를 받아와서 화면을 업데이트합니다

#### 예제 코드

```jsx
// app/page.js (CSR 방식)
'use client'; // Client Component로 명시

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [sidebar, setSidebar] = useState(null);
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 컴포넌트가 마운트된 후 데이터 패칭
    Promise.all([
      fetch('/api/sidebar').then(res => res.json()),
      fetch('/api/messages').then(res => res.json())
    ]).then(([sidebarData, messagesData]) => {
      setSidebar(sidebarData);
      setMessages(messagesData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Sidebar items={sidebar} />
      <MessageList messages={messages} />
    </div>
  );
}
```

#### 성능 특성
- ✅ 초기 HTML은 작음 (빈 HTML)
- ❌ JavaScript 번들을 모두 다운로드해야 함
- ❌ JavaScript 실행 후에야 데이터 패칭 시작
- ❌ 사용자는 JavaScript 실행이 끝날 때까지 아무것도 볼 수 없음

---

### 2. SSR (Server-Side Rendering)

**SSR은 서버에서 HTML을 생성해서 보냅니다.**

#### 동작 방식
1. 서버에서 데이터를 패칭합니다
2. 서버에서 React 컴포넌트를 렌더링합니다
3. 완성된 HTML을 브라우저에 전송합니다
4. 브라우저가 HTML을 즉시 표시합니다
5. JavaScript 번들을 다운로드하고 하이드레이션합니다

#### 예제 코드 (Pages Router 방식)

```jsx
// pages/index.js (SSR 방식)
import { useState } from 'react';

export default function HomePage({ sidebar, messages }) {
  return (
    <div>
      <Sidebar items={sidebar} />
      <MessageList messages={messages} />
    </div>
  );
}

// 서버에서 데이터를 패칭
export async function getServerSideProps() {
  // 서버에서 실행됨
  const [sidebarRes, messagesRes] = await Promise.all([
    fetch('http://localhost:3000/api/sidebar'),
    fetch('http://localhost:3000/api/messages')
  ]);

  const sidebar = await sidebarRes.json();
  const messages = await messagesRes.json();

  return {
    props: {
      sidebar,
      messages
    }
  };
}
```

#### 예제 코드 (App Router 방식)

```jsx
// app/page.js (App Router SSR)
// Server Component가 기본이므로 'use client' 없음

async function getSidebar() {
  const res = await fetch('http://localhost:3000/api/sidebar', {
    cache: 'no-store' // SSR을 위해 캐시 비활성화
  });
  return res.json();
}

async function getMessages() {
  const res = await fetch('http://localhost:3000/api/messages', {
    cache: 'no-store'
  });
  return res.json();
}

export default async function HomePage() {
  // 서버 컴포넌트에서 직접 데이터 패칭
  const [sidebar, messages] = await Promise.all([
    getSidebar(),
    getMessages()
  ]);

  return (
    <div>
      <Sidebar items={sidebar} />
      <MessageList messages={messages} />
    </div>
  );
}
```

#### 성능 특성
- ✅ 초기에 완성된 HTML을 받음 (즉시 콘텐츠 표시)
- ✅ SEO에 유리함
- ❌ 서버에서 데이터 패칭이 끝날 때까지 기다려야 함
- ❌ 느린 API가 있으면 전체 페이지 로딩이 지연됨
- ⚠️ "상호작용 불가능" 간극: HTML은 보이지만 JavaScript 하이드레이션이 끝날 때까지 클릭 등이 안 됨

---

### 🔍 SSR vs RSC 핵심 차이점 이해하기

여기서 많은 분들이 헷갈려하시는 부분이 있습니다. "SSR도 서버에서 렌더링하는데, RSC와 뭐가 다른가요?"

**핵심 차이는 바로 "블로킹" vs "스트리밍"입니다.**

#### 차이점 1: 데이터 패칭 방식

**SSR (블로킹 방식):**
```jsx
// app/page.js (SSR - 모든 데이터를 기다림)
export default async function HomePage() {
  // ⚠️ 문제: 모든 데이터가 준비될 때까지 기다림
  // sidebar (100ms)와 messages (1000ms)를 모두 기다려야 함
  const [sidebar, messages] = await Promise.all([
    getSidebar(),    // 100ms 소요
    getMessages()   // 1000ms 소요
  ]);
  
  // ⚠️ 결과: 1000ms 후에야 HTML 생성 시작
  // 사용자는 1000ms 동안 아무것도 볼 수 없음
  return (
    <div>
      <Sidebar items={sidebar} />
      <MessageList messages={messages} />
    </div>
  );
}
```

**RSC + Streaming (비블로킹 방식):**
```jsx
// app/page.js (RSC - 각 영역을 독립적으로 처리)
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <div>
      {/* ✅ Suspense로 감싸면 독립적으로 처리됨 */}
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarData /> {/* 100ms 후 즉시 스트림 전송 */}
      </Suspense>
      
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesData /> {/* 1000ms 후 스트림 전송 */}
      </Suspense>
    </div>
  );
}

// 각각 독립적인 async 컴포넌트
async function SidebarData() {
  const data = await getSidebar(); // 100ms
  return <Sidebar items={data} />;
}

async function MessagesData() {
  const data = await getMessages(); // 1000ms
  return <MessageList messages={data} />;
}
```

#### 차이점 2: HTML 전송 방식

**SSR의 HTML 전송:**
```
시간: 0ms ──────────────────────────────────> 1100ms
      │                                        │
      │ 서버에서 데이터 패칭 시작              │
      │ sidebar (100ms) 완료                   │
      │ messages (1000ms) 완료                 │
      │                                        │
      │ ⚠️ 여기서야 HTML 생성 시작!            │
      │                                        │
      └────────────────────────────────────────┘
      브라우저는 1100ms 동안 아무것도 받지 못함
```

**RSC + Streaming의 HTML 전송:**
```
시간: 0ms ──────────────────────────────────> 1100ms
      │                                        │
      │ 서버에서 데이터 패칭 시작 (병렬)       │
      │                                        │
      │ sidebar (100ms) 완료                   │
      │ ✅ 즉시 HTML 스트림 전송 시작!         │
      │    브라우저가 사이드바 렌더링 시작     │
      │                                        │
      │ messages (1000ms) 완료                 │
      │ ✅ HTML 스트림 전송                    │
      │    브라우저가 메시지 렌더링            │
      └────────────────────────────────────────┘
      브라우저는 100ms 후부터 콘텐츠를 받기 시작!
```

#### 차이점 3: 코드 구조 비교

같은 기능을 SSR 방식과 RSC 방식으로 구현했을 때:

**SSR 방식 (App Router):**
```jsx
// app/page.js
async function getSidebar() {
  const res = await fetch('/api/sidebar', { cache: 'no-store' });
  return res.json();
}

async function getMessages() {
  const res = await fetch('/api/messages', { cache: 'no-store' });
  return res.json();
}

export default async function HomePage() {
  // ⚠️ 핵심: 모든 데이터를 한 번에 기다림
  const [sidebar, messages] = await Promise.all([
    getSidebar(),
    getMessages()
  ]);

  // ⚠️ 모든 데이터가 준비된 후에야 JSX 반환
  return (
    <div>
      <Sidebar items={sidebar} />
      <MessageList messages={messages} />
    </div>
  );
}
```

**RSC + Streaming 방식:**
```jsx
// app/page.js
import { Suspense } from 'react';

// ✅ 각 데이터를 독립적인 async 컴포넌트로 분리
async function SidebarData() {
  const res = await fetch('/api/sidebar', { cache: 'no-store' });
  const data = await res.json();
  return <Sidebar items={data} />; // 데이터 준비되면 즉시 반환
}

async function MessagesData() {
  const res = await fetch('/api/messages', { cache: 'no-store' });
  const data = await res.json();
  return <MessageList messages={data} />; // 데이터 준비되면 즉시 반환
}

export default function HomePage() {
  // ✅ Suspense로 감싸면 각각 독립적으로 스트리밍됨
  return (
    <div>
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarData /> {/* 100ms 후 즉시 스트림 */}
      </Suspense>
      
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesData /> {/* 1000ms 후 스트림 */}
      </Suspense>
    </div>
  );
}
```

#### 핵심 차이 요약표

| 구분 | SSR (App Router) | RSC + Streaming |
|------|------------------|-----------------|
| **데이터 패칭** | 모든 데이터를 `await Promise.all()`로 한 번에 기다림 | 각 데이터를 독립적인 async 컴포넌트로 분리 |
| **HTML 생성 시점** | 모든 데이터 준비 후 한 번에 생성 | 각 데이터 준비되는 대로 점진적으로 생성 |
| **HTML 전송** | 완성된 HTML을 한 번에 전송 | HTML을 스트림으로 점진적 전송 |
| **사용자 경험** | 느린 API가 있으면 전체가 지연 | 빠른 데이터는 즉시 표시, 느린 데이터는 나중에 |
| **코드 구조** | 페이지 컴포넌트에서 모든 데이터 패칭 | 각 영역을 Suspense로 감싼 독립 컴포넌트 |

#### 실전 예제: 같은 페이지를 두 방식으로 구현

**시나리오:** 
- Sidebar API: 100ms 소요
- Messages API: 1000ms 소요

**SSR 방식의 문제점:**
```jsx
export default async function HomePage() {
  // ⚠️ 문제: messages가 1000ms 걸리면
  // sidebar는 100ms에 끝났지만 기다려야 함
  const [sidebar, messages] = await Promise.all([
    getSidebar(),    // 100ms에 완료
    getMessages()   // 1000ms에 완료
  ]);
  
  // 결과: 1000ms 후에야 HTML 생성
  // 사용자는 1000ms 동안 빈 화면을 봄
  return (
    <div>
      <Sidebar items={sidebar} />
      <MessageList messages={messages} />
    </div>
  );
}
```

**RSC + Streaming 방식의 해결책:**
```jsx
export default function HomePage() {
  return (
    <div>
      {/* ✅ sidebar는 100ms 후 즉시 표시됨 */}
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarData /> {/* 100ms 후 스트림 */}
      </Suspense>
      
      {/* ✅ messages는 1000ms 후 표시되지만
          sidebar는 이미 보이고 있음! */}
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesData /> {/* 1000ms 후 스트림 */}
      </Suspense>
    </div>
  );
}

// 각각 독립적으로 실행됨
async function SidebarData() {
  const data = await getSidebar(); // 100ms
  return <Sidebar items={data} />; // 즉시 반환
}

async function MessagesData() {
  const data = await getMessages(); // 1000ms
  return <MessageList messages={data} />; // 나중에 반환
}
```

**결과 비교:**
- **SSR**: 사용자는 1000ms 동안 빈 화면 → 그 후 모든 콘텐츠가 한 번에 나타남
- **RSC**: 사용자는 100ms 후 사이드바를 보고, 1000ms 후 메시지를 봄

---

### 3. RSC (React Server Components) + Streaming

> 💡 **중요**: 위의 [SSR vs RSC 핵심 차이점](#-ssr-vs-rsc-핵심-차이점-이해하기) 섹션을 먼저 읽으시면 이 부분을 더 쉽게 이해하실 수 있습니다.

**RSC는 서버 컴포넌트와 스트리밍을 결합합니다.**

#### 핵심 개념

1. **Server Components**: 서버에서만 실행되는 컴포넌트
   - JavaScript 번들에 포함되지 않음
   - 서버에서 직접 데이터베이스나 API 접근 가능
   - 브라우저로 전송되지 않아 번들 크기 감소

2. **Streaming**: HTML을 점진적으로 전송
   - 빠른 데이터는 먼저 보내고
   - 느린 데이터는 준비되는 대로 보냄

3. **Suspense**: 로딩 상태를 선언적으로 처리
   - 각 데이터 영역별로 독립적인 로딩 상태
   - **핵심**: Suspense로 감싸야 스트리밍이 작동함!

#### 동작 방식
1. 서버에서 각 데이터를 독립적으로 패칭 시작
2. 빠른 데이터(sidebar)가 준비되면 즉시 HTML 스트림 전송
3. 느린 데이터(messages)는 Suspense 경계로 감싸서 나중에 전송
4. 브라우저는 받는 대로 점진적으로 렌더링
5. 각 영역이 독립적으로 하이드레이션됨

#### 예제 코드 (SSR과 비교하며 보기)

**⚠️ SSR 방식과의 차이를 명확히 보여주기 위해 주석을 자세히 달았습니다.**

```jsx
// app/page.js (RSC + Streaming)
import { Suspense } from 'react';

// ✅ 차이점 1: 각 데이터를 독립적인 async 컴포넌트로 분리
// SSR에서는 페이지 컴포넌트에서 Promise.all로 한 번에 기다렸지만,
// RSC에서는 각각 독립적인 컴포넌트로 만들어 Suspense로 감쌉니다.

// Sidebar 데이터 패칭 (빠른 API - 100ms)
async function SidebarData() {
  // 이 함수는 서버에서만 실행됨 (Server Component)
  const res = await fetch('http://localhost:3000/api/sidebar', {
    cache: 'no-store'
  });
  const data = await res.json();
  
  // ✅ 차이점 2: 데이터가 준비되면 즉시 JSX 반환
  // SSR에서는 모든 데이터를 기다렸지만, 여기서는 즉시 반환
  // Suspense가 이 컴포넌트를 감싸고 있으므로, 
  // 데이터가 준비되는 대로 HTML 스트림으로 전송됨
  return <Sidebar items={data} />;
}

// Messages 데이터 패칭 (느린 API - 1s)
async function MessagesData() {
  // 이 함수도 서버에서만 실행됨
  const res = await fetch('http://localhost:3000/api/messages', {
    cache: 'no-store'
  });
  const data = await res.json();
  
  // ✅ 차이점 3: SidebarData와 독립적으로 실행됨
  // SidebarData가 100ms에 끝나도 이 함수는 1000ms까지 기다림
  // 하지만 SidebarData는 이미 스트림으로 전송되어 사용자가 볼 수 있음!
  return <MessageList messages={data} />;
}

// 로딩 UI 컴포넌트 (Skeleton UI)
// ✅ 차이점 4: SSR에는 이런 로딩 UI가 없었음
// SSR은 모든 데이터를 기다렸기 때문에, 사용자는 빈 화면을 봤음
// RSC + Streaming은 각 영역별로 로딩 UI를 보여줄 수 있음
function SidebarSkeleton() {
  return (
    <aside className="sidebar-skeleton">
      <div className="skeleton-item" />
      <div className="skeleton-item" />
      <div className="skeleton-item" />
    </aside>
  );
}

function MessagesSkeleton() {
  return (
    <div className="messages-skeleton">
      <div className="skeleton-message" />
      <div className="skeleton-message" />
      <div className="skeleton-message" />
    </div>
  );
}

export default function HomePage() {
  // ✅ 차이점 5: 페이지 컴포넌트는 async가 아님!
  // SSR에서는 async function이었지만, RSC에서는 그냥 function
  // 왜냐하면 데이터 패칭은 각 하위 컴포넌트에서 하기 때문
  
  return (
    <div className="page-container">
      {/* ✅ 차이점 6: Suspense로 각 영역을 감싸야 스트리밍이 작동함
          Suspense가 없으면 SSR처럼 모든 데이터를 기다림 */}
      
      {/* SidebarData가 데이터를 기다리는 동안 SidebarSkeleton을 보여줌
          데이터가 준비되면(100ms 후) 즉시 SidebarData로 교체됨 */}
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarData />
      </Suspense>

      {/* MessagesData가 데이터를 기다리는 동안 MessagesSkeleton을 보여줌
          데이터가 준비되면(1000ms 후) MessagesData로 교체됨
          하지만 이때 Sidebar는 이미 보이고 있음! */}
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesData />
      </Suspense>
    </div>
  );
}
```

#### 더 나은 구조: 각 영역을 독립 컴포넌트로

```jsx
// app/components/sidebar-wrapper.js
import { Suspense } from 'react';

async function SidebarContent() {
  const res = await fetch('http://localhost:3000/api/sidebar', {
    cache: 'no-store'
  });
  const data = await res.json();
  return <Sidebar items={data} />;
}

export function SidebarWrapper() {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarContent />
    </Suspense>
  );
}

// app/components/messages-wrapper.js
import { Suspense } from 'react';

async function MessagesContent() {
  const res = await fetch('http://localhost:3000/api/messages', {
    cache: 'no-store'
  });
  const data = await res.json();
  return <MessageList messages={data} />;
}

export function MessagesWrapper() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesContent />
    </Suspense>
  );
}

// app/page.js
import { SidebarWrapper } from './components/sidebar-wrapper';
import { MessagesWrapper } from './components/messages-wrapper';

export default function HomePage() {
  return (
    <div className="page-container">
      <SidebarWrapper />
      <MessagesWrapper />
    </div>
  );
}
```

#### 성능 특성
- ✅ 빠른 데이터는 즉시 표시 (LCP 개선)
- ✅ 느린 데이터는 독립적으로 로딩 (블로킹 없음)
- ✅ JavaScript 번들 크기 감소 (Server Components는 번들에 포함 안 됨)
- ✅ 점진적 하이드레이션 (각 영역이 독립적으로 인터랙티브해짐)
- ⚠️ 구현이 복잡함 (Suspense 경계를 올바르게 설정해야 함)

---

## 실제 성능 비교

### 테스트 환경

실제 프로젝트에서 측정한 결과를 바탕으로 설명합니다.

**테스트 조건:**
- CPU: 6배 느리게 시뮬레이션
- Network: Slow 4G 환경
- 측정 도구: Chrome DevTools Performance 탭

**테스트 페이지 구조:**
- Sidebar: `/api/sidebar` (응답 시간: ~100ms)
- Messages: `/api/messages` (응답 시간: ~1s)

### 측정 지표

1. **LCP (Largest Contentful Paint)**: 사용자가 주요 콘텐츠를 보는 시간
2. **사이드바 표시 시간**: 사이드바 항목이 렌더링되는 시간
3. **메시지 표시 시간**: 메시지 리스트가 렌더링되는 시간
4. **상호작용 가능 시간 (TTI)**: 페이지가 완전히 인터랙티브해지는 시간

### 성능 비교 결과

#### 1. CSR (Client-Side Rendering)

```
타임라인:
0ms    ──────────────────────────────────────────────> 2000ms
│      │                                              │
│      HTML 다운로드 (빠름)                            │
│      JavaScript 번들 다운로드 시작                  │
│      JavaScript 번들 다운로드 완료                  │
│      React 앱 초기화                                │
│      API 호출 시작 (/api/sidebar, /api/messages)  │
│      사이드바 데이터 수신 (100ms 후)                │
│      메시지 데이터 수신 (1000ms 후)                 │
│      렌더링 완료                                    │
│                                                      │
LCP: ~2000ms (모든 데이터가 준비된 후)
사이드바 표시: ~2000ms
메시지 표시: ~2000ms
TTI: ~2200ms
```

**특징:**
- 사용자는 JavaScript 실행이 끝날 때까지 아무것도 볼 수 없음
- 모든 데이터가 준비된 후에야 화면이 나타남
- 초기 로딩이 가장 느림

---

#### 2. SSR (Server-Side Rendering)

```
타임라인:
0ms    ──────────────────────────────────────────────> 1200ms
│      │                                              │
│      서버에서 데이터 패칭 시작                      │
│      사이드바 데이터 수신 (100ms 후)                │
│      메시지 데이터 수신 (1000ms 후)                 │
│      서버에서 HTML 생성                             │
│      HTML 전송 시작                                 │
│      HTML 전송 완료                                 │
│      브라우저가 HTML 렌더링 (즉시 표시)             │
│      JavaScript 번들 다운로드 시작                  │
│      JavaScript 번들 다운로드 완료                  │
│      하이드레이션 시작                              │
│      하이드레이션 완료 (인터랙티브 가능)            │
│                                                      │
LCP: ~1100ms (HTML 수신 후)
사이드바 표시: ~1100ms
메시지 표시: ~1100ms
TTI: ~1500ms (하이드레이션 후)
```

**특징:**
- HTML은 빠르게 표시됨 (LCP 개선)
- 하지만 느린 API가 있으면 전체 페이지 로딩이 지연됨
- "상호작용 불가능" 간극 존재 (HTML은 보이지만 클릭 불가)

---

#### 3. RSC + Streaming (React Server Components)

```
타임라인:
0ms    ──────────────────────────────────────────────> 1200ms
│      │                                              │
│      서버에서 데이터 패칭 시작 (병렬)               │
│      사이드바 데이터 수신 (100ms 후)                │
│      사이드바 HTML 스트림 전송 시작                 │
│      브라우저가 사이드바 렌더링 (즉시 표시)        │
│      메시지 데이터 수신 (1000ms 후)                 │
│      메시지 HTML 스트림 전송 시작                   │
│      브라우저가 메시지 렌더링                       │
│      JavaScript 번들 다운로드 (병렬로 진행)         │
│      각 영역별 하이드레이션 (점진적)                │
│                                                      │
LCP: ~200ms (사이드바 표시 후)
사이드바 표시: ~200ms
메시지 표시: ~1100ms
TTI: ~1300ms (하이드레이션 후)
```

**특징:**
- 빠른 데이터는 즉시 표시 (LCP 대폭 개선)
- 느린 데이터는 독립적으로 로딩 (블로킹 없음)
- 사용자 경험이 가장 좋음

---

### 성능 비교 요약표

| 지표 | CSR | SSR | RSC + Streaming |
|------|-----|-----|-----------------|
| **LCP** | ~2000ms | ~1100ms | **~200ms** ✅ |
| **사이드바 표시** | ~2000ms | ~1100ms | **~200ms** ✅ |
| **메시지 표시** | ~2000ms | ~1100ms | ~1100ms |
| **TTI** | ~2200ms | ~1500ms | ~1300ms ✅ |
| **JavaScript 번들 크기** | 큼 | 큼 | **작음** ✅ |
| **초기 HTML 크기** | 작음 | 큼 | 중간 |
| **상호작용 불가능 간극** | 없음 | 있음 | 있음 (더 짧음) |

---

## 구현 예제

### 완전한 예제: 멀티 페이지 앱

실제 프로젝트에서 사용할 수 있는 완전한 예제를 제공합니다.

#### 프로젝트 구조

```
app/
├── layout.js              # 루트 레이아웃
├── page.js                # 홈 페이지
├── components/
│   ├── sidebar/
│   │   ├── sidebar.js     # Sidebar 컴포넌트
│   │   └── sidebar-wrapper.js  # Suspense 래퍼
│   └── messages/
│       ├── message-list.js     # MessageList 컴포넌트
│       └── messages-wrapper.js # Suspense 래퍼
└── api/
    ├── sidebar/
    │   └── route.js       # Sidebar API
    └── messages/
        └── route.js       # Messages API
```

#### 1. API 라우트 설정

```jsx
// app/api/sidebar/route.js
export async function GET() {
  // 실제로는 데이터베이스에서 가져옴
  // 여기서는 시뮬레이션을 위해 지연 추가
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return Response.json({
    items: [
      { id: 1, title: '홈', href: '/' },
      { id: 2, title: '프로필', href: '/profile' },
      { id: 3, title: '설정', href: '/settings' },
    ]
  });
}

// app/api/messages/route.js
export async function GET() {
  // 느린 API 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return Response.json({
    messages: [
      { id: 1, text: '안녕하세요!', author: 'Alice' },
      { id: 2, text: '반갑습니다!', author: 'Bob' },
      { id: 3, text: '좋은 하루 되세요!', author: 'Charlie' },
    ]
  });
}
```

#### 2. 컴포넌트 구현

```jsx
// app/components/sidebar/sidebar.js
export function Sidebar({ items }) {
  return (
    <aside className="sidebar">
      <nav>
        <ul>
          {items.map(item => (
            <li key={item.id}>
              <a href={item.href}>{item.title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

// app/components/sidebar/sidebar-wrapper.js
import { Suspense } from 'react';
import { Sidebar } from './sidebar';

async function SidebarContent() {
  const res = await fetch('http://localhost:3000/api/sidebar', {
    cache: 'no-store' // SSR을 위해 캐시 비활성화
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch sidebar');
  }
  
  const data = await res.json();
  return <Sidebar items={data.items} />;
}

function SidebarSkeleton() {
  return (
    <aside className="sidebar skeleton">
      <nav>
        <ul>
          <li><div className="skeleton-item" /></li>
          <li><div className="skeleton-item" /></li>
          <li><div className="skeleton-item" /></li>
        </ul>
      </nav>
    </aside>
  );
}

export function SidebarWrapper() {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarContent />
    </Suspense>
  );
}
```

```jsx
// app/components/messages/message-list.js
export function MessageList({ messages }) {
  return (
    <div className="messages">
      <h2>메시지</h2>
      <ul>
        {messages.map(message => (
          <li key={message.id}>
            <strong>{message.author}:</strong> {message.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

// app/components/messages/messages-wrapper.js
import { Suspense } from 'react';
import { MessageList } from './message-list';

async function MessagesContent() {
  const res = await fetch('http://localhost:3000/api/messages', {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch messages');
  }
  
  const data = await res.json();
  return <MessageList messages={data.messages} />;
}

function MessagesSkeleton() {
  return (
    <div className="messages skeleton">
      <h2>메시지</h2>
      <ul>
        <li><div className="skeleton-message" /></li>
        <li><div className="skeleton-message" /></li>
        <li><div className="skeleton-message" /></li>
      </ul>
    </div>
  );
}

export function MessagesWrapper() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesContent />
    </Suspense>
  );
}
```

#### 3. 페이지 구현

```jsx
// app/page.js
import { SidebarWrapper } from './components/sidebar/sidebar-wrapper';
import { MessagesWrapper } from './components/messages/messages-wrapper';

export default function HomePage() {
  return (
    <div className="page-container">
      <header>
        <h1>홈 페이지</h1>
      </header>
      
      <div className="content">
        <SidebarWrapper />
        <main>
          <MessagesWrapper />
        </main>
      </div>
    </div>
  );
}
```

#### 4. 스타일링 (선택사항)

```css
/* app/globals.css */
.skeleton {
  opacity: 0.7;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-item,
.skeleton-message {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  height: 20px;
  border-radius: 4px;
  margin: 8px 0;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px;
  padding: 20px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
}

.messages {
  flex: 1;
  padding: 20px;
}
```

---

## 마이그레이션 시 주의사항

### Pages Router → App Router 마이그레이션

#### ❌ 잘못된 마이그레이션

```jsx
// pages/index.js (Pages Router)
export async function getServerSideProps() {
  const [sidebar, messages] = await Promise.all([
    fetch('/api/sidebar'),
    fetch('/api/messages')
  ]);
  
  return {
    props: {
      sidebar: await sidebar.json(),
      messages: await messages.json()
    }
  };
}

// ❌ 잘못된 App Router 마이그레이션
// app/page.js
export default async function HomePage() {
  // 문제: 모든 데이터를 기다림 (블로킹)
  const [sidebarRes, messagesRes] = await Promise.all([
    fetch('/api/sidebar'),
    fetch('/api/messages')
  ]);
  
  const sidebar = await sidebarRes.json();
  const messages = await messagesRes.json();
  
  return (
    <div>
      <Sidebar items={sidebar} />
      <MessageList messages={messages} />
    </div>
  );
}
```

**문제점:**
- 느린 API가 있으면 전체 페이지가 블로킹됨
- RSC의 장점을 전혀 활용하지 못함
- 성능이 오히려 악화될 수 있음

#### ✅ 올바른 마이그레이션

```jsx
// app/page.js
import { Suspense } from 'react';
import { SidebarWrapper } from './components/sidebar/sidebar-wrapper';
import { MessagesWrapper } from './components/messages/messages-wrapper';

export default function HomePage() {
  // 각 영역을 독립적으로 Suspense로 감싸기
  return (
    <div>
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarWrapper />
      </Suspense>
      
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesWrapper />
      </Suspense>
    </div>
  );
}
```

**개선점:**
- 각 데이터 영역이 독립적으로 로딩됨
- 빠른 데이터는 즉시 표시
- 느린 데이터는 스트리밍으로 처리

---

### Client Component와 Server Component 혼합

#### 주의사항

Server Component와 Client Component를 혼합할 때는 다음 규칙을 지켜야 합니다:

1. **Server Component는 Client Component를 import할 수 있음**
2. **Client Component는 Server Component를 직접 import할 수 없음**
3. **Client Component의 children으로 Server Component를 전달할 수 있음**

#### 올바른 패턴

```jsx
// ✅ 올바른 패턴
// app/components/client-button.js
'use client';

export function ClientButton({ children, onClick }) {
  return (
    <button onClick={onClick}>
      {children} {/* Server Component를 children으로 받을 수 있음 */}
    </button>
  );
}

// app/page.js (Server Component)
import { ClientButton } from './components/client-button';
import { ServerContent } from './components/server-content';

export default function HomePage() {
  return (
    <ClientButton onClick={() => alert('클릭!')}>
      <ServerContent /> {/* Server Component를 children으로 전달 */}
    </ClientButton>
  );
}
```

#### 잘못된 패턴

```jsx
// ❌ 잘못된 패턴
// app/components/client-wrapper.js
'use client';

import { ServerComponent } from './server-component'; // ❌ 에러!

export function ClientWrapper() {
  return <ServerComponent />;
}
```

---

### 데이터 패칭 최적화

#### 1. 병렬 패칭 활용

```jsx
// ✅ 좋은 예: 병렬 패칭
async function HomePage() {
  // Promise.all로 병렬 실행
  const [sidebar, messages] = await Promise.all([
    getSidebar(),
    getMessages()
  ]);
  
  return (
    <div>
      <Sidebar items={sidebar} />
      <MessageList messages={messages} />
    </div>
  );
}

// ❌ 나쁜 예: 순차 패칭
async function HomePage() {
  const sidebar = await getSidebar(); // 먼저 기다림
  const messages = await getMessages(); // 그 다음 기다림
  
  return (
    <div>
      <Sidebar items={sidebar} />
      <MessageList messages={messages} />
    </div>
  );
}
```

#### 2. Suspense 경계 최적화

```jsx
// ✅ 좋은 예: 세밀한 Suspense 경계
export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarWrapper />
      </Suspense>
      
      <Suspense fallback={<MessagesSkeleton />}>
        <MessagesWrapper />
      </Suspense>
    </div>
  );
}

// ❌ 나쁜 예: 하나의 큰 Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <SidebarWrapper />
        <MessagesWrapper />
      </div>
    </Suspense>
  );
}
```

#### 3. 캐싱 전략

```jsx
// 정적 데이터는 캐싱
async function getStaticData() {
  const res = await fetch('https://api.example.com/static-data', {
    next: { revalidate: 3600 } // 1시간마다 재검증
  });
  return res.json();
}

// 동적 데이터는 캐싱 비활성화
async function getDynamicData() {
  const res = await fetch('https://api.example.com/dynamic-data', {
    cache: 'no-store' // 항상 최신 데이터
  });
  return res.json();
}
```

---

## 결론 및 권장사항

### 핵심 요약

1. **CSR → SSR 마이그레이션**
   - 초기 로드 성능이 크게 개선됨
   - 하지만 "상호작용 불가능" 간극이 생김
   - 느린 API가 있으면 전체 페이지가 블로킹됨

2. **SSR → RSC + Streaming 마이그레이션**
   - 올바르게 구현하면 성능이 더 개선됨
   - 하지만 주의하지 않으면 성능이 악화될 수 있음
   - 데이터 패칭 로직을 서버 중심으로 재작성해야 함
   - Suspense 경계를 올바르게 설정해야 함

3. **RSC의 진짜 가치**
   - Server Component 자체만으로는 큰 성능 개선이 없을 수 있음
   - **스트리밍과 Suspense가 핵심**
   - 데이터 패칭을 서버 컴포넌트 우선 방식으로 완전히 재작성해야 함

### 실무 권장사항

#### 1. 프로젝트 시작 시

- **새 프로젝트**: App Router + RSC로 시작하는 것을 권장
- **기존 프로젝트**: 점진적으로 마이그레이션

#### 2. 마이그레이션 전략

1. **단계적 마이그레이션**
   - 한 페이지씩 마이그레이션
   - 각 페이지에서 성능 측정
   - 문제가 있으면 롤백

2. **성능 측정 필수**
   - Chrome DevTools Performance 탭 사용
   - LCP, TTI 등 핵심 지표 측정
   - 실제 사용자 환경에서 테스트

3. **Suspense 경계 설계**
   - 각 데이터 영역별로 독립적인 Suspense
   - 의미 있는 로딩 UI 제공
   - 에러 바운더리도 함께 고려

#### 3. 주의해야 할 함정

1. **과도한 Server Component 사용**
   - 인터랙티브한 부분은 Client Component로
   - Server Component는 데이터 패칭과 정적 렌더링에 집중

2. **잘못된 Suspense 경계**
   - 너무 큰 경계: 스트리밍 효과 없음
   - 너무 작은 경계: 오버헤드 증가

3. **캐싱 전략 미고려**
   - 모든 데이터를 `cache: 'no-store'`로 설정하면 성능 저하
   - 정적 데이터는 적절히 캐싱

### 최종 체크리스트

마이그레이션 전에 확인할 사항:

- [ ] 각 데이터 영역이 독립적인 Suspense로 감싸져 있는가?
- [ ] 의미 있는 로딩 UI(skeleton)가 제공되는가?
- [ ] 병렬 데이터 패칭을 활용하고 있는가?
- [ ] 캐싱 전략이 적절한가?
- [ ] 성능 측정을 했는가?
- [ ] 실제 사용자 환경에서 테스트했는가?

---

## 참고 자료

- [React Server Components 공식 문서](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [Streaming SSR in Next.js](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Original Article: React Server Components Performance](https://www.developerway.com/posts/react-server-components-performance)

---

**작성일**: 2025년  
**작성자**: 20년차 프론트엔드 개발자  
**대상 독자**: 3-5년차 프론트엔드 개발자

