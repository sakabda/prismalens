import { buildAggregate } from "../builders/aggregate";
import { buildWhere } from "../builders/where";

export function buildGroupBy(
  model: string,
  args: Record<string, any>,
) {
  const fields =
    (args.by ?? []).join(", ");

  return `
SELECT
${fields},
${buildAggregate(args)}
FROM ${model}
${buildWhere(args.where)}
GROUP BY ${fields};
`.trim();
}