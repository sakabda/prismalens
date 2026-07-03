import { queryExamples } from "../index";

export const prismaExamples =
  queryExamples.map((example) => ({
    ...example,
    query: example.prisma,
    language: "prisma",
  }));