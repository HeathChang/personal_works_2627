# TypeScript 헬퍼 타입 (Helper Types)

TypeScript의 내장 유틸리티 타입 외에도, 실무에서 자주 사용하는 커스텀 타입 패턴들이 있다. 이러한 헬퍼 타입들은 프로젝트에서 직접 정의하여 사용하며, 더욱 세밀한 타입 조작과 코드 재사용성을 제공한다.

---

## 1. Nullable\<T\>

타입 `T`에 `null`을 허용하는 타입을 만든다.

### 설명
- `T | null` 형태의 타입 별칭
- null 가능성을 명시적으로 표현
- 옵셔널(`?`)과는 다르게 명시적으로 null을 허용

### 언제 사용하는가?
- **데이터베이스 null**: DB에서 null 값을 허용하는 컬럼 타입
- **초기화되지 않은 상태**: 아직 로드되지 않았지만 null로 표현되는 상태
- **명시적 null 처리**: undefined가 아닌 null을 사용하는 API와 작업할 때
- **폼 초기값**: 폼 필드가 비어있을 때 null로 표현

### 예제

```typescript
type Nullable<T> = T | null;

// 사용 예
interface User {
  id: string;
  name: string;
  avatar: Nullable<string>; // string | null
  lastLoginAt: Nullable<Date>; // Date | null
}

const user: User = {
  id: "1",
  name: "John",
  avatar: null, // 프로필 사진이 없을 수 있음
  lastLoginAt: null // 아직 로그인한 적 없음
};

// API 응답에서 자주 사용
type ApiResponse<T> = {
  data: Nullable<T>;
  error: Nullable<string>;
};

const response: ApiResponse<User> = {
  data: user,
  error: null
};
```

---

## 2. Maybe\<T\>

타입 `T`에 `null` 또는 `undefined`를 허용하는 타입을 만든다.

### 설명
- `T | null | undefined` 형태
- Nullable보다 더 관대한 타입
- 값이 있을 수도, 없을 수도 있는 상황 표현

### 언제 사용하는가?
- **외부 라이브러리**: null과 undefined를 모두 반환할 수 있는 라이브러리
- **옵셔널 체이닝**: 깊은 속성 접근 시 중간에 값이 없을 수 있을 때
- **함수형 프로그래밍**: Option/Maybe 모나드 패턴 구현
- **레거시 코드**: null과 undefined가 혼용되는 코드베이스

### 예제

```typescript
type Maybe<T> = T | null | undefined;

// 사용 예
function findUser(id: string): Maybe<User> {
  // 찾지 못하면 null 또는 undefined 반환
  return null;
}

// 안전한 접근
const user = findUser("123");
const userName = user?.name ?? "Unknown";

// 배열 find와 함께
type MaybeUser = Maybe<User>;
const users: User[] = [];
const found: MaybeUser = users.find(u => u.id === "1");

// 옵셔널 매개변수와 조합
function greet(name: Maybe<string>) {
  if (name != null) {
    console.log(`Hello, ${name}!`);
  } else {
    console.log("Hello, stranger!");
  }
}

greet("John"); // ✅
greet(null); // ✅
greet(undefined); // ✅
```

---

## 3. ValueOf\<T\>

객체 타입 `T`의 모든 값 타입을 유니온으로 추출한다.

### 설명
- 객체의 프로퍼티 값들의 타입만 추출
- `T[keyof T]` 형태로 구현
- 객체를 값의 관점에서 바라볼 때 유용

### 언제 사용하는가?
- **상수 객체의 값**: const 객체에서 값들의 타입 추출
- **enum 대체**: 객체를 enum처럼 사용할 때 값 타입 정의
- **설정 값**: 설정 객체의 가능한 모든 값 타입
- **타입 가드**: 특정 값이 객체의 값 중 하나인지 검증

### 예제

```typescript
type ValueOf<T> = T[keyof T];

// 사용 예: 상수 객체
const COLORS = {
  RED: "#ff0000",
  GREEN: "#00ff00",
  BLUE: "#0000ff"
} as const;

type Color = ValueOf<typeof COLORS>;
// 결과: "#ff0000" | "#00ff00" | "#0000ff"

// HTTP 상태 코드
const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404
} as const;

type StatusCode = ValueOf<typeof HttpStatus>;
// 결과: 200 | 201 | 400 | 401 | 404

function handleStatus(status: StatusCode) {
  // status는 정의된 상태 코드 중 하나
  console.log(`Status: ${status}`);
}

// 객체 값 타입
interface User {
  id: string;
  name: string;
  age: number;
}

type UserValue = ValueOf<User>;
// 결과: string | number
```

---

## 4. KeysOfType\<T, U\>

타입 `T`에서 값 타입이 `U`인 키들만 추출한다.

### 설명
- 특정 타입의 값을 가진 키만 필터링
- 조건부 타입을 사용한 고급 패턴
- 타입 안전한 키 선택

### 언제 사용하는가?
- **특정 타입 필드만**: 문자열 필드만, 숫자 필드만 선택
- **함수 메서드 추출**: 클래스나 객체에서 함수만 선택
- **타입별 처리**: 타입에 따라 다른 로직 적용
- **직렬화**: 특정 타입만 직렬화하거나 제외

### 예제

```typescript
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// 사용 예
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  isAvailable: boolean;
}

// 문자열 타입 키만
type StringKeys = KeysOfType<Product, string>;
// 결과: "id" | "name" | "description"

// 숫자 타입 키만
type NumberKeys = KeysOfType<Product, number>;
// 결과: "price" | "stock"

// 불린 타입 키만
type BooleanKeys = KeysOfType<Product, boolean>;
// 결과: "isAvailable"

// 실사용: 특정 타입 필드만 업데이트
function updateStringFields<T>(
  obj: T,
  key: KeysOfType<T, string>,
  value: string
): T {
  return { ...obj, [key]: value };
}

// 클래스에서 함수 메서드만 추출
class Calculator {
  value: number = 0;
  name: string = "calc";
  add(n: number) { return this.value + n; }
  subtract(n: number) { return this.value - n; }
}

type CalculatorMethods = KeysOfType<Calculator, Function>;
// 결과: "add" | "subtract"
```

---

## 5. DeepPartial\<T\>

