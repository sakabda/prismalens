

import type {
  QueryNode,
  PrismaOperation,
} from "./ast/prisma";

import type {
  ExpressionNode,
  LiteralNode,
  ObjectExpressionNode,
  PropertyNode,
  ArrayExpressionNode,
  IdentifierNode,
  MemberExpressionNode,
  CallExpressionNode,
} from "./ast/expression";

import type { Token } from "./types";

export class ASTBuilder {
  private index = 0;

  private readonly tokens: Token[];

constructor(tokens: Token[]) {
  this.tokens = tokens;
}


  build(): QueryNode | null {
  if (this.tokens.length < 5) {
    return null;
  }

  this.expect("identifier", "prisma");
  this.expect("dot");

  const model =
    this.expect("identifier").value;

  this.expect("dot");

  const operation =
    this.expect("identifier")
      .value as PrismaOperation;

  this.expect("paren_open");

  let args: ObjectExpressionNode = {
    type: "ObjectExpression",
    properties: [],
  };

  if (
    this.peek()?.type !== "paren_close"
  ) {
    args =
      this.parseObjectExpression();
  }

  this.expect("paren_close");

  return {
    type: "Query",
    model,
    operation,
    args: this.objectToArguments(args),
  };
}

  
//   private objectToArguments(
//   node: ObjectExpressionNode,
// ): any {

//   const result: Record<string, any> = {};

//   for (const property of node.properties) {

//     result[property.key.name] =
//       property.value;

//   }

//   return result;
  //   }
  
  private objectToArguments(node: ObjectExpressionNode): any {
  const result: Record<string, any> = {};

  for (const property of node.properties) {
    result[property.key.name] = this.normalizeExpression(property.value);
  }

  return result;
}

private normalizeExpression(node: ExpressionNode): any {
  if (node.type === "ObjectExpression") {
    const obj: Record<string, any> = {};

    for (const prop of node.properties) {
      obj[prop.key.name] = this.normalizeExpression(prop.value);
    }

    return obj;
  }

  if (node.type === "ArrayExpression") {
    return node.elements.map((el) => this.normalizeExpression(el));
  }

  // Leave CallExpression, Literal, Identifier, etc. unchanged
  return node;
}
  
  private parseExpression(): ExpressionNode {

  const token = this.peek();

  if (!token) {
    throw new Error(
      "Unexpected end of input",
    );
  }

  switch (token.type) {

    case "string":

    case "number":

    case "boolean":

    case "null":
      return this.parseLiteral();

    case "brace_open":
      return this.parseObjectExpression();

    case "bracket_open":
      return this.parseArrayExpression();
    case "identifier":
  return this.parseIdentifierOrMember();

    default:
      throw new Error(
        `Unsupported expression ${token.type}`,
      );

  }

  }
 
  

  private parseArrayExpression(): ArrayExpressionNode {

  this.expect("bracket_open");

  const elements: ExpressionNode[] = [];

  while (
    this.peek() &&
    this.peek()!.type !==
      "bracket_close"
  ) {

    elements.push(
      this.parseExpression(),
    );

    if (
      this.peek()?.type === "comma"
    ) {
      this.next();
    }

  }

  this.expect("bracket_close");

  return {

    type: "ArrayExpression",

    elements,

  };

  }
  
  private parseLiteral(): LiteralNode {

  const token =
    this.peek()!;

  this.next();

  switch (token.type) {

    case "string":
      return {
        type: "Literal",
        value: token.value,
      };

    case "number":
      return {
        type: "Literal",
        value: Number(token.value),
      };

    case "boolean":
      return {
        type: "Literal",
        value:
          token.value === "true",
      };

    case "null":
      return {
        type: "Literal",
        value: null,
      };

    default:
      throw new Error(
        "Invalid literal",
      );

  }

}




  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private next() {
    this.index++;
  }

  private expect(
    type: Token["type"],
    value?: string,
  ): Token {
    const token = this.peek();

    if (!token) {
      throw new Error(
        `Unexpected end of input. Expected ${type}`,
      );
    }

    if (token.type !== type) {
      throw new Error(
        `Expected ${type} but found ${token.type}`,
      );
    }

    if (value && token.value !== value) {
      throw new Error(
        `Expected "${value}" but found "${token.value}"`,
      );
    }

    this.next();

    return token;
  }

  
private parseObjectExpression(): ObjectExpressionNode {
  this.expect("brace_open");

  const properties: PropertyNode[] = [];

  while (
    this.peek() &&
    this.peek()!.type !== "brace_close"
  ) {
    properties.push(this.parseProperty());

    if (this.peek()?.type === "comma") {
      this.next();
    }
  }

  this.expect("brace_close");

  return {
    type: "ObjectExpression",
    properties,
  };
}
  
  private parseProperty(): PropertyNode {
  const key: IdentifierNode = {
    type: "Identifier",
    name: this.expect("identifier").value,
  };

  this.expect("colon");

  return {
    type: "Property",
    key,
    value: this.parseExpression(),
  };
  }
  
private parseIdentifierOrMember(): ExpressionNode {
  let expression: ExpressionNode = {
    type: "Identifier",
    name: this.expect("identifier").value,
  };

  // Prisma.raw.foo
  while (this.peek()?.type === "dot") {
    this.next();

    expression = {
      type: "MemberExpression",
      object: expression,
      property: {
        type: "Identifier",
        name: this.expect("identifier").value,
      },
    };
  }

  // uuid()
  // Prisma.raw()
  // crypto.randomUUID()
  while (this.peek()?.type === "paren_open") {
    expression =
      this.finishCallExpression(expression);
  }

  return expression;
}
  
  
  
  private finishCallExpression(
  callee: ExpressionNode,
): CallExpressionNode {

  this.expect("paren_open");

  const args: ExpressionNode[] = [];

  while (
    this.peek() &&
    this.peek()!.type !== "paren_close"
  ) {
    args.push(
      this.parseExpression(),
    );

    if (
      this.peek()?.type === "comma"
    ) {
      this.next();
    }
  }

  this.expect("paren_close");

  return {
    type: "CallExpression",
    callee,
    arguments: args,
  };
}
  

}