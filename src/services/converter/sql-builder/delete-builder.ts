import type {
  SqlDeleteStatement,
  SqlExpression,
} from "../ast/sql";


export class DeleteBuilder {

  private whereExpression?: SqlExpression;


  constructor(
    private readonly table: string,
  ) {}



  where(
    expression?: SqlExpression,
  ): this {

    this.whereExpression = expression;

    return this;
  }



  build(): SqlDeleteStatement {

    return {

      type: "DeleteStatement",

      table: this.table,

      where: this.whereExpression,

    };

  }

}