중첩된 객체의 모든 프로퍼티를 재귀적으로 선택적으로 만든다.

### 설명
- `Partial<T>`의 재귀 버전
- 깊은 객체 구조의 모든 레벨을 선택적으로
- 복잡한 중첩 구조 처리

### 언제 사용하는가?
- **깊은 업데이트**: 중첩된 객체의 일부만 업데이트
- **설정 병합**: 기본 설정과 사용자 설정 병합
- **부분 초기화**: 복잡한 객체를 단계적으로 초기화
- **폼 상태**: 여러 단계의 폼 데이터 관리

### 예제

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 사용 예: 복잡한 설정 객체
interface AppConfig {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      certificate: string;
      key: string;
    };
  };
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
}

// 일부만 업데이트 가능
const configUpdate: DeepPartial<AppConfig> = {
  server: {
    ssl: {
      enabled: true
      // certificate와 key는 선택적
    }
    // host, port는 선택적
  }
  // database 전체가 선택적
};

// 설정 병합 함수
function mergeConfig(
  defaults: AppConfig,
  overrides: DeepPartial<AppConfig>
): AppConfig {
  // 재귀적으로 병합
  return { ...defaults, ...overrides } as AppConfig;
}

// 폼 상태 관리
interface UserForm {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    country: string;
  };
}

const formState: DeepPartial<UserForm> = {
  personal: {
    firstName: "John"
    // 다른 필드는 아직 입력 안됨
  }
};
```

---

## 6. DeepReadonly\<T\>

중첩된 객체의 모든 프로퍼티를 재귀적으로 읽기 전용으로 만든다.

### 설명
- `Readonly<T>`의 재귀 버전
- 깊은 불변성 보장
- 중첩된 모든 레벨을 변경 불가능하게

### 언제 사용하는가?
- **불변 상태**: Redux 같은 상태 관리에서 깊은 불변성
- **상수 설정**: 애플리케이션 전체에서 사용하는 설정
- **순수 함수**: 입력 객체를 절대 변경하지 않음을 보장
- **공유 데이터**: 여러 곳에서 참조하지만 변경하면 안 되는 데이터

### 예제

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? DeepReadonly<T[P]> 
    : T[P];
};

// 사용 예: 불변 설정
interface AppSettings {
  api: {
    baseUrl: string;
    timeout: number;
    retry: {
      attempts: number;
      delay: number;
    };
  };
  features: {
    darkMode: boolean;
    notifications: boolean;
  };
}

const settings: DeepReadonly<AppSettings> = {
  api: {
    baseUrl: "https://api.example.com",
    timeout: 5000,
    retry: {
      attempts: 3,
      delay: 1000
    }
  },
  features: {
    darkMode: true,
    notifications: true
  }
};

// settings.api.baseUrl = "..."; // ❌ 에러
// settings.api.retry.attempts = 5; // ❌ 에러 - 깊은 레벨도 읽기 전용

// Redux 상태
interface RootState {
  user: {
    profile: {
      name: string;
      email: string;
    };
    preferences: {
      theme: string;
      language: string;
    };
  };
}

type ImmutableState = DeepReadonly<RootState>;

function reducer(state: ImmutableState, action: any): ImmutableState {
  // state를 직접 변경할 수 없음 - 새 객체 반환 필요
  // state.user.profile.name = "..."; // ❌ 에러
  return state;
}
```

---

## 7. Mutable\<T\>

`Readonly` 프로퍼티를 변경 가능하게 만든다.

### 설명
- `Readonly`의 반대
- `-readonly` 수식어 사용
- 읽기 전용 타입을 변경 가능하게 변환

### 언제 사용하는가?
- **임시 수정**: readonly 객체를 일시적으로 수정해야 할 때
- **내부 구현**: 외부에는 readonly지만 내부적으로는 수정 가능
- **테스트**: 테스트 환경에서 readonly 객체를 모킹
- **타입 변환**: 외부 라이브러리의 readonly 타입을 수정 가능하게

### 예제

```typescript
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// 사용 예
interface ReadonlyPoint {
  readonly x: number;
  readonly y: number;
}

type MutablePoint = Mutable<ReadonlyPoint>;
// 결과: { x: number; y: number; }

const point: MutablePoint = { x: 10, y: 20 };
point.x = 30; // ✅ 가능

// 실사용: 내부 구현
class PointManager {
  private point: MutablePoint = { x: 0, y: 0 };

  // 외부에는 readonly로 노출
  getPoint(): ReadonlyPoint {
    return this.point;
  }

  // 내부적으로는 수정 가능
  move(dx: number, dy: number) {
    this.point.x += dx;
    this.point.y += dy;
  }
}

// 배열의 readonly 제거
type ReadonlyArray<T> = readonly T[];
type MutableArray<T> = Mutable<ReadonlyArray<T>>;

const arr: ReadonlyArray<number> = [1, 2, 3];
// arr.push(4); // ❌ 에러

const mutableArr: MutableArray<number> = [1, 2, 3] as any;
mutableArr.push(4); // ✅ 가능
```

---

## 8. RequireAtLeastOne\<T, Keys\>

지정된 키 중 최소 하나는 필수로 만든다.

### 설명
- 여러 선택적 필드 중 최소 하나는 필요
- 복잡한 조건부 타입 조합
- 유연한 API 설계

### 언제 사용하는가?
- **검색 조건**: 여러 검색 옵션 중 최소 하나는 필요
- **연락처 정보**: 이메일, 전화번호 중 하나는 필수
- **인증 방식**: 여러 인증 수단 중 하나는 제공
- **업데이트 API**: 수정할 필드가 최소 하나는 필요

### 예제

```typescript
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = 
  Pick<T, Exclude<keyof T, Keys>> 
  & {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

// 사용 예: 연락처
interface Contact {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

type ContactWithAtLeastOne = RequireAtLeastOne<Contact, "email" | "phone">;
// email이나 phone 중 최소 하나는 필수

const validContact1: ContactWithAtLeastOne = {
  name: "John",
  email: "john@example.com"
  // phone은 선택적
};

const validContact2: ContactWithAtLeastOne = {
  name: "Jane",
  phone: "123-456-7890"
  // email은 선택적
};

// const invalidContact: ContactWithAtLeastOne = {
//   name: "Invalid",
//   // ❌ 에러: email과 phone 둘 다 없음
// };

// 검색 조건
interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
}

type SearchWithCriteria = RequireAtLeastOne<SearchParams>;
// 최소 하나의 검색 조건은 필요

function search(params: SearchWithCriteria) {
  // 최소 하나의 검색 조건이 보장됨
  console.log("Searching with:", params);
}

// search({}); // ❌ 에러
search({ query: "typescript" }); // ✅
search({ category: "tech", tags: ["js"] }); // ✅
```

