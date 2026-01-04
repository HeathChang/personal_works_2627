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

- Suspense는 "promise를 return"하는 게 아니라
"렌더링 중 promise를 throw"할 때만 발동된다.

사용 이유:
1. React.lazy(() => import(...)) (초기 JS 번들에서 무거운 코드 분리)
2. suspense 옵션이 켜진 데이터 패칭
3. 렌더 중 비동기 리소스 로딩

