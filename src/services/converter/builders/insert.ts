import { quote } from "../utils/escape";

export function buildInsert(
  table: string,
  data: Record<string, any>,
): string {

  const columns = Object.keys(data);

  const values = Object.values(data)
    .map(quote)
    .join(", ");

  return `
INSERT INTO ${table}
(${columns.join(", ")})
VALUES (${values});
`.trim();

}