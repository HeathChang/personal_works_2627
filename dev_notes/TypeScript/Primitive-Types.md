# TypeScript 원시 타입 (Primitive Types)

## number
숫자 타입. 정수, 부동소수점, 양수, 음수, Infinity, NaN 등을 포함한다.

```typescript
let age: number = 25;
let price: number = 99.99;
```

## string
문자열 타입. 텍스트 데이터를 나타낸다.

```typescript
let name: string = "John";
let message: string = `Hello, ${name}`;
```

## boolean
논리 타입. true 또는 false 값을 가진다.

```typescript
let isActive: boolean = true;
let isComplete: boolean = false;
```

## null
의도적으로 값이 없음을 나타내는 타입.

```typescript
let data: null = null;
```

## undefined
값이 할당되지 않았음을 나타내는 타입.

```typescript
let value: undefined = undefined;
```

## symbol
ES6에서 도입된 고유하고 불변하는 원시 타입. 객체의 고유한 키로 사용된다.

```typescript
let sym: symbol = Symbol("key");
```

## bigint
ES2020에서 도입된 큰 정수를 나타내는 타입. number 타입의 안전한 범위를 넘어서는 정수를 다룰 수 있다.

```typescript
let bigNumber: bigint = 9007199254740991n;
```
