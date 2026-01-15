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

**역할**: 애플리케이션의 초기화, 전역 설정, 프로바이더 설정 (앱의 “뼈대”)

**포함 내용**:
- `providers/`: React Context, 상태관리 Provider, 테마 Provider 등
- `styles/`: 전역 스타일
- `assets/`: 전역 이미지, 폰트 등
- `config/`: 환경 변수, 설정 파일
- `lib/`: 전역 유틸리티 (라우터 helpers 등)

**예시 디렉토리 구조 & 코드 흐름**:
```
src/
  app/                      # FSD app 레이어
    providers/
      theme-provider.tsx
      store-provider.tsx
    styles/
      globals.css
    config/
      env.ts
    lib/
      router.ts

app/                        # Next.js App Router
  layout.tsx
  page.tsx
```

`app/layout.tsx` (Next.js 라우트 루트)에서 FSD `app` 레이어의 provider 들을 감싸서 사용합니다:

```tsx
// app/layout.tsx (Next.js)
import { ThemeProvider } from '@/app/providers/theme-provider';
import { StoreProvider } from '@/app/providers/store-provider';
import '@/app/styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
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

여기서:
- `ThemeProvider`, `StoreProvider`, `globals.css` → **app 레이어**
- `RootLayout` 자체 → Next.js 라우팅용이지만, 내부에서 **다른 레이어(entities, features …)** 를 직접 사용하지 않고, **전역 설정만 담당**합니다.

**규칙**:
- 다른 레이어에 의존하지 않음
- 전역 설정, Provider, 글로벌 스타일만 포함
- 비즈니스 도메인 로직 포함 금지

---

### 2.2 processes/ (프로세스 레이어) - 선택적

**역할**: 여러 페이지/위젯/기능을 엮어서 “끝까지 이어지는” 복잡한 비즈니스 프로세스를 구성하는 레이어  
예: 온보딩, 주문/결제 플로우, 대출 신청 플로우 등

**포함 내용**:
- 여러 레이어(entities, features, widgets)를 조합한 복합 워크플로우
- 프로세스 전용 상태, 유효성 검사, 단계 전환 로직 등

**예시 디렉토리 구조 & 코드 흐름**:
```
src/
  processes/
    checkout/
      ui/
        checkout-flow.tsx
      model/
        checkout-store.ts

  features/
    add-to-cart/
      ui/
        add-to-cart-button.tsx
      model/
        add-to-cart-store.ts

  entities/
    order/
      ui/
        order-summary.tsx
      model/
        order-types.ts
```

`checkout-flow.tsx` 에서는 **features, entities, widgets** 를 조합해 “결제 플로우”를 완성합니다:

```tsx
// src/processes/checkout/ui/checkout-flow.tsx
'use client';

import { AddToCartButton } from '@/features/add-to-cart/ui/add-to-cart-button';
import { OrderSummary } from '@/entities/order/ui/order-summary';
import { useCheckoutStore } from '../model/checkout-store';

export function CheckoutFlow() {
  const { step, goNext, goPrev } = useCheckoutStore();

  if (step === 'cart') {
    return (
      <>
        <OrderSummary />
        <AddToCartButton />
        <button onClick={goNext}>결제하기</button>
      </>
    );
  }

  if (step === 'payment') {
    return (
      <>
        {/* 결제 정보 입력 폼 (feature) */}
        <button onClick={goPrev}>장바구니로 돌아가기</button>
      </>
    );
  }

  return <div>주문이 완료되었습니다.</div>;
}
```

여기서:
- `CheckoutFlow` → **processes 레이어 (복합 워크플로우)**
- 내부에서 사용하는 `OrderSummary` → **entities 레이어**
- `AddToCartButton` → **features 레이어**

**규칙**:
- `pages`, `widgets`, `features`, `entities`, `shared`에 의존 가능
- 다른 프로세스에 의존하지 않음

---

### 2.3 pages/ (페이지 레이어)

**역할**: 라우트별 “페이지 컴포넌트”를 정의하는 레이어로,  
**widgets / features / entities** 를 조합해서 실제 페이지 UI를 완성합니다.

**포함 내용**:
- Next.js `app/` 디렉토리에서 사용할 “페이지 UI” 컴포넌트
- 페이지별 레이아웃 조합 (헤더, 사이드바 등)
- 비즈니스 로직 최소화, 조합 역할에 집중

**예시 디렉토리 구조 & 코드 흐름**:
```
src/
  pages/
    home/
      ui/
        home-page.tsx
    products/
      ui/
        products-page.tsx
      [id]/
        ui/
          product-detail-page.tsx

