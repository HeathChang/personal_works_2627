# TypeScript 실무 필수 타입 (Essential Types)

실무에서 가장 자주 사용되는 TypeScript 유틸리티 타입과 헬퍼 타입만 정리한 문서입니다.

---

## 📌 내장 유틸리티 타입 (Built-in Utility Types)

### 1. Partial\<T\> ⭐⭐⭐

**모든 프로퍼티를 선택적으로 만듦**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// 업데이트 함수에서 자주 사용
function updateUser(id: string, updates: Partial<User>) {
  // 일부 필드만 수정 가능
}

updateUser("123", { name: "John" }); // ✅
```

**언제 사용?**
- 업데이트/PATCH API
- 부분 업데이트 함수
- 옵션 객체

---

### 2. Pick\<T, K\> ⭐⭐⭐

**특정 프로퍼티만 선택**

```typescript
interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

// 목록 화면에서 일부만 표시
type ArticlePreview = Pick<Article, "id" | "title" | "author">;
```

**언제 사용?**
- API 응답 최적화
- 컴포넌트 Props
- 미리보기/요약

---

### 3. Omit\<T, K\> ⭐⭐⭐

**특정 프로퍼티 제외**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 회원가입 입력 (id, createdAt은 서버 생성)
type SignupInput = Omit<User, "id" | "createdAt">;

// 공개 API (password 제외)
type PublicUser = Omit<User, "password">;
```

**언제 사용?**
- 민감 정보 제거
- 자동 생성 필드 제외
- 폼 입력 타입

---

### 4. Record\<K, T\> ⭐⭐

**키-값 쌍 객체 타입 생성**

```typescript
// 상태별 설정
type Status = "pending" | "approved" | "rejected";
const statusConfig: Record<Status, { message: string; color: string }> = {
  pending: { message: "대기 중", color: "yellow" },
  approved: { message: "승인됨", color: "green" },
  rejected: { message: "거부됨", color: "red" }
};

// 에러 메시지 매핑
const errorMessages: Record<number, string> = {
  400: "잘못된 요청",
  404: "찾을 수 없음",
  500: "서버 오류"
};
```

**언제 사용?**
- 열거형 매핑
- 다국어/i18n
- 상태별 설정

---

### 5. Required\<T\> ⭐⭐

**모든 프로퍼티를 필수로**

```typescript
interface Config {
  host?: string;
  port?: number;
  timeout?: number;
}

// 초기화 시 모든 설정 필요
type RequiredConfig = Required<Config>;

function startServer(config: RequiredConfig) {
  console.log(`Starting at ${config.host}:${config.port}`);
}
```

**언제 사용?**
- 설정 검증
- 초기화 함수
- 완전한 객체 보장

---

### 6. Readonly\<T\> ⭐⭐

**모든 프로퍼티를 읽기 전용으로**

```typescript
const config: Readonly<Config> = {
  host: "localhost",
  port: 3000
};

// config.port = 8080; // ❌ 에러
```

**언제 사용?**
- 불변 데이터 (Redux state)
- 상수 객체
- React props

---

### 7. ReturnType\<T\> ⭐⭐⭐

**함수의 반환 타입 추출**

```typescript
async function fetchUser(id: string) {
  return {
    id,
    name: "John",
    email: "john@example.com"
  };
}

// 함수의 반환 타입을 재사용
type User = Awaited<ReturnType<typeof fetchUser>>;
```

**언제 사용?**
- API 함수 반환 타입
- 타입 재사용
- 복잡한 타입 추론

---

### 8. Awaited\<T\> ⭐⭐⭐

**Promise의 resolve 타입 추출**

```typescript
async function fetchData() {
  return { data: [1, 2, 3] };
}

type Data = Awaited<ReturnType<typeof fetchData>>;
// 결과: { data: number[] }
```

**언제 사용?**
- async 함수
- API 응답 처리
- Promise 체이닝

---

### 9. Parameters\<T\> ⭐⭐

**함수 매개변수를 튜플로 추출**

```typescript
function createUser(name: string, age: number, email: string) {
  return { name, age, email };
}

// 함수 래퍼
function logAndCreate(...args: Parameters<typeof createUser>) {
  console.log("Creating user:", args);
  return createUser(...args);
}
```

**언제 사용?**
- 함수 래퍼
- 고차 함수
- 타입 안전한 이벤트

---

### 10. NonNullable\<T\> ⭐⭐

**null과 undefined 제외**

```typescript
type NullableString = string | null | undefined;
type SafeString = NonNullable<NullableString>; // string

// 배열 필터링
const arr = [1, null, 2, undefined, 3];
const clean = arr.filter((x): x is NonNullable<typeof x> => x != null);
// clean: number[]
```

