import { buildWhere } from "../builders/where";
import { buildOrderBy } from "../builders/orderBy";
import { buildPagination } from "../builders/pagination";
import { buildSelect } from "../builders/select";

export function buildFindMany(
  model: string,
  args: Record<string, any>,
) {
  const select = buildSelect(args.select);

  let sql =
    `SELECT ${select} FROM ${model}`;

  sql += buildWhere(args.where);
  sql += buildOrderBy(args.orderBy);
  sql += buildPagination(args);

  return sql + ";";
}