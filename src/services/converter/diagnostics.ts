// ============================================
// Structured Diagnostics
// ============================================

/**
 * Every diagnostic must use one of these codes.
 * Never return a raw string error.
 */
export enum DiagnosticCode {
  // Syntax / Parse errors
  InvalidSyntax = "InvalidSyntax",
  UnexpectedToken = "UnexpectedToken",
  UnexpectedEndOfInput = "UnexpectedEndOfInput",

  // Semantic errors
  UnsupportedFeature = "UnsupportedFeature",
  UnsupportedOperation = "UnsupportedOperation",
  UnknownOperator = "UnknownOperator",
  UnknownDialect = "UnknownDialect",

  // Schema errors
  MissingSchema = "MissingSchema",
  UnknownRelation = "UnknownRelation",
  UnknownModel = "UnknownModel",
  UnknownField = "UnknownField",

  // Conversion warnings
  AmbiguousConversion = "AmbiguousConversion",
  LossyConversion = "LossyConversion",
  DeprecatedSyntax = "DeprecatedSyntax",

  // Validation
  InvalidValue = "InvalidValue",
  MissingRequiredField = "MissingRequiredField",
}

export type DiagnosticSeverity = "error" | "warning" | "info";

export interface DiagnosticLocation {
  /** 0-based line number */
  line?: number;
  /** 0-based column number */
  column?: number;
  /** AST node path, e.g. "where.email.contains" */
  path?: string;
}

export interface Diagnostic {
  code: DiagnosticCode;
  severity: DiagnosticSeverity;
  message: string;
  location?: DiagnosticLocation;
}

// ============================================
// Conversion Result
// ============================================

export type ConversionResult =
  | ConversionSuccess
  | ConversionFailure;

export interface ConversionSuccess {
  success: true;
  output: string;
  diagnostics: Diagnostic[];
}

export interface ConversionFailure {
  success: false;
  diagnostics: Diagnostic[];
}

// ============================================
// Diagnostic Builders
// ============================================

export function createDiagnostic(
  code: DiagnosticCode,
  message: string,
  severity: DiagnosticSeverity = "error",
  location?: DiagnosticLocation,
): Diagnostic {
  return { code, severity, message, location };
}

export function errorDiagnostic(
  code: DiagnosticCode,
  message: string,
  location?: DiagnosticLocation,
): Diagnostic {
  return createDiagnostic(code, message, "error", location);
}

export function warningDiagnostic(
  code: DiagnosticCode,
  message: string,
  location?: DiagnosticLocation,
): Diagnostic {
  return createDiagnostic(code, message, "warning", location);
}

export function infoDiagnostic(
  code: DiagnosticCode,
  message: string,
  location?: DiagnosticLocation,
): Diagnostic {
  return createDiagnostic(code, message, "info", location);
}

// ============================================
// Result Builders
// ============================================

export function successResult(
  output: string,
  diagnostics: Diagnostic[] = [],
): ConversionSuccess {
  return { success: true, output, diagnostics };
}

export function failureResult(
  diagnostics: Diagnostic[],
): ConversionFailure {
  return { success: false, diagnostics };
}

// ============================================
// Formatting helpers
// ============================================

/**
 * Format diagnostics as SQL comments for display
 * in the output editor.
 */
export function formatDiagnosticsAsSQL(
  diagnostics: Diagnostic[],
): string {
  if (diagnostics.length === 0) return "";

  return diagnostics
    .map((d) => {
      const prefix =
        d.severity === "error" ? "ERROR"
        : d.severity === "warning" ? "WARNING"
        : "INFO";

      const loc = d.location?.path
        ? ` [${d.location.path}]`
        : "";

      return `-- ${prefix}: ${d.message}${loc}`;
    })
    .join("\n");
}

/**
 * Check whether a result has any errors.
 */
export function hasErrors(
  diagnostics: Diagnostic[],
): boolean {
  return diagnostics.some(
    (d) => d.severity === "error",
  );
}