**언제 사용?**
- null 체크 후 타입
- 배열 필터링
- 옵셔널 체이닝 후

---

## 📌 커스텀 헬퍼 타입 (Custom Helper Types)

### 11. Nullable\<T\> ⭐⭐⭐

**null을 허용하는 타입**

```typescript
type Nullable<T> = T | null;

interface User {
  id: string;
  name: string;
  avatar: Nullable<string>; // 프로필 사진이 없을 수 있음
  lastLoginAt: Nullable<Date>;
}
```

**언제 사용?**
- 데이터베이스 null
- 초기화되지 않은 상태
- API 응답

---

### 12. Maybe\<T\> ⭐⭐

**null 또는 undefined 허용**

```typescript
type Maybe<T> = T | null | undefined;

function findUser(id: string): Maybe<User> {
  return null; // 찾지 못하면 null
}

const user = findUser("123");
const name = user?.name ?? "Unknown"; // 안전한 접근
```

**언제 사용?**
- 외부 라이브러리
- 배열 find 결과
- 옵셔널 체이닝

---

### 13. PartialBy\<T, K\> ⭐⭐⭐

**특정 필드만 선택적으로**

```typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
}

// bio만 선택적
type UserInput = PartialBy<User, "id" | "bio">;

function createUser(data: UserInput) {
  // id, bio는 없어도 됨
}
```

**언제 사용?**
- 회원가입 입력
- 단계별 폼
- 업데이트 DTO

---

### 14. RequiredBy\<T, K\> ⭐⭐

**특정 필드만 필수로**

```typescript
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

interface Config {
  host?: string;
  port?: number;
  ssl?: boolean;
}

// host는 반드시 필요
type MinimalConfig = RequiredBy<Config, "host">;
```

**언제 사용?**
- 초기화 검증
- 필수 설정 강제
- 단계별 유효성

---

### 15. DeepPartial\<T\> ⭐⭐⭐

**중첩 객체도 모두 선택적으로**

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface AppConfig {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
  database: {
    host: string;
    port: number;
  };
}

// 일부만 업데이트
const update: DeepPartial<AppConfig> = {
  server: {
    ssl: {
      enabled: true
      // cert는 선택적
    }
  }
};
```

**언제 사용?**
- 복잡한 설정 객체
- 깊은 업데이트
- 설정 병합

---

### 16. ValueOf\<T\> ⭐⭐

**객체의 값 타입 추출**

```typescript
type ValueOf<T> = T[keyof T];

const STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
} as const;

type Status = ValueOf<typeof STATUS>;
// 결과: "pending" | "approved" | "rejected"

function handleStatus(status: Status) {
  // status는 정의된 값 중 하나
}
```

**언제 사용?**
- 상수 객체의 값 타입
- enum 대체
- 설정 값 타입

---

### 17. ArrayElement\<T\> ⭐⭐

**배열 요소 타입 추출**

```typescript
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

const users = [
  { id: 1, name: "John" },
  { id: 2, name: "Jane" }
];

type User = ArrayElement<typeof users>;
// 결과: { id: number; name: string }

function processUser(user: User) {
  // 타입 안전
}
```

**언제 사용?**
- 배열 처리 함수
- 제네릭 배열
- 타입 추론

---

## 📌 실무 패턴 조합

### API 응답 처리

```typescript
// 기본 응답 래퍼
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 로딩 상태
type LoadingState<T> = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// 사용 예
type UserResponse = ApiResponse<User>;
type UserState = LoadingState<User>;
```

### 폼 처리

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 생성 폼 (id, createdAt 제외)
type CreateUserForm = Omit<User, "id" | "createdAt">;

// 수정 폼 (id 제외, 나머지 선택적)
type UpdateUserForm = Partial<Omit<User, "id">>;

// 공개 프로필 (password 제외)
type PublicProfile = Omit<User, "password">;
```

### CRUD 타입 패턴

```typescript
interface Entity {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create: 자동 생성 필드 제외
type CreateDTO<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

// Update: id 제외, 나머지 선택적
type UpdateDTO<T> = Partial<Omit<T, "id">>;

// List: 간단한 정보만
type ListItem<T, K extends keyof T> = Pick<T, K>;

// 사용
type CreateEntity = CreateDTO<Entity>;
type UpdateEntity = UpdateDTO<Entity>;
type EntityListItem = ListItem<Entity, "id" | "name">;
```

### 상태 관리

```typescript
// Redux/Zustand 상태
interface AppState {
  user: Nullable<User>;
  settings: DeepPartial<AppConfig>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}

// 불변 상태 (Redux)
type ImmutableState = Readonly<AppState>;

// 액션 페이로드
type UpdateUserPayload = Partial<User>;
type SetLoadingPayload = { key: string; loading: boolean };
```

