import { buildWhere } from "../builders/where";
import { buildOrderBy } from "../builders/orderBy";
import { buildPagination } from "../builders/pagination";
import { buildSelect } from "../builders/select";
import { buildInclude } from "../builders/include";
import { buildJoins } from "../builders/joins";

export function buildFindMany(
  model: string,
  args: Record<string, any>,
) {
  const select = buildSelect(args.select);

  const joins = buildInclude(
    model,
    args.include,
  );

  let sql = `SELECT ${select} FROM ${model}`;

  sql += buildJoins(model, joins);

  sql += buildWhere(args.where);

  sql += buildOrderBy(args.orderBy);

  sql += buildPagination(args);

  return sql + ";";
}