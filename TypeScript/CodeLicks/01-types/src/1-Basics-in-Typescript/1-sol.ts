// Objectives: Learn how to use Map in TypeScript.

type Book = {
  title: string;
  author: string;
  price: number;
};

//const books = new Map<number, Book>();
const books: Map<number, Book> = new Map();

books.set(1, { title: "book #1", author: "superman", price: 99.99 });

// books.set(2, { title: 123, author: true, price: "200" }); // Not valid because the key is number and the value is Book.
// books.set(3, "taaa daaaa!"); // Not valid because the value is string and the key is number.
