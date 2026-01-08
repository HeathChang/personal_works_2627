# Feature-Sliced Design (FSD)

참고 URL: https://feature-sliced.design/docs/branding

## 1. 개요

### Feature-Sliced Design이란?

Feature-Sliced Design(FSD)은 프론트엔드 애플리케이션을 위한 모듈형 아키텍처 방법론입니다. 비즈니스 로직과 사용자 기능을 중심으로 코드를 구조화하여 확장 가능하고 유지보수하기 쉬운 애플리케이션을 만드는 것을 목표로 합니다.

### 핵심 개념

1. **레이어 (Layers)**: 수직적 계층 구조
   - 각 레이어는 특정 수준의 추상화를 담당
   - 하위 레이어는 상위 레이어에 의존할 수 없음 (단방향 의존성)

2. **슬라이스 (Slices)**: 비즈니스 로직 단위
   - 독립적인 기능 영역
   - 예: `user-profile`, `product-card`, `auth-form`

3. **세그먼트 (Segments)**: 슬라이스 내부 구조
   - `ui`: UI 컴포넌트
   - `model`: 비즈니스 로직, 상태 관리
   - `api`: API 호출
   - `lib`: 유틸리티 함수

### FSD의 장점

- **확장성**: 새로운 기능 추가가 용이
- **유지보수성**: 명확한 구조로 코드 찾기 쉬움
- **재사용성**: 공통 컴포넌트와 로직 재사용
- **테스트 용이성**: 독립적인 슬라이스 단위 테스트
- **팀 협업**: 명확한 구조로 병렬 개발 가능

---

## 2. 레이어 구조 (Layers)

FSD는 7개의 레이어로 구성됩니다 (위에서 아래로):

```
app/          # 애플리케이션 초기화 및 설정
processes/    # 복잡한 비즈니스 프로세스 (선택적)
pages/        # 라우트별 페이지 컴포넌트
widgets/      # 독립적인 UI 블록
features/     # 사용자 기능
entities/     # 비즈니스 엔티티
shared/       # 공통 재사용 코드
```

### 2.1 app/ (애플리케이션 레이어)

**역할**: 애플리케이션의 초기화, 전역 설정, 프로바이더 설정

**포함 내용**:
- `providers/`: React Context, Redux Provider 등
- `styles/`: 전역 스타일
- `assets/`: 전역 이미지, 폰트 등
- `config/`: 환경 변수, 설정 파일
- `lib/`: 전역 유틸리티

**예시 구조**:
```
app/
  providers/
    theme-provider.tsx
    store-provider.tsx
  styles/
    globals.css
  assets/
    fonts/
    images/
  config/
    env.ts
  lib/
    router.ts
```

**규칙**:
- 다른 레이어에 의존하지 않음
- 전역 설정만 포함
- 비즈니스 로직 포함 금지

---

### 2.2 processes/ (프로세스 레이어) - 선택적

**역할**: 여러 페이지/위젯에 걸친 복잡한 비즈니스 프로세스

**포함 내용**:
- 여러 기능을 조합한 복잡한 워크플로우
- 예: 온보딩 프로세스, 체크아웃 프로세스

**예시 구조**:
```
processes/
  onboarding/
    ui/
      onboarding-flow.tsx
    model/
      onboarding-store.ts
  checkout/
    ui/
      checkout-process.tsx
    model/
      checkout-store.ts
```

**규칙**:
- `pages`, `widgets`, `features`, `entities`, `shared`에 의존 가능
- 다른 프로세스에 의존하지 않음

---

### 2.3 pages/ (페이지 레이어)

**역할**: 라우트별 페이지 컴포넌트, 라우팅 구성

**포함 내용**:
- Next.js의 `page.tsx` 파일들
- 페이지별 레이아웃
- 라우트 구성

