# TypeScript 유틸리티 타입 (Utility Types)

TypeScript는 타입 변환을 쉽게 하기 위한 여러 유틸리티 타입을 제공한다. 이들은 기존 타입을 변형하여 새로운 타입을 만드는 데 사용된다.

---

## 1. Partial\<T\>

모든 프로퍼티를 선택적(optional)으로 만든다.

### 설명
- 타입 `T`의 모든 프로퍼티를 `?` 수식어를 붙인 것처럼 변환
- 객체의 일부만 업데이트할 때 유용

### 언제 사용하는가?
- **업데이트 함수**: 기존 객체의 일부 필드만 수정할 때
- **옵션 객체**: 설정 객체에서 모든 옵션이 선택적일 때
- **폼 초기값**: 폼이 비어있거나 부분적으로만 채워진 상태일 때
- **PATCH API**: REST API에서 부분 업데이트를 처리할 때

### 예제

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

// 모든 필드가 선택적이 됨
type PartialUser = Partial<User>;
// 결과: { id?: string; name?: string; email?: string; age?: number; }

// 실사용 예: 업데이트 함수
function updateUser(id: string, updates: Partial<User>) {
  // updates는 일부 필드만 포함해도 됨
  console.log(`Updating user ${id}`, updates);
}

updateUser("123", { name: "John" }); // ✅ 일부만 전달 가능
updateUser("456", { email: "new@email.com", age: 30 }); // ✅
```

---

## 2. Required\<T\>

모든 프로퍼티를 필수(required)로 만든다.

### 설명
- `Partial<T>`의 반대 개념
- 선택적 프로퍼티를 모두 필수로 변환

### 언제 사용하는가?
- **설정 검증**: 선택적 설정을 모두 필수로 만들어 완전한 설정 객체를 보장할 때
- **초기화 함수**: 모든 필드가 반드시 제공되어야 하는 초기화 로직에서
- **엄격한 검증**: 옵션 객체를 받아서 기본값을 채운 후 완전한 객체로 사용할 때
- **타입 가드**: 런타임에서 모든 필드가 존재함을 보장한 후 타입으로 사용할 때

### 예제

```typescript
interface Config {
  host?: string;
  port?: number;
  timeout?: number;
}

// 모든 필드가 필수가 됨
type RequiredConfig = Required<Config>;
// 결과: { host: string; port: number; timeout: number; }

function startServer(config: RequiredConfig) {
  // 모든 설정이 반드시 존재함이 보장됨
  console.log(`Server starting at ${config.host}:${config.port}`);
}

// startServer({ host: "localhost" }); // ❌ 에러: port, timeout 필요
startServer({ host: "localhost", port: 3000, timeout: 5000 }); // ✅
```

---

## 3. Readonly\<T\>

모든 프로퍼티를 읽기 전용(readonly)으로 만든다.

### 설명
- 객체가 생성된 후 수정할 수 없게 만듦
- 불변성(immutability)을 보장할 때 유용

### 언제 사용하는가?
- **불변 데이터**: Redux state, React props처럼 변경하면 안 되는 데이터
- **상수 객체**: 애플리케이션 전역에서 사용하는 설정 상수
- **순수 함수**: 함수가 입력 객체를 변경하지 않음을 보장할 때
- **API 응답**: 서버로부터 받은 데이터를 실수로 수정하는 것을 방지할 때

### 예제

```typescript
interface Point {
  x: number;
  y: number;
}

const point: Readonly<Point> = { x: 10, y: 20 };

// point.x = 30; // ❌ 에러: 읽기 전용 프로퍼티에 할당할 수 없음

// 불변 데이터 반환
function createImmutableUser(name: string, age: number): Readonly<User> {
  return Object.freeze({ id: "123", name, email: "test@test.com", age });
}

const user = createImmutableUser("John", 25);
// user.age = 26; // ❌ 에러
```

---

## 4. Pick\<T, K\>

타입 `T`에서 특정 프로퍼티 `K`만 선택한다.

### 설명
- 원본 타입에서 필요한 프로퍼티만 골라서 새로운 타입을 만듦
- `K`는 `T`의 키 유니온 타입이어야 함

### 언제 사용하는가?
- **API 응답 최적화**: 전체 객체 중 일부 필드만 클라이언트에 전송할 때
- **컴포넌트 Props**: 큰 객체에서 컴포넌트에 필요한 일부만 전달할 때
- **DTO 생성**: 도메인 모델에서 특정 필드만 포함하는 Data Transfer Object 만들 때
- **미리보기/요약**: 목록 화면에서 상세 정보의 일부만 보여줄 때

### 예제

```typescript
interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

