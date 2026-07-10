import type {
  PlannerHandler,
} from "./types";


import {
  FindManyHandler,
} from "./handlers/find-many";

import {
  FindFirstHandler,
} from "./handlers/find-first";

import {
  FindUniqueHandler,
} from "./handlers/find-unique";

import {
  CountHandler,
} from "./handlers/count";

import {
  CreateHandler,
} from "./handlers/create";

import {
  UpdateHandler,
} from "./handlers/update";

import {
  DeleteHandler,
} from "./handlers/delete";

import {
  AggregateHandler,
} from "./handlers/aggregate";

import {
  GroupByHandler,
} from "./handlers/group-by";



export function createPlannerHandlers():
  PlannerHandler[] {

  return [

    new FindManyHandler(),

    new FindFirstHandler(),

    new FindUniqueHandler(),

    new CountHandler(),

    new CreateHandler(),

    new UpdateHandler(),

    new DeleteHandler(),

    new AggregateHandler(),

    new GroupByHandler(),

  ];

}