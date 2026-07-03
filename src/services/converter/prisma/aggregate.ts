export function buildPrismaAggregate(
  table: string,
  aggregate: Record<
    string,
    unknown
  >,
) {
  return `prisma.${table}.aggregate(${JSON.stringify(
    aggregate,
    null,
    2,
  )})`;
}