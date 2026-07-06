// import { tokenize } from "./tokenizer";
// import { ASTBuilder } from "./ast-builder";

// const query = `
// prisma.user.findMany({
//   where: {
//     createdAt: new Date("2025-01-01")
//   }
// })
// `;

// const tokens = tokenize(query);

// console.log("TOKENS");
// console.log(tokens);

// const ast = new ASTBuilder(tokens).build();

// console.log("AST");
// console.dir(ast, { depth: null });

import { tokenize } from "./tokenizer";
import { ASTBuilder } from "./ast-builder";

const query = `
prisma.user.findMany({
  where: {
    id: uuid()
  }
})
`;

const tokens = tokenize(query);

console.log("TOKENS");
console.table(tokens);

const ast = new ASTBuilder(tokens).build();

console.log("AST");
console.dir(ast, { depth: null });