**예시 구조**:
```
pages/
  home/
    ui/
      home-page.tsx
  products/
    ui/
      products-page.tsx
  products/
    [id]/
      ui/
        product-detail-page.tsx
```

**규칙**:
- `widgets`, `features`, `entities`, `shared`에 의존 가능
- 다른 페이지에 의존하지 않음
- 비즈니스 로직은 포함하지 않고 위젯/기능을 조합만 함

---

### 2.4 widgets/ (위젯 레이어)

**역할**: 독립적인 UI 블록, 여러 기능을 조합한 복합 컴포넌트

**포함 내용**:
- 헤더, 사이드바, 카드 등 독립적인 UI 블록
- 여러 기능을 조합한 복합 컴포넌트

**예시 구조**:
```
widgets/
  header/
    ui/
      header.tsx
    model/
      header-store.ts
  product-card/
    ui/
      product-card.tsx
  sidebar/
    ui/
      sidebar.tsx
```

**규칙**:
- `features`, `entities`, `shared`에 의존 가능
- 다른 위젯에 의존하지 않음
- 독립적으로 동작 가능해야 함

---

### 2.5 features/ (기능 레이어)

**역할**: 사용자 기능, 인터랙션

**포함 내용**:
- 사용자가 수행하는 특정 액션
- 예: 좋아요, 댓글 작성, 검색 등

**예시 구조**:
```
features/
  add-to-cart/
    ui/
      add-to-cart-button.tsx
    model/
      add-to-cart-store.ts
    api/
      add-to-cart-api.ts
  product-search/
    ui/
      search-input.tsx
    model/
      search-store.ts
    api/
      search-api.ts
  user-auth/
    ui/
      login-form.tsx
      signup-form.tsx
    model/
      auth-store.ts
    api/
      auth-api.ts
```

**규칙**:
- `entities`, `shared`에 의존 가능
- 다른 기능에 의존하지 않음
- 하나의 명확한 사용자 액션을 담당

---

### 2.6 entities/ (엔티티 레이어)

**역할**: 비즈니스 엔티티, 도메인 모델

**포함 내용**:
- 비즈니스 도메인의 핵심 개념
- 예: User, Product, Order 등

**예시 구조**:
```
entities/
  user/
    ui/
      user-avatar.tsx
      user-card.tsx
    model/
      user-store.ts
      user-types.ts
    api/
      user-api.ts
  product/
    ui/
      product-image.tsx
      product-title.tsx
    model/
      product-store.ts
      product-types.ts
    api/
      product-api.ts
  cart/
    ui/
      cart-item.tsx
    model/
      cart-store.ts
      cart-types.ts
```

**규칙**:
- `shared`에만 의존 가능
- 다른 엔티티에 의존하지 않음
- 비즈니스 도메인 모델 정의

---

### 2.7 shared/ (공유 레이어)

**역할**: 공통 재사용 코드, 유틸리티

**포함 내용**:
- UI 컴포넌트 (Button, Input 등)
- 유틸리티 함수
- 타입 정의
- 상수

**예시 구조**:
```
shared/
  ui/
    button/
      button.tsx
      button.module.css
    input/
      input.tsx
      input.module.css
    modal/
      modal.tsx
  lib/
    utils/
      format-date.ts
      format-price.ts
    hooks/
      use-debounce.ts
      use-local-storage.ts
  api/
    api-client.ts
    api-types.ts
  config/
    constants.ts
  types/
    common-types.ts
```

**규칙**:
- 다른 레이어에 의존하지 않음
- 완전히 독립적이고 재사용 가능
- 비즈니스 로직 포함 금지

---

## 3. 세그먼트 (Segments)

각 슬라이스는 내부적으로 세그먼트로 구성됩니다:

### 3.1 ui/ (UI 세그먼트)

**역할**: UI 컴포넌트

**포함 내용**:
- React 컴포넌트
- 스타일 파일
- 컴포넌트 관련 타입

