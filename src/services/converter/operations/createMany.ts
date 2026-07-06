import { buildValue } from "../builders/value";

export function buildCreateMany(
  model: string,
  args: Record<string, any>,
) {
  const rows = args.data ?? [];

  if (!Array.isArray(rows) || rows.length === 0) {
    return "-- Invalid createMany";
  }

  const columns = Object.keys(rows[0]);

  const values = rows
    .map((row) =>
      `(${columns.map((c) => buildValue(row[c])).join(", ")})`
    )
    .join(",\n");

  return `
INSERT INTO ${model}
(${columns.join(", ")})
VALUES
${values};
`.trim();
}