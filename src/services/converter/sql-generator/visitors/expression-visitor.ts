import type {
  SqlExpression,
  SqlIdentifier,
  SqlLiteral,
  SqlParameter,
  SqlBinaryExpression,
  SqlUnaryExpression,
  SqlFunctionCall,
  SqlArrayExpression,
  SqlRawExpression,
} from "../../ast/sql";


import type {
  GeneratorContext,
} from "../types";


import { IdentifierVisitor } from "./identifier-visitor";
import { LiteralVisitor } from "./literal-visitor";



export class ExpressionVisitor {


  private readonly identifierVisitor: IdentifierVisitor;

  private readonly literalVisitor: LiteralVisitor;



  constructor(
    private readonly context: GeneratorContext,
  ) {

    this.identifierVisitor =
      new IdentifierVisitor(
        context,
      );


    this.literalVisitor =
      new LiteralVisitor(
        context,
      );

  }





  visit(
    node: SqlExpression,
  ): string {


    switch(node.type) {


      case "Identifier":

        return this.visitIdentifier(
          node,
        );



      case "Literal":

        return this.visitLiteral(
          node,
        );



      case "BinaryExpression":

        return this.visitBinary(
          node,
        );



      case "UnaryExpression":

        return this.visitUnary(
          node,
        );



      case "FunctionCall":

        return this.visitFunction(
          node,
        );



      case "ArrayExpression":

        return this.visitArray(
          node,
        );



      case "RawExpression":

        return this.visitRaw(
          node,
        );
      case "Parameter":
  return this.visitParameter(node);


      default:

        throw new Error(
          `Unknown expression type: ${
            (node as any).type
          }`,
        );

    }

  }





  private visitIdentifier(
    node: SqlIdentifier,
  ): string {

    return this.identifierVisitor.visit(
      node,
    );

  }





  private visitLiteral(
    node: SqlLiteral,
  ): string {

    return this.literalVisitor.visit(
      node,
    );

  }





  private visitBinary(
    node: SqlBinaryExpression,
  ): string {


    const left =
      this.visit(
        node.left,
      );


    const right =
      this.visit(
        node.right,
      );


    return (
      `${left} ` +
      `${node.operator} ` +
      `${right}`
    );

  }





  private visitUnary(
    node: SqlUnaryExpression,
  ): string {

    return (
      `${node.operator} ` +
      `${this.visit(node.argument)}`
    );

  }





  private visitFunction(
    node: SqlFunctionCall,
  ): string {


    const args =
      node.arguments
        .map(
          argument =>
            this.visit(argument),
        )
        .join(", ");



    return (
      `${node.name}(${args})`
    );

  }





  private visitArray(
    node: SqlArrayExpression,
  ): string {


    return (
      "(" +
      node.elements
        .map(
          element =>
            this.visit(element),
        )
        .join(", ") +
      ")"
    );

  }





  private visitRaw(
    node: SqlRawExpression,
  ): string {

    return node.value;

  }

  private visitParameter(
  node: SqlParameter,
): string {
  return this.context.dialect.parameter(
    node.index,
  );
}

}