// id와 title만 선택
type ArticlePreview = Pick<Article, "id" | "title">;
// 결과: { id: string; title: string; }

// 실사용 예: API 응답에서 일부만 반환
function getArticlePreviews(): ArticlePreview[] {
  return [
    { id: "1", title: "TypeScript Basics" },
    { id: "2", title: "Advanced Types" }
  ];
}

// 여러 필드 선택
type ArticleMeta = Pick<Article, "author" | "createdAt" | "updatedAt">;
```

---

## 5. Omit\<T, K\>

타입 `T`에서 특정 프로퍼티 `K`를 제외한다.

### 설명
- `Pick<T, K>`의 반대 개념
- 원본 타입에서 특정 프로퍼티를 제거한 새로운 타입을 만듦
- 많은 프로퍼티 중 일부만 제외할 때 `Pick`보다 편리

### 언제 사용하는가?
- **민감 정보 제거**: password, token 같은 민감한 필드를 제외한 공개 타입 만들 때
- **자동 생성 필드 제외**: id, createdAt, updatedAt 같은 서버 생성 필드를 입력 타입에서 제외
- **폼 입력 타입**: 데이터베이스 모델에서 사용자가 입력하지 않는 필드 제외
- **상속 타입 수정**: 기존 타입을 상속하되 특정 필드만 다르게 정의할 때

### 예제

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// password 제외 (안전하게 응답 전송)
type PublicUser = Omit<User, "password">;
// 결과: { id: string; name: string; email: string; createdAt: Date; }

// 여러 필드 제외
type UserCreateInput = Omit<User, "id" | "createdAt">;
// 결과: { name: string; email: string; password: string; }

function createUser(input: UserCreateInput): User {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    ...input
  };
}

// 실사용 예
const newUser = createUser({
  name: "John",
  email: "john@example.com",
  password: "secret123"
});
```

---

## 6. Record\<K, T\>

키 타입 `K`와 값 타입 `T`를 갖는 객체 타입을 생성한다.

### 설명
- 인덱스 시그니처의 더 명확한 대안
- 키와 값의 타입을 명시적으로 지정

### 언제 사용하는가?
- **맵/딕셔너리**: 키-값 쌍으로 데이터를 저장하는 객체 타입
- **열거형 매핑**: enum이나 유니온 타입의 각 값에 대응하는 데이터 정의
- **다국어/i18n**: 언어 코드를 키로, 번역 텍스트를 값으로 하는 객체
- **상태 관리**: 상태별 설정이나 UI 정보를 매핑할 때

### 예제

```typescript
// 기본 사용
type Scores = Record<string, number>;

const studentScores: Scores = {
  math: 95,
  english: 88,
  science: 92
};

// 특정 키 타입 지정
type Status = "pending" | "approved" | "rejected";
type StatusInfo = Record<Status, { message: string; color: string }>;

const statusConfig: StatusInfo = {
  pending: { message: "대기 중", color: "yellow" },
  approved: { message: "승인됨", color: "green" },
  rejected: { message: "거부됨", color: "red" }
};

// API 에러 메시지 매핑
type HttpStatus = 400 | 401 | 403 | 404 | 500;
const errorMessages: Record<HttpStatus, string> = {
  400: "잘못된 요청",
  401: "인증 필요",
  403: "접근 거부",
  404: "찾을 수 없음",
  500: "서버 오류"
};
```

---

## 7. Exclude\<T, U\>

타입 `T`에서 타입 `U`에 할당 가능한 모든 속성을 제외한다.

### 설명
- 유니온 타입에서 특정 타입을 제거
- 타입 레벨에서의 필터링

### 언제 사용하는가?
- **유니온 필터링**: 여러 타입 중 특정 타입을 제외하고 싶을 때
- **상태 제한**: 전체 상태 중 특정 상태를 허용하지 않을 때
- **타입 좁히기**: 조건부 로직에서 특정 케이스를 배제할 때
- **권한 관리**: 전체 권한 중 특정 권한을 제외한 타입 정의

### 예제

