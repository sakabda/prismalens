import { buildExpression } from "./expression";

export function buildCountInclude(
  model: string,
  include?: Record<string, any>,
): string {
  if (!include?._count?.select) {
    return "";
  }

  const sql: string[] = [];

  for (const [relation, enabled] of Object.entries(include._count.select)) {
    let isEnabled = false;

    if (
      enabled &&
      typeof enabled === "object" &&
      "type" in enabled
    ) {
      const value = buildExpression(enabled as any);
      isEnabled = value === "TRUE";
    } else {
      isEnabled = Boolean(enabled);
    }

    if (!isEnabled) {
      continue;
    }

    sql.push(
      `(SELECT COUNT(*) FROM ${relation} WHERE ${relation}.${model}Id = ${model}.id) AS ${relation}_count`
    );
  }

  return sql.length ? `, ${sql.join(", ")}` : "";
}