export function formatSQL(sql: string): string {
  return sql
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

export function prettySQL(sql: string): string {
  return sql
    .replace(/\bSELECT\b/g, "\nSELECT")
    .replace(/\bFROM\b/g, "\nFROM")
    .replace(/\bWHERE\b/g, "\nWHERE")
    .replace(/\bGROUP BY\b/g, "\nGROUP BY")
    .replace(/\bORDER BY\b/g, "\nORDER BY")
    .replace(/\bLIMIT\b/g, "\nLIMIT")
    .replace(/\bOFFSET\b/g, "\nOFFSET")
    .trim();
}