src/
  widgets/
    header/
      ui/
        header.tsx

src/
  entities/
    product/
      ui/
        product-card.tsx

src/
  features/
    add-to-cart/
      ui/
        add-to-cart-button.tsx
```

`src/pages/products/ui/products-page.tsx` 에서 위젯/엔티티/기능을 조합합니다:

```tsx
// src/pages/products/ui/products-page.tsx
'use client';

import { Header } from '@/widgets/header/ui/header';
import { ProductCard } from '@/entities/product/ui/product-card';
import { AddToCartButton } from '@/features/add-to-cart/ui/add-to-cart-button';

const MOCK_PRODUCTS = [
  { id: 'p1', name: '맛있는 버거', price: 12000 },
  { id: 'p2', name: '고소한 파스타', price: 14000 },
];

export function ProductsPage() {
  return (
    <>
      <Header />
      <main>
        <h1>상품 목록</h1>
        <ul>
          {MOCK_PRODUCTS.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                actions={<AddToCartButton productId={product.id} />}
              />
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
```

그리고 Next.js 라우트 `app/(routes)/products/page.tsx` 에서는 단순히 이 페이지를 렌더링합니다:

```tsx
// app/(routes)/products/page.tsx
import { ProductsPage } from '@/pages/products/ui/products-page';

export default function Page() {
  return <ProductsPage />;
}
```

여기서:
- `ProductsPage` → **pages 레이어**
- `Header` → **widgets 레이어**
- `ProductCard` → **entities 레이어**
- `AddToCartButton` → **features 레이어**

**규칙**:
- `widgets`, `features`, `entities`, `shared`에 의존 가능
- 다른 페이지에 의존하지 않음
- 비즈니스 로직은 최대한 배제하고, **조합/배치 역할**에 집중

---

### 2.4 widgets/ (위젯 레이어)

**역할**: 독립적인 UI 블록을 정의하는 레이어로,  
**여러 features / entities 를 묶어 재사용 가능한 UI 덩어리**를 만듭니다. (예: 헤더, 사이드바, 대시보드 카드 섹션 등)

**포함 내용**:
- 페이지 여러 곳에서 재사용되는 복합 UI
- UI와 약간의 상태(토글, 열림/닫힘 등) 정도의 로직

**예시 디렉토리 구조 & 코드 흐름**:
```
src/
  widgets/
    header/
      ui/
        header.tsx
      model/
        header-store.ts
    product-section/
      ui/
        product-section.tsx

  features/
    user-auth/
      ui/
        user-menu.tsx

  entities/
    product/
      ui/
        product-card.tsx
```

`src/widgets/header/ui/header.tsx` 에서는 인증 관련 feature와 메뉴 등을 조합합니다:

```tsx
// src/widgets/header/ui/header.tsx
'use client';

import Link from 'next/link';
import { UserMenu } from '@/features/user-auth/ui/user-menu';

export function Header() {
  return (
    <header className="header">
      <Link href="/">Foodies</Link>
      <nav>
        <Link href="/meals">Meals</Link>
        <Link href="/community">Community</Link>
      </nav>
      <UserMenu />
    </header>
  );
}
```

`src/widgets/product-section/ui/product-section.tsx` 에서는 엔티티 UI를 묶어 섹션을 구성합니다:

```tsx
// src/widgets/product-section/ui/product-section.tsx
import { ProductCard } from '@/entities/product/ui/product-card';
import { AddToCartButton } from '@/features/add-to-cart/ui/add-to-cart-button';

export function ProductSection({ products }) {
  return (
    <section>
      <h2>인기 메뉴</h2>
      <div className="grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            actions={<AddToCartButton productId={product.id} />}
          />
        ))}
      </div>
    </section>
  );
}
```

여기서:
- `Header`, `ProductSection` → **widgets 레이어**
- `UserMenu` → **features 레이어**
- `ProductCard` → **entities 레이어**

**규칙**:
- `features`, `entities`, `shared`에 의존 가능
- 다른 위젯에 의존하지 않음
- 페이지와 독립적으로 재사용 가능한 UI 블록이어야 함

---

### 2.5 features/ (기능 레이어)

**역할**: “사용자 액션”과 직접적으로 연결된 기능(인터랙션)을 담당하는 레이어  
예: 장바구니 담기, 좋아요, 댓글 작성, 검색, 로그인 등

**포함 내용**:
- 특정 액션을 처리하는 UI + 상태 + API 호출
- 해당 액션을 위한 hooks, stores, validation 등

**예시 디렉토리 구조 & 코드 흐름**:
```
src/
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

  entities/
    product/
      model/
        product-types.ts

  shared/
    ui/
      button/
        button.tsx
