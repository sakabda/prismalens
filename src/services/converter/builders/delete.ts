import { buildWhere } from "./where";

export function buildDelete(
  table: string,
  where?: Record<string, any>,
): string {

  const sql = [
    `DELETE FROM ${table}`,
    buildWhere(where),
  ];

  return sql
    .filter(Boolean)
    .join("\n");

}