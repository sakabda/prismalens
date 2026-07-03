function quote(value: unknown): string {
  if (value === null) return "NULL";

  if (typeof value === "number")
    return value.toString();

  if (typeof value === "boolean")
    return value ? "TRUE" : "FALSE";

  return `'${String(value).replace(/'/g, "''")}'`;
}

export function buildValues(
  data: Record<string, any>,
): string {

  return Object.values(data)
    .map(quote)
    .join(", ");

}

export function buildColumns(
  data: Record<string, any>,
): string {

  return Object.keys(data)
    .join(", ");

}