```typescript
type AllColors = "red" | "blue" | "green" | "yellow" | "black";
type PrimaryColors = "red" | "blue" | "yellow";

// PrimaryColors를 제외한 나머지
type SecondaryColors = Exclude<AllColors, PrimaryColors>;
// 결과: "green" | "black"

// 실사용 예
type AllStatus = "draft" | "published" | "archived" | "deleted";
type ActiveStatus = Exclude<AllStatus, "deleted">;
// 결과: "draft" | "published" | "archived"

function filterActiveItems(status: ActiveStatus) {
  // status는 절대 "deleted"가 될 수 없음
  console.log(status);
}

// 타입에서 특정 값 제외
type T1 = Exclude<string | number | boolean, boolean>;
// 결과: string | number
```

---

## 8. Extract\<T, U\>

타입 `T`에서 타입 `U`에 할당 가능한 속성만 추출한다.

### 설명
- `Exclude<T, U>`의 반대 개념
- 유니온 타입에서 특정 타입만 선택

### 언제 사용하는가?
- **타입 좁히기**: 유니온 타입에서 원하는 타입만 추출할 때
- **이벤트 필터링**: 전체 이벤트 중 특정 카테고리만 처리할 때
- **조건부 타입**: 특정 조건을 만족하는 타입만 선택할 때
- **API 메서드 분류**: HTTP 메서드 중 특정 타입만 허용할 때

### 예제

```typescript
type AllTypes = string | number | boolean | null | undefined;

// string 타입만 추출
type StringOnly = Extract<AllTypes, string>;
// 결과: string

// 여러 타입 추출
type PrimitiveNumbers = Extract<AllTypes, number | boolean>;
// 결과: number | boolean

// 실사용 예
type Events = "click" | "scroll" | "mousemove" | "keydown" | "keyup";
type KeyboardEvents = Extract<Events, `key${string}`>;
// 결과: "keydown" | "keyup"

type MouseEvents = Extract<Events, "click" | "mousemove">;
// 결과: "click" | "mousemove"
```

---

## 9. NonNullable\<T\>

타입 `T`에서 `null`과 `undefined`를 제외한다.

### 설명
- nullable 타입을 non-nullable로 변환
- `Exclude<T, null | undefined>`와 동일

### 언제 사용하는가?
- **타입 가드 후**: null 체크 후 확실하게 값이 있는 타입으로 변환할 때
- **필터링**: 배열에서 null/undefined를 제거한 후 타입 정의
- **옵셔널 체이닝 후**: 값이 존재함을 확인한 후 안전한 타입으로 사용
- **기본값 적용 후**: null/undefined 대신 기본값을 사용하는 경우

### 예제

```typescript
type NullableString = string | null | undefined;

type NonNullString = NonNullable<NullableString>;
// 결과: string

// 실사용 예
function processValue(value: string | null | undefined) {
  if (value) {
    // 이 블록 안에서 value는 string
    const processed: NonNullable<typeof value> = value;
    console.log(processed.toUpperCase());
  }
}

// 배열 필터링
const mixedArray: (number | null | undefined)[] = [1, null, 2, undefined, 3];
const cleanArray: NonNullable<typeof mixedArray[number]>[] = 
  mixedArray.filter((item): item is NonNullable<typeof item> => item != null);
// cleanArray: number[]
```

---

## 10. ReturnType\<T\>

함수 타입 `T`의 반환 타입을 추출한다.

### 설명
- 함수의 반환 타입을 가져옴
- 함수 정의를 보지 않고도 반환 타입 재사용 가능

### 언제 사용하는가?
- **타입 재사용**: 함수 반환값을 다른 곳에서 타입으로 사용할 때
- **API 응답 타입**: API 함수의 응답 타입을 변수나 상태에 적용할 때
- **헬퍼 함수**: 유틸 함수의 결과 타입을 명시적으로 선언할 때
- **타입 추론 활용**: 복잡한 타입을 직접 작성하지 않고 함수로부터 추론할 때

### 예제

```typescript
function getUser() {
  return {
    id: "123",
    name: "John",
    email: "john@example.com"
  };
}

// 함수의 반환 타입 추출
type User = ReturnType<typeof getUser>;
// 결과: { id: string; name: string; email: string; }

// 복잡한 함수
function createResponse(success: boolean, data?: any) {
  return {
    success,
    data,
    timestamp: new Date()
  };
}

type Response = ReturnType<typeof createResponse>;
// 결과: { success: boolean; data?: any; timestamp: Date; }

// 제네릭 함수
function wrapInArray<T>(value: T): T[] {
  return [value];
}

type WrappedString = ReturnType<typeof wrapInArray<string>>;
// 결과: string[]
```

