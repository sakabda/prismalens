export function buildPrismaDelete(
  table: string,
  where: Record<string, unknown>,
) {
  return `prisma.${table}.delete({
  where: ${JSON.stringify(
    where,
    null,
    2,
  )}
})`;
}