---

## 9. RequireOnlyOne\<T, Keys\>

지정된 키 중 정확히 하나만 필수로 만든다.

### 설명
- 여러 옵션 중 딱 하나만 선택
- 상호 배타적 프로퍼티
- XOR(배타적 논리합) 타입

### 언제 사용하는가?
- **결제 수단**: 신용카드, 계좌이체 등 중 하나만
- **인증 방식**: 비밀번호, OAuth, 생체인증 중 하나
- **데이터 소스**: URL, 파일, 인라인 데이터 중 하나
- **조건부 속성**: A가 있으면 B는 없어야 하는 경우

### 예제

```typescript
type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, never>>;
  }[Keys];

// 사용 예: 결제 방식
interface PaymentMethod {
  creditCard?: {
    number: string;
    cvv: string;
  };
  bankTransfer?: {
    accountNumber: string;
    bankCode: string;
  };
  paypal?: {
    email: string;
  };
}

type SinglePaymentMethod = RequireOnlyOne<
  PaymentMethod,
  "creditCard" | "bankTransfer" | "paypal"
>;

const payment1: SinglePaymentMethod = {
  creditCard: {
    number: "1234-5678-9012-3456",
    cvv: "123"
  }
  // ✅ creditCard만 있음
};

// const payment2: SinglePaymentMethod = {
//   creditCard: { ... },
//   paypal: { ... }
//   // ❌ 에러: 둘 다 있으면 안 됨
// };

// 데이터 소스
interface DataSource {
  url?: string;
  file?: File;
  inline?: string;
}

type SingleDataSource = RequireOnlyOne<DataSource, "url" | "file" | "inline">;

function loadData(source: SingleDataSource) {
  if (source.url) {
    // URL에서 로드
  } else if (source.file) {
    // 파일에서 로드
  } else if (source.inline) {
    // 인라인 데이터 사용
  }
}

loadData({ url: "https://api.example.com/data" }); // ✅
loadData({ file: new File([], "data.json") }); // ✅
// loadData({ url: "...", file: ... }); // ❌ 에러
```

---

## 10. PartialBy\<T, K\>

특정 프로퍼티만 선택적으로 만든다.

### 설명
- `Partial<T>`의 선택적 버전
- 일부 필드만 optional로 변경
- 세밀한 타입 제어

### 언제 사용하는가?
- **업데이트 DTO**: 특정 필드만 수정 가능하게
- **폼 유효성**: 일부 필드만 나중에 입력 가능
- **단계별 입력**: 필수 정보와 추가 정보 구분
- **유연한 생성자**: 일부 매개변수만 선택적으로

### 예제

```typescript
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 사용 예
interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  bio: string;
}

// email만 선택적으로
type UserWithOptionalEmail = PartialBy<User, "email">;
// 결과: { id: string; name: string; age: number; bio: string; email?: string; }

// 여러 필드를 선택적으로
type UserWithOptionalInfo = PartialBy<User, "age" | "bio">;
// 결과: { id: string; email: string; name: string; age?: number; bio?: string; }

// 실사용: 회원가입
type SignupData = PartialBy<User, "id" | "bio">;
// id는 서버에서 생성, bio는 선택 사항

function signup(data: SignupData) {
  // id와 bio는 없어도 됨
  console.log(data);
}

signup({
  email: "john@example.com",
  name: "John",
  age: 25
  // id, bio는 선택적
});

// 프로필 업데이트
type ProfileUpdate = PartialBy<User, "email" | "name" | "age" | "bio">;
// id만 필수, 나머지는 선택적

function updateProfile(userId: string, updates: Omit<ProfileUpdate, "id">) {
  console.log(`Updating user ${userId}`, updates);
}
```

---

## 11. RequiredBy\<T, K\>

특정 프로퍼티만 필수로 만든다.

### 설명
- `Required<T>`의 선택적 버전
- 일부 필드만 필수로 변경
- 조건부 필수 필드 정의

### 언제 사용하는가?
- **초기화 검증**: 특정 필드가 반드시 설정되어야 할 때
- **단계별 폼**: 다음 단계로 가기 위한 필수 필드
- **설정 강제**: 기본값 없이 반드시 제공해야 하는 설정
- **타입 좁히기**: 런타임 검증 후 필수 필드 보장

### 예제

```typescript
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// 사용 예
interface Config {
  host?: string;
  port?: number;
  ssl?: boolean;
  timeout?: number;
}

// host는 반드시 필요
type ConfigWithRequiredHost = RequiredBy<Config, "host">;
// 결과: { port?: number; ssl?: boolean; timeout?: number; host: string; }

// 여러 필드를 필수로
type ConfigWithRequiredConnection = RequiredBy<Config, "host" | "port">;
// 결과: { ssl?: boolean; timeout?: number; host: string; port: number; }

function connectToServer(config: ConfigWithRequiredConnection) {
  // host와 port는 반드시 존재
  console.log(`Connecting to ${config.host}:${config.port}`);
}

// connectToServer({ host: "localhost" }); // ❌ 에러: port 필요
connectToServer({ host: "localhost", port: 3000 }); // ✅

// 단계별 폼 유효성
interface RegistrationForm {
  email?: string;
  password?: string;
  name?: string;
  age?: number;
  terms?: boolean;
}

// 1단계: 이메일과 비밀번호 필수
type Step1Form = RequiredBy<RegistrationForm, "email" | "password">;

// 2단계: 이름 추가 필수
type Step2Form = RequiredBy<Step1Form, "name">;

// 3단계: 약관 동의 필수
type Step3Form = RequiredBy<Step2Form, "terms">;
```

---

## 12. UnionToIntersection\<U\>

유니온 타입을 인터섹션 타입으로 변환한다.

