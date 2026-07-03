export function buildPrismaGroupBy(
  table: string,
  by: string[],
) {
  return `prisma.${table}.groupBy({
  by: ${JSON.stringify(by)}
})`;
}