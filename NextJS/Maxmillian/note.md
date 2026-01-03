
## Q. 'use client'

Next.js App Router에서 컴포넌트를 **클라이언트 컴포넌트**로 만드는 지시어입니다.

**특징:**
- 파일 최상단에 `'use client'` 선언 필요
- 브라우저에서 실행되는 JavaScript 코드 포함 가능
- React Hooks (`useState`, `useEffect` 등) 사용 가능
- 이벤트 핸들러 (`onClick`, `onChange` 등) 사용 가능
- 브라우저 API 접근 가능

**언제 사용하나?**
- 인터랙티브 기능이 필요할 때 (버튼 클릭, 폼 입력 등)
- 상태 관리가 필요할 때 (`useState`, `useReducer`)
- 생명주기 훅이 필요할 때 (`useEffect`, `useLayoutEffect`)
- 브라우저 전용 API 사용 시 (localStorage, window 등)

------------------------------------------------------------

## Q. NextJS Reserved Name (app안에 있을 경우)

| 파일명                | 역할      | 설명                        |
| ------------------ | ------- | ------------------------- |
| **`page.js`**      | 페이지     | URL에 매핑되는 실제 페이지 생성       |
| **`layout.js`**    | 레이아웃    | 여러 페이지를 감싸는 공통 UI         |
| **`not-found.js`** | 404 처리  | 해당 라우트에서 페이지를 찾지 못했을 때 표시 |
| **`error.js`**     | 에러 처리   | 렌더링/데이터 오류 발생 시 표시        |
| **`loading.js`**   | 로딩 UI   | 데이터 로딩 중 보여줄 화면           |
| **`route.js`**     | API 라우트 | JSX 없이 JSON 등 데이터 응답      |



------------------------------------------------------------

## Q. Suspense 와 RTK isLoading 사용

### 1. 역할 구분

- **isLoading (RTK Query)**
  - API **최초 요청 상태**
  - 데이터가 없을 때 UI를 어떻게 보여줄지 **명시적으로 제어**
  - 페이지가 성립 가능한지 판단하는 기준

- **Suspense**
  - 로딩 상태를 보는 것이 아님
  - **렌더링 중 throw 된 promise**를 감지해 fallback UI 렌더
  - 컴포넌트 단위 **부분 로딩**에 적합

### 2. 기본 패턴

```tsx
// 페이지 진입 (필수 데이터)
if (isLoading && !data) return <FullPageLoading />

// 이후 (부분 로딩)
return (
  <Suspense fallback={<SectionSkeleton />}>
    <HeavyChart chartData={data} />
  </Suspense>
)
```
### 3. suspense 사용 이유

- Suspense는 “promise를 return”하는 게 아니라
“렌더링 중 promise를 throw”할 때만 발동된다.

사용 이유:
1. React.lazy(() => import(...)) (초기 JS 번들에서 무거운 코드 분리)
2. suspense 옵션이 켜진 데이터 패칭
3. 렌더 중 비동기 리소스 로딩



------------------------------------------------------------