### 설명
- 조건부 타입의 분배 법칙 활용
- 고급 타입 조작 기법
- 여러 타입의 모든 속성을 합침

### 언제 사용하는가?
- **믹스인 패턴**: 여러 클래스나 객체를 하나로 합칠 때
- **플러그인 시스템**: 여러 플러그인의 기능을 모두 포함
- **타입 합성**: 여러 타입의 모든 속성이 필요할 때
- **고차 함수**: 여러 함수의 오버로드를 하나로

### 예제

```typescript
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

// 사용 예
type A = { a: string };
type B = { b: number };
type C = { c: boolean };

type Union = A | B | C;
type Intersection = UnionToIntersection<Union>;
// 결과: { a: string; b: number; c: boolean; }

// 실사용: 믹스인
interface CanEat {
  eat(): void;
}

interface CanWalk {
  walk(): void;
}

interface CanSwim {
  swim(): void;
}

type Animal = CanEat | CanWalk;
type SuperAnimal = UnionToIntersection<Animal>;
// 결과: { eat(): void; walk(): void; }

// 플러그인 시스템
interface LoggerPlugin {
  log(message: string): void;
}

interface CachePlugin {
  cache: Map<string, any>;
  get(key: string): any;
  set(key: string, value: any): void;
}

interface AuthPlugin {
  authenticate(token: string): boolean;
}

type Plugin = LoggerPlugin | CachePlugin | AuthPlugin;
type AllPlugins = UnionToIntersection<Plugin>;
// 모든 플러그인 기능을 가진 타입

// 함수 오버로드 합치기
type Func1 = (x: string) => string;
type Func2 = (x: number) => number;
type Func3 = (x: boolean) => boolean;

type AllFuncs = UnionToIntersection<Func1 | Func2 | Func3>;
// 결과: ((x: string) => string) & ((x: number) => number) & ((x: boolean) => boolean)
```

---

## 13. PromiseType\<T\>

Promise 타입에서 resolve되는 값의 타입을 추출한다.

### 설명
- `Awaited<T>`와 유사하지만 더 명시적
- Promise가 아닌 타입은 그대로 반환
- 타입 안전한 비동기 처리

### 언제 사용하는가?
- **API 응답 타입**: Promise를 반환하는 함수의 결과 타입
- **async 유틸**: 비동기 함수의 실제 반환값 타입 정의
- **제네릭 래퍼**: Promise를 다루는 제네릭 함수
- **타입 추론**: 복잡한 Promise 체인의 최종 타입

### 예제

```typescript
type PromiseType<T> = T extends Promise<infer U> ? U : T;

// 사용 예
type Example1 = PromiseType<Promise<string>>;
// 결과: string

type Example2 = PromiseType<Promise<User>>;
// 결과: User

type Example3 = PromiseType<number>;
// 결과: number (Promise가 아니면 그대로)

// 실사용: API 함수
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

type FetchUserResult = PromiseType<ReturnType<typeof fetchUser>>;
// 결과: User

// 제네릭 래퍼
async function withLoading<T>(promise: Promise<T>): Promise<T> {
  console.log("Loading...");
  const result = await promise;
  console.log("Done!");
  return result;
}

type LoadingResult<T> = PromiseType<ReturnType<typeof withLoading<T>>>;

// 여러 Promise 타입 추출
type MultiplePromises = [
  Promise<string>,
  Promise<number>,
  Promise<boolean>
];

type ExtractedTypes = {
  [K in keyof MultiplePromises]: PromiseType<MultiplePromises[K]>;
};
// 결과: [string, number, boolean]

// API 응답 래퍼
interface ApiPromise<T> extends Promise<{ data: T; status: number }> {}

type ApiResponseType<T> = PromiseType<ApiPromise<T>>;
// 결과: { data: T; status: number }
```

---

## 14. ArrayElement\<T\>

배열 타입에서 요소의 타입을 추출한다.

### 설명
- `T[number]` 형태로 구현
- 배열의 단일 요소 타입
- 배열과 요소를 다루는 함수에서 유용

### 언제 사용하는가?
- **배열 처리 함수**: map, filter 등의 반환 타입
- **제네릭 배열**: 배열 요소의 타입이 필요할 때
- **타입 안전한 반복**: forEach, reduce 등에서 요소 타입
- **유니온 생성**: 배열 요소들의 유니온 타입 필요

### 예제

```typescript
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

// 사용 예
type StringArray = string[];
type Element1 = ArrayElement<StringArray>;
// 결과: string

type NumberArray = number[];
type Element2 = ArrayElement<NumberArray>;
// 결과: number

// 복잡한 배열
type UserArray = User[];
type Element3 = ArrayElement<UserArray>;
// 결과: User

// 실사용: 제네릭 함수
function first<T extends any[]>(arr: T): ArrayElement<T> | undefined {
  return arr[0];
}

const numbers = [1, 2, 3];
const firstNum = first(numbers); // 타입: number | undefined

const users: User[] = [];
const firstUser = first(users); // 타입: User | undefined

// 배열 변환
function mapArray<T extends any[], R>(
  arr: T,
  fn: (item: ArrayElement<T>) => R
): R[] {
  return arr.map(fn as any);
}

const doubled = mapArray([1, 2, 3], (x) => x * 2);
// 타입: number[]

// 튜플에서도 작동
type Tuple = [string, number, boolean];
type TupleElement = ArrayElement<Tuple>;
// 결과: string | number | boolean

// readonly 배열
type ReadonlyNumbers = readonly number[];
type ReadonlyElement = ArrayElement<ReadonlyNumbers>;
// 결과: number

// 중첩 배열
type NestedArray = number[][];
type NestedElement = ArrayElement<NestedArray>;
// 결과: number[]
```

---

## 15. FunctionType\<T\>

객체에서 함수 타입 프로퍼티만 추출한다.

### 설명
- 함수인 프로퍼티만 필터링
- 메서드와 일반 프로퍼티 구분
- 타입 안전한 함수 호출

### 언제 사용하는가?
- **API 클라이언트**: 메서드만 추출하여 타입 정의
- **이벤트 핸들러**: 핸들러 함수들만 타입으로
- **플러그인 인터페이스**: 호출 가능한 메서드만
- **메서드 프록시**: 함수 호출을 가로채는 프록시

