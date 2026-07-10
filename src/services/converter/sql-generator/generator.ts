import type {
  StatementNode,
  SqlDialect
} from "./types";


import {
  GeneratorContext
} from "./base-generator";


import {
  StatementVisitor
} from "./visitors/statement-visitor";



export interface GeneratedSQL {

  sql:string;

  parameters:unknown[];

}



export class SqlGenerator {


  generate(
    statement:StatementNode,
    dialect:SqlDialect
  ):GeneratedSQL {


    const context =
      new GeneratorContext(
        dialect
      );


    const visitor =
      new StatementVisitor(
        context
      );


    const sql =
      visitor.visit(statement);



    return {

      sql,

      parameters:
        context.parameters

    };

  }

}