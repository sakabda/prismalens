type OrderBy =
  | Record<string, any>
  | Record<string, any>[];

function buildSingleOrder(order: Record<string, any>): string[] {
  const result: string[] = [];

  for (const key of Object.keys(order)) {
    const value = order[key];

    // orderBy: { name: "asc" }
    if (typeof value === "string") {
      result.push(`${key} ${value.toUpperCase()}`);
      continue;
    }

    // orderBy: { posts: { _count: "desc" } }
    if (
      typeof value === "object" &&
      value !== null
    ) {
      if ("_count" in value) {
        result.push(
          `COUNT(${key}.id) ${String(value._count).toUpperCase()}`
        );
        continue;
      }

      // Nested relation ordering
      for (const child of Object.keys(value)) {
        result.push(
          `${key}.${child} ${String(value[child]).toUpperCase()}`
        );
      }
    }
  }

  return result;
}

export function buildOrderBy(
  orderBy?: OrderBy,
): string {
  if (!orderBy) {
    return "";
  }

  let clauses: string[] = [];

  if (Array.isArray(orderBy)) {
    orderBy.forEach((order) => {
      clauses.push(...buildSingleOrder(order));
    });
  } else {
    clauses.push(...buildSingleOrder(orderBy));
  }

  if (clauses.length === 0) {
    return "";
  }

  return `ORDER BY ${clauses.join(", ")}`;
}