### 예제

```typescript
type FunctionType<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

// 사용 예
interface UserService {
  name: string;
  version: number;
  getUser(id: string): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  config: {
    timeout: number;
  };
}

type UserServiceMethods = FunctionType<UserService>;
// 결과: "getUser" | "updateUser" | "deleteUser"

// 메서드만 추출한 타입
type OnlyMethods<T> = Pick<T, FunctionType<T>>;

type UserServiceAPI = OnlyMethods<UserService>;
// 결과: {
//   getUser(id: string): Promise<User>;
//   updateUser(id: string, data: Partial<User>): Promise<User>;
//   deleteUser(id: string): Promise<void>;
// }

// 실사용: 메서드 프록시
function createProxy<T extends object>(obj: T) {
  const methodNames = Object.keys(obj).filter(
    key => typeof obj[key as keyof T] === "function"
  ) as FunctionType<T>[];

  const proxy = {} as OnlyMethods<T>;
  
  methodNames.forEach((method) => {
    (proxy as any)[method] = (...args: any[]) => {
      console.log(`Calling ${String(method)} with`, args);
      return (obj[method as keyof T] as any)(...args);
    };
  });

  return proxy;
}

// React 컴포넌트 메서드
class MyComponent {
  state = { count: 0 };
  
  increment() {
    this.state.count++;
  }
  
  decrement() {
    this.state.count--;
  }
  
  reset() {
    this.state.count = 0;
  }
}

type ComponentMethods = FunctionType<MyComponent>;
// 결과: "increment" | "decrement" | "reset"
```

---

## 16. PlainObject\<T\>

함수를 제외한 일반 프로퍼티만 추출한다.

### 설명
- `FunctionType`의 반대
- 데이터 프로퍼티만 포함
- 직렬화 가능한 속성만 선택

### 언제 사용하는가?
- **JSON 직렬화**: 함수를 제외하고 데이터만 저장
- **데이터 전송**: API로 보낼 데이터 타입
- **상태 관리**: 순수 데이터만 state로 저장
- **데이터베이스 모델**: 메서드 없이 데이터만

### 예제

```typescript
type PlainObject<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

// 사용 예
class User {
  id: string = "";
  name: string = "";
  email: string = "";
  
  greet() {
    return `Hello, ${this.name}`;
  }
  
  updateEmail(email: string) {
    this.email = email;
  }
}

type UserData = PlainObject<User>;
// 결과: {
//   id: string;
//   name: string;
//   email: string;
// }

// 실사용: JSON 저장
function saveToJSON<T extends object>(obj: T): PlainObject<T> {
  const data = {} as PlainObject<T>;
  
  for (const key in obj) {
    if (typeof obj[key] !== "function") {
      (data as any)[key] = obj[key];
    }
  }
  
  return data;
}

const user = new User();
user.name = "John";
user.email = "john@example.com";

const userData = saveToJSON(user);
// 타입: { id: string; name: string; email: string; }

// API 전송
interface ApiService {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
  
  get(url: string): Promise<any>;
  post(url: string, data: any): Promise<any>;
}

type ApiConfig = PlainObject<ApiService>;
// 결과: {
//   baseUrl: string;
//   timeout: number;
//   headers: Record<string, string>;
// }

function createService(config: ApiConfig): ApiService {
  return {
    ...config,
    get: async (url) => { /* ... */ },
    post: async (url, data) => { /* ... */ }
  } as ApiService;
}
```

---

## 17. Primitive

모든 원시 타입의 유니온을 정의한다.

### 설명
- JavaScript의 모든 원시 타입
- string, number, boolean, null, undefined, symbol, bigint
- 객체가 아닌 값 타입

### 언제 사용하는가?
- **타입 가드**: 원시 타입인지 확인
- **직렬화 검증**: 원시 타입만 허용
- **제약 조건**: 제네릭에서 원시 타입만 허용
- **타입 필터링**: 원시 타입 프로퍼티만 선택

### 예제

```typescript
type Primitive = 
  | string
  | number
  | boolean
  | null
  | undefined
  | symbol
  | bigint;

// 사용 예: 타입 가드
function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  );
}

// 원시 타입만 허용하는 함수
function logPrimitive(value: Primitive) {
  console.log(value);
}

logPrimitive("hello"); // ✅
logPrimitive(123); // ✅
logPrimitive(true); // ✅
// logPrimitive({ a: 1 }); // ❌ 에러

// 원시 타입 필드만 추출
type PrimitiveKeys<T> = {
  [K in keyof T]: T[K] extends Primitive ? K : never;
}[keyof T];

interface Mixed {
  id: string;
  count: number;
  active: boolean;
  data: object;
  items: any[];
  metadata: null;
}

type OnlyPrimitives = PrimitiveKeys<Mixed>;
// 결과: "id" | "count" | "active" | "metadata"

// 깊은 원시 타입 체크
type DeepPrimitive<T> = T extends Primitive
  ? T
  : T extends (infer U)[]
  ? DeepPrimitive<U>[]
  : T extends object
  ? { [K in keyof T]: DeepPrimitive<T[K]> }
  : never;

// 직렬화 가능 타입
type Serializable = Primitive | Serializable[] | { [key: string]: Serializable };

function serialize(value: Serializable): string {
  return JSON.stringify(value);
}
```

---

## 18. Falsy

모든 falsy 값의 유니온 타입을 정의한다.

### 설명
- JavaScript에서 false로 평가되는 모든 값
- false, 0, "", null, undefined, NaN
- 조건문에서 유용

### 언제 사용하는가?
- **기본값 처리**: falsy 값일 때 기본값 사용
- **필터링**: falsy 값 제거
- **유효성 검사**: truthy 값인지 확인
- **타입 좁히기**: falsy 값을 제외한 타입

### 예제