---

## 11. Parameters\<T\>

함수 타입 `T`의 매개변수 타입을 튜플로 추출한다.

### 설명
- 함수의 매개변수 타입들을 튜플 타입으로 가져옴
- 함수 래퍼나 고차 함수 작성 시 유용

### 언제 사용하는가?
- **함수 래퍼**: 기존 함수를 감싸는 래퍼 함수를 만들 때
- **고차 함수**: 함수를 인자로 받아서 동일한 매개변수로 호출할 때
- **데코레이터**: 함수의 매개변수 타입을 유지하면서 기능을 추가할 때
- **타입 안전한 이벤트**: 이벤트 핸들러의 매개변수 타입을 보장할 때

### 예제

```typescript
function createUser(name: string, age: number, email: string) {
  return { name, age, email };
}

// 매개변수 타입을 튜플로 추출
type CreateUserParams = Parameters<typeof createUser>;
// 결과: [name: string, age: number, email: string]

// 실사용 예: 함수 래퍼
function logAndCall<T extends (...args: any[]) => any>(
  fn: T,
  ...args: Parameters<T>
): ReturnType<T> {
  console.log("Calling function with:", args);
  return fn(...args);
}

logAndCall(createUser, "John", 25, "john@example.com");

// API 함수 타입 재사용
function fetchUser(id: string, includeProfile: boolean = false) {
  // ... fetch logic
  return Promise.resolve({ id, profile: includeProfile ? {} : null });
}

type FetchUserArgs = Parameters<typeof fetchUser>;
// 결과: [id: string, includeProfile?: boolean]
```

---

## 12. ConstructorParameters\<T\>

생성자 함수 타입 `T`의 매개변수 타입을 튜플로 추출한다.

### 설명
- 클래스 생성자의 매개변수 타입을 가져옴
- `Parameters<T>`의 클래스 버전

### 언제 사용하는가?
- **팩토리 패턴**: 클래스 인스턴스를 생성하는 팩토리 함수에서
- **의존성 주입**: 생성자의 매개변수를 외부에서 주입할 때
- **클래스 래퍼**: 기존 클래스를 확장하거나 감쌀 때
- **추상 팩토리**: 여러 클래스를 동적으로 생성하는 패턴에서

### 예제

```typescript
class User {
  constructor(
    public name: string,
    public age: number,
    public email?: string
  ) {}
}

// 생성자 매개변수 타입 추출
type UserConstructorParams = ConstructorParameters<typeof User>;
// 결과: [name: string, age: number, email?: string]

// 팩토리 함수 생성
function createUser(...args: ConstructorParameters<typeof User>): User {
  return new User(...args);
}

const user = createUser("John", 25, "john@example.com");

// 내장 클래스도 가능
type DateParams = ConstructorParameters<typeof Date>;
// 결과: [value: string | number | Date] | []
```

---

## 13. InstanceType\<T\>

생성자 함수 타입 `T`의 인스턴스 타입을 추출한다.

### 설명
- 클래스로부터 인스턴스 타입을 가져옴
- 클래스 이름 대신 사용 가능

### 언제 사용하는가?
- **제네릭 팩토리**: 다양한 클래스의 인스턴스 타입을 다룰 때
- **플러그인 시스템**: 동적으로 로드되는 클래스의 인스턴스 타입 정의
- **DI 컨테이너**: 의존성 주입에서 인스턴스 타입을 명시할 때
- **타입 추론**: 클래스를 변수에 저장하고 해당 인스턴스 타입이 필요할 때

### 예제

```typescript
class Dog {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  bark() {
    console.log("Woof!");
  }
}

// 인스턴스 타입 추출
type DogInstance = InstanceType<typeof Dog>;
// 결과: Dog

// 실사용 예: 팩토리 패턴
type Constructor<T = any> = new (...args: any[]) => T;

function createInstance<T extends Constructor>(
  ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new ctor(...args);
}

const dog = createInstance(Dog, "Buddy");
// dog의 타입은 Dog
```

---

## 14. ThisParameterType\<T\>

함수 타입 `T`의 `this` 매개변수 타입을 추출한다.

