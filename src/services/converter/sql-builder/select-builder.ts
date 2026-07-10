import type {
  SqlExpression,
  SqlSelectStatement,
  SqlOrderBy,
} from "../ast/sql";

import { SqlBuilder } from "./builder";


export class SelectBuilder extends SqlBuilder {


  private readonly statement: SqlSelectStatement;



  constructor(
    table: string,
  ) {

    super();

    this.statement =
      this.createSelect(table);

  }



  select(
    ...columns: string[]
  ): this {

    this.statement.columns.push(
      ...columns,
    );

    return this;

  }



  where(
    expression?: SqlExpression,
  ): this {

    this.statement.where =
      expression;

    return this;

  }



  orderBy(
    ...orders: SqlOrderBy[]
  ): this {

    this.statement.orderBy?.push(
      ...orders,
    );

    return this;

  }



  limit(
    value?: number,
  ): this {

    this.statement.limit =
      value;

    return this;

  }



  build(): SqlSelectStatement {

    return this.statement;

  }

}