# TypeScript 객체 타입 (Object Types)

## Object Type
객체의 구조를 정의하는 타입. 프로퍼티와 메서드를 명시한다.

```typescript
// 인라인 객체 타입
let user: { name: string; age: number } = {
  name: "John",
  age: 25
};

// 인터페이스로 정의
interface User {
  name: string;
  age: number;
}

// 타입 별칭으로 정의
type User = {
  name: string;
  age: number;
};
```

## Record Type
키-값 쌍을 나타내는 유틸리티 타입. `Record<Keys, Type>` 형태로 사용한다.

```typescript
// Record<string, number>는 { [key: string]: number }와 동일
let scores: Record<string, number> = {
  math: 90,
  english: 85
};

// 특정 키 타입 지정
type Status = "pending" | "approved" | "rejected";
let statusMap: Record<Status, string> = {
  pending: "대기 중",
  approved: "승인됨",
  rejected: "거부됨"
};
```

## Tuple Type
고정된 길이와 순서를 가진 배열 타입. 각 인덱스의 타입이 정해진다.

```typescript
let coordinates: [number, number] = [10, 20];
let userInfo: [string, number, boolean] = ["John", 25, true];

// 옵셔널 요소
let optionalTuple: [string, number?] = ["hello"];
```

## Array Type
동일한 타입의 요소를 가진 배열. 길이와 순서 제약이 없다.

```typescript
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["John", "Jane"];

// 읽기 전용 배열
let readonlyNumbers: readonly number[] = [1, 2, 3];
```

---

## 각 타입의 차이점

### Object Type vs Record Type

**Object Type**
- **구조**: 정적인 프로퍼티 이름과 타입이 명확히 정의됨
- **키**: 고정된 프로퍼티 이름 (예: `name`, `age`)
- **사용 시기**: 객체의 구조를 미리 알고 있을 때
- **타입 안전성**: 프로퍼티 이름 오타 시 컴파일 에러

```typescript
interface User {
  name: string;
  age: number;
}

let user: User = {
  name: "John",
  age: 25
  // email: "..." // 에러: 정의되지 않은 프로퍼티
};
```

**Record Type**
- **구조**: 동적인 키를 가진 객체
- **키**: 런타임에 결정되거나 제한된 키 타입
- **사용 시기**: 키가 동적이거나 특정 키 타입으로 제한할 때
- **타입 안전성**: 키 타입이 제한되어 있을 때 안전

```typescript
// 동적 키
let config: Record<string, string> = {
  apiUrl: "https://api.example.com",
  timeout: "5000"
  // 어떤 키든 추가 가능
};

// 제한된 키 타입
type Status = "pending" | "approved" | "rejected";
let statusMap: Record<Status, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "거부"
  // 다른 키는 추가 불가
};
```

**핵심 차이:**
- `Object Type`: 정적 구조, 명확한 프로퍼티 이름
- `Record`: 동적 키 또는 제한된 키 타입

---

### Tuple vs Array

**Tuple**
- **길이**: 고정됨 (예: `[number, number]`는 항상 2개)
- **타입**: 각 인덱스마다 다른 타입 가능
- **순서**: 중요함 (위치에 따라 타입이 다름)
- **사용 시기**: 구조가 명확하고 고정된 데이터

```typescript
let coordinates: [number, number] = [10, 20];
// coordinates = [10, 20, 30]; // 에러: 길이 초과
// coordinates = ["10", 20]; // 에러: 첫 번째 요소는 number여야 함

let userInfo: [string, number, boolean] = ["John", 25, true];
// 순서가 중요: [name, age, isActive]
```

**Array**
- **길이**: 가변적 (0개 이상)
- **타입**: 모든 요소가 동일한 타입
- **순서**: 중요하지만 타입은 동일
- **사용 시기**: 동일한 타입의 요소들의 컬렉션

```typescript
let numbers: number[] = [1, 2, 3];
numbers.push(4); // OK: 길이 제한 없음
numbers = []; // OK: 빈 배열도 가능

let names: string[] = ["John", "Jane", "Bob"];
// 모든 요소가 string 타입
```

**핵심 차이:**
- `Tuple`: 고정 길이, 다양한 타입, 순서 중요
- `Array`: 가변 길이, 동일 타입, 순서는 중요하지만 타입은 동일

---

### Object Type vs Tuple vs Array