**예시**:
```
features/
  add-to-cart/
    ui/
      add-to-cart-button.tsx
      add-to-cart-button.module.css
```

---

### 3.2 model/ (모델 세그먼트)

**역할**: 비즈니스 로직, 상태 관리

**포함 내용**:
- 상태 관리 (Zustand, Redux 등)
- 비즈니스 로직
- 타입 정의
- 스토어

**예시**:
```
features/
  add-to-cart/
    model/
      add-to-cart-store.ts
      add-to-cart-types.ts
```

---

### 3.3 api/ (API 세그먼트)

**역할**: API 호출

**포함 내용**:
- API 함수
- API 타입
- API 훅

**예시**:
```
entities/
  product/
    api/
      product-api.ts
      product-api-types.ts
```

---

### 3.4 lib/ (라이브러리 세그먼트)

**역할**: 유틸리티 함수

**포함 내용**:
- 헬퍼 함수
- 유틸리티 함수

**예시**:
```
features/
  product-search/
    lib/
      search-utils.ts
```

---

## 4. 전체 디렉토리 구조 예시

```
src/
├── app/                    # 애플리케이션 초기화
│   ├── providers/
│   │   ├── theme-provider.tsx
│   │   └── store-provider.tsx
│   ├── styles/
│   │   └── globals.css
│   └── config/
│       └── env.ts
│
├── pages/                  # 페이지 레이어
│   ├── home/
│   │   └── ui/
│   │       └── home-page.tsx
│   └── products/
│       ├── ui/
│       │   └── products-page.tsx
│       └── [id]/
│           └── ui/
│               └── product-detail-page.tsx
│
├── widgets/                # 위젯 레이어
│   ├── header/
│   │   ├── ui/
│   │   │   └── header.tsx
│   │   └── model/
│   │       └── header-store.ts
│   └── product-card/
│       └── ui/
│           └── product-card.tsx
│
├── features/               # 기능 레이어
│   ├── add-to-cart/
│   │   ├── ui/
│   │   │   └── add-to-cart-button.tsx
│   │   ├── model/
│   │   │   └── add-to-cart-store.ts
│   │   └── api/
│   │       └── add-to-cart-api.ts
│   ├── product-search/
│   │   ├── ui/
│   │   │   └── search-input.tsx
│   │   └── model/
│   │       └── search-store.ts
│   └── user-auth/
│       ├── ui/
│       │   ├── login-form.tsx
│       │   └── signup-form.tsx
│       ├── model/
│       │   └── auth-store.ts
│       └── api/
│           └── auth-api.ts
│
├── entities/               # 엔티티 레이어
│   ├── user/
│   │   ├── ui/
│   │   │   ├── user-avatar.tsx
│   │   │   └── user-card.tsx
│   │   ├── model/
│   │   │   ├── user-store.ts
│   │   │   └── user-types.ts
│   │   └── api/
│   │       └── user-api.ts
│   ├── product/
│   │   ├── ui/
│   │   │   ├── product-image.tsx
│   │   │   └── product-title.tsx
│   │   ├── model/
│   │   │   ├── product-store.ts
│   │   │   └── product-types.ts
│   │   └── api/
│   │       └── product-api.ts
│   └── cart/
│       ├── ui/
│       │   └── cart-item.tsx
│       ├── model/
│       │   ├── cart-store.ts
│       │   └── cart-types.ts
│       └── api/
│           └── cart-api.ts
│
└── shared/                 # 공유 레이어
    ├── ui/
    │   ├── button/
    │   │   ├── button.tsx
    │   │   └── button.module.css
    │   ├── input/
    │   │   ├── input.tsx
    │   │   └── input.module.css
    │   └── modal/
    │       ├── modal.tsx
    │       └── modal.module.css
    ├── lib/
    │   ├── utils/
    │   │   ├── format-date.ts
    │   │   └── format-price.ts
    │   └── hooks/
    │       ├── use-debounce.ts
    │       └── use-local-storage.ts
    ├── api/
    │   ├── api-client.ts
    │   └── api-types.ts
    └── config/
        └── constants.ts
```

