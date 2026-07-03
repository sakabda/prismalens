export function extractTableName(
  sql: string,
): string {
  const match =
    sql.match(
      /\bFROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/i,
    );

  return match?.[1] ?? "model";
}

export function extractColumns(
  sql: string,
): string[] {
  const match =
    sql.match(
      /SELECT\s+(.*?)\s+FROM/i,
    );

  if (!match) return ["*"];

  return match[1]
    .split(",")
    .map((c) => c.trim());
}

export function extractLimit(
  sql: string,
): number | undefined {
  const match =
    sql.match(/LIMIT\s+(\d+)/i);

  return match ?
      Number(match[1])
    : undefined;
}

export function extractOffset(
  sql: string,
): number | undefined {
  const match =
    sql.match(/OFFSET\s+(\d+)/i);

  return match ?
      Number(match[1])
    : undefined;
}