export function buildPrismaUpdate(
  table: string,
  data: Record<string, unknown>,
  where: Record<string, unknown>,
) {
  return `prisma.${table}.update({
  where: ${JSON.stringify(
    where,
    null,
    2,
  )},
  data: ${JSON.stringify(
    data,
    null,
    2,
  )}
})`;
}