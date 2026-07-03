import type {
  PrismaQueryAST,
  PrismaOperation,
  Token,
} from "./types";

export class ASTBuilder {
  private index = 0;

  private readonly tokens: Token[];

constructor(tokens: Token[]) {
  this.tokens = tokens;
}

  build(): PrismaQueryAST | null {
    if (this.tokens.length < 5) return null;

    this.expect("identifier", "prisma");
    this.expect("dot");

    const model = this.expect("identifier").value;

    this.expect("dot");

    const operation =
      this.expect("identifier").value as PrismaOperation;

    this.expect("paren_open");

    const args =
      this.peek()?.type === "paren_close"
        ? {}
        : this.parseObject();

    this.expect("paren_close");

    return {
      model,
      operation,
      args,
    };
  }

  private parseObject(): Record<string, any> {
    const obj: Record<string, any> = {};

    this.expect("brace_open");

    while (
      this.peek() &&
      this.peek()!.type !== "brace_close"
    ) {
      const key =
        this.expect("identifier").value;

      this.expect("colon");

      obj[key] = this.parseValue();

      if (this.peek()?.type === "comma") {
        this.next();
      }
    }

    this.expect("brace_close");

    return obj;
  }

  private parseArray(): any[] {
    const arr: any[] = [];

    this.expect("bracket_open");

    while (
      this.peek() &&
      this.peek()!.type !== "bracket_close"
    ) {
      arr.push(this.parseValue());

      if (this.peek()?.type === "comma") {
        this.next();
      }
    }

    this.expect("bracket_close");

    return arr;
  }

  private parseValue(): any {
    const token = this.peek();

    if (!token) return null;

    switch (token.type) {
      case "string":
        this.next();
        return token.value;

      case "number":
        this.next();
        return Number(token.value);

      case "boolean":
        this.next();
        return token.value === "true";

      case "null":
        this.next();
        return null;

      case "brace_open":
        return this.parseObject();

      case "bracket_open":
        return this.parseArray();

      case "identifier":
        this.next();
        return token.value;

      default:
        this.next();
        return token.value;
    }
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private next() {
    this.index++;
  }

  private expect(
    type: Token["type"],
    value?: string,
  ): Token {
    const token = this.peek();

    if (!token) {
      throw new Error(
        `Unexpected end of input. Expected ${type}`,
      );
    }

    if (token.type !== type) {
      throw new Error(
        `Expected ${type} but found ${token.type}`,
      );
    }

    if (value && token.value !== value) {
      throw new Error(
        `Expected "${value}" but found "${token.value}"`,
      );
    }

    this.next();

    return token;
  }
}