**Object Type**
- **접근 방식**: 프로퍼티 이름으로 접근 (`user.name`)
- **구조**: 명명된 프로퍼티
- **타입**: 각 프로퍼티마다 다른 타입 가능

```typescript
interface User {
  name: string;
  age: number;
  isActive: boolean;
}

let user: User = { name: "John", age: 25, isActive: true };
console.log(user.name); // "John"
```

**Tuple**
- **접근 방식**: 인덱스로 접근 (`userInfo[0]`)
- **구조**: 위치 기반
- **타입**: 각 인덱스마다 다른 타입 가능

```typescript
let userInfo: [string, number, boolean] = ["John", 25, true];
console.log(userInfo[0]); // "John"
// 구조 분해 가능
const [name, age, isActive] = userInfo;
```

**Array**
- **접근 방식**: 인덱스로 접근 (`names[0]`)
- **구조**: 위치 기반
- **타입**: 모든 요소가 동일한 타입

```typescript
let names: string[] = ["John", "Jane", "Bob"];
console.log(names[0]); // "John"
// 모든 요소가 string 타입
```

**비교표:**

| 특징 | Object Type | Tuple | Array |
|------|-------------|-------|-------|
| 접근 방식 | 프로퍼티 이름 | 인덱스 | 인덱스 |
| 구조 | 명명된 프로퍼티 | 위치 기반 | 위치 기반 |
| 길이 | 고정 (프로퍼티 수) | 고정 | 가변 |
| 타입 다양성 | 프로퍼티마다 다름 | 인덱스마다 다름 | 모두 동일 |
| 가독성 | 높음 (의미 있는 이름) | 중간 (위치 의존) | 중간 (위치 의존) |

---

## 헷갈리는 부분 정리

### 1. Object Type vs Record Type - 언제 무엇을 사용할까?

**Object Type (인터페이스/타입 별칭)**
- 구조가 명확하고 고정된 프로퍼티가 있을 때
- 각 프로퍼티의 이름과 타입을 정확히 알고 있을 때

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

let user: User = {
  name: "John",
  age: 25,
  email: "john@example.com"
};
```

**Record Type**
- 동적인 키를 가진 객체일 때
- 키의 타입이 제한되어 있을 때 (예: 특정 문자열 리터럴 유니온)

```typescript
// 동적 키
let config: Record<string, string> = {
  apiUrl: "https://api.example.com",
  timeout: "5000"
};

// 제한된 키 타입
type Status = "pending" | "approved" | "rejected";
let statusMessages: Record<Status, string> = {
  pending: "대기 중",
  approved: "승인됨",
  rejected: "거부됨"
};
```

**핵심 차이점:**
- `Object Type`: 정적인 구조, 명확한 프로퍼티 이름
- `Record`: 동적인 키, 키 타입 제한 가능

---

### 2. Tuple vs Array - 언제 무엇을 사용할까?

**Tuple**
- 고정된 길이와 순서가 중요할 때
- 각 위치의 타입이 다를 때
- 예: 좌표, 함수의 여러 반환값

```typescript
// 좌표: 항상 [x, y] 두 개의 숫자
let point: [number, number] = [10, 20];

// 함수의 여러 반환값
function getUserInfo(): [string, number, boolean] {
  return ["John", 25, true];
}

const [name, age, isActive] = getUserInfo();
```

**Array**
- 길이가 가변적일 때
- 모든 요소가 같은 타입일 때
- 예: 리스트, 컬렉션

```typescript
// 사용자 목록: 개수 제한 없음
let users: string[] = ["John", "Jane", "Bob"];

// 숫자 배열
let scores: number[] = [90, 85, 92, 88];
```

**❌ 잘못된 사용 예**
```typescript
// Tuple을 Array처럼 사용 (길이 제한 없음)
let coordinates: [number, number] = [10, 20, 30]; // 에러!

// Array를 Tuple처럼 사용 (타입 안전성 부족)
let userInfo: (string | number | boolean)[] = ["John", 25, true];
// 구조적 타이핑으로 인해 순서가 바뀌어도 에러 없음
```

**✅ 올바른 사용**
```typescript
// Tuple: 구조가 명확하고 고정됨
let userInfo: [string, number, boolean] = ["John", 25, true];