### 설명
- 명시적 `this` 매개변수의 타입을 가져옴
- `this`가 없으면 `unknown` 반환

### 언제 사용하는가?
- **메서드 타입 분석**: 객체 메서드의 this 컨텍스트를 확인할 때
- **타입 안전한 바인딩**: bind, call, apply 사용 시 this 타입 보장
- **믹스인 패턴**: 여러 클래스를 조합할 때 this 타입 추출
- **메서드 차용**: 한 객체의 메서드를 다른 객체에서 사용할 때

### 예제

```typescript
interface User {
  name: string;
  greet(this: User): void;
}

const user: User = {
  name: "John",
  greet(this: User) {
    console.log(`Hello, I'm ${this.name}`);
  }
};

// this 타입 추출
type UserThisType = ThisParameterType<typeof user.greet>;
// 결과: User

// this가 없는 경우
function regularFunction() {
  return "hello";
}

type NoThis = ThisParameterType<typeof regularFunction>;
// 결과: unknown
```

---

## 15. OmitThisParameter\<T\>

함수 타입 `T`에서 `this` 매개변수를 제거한다.

### 설명
- 명시적 `this` 매개변수가 있는 함수를 일반 함수로 변환
- 함수 바인딩 시 유용

### 언제 사용하는가?
- **함수 바인딩**: bind()로 this를 고정한 함수의 타입 정의
- **콜백 전달**: this가 이미 바인딩된 메서드를 콜백으로 전달할 때
- **이벤트 핸들러**: React 등에서 메서드를 이벤트 핸들러로 사용할 때
- **함수형 프로그래밍**: this 없는 순수 함수로 변환할 때

### 예제

```typescript
interface Counter {
  value: number;
  increment(this: Counter, amount: number): void;
}

const counter: Counter = {
  value: 0,
  increment(this: Counter, amount: number) {
    this.value += amount;
  }
};

// this 제거
type IncrementWithoutThis = OmitThisParameter<typeof counter.increment>;
// 결과: (amount: number) => void

// 바인딩된 함수 생성
const boundIncrement: IncrementWithoutThis = 
  counter.increment.bind(counter);

boundIncrement(5); // this는 이미 바인딩됨
```

---

## 16. Awaited\<T\>

Promise의 resolve 타입을 추출한다.

### 설명
- `Promise<T>`에서 `T`를 추출
- 중첩된 Promise도 재귀적으로 언래핑
- async/await와 함께 사용 시 유용

### 언제 사용하는가?
- **async 함수 반환 타입**: async 함수가 실제로 반환하는 값의 타입
- **API 응답 처리**: Promise를 반환하는 API의 실제 데이터 타입
- **로딩 상태 관리**: 비동기 데이터의 타입을 상태에 저장할 때
- **Promise 체이닝**: 여러 Promise를 연결할 때 최종 결과 타입

### 예제

```typescript
// 기본 Promise
type PromiseString = Promise<string>;
type UnwrappedString = Awaited<PromiseString>;
// 결과: string

// 중첩 Promise
type NestedPromise = Promise<Promise<number>>;
type UnwrappedNumber = Awaited<NestedPromise>;
// 결과: number

// 실사용 예: API 응답
async function fetchUser(id: string) {
  return {
    id,
    name: "John",
    email: "john@example.com"
  };
}

type FetchUserReturn = ReturnType<typeof fetchUser>;
// 결과: Promise<{ id: string; name: string; email: string; }>

type User = Awaited<FetchUserReturn>;
// 결과: { id: string; name: string; email: string; }

// 여러 Promise 처리
type MultiplePromises = [Promise<string>, Promise<number>, Promise<boolean>];
type UnwrappedTuple = {
  [K in keyof MultiplePromises]: Awaited<MultiplePromises[K]>
};
// 결과: [string, number, boolean]
```

---

## 17. Uppercase\<S\>, Lowercase\<S\>, Capitalize\<S\>, Uncapitalize\<S\>

문자열 리터럴 타입을 변환한다.

### 설명
- 문자열 리터럴 타입의 대소문자를 조작
- 템플릿 리터럴 타입과 함께 사용

### 언제 사용하는가?
- **API 규칙**: HTTP 메서드, 상태 코드 등 대소문자가 중요한 경우
- **명명 규칙 변환**: camelCase, PascalCase, snake_case 간 변환
- **코드 생성**: 타입으로부터 함수나 변수명을 자동 생성할 때
- **라우팅**: URL 경로나 쿼리 파라미터의 명명 규칙 적용

### 예제

```typescript
// Uppercase: 모두 대문자로
type Greeting = "hello world";
type LoudGreeting = Uppercase<Greeting>;
// 결과: "HELLO WORLD"

