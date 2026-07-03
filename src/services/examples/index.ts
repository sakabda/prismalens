import type { QueryExample } from "../../types/example";

import { basicExamples } from "./paired/basic";
import { crudExamples } from "./paired/crud";
import { filteringExamples } from "./paired/filtering";
import { relationExamples } from "./paired/relations";
import { sortingExamples } from "./paired/sorting";
import { paginationExamples } from "./paired/pagination";
import { aggregationExamples } from "./paired/aggregation";
import { advancedExamples } from "./paired/advanced";

export const queryExamples: QueryExample[] = [
  ...basicExamples,
  ...crudExamples,
  ...filteringExamples,
  ...relationExamples,
  ...sortingExamples,
  ...paginationExamples,
  ...aggregationExamples,
  ...advancedExamples,
];