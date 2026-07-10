import { Converter } from "./converter";
import { tokenize } from "./tokenizer";

import {
  PlanningContext,
} from "./planner/context";

import {
  createPlannerHandlers,
} from "./planner/factory";

import {
  MetadataLoader,
} from "./metadata/metadata-loader";



export function prismaToSql(
  query: string,
  schema: string,
): string {


  if (!query?.trim()) {

    return "-- Empty Prisma query";

  }


  if (!schema?.trim()) {

    return "-- Prisma schema is required";

  }



  try {


    const models =
      new MetadataLoader()
        .load(schema);



    const context =
      new PlanningContext(
        models,
      );



    const converter =
      new Converter(
        createPlannerHandlers(),
        context,
      );



    const tokens =
      tokenize(query);



    return converter.prismaToSQL(
      tokens,
    );


  } catch(error: unknown) {


    const message =
      error instanceof Error
        ? error.message
        : String(error);



    return (
      `-- Invalid Prisma query\n` +
      `-- ${message}`
    );

  }

}