// Lowercase: 모두 소문자로
type ShoutingMessage = "ERROR OCCURRED";
type NormalMessage = Lowercase<ShoutingMessage>;
// 결과: "error occurred"

// Capitalize: 첫 글자만 대문자로
type Command = "start server";
type CapitalizedCommand = Capitalize<Command>;
// 결과: "Start server"

// Uncapitalize: 첫 글자를 소문자로
type ClassName = "MyComponent";
type VariableName = Uncapitalize<ClassName>;
// 결과: "myComponent"

// 실사용 예: HTTP 메서드
type HttpMethod = "get" | "post" | "put" | "delete";
type UppercaseMethod = Uppercase<HttpMethod>;
// 결과: "GET" | "POST" | "PUT" | "DELETE"

// API 엔드포인트 생성
type ApiEndpoint = "users" | "posts" | "comments";
type GetEndpoint = `get${Capitalize<ApiEndpoint>}`;
// 결과: "getUsers" | "getPosts" | "getComments"
```

---

## 유틸리티 타입 조합 예제

여러 유틸리티 타입을 함께 사용하는 실전 예제

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// 1. 생성 입력: id, 날짜 필드 제외
type CreateProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

// 2. 업데이트 입력: id 제외, 나머지는 선택적
type UpdateProductInput = Partial<Omit<Product, "id">>;

// 3. 공개 정보: stock 제외 (민감 정보)
type PublicProduct = Omit<Product, "stock">;

// 4. 목록 미리보기: 일부 필드만
type ProductPreview = Pick<Product, "id" | "name" | "price">;

// 5. 읽기 전용 제품
type ImmutableProduct = Readonly<Product>;

// 6. 상태별 제품 맵
type ProductStatus = "active" | "inactive" | "discontinued";
type ProductsByStatus = Record<ProductStatus, Product[]>;

// 실제 사용
function createProduct(input: CreateProductInput): Product {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...input
  };
}

function updateProduct(id: string, updates: UpdateProductInput): Product {
  // 부분 업데이트 로직
  return {} as Product;
}

function getPublicProducts(): PublicProduct[] {
  // stock 정보 제외하고 반환
  return [];
}
```

---

## 커스텀 유틸리티 타입 만들기

기본 유틸리티 타입을 조합하여 새로운 타입 생성

```typescript
// 1. 특정 필드만 선택적으로 만들기
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

type UserWithOptionalEmail = PartialBy<User, "email">;
// 결과: { id: string; name: string; age: number; email?: string; }

// 2. 특정 필드만 필수로 만들기
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

interface Config {
  host?: string;
  port?: number;
  ssl?: boolean;
}

type ConfigWithRequiredHost = RequiredBy<Config, "host">;
// 결과: { port?: number; ssl?: boolean; host: string; }

// 3. Nullable 타입 만들기
type Nullable<T> = T | null;
type NullableString = Nullable<string>;
// 결과: string | null

// 4. 깊은 Partial (중첩 객체도 선택적으로)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
}

type PartialNestedConfig = DeepPartial<NestedConfig>;
// 모든 중첩 레벨이 선택적이 됨

// 5. 키를 값으로, 값을 키로 (Record 반전)
type ReverseRecord<T extends Record<string, string>> = {
  [K in T[keyof T]]: {
    [P in keyof T]: T[P] extends K ? P : never;
  }[keyof T];
};

type HttpStatusCodes = {
  OK: "200";
  NOT_FOUND: "404";
  SERVER_ERROR: "500";
};

type StatusCodeToName = ReverseRecord<HttpStatusCodes>;
// 결과: { "200": "OK"; "404": "NOT_FOUND"; "500": "SERVER_ERROR"; }
```

---

## 유틸리티 타입 전체 요약표

