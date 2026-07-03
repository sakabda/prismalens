export function buildPrismaCreate(
  table: string,
  data: Record<string, unknown>,
) {
  return `prisma.${table}.create({
  data: ${JSON.stringify(
    data,
    null,
    2,
  )}
})`;
}