---

## 5. Atomic Design과의 차이점

### 5.1 Atomic Design 개요

Atomic Design은 UI 컴포넌트를 크기와 복잡도에 따라 분류합니다:

- **Atoms**: 가장 작은 단위 (Button, Input)
- **Molecules**: Atoms 조합 (SearchForm, ProductCard)
- **Organisms**: Molecules 조합 (Header, Footer)
- **Templates**: 페이지 레이아웃
- **Pages**: 실제 콘텐츠가 들어간 페이지

### 5.2 주요 차이점

| 구분 | Atomic Design | Feature-Sliced Design |
|------|--------------|----------------------|
| **분류 기준** | 컴포넌트 크기/복잡도 | 비즈니스 로직과 사용자 기능 |
| **구조** | Atoms → Molecules → Organisms | Layers (app → shared) |
| **의존성** | 크기 기반 계층 | 비즈니스 도메인 기반 계층 |
| **재사용성** | UI 컴포넌트 중심 | 기능 단위 중심 |
| **확장성** | 컴포넌트 추가 시 위치 결정 어려움 | 명확한 레이어 규칙 |
| **비즈니스 로직** | UI 중심, 로직 분리 어려움 | 기능별로 로직 포함 |

### 5.3 구체적 비교

#### Atomic Design 구조
```
components/
  atoms/
    button.tsx
    input.tsx
  molecules/
    search-form.tsx
    product-card.tsx
  organisms/
    header.tsx
    product-list.tsx
  templates/
    product-page-template.tsx
  pages/
    product-page.tsx
```

**문제점**:
- 비즈니스 로직 위치가 불명확
- 관련 코드가 분산됨 (UI, 로직, API가 분리)
- 기능 추가 시 여러 폴더에 파일 생성 필요

#### Feature-Sliced Design 구조
```
features/
  product-search/
    ui/
      search-input.tsx
    model/
      search-store.ts
    api/
      search-api.ts
```

**장점**:
- 관련 코드가 한 곳에 모임
- 기능 단위로 독립적 관리
- 비즈니스 로직이 명확히 위치

### 5.4 언제 사용할까?

**Atomic Design이 적합한 경우**:
- 디자인 시스템 구축
- UI 컴포넌트 라이브러리 개발
- 작은 규모의 프로젝트

**FSD가 적합한 경우**:
- 대규모 애플리케이션
- 복잡한 비즈니스 로직
- 팀 협업이 중요한 프로젝트
- 장기 유지보수 필요

---

## 6. Next.js에서 FSD 구조화

### 6.1 Next.js App Router와 FSD 통합

Next.js App Router의 `app/` 디렉토리와 FSD의 레이어를 조합합니다.

#### 권장 구조

