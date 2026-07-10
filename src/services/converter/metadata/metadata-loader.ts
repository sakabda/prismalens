import type {
  ModelMetadata,
  FieldMetadata,
} from "../planner/context";


export class MetadataLoader {


  load(
    schema: string,
  ): ReadonlyMap<string, ModelMetadata> {


    const models =
      new Map<string, ModelMetadata>();


    const modelRegex =
      /model\s+(\w+)\s+\{([\s\S]*?)\}/g;


    let modelMatch;


    while (
      (modelMatch = modelRegex.exec(schema))
    ) {

      const modelName =
        modelMatch[1];


      const body =
        modelMatch[2];


      const fields: FieldMetadata[] = [];


      for (
        const line of body.split("\n")
      ) {

        const parts =
          line.trim().split(/\s+/);


        if(parts.length < 2) {
          continue;
        }


        const name =
          parts[0];


        const type =
          parts[1]
            .replace("?", "")
            .replace("[]", "");


        fields.push({

          name,

          columnName:name,

          type,

          isId:
            line.includes("@id"),

          isList:
            line.includes("[]"),

          isRequired:
            !line.includes("?"),

          isRelation:
            false,

        });

      }



      models.set(
        modelName.charAt(0).toLowerCase()
          + modelName.slice(1),

        {
          name:modelName,

          tableName:modelName,

          fields,

        },
      );

    }


    return models;

  }

}