import type {
  SchemaRegistry,
  SchemaModel,
  SchemaField,
  SchemaRelation,
} from "./types";

const SCALAR_TYPES = new Set([
  "String",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "Boolean",
  "DateTime",
  "Json",
  "Bytes",
]);

function parseRelation(
  attributeText: string,
  relatedModel: string,
): SchemaRelation | undefined {
  if (!attributeText.includes("@relation")) {
    return undefined;
  }

  const fieldsMatch = attributeText.match(
    /fields:\s*\[([^\]]*)\]/,
  );

  const referencesMatch = attributeText.match(
    /references:\s*\[([^\]]*)\]/,
  );

  const relationNameMatch = attributeText.match(
    /@relation\s*\(\s*"([^"]+)"/,
  );

  const fields = fieldsMatch
    ? fieldsMatch[1]
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  const references = referencesMatch
    ? referencesMatch[1]
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
    : [];

  return {
    name: relationNameMatch?.[1],
    model: relatedModel,
    field: "",
    fields,
    references,
  };
}

function parseFields(
  modelBody: string,
): SchemaField[] {
  const fields: SchemaField[] = [];

  const lines = modelBody
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    // Ignore comments
    if (line.startsWith("//")) continue;

    // Ignore model-level attributes
    if (line.startsWith("@@")) continue;

    const parts = line.split(/\s+/);

    if (parts.length < 2) continue;

    const fieldName = parts[0];
    const rawType = parts[1];
    const attributes = parts.slice(2);

    const attributeText = attributes.join(" ");

    const isOptional = rawType.endsWith("?");

    const isList = rawType.endsWith("[]");

    const normalizedType = rawType
      .replace(/\?/g, "")
      .replace(/\[\]/g, "");

    const isScalar =
      SCALAR_TYPES.has(normalizedType);

    const relation = parseRelation(
      attributeText,
      normalizedType,
    );

    fields.push({
      name: fieldName,
      type: normalizedType,

      isScalar,

      isRelation: !isScalar,

      isList,

      isOptional,

      isId: attributes.includes("@id"),

      isUnique: attributes.includes("@unique"),

      relation,
    });
  }

  return fields;
}

export function parseSchema(
  schema: string,
): SchemaRegistry {
  const registry: SchemaRegistry = {
    models: {},
    enums: {},
  };

  const modelRegex =
    /model\s+(\w+)\s*\{([\s\S]*?)\}/g;

  let match: RegExpExecArray | null;

  while ((match = modelRegex.exec(schema))) {
    const modelName = match[1];

    const modelBody = match[2];

    const model: SchemaModel = {
      name: modelName,

      fields: parseFields(modelBody),

      indexes: [],
    };

    registry.models[modelName] = model;
  }

  return registry;
}