```
project-root/
├── app/                          # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (routes)/
│   │   ├── products/
│   │   │   ├── page.tsx          # pages/products/ui/products-page.tsx 연결
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── cart/
│   │       └── page.tsx
│   └── api/
│       └── routes/
│
├── src/                          # FSD 레이어
│   ├── app/                      # FSD app 레이어
│   │   ├── providers/
│   │   │   ├── theme-provider.tsx
│   │   │   └── store-provider.tsx
│   │   └── styles/
│   │       └── globals.css
│   │
│   ├── pages/                    # FSD pages 레이어
│   │   ├── home/
│   │   │   └── ui/
│   │   │       └── home-page.tsx
│   │   └── products/
│   │       ├── ui/
│   │       │   └── products-page.tsx
│   │       └── [id]/
│   │           └── ui/
│   │               └── product-detail-page.tsx
│   │
│   ├── widgets/
│   │   ├── header/
│   │   │   └── ui/
│   │   │       └── header.tsx
│   │   └── sidebar/
│   │       └── ui/
│   │           └── sidebar.tsx
│   │
│   ├── features/
│   │   ├── add-to-cart/
│   │   │   ├── ui/
│   │   │   │   └── add-to-cart-button.tsx
│   │   │   ├── model/
│   │   │   │   └── add-to-cart-store.ts
│   │   │   └── api/
│   │   │       └── add-to-cart-api.ts
│   │   └── product-search/
│   │       ├── ui/
│   │       │   └── search-input.tsx
│   │       └── model/
│   │           └── search-store.ts
│   │
│   ├── entities/
│   │   ├── user/
│   │   │   ├── ui/
│   │   │   │   └── user-avatar.tsx
│   │   │   ├── model/
│   │   │   │   └── user-store.ts
│   │   │   └── api/
│   │   │       └── user-api.ts
│   │   └── product/
│   │       ├── ui/
│   │       │   └── product-card.tsx
│   │       ├── model/
│   │       │   └── product-store.ts
│   │       └── api/
│   │           └── product-api.ts
│   │
│   └── shared/
│       ├── ui/
│       │   ├── button/
│       │   │   └── button.tsx
│       │   └── input/
│       │       └── input.tsx
│       ├── lib/
│       │   └── utils/
│       │       └── format-price.ts
│       └── api/
│           └── api-client.ts
│
└── public/
```

### 6.2 Next.js App Router와 FSD 매핑

#### app/layout.tsx
```tsx
// app/layout.tsx
import { ThemeProvider } from '@/app/providers/theme-provider';
import { StoreProvider } from '@/app/providers/store-provider';
import '@/app/styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### app/page.tsx
```tsx
// app/page.tsx
import { HomePage } from '@/pages/home/ui/home-page';

export default function Page() {
  return <HomePage />;
}
```

#### app/products/page.tsx
```tsx
// app/products/page.tsx
import { ProductsPage } from '@/pages/products/ui/products-page';

export default function Page() {
  return <ProductsPage />;
}
```

#### pages/products/ui/products-page.tsx
```tsx
// pages/products/ui/products-page.tsx
'use client';

import { Header } from '@/widgets/header/ui/header';
import { ProductCard } from '@/entities/product/ui/product-card';
import { AddToCartButton } from '@/features/add-to-cart/ui/add-to-cart-button';
import { ProductSearch } from '@/features/product-search/ui/search-input';

export function ProductsPage() {
  return (
    <>
      <Header />
      <main>
        <ProductSearch />
        <div className="products-grid">
          {/* products.map */}
          <ProductCard 
            product={product}
            actions={<AddToCartButton productId={product.id} />}
          />
        </div>
      </main>
    </>
  );
}
```

### 6.3 Server Components와 Client Components

#### Server Component (기본)
```tsx
// pages/products/ui/products-page.tsx (Server Component)
import { getProducts } from '@/entities/product/api/product-api';
import { ProductsList } from './products-list';

export async function ProductsPage() {
  const products = await getProducts();
  
  return <ProductsList products={products} />;
}
```

#### Client Component
```tsx
// features/add-to-cart/ui/add-to-cart-button.tsx
'use client';

import { useAddToCart } from '../model/use-add-to-cart';

export function AddToCartButton({ productId }) {
  const { addToCart, isLoading } = useAddToCart();
  
  return (
    <button onClick={() => addToCart(productId)} disabled={isLoading}>
      Add to Cart
    </button>
  );
}
```

### 6.4 API Routes 구조

```
app/
  api/
    products/
      route.ts                    # GET /api/products
    products/
      [id]/
        route.ts                  # GET /api/products/:id
    cart/
      route.ts                    # POST /api/cart
```

FSD의 `api/` 세그먼트와 Next.js API Routes를 분리:

- **FSD `api/`**: 클라이언트에서 사용하는 API 호출 함수
- **Next.js `app/api/`**: 서버 API 엔드포인트

```tsx
// entities/product/api/product-api.ts
export async function getProducts() {
  const res = await fetch('/api/products');
  return res.json();
}