---

## 📋 빠른 참조표

| 타입 | 자주도 | 용도 | 예시 |
|------|--------|------|------|
| **Partial\<T\>** | ⭐⭐⭐ | 업데이트, 옵션 | PATCH API, 부분 수정 |
| **Pick\<T, K\>** | ⭐⭐⭐ | 일부 선택 | API 최적화, Props |
| **Omit\<T, K\>** | ⭐⭐⭐ | 일부 제외 | 민감정보 제거, 폼 입력 |
| **Record\<K, T\>** | ⭐⭐ | 맵핑 | 상태 설정, i18n |
| **Required\<T\>** | ⭐⭐ | 필수 변환 | 설정 검증, 초기화 |
| **Readonly\<T\>** | ⭐⭐ | 불변 | Redux state, 상수 |
| **ReturnType\<T\>** | ⭐⭐⭐ | 반환 타입 | API 함수, 타입 재사용 |
| **Awaited\<T\>** | ⭐⭐⭐ | Promise 언래핑 | async 함수, API |
| **Parameters\<T\>** | ⭐⭐ | 매개변수 | 함수 래퍼, 이벤트 |
| **NonNullable\<T\>** | ⭐⭐ | null 제거 | 필터링, null 체크 |
| **Nullable\<T\>** | ⭐⭐⭐ | null 허용 | DB, API 응답 |
| **Maybe\<T\>** | ⭐⭐ | null/undefined | 외부 라이브러리 |
| **PartialBy\<T,K\>** | ⭐⭐⭐ | 부분 선택적 | 폼, DTO |
| **RequiredBy\<T,K\>** | ⭐⭐ | 부분 필수 | 검증, 단계별 폼 |
| **DeepPartial\<T\>** | ⭐⭐⭐ | 깊은 선택적 | 설정 객체, 업데이트 |
| **ValueOf\<T\>** | ⭐⭐ | 값 타입 추출 | 상수, enum 대체 |
| **ArrayElement\<T\>** | ⭐⭐ | 배열 요소 | 배열 처리, 제네릭 |

---

## 💡 핵심 팁

### 1. 타입 정의 파일 구조

```typescript
// types/common.ts - 공통 헬퍼 타입
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// types/api.ts - API 관련
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export type LoadingState<T> = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

// types/dto.ts - DTO 패턴
export type CreateDTO<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type UpdateDTO<T> = Partial<Omit<T, "id">>;
```

### 2. 자주 쓰는 조합

```typescript
// 1. API CRUD
type Create<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
type Update<T> = Partial<Omit<T, "id">>;
type Public<T, Exclude extends keyof T> = Omit<T, Exclude>;

// 2. 폼 상태
type FormState<T> = {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
};

// 3. 페이지네이션
type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
```

### 3. 타입 가드와 함께

```typescript
// null 체크
function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

const users: (User | null)[] = [user1, null, user2];
const validUsers = users.filter(isNotNull); // User[]

// 타입 좁히기
function isSuccess<T>(state: LoadingState<T>): state is { status: "success"; data: T } {
  return state.status === "success";
}

if (isSuccess(userState)) {
  console.log(userState.data); // 타입 안전
}
```

---

## 🎯 실무 체크리스트

**프로젝트 시작 시:**
- [ ] `types/common.ts`에 헬퍼 타입 정의
- [ ] `types/api.ts`에 API 응답 타입 정의
- [ ] `types/dto.ts`에 DTO 패턴 정의

**API 설계 시:**
- [ ] `ReturnType`으로 반환 타입 추론
- [ ] `Awaited`로 Promise 언래핑
- [ ] `Omit`으로 민감 정보 제거

**폼 처리 시:**
- [ ] `PartialBy`로 선택적 필드 정의
- [ ] `Omit`으로 자동 생성 필드 제외
- [ ] `LoadingState`로 상태 관리

**상태 관리 시:**
- [ ] `Readonly`로 불변성 보장
- [ ] `DeepPartial`로 깊은 업데이트
- [ ] `Record`로 맵핑 구조

---

## 마치며

이 문서의 17가지 타입만 잘 활용해도 실무의 90% 이상 커버할 수 있습니다.

**우선순위:**
1. **필수 (매일 사용)**: Partial, Pick, Omit, ReturnType, Awaited, Nullable
2. **자주 (주 1-2회)**: Record, Required, PartialBy, DeepPartial
3. **가끔 (월 1-2회)**: 나머지

프로젝트 초기에 `types/` 폴더를 만들고 공통 타입을 정의해두면, 개발 생산성이 크게 향상됩니다! 🚀
