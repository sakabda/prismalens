import type { Token, TokenType } from "./types";

const KEYWORDS = new Set([
 "true",
  "false",
  "null",
  "new",
]);

function isLetter(ch: string) {
  return /[A-Za-z_$]/.test(ch);
}

function isDigit(ch: string) {
  return /[0-9]/.test(ch);
}

function isIdentifier(ch: string) {
  return /[A-Za-z0-9_$]/.test(ch);
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];

  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    switch (ch) {
      case ".":
        tokens.push({ type: "dot", value: "." });
        i++;
        continue;

      case ":":
        tokens.push({ type: "colon", value: ":" });
        i++;
        continue;

      case ",":
        tokens.push({ type: "comma", value: "," });
        i++;
        continue;

      case "(":
        tokens.push({
          type: "paren_open",
          value: "(",
        });
        i++;
        continue;

      case ")":
        tokens.push({
          type: "paren_close",
          value: ")",
        });
        i++;
        continue;

      case "{":
        tokens.push({
          type: "brace_open",
          value: "{",
        });
        i++;
        continue;

      case "}":
        tokens.push({
          type: "brace_close",
          value: "}",
        });
        i++;
        continue;

      case "[":
        tokens.push({
          type: "bracket_open",
          value: "[",
        });
        i++;
        continue;

      case "]":
        tokens.push({
          type: "bracket_close",
          value: "]",
        });
        i++;
        continue;
    }

    // String
    if (
      ch === '"' ||
      ch === "'" ||
      ch === "`"
    ) {
      const quote = ch;

      i++;

      let value = "";

      while (
        i < input.length &&
        input[i] !== quote
      ) {
        if (
          input[i] === "\\" &&
          i + 1 < input.length
        ) {
          value += input[i + 1];
          i += 2;
          continue;
        }

        value += input[i];
        i++;
      }

      i++;

      tokens.push({
        type: "string",
        value,
      });

      continue;
    }

    // Number
    if (isDigit(ch)) {
      let value = "";

      while (
        i < input.length &&
        /[0-9.]/.test(input[i])
      ) {
        value += input[i];
        i++;
      }

      tokens.push({
        type: "number",
        value,
      });

      continue;
    }

    // Identifier / keyword
    if (isLetter(ch)) {
      let value = "";

      while (
        i < input.length &&
        isIdentifier(input[i])
      ) {
        value += input[i];
        i++;
      }

      if (KEYWORDS.has(value)) {
        let type: TokenType = "keyword";

        // if (value === "true" || value === "false")
        //   type = "boolean";

        // if (value === "null")
        //   type = "null";
        switch (value) {
          case "true":
          case "false":
            type = "boolean";
            break;

          case "null":
            type = "null";
            break;

          case "new":
            type = "keyword_new";
            break;
        }

        tokens.push({
          type,
          value,
        });
      } else {
        tokens.push({
          type: "identifier",
          value,
        });
      }

      continue;
    }

    throw new Error(
      `Unexpected character "${ch}" at ${i}`
    );
  }

  return tokens;
}