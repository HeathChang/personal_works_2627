# TypeScript 특수 타입 (Special Types)

## any
모든 타입을 허용하는 타입. 타입 체크를 완전히 우회한다.

```typescript
let value: any = "hello";
value = 42;        // OK
value = true;      // OK
value.foo.bar;     // 컴파일 에러 없음 (런타임 에러 가능)
```

## unknown
모든 타입을 받을 수 있지만, 사용하기 전에 타입 체크가 필요하다. `any`보다 안전한 대안이다.

```typescript
let value: unknown = "hello";
// value.toUpperCase(); // 에러: 타입 체크 필요
if (typeof value === "string") {
  value.toUpperCase(); // OK
}
```

## never
절대 발생할 수 없는 값의 타입. 함수가 절대 반환하지 않거나, 모든 타입의 하위 타입이다.

```typescript
function throwError(): never {
  throw new Error("error");
}

function infiniteLoop(): never {
  while (true) {}
}
```

---

## 헷갈리는 부분 정리

### 1. any vs unknown - 언제 무엇을 사용해야 할까?

**❌ 나쁜 예 (any 사용)**
```typescript
function processData(data: any) {
  return data.value.toUpperCase(); // 런타임 에러 가능
}
```

**✅ 좋은 예 (unknown 사용)**
```typescript
function processData(data: unknown) {
  if (typeof data === "object" && data !== null && "value" in data) {
    if (typeof data.value === "string") {
      return data.value.toUpperCase(); // 안전
    }
  }
  throw new Error("Invalid data");
}
```

**핵심 차이점:**
- `any`: 타입 체크를 완전히 우회 → 타입 안전성 포기
- `unknown`: 타입 체크를 강제 → 타입 안전성 보장

**사용 가이드:**
- 가능한 한 `unknown`을 사용하라
- `any`는 마이그레이션 중이나 외부 라이브러리와의 호환성 문제가 있을 때만 사용

---

### 2. never vs void - 차이점은?

**void**
- 함수가 값을 반환하지 않음을 나타냄
- `undefined`를 반환할 수 있음

```typescript
function logMessage(): void {
  console.log("Hello");
  // 암묵적으로 undefined 반환
}
```

**never**
- 함수가 절대 반환하지 않음을 나타냄
- 예외를 던지거나 무한 루프인 경우

```typescript
function throwError(): never {
  throw new Error("error");
  // 여기 도달할 수 없음
}

function infiniteLoop(): never {
  while (true) {}
  // 여기 도달할 수 없음
}
```

**핵심 차이점:**
- `void`: 함수가 정상 종료되지만 반환값이 없음
- `never`: 함수가 절대 종료되지 않거나 예외로 종료됨

---

### 3. unknown 사용 시 타입 가드 필수

**❌ 에러 발생**
```typescript
let userInput: unknown;
let userName: string;

userName = userInput; // 에러: unknown은 string에 할당할 수 없음
```

**✅ 타입 가드 사용**
```typescript
let userInput: unknown;
let userName: string;

if (typeof userInput === "string") {
  userName = userInput; // OK: 타입 가드로 string임을 확인
}
```

**타입 가드 방법:**
- `typeof` 연산자
- `instanceof` 연산자
- `in` 연산자
- 커스텀 타입 가드 함수

---

### 4. never의 실제 사용 사례

**1) Exhaustive Check (완전성 검사)**
```typescript
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 2;
    case "square":
      return 4;
    case "triangle":
      return 3;
    default:
      const _exhaustive: never = shape; // 모든 케이스 처리 확인
      throw new Error(`Unhandled shape: ${_exhaustive}`);
  }
}
```

**2) 타입에서 특정 케이스 제외**
```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type Example = NonNullable<string | null | undefined>; // string
```

**3) Union 타입에서 특정 타입 제거**
```typescript
type Exclude<T, U> = T extends U ? never : T;

type Example = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
```

---

### 5. any의 위험성과 unknown으로 대체하기

**❌ any 사용 시 문제점**
```typescript
function parseJSON(json: string): any {
  return JSON.parse(json);
}

const data = parseJSON('{"name": "John"}');
console.log(data.name.toUpperCase()); // 런타임 에러 가능 (data.name이 undefined일 수 있음)
```

**✅ unknown으로 안전하게 처리**
```typescript
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

const data = parseJSON('{"name": "John"}');
if (typeof data === "object" && data !== null && "name" in data) {
  if (typeof data.name === "string") {
    console.log(data.name.toUpperCase()); // 안전
  }
}
```

**또는 타입 단언 사용 (신중하게)**
```typescript
interface User {
  name: string;
}

const data = parseJSON('{"name": "John"}') as User;
console.log(data.name.toUpperCase()); // 타입 단언 사용 (데이터 구조를 확신할 때만)
```

---

## 요약

| 타입 | 용도 | 타입 안전성 | 사용 시기 |
|------|------|------------|----------|
| `any` | 모든 타입 허용 | ❌ 없음 | 가능한 한 피하기 |
| `unknown` | 타입을 모를 때 | ✅ 있음 (타입 가드 필요) | 외부 데이터 처리 시 |
| `never` | 절대 발생하지 않는 값 | ✅ 있음 | 완전성 검사, 타입 조작 |

**핵심 원칙:**
1. `any`는 최후의 수단으로만 사용
2. 타입을 모를 때는 `unknown` 사용
3. `unknown` 사용 시 반드시 타입 가드로 검증
4. `never`는 타입 시스템의 완전성을 보장하는 데 유용
