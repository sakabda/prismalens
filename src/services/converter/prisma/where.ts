export function sqlWhereToPrisma(
  whereClause: string,
): Record<string, unknown> {
  const result: Record<
    string,
    unknown
  > = {};

  const conditions =
    whereClause.split(/\s+AND\s+/i);

  conditions.forEach((condition) => {
    const match =
      condition.match(
        /(\w+)\s*=\s*['"]?(.+?)['"]?$/,
      );

    if (match) {
      result[match[1]] = match[2];
    }
  });

  return result;
}