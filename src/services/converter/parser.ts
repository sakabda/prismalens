import { tokenize } from "./tokenizer";
import { ASTBuilder } from "./ast-builder";

import type { QueryNode } from "./ast/prisma";

export function parsePrismaQuery(
  input: string,
): QueryNode | null {

  try {
    const tokens = tokenize(input);

    console.log(JSON.stringify(tokens, null, 2));

    const builder = new ASTBuilder(tokens);

    const ast = builder.build();

    console.log("AST");
    console.log(ast);

    return ast;

  } catch (e) {
    console.error(e);
    return null;
  }
}