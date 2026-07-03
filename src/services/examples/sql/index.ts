import { queryExamples } from "../index";

export const sqlExamples =
  queryExamples.map((example) => ({
    ...example,
    query: example.sql,
    language: "sql",
  }));