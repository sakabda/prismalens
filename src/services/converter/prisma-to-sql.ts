import { parsePrismaQuery } from "./parser";

import { buildFindMany } from "./operations/findMany";
import { buildFindFirst } from "./operations/findFirst";
import { buildFindUnique } from "./operations/findUnique";
import { buildCreate } from "./operations/create";
import { buildCreateMany } from "./operations/createMany";
import { buildUpdate } from "./operations/update";
import { buildUpdateMany } from "./operations/updateMany";
import { buildDeleteOperation } from "./operations/delete";
import { buildDeleteMany } from "./operations/deleteMany";
import { buildUpsert } from "./operations/upsert";
import { buildAggregateOperation } from "./operations/aggregate";
import { buildCount } from "./operations/count";
import { buildGroupBy } from "./operations/groupBy";

export function prismaToSql(query: string): string {
  if (!query?.trim()) {
    return "-- Empty Prisma query";
  }

  const ast = parsePrismaQuery(query);

  if (!ast) {
    return "-- Invalid Prisma query";
  }

  const { model, operation, args } = ast;

  const handlers: Record<string, Function> = {
    findMany: buildFindMany,
    findFirst: buildFindFirst,
    findUnique: buildFindUnique,
    create: buildCreate,
    createMany: buildCreateMany,
    update: buildUpdate,
    updateMany: buildUpdateMany,
    delete: buildDeleteOperation,
    deleteMany: buildDeleteMany,
    upsert: buildUpsert,
    aggregate: buildAggregateOperation,
    count: buildCount,
    groupBy: buildGroupBy,
  };

  const handler = handlers[operation];

  if (!handler) {
    return `-- ${operation} is not supported`;
  }

  return handler(model, args);
}