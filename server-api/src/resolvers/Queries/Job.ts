import { extendType } from "nexus";

export const job = extendType({
  type: 'Query',
  definition(t) {
    t.crud.jobs({ filtering: true, ordering: true, pagination: true})
    t.crud.job()
  }
})