```typescript
type Falsy = false | 0 | "" | null | undefined;
// NaN은 타입으로 표현하기 어려움

// 사용 예: 타입 가드
function isFalsy(value: unknown): value is Falsy {
  return !value && value !== 0 && value !== "";
}

// 기본값 처리
function withDefault<T>(value: T | Falsy, defaultValue: T): T {
  return value || defaultValue;
}

const result1 = withDefault("", "default"); // "default"
const result2 = withDefault("hello", "default"); // "hello"
const result3 = withDefault(0, 10); // 10
const result4 = withDefault(5, 10); // 5

// Falsy 제거
function removeFalsy<T>(arr: (T | Falsy)[]): T[] {
  return arr.filter((item): item is T => Boolean(item));
}

const mixed = [1, 0, "hello", "", null, undefined, false, true];
const filtered = removeFalsy(mixed);
// 결과: [1, "hello", true]

// Truthy 타입
type Truthy<T> = Exclude<T, Falsy>;

type StringOrNull = string | null | undefined;
type TruthyString = Truthy<StringOrNull>;
// 결과: string

// 옵셔널 체이닝 대체
function getOrDefault<T>(
  value: T | Falsy,
  defaultValue: NonNullable<T>
): NonNullable<T> {
  return (value || defaultValue) as NonNullable<T>;
}

interface User {
  name?: string;
  email?: string;
}

const user: User = { name: "" };
const name = getOrDefault(user.name, "Anonymous");
// 결과: "Anonymous"
```

---

## 19. Opaque\<T, Token\>

명목적 타이핑(nominal typing)을 구현하는 불투명 타입을 만든다.

### 설명
- 구조적으로 동일하지만 의미적으로 다른 타입 구분
- 타입 안전성 강화
- 런타임 오버헤드 없음

### 언제 사용하는가?
- **ID 타입**: UserId, ProductId 등 구분이 필요한 ID
- **단위 구분**: Pixels, Percent 등 동일한 숫자지만 다른 의미
- **보안**: Password, Token 등 특별히 다뤄야 하는 값
- **도메인 모델**: 비즈니스 로직에서 타입 혼동 방지

### 예제

```typescript
type Opaque<T, Token = unknown> = T & { readonly __opaque__: Token };

// 사용 예: ID 타입 구분
type UserId = Opaque<string, "UserId">;
type ProductId = Opaque<string, "ProductId">;
type OrderId = Opaque<string, "OrderId">;

// 생성 함수
function createUserId(id: string): UserId {
  return id as UserId;
}

function createProductId(id: string): ProductId {
  return id as ProductId;
}

// 타입 안전한 함수
function getUser(userId: UserId): User {
  // userId는 반드시 UserId 타입
  return {} as User;
}

function getProduct(productId: ProductId): any {
  return {};
}

const userId = createUserId("user-123");
const productId = createProductId("prod-456");

getUser(userId); // ✅
// getUser(productId); // ❌ 에러: ProductId를 UserId에 할당 불가
// getProduct(userId); // ❌ 에러: UserId를 ProductId에 할당 불가

// 단위 구분
type Pixels = Opaque<number, "Pixels">;
type Percent = Opaque<number, "Percent">;

function setWidth(width: Pixels) {
  console.log(`Width: ${width}px`);
}

function setOpacity(opacity: Percent) {
  console.log(`Opacity: ${opacity}%`);
}

const width = 100 as Pixels;
const opacity = 50 as Percent;

setWidth(width); // ✅
// setWidth(opacity); // ❌ 에러: 단위가 다름

// 보안 타입
type Password = Opaque<string, "Password">;
type HashedPassword = Opaque<string, "HashedPassword">;

function hashPassword(password: Password): HashedPassword {
  // 해싱 로직
  return "hashed..." as HashedPassword;
}

function verifyPassword(password: Password, hash: HashedPassword): boolean {
  return hashPassword(password) === hash;
}

// const plainText = "secret123";
// hashPassword(plainText); // ❌ 에러: string을 Password로 사용 불가

const password = "secret123" as Password;
hashPassword(password); // ✅

// 통화 구분
type USD = Opaque<number, "USD">;
type EUR = Opaque<number, "EUR">;
type KRW = Opaque<number, "KRW">;

function convertUSDtoEUR(amount: USD, rate: number): EUR {
  return (amount * rate) as EUR;
}

const dollars = 100 as USD;
const euros = convertUSDtoEUR(dollars, 0.85);
```

---

## 20. Brand\<T, FlavorT\>

브랜드 타입을 생성한다 (Opaque의 다른 구현 방식).

### 설명
- Opaque와 유사하지만 다른 패턴
- 타입에 "브랜드"를 추가하여 구분
- 더 명시적인 구분 가능

### 언제 사용하는가?
- **타입 안전성**: 동일한 기본 타입이지만 다른 의미
- **도메인 모델링**: 비즈니스 개념을 타입으로 표현
- **검증된 값**: 유효성 검사를 통과한 값만 타입으로
- **API 경계**: 외부 시스템과 내부 시스템 타입 구분

### 언제 사용하는가?
- **타입 안전성**: 동일한 기본 타입이지만 다른 의미
- **도메인 모델링**: 비즈니스 개념을 타입으로 표현
- **검증된 값**: 유효성 검사를 통과한 값만 타입으로
- **API 경계**: 외부 시스템과 내부 시스템 타입 구분

### 예제

```typescript
type Brand<T, FlavorT> = T & { __brand: FlavorT };

// 사용 예: 검증된 타입
type Email = Brand<string, "Email">;
type PhoneNumber = Brand<string, "PhoneNumber">;
type URL = Brand<string, "URL">;

// 검증 함수
function validateEmail(email: string): Email | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? (email as Email) : null;
}

function validatePhoneNumber(phone: string): PhoneNumber | null {
  const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
  return phoneRegex.test(phone) ? (phone as PhoneNumber) : null;
}

// 타입 안전한 함수
function sendEmail(to: Email, subject: string, body: string) {
  // to는 검증된 이메일 주소임이 보장됨
  console.log(`Sending email to ${to}`);
}

const userInput = "john@example.com";
const validEmail = validateEmail(userInput);

if (validEmail) {
  sendEmail(validEmail, "Hello", "Welcome!"); // ✅
}

// sendEmail(userInput, "Hello", "Welcome!"); // ❌ 에러: 검증 필요

// 양수만 허용
type PositiveNumber = Brand<number, "Positive">;
type NegativeNumber = Brand<number, "Negative">;

function toPositive(n: number): PositiveNumber | null {
  return n > 0 ? (n as PositiveNumber) : null;
}

function calculateDiscount(price: PositiveNumber, rate: PositiveNumber) {
  return price * rate;
}

const price = toPositive(100);
const rate = toPositive(0.1);

if (price && rate) {
  calculateDiscount(price, rate); // ✅
}

// 정렬된 배열
type SortedArray<T> = Brand<T[], "Sorted">;

function binarySearch<T>(arr: SortedArray<T>, target: T): number {
  // arr이 정렬되어 있음이 보장됨
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}

function sort<T>(arr: T[]): SortedArray<T> {
  return arr.sort() as SortedArray<T>;
}

const numbers = [3, 1, 4, 1, 5, 9];
const sorted = sort(numbers);
binarySearch(sorted, 4); // ✅
// binarySearch(numbers, 4); // ❌ 에러: 정렬되지 않음

// 비밀번호 강도
type WeakPassword = Brand<string, "WeakPassword">;
type StrongPassword = Brand<string, "StrongPassword">;

function validatePasswordStrength(password: string): StrongPassword | WeakPassword {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= 12;
  
  const isStrong = hasUpperCase && hasLowerCase && hasNumber && hasSpecial && isLongEnough;
  
  return isStrong 
    ? (password as StrongPassword)
    : (password as WeakPassword);
}

function createAccount(email: Email, password: StrongPassword) {
  // 강력한 비밀번호만 허용
  console.log("Account created!");
}
```

