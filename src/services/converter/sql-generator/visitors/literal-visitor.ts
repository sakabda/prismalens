import type {
  SqlLiteral,
} from "../../ast/sql";


import type {
  GeneratorContext,
} from "../types";



export class LiteralVisitor {


  constructor(
    private readonly context: GeneratorContext,
  ) {}



  visit(
    node: SqlLiteral,
  ): string {


    return this.context.nextParameter(
      node.value,
    );

  }

}