import type {
  SchemaRegistry,
  SchemaModel,
  SchemaField,
  SchemaRelation,
} from "./types";

export class Registry {
  constructor(
    private readonly registry: SchemaRegistry,
  ) {}

  getModel(
    modelName: string,
  ): SchemaModel | undefined {
    return this.registry.models[modelName];
  }

  hasModel(
    modelName: string,
  ): boolean {
    return modelName in this.registry.models;
  }

  getModels(): SchemaModel[] {
    return Object.values(this.registry.models);
  }

  getField(
    modelName: string,
    fieldName: string,
  ): SchemaField | undefined {
    const model = this.getModel(modelName);

    if (!model) return undefined;

    return model.fields.find(
      (field) => field.name === fieldName,
    );
  }

  hasField(
    modelName: string,
    fieldName: string,
  ): boolean {
    return !!this.getField(
      modelName,
      fieldName,
    );
  }

  getRelation(
    modelName: string,
    relationName: string,
  ): SchemaRelation | undefined {
    return this.getField(
      modelName,
      relationName,
    )?.relation;
  }

  getRelations(
    modelName: string,
  ): SchemaRelation[] {
    const model = this.getModel(modelName);

    if (!model) return [];

    return model.fields
      .filter((field) => field.relation)
      .map((field) => field.relation!);
  }
}