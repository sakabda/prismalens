import {
  SqlGenerator,
  GeneratedSQL
} from "./generator";


import type {
  StatementNode,
  SqlDialect
} from "./types";



export class SQLGenerator {


  private readonly generator =
    new SqlGenerator();



  constructor(
    private readonly dialect:SqlDialect
  ){}



  generate(
    statement:StatementNode
  ):GeneratedSQL {


    return this.generator.generate(
      statement,
      this.dialect
    );

  }

}