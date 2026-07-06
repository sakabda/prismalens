import { quote } from "../utils/escape";
import { buildExpression } from "./expression";

export function buildInsert(
  table: string,
  data: Record<string, any>,
): string {
  const columns = Object.keys(data);

  const values = Object.values(data)
    .map((value) => {
      if (
        value &&
        typeof value === "object" &&
        "type" in value
      ) {
        return buildExpression(value);
      }

      return quote(value);
    })
    .join(", ");

  return `
INSERT INTO ${table}
(${columns.join(", ")})
VALUES (${values});
`.trim();
}