// Array: 동일한 타입의 요소들
let names: string[] = ["John", "Jane"];
```

---

### 3. readonly Array vs Tuple - 차이점은?

**readonly Array**
- 배열의 요소를 읽기 전용으로 만듦
- 길이는 가변적, 타입은 동일

```typescript
let readonlyNumbers: readonly number[] = [1, 2, 3];
// readonlyNumbers.push(4); // 에러: 읽기 전용
// readonlyNumbers[0] = 10; // 에러: 읽기 전용
```

**Tuple**
- 길이와 타입이 고정됨
- 기본적으로 수정 가능 (readonly 추가 가능)

```typescript
let tuple: [number, string] = [1, "hello"];
tuple[0] = 2; // OK
tuple[1] = "world"; // OK

// readonly Tuple
let readonlyTuple: readonly [number, string] = [1, "hello"];
// readonlyTuple[0] = 2; // 에러: 읽기 전용
```

**핵심 차이점:**
- `readonly Array`: 길이 가변, 타입 동일, 읽기 전용
- `Tuple`: 길이 고정, 타입 다양, 기본 수정 가능

---

### 4. Record vs Index Signature - 차이점은?

**Record**
- 유틸리티 타입으로 더 명확한 표현
- 키 타입을 제한할 수 있음

```typescript
// Record<string, number>
let scores: Record<string, number> = {
  math: 90,
  english: 85
};

// 제한된 키 타입
type Status = "pending" | "approved";
let statusMap: Record<Status, string> = {
  pending: "대기",
  approved: "승인"
};
```

**Index Signature**
- 인라인으로 직접 정의
- 더 유연하지만 덜 명확할 수 있음

```typescript
// Index Signature
let scores: { [key: string]: number } = {
  math: 90,
  english: 85
};

// 제한된 키 타입 (문자열 리터럴)
let statusMap: { [key in "pending" | "approved"]: string } = {
  pending: "대기",
  approved: "승인"
};
```

**언제 무엇을 사용할까?**
- `Record`: 간결하고 명확한 표현 선호 시
- `Index Signature`: 더 복잡한 타입 정의가 필요할 때

---

### 5. Object Type의 구조적 타이핑 (Structural Typing)

**TypeScript는 구조적 타이핑을 사용한다**

```typescript
interface Point {
  x: number;
  y: number;
}

interface NamedPoint {
  x: number;
  y: number;
  name: string;
}

let point: Point = { x: 1, y: 2 };
let namedPoint: NamedPoint = { x: 1, y: 2, name: "origin" };

// NamedPoint는 Point의 모든 프로퍼티를 포함하므로 할당 가능
point = namedPoint; // OK: 구조적 타이핑

// 반대는 불가능 (name 프로퍼티가 없음)
// namedPoint = point; // 에러
```

**헷갈리는 부분:**
- TypeScript는 "덕 타이핑"을 사용: 필요한 프로퍼티가 있으면 타입이 맞다고 봄
- Java/C#의 명목적 타이핑과 다름

---

### 6. Array vs Array-like Objects

**Array**
- 실제 배열 객체
- 배열 메서드 사용 가능

```typescript
let arr: number[] = [1, 2, 3];
arr.push(4); // OK
arr.length; // OK
```

**Array-like Objects**
- 배열처럼 보이지만 배열이 아님
- `length` 프로퍼티와 숫자 인덱스만 있음

```typescript
// 함수의 arguments 객체
function test() {
  // arguments는 Array-like
  // arguments.push(4); // 에러: push 메서드 없음
}

// Array-like를 Array로 변환
function test() {
  let args: number[] = Array.from(arguments);
  args.push(4); // OK
}
```

---

## 요약

| 타입 | 용도 | 특징 |
|------|------|------|
| **Object Type** | 정적인 구조의 객체 | 명확한 프로퍼티 이름과 타입 |
| **Record** | 동적인 키를 가진 객체 | 키 타입 제한 가능 |
| **Tuple** | 고정된 길이와 순서 | 각 인덱스 타입이 다를 수 있음 |
| **Array** | 가변 길이의 동일 타입 요소 | 길이 제한 없음 |

**핵심 원칙:**
1. 구조가 명확하면 `Object Type` (인터페이스/타입 별칭)
2. 동적 키가 필요하면 `Record`
3. 고정된 길이와 순서가 중요하면 `Tuple`
4. 가변 길이의 동일 타입이면 `Array`
5. TypeScript는 구조적 타이핑을 사용함을 기억하자