| 유틸리티 타입 | 설명 | 언제 사용하는가 | 예제 |
|-------------|------|----------------|------|
| **Partial\<T\>** | 모든 프로퍼티를 선택적으로 | 업데이트 함수, 부분 수정 | `Partial<User>` |
| **Required\<T\>** | 모든 프로퍼티를 필수로 | 설정 검증, 완전한 초기화 | `Required<Config>` |
| **Readonly\<T\>** | 모든 프로퍼티를 읽기전용으로 | 불변 데이터, 상수 객체 | `Readonly<Point>` |
| **Pick\<T, K\>** | 특정 프로퍼티만 선택 | API 응답 최적화, DTO | `Pick<User, "id" \| "name">` |
| **Omit\<T, K\>** | 특정 프로퍼티 제외 | 민감정보 제거, 폼 입력 | `Omit<User, "password">` |
| **Record\<K, T\>** | 키-값 쌍 객체 타입 생성 | 맵/딕셔너리, 열거형 매핑 | `Record<string, number>` |
| **Exclude\<T, U\>** | 유니온에서 특정 타입 제외 | 상태 제한, 타입 필터링 | `Exclude<"a"\|"b"\|"c", "a">` |
| **Extract\<T, U\>** | 유니온에서 특정 타입만 추출 | 이벤트 필터링, 타입 좁히기 | `Extract<string\|number, string>` |
| **NonNullable\<T\>** | null, undefined 제외 | null 체크 후, 필터링 | `NonNullable<string \| null>` |
| **ReturnType\<T\>** | 함수의 반환 타입 추출 | API 응답 타입, 타입 재사용 | `ReturnType<typeof getUser>` |
| **Parameters\<T\>** | 함수 매개변수를 튜플로 | 함수 래퍼, 고차 함수 | `Parameters<typeof fn>` |
| **ConstructorParameters\<T\>** | 생성자 매개변수를 튜플로 | 팩토리 패턴, DI | `ConstructorParameters<typeof Date>` |
| **InstanceType\<T\>** | 생성자의 인스턴스 타입 | 제네릭 팩토리, 플러그인 | `InstanceType<typeof MyClass>` |
| **ThisParameterType\<T\>** | 함수의 this 타입 추출 | 메서드 타입 분석, 믹스인 | 명시적 this가 있는 함수용 |
| **OmitThisParameter\<T\>** | 함수에서 this 제거 | 함수 바인딩, 콜백 전달 | 바인딩된 함수 타입용 |
| **Awaited\<T\>** | Promise의 resolve 타입 추출 | async 함수, API 응답 | `Awaited<Promise<string>>` |
| **Uppercase\<S\>** | 문자열을 대문자로 | HTTP 메서드, API 규칙 | `Uppercase<"get">` |
| **Lowercase\<S\>** | 문자열을 소문자로 | 정규화, 비교 | `Lowercase<"GET">` |
| **Capitalize\<S\>** | 첫 글자를 대문자로 | 함수명 생성, PascalCase | `Capitalize<"user">` |
| **Uncapitalize\<S\>** | 첫 글자를 소문자로 | 변수명 생성, camelCase | `Uncapitalize<"User">` |

---

## 자주 사용하는 패턴

### 1. API 응답 처리

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<User>;
type UserListResponse = ApiResponse<User[]>;
```

### 2. 폼 입력 처리

```typescript
// 생성 폼: id, 날짜 제외
type CreateForm<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

// 수정 폼: id 제외, 나머지 선택적
type UpdateForm<T> = Partial<Omit<T, "id">>;
```

### 3. 상태 관리

```typescript
type LoadingState<T> = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

type UserState = LoadingState<User>;
```

### 4. 이벤트 핸들러

```typescript
type EventHandler<T = void> = (event: T) => void;
type ClickHandler = EventHandler<MouseEvent>;
type ChangeHandler = EventHandler<ChangeEvent<HTMLInputElement>>;
```

---

## 마치며

유틸리티 타입은 TypeScript의 강력한 기능 중 하나로, 코드 재사용성과 타입 안정성을 크게 향상시킨다. 기본 유틸리티 타입들을 잘 이해하고 조합하면 복잡한 타입 변환도 쉽게 처리할 수 있다.

**핵심 포인트:**
- 객체 변환: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`
- 유니온 조작: `Exclude`, `Extract`, `NonNullable`
- 함수 관련: `ReturnType`, `Parameters`, `Awaited`
- 문자열 조작: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`
- 맵핑: `Record`

이러한 유틸리티 타입들을 적절히 활용하면 더 안전하고 유지보수하기 쉬운 TypeScript 코드를 작성할 수 있다.
