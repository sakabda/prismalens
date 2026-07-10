// ===============================
// Generator Types
// ===============================

export interface GeneratorOptions {

  pretty?: boolean;

  indent?: string;

}



export interface GeneratedSql {

  sql: string;

  parameters: unknown[];

}



export interface GeneratorContext {

  dialect: SqlDialect;


  options: {

    pretty: boolean;

    indent: string;

  };


  parameters: unknown[];


  nextParameter(
    value: unknown,
  ): string;

}



// ===============================
// Dialect
// ===============================

export interface SqlDialect {


  quoteIdentifier(
    identifier: string,
  ): string;



  parameter(
    index: number,
  ): string;



  escapeString(
    value: string,
  ): string;



  boolean(
    value: boolean,
  ): string;



  nullValue(): string;



  currentTimestamp(): string;



  returning(
    columns: string[],
  ): string;



  limit(
    value: number,
  ): string;

}