import { buildUpdateSet } from "../builders/update";
import { buildWhere } from "../builders/where";

export function buildUpdateMany(
  model: string,
  args: Record<string, any>,
) {
  const setClause = buildUpdateSet(args.data);
  const whereClause = buildWhere(args.where);

  return `UPDATE ${model} SET ${setClause}${whereClause};`;
}