```

`add-to-cart` 기능은 다음처럼 구성됩니다:

```tsx
// src/features/add-to-cart/api/add-to-cart-api.ts
export async function addToCartRequest(productId: string) {
  const res = await fetch('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('장바구니 추가 실패');
  return res.json();
}
```

```tsx
// src/features/add-to-cart/model/add-to-cart-store.ts
'use client';

import { useState } from 'react';
import { addToCartRequest } from '../api/add-to-cart-api';

export function useAddToCart() {
  const [isLoading, setIsLoading] = useState(false);

  async function addToCart(productId: string) {
    setIsLoading(true);
    try {
      await addToCartRequest(productId);
      // TODO: 장바구니 상태 업데이트 (entities/cart 등)
    } finally {
      setIsLoading(false);
    }
  }

  return { addToCart, isLoading };
}
```

```tsx
// src/features/add-to-cart/ui/add-to-cart-button.tsx
'use client';

import { useAddToCart } from '../model/use-add-to-cart';
import { Button } from '@/shared/ui/button/button';

export function AddToCartButton({ productId }: { productId: string }) {
  const { addToCart, isLoading } = useAddToCart();

  return (
    <Button onClick={() => addToCart(productId)} disabled={isLoading}>
      {isLoading ? '담는 중...' : '장바구니 담기'}
    </Button>
  );
}
```

여기서:
- API 호출(`addToCartRequest`) → **features/api 세그먼트**
- 훅/상태(`useAddToCart`) → **features/model 세그먼트**
- UI(`AddToCartButton`) → **features/ui 세그먼트**

**규칙**:
- `entities`, `shared`에 의존 가능
- 다른 feature 에 직접 의존하지 않음
- 하나의 **명확한 사용자 액션**을 담당해야 함

---

### 2.6 entities/ (엔티티 레이어)

**역할**: 비즈니스 도메인의 “명사형” 개념들을 표현하는 레이어  
예: User, Product, Order, Meal 등

**포함 내용**:
- 특정 엔티티에 대한 타입, 스토어, API, UI 조각
- 도메인 규칙, 도메인 중심 상태

**예시 디렉토리 구조 & 코드 흐름**:
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

    user/
      ui/
        user-avatar.tsx
      model/
        user-types.ts

  shared/
    ui/
      button/
        button.tsx
```

Foodies 예시 기준으로 `Meal` 엔티티를 구성해보면:

```tsx
// src/entities/meal/model/meal-types.ts
export type Meal = {
  id: string;
  title: string;
  image: string;
  summary: string;
};
```

```tsx
// src/entities/meal/ui/meal-item.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { Meal } from '../model/meal-types';

export function MealItem({ meal }: { meal: Meal }) {
  return (
    <article>
      <Link href={`/meals/${meal.id}`}>
        <Image src={meal.image} alt={meal.title} width={300} height={200} />
        <h3>{meal.title}</h3>
        <p>{meal.summary}</p>
      </Link>
    </article>
  );
}
```

```tsx
// src/entities/meal/api/meal-api.ts
export async function getMeals() {
  const res = await fetch('/api/meals');
  return res.json();
}
```

이 엔티티는 widgets/pages/features 에서 재사용됩니다. 예를 들어:

```tsx
// src/widgets/meals-grid/ui/meals-grid.tsx
import { MealItem } from '@/entities/meal/ui/meal-item';
import type { Meal } from '@/entities/meal/model/meal-types';

export function MealsGrid({ meals }: { meals: Meal[] }) {
  return (
    <ul className="meals-grid">
      {meals.map((meal) => (
        <li key={meal.id}>
          <MealItem meal={meal} />
        </li>
      ))}
    </ul>
  );
}
```

**규칙**:
- `shared`에만 의존 가능
- 다른 엔티티에 의존하지 않음
- **비즈니스 도메인 모델**과 그 표현을 책임짐

---

### 2.7 shared/ (공유 레이어)

**역할**: 어떤 비즈니스 도메인에도 속하지 않는 **완전히 범용적인 재사용 코드**를 모아두는 레이어  
예: Button, Input, Modal, 공통 훅, 유틸 함수 등

**포함 내용**:
- 공통 UI 컴포넌트 (Button, Input, Modal 등)
- 유틸리티 함수, 공통 훅
- 공통 타입, 상수, API 클라이언트

**예시 디렉토리 구조 & 코드 흐름**:
```
src/
  shared/
    ui/
      button/
        button.tsx
        button.module.css
      input/
        input.tsx
        input.module.css
    lib/
      utils/
        format-date.ts
        format-price.ts
      hooks/
        use-debounce.ts
        use-local-storage.ts
    api/
      api-client.ts
    config/
      constants.ts
    types/
      common-types.ts
```

예를 들어 `Button` 컴포넌트는 어떤 레이어에서도 사용할 수 있습니다:

```tsx
// src/shared/ui/button/button.tsx
import styles from './button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const classNames = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return <button className={classNames} {...props} />;
}
```

이 `Button` 은 다음과 같이 여러 레이어에서 재사용됩니다:

```tsx
// src/features/add-to-cart/ui/add-to-cart-button.tsx  (features 레이어)
import { Button } from '@/shared/ui/button/button';
```

```tsx
// src/pages/home/ui/home-page.tsx  (pages 레이어)
import { Button } from '@/shared/ui/button/button';
```

**규칙**:
- 다른 어떤 레이어에도 의존하지 않음
- 완전히 독립적이고 재사용 가능해야 함
- 비즈니스 도메인에 대한 지식(로직) 포함 금지

---

## 3. 세그먼트 (Segments)

레이어는 “수직적인 구조(어떤 역할을 맡는지)”를 정의한다면,  
**세그먼트는 “수평적인 구조(한 슬라이스 안에서 코드가 어떻게 나뉘는지)”** 를 정의합니다.

하나의 슬라이스(예: `features/add-to-cart`, `entities/meal`) 안에는 보통 다음과 같은 세그먼트가 함께 존재합니다:

- `ui/`: 화면에 보이는 부분 (컴포넌트)
- `model/`: 상태, 비즈니스 로직, 타입
- `api/`: 서버와 통신하는 함수
- `lib/`: 순수 유틸리티/헬퍼

즉, **“어떤 코드가 어느 레이어에 들어가는지”는 레이어가 결정하고,  
“그 레이어 내부에서 코드가 어떻게 나뉘는지”는 세그먼트가 결정**한다고 볼 수 있습니다.

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


## 7. 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
- [FSD GitHub](https://github.com/feature-sliced/documentation)
- [FSD Examples](https://github.com/feature-sliced/examples)

---

## 8. 요약

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
