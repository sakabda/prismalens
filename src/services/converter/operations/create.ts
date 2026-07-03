import { buildInsert } from "../builders/insert";

export function buildCreate(
  model: string,
  args: Record<string, any>,
) {
  return buildInsert(model, args.data);
}