// app/api/products/route.ts
export async function GET() {
  // 서버 로직
  return Response.json(products);
}
```

### 6.5 실제 예시: Foodies 프로젝트 구조화

기존 구조를 FSD로 리팩토링:

#### Before (현재 구조)
```
components/
  meals/
    meal-item.js
    meals-grid.js
    image-picker.js
lib/
  meals.js
  actions.js
```

#### After (FSD 구조)
```
src/
  entities/
    meal/
      ui/
        meal-item.tsx
        meal-image.tsx
      model/
        meal-types.ts
        meal-store.ts
      api/
        meal-api.ts
  features/
    share-meal/
      ui/
        meal-form.tsx
        image-picker.tsx
      model/
        share-meal-store.ts
      api/
        share-meal-api.ts
  widgets/
    meals-grid/
      ui/
        meals-grid.tsx
  shared/
    ui/
      button/
        button.tsx
      form/
        form-input.tsx
    lib/
      utils/
        format-date.ts
```

### 6.6 Best Practices

1. **레이어 규칙 준수**
   - 하위 레이어는 상위 레이어에 의존하지 않음
   - 같은 레이어 내에서는 의존하지 않음

2. **Public API 패턴**
   ```tsx
   // features/add-to-cart/index.ts
   export { AddToCartButton } from './ui/add-to-cart-button';
   export { useAddToCart } from './model/use-add-to-cart';
   export type { AddToCartProps } from './model/add-to-cart-types';
   ```

3. **절대 경로 사용**
   ```tsx
   // tsconfig.json 또는 jsconfig.json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

4. **세그먼트 선택적 사용**
   - 작은 기능은 `ui/`만 사용 가능
   - 복잡한 기능은 `ui/`, `model/`, `api/` 모두 사용

5. **Server/Client Components 분리**
   - Server Component는 기본
   - 인터랙티브 기능만 Client Component

---

## 7. 마이그레이션 가이드

### 7.1 단계별 마이그레이션

1. **shared 레이어 구축**
   - 공통 UI 컴포넌트 이동
   - 유틸리티 함수 이동

2. **entities 레이어 구축**
   - 도메인 모델 식별
   - 관련 컴포넌트와 로직 그룹화

3. **features 레이어 구축**
   - 사용자 기능 식별
   - 기능별로 코드 그룹화

4. **widgets 레이어 구축**
   - 복합 UI 블록 식별
   - 위젯으로 추출

5. **pages 레이어 구축**
   - 페이지 컴포넌트 정리
   - 위젯과 기능 조합

### 7.2 점진적 적용

전체를 한 번에 리팩토링하지 말고, 새로운 기능부터 FSD 구조로 개발:

```
기존 코드 (유지)
  ↓
새로운 기능은 FSD 구조로 개발
  ↓
기존 코드를 점진적으로 마이그레이션
```

---

## 8. 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD GitHub](https://github.com/feature-sliced/documentation)
- [FSD Examples](https://github.com/feature-sliced/examples)

---

## 9. 요약

### FSD의 핵심 원칙

1. **레이어 기반 구조**: 명확한 계층 구조
2. **슬라이스 단위**: 독립적인 기능 영역
3. **세그먼트 분리**: UI, Model, API 분리
4. **단방향 의존성**: 하위 레이어는 상위 레이어에 의존 불가

### Next.js 적용 시 주의사항

1. **App Router와 FSD 레이어 분리**
   - `app/`: Next.js 라우팅
   - `src/`: FSD 레이어

2. **Server/Client Components 구분**
   - Server Component 기본
   - 인터랙티브 기능만 Client Component

3. **점진적 마이그레이션**
   - 새로운 기능부터 적용
   - 기존 코드는 점진적으로 리팩토링
