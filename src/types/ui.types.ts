/** Button size variants */
export type ButtonSize = "sm" | "md" | "lg";

/** Button visual variants */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline";

/** Badge color variants */
export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";

/** Navigation item */
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  shortcut?: string;
}

/** Theme values */
export type ThemeValue = "light" | "dark" | "system";

/** Converter mode */
export type ConverterMode = "prisma-to-sql" | "sql-to-prisma";
