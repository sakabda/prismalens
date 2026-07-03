type Pagination = {
  take?: number;
  skip?: number;
  distinct?: string | string[];
};

export function buildPagination(
  options?: Pagination,
): string {
  if (!options) return "";

  const parts: string[] = [];

  if (options.distinct) {
    const fields = Array.isArray(options.distinct)
      ? options.distinct.join(", ")
      : options.distinct;

    parts.push(`DISTINCT ${fields}`);
  }

  if (typeof options.take === "number") {
    parts.push(`LIMIT ${options.take}`);
  }

  if (typeof options.skip === "number") {
    parts.push(`OFFSET ${options.skip}`);
  }

  // return parts.join(" ");
  return parts.length
  ? ` ${parts.join(" ")}`
  : "";
}