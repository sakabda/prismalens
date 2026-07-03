export function buildSelect(
  select?: Record<string, any>,
): string {
  if (!select || Object.keys(select).length === 0) {
    return "*";
  }

  const columns: string[] = [];

  for (const key of Object.keys(select)) {
    const value = select[key];

    // Normal field
    if (value === true) {
      columns.push(key);
      continue;
    }

    // Ignore false values
    if (value === false) {
      continue;
    }

    // Nested select
    if (
      typeof value === "object" &&
      value !== null &&
      value.select
    ) {
      columns.push(`${key}.*`);
      continue;
    }

    // _count
    if (
      key === "_count" &&
      typeof value === "object"
    ) {
      columns.push("COUNT(*) AS count");
      continue;
    }

    // Aggregate support
    if (
      key === "_sum" &&
      typeof value === "object"
    ) {
      Object.keys(value).forEach((field) => {
        if (value[field]) {
          columns.push(
            `SUM(${field}) AS sum_${field}`,
          );
        }
      });

      continue;
    }

    if (
      key === "_avg" &&
      typeof value === "object"
    ) {
      Object.keys(value).forEach((field) => {
        if (value[field]) {
          columns.push(
            `AVG(${field}) AS avg_${field}`,
          );
        }
      });

      continue;
    }

    if (
      key === "_min" &&
      typeof value === "object"
    ) {
      Object.keys(value).forEach((field) => {
        if (value[field]) {
          columns.push(
            `MIN(${field}) AS min_${field}`,
          );
        }
      });

      continue;
    }

    if (
      key === "_max" &&
      typeof value === "object"
    ) {
      Object.keys(value).forEach((field) => {
        if (value[field]) {
          columns.push(
            `MAX(${field}) AS max_${field}`,
          );
        }
      });

      continue;
    }
  }

  return columns.length
    ? columns.join(", ")
    : "*";
}