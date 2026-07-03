import type { Token } from "./types";

export function isWhitespace(char: string): boolean {
  return /\s/.test(char);
}

export function isLetter(char: string): boolean {
  return /[a-zA-Z_$]/.test(char);
}

export function isDigit(char: string): boolean {
  return /[0-9]/.test(char);
}

export function isIdentifierChar(char: string): boolean {
  return /[a-zA-Z0-9_$]/.test(char);
}

export function peek(tokens: Token[], index: number): Token | null {
  return tokens[index] ?? null;
}

export function expect(
  tokens: Token[],
  index: number,
  value: string,
): boolean {
  return tokens[index]?.value === value;
}

export function consume(
  tokens: Token[],
  index: number,
): [Token | null, number] {
  return [tokens[index] ?? null, index + 1];
}

export function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export function isNumeric(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value);
}

export function isBoolean(value: string): boolean {
  return value === "true" || value === "false";
}

export function isNull(value: string): boolean {
  return value === "null";
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}