// Objectives: discriminated unions

import { Equal, Expect } from "..";

// 제네릭 타입 파라미터: T와 U는 제네릭 타입 파라미터로, 호출 시 전달된 타입에 따라 결정된다.
export function getByIndex<T, U>(index: 0 | 1, first: T, second: U): T | U {
  return index === 0 ? first : second;
}

// ✅ Valid usage:
const value1 = getByIndex(0, true, false);
type test1 = Expect<Equal<typeof value1, true | false>>;

const value2 = getByIndex(1, 1, 2);
type test2 = Expect<Equal<typeof value2, 1 | 2>>;

const value3 = getByIndex(0, 2, "example string");
type test3 = Expect<Equal<typeof value3, 2 | "example string">>;

const value4 = getByIndex(1, true, 7);
type test4 = Expect<Equal<typeof value4, true | 7>>;
