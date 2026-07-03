function quote(value: unknown): string {
  if (value === null) return "NULL";

  if (typeof value === "number")
    return value.toString();

  if (typeof value === "boolean")
    return value ? "TRUE" : "FALSE";

  return `'${String(value).replace(/'/g, "''")}'`;
}

export function buildInsert(
  table: string,
  data: Record<string, any>,
): string {

  const columns = Object.keys(data);

  const values = Object.values(data)
    .map(quote)
    .join(", ");

  return `
INSERT INTO ${table}
(${columns.join(", ")})
VALUES (${values});
`.trim();

}