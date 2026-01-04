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

