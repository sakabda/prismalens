import { buildInsert } from "../builders/insert";
import { buildUpdateSet } from "../builders/update";

export function buildUpsert(
  model: string,
  args: Record<string, any>,
) {
  const updateClause = buildUpdateSet(args.update);

  return `
-- UPSERT

${buildInsert(model, args.create)}

ON CONFLICT
DO UPDATE
SET ${updateClause};
`;
}