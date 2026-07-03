// ============================================
// SQL Value Escaping — Single Source of Truth
// ============================================

/**
 * Escape and quote a value for safe SQL embedding.
 *
 * This is the ONLY quote/escape function in the
 * codebase. All builders must import from here.
 */
export function escapeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }

  if (Array.isArray(value)) {
    return (
      "(" +
      value.map(escapeValue).join(", ") +
      ")"
    );
  }

  return `'${String(value)
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")}'`;
}

/**
 * Alias for `escapeValue`.
 * Use whichever name reads better at the call site.
 */
export const quote = escapeValue;