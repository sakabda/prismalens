export function buildAggregate(
  aggregate?: Record<string, any>,
): string {
  if (!aggregate) {
    return "";
  }

  const sql: string[] = [];

  for (const [key, value] of Object.entries(aggregate)) {
    if (
      !value ||
      typeof value !== "object"
    ) {
      continue;
    }

    for (const field of Object.keys(value)) {
      switch (key) {
        case "_count":
          sql.push(`COUNT(${field}) AS count_${field}`);
          break;

        case "_sum":
          sql.push(`SUM(${field}) AS sum_${field}`);
          break;

        case "_avg":
          sql.push(`AVG(${field}) AS avg_${field}`);
          break;

        case "_min":
          sql.push(`MIN(${field}) AS min_${field}`);
          break;

        case "_max":
          sql.push(`MAX(${field}) AS max_${field}`);
          break;
      }
    }
  }

  return sql.join(", ");
}