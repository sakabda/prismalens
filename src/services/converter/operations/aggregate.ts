import { buildAggregate } from "../builders/aggregate";
import { buildWhere } from "../builders/where";

export function buildAggregateOperation(
  model: string,
  args: Record<string, any>,
) {
  return `
SELECT
${buildAggregate(args)}
FROM ${model}
${buildWhere(args.where)};
`.trim();
}