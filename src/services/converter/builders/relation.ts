export function buildRelationSelect(
  relation: string,
  fields: string[],
): string {

  if (!fields.length)
    return `${relation}.*`;

  return fields
    .map((field) => `${relation}.${field}`)
    .join(", ");

}