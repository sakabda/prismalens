import type { PrismaQueryAST } from "./types";
import { tokenize } from "./tokenizer";
import { ASTBuilder } from "./ast-builder";

export function parsePrismaQuery(input: string): PrismaQueryAST | null {
  try {
    const tokens = tokenize(input);
    const builder = new ASTBuilder(tokens);
    return builder.build();
  } catch (e) {
    return null;
  }
}
