export type PrismaScalarType =
  | "String"
  | "Int"
  | "BigInt"
  | "Float"
  | "Decimal"
  | "Boolean"
  | "DateTime"
  | "Json"
  | "Bytes"
  | "Unsupported";

export interface SchemaField {
  name: string;

  type: string;

  isScalar: boolean;

  isList: boolean;

  isOptional: boolean;

  isId: boolean;

  isUnique: boolean;

  isRelation: boolean;

  defaultValue?: string;

  relation?: SchemaRelation;
}

export interface SchemaRelation {
  name?: string;

  model: string;

  field: string;

  references: string[];

  fields: string[];

  onDelete?: string;

  onUpdate?: string;
}

export interface SchemaIndex {
  name?: string;

  fields: string[];

  unique: boolean;
}

export interface SchemaModel {
  name: string;

  fields: SchemaField[];

  indexes: SchemaIndex[];

  primaryKey?: string[];
}

export interface SchemaEnum {
  name: string;

  values: string[];
}

export interface SchemaRegistry {
  models: Record<string, SchemaModel>;

  enums: Record<string, SchemaEnum>;
}