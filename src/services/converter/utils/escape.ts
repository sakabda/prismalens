export function escapeValue(value: unknown): string {
  if (value === null) return "NULL";

  if (value === undefined) return "NULL";

  if (typeof value === "number")
    return value.toString();

  if (typeof value === "boolean")
    return value ? "TRUE" : "FALSE";

  if (value instanceof Date)
    return `'${value.toISOString()}'`;

  if (Array.isArray(value)) {
    return (
      "(" +
      value.map(escapeValue).join(", ") +
      ")"
    );
  }

  return `'${String(value)
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")}'`;
}