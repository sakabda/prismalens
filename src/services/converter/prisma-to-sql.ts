import { Converter } from "./converter";
import { tokenize } from "./tokenizer";

const converter = new Converter();

export function prismaToSql(query: string): string {
  if (!query?.trim()) {
    return "-- Empty Prisma query";
  }

  try {
    const tokens = tokenize(query);
    return converter.prismaToSQL(tokens);
  } catch (error: any) {
    return `-- Invalid Prisma query\n-- ${error.message}`;
  }
}