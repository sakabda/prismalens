export type DiagnosticSeverity =
  | "error"
  | "warning"
  | "info";

export interface Diagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  path?: string;
}

export function createError(
  code: string,
  message: string,
  path?: string,
): Diagnostic {
  return {
    code,
    severity: "error",
    message,
    path,
  };
}

export function createWarning(
  code: string,
  message: string,
  path?: string,
): Diagnostic {
  return {
    code,
    severity: "warning",
    message,
    path,
  };
}