---

## 헬퍼 타입 조합 예제

여러 헬퍼 타입을 함께 사용하는 실전 예제

```typescript
// 1. 안전한 API 클라이언트
type ApiEndpoint = Brand<string, "ApiEndpoint">;
type AuthToken = Brand<string, "AuthToken">;

interface ApiClient {
  baseUrl: string;
  token: Nullable<AuthToken>;
  
  get<T>(endpoint: ApiEndpoint): Promise<T>;
  post<T>(endpoint: ApiEndpoint, data: any): Promise<T>;
}

type ApiClientConfig = PlainObject<ApiClient>;
type ApiClientMethods = Pick<ApiClient, FunctionType<ApiClient>>;

// 2. 폼 상태 관리
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  terms: boolean;
  newsletter?: boolean;
}

type FormErrors = Partial<Record<keyof FormData, string>>;
type ValidatedForm = RequiredBy<FormData, "email" | "password" | "terms">;
type SubmitData = Omit<ValidatedForm, "confirmPassword">;

// 3. 복잡한 설정 관리
interface DatabaseConfig {
  host: string;
  port: number;
  credentials: {
    username: string;
    password: string;
  };
  options?: {
    ssl?: boolean;
    timeout?: number;
    poolSize?: number;
  };
}

type RequiredConfig = RequiredBy<DatabaseConfig, "host" | "port" | "credentials">;
type PartialOptions = DeepPartial<DatabaseConfig["options"]>;
type ImmutableConfig = DeepReadonly<RequiredConfig>;

// 4. 이벤트 시스템
type EventName = Brand<string, "EventName">;
type EventHandler<T = any> = (data: T) => void;

interface EventMap {
  "user:login": { userId: string; timestamp: Date };
  "user:logout": { userId: string };
  "data:update": { id: string; changes: Record<string, any> };
}

type EventKeys = keyof EventMap;
type EventData<K extends EventKeys> = EventMap[K];

class EventEmitter {
  private handlers: Partial<Record<EventKeys, EventHandler[]>> = {};
  
  on<K extends EventKeys>(event: K, handler: EventHandler<EventData<K>>) {
    // 타입 안전한 이벤트 등록
  }
  
  emit<K extends EventKeys>(event: K, data: EventData<K>) {
    // 타입 안전한 이벤트 발생
  }
}

// 5. 데이터 변환 파이프라인
type JSONSerializable = 
  | Primitive 
  | JSONSerializable[] 
  | { [key: string]: JSONSerializable };

interface DataTransformer<Input, Output> {
  transform(input: Input): Output;
  validate(input: unknown): input is Input;
}

type TransformerInput<T> = T extends DataTransformer<infer I, any> ? I : never;
type TransformerOutput<T> = T extends DataTransformer<any, infer O> ? O : never;

// 6. 타입 안전한 라우팅
type RouteParams = Record<string, string | number>;
type RoutePath = Brand<string, "RoutePath">;

interface Route<Params extends RouteParams = RouteParams> {
  path: RoutePath;
  params: Params;
  query?: Record<string, string>;
}

type RouteWithRequiredParams<T extends RouteParams> = RequiredBy<Route<T>, "params">;
type RouteData<T extends Route> = PlainObject<T>;
```

---

## 헬퍼 타입 전체 요약표

| 헬퍼 타입 | 설명 | 언제 사용하는가 | 예제 |
|----------|------|----------------|------|
| **Nullable\<T\>** | T에 null 허용 | DB null, 명시적 null 처리 | `Nullable<string>` → `string \| null` |
| **Maybe\<T\>** | T에 null, undefined 허용 | 외부 라이브러리, 옵셔널 체이닝 | `Maybe<User>` → `User \| null \| undefined` |
| **ValueOf\<T\>** | 객체의 값 타입 유니온 | 상수 객체, enum 대체 | `ValueOf<{a:1, b:2}>` → `1 \| 2` |
| **KeysOfType\<T,U\>** | U 타입인 키만 추출 | 특정 타입 필드만 선택 | 문자열 필드만, 숫자 필드만 |
| **DeepPartial\<T\>** | 재귀적으로 모두 선택적 | 깊은 업데이트, 설정 병합 | 중첩 객체 부분 수정 |
| **DeepReadonly\<T\>** | 재귀적으로 모두 읽기전용 | 불변 상태, 깊은 불변성 | Redux state, 상수 설정 |
| **Mutable\<T\>** | readonly 제거 | 임시 수정, 내부 구현 | readonly 타입을 수정 가능하게 |
| **RequireAtLeastOne\<T,K\>** | 지정 키 중 최소 하나 필수 | 검색 조건, 연락처 정보 | email 또는 phone 중 하나 |
| **RequireOnlyOne\<T,K\>** | 지정 키 중 정확히 하나만 | 결제 수단, 배타적 옵션 | creditCard XOR paypal |
| **PartialBy\<T,K\>** | 특정 키만 선택적으로 | 업데이트 DTO, 단계별 폼 | 일부 필드만 optional |
| **RequiredBy\<T,K\>** | 특정 키만 필수로 | 초기화 검증, 설정 강제 | 특정 필드만 required |
| **UnionToIntersection\<U\>** | 유니온을 인터섹션으로 | 믹스인, 플러그인 합성 | `A\|B\|C` → `A&B&C` |
| **PromiseType\<T\>** | Promise의 resolve 타입 | API 응답, async 유틸 | `Promise<User>` → `User` |
| **ArrayElement\<T\>** | 배열 요소 타입 | 배열 처리, 제네릭 배열 | `string[]` → `string` |
| **FunctionType\<T\>** | 함수 타입 키만 추출 | 메서드만, API 클라이언트 | 함수인 프로퍼티만 |
| **PlainObject\<T\>** | 함수 제외한 데이터만 | JSON 직렬화, 데이터 전송 | 메서드 제외 데이터만 |
| **Primitive** | 모든 원시 타입 유니온 | 타입 가드, 직렬화 검증 | `string\|number\|boolean\|...` |
| **Falsy** | 모든 falsy 값 유니온 | 기본값 처리, 필터링 | `false\|0\|""\|null\|undefined` |
| **Opaque\<T,Token\>** | 명목적 타입 구현 | ID 구분, 단위 구분, 보안 | UserId vs ProductId |
| **Brand\<T,FlavorT\>** | 브랜드 타입 생성 | 검증된 값, 도메인 모델 | Email (검증된 string) |

