// Objectives: Learn how to use JSON.parse in TypeScript.

import { Equal, Expect } from "..";

export const orderDetails: {
  orderId: string;
  quantity: number;
  price: number;
} = JSON.parse('{"orderId": "ORD456", "quantity": 3, "price": 29.99}');



type test = Expect< // 내부 결과가 true면 컴파일 통과
  Equal< // A와 B 타입이 완전히 동일한지 비교 > boolean 결과 반환
    typeof orderDetails,
    {
      orderId: string;
      quantity: number;
      price: number;
    }
  >
>;
