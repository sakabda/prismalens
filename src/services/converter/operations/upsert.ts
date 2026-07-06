import { buildInsert } from "../builders/insert";
import { buildUpdateSet } from "../builders/update";

export function buildUpsert(
  model: string,
  args: Record<string, any>,
) {
  const insertSql = buildInsert(model, args.create);
  const updateClause = buildUpdateSet(args.update);

  return `
-- UPSERT

${insertSql}

ON CONFLICT
DO UPDATE
SET ${updateClause};
`.trim();
}