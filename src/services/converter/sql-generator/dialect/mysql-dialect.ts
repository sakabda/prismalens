import type { SqlDialect } from "../types";


export class MysqlDialect implements SqlDialect {


  quoteIdentifier(
    identifier: string
  ): string {

    return `\`${identifier}\``;
  }



  parameter(
    index: number
  ): string {

    return "?";
  }



  escapeString(
    value: string
  ): string {

    return value
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'");
  }



  boolean(
    value: boolean
  ): string {

    return value ? "TRUE" : "FALSE";
  }



  nullValue(): string {

    return "NULL";
  }



  currentTimestamp(): string {

    return "CURRENT_TIMESTAMP";
  }



  returning(
    columns: string[]
  ): string {

    // MySQL does not support PostgreSQL style RETURNING

    return "";
  }



  limit(
    value: number
  ): string {

    return `LIMIT ${value}`;
  }



}