---

## 커스텀 헬퍼 타입 만들기

프로젝트별로 필요한 헬퍼 타입을 만드는 예제

```typescript
// 1. 날짜 타입 (Date vs string 구분)
type DateString = Brand<string, "DateString">; // ISO 8601
type Timestamp = Brand<number, "Timestamp">; // Unix timestamp

// 2. 안전한 인덱스
type SafeIndex<T extends readonly any[]> = 
  number extends T["length"] ? number : Exclude<keyof T, keyof any[]>;

// 3. 재귀 깊이 제한
type DeepPartialMax<T, Depth extends number = 3> = 
  Depth extends 0
    ? T
    : {
        [P in keyof T]?: T[P] extends object
          ? DeepPartialMax<T[P], Prev[Depth]>
          : T[P];
      };

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// 4. 오류 결과 타입 (Result pattern)
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 5. 옵셔널 속성만 추출
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

type Optional<T> = Pick<T, OptionalKeys<T>>;

// 6. 필수 속성만 추출
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type RequiredOnly<T> = Pick<T, RequiredKeys<T>>;

// 7. 함수 타입의 첫 번째 인자
type FirstParameter<T extends (...args: any[]) => any> = 
  Parameters<T>[0];

// 8. 함수 타입의 마지막 인자
type LastParameter<T extends (...args: any[]) => any> = 
  Parameters<T> extends [...any[], infer L] ? L : never;

// 9. 객체에서 특정 값 타입 제거
type OmitByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? never : K]: T[K];
};

// 10. 깊은 Nullable
type DeepNullable<T> = {
  [P in keyof T]: T[P] extends object 
    ? DeepNullable<T[P]> | null
    : T[P] | null;
};
```

---

## 자주 사용하는 패턴

### 1. 타입 안전한 ID 관리

```typescript
// ID 타입 정의
type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;
type CommentId = Brand<string, "CommentId">;

// ID 생성 함수
function generateId<T extends string>(prefix: string) {
  return (id: string = crypto.randomUUID()): Brand<string, T> => {
    return `${prefix}_${id}` as Brand<string, T>;
  };
}

const createUserId = generateId<"UserId">("user");
const createPostId = generateId<"PostId">("post");

// 사용
const userId = createUserId();
const postId = createPostId();
```

### 2. 폼 상태와 검증

```typescript
// 기본 폼 타입
interface FormData {
  email?: string;
  password?: string;
  name?: string;
}

// 검증된 폼
type ValidatedEmail = Brand<string, "ValidatedEmail">;
type ValidatedPassword = Brand<string, "ValidatedPassword">;

interface ValidatedFormData {
  email: ValidatedEmail;
  password: ValidatedPassword;
  name: string;
}

// 부분적 검증 상태
type FormState<T> = DeepPartial<T> & {
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
};
```

### 3. API 응답 처리

```typescript
// API 응답 래퍼
type ApiResponse<T> = Result<T, {
  code: number;
  message: string;
}>;

// 페이지네이션
interface Paginated<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
}

type PaginatedResponse<T> = ApiResponse<Paginated<T>>;

// 사용
async function fetchUsers(page: number): Promise<PaginatedResponse<User>> {
  // ...
  return { success: true, data: { data: [], page, totalPages: 10, totalItems: 100 } };
}
```

### 4. 상태 머신

```typescript
type State<T extends string, Data = {}> = {
  status: T;
} & Data;

type LoadingState<T> =
  | State<"idle">
  | State<"loading">
  | State<"success", { data: T }>
  | State<"error", { error: string }>;

// 사용
type UserState = LoadingState<User>;

const state: UserState = { status: "loading" };

if (state.status === "success") {
  console.log(state.data); // 타입 안전
}
```

---

## 마치며

헬퍼 타입은 TypeScript의 타입 시스템을 최대한 활용하여 더 안전하고 표현력 있는 코드를 작성하게 해준다. 내장 유틸리티 타입과 함께 사용하면 복잡한 도메인 로직도 타입 레벨에서 표현할 수 있다.

**핵심 포인트:**
- **Null 처리**: `Nullable`, `Maybe`, `NonNullable`
- **깊은 변환**: `DeepPartial`, `DeepReadonly`
- **조건부 필수**: `RequireAtLeastOne`, `RequireOnlyOne`, `PartialBy`, `RequiredBy`
- **타입 추출**: `ValueOf`, `KeysOfType`, `ArrayElement`, `PromiseType`
- **명목적 타입**: `Opaque`, `Brand`로 동일 구조 다른 의미 타입 구분
- **필터링**: `FunctionType`, `PlainObject`, `Primitive`, `Falsy`

이러한 헬퍼 타입들을 프로젝트의 `types/helpers.ts` 같은 파일에 정의하여 재사용하면, 타입 안전성을 크게 높이고 버그를 사전에 방지할 수 있다.
