import type {
  SqlDialect,
} from "../types";


export class PostgresDialect
  implements SqlDialect
{

  quoteIdentifier(
    identifier: string,
  ): string {

    const escaped =
      identifier.replace(
        /"/g,
        "\"\"",
      );

    return `"${escaped}"`;
  }



  parameter(
    index: number,
  ): string {

    return `$${index}`;

  }



  escapeString(
    value: string,
  ): string {

    return value.replace(
      /'/g,
      "''",
    );

  }



  boolean(
    value: boolean,
  ): string {

    return value
      ? "TRUE"
      : "FALSE";

  }



  nullValue(): string {

    return "NULL";

  }



  currentTimestamp(): string {

    return "CURRENT_TIMESTAMP";

  }



  returning(
    columns: string[],
  ): string {

    return (
      " RETURNING " +
      columns
        .map(column =>
          this.quoteIdentifier(column),
        )
        .join(", ")
    );

  }



  limit(
    value: number,
  ): string {

    return